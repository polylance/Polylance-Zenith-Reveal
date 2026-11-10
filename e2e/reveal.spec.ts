import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ALL_VIEWPORTS = [
  { name: '320', width: 320, height: 680 },
  { name: '375', width: 375, height: 812 },
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1024', width: 1024, height: 768 },
  { name: '1280', width: 1280, height: 720 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1920', width: 1920, height: 1080 },
];

const THEMES: Array<'light' | 'storm'> = ['light', 'storm'];

test.describe('PolyLance Zenith Dual-Theme & Hero Scene Verification', () => {
  for (const theme of THEMES) {
    for (const vp of ALL_VIEWPORTS) {
      test(`[${theme}] layout, theme, markers & non-overlap at ${vp.width}x${vp.height}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });

        if (theme === 'storm') {
          await page.addInitScript(() => {
            window.localStorage.setItem('pl-theme', 'storm');
          });
        } else {
          await page.addInitScript(() => {
            window.localStorage.removeItem('pl-theme');
          });
        }

        await page.goto('/');
        await page.waitForTimeout(1600);

        // Verify expected first-paint theme attribute
        const activeTheme = await page.evaluate(() => document.documentElement.dataset.theme);
        expect(activeTheme).toBe(theme);

        // Zero horizontal overflow
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(hasOverflow).toBe(false);

        // No <canvas> in hero
        expect(await page.locator('#top canvas').count()).toBe(0);

        // High-contrast countdown digits inside solid #0047AB card
        const digits = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('#top [data-countdown-digit]')).map((el) => {
            const style = window.getComputedStyle(el);
            return {
              text: el.textContent?.trim(),
              opacity: parseFloat(style.opacity),
              color: style.color,
            };
          });
        });
        expect(digits.length).toBe(4);
        for (const d of digits) {
          expect(d.text).toBeTruthy();
          expect(d.opacity).toBe(1);
          expect(d.color).toBe('rgb(255, 255, 255)');
        }

        // H1 line count constraint
        const h1Lines = await page.locator('#hero-heading').evaluate((el) => {
          const style = window.getComputedStyle(el);
          const lh = parseFloat(style.lineHeight);
          return Math.round(el.getBoundingClientRect().height / lh);
        });
        if (vp.width >= 1024) {
          expect(h1Lines).toBeLessThanOrEqual(2);
        } else {
          expect(h1Lines).toBeLessThanOrEqual(4);
        }

        // Scene bounding boxes, elementFromPoint marker hit-test & zero label overlap
        const sceneAudit = await page.evaluate(() => {
          const panel = document.querySelector('[data-scene-panel="true"]') as HTMLElement;
          panel.scrollIntoView({ block: 'center', behavior: 'instant' });
          const pRect = panel.getBoundingClientRect();
          const panelWidth = pRect.width;

          const markers = Array.from(panel.querySelectorAll('[data-waypoint-marker]')) as HTMLElement[];
          const labelBtns = Array.from(panel.querySelectorAll('[data-waypoint-label]')) as HTMLElement[];
          const leaderLines = Array.from(panel.querySelectorAll('[data-leader-line]'));

          // Check elementFromPoint at exact center of every waypoint marker (must hit marker, never a label!)
          const markerHits = markers.map((m) => {
            const r = m.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const hit = document.elementFromPoint(cx, cy);
            const hitIsMarker =
              hit === m || m.contains(hit) || Boolean(hit?.closest('[data-waypoint-marker]'));
            return {
              id: m.getAttribute('data-waypoint-marker'),
              hitIsMarker,
              hitTag: hit?.tagName,
            };
          });

          // Control buttons (Play + optional Zap + Pause) inside bottom bar
          const controlBtns = Array.from(panel.querySelectorAll('button')).filter(
            (b) =>
              !b.hasAttribute('data-waypoint-marker') &&
              !b.hasAttribute('data-waypoint-label') &&
              b.getAttribute('tabindex') !== '-1'
          ) as HTMLElement[];

          const toBox = (el: HTMLElement, kind: string) => {
            const r = el.getBoundingClientRect();
            return {
              kind,
              name: el.getAttribute('aria-label') || el.textContent?.trim() || kind,
              left: r.left,
              right: r.right,
              top: r.top,
              bottom: r.bottom,
              insidePanel:
                r.left >= pRect.left + 8 &&
                r.right <= pRect.right - 8 &&
                r.top >= pRect.top + 8 &&
                r.bottom <= pRect.bottom - 8,
            };
          };

          const labelBoxes = labelBtns.map((b) => toBox(b, 'label'));
          const markerBoxes = markers.map((m) => toBox(m, 'marker'));
          const controlBoxes = controlBtns.map((c) => toBox(c, 'control'));

          const overlaps: string[] = [];
          // Label vs Label, Label vs Marker, Label vs Controls
          for (let i = 0; i < labelBoxes.length; i++) {
            const a = labelBoxes[i];
            for (let j = i + 1; j < labelBoxes.length; j++) {
              const b = labelBoxes[j];
              if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) {
                overlaps.push(`label:${a.name} <-> label:${b.name}`);
              }
            }
            for (const m of markerBoxes) {
              if (a.left < m.right && a.right > m.left && a.top < m.bottom && a.bottom > m.top) {
                overlaps.push(`label:${a.name} <-> marker:${m.name}`);
              }
            }
            for (const c of controlBoxes) {
              if (a.left < c.right && a.right > c.left && a.top < c.bottom && a.bottom > c.top) {
                overlaps.push(`label:${a.name} <-> control:${c.name}`);
              }
            }
          }

          return {
            panelWidth,
            markerCount: markers.length,
            labelCount: labelBtns.length,
            leaderLineCount: leaderLines.length,
            markerHits,
            labelBoxes,
            overlaps,
            hasMobileLegend: Boolean(document.querySelector('[data-mobile-waypoint-legend="true"]')),
          };
        });

        expect(sceneAudit.markerCount).toBe(5);
        for (const hit of sceneAudit.markerHits) {
          expect(hit.hitIsMarker, `Marker ${hit.id} occluded by ${hit.hitTag} at ${vp.width} (${theme})`).toBe(true);
        }

        if (sceneAudit.panelWidth < 480) {
          expect(sceneAudit.labelCount).toBe(0);
          expect(sceneAudit.hasMobileLegend).toBe(true);
        } else {
          expect(sceneAudit.labelCount).toBe(5);
          expect(sceneAudit.leaderLineCount).toBe(5);
          expect(sceneAudit.overlaps).toEqual([]);
          for (const b of sceneAudit.labelBoxes) {
            expect(b.insidePanel, `Label ${b.name} outside panel at ${vp.width} (${theme})`).toBe(true);
          }
        }

        // Capture dual-theme deliverable screenshots from top
        if (['375', '768', '1440', '1920'].includes(vp.name)) {
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(200);
          await page.screenshot({
            path: `screenshots/${theme}-${vp.name}.png`,
            fullPage: true,
          });
        }
      });
    }
  }

  test('Theme toggle persists across reload without flash & favicon/manifest serve HTTP 200', async ({ page, request }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(500);

    // Default theme on first load is Light
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('light');
    const toggleBtn = page.locator('[data-theme-toggle="true"]').first();
    await expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');

    // Toggle to Storm and reload
    await toggleBtn.click();
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('storm');
    await expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('storm');

    // Verify all favicon assets + manifest
    for (const url of [
      '/favicon.ico',
      '/favicon-16.png',
      '/favicon-32.png',
      '/apple-touch-icon.png',
      '/android-chrome-192x192.png',
      '/android-chrome-512x512.png',
      '/android-chrome-maskable-512x512.png',
      '/manifest.webmanifest',
      '/og-image.png',
    ]) {
      const resp = await request.get(url);
      expect(resp.status(), `Expected 200 for ${url}`).toBe(200);
    }

    const manifestResp = await request.get('/manifest.webmanifest');
    const manifestJson = await manifestResp.json();
    expect(manifestJson.name).toBe('PolyLance Zenith');
    expect(manifestJson.theme_color).toBe('#FFFFFF');

    // Zero forbidden IP words in rendered HTML
    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(/\b(avengers|doomsday|doom|marvel)\b/i.test(bodyText)).toBe(false);
  });

  test('Ambient motion caps, Pause/Offscreen pause, Reduced-Motion, and Lightning cooldown/flash safety', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(1200);

    // Default Light theme: running ambient <= 8
    const lightCount = await page.evaluate(() => {
      return document.getAnimations().filter((a) => {
        const target = (a.effect as KeyframeEffect)?.target as Element | null;
        return a.playState === 'running' && target?.closest('[data-ambient]');
      }).length;
    });
    expect(lightCount).toBeGreaterThan(0);
    expect(lightCount).toBeLessThanOrEqual(8);

    // Switch to Storm theme: running ambient <= 12
    await page.locator('[data-theme-toggle="true"]').first().click();
    await page.waitForTimeout(200);
    const stormCount = await page.evaluate(() => {
      return document.getAnimations().filter((a) => {
        const target = (a.effect as KeyframeEffect)?.target as Element | null;
        return a.playState === 'running' && target?.closest('[data-ambient]');
      }).length;
    });
    expect(stormCount).toBeGreaterThan(0);
    expect(stormCount).toBeLessThanOrEqual(12);

    // Trigger manual summit lightning strike & verify flash envelope safety (max opacity <= 0.12)
    const zapBtn = page.getByRole('button', { name: 'Trigger summit lightning strike' });
    await zapBtn.click();
    await page.waitForTimeout(45);
    const boltVisible = await page.locator('.anim-storm-bolt').count();
    expect(boltVisible).toBe(1);
    const flashOpacity = await page.evaluate(() => {
      const flashEl = document.querySelector('.anim-storm-panel-flash');
      return flashEl ? parseFloat(window.getComputedStyle(flashEl).opacity || '0') : 0;
    });
    expect(flashOpacity).toBeLessThanOrEqual(0.12);

    // Pause scene motion, verify 0 running
    await page.getByRole('button', { name: 'Pause scene motion' }).click();
    await page.waitForTimeout(200);
    const pausedCount = await page.evaluate(() => {
      return document.getAnimations().filter((a) => {
        const target = (a.effect as KeyframeEffect)?.target as Element | null;
        return a.playState === 'running' && target?.closest('[data-ambient]');
      }).length;
    });
    expect(pausedCount).toBe(0);

    // Resume and scroll offscreen to verify offscreen pause
    await page.getByRole('button', { name: 'Resume scene motion' }).click();
    await page.locator('#faq').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const offscreenCount = await page.evaluate(() => {
      return document.getAnimations().filter((a) => {
        const target = (a.effect as KeyframeEffect)?.target as Element | null;
        return a.playState === 'running' && target?.closest('[data-ambient]');
      }).length;
    });
    expect(offscreenCount).toBe(0);
  });

  test('Reduced motion mode: 0 running ambient animations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(600);

    const runningCount = await page.evaluate(() => {
      return document.getAnimations().filter((a) => a.playState === 'running').length;
    });
    expect(runningCount).toBe(0);
  });

  for (const theme of THEMES) {
    test(`[${theme}] WCAG AA Accessibility audit (axe-core) passes with zero critical or serious violations`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.addInitScript((t) => {
        window.localStorage.setItem('pl-theme', t);
      }, theme);
      await page.goto('/');
      await page.waitForTimeout(800);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const criticalOrSerious = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(criticalOrSerious).toEqual([]);
    });
  }
});

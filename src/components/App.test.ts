import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../App';
import { NEW_ORIGIN, REVEAL_IST_LABEL, OFFICIAL_HOSTS, UPCOMING_FEATURES } from '../config';
import { getPhaseFromRemaining } from '../countdown/countdownStore';
import { AMBIENT, WAYPOINTS, TRAIL_DOTS, SUN_ARC_SAMPLES, LIGHT_AMBIENT_MAX, STORM_AMBIENT_MAX } from './ascentConfig';
import { solveWaypointPlacements } from './waypointPlacement';

const mockServerDateString = 'Tue, 10 Nov 2026 04:00:00 GMT';

describe('App Full Integration & Neo-Brutalist Redesign Verification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-10T04:00:00Z'));
    globalThis.fetch = vi.fn().mockResolvedValue({
      headers: {
        get: (h: string) => (h.toLowerCase() === 'date' ? mockServerDateString : null),
      },
    } as unknown as Response);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('exports valid constants and configurations', () => {
    expect(App).toBeDefined();
    expect(NEW_ORIGIN).toBe('https://polylancezenith.com');
    expect(REVEAL_IST_LABEL).toBe('17 Dec 2026, 12:00 AM IST');
    expect(OFFICIAL_HOSTS).toContain('polylancezenith.com');
    expect(UPCOMING_FEATURES).toHaveLength(4);
  });

  it('anti-phishing link verification logic properly identifies trusted vs untrusted domains', () => {
    const isOfficial = (url: string) => {
      try {
        let h = url.trim().toLowerCase();
        if (!h.startsWith('http://') && !h.startsWith('https://')) {
          h = 'https://' + h;
        }
        return OFFICIAL_HOSTS.includes(new URL(h).hostname);
      } catch {
        return false;
      }
    };

    expect(isOfficial('https://polylancezenith.com')).toBe(true);
    expect(isOfficial('polylancezenith.com/jobs/123')).toBe(true);
    expect(isOfficial('https://polylance.codes')).toBe(false);
    expect(isOfficial('https://phishing-polylance.xyz')).toBe(false);
  });

  it('validates countdown phase transitions and Ascent scene configuration limits', () => {
    expect(getPhaseFromRemaining(10 * 86400000, false)).toBe('normal');
    expect(getPhaseFromRemaining(43200000, false)).toBe('under24h');
    expect(getPhaseFromRemaining(45000, false)).toBe('under60s');
    expect(getPhaseFromRemaining(0, true)).toBe('live');

    expect(AMBIENT.filter((a) => a.lightDurationSec > 0).length).toBeLessThanOrEqual(LIGHT_AMBIENT_MAX);
    expect(AMBIENT.length).toBeLessThanOrEqual(STORM_AMBIENT_MAX);
    expect(WAYPOINTS).toHaveLength(5);
    expect(TRAIL_DOTS.length).toBeGreaterThanOrEqual(40);
  });

  it('solves non-overlapping waypoint label placements across tablet and desktop panel sizes', () => {
    const inputs = WAYPOINTS.map((w) => ({
      id: w.id,
      label: w.label,
      svgX: w.svgX,
      svgY: w.svgY,
      pillWidth: w.defaultPillWidth,
      pillHeight: w.defaultPillHeight,
      preferredAnchors: w.preferredAnchors,
    }));

    for (const [w, h] of [
      [490, 465],
      [530, 465],
      [700, 450],
    ]) {
      const placed = solveWaypointPlacements(w, h, inputs, TRAIL_DOTS, SUN_ARC_SAMPLES);
      expect(placed).toHaveLength(5);
      for (const p of placed) {
        expect(p.hasOverlap).toBe(false);
        expect(p.pillRect.x1).toBeGreaterThanOrEqual(24);
        expect(p.pillRect.x2).toBeLessThanOrEqual(w - 24);
      }
    }
  });
});

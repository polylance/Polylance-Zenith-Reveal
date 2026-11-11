import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
const htmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(htmlPath)) {
  console.error('FAIL: dist/index.html does not exist');
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');
const errors = [];

// 1. Title check (<= 60 chars)
const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
if (!titleMatch) {
  errors.push('Missing <title> tag');
} else {
  const titleLen = titleMatch[1].trim().length;
  if (titleLen === 0 || titleLen > 60) {
    errors.push(`<title> length (${titleLen}) out of range (must be 1..60 chars)`);
  }
}

// 2. Meta description check (140-160 chars)
const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
  || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
if (!descMatch) {
  errors.push('Missing meta description');
} else {
  const descLen = descMatch[1].trim().length;
  if (descLen < 140 || descLen > 160) {
    errors.push(`Meta description length (${descLen}) out of range (must be 140..160 chars)`);
  }
}

// 3. Canonical check
if (!/<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/polylancezenith\.com\/["']/i.test(html)) {
  errors.push('Missing or invalid canonical link');
}

// 4. OG image check
const ogImgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
if (!ogImgMatch) {
  errors.push('Missing og:image meta tag');
} else {
  const ogFile = path.join(distDir, 'og-image.png');
  if (!fs.existsSync(ogFile)) {
    errors.push('Missing dist/og-image.png');
  }
}

// 5. Exactly one <h1>
const h1Matches = html.match(/<h1[\s>]/gi) || [];
if (h1Matches.length !== 1) {
  errors.push(`Expected exactly 1 <h1>, found ${h1Matches.length}`);
}

// 6. JSON-LD parsing & forbidden types check
const jsonLdMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
if (jsonLdMatches.length === 0) {
  errors.push('Missing JSON-LD structured data script');
} else {
  const forbidden = ['AggregateRating', 'Review', 'Offer'];
  for (const m of jsonLdMatches) {
    try {
      const parsed = JSON.parse(m[1]);
      const serialized = JSON.stringify(parsed);
      for (const f of forbidden) {
        if (serialized.includes(`"${f}"`)) {
          errors.push(`Forbidden JSON-LD type detected: ${f}`);
        }
      }
    } catch (err) {
      errors.push(`Invalid JSON-LD JSON: ${err.message}`);
    }
  }
}

// 7. sitemap.xml, robots.txt & llms.txt / llms-full.txt
if (!fs.existsSync(path.join(distDir, 'sitemap.xml'))) {
  errors.push('Missing dist/sitemap.xml');
}
if (!fs.existsSync(path.join(distDir, 'robots.txt'))) {
  errors.push('Missing dist/robots.txt');
}
if (!fs.existsSync(path.join(distDir, 'llms.txt'))) {
  errors.push('Missing dist/llms.txt');
}
if (!fs.existsSync(path.join(distDir, 'llms-full.txt'))) {
  errors.push('Missing dist/llms-full.txt');
}

// 8. All <img> have alt attribute
const imgTags = html.match(/<img\b[^>]*>/gi) || [];
for (const img of imgTags) {
  if (!/\balt=/i.test(img)) {
    errors.push(`<img> tag missing alt attribute: ${img}`);
  }
}

// 9. Verify pre-rendered FAQ content exists in static HTML
if (!html.includes('What is PolyLance Zenith?')) {
  errors.push('Pre-rendered FAQ content missing from initial dist/index.html');
}

// 10. Verify generated favicon suite (including Google 48px/96px/192px multiples) & manifest exist
for (const asset of [
  'favicon.ico',
  'favicon-16.png',
  'favicon-32.png',
  'favicon-48.png',
  'favicon-96.png',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
  'android-chrome-maskable-512x512.png',
  'manifest.webmanifest',
]) {
  if (!fs.existsSync(path.join(distDir, asset))) {
    errors.push(`Missing dist/${asset}`);
  }
}
if (!/sizes=["']48x48["']/i.test(html) || !/sizes=["']192x192["']/i.test(html)) {
  errors.push('Missing 48x48 or 192x192 favicon link in dist/index.html');
}

// 11. IP Guardrail: Zero forbidden terms across source, build HTML, and maintenance HTML
const forbiddenIpPattern = /\b(avengers|doomsday|doom|marvel)\b/i;
function scanDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(full);
    } else if (/\.(ts|tsx|css|html|json|mjs|webmanifest)$/i.test(entry.name)) {
      if (entry.name === 'seo-check.mjs' || entry.name === 'reveal.spec.ts') continue;
      const content = fs.readFileSync(full, 'utf8');
      const m = content.match(forbiddenIpPattern);
      if (m) {
        errors.push(`Forbidden IP term "${m[0]}" found in ${full}`);
      }
    }
  }
}
scanDir(path.resolve(process.cwd(), 'src'));
if (forbiddenIpPattern.test(html)) {
  errors.push('Forbidden IP term found in dist/index.html');
}
const maintHtmlPath = path.resolve(process.cwd(), '..', 'polylance-maintenance', 'index.html');
if (fs.existsSync(maintHtmlPath)) {
  const maintHtml = fs.readFileSync(maintHtmlPath, 'utf8');
  if (forbiddenIpPattern.test(maintHtml)) {
    errors.push('Forbidden IP term found in polylance-maintenance/index.html');
  }
}

if (errors.length > 0) {
  console.error('SEO CHECK FAILED:');
  errors.forEach((e) => console.error('  - ' + e));
  process.exit(1);
}

console.log('SEO CHECK PASSED: All metadata, pre-rendered HTML, icons, JSON-LD, sitemap, robots, and IP guardrails verified.');


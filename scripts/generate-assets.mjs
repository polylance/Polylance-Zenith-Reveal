import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const maintDir = path.resolve(rootDir, '..', 'polylance-maintenance');
const sourceLogoPath = path.join(publicDir, 'logo.png');

if (!fs.existsSync(sourceLogoPath)) {
  throw new Error(`Supplied source logo not found at ${sourceLogoPath}`);
}

fs.mkdirSync(publicDir, { recursive: true });

/**
 * Pack PNG buffers into a standard multi-resolution ICO binary container.
 * Uses PNG-compressed frames (widely supported in Chromium, Firefox, Safari, Windows).
 */
function buildIcoFromPngs(frames) {
  const count = frames.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = count * dirEntrySize;

  let offset = headerSize + dirSize;
  const parts = [];

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: 1 = ICO
  header.writeUInt16LE(count, 4);
  parts.push(header);

  const dirEntries = [];
  for (const frame of frames) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(frame.size >= 256 ? 0 : frame.size, 0);
    entry.writeUInt8(frame.size >= 256 ? 0 : frame.size, 1);
    entry.writeUInt8(0, 2); // Palette count
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(frame.data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += frame.data.length;
    dirEntries.push(entry);
  }

  parts.push(...dirEntries);
  for (const frame of frames) {
    parts.push(frame.data);
  }

  return Buffer.concat(parts);
}

// Remove stale flat-hexagon SVG or old icon filenames if leftover
for (const stale of ['favicon.svg', 'favicon-32x32.png', 'icon-512.png']) {
  const stalePath = path.join(publicDir, stale);
  if (fs.existsSync(stalePath)) {
    fs.unlinkSync(stalePath);
  }
}

const sourceBuffer = fs.readFileSync(sourceLogoPath);

// 1. Multi-size favicon.ico (16/32/48) from supplied source logo (AS-IS)
const icoSizes = [16, 32, 48];
const icoFrames = [];
for (const size of icoSizes) {
  const data = await sharp(sourceBuffer)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
  icoFrames.push({ size, data });
}
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buildIcoFromPngs(icoFrames));

// 2. Individual PNG favicons
await sharp(sourceBuffer)
  .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9, palette: true })
  .toFile(path.join(publicDir, 'favicon-16.png'));

await sharp(sourceBuffer)
  .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9, palette: true })
  .toFile(path.join(publicDir, 'favicon-32.png'));

await sharp(sourceBuffer)
  .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(publicDir, 'favicon-48.png'));

await sharp(sourceBuffer)
  .resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(publicDir, 'favicon-96.png'));

// 3. Apple touch icon (180x180, padded onto solid white tile for opaque iOS corners)
const appleInner = await sharp(sourceBuffer)
  .resize(140, 140, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: 180,
    height: 180,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .composite([{ input: appleInner, gravity: 'center' }])
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(publicDir, 'apple-touch-icon.png'));

// 4. Android Chrome 192 & 512 + Maskable 512 (safe-zone padded on #FFFFFF tile)
await sharp(sourceBuffer)
  .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(publicDir, 'android-chrome-192x192.png'));

await sharp(sourceBuffer)
  .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(publicDir, 'android-chrome-512x512.png'));

const maskableInner = await sharp(sourceBuffer)
  .resize(332, 332, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .composite([{ input: maskableInner, gravity: 'center' }])
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(publicDir, 'android-chrome-maskable-512x512.png'));

// 5. Flat 1200x630 OG Image (Storm dark + cobalt brand palette, compositing REAL unchanged logo)
const ogSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0A0E11"/>
  <rect x="44" y="44" width="1112" height="542" rx="36" fill="#131B20" stroke="#26323A" stroke-width="2"/>

  <!-- Subtle flat layered storm clouds across bottom right inside card -->
  <path d="M44 500 Q220 450 420 488 Q620 442 840 486 Q1020 452 1156 490 L1156 550 Q1156 586 1120 586 L80 586 Q44 586 44 550 Z" fill="#1B252B"/>
  <path d="M44 532 Q280 492 520 526 Q760 490 980 524 L1156 510 L1156 550 Q1156 586 1120 586 L80 586 Q44 586 44 550 Z" fill="#232F36"/>

  <!-- Storm-Green Pill Badge -->
  <rect x="96" y="102" width="308" height="44" rx="22" fill="#0F2A1A" stroke="#2F7D3F" stroke-width="1.5"/>
  <text x="250" y="130" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="#D8F7DC" text-anchor="middle" letter-spacing="0.8">REVEALS 17 DECEMBER 2026</text>

  <!-- Brand Wordmark -->
  <text x="96" y="252" font-family="Arial, Helvetica, sans-serif" font-size="80" font-weight="800" fill="#EAF0F3" letter-spacing="-2">PolyLance <tspan fill="#4C8DFF">Zenith</tspan></text>

  <!-- Subtext -->
  <text x="96" y="330" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="500" fill="#C9D3D9">Escrow-protected freelancing on Polygon.</text>
  <text x="96" y="380" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="400" fill="#A3B1BA">Formerly PolyLance · 2.5% client + 2.5% freelancer fee</text>

  <!-- Bottom Cobalt Bar -->
  <rect x="96" y="458" width="380" height="56" rx="28" fill="#0047AB"/>
  <text x="286" y="494" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#FFFFFF" text-anchor="middle">polylancezenith.com</text>

  <!-- Clean white rounded tile framing the unchanged PolyLance logo -->
  <rect x="872" y="176" width="232" height="232" rx="36" fill="#FFFFFF"/>
</svg>
`;

const ogLogoOverlay = await sharp(sourceBuffer)
  .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp(Buffer.from(ogSvg))
  .composite([{ input: ogLogoOverlay, left: 898, top: 202 }])
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(publicDir, 'og-image.png'));

// 6. Web App Manifest (Theme default: Light #FFFFFF)
const manifest = {
  name: 'PolyLance Zenith',
  short_name: 'PL Zenith',
  description: 'Escrow-protected freelancing protocol on Polygon (formerly PolyLance).',
  start_url: '/',
  display: 'standalone',
  background_color: '#FFFFFF',
  theme_color: '#FFFFFF',
  icons: [
    { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/android-chrome-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
fs.writeFileSync(path.join(publicDir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');

// 7. robots.txt (Explicitly welcome Google, Bing, Image crawlers, and AI answer engines)
const robotsTxt = `User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Applebot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: *
Allow: /

Sitemap: https://polylancezenith.com/sitemap.xml
`;
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');

// 8. sitemap.xml
const today = new Date().toISOString().split('T')[0];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://polylancezenith.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');

// 9. Sync generated favicons to companion maintenance directory if present
if (fs.existsSync(maintDir)) {
  for (const iconFile of ['favicon.ico', 'favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png']) {
    fs.copyFileSync(path.join(publicDir, iconFile), path.join(maintDir, iconFile));
  }
}

console.log('Generated optimized ICO/PNG favicons from logo.png, Storm OG image, manifest, robots.txt, and sitemap.xml');

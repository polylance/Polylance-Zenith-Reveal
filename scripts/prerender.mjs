import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';

const distDir = path.resolve(process.cwd(), 'dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('dist/index.html not found. Run vite build first.');
  process.exit(1);
}

let template = fs.readFileSync(templatePath, 'utf8');

// 1. Render React app & JSON-LD via Vite SSR
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
});

let appHtml = '';
let jsonLdString = '';

try {
  const entry = await vite.ssrLoadModule('/src/entry-server.tsx');
  const rendered = entry.render();
  appHtml = rendered.html;
  jsonLdString = rendered.jsonLd;
} finally {
  await vite.close();
}

// 2. Find Latin 400 and 800 woff2 font files in dist/assets for preloading
const assetsDir = path.join(distDir, 'assets');
let preloadTags = '';
if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  const woff400 = files.find((f) => f.includes('hanken-grotesk-latin-400-normal') && f.endsWith('.woff2'));
  const woff800 = files.find((f) => f.includes('hanken-grotesk-latin-800-normal') && f.endsWith('.woff2'));
  if (woff400) {
    preloadTags += `    <link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/${woff400}" />\n`;
  }
  if (woff800) {
    preloadTags += `    <link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/${woff800}" />\n`;
  }
}

// 3. Optional search verification env vars
let verificationMeta = '';
if (process.env.VITE_GSC_TOKEN) {
  verificationMeta += `    <meta name="google-site-verification" content="${process.env.VITE_GSC_TOKEN}" />\n`;
}
if (process.env.VITE_BING_TOKEN) {
  verificationMeta += `    <meta name="msvalidate.01" content="${process.env.VITE_BING_TOKEN}" />\n`;
}

// 4. Inject into dist/index.html
const jsonLdTag = `<script type="application/ld+json">${jsonLdString}</script>`;

template = template
  .replace('<!-- FONT_PRELOADS -->', preloadTags.trimEnd())
  .replace('<!-- VERIFICATION_META -->', verificationMeta.trimEnd())
  .replace('<!-- JSON_LD -->', jsonLdTag)
  .replace('<!-- SSR_OUTLET -->', appHtml);

fs.writeFileSync(templatePath, template, 'utf8');
console.log('Pre-rendered dist/index.html with full static HTML, font preloads, and @graph JSON-LD.');


# PolyLance Zenith Search & Indexing Guide (`SEO.md`)

This guide documents how to index, verify, and maintain search ranking for **PolyLance Zenith** (`https://polylancezenith.com/`).

---

## 1. Pre-Render & Automated Validation

The build pipeline automatically generates static HTML, Open Graph assets, icons, `robots.txt`, and `sitemap.xml`:
```bash
npm run build
```
- **SSG Pre-Render**: `scripts/prerender.mjs` renders the full React DOM (including H1, definition, sections, and FAQ `<details>`) into `dist/index.html` with `data-theme="light"` (`#FFFFFF` `<meta name="theme-color">`, synced dynamically on theme toggle to `#0A0E11` in Storm) so search crawlers receive 100% of content in the initial HTML response without executing JavaScript.
- **Asset Generation**: `scripts/generate-assets.mjs` builds `favicon.ico` (16/32/48), `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png` (180×180), `android-chrome-192x192.png`, `android-chrome-512x512.png`, `android-chrome-maskable-512x512.png`, `manifest.webmanifest`, and `og-image.png` directly from the supplied `public/logo.png` without altering the artwork.
- **Automated Gate**: `npm run seo:check` validates `<title>` length (≤ 60 chars), `<meta name="description">` length (140–160 chars), canonical URL, `og:image`, single `<h1>`, valid `@graph` JSON-LD, `sitemap.xml`, `robots.txt`, full icon suite, and `<img>` `alt` attributes.

---

## 2. Google Search Console Setup (Domain Property)

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property** and choose **Domain** (covers all subdomains and protocols).
3. Enter `polylancezenith.com`.
4. Copy the provided **TXT record** (e.g., `google-site-verification=...`).
5. Add the TXT record at your DNS provider (Cloudflare / Route53 / Namecheap) on root `@`.
6. Click **Verify** in Google Search Console.
   *(Optional: if using HTML tag verification instead of DNS, set `VITE_GSC_TOKEN` and `VITE_BING_TOKEN` environment variables during build).*

---

## 3. Sitemap Submission & Indexing

1. In Google Search Console for `polylancezenith.com`, navigate to **Indexing → Sitemaps**.
2. Submit: `https://polylancezenith.com/sitemap.xml`.
3. Go to **URL Inspection** at the top bar, enter `https://polylancezenith.com/`, and click **Test Live URL**.
4. Confirm Google renders the page cleanly with zero blocked resources, then click **Request Indexing**.

---

## 4. Structured Data & Rich Results Validation

Test `https://polylancezenith.com/` with:
- [Google Rich Results Test](https://search.google.com/test/rich-results): Verify `FAQPage` and `Event` schemas parse with zero errors or warnings.
- [Schema Markup Validator](https://validator.schema.org/): Verify the full `@graph` (`Organization` with `alternateName: "PolyLance"` and `sameAs` social profiles, `WebSite`, `WebPage`, `FAQPage`, `Event`).

---

## 5. Core Web Vitals Targets

Monitor under **Experience → Core Web Vitals**:
- **LCP (Largest Contentful Paint)**: `< 2.0s` on mobile 4G (H1 text renders immediately via pre-rendered HTML and preloaded Hanken Grotesk WOFF2 fonts; Three.js, GSAP, and Lenis load asynchronously after first paint).
- **INP (Interaction to Next Paint)**: `< 200ms`.
- **CLS (Cumulative Layout Shift)**: `< 0.02` (size-adjusted fallback font + zero parent re-renders on countdown ticks).

---

## 6. Reveal-Day Updates (17 December 2026)

When the new PolyLance Zenith UI goes live on `polylancezenith.com`:
1. **Update Title & Description**: Update `<title>` and `<meta name="description">` to reflect the live marketplace (keep `"formerly PolyLance"` in the description for brand-search continuity).
2. **Update JSON-LD `Event`**: Either remove the `Event` node or set `eventStatus` to `https://schema.org/EventCompleted` / `EventRescheduled` as appropriate.
3. **Preserve Canonical & Redirects**:
   - Keep `<link rel="canonical" href="https://polylancezenith.com/" />`.
   - Enforce HTTP → HTTPS 301 and `www` → apex 301.
   - Switch `polylance.codes` from HTTP 503 maintenance to permanent `301` (`polylance.codes/* -> https://polylancezenith.com/*`) and retain for at least 12 months.
4. **Re-request Indexing**: Use Search Console URL Inspection after deploying the live interface.


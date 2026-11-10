# PolyLance Zenith Domain Transition & Reveal Migration Runbook

This runbook documents the deployment, rebrand alignment, and reveal-day cutover for **polylance.codes** (maintenance host) and **polylancezenith.com** (official production host for **PolyLance Zenith**, formerly PolyLance).

---

## 1. Domain Topology Overview

```
┌────────────────────────────────────────────────────────┐
│            polylance.codes (Legacy Domain)             │
│  Serves HTTP 503 Maintenance Page with Retry-After     │
│  Directory: /polylance-maintenance                     │
└───────────────────────────┬────────────────────────────┘
                            │
          Pre-Reveal:       │ Reveal Day (17 Dec 2026):
          503 Maintenance   │ Permanent 301 Redirect
          Notice            │ polylance.codes/* ->
                            │ https://polylancezenith.com/*
                            ▼
┌────────────────────────────────────────────────────────┐
│         polylancezenith.com (Official Home)            │
│  Until 17 Dec 2026: Serves the Reveal Countdown Page   │
│  On/After 17 Dec 2026: Serves the New PolyLance Zenith │
└────────────────────────────────────────────────────────┘
```

---

## 2. DNS & SSL Configuration

### For `polylancezenith.com` (Official Primary)
| Type  | Name | Target / Value                       | TTL  | Proxy Status / Note |
|-------|------|--------------------------------------|------|---------------------|
| CNAME | @    | `<production-target>.pages.dev`      | Auto | Proxied (Cloudflare)|
| CNAME | www  | `polylancezenith.com`                | Auto | Proxied             |

- Ensure SSL/TLS encryption mode is set to **Full (strict)**.
- Verify HSTS, valid certificates, and zero certificate mismatch warnings.

### For `polylance.codes` (Maintenance Host)
| Type  | Name | Target / Value                       | TTL  | Proxy Status / Note |
|-------|------|--------------------------------------|------|---------------------|
| CNAME | @    | `<maintenance-target>.pages.dev`     | Auto | Proxied (Cloudflare)|
| CNAME | www  | `polylance.codes`                    | Auto | Proxied             |

- Deploy the standalone static package from `polylance-maintenance/` to this domain.
- The `_headers` and `_redirects` ensure all incoming requests receive **HTTP 503 Service Unavailable** with `Retry-After: 86400` and `noindex`.

---

## 3. Rebrand & Verification Checklist for `polylancezenith.com`

Verify before and during the cutover:

- [x] **WalletConnect & App Metadata Name**:
  - Update WalletConnect Cloud project metadata name to **"PolyLance Zenith"**.
  - Update Wagmi / RainbowKit / ConnectKit appName configuration to **"PolyLance Zenith"** and icon URL to `https://polylancezenith.com/logo.png`.
  - Add `https://polylancezenith.com` to the WalletConnect Cloud project domain allowlist.
- [x] **Social Profile Names & Handles**:
  - Update official social profile display names (X / Twitter, GitHub, Discord, Farcaster, LinkedIn) to **PolyLance Zenith** (noting *formerly PolyLance* in bios for continuity).
- [x] **CORS & RPC Allowed Origins**:
  - Whitelist `https://polylancezenith.com` on all RPC providers (Alchemy, Infura, QuickNode).
  - Verify The Graph / Goldsky subgraph query endpoints allow queries from `polylancezenith.com`.
- [x] **Soulbound Token (SBT) Metadata Isolation**:
  - Verify that smart contract ERC-5192 / ERC-721 `tokenURI` implementations return decentralized `ipfs://` or gateway URLs, **never** tied to `polylance.codes`.
- [x] **On-Chain Immutability Note**:
  - **Smart contract names, token symbols, and on-chain certificate metadata names remain unchanged (`PolyLance`)**. They are immutable on Polygon and continue operating identically under the **PolyLance Zenith** interface.

---

## 4. Reveal Day Cutover Plan (17 December 2026, 12:00 AM IST)

**Exact UTC Instant:** `2026-12-16T18:30:00Z`

### Step 1: Automatic Client-Side Transition
At the exact second, the reveal page automatically:
1. Rolls the 3D Milestone Path sphere to step 4 (the **Zenith** apex slab) and updates its status.
2. Changes the "Arrives 17 Dec" pills to **"Live now"**.
3. Replaces the countdown numbers with **"We're live"** and renders the single **"Enter the new PolyLance Zenith"** CTA.
4. Stops the tick loop with zero page reload.

### Step 2: Host Cutover on `polylancezenith.com`
Deploy the new **PolyLance Zenith** application bundle to the root of `https://polylancezenith.com`.

### Step 3: `polylance.codes` Cutover (Remove 503, Enable 301)
Switch `polylance.codes` from the maintenance page to a permanent 301 redirect rule to pass all SEO link equity and route legacy bookmarks:

#### Via Cloudflare Dashboard (Recommended, Zero Downtime):
1. Navigate to Cloudflare Dashboard -> `polylance.codes` -> **Rules** -> **Redirect Rules**.
2. Create Rule:
   - Name: `Redirect polylance.codes to polylancezenith.com`
   - Match: `All incoming requests`
   - Target URL: `Dynamic` -> `concat("https://polylancezenith.com", http.request.uri.path)`
   - Status code: `301 Moved Permanently`
3. Save and deploy.

#### Via Static Host Config (`_redirects`):
Replace `/* /index.html 503` with:
```text
/*    https://polylancezenith.com/:splat   301!
```

#### Via Nginx:
Replace the 503 block with:
```nginx
location / {
    return 301 https://polylancezenith.com$request_uri;
}
```
Reload nginx: `nginx -s reload`.

---

## 5. Post-Reveal Retention Policy
- Keep the `polylance.codes` domain registered and serving the permanent 301 redirect for a **minimum of 12 months** (through December 2027).
- Never let the legacy domain lapse, preventing domain hijacking or phishing impersonation attacks.

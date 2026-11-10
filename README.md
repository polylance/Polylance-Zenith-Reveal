# PolyLance Reveal Countdown Site

Standalone countdown and migration announcement site for `polylance.codes`.

## Overview
- **Old Domain**: `polylance.codes` (serves only this countdown site)
- **New Domain**: `polylancezenith.com` (`NEW_ORIGIN`)
- **Reveal Target**: Thursday, 17 December 2026 at 12:00 AM IST (`2026-12-16T18:30:00Z` UTC)

## Tech Stack
- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4 (flat light theme, PolyLance design system)
- Lucide React icons
- Vitest for automated drift & offset test suites

## Key Features
1. **Server-Authoritative Countdown Engine**:
   - Queries server via `HEAD /` with `cache: no-store` to read the HTTP `Date` header.
   - Adjusts for half the round-trip latency (`rtt / 2`).
   - Uses monotonic `performance.now()` between syncs so system clock adjustments or battery sleep cannot alter the countdown.
   - Re-syncs on visibility changes (wake from sleep), network online events, and periodic 5-minute ticks.
   - Gracefully falls back to the device clock if offline/unreachable, displaying a small notice: "Using your device clock".
2. **Accessible**:
   - Number tiles are `aria-hidden="true"`.
   - Visually hidden screen reader live summary updated once per minute (`aria-live="polite"`).
3. **Domain Migration Guidance**:
   - Highlights the move to `polylancezenith.com`.
   - Deep-link helper: detects subpaths like `/jobs/123` and provides a direct one-click button to open that exact path on the new site.
   - Injects `noindex, follow` on any non-root path.
4. **Calendar & Share**:
   - Client-side `.ics` generator with standard iCalendar format.
   - Web Share API integration with automatic fallback to clipboard copy.
5. **Protocol Principles**:
   - Honest fee model: 2.5% client + 2.5% freelancer = 5% total fee.
   - Zero seeded reviews, fake stats, or email forms.
6. **Reveal Transition**:
   - At zero (or if already past), seamlessly transitions to a "We're live" state with a prominent CTA to open the new app.

## Development & Testing
```bash
# Run local dev server
npm run dev

# Run unit & offset tests
npm test

# Production build
npm run build
```

## Deployment & Cutover
See [`MIGRATION.md`](./MIGRATION.md) for full DNS, SSL, header configurations, and reveal-day 301 redirect setup.


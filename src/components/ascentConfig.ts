import type { AnchorDir } from './waypointPlacement';

export interface AmbientAnimConfig {
  id: string;
  durationSec: number;
  lightDurationSec: number;
  transformOnly: boolean;
}

export interface WaypointConfig {
  id: number;
  label: string;
  shortDesc: string;
  svgX: number;
  svgY: number;
  preferredAnchors: AnchorDir[];
  defaultPillWidth: number;
  defaultPillHeight: number;
}

/**
 * Ambient animations strictly capped:
 * - Light theme: <= 8 active animations
 * - Storm theme: <= 12 active animations (including hero cloud ceiling shimmer)
 */
export const AMBIENT: AmbientAnimConfig[] = [
  { id: 'cloud-slow', durationSec: 120, lightDurationSec: 48, transformOnly: true },
  { id: 'cloud-mid', durationSec: 80, lightDurationSec: 36, transformOnly: true },
  { id: 'cloud-fast', durationSec: 55, lightDurationSec: 28, transformOnly: true },
  { id: 'pine-sway-left', durationSec: 10, lightDurationSec: 7.5, transformOnly: true },
  { id: 'bird-a', durationSec: 28, lightDurationSec: 28, transformOnly: true },
  { id: 'lake-shimmer', durationSec: 6.5, lightDurationSec: 6.5, transformOnly: true },
  { id: 'summit-pulse', durationSec: 3.6, lightDurationSec: 3.6, transformOnly: true },
  { id: 'storm-rain', durationSec: 1.2, lightDurationSec: 0, transformOnly: true },
  { id: 'storm-mist-a', durationSec: 70, lightDurationSec: 0, transformOnly: true },
  { id: 'storm-mist-b', durationSec: 70, lightDurationSec: 0, transformOnly: true },
];

export const LIGHT_AMBIENT_MAX = 8;
export const STORM_AMBIENT_MAX = 12;

/**
 * 5 protocol milestones mapped to SVG coordinates inside viewBox="0 0 560 440".
 * Coordinates keep full trail, peak, and labels within the safe visible region at all viewports.
 */
export const WAYPOINTS: WaypointConfig[] = [
  {
    id: 1,
    label: 'Fund escrow',
    shortDesc: 'Client locks USDC or POL in non-custodial escrow before work starts.',
    svgX: 146,
    svgY: 334,
    preferredAnchors: ['SE', 'S', 'N'],
    defaultPillWidth: 112,
    defaultPillHeight: 28,
  },
  {
    id: 2,
    label: 'Do the work',
    shortDesc: 'Freelancer delivers agreed milestones knowing funds are already locked.',
    svgX: 216,
    svgY: 304,
    preferredAnchors: ['NW', 'SE', 'N'],
    defaultPillWidth: 112,
    defaultPillHeight: 28,
  },
  {
    id: 3,
    label: 'Approve milestone',
    shortDesc: 'Client reviews deliverables; on-chain arbitration settles any dispute.',
    svgX: 282,
    svgY: 260,
    preferredAnchors: ['E', 'SE', 'W'],
    defaultPillWidth: 146,
    defaultPillHeight: 28,
  },
  {
    id: 4,
    label: 'Get paid',
    shortDesc: 'Smart contract releases escrowed USDC/POL straight to the freelancer wallet.',
    svgX: 342,
    svgY: 208,
    preferredAnchors: ['W', 'NW', 'E'],
    defaultPillWidth: 94,
    defaultPillHeight: 28,
  },
  {
    id: 5,
    label: 'Zenith',
    shortDesc: '17 December reveal: portable soulbound reputation and new Polygon UI.',
    svgX: 392,
    svgY: 152,
    preferredAnchors: ['E', 'W', 'S'],
    defaultPillWidth: 84,
    defaultPillHeight: 28,
  },
];

/**
 * Generate smooth trail dot coordinates along the quadratic climbing path
 * connecting Waypoints 1 -> 5 inside viewBox="0 0 560 440".
 */
export function generateTrailDots(): Array<{ cx: number; cy: number }> {
  const dots: Array<{ cx: number; cy: number }> = [];
  const segs: Array<[WaypointConfig, WaypointConfig, number]> = [
    [WAYPOINTS[0], WAYPOINTS[1], 13],
    [WAYPOINTS[1], WAYPOINTS[2], 12],
    [WAYPOINTS[2], WAYPOINTS[3], 12],
    [WAYPOINTS[3], WAYPOINTS[4], 11],
  ];

  for (const [a, b, steps] of segs) {
    const cxCtrl = (a.svgX + b.svgX) / 2 - 4;
    const cyCtrl = (a.svgY + b.svgY) / 2 + 8;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const omt = 1 - t;
      const x = omt * omt * a.svgX + 2 * omt * t * cxCtrl + t * t * b.svgX;
      const y = omt * omt * a.svgY + 2 * omt * t * cyCtrl + t * t * b.svgY;
      dots.push({ cx: Math.round(x * 10) / 10, cy: Math.round(y * 10) / 10 });
    }
  }
  return dots;
}

export const TRAIL_DOTS = generateTrailDots();

/**
 * Sun arc samples inside viewBox="0 0 560 440": rises from left upper ridge
 * toward the Zenith corona right above the summit peak (392, 102).
 */
export function getSunPosition(progress: number): { cx: number; cy: number } {
  const safe = Number.isFinite(progress) ? progress : 0.15;
  const p = Math.max(0, Math.min(1, safe));
  const cx = 135 + 257 * p;
  const cy = 172 - 68 * p - 32 * Math.sin(Math.PI * p);
  return { cx: Math.round(cx * 10) / 10, cy: Math.round(cy * 10) / 10 };
}

export const SUN_ARC_SAMPLES: Array<{ cx: number; cy: number }> = Array.from(
  { length: 9 },
  (_, idx) => getSunPosition(idx / 8)
);

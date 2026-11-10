export type AnchorDir = 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW' | 'N' | 'S';

export interface Rect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface WaypointPlacementInput {
  id: number;
  label: string;
  svgX: number;
  svgY: number;
  pillWidth: number;
  pillHeight: number;
  preferredAnchors?: AnchorDir[];
}

export interface PlacedWaypoint {
  id: number;
  anchor: AnchorDir;
  markerPx: { x: number; y: number };
  pillRect: Rect;
  leaderLine: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  hasOverlap: boolean;
}

export const SVG_VIEW_WIDTH = 560;
export const SVG_VIEW_HEIGHT = 440;
export const SAFE_PANEL_MARGIN = 24;
export const MARKER_RADIUS_PX = 12;

export function getSvgToPixelTransform(panelWidth: number, panelHeight: number) {
  const safeW = Math.max(1, panelWidth);
  const safeH = Math.max(1, panelHeight);
  const scale = Math.max(safeW / SVG_VIEW_WIDTH, safeH / SVG_VIEW_HEIGHT);
  const offsetX = (safeW - SVG_VIEW_WIDTH * scale) / 2;
  const offsetY = safeH - SVG_VIEW_HEIGHT * scale;
  return {
    scale,
    offsetX,
    offsetY,
    toPx: (sx: number, sy: number) => ({
      x: sx * scale + offsetX,
      y: sy * scale + offsetY,
    }),
  };
}

function rectsOverlap(a: Rect, b: Rect, pad = 0): boolean {
  return (
    a.x1 - pad < b.x2 &&
    a.x2 + pad > b.x1 &&
    a.y1 - pad < b.y2 &&
    a.y2 + pad > b.y1
  );
}

function intersectionArea(a: Rect, b: Rect): number {
  const ix1 = Math.max(a.x1, b.x1);
  const iy1 = Math.max(a.y1, b.y1);
  const ix2 = Math.min(a.x2, b.x2);
  const iy2 = Math.min(a.y2, b.y2);
  if (ix2 <= ix1 || iy2 <= iy1) return 0;
  return (ix2 - ix1) * (iy2 - iy1);
}

function candidatePillRect(
  mx: number,
  my: number,
  w: number,
  h: number,
  dir: AnchorDir,
  gap = 16
): Rect {
  const dist = MARKER_RADIUS_PX + gap; // 28px from center -> 16px clear gap from ring edge
  const diag = Math.round(dist * 0.78);

  switch (dir) {
    case 'E':
      return { x1: mx + dist, y1: my - h / 2, x2: mx + dist + w, y2: my + h / 2 };
    case 'W':
      return { x1: mx - dist - w, y1: my - h / 2, x2: mx - dist, y2: my + h / 2 };
    case 'N':
      return { x1: mx - w / 2, y1: my - dist - h, x2: mx + w / 2, y2: my - dist };
    case 'S':
      return { x1: mx - w / 2, y1: my + dist, x2: mx + w / 2, y2: my + dist + h };
    case 'NE':
      return { x1: mx + diag, y1: my - diag - h, x2: mx + diag + w, y2: my - diag };
    case 'NW':
      return { x1: mx - diag - w, y1: my - diag - h, x2: mx - diag, y2: my - diag };
    case 'SE':
      return { x1: mx + diag, y1: my + diag, x2: mx + diag + w, y2: my + diag + h };
    case 'SW':
      return { x1: mx - diag - w, y1: my + diag, x2: mx - diag, y2: my + diag + h };
  }
}

function computeLeaderLine(marker: { x: number; y: number }, pill: Rect) {
  // Closest point on pill rectangle to marker center
  const cx = Math.max(pill.x1, Math.min(marker.x, pill.x2));
  const cy = Math.max(pill.y1, Math.min(marker.y, pill.y2));
  const dx = cx - marker.x;
  const dy = cy - marker.y;
  const len = Math.hypot(dx, dy) || 1;
  const startRadius = MARKER_RADIUS_PX + 2;
  return {
    x1: marker.x + (dx / len) * startRadius,
    y1: marker.y + (dy / len) * startRadius,
    x2: cx,
    y2: cy,
  };
}

const DEFAULT_ANCHOR_ORDER: AnchorDir[] = ['E', 'W', 'NW', 'NE', 'SE', 'SW', 'N', 'S'];

/**
 * Deterministically solves zero-overlap placement for all waypoint labels
 * across any scene panel size >= 480px using 8-direction candidate search.
 */
export function solveWaypointPlacements(
  panelWidth: number,
  panelHeight: number,
  waypoints: WaypointPlacementInput[],
  trailDotsSvg: Array<{ cx: number; cy: number }>,
  sunArcSvg: Array<{ cx: number; cy: number }>
): PlacedWaypoint[] {
  const { toPx } = getSvgToPixelTransform(panelWidth, panelHeight);

  // Build obstacle rects in pixel coordinates
  const markerObstacles: Rect[] = waypoints.map((wp) => {
    const p = toPx(wp.svgX, wp.svgY);
    const pad = MARKER_RADIUS_PX + 10;
    return { x1: p.x - pad, y1: p.y - pad, x2: p.x + pad, y2: p.y + pad };
  });

  const trailObstacles: Rect[] = trailDotsSvg.map((d) => {
    const p = toPx(d.cx, d.cy);
    const pad = 7;
    return { x1: p.x - pad, y1: p.y - pad, x2: p.x + pad, y2: p.y + pad };
  });

  const sunObstacles: Rect[] = sunArcSvg.map((s) => {
    const p = toPx(s.cx, s.cy);
    const pad = 34;
    return { x1: p.x - pad, y1: p.y - pad, x2: p.x + pad, y2: p.y + pad };
  });

  const controlObstacles: Rect[] = [
    // Bottom-left Play + Zap controls (h-8 at bottom-3.5 -> y: H-46..H-14) + 8px padding
    { x1: 8, y1: panelHeight - 54, x2: 184, y2: panelHeight - 6 },
    // Bottom-right Pause toggle (h-8 w-8 at bottom-3.5 right-4) + 8px padding
    { x1: panelWidth - 56, y1: panelHeight - 54, x2: panelWidth - 8, y2: panelHeight - 6 },
  ];

  const placedLabels: Rect[] = [];
  const results: PlacedWaypoint[] = [];

  for (const wp of waypoints) {
    const markerPx = toPx(wp.svgX, wp.svgY);
    const dirs = wp.preferredAnchors && wp.preferredAnchors.length
      ? [...wp.preferredAnchors, ...DEFAULT_ANCHOR_ORDER.filter((d) => !wp.preferredAnchors!.includes(d))]
      : DEFAULT_ANCHOR_ORDER;

    let bestAnchor: AnchorDir = dirs[0];
    let bestRect = candidatePillRect(markerPx.x, markerPx.y, wp.pillWidth, wp.pillHeight, dirs[0]);
    let bestScore = Infinity;

    for (let idx = 0; idx < dirs.length; idx++) {
      const dir = dirs[idx];
      // Try standard 16px gap first, then 22px gap if needed
      for (const gap of [16, 22]) {
        const rect = candidatePillRect(markerPx.x, markerPx.y, wp.pillWidth, wp.pillHeight, dir, gap);

        let penalty = idx * 0.25 + (gap > 16 ? 2 : 0);

        // Panel safe margin check (24px)
        const outLeft = Math.max(0, SAFE_PANEL_MARGIN - rect.x1);
        const outRight = Math.max(0, rect.x2 - (panelWidth - SAFE_PANEL_MARGIN));
        const outTop = Math.max(0, SAFE_PANEL_MARGIN - rect.y1);
        const outBottom = Math.max(0, rect.y2 - (panelHeight - SAFE_PANEL_MARGIN));
        if (outLeft + outRight + outTop + outBottom > 0) {
          penalty += 100000 + (outLeft + outRight + outTop + outBottom) * 1000;
        }

        // Marker overlap check (hard reject)
        for (const m of markerObstacles) {
          if (rectsOverlap(rect, m, 0)) {
            penalty += 50000 + intersectionArea(rect, m) * 100;
          }
        }

        // Sun overlap check (hard reject)
        for (const s of sunObstacles) {
          if (rectsOverlap(rect, s, 0)) {
            penalty += 25000 + intersectionArea(rect, s) * 80;
          }
        }

        // Control buttons overlap (hard reject)
        for (const c of controlObstacles) {
          if (rectsOverlap(rect, c, 0)) {
            penalty += 40000 + intersectionArea(rect, c) * 100;
          }
        }

        // Other labels + 8px padding
        for (const l of placedLabels) {
          if (rectsOverlap(rect, l, 8)) {
            penalty += 30000 + intersectionArea(
              rect,
              { x1: l.x1 - 8, y1: l.y1 - 8, x2: l.x2 + 8, y2: l.y2 + 8 }
            ) * 100;
          }
        }

        // Trail dots overlap
        for (const t of trailObstacles) {
          if (rectsOverlap(rect, t, 0)) {
            penalty += 2500 + intersectionArea(rect, t) * 40;
          }
        }

        if (penalty < bestScore) {
          bestScore = penalty;
          bestAnchor = dir;
          bestRect = rect;
        }
      }
    }

    placedLabels.push(bestRect);
    results.push({
      id: wp.id,
      anchor: bestAnchor,
      markerPx,
      pillRect: bestRect,
      leaderLine: computeLeaderLine(markerPx, bestRect),
      hasOverlap: bestScore >= 2500,
    });
  }

  return results;
}

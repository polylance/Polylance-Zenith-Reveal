import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import {
  AMBIENT,
  WAYPOINTS,
  TRAIL_DOTS,
  SUN_ARC_SAMPLES,
  getSunPosition,
  WaypointConfig,
} from './ascentConfig';
import {
  SVG_VIEW_WIDTH,
  SVG_VIEW_HEIGHT,
  PlacedWaypoint,
  solveWaypointPlacements,
  getSvgToPixelTransform,
} from './waypointPlacement';
import { useSunProgress, useCountdownPhase } from '../countdown/countdownStore';
import { useTheme } from '../theme/themeStore';
import { Play, Pause, RotateCcw, Sun, Zap, X } from 'lucide-react';

export type ConceptHighlight = 'escrow' | 'milestones' | 'reputation' | null;

interface AscentSceneProps {
  highlightedConcept: ConceptHighlight;
}

const PAUSE_STORAGE_KEY = 'pl_ascent_paused';
const LIGHTNING_COOLDOWN_MS = 8000;

// 5 distinct jagged polygon lightning bolt paths inside 560x440 coordinate space
const LIGHTNING_BOLTS: string[] = [
  'M178,44 L164,96 L182,102 L156,162 L170,164 L144,224 L152,226 L184,158 L168,154 L196,96 L178,90 Z',
  'M264,38 L248,88 L266,94 L236,154 L250,158 L224,208 L232,210 L264,150 L248,144 L280,88 L262,82 Z',
  'M352,32 L338,74 L354,80 L330,132 L344,136 L388,150 L350,126 L372,74 L354,68 Z',
  'M420,42 L404,92 L422,98 L394,152 L408,156 L382,212 L390,214 L424,148 L408,144 L436,92 L418,86 Z',
  'M394,28 L378,70 L398,76 L372,118 L390,122 L384,150 L396,148 L406,114 L388,110 L414,68 L396,62 Z',
];

/**
 * Isolated subcomponent reading live countdown progress so countdown ticks
 * update ONLY the sun / eclipse position without re-rendering the scene or layout solver.
 */
const SunOrb: React.FC<{ isStorm: boolean }> = ({ isStorm }) => {
  const { progress } = useSunProgress();
  const phase = useCountdownPhase();
  const isLive = phase === 'live';
  const { cx, cy } = getSunPosition(progress);

  if (isStorm) {
    return (
      <g className="transition-transform duration-1000" aria-hidden="true">
        {isLive ? (
          <>
            <circle cx={cx} cy={cy} r="28" fill="#62D26F" fillOpacity="0.22" />
            <circle cx={cx} cy={cy} r="19" fill="#D8F7DC" stroke="#62D26F" strokeWidth="2.5" />
          </>
        ) : (
          <>
            {/* Corona halo (flat ring, zero blur/gradient) */}
            <circle cx={cx} cy={cy} r="25" fill="#62D26F" fillOpacity="0.16" />
            <circle cx={cx} cy={cy} r="19" fill="#0D1317" stroke="#62D26F" strokeWidth="2.5" />
            {/* Thin inner crescent accent */}
            <path
              d={`M ${cx - 8} ${cy - 10} A 13 13 0 0 1 ${cx + 10} ${cy + 9}`}
              fill="none"
              stroke="#D8F7DC"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        )}
      </g>
    );
  }

  return (
    <g className="transition-transform duration-1000" aria-hidden="true">
      <circle cx={cx} cy={cy} r="26" fill="#1F6BFF" fillOpacity="0.12" />
      <circle cx={cx} cy={cy} r="18" fill={isLive ? '#1F6BFF' : '#0047AB'} />
      <circle cx={cx} cy={cy} r="9" fill="#FFFFFF" fillOpacity={isLive ? 0.95 : 0.85} />
    </g>
  );
};

export const AscentScene: React.FC<AscentSceneProps> = ({ highlightedConcept }) => {
  const { isStorm } = useTheme();
  const phase = useCountdownPhase();
  const isLive = phase === 'live';

  const panelRef = useRef<HTMLDivElement>(null);
  const pillMeasureRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const [panelSize, setPanelSize] = useState<{ width: number; height: number }>({
    width: 560,
    height: 460,
  });

  const [activeWaypoint, setActiveWaypoint] = useState<WaypointConfig | null>(null);
  const [climberIndex, setClimberIndex] = useState<number>(0);
  const [isPlayingJourney, setIsPlayingJourney] = useState<boolean>(false);

  // Lightning strike state (Storm only)
  const [strikeState, setStrikeState] = useState<{ id: number; boltIdx: number } | null>(null);
  const lastStrikeAtRef = useRef<number>(0);
  const strikeCounterRef = useRef<number>(0);
  const prevBoltIdxRef = useRef<number>(-1);
  const hadLiveStrikeRef = useRef<boolean>(false);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [isPausedByUser, setIsPausedByUser] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(PAUSE_STORAGE_KEY) === 'true';
  });

  const [isInViewport, setIsInViewport] = useState<boolean>(true);
  const [isTabVisible, setIsTabVisible] = useState<boolean>(true);

  const isCompactMobile = panelSize.width < 480;

  // Compute waypoint label placements purely from panel geometry (zero tick coupling)
  const [placements, setPlacements] = useState<PlacedWaypoint[]>(() =>
    solveWaypointPlacements(
      560,
      460,
      WAYPOINTS.map((w) => ({
        id: w.id,
        label: w.label,
        svgX: w.svgX,
        svgY: w.svgY,
        pillWidth: w.defaultPillWidth,
        pillHeight: w.defaultPillHeight,
        preferredAnchors: w.preferredAnchors,
      })),
      TRAIL_DOTS,
      SUN_ARC_SAMPLES
    )
  );

  const recomputePlacements = useCallback((w: number, h: number) => {
    const inputs = WAYPOINTS.map((wp) => {
      const el = pillMeasureRefs.current[wp.id];
      const measuredW = el ? Math.ceil(el.offsetWidth) : wp.defaultPillWidth;
      const measuredH = el ? Math.ceil(el.offsetHeight) : wp.defaultPillHeight;
      return {
        id: wp.id,
        label: wp.label,
        svgX: wp.svgX,
        svgY: wp.svgY,
        pillWidth: measuredW > 30 ? measuredW : wp.defaultPillWidth,
        pillHeight: measuredH > 16 ? measuredH : wp.defaultPillHeight,
        preferredAnchors: wp.preferredAnchors,
      };
    });

    setPlacements(solveWaypointPlacements(w, h, inputs, TRAIL_DOTS, SUN_ARC_SAMPLES));
  }, []);

  // Measure scene panel smoothly via ResizeObserver
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !panelRef.current) return;
    const node = panelRef.current;

    const update = () => {
      const rect = node.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w > 0 && h > 0) {
        setPanelSize((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
        recomputePlacements(w, h);
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(node);
    return () => ro.disconnect();
  }, [recomputePlacements, isStorm]);

  // Listen to prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // IntersectionObserver pauses ambient & lightning off-screen
  useEffect(() => {
    if (typeof window === 'undefined' || !panelRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIsInViewport(entry.isIntersecting));
      },
      { threshold: 0.05 }
    );
    obs.observe(panelRef.current);
    return () => obs.disconnect();
  }, []);

  // Visibility API pauses hidden tabs
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVis = () => setIsTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const effectiveAmbientPaused =
    prefersReducedMotion || isPausedByUser || !isInViewport || !isTabVisible;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.ambientPaused = effectiveAmbientPaused ? 'true' : 'false';
    return () => {
      delete document.documentElement.dataset.ambientPaused;
    };
  }, [effectiveAmbientPaused]);

  const togglePause = () => {
    const next = !isPausedByUser;
    setIsPausedByUser(next);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(PAUSE_STORAGE_KEY, String(next));
    }
  };

  // Lightning strike trigger with strict >= 8s rate-limiting
  const triggerLightning = useCallback(
    (forceZeroStrike = false) => {
      if (!isStorm || effectiveAmbientPaused) return;
      const now = Date.now();
      if (!forceZeroStrike && now - lastStrikeAtRef.current < LIGHTNING_COOLDOWN_MS) {
        return;
      }

      let nextIdx = forceZeroStrike ? 4 : Math.floor(Math.random() * LIGHTNING_BOLTS.length);
      if (!forceZeroStrike && nextIdx === prevBoltIdxRef.current) {
        nextIdx = (nextIdx + 1) % LIGHTNING_BOLTS.length;
      }
      prevBoltIdxRef.current = nextIdx;
      lastStrikeAtRef.current = now;
      strikeCounterRef.current += 1;

      const nextId = strikeCounterRef.current;
      setStrikeState({ id: nextId, boltIdx: nextIdx });

      window.setTimeout(() => {
        setStrikeState((cur) => (cur && cur.id === nextId ? null : cur));
      }, 280);
    },
    [isStorm, effectiveAmbientPaused]
  );

  // Automatic natural lightning scheduler: 1 bolt every 9-15s
  useEffect(() => {
    if (!isStorm || effectiveAmbientPaused || typeof window === 'undefined') {
      setStrikeState(null);
      return;
    }

    let timerId: number | null = null;
    let disposed = false;

    const scheduleNext = () => {
      const delayMs = 9000 + Math.floor(Math.random() * 6000);
      timerId = window.setTimeout(() => {
        if (disposed) return;
        triggerLightning(false);
        scheduleNext();
      }, delayMs);
    };

    scheduleNext();
    return () => {
      disposed = true;
      if (timerId !== null) window.clearTimeout(timerId);
    };
  }, [isStorm, effectiveAmbientPaused, triggerLightning]);

  // Trigger final lightning flash when countdown hits zero
  useEffect(() => {
    if (isLive && isStorm && !hadLiveStrikeRef.current) {
      hadLiveStrikeRef.current = true;
      triggerLightning(true);
    }
  }, [isLive, isStorm, triggerLightning]);

  // "Play journey" coin climb animation across all dots
  useEffect(() => {
    if (!isPlayingJourney) return;
    if (prefersReducedMotion) {
      setClimberIndex(TRAIL_DOTS.length - 1);
      setIsPlayingJourney(false);
      return;
    }

    const total = TRAIL_DOTS.length - 1;
    let step = 0;
    const interval = window.setInterval(() => {
      step += 1;
      if (step >= total) {
        setClimberIndex(total);
        setIsPlayingJourney(false);
        window.clearInterval(interval);
      } else {
        setClimberIndex(step);
      }
    }, 55);

    return () => window.clearInterval(interval);
  }, [isPlayingJourney, prefersReducedMotion]);

  const handlePlayJourney = () => {
    setClimberIndex(0);
    setIsPlayingJourney(true);
  };

  const climberPoint = TRAIL_DOTS[climberIndex] ?? TRAIL_DOTS[0];
  const conceptWpId =
    highlightedConcept === 'escrow'
      ? 1
      : highlightedConcept === 'milestones'
      ? 3
      : highlightedConcept === 'reputation'
      ? 5
      : null;

  const { toPx } = useMemo(
    () => getSvgToPixelTransform(panelSize.width, panelSize.height),
    [panelSize.width, panelSize.height]
  );

  // Palette switch strictly flat (zero gradients, zero blur)
  const sceneColors = isStorm
    ? {
        bg: '#0D1317',
        border: '#26323A',
        sunTrack: '#26323A',
        cloudSlow: '#1B252B',
        cloudMid: '#232F36',
        cloudFast: '#2C3A42',
        summitShadow: '#141C21',
        farRidge: '#1D2A31',
        midRidge: '#24353A',
        peakBody: '#2B4A45',
        peakFacet: '#C9D3D9',
        nearHill: '#1E4D2B',
        foreground: '#0F2A1A',
        pine: '#0A1F13',
        lake: '#1B252B',
        lakeShimmer: '#2C3A42',
        trailDot: '#D8F7DC',
        ringStroke: '#62D26F',
        ringFill: '#131B20',
        ringActiveFill: '#0F2A1A',
        ringText: '#D8F7DC',
        coinFill: '#4C8DFF',
        coinRing: '#62D26F',
        leaderLine: '#62D26F',
        beacon: '#62D26F',
      }
    : {
        bg: '#F5F7FB',
        border: '#E5E7EB',
        sunTrack: '#CBD5E1',
        cloudSlow: '#E8EEF7',
        cloudMid: '#DDE6F3',
        cloudFast: '#FFFFFF',
        summitShadow: '#C7D6EE',
        farRidge: '#93B4E8',
        midRidge: '#5F8CD6',
        peakBody: '#0047AB',
        peakFacet: '#FFFFFF',
        nearHill: '#1D4ED8',
        foreground: '#0F172A',
        pine: '#064E3B',
        lake: '#BFDBFE',
        lakeShimmer: '#FFFFFF',
        trailDot: '#0047AB',
        ringStroke: '#0047AB',
        ringFill: '#FFFFFF',
        ringActiveFill: '#0047AB',
        ringText: '#0047AB',
        coinFill: '#1F6BFF',
        coinRing: '#FFFFFF',
        leaderLine: '#0047AB',
        beacon: '#1F6BFF',
      };

  const handleSelectWaypoint = (wp: WaypointConfig) => {
    setActiveWaypoint((prev) => (prev?.id === wp.id ? null : wp));
    if (wp.id === 5 && isStorm) {
      triggerLightning(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* Tooltip description slot rendered above the scene frame on mobile or when inspecting a step */}
      {activeWaypoint && (
        <div
          role="status"
          className="px-3.5 py-2.5 rounded-2xl bg-[var(--surface)] border border-[var(--hairline)] flex items-start justify-between gap-2.5 text-xs shadow-xs"
        >
          <div className="flex items-start gap-2 min-w-0">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
              style={{
                backgroundColor: isStorm ? '#0F2A1A' : '#EFF6FF',
                color: isStorm ? '#D8F7DC' : '#0047AB',
                border: `1px solid ${isStorm ? '#2F7D3F' : 'rgba(0,71,171,0.25)'}`,
              }}
            >
              {activeWaypoint.id}
            </span>
            <p className="text-[var(--text-muted)] leading-snug">
              <strong className="text-[var(--text)] font-bold">{activeWaypoint.label}:</strong>{' '}
              {activeWaypoint.shortDesc}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveWaypoint(null)}
            aria-label="Close waypoint description"
            className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--text-subtle)] hover:text-[var(--text)] shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Bounded Ascent Scene Frame */}
      <div
        ref={panelRef}
        data-ambient-paused={effectiveAmbientPaused ? 'true' : 'false'}
        data-scene-panel="true"
        className="relative w-full h-[350px] sm:h-[450px] lg:h-[465px] rounded-[28px] border overflow-hidden select-none"
        style={{
          backgroundColor: sceneColors.bg,
          borderColor: sceneColors.border,
        }}
      >
        {/* Pure Vector Landscape SVG */}
        <svg
          viewBox={`0 0 ${SVG_VIEW_WIDTH} ${SVG_VIEW_HEIGHT}`}
          preserveAspectRatio="xMidYMax slice"
          className="w-full h-full block overflow-hidden"
          role="img"
          aria-label="Illustration showing the 5 steps of PolyLance Zenith milestone escrow ascending toward Zenith"
        >
          <defs>
            <clipPath id="ascent-panel-clip">
              <rect x="0" y="0" width={SVG_VIEW_WIDTH} height={SVG_VIEW_HEIGHT} />
            </clipPath>
            <pattern
              id="storm-rain-pattern"
              width="36"
              height="64"
              patternUnits="userSpaceOnUse"
            >
              <line x1="12" y1="4" x2="6" y2="26" stroke="#C9D3D9" strokeWidth="1" strokeOpacity="0.22" />
              <line x1="30" y1="22" x2="24" y2="46" stroke="#C9D3D9" strokeWidth="1" strokeOpacity="0.18" />
              <line x1="20" y1="42" x2="14" y2="62" stroke="#C9D3D9" strokeWidth="1" strokeOpacity="0.16" />
            </pattern>
          </defs>

          <g clipPath="url(#ascent-panel-clip)">
            {/* Sky Background */}
            <rect x="0" y="0" width={SVG_VIEW_WIDTH} height={SVG_VIEW_HEIGHT} fill={sceneColors.bg} />

            {/* Subtle Sun Arc Track */}
            <path
              d="M135,172 Q264,76 392,104"
              fill="none"
              stroke={sceneColors.sunTrack}
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />

            {/* Sun / Eclipse Orb (re-renders independently via useSunProgress) */}
            <SunOrb isStorm={isStorm} />

            {/* Cloud Layer 1 (Slowest: 120s Storm / 48s Light) — 1/10 active */}
            <g data-ambient="cloud-slow" className="anim-cloud-slow">
              <path
                d="M-20,66 Q45,34 115,58 Q185,26 265,56 Q335,28 415,54 Q490,26 580,58 L580,0 L-20,0 Z"
                fill={sceneColors.cloudSlow}
                fillOpacity={isStorm ? 0.96 : 0.85}
              />
            </g>

            {/* Cloud Layer 2 (Mid: 80s Storm / 36s Light) — 2/10 active */}
            <g data-ambient="cloud-mid" className="anim-cloud-mid">
              <path
                d="M18,74 Q85,46 155,70 Q218,48 286,74 L286,88 L18,88 Z"
                fill={sceneColors.cloudMid}
                fillOpacity={isStorm ? 0.94 : 0.9}
              />
              <path
                d="M310,64 Q382,36 456,62 Q518,40 572,66 L572,82 L310,82 Z"
                fill={sceneColors.cloudMid}
                fillOpacity={isStorm ? 0.94 : 0.9}
              />
            </g>

            {/* Cloud Layer 3 (Near fast: 55s Storm / 28s Light) — 3/10 active */}
            <g data-ambient="cloud-fast" className="anim-cloud-fast">
              <rect x="64" y="68" width="96" height="22" rx="11" fill={sceneColors.cloudFast} fillOpacity={isStorm ? 0.85 : 0.92} />
              <circle cx="96" cy="68" r="14" fill={sceneColors.cloudFast} fillOpacity={isStorm ? 0.85 : 0.92} />
              <circle cx="126" cy="64" r="17" fill={sceneColors.cloudFast} fillOpacity={isStorm ? 0.85 : 0.92} />

              <rect x="404" y="56" width="98" height="20" rx="10" fill={sceneColors.cloudFast} fillOpacity={isStorm ? 0.85 : 0.92} />
              <circle cx="436" cy="56" r="14" fill={sceneColors.cloudFast} fillOpacity={isStorm ? 0.85 : 0.92} />
              <circle cx="468" cy="54" r="16" fill={sceneColors.cloudFast} fillOpacity={isStorm ? 0.85 : 0.92} />
            </g>

            {/* Cloud-shadow ridge behind main summit for crisp dramatic depth */}
            <polygon points="240,340 388,136 530,340" fill={sceneColors.summitShadow} />

            {/* Lightning Bolt + Clipped Panel Flash Overlay (Storm strike only, 120ms/250ms) */}
            {isStorm && strikeState && (
              <g aria-hidden="true">
                <rect
                  x="0"
                  y="0"
                  width={SVG_VIEW_WIDTH}
                  height={SVG_VIEW_HEIGHT}
                  fill="#D8F7DC"
                  className="anim-storm-panel-flash"
                />
                <path
                  key={strikeState.id}
                  d={LIGHTNING_BOLTS[strikeState.boltIdx]}
                  fill="#D8F7DC"
                  className="anim-storm-bolt"
                />
              </g>
            )}

            {/* Birds soaring in upper sky (rendered subtle in light, muted silhouette in storm) */}
            <g
              data-ambient="bird-a"
              className="anim-bird-a"
              fill="none"
              stroke={isStorm ? '#8E9DA7' : '#64748B'}
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <path d="M90,118 Q96,112 102,118 Q108,112 114,118" />
              <path d="M124,128 Q128,123 133,128 Q138,123 142,128" />
            </g>

            {/* Far Mountain Range */}
            <polygon points="-20,380 120,256 260,360 360,290 580,380 580,440 -20,440" fill={sceneColors.farRidge} />

            {/* Mid Mountain Peak & Ridge */}
            <polygon points="80,440 245,232 392,152 565,365 565,440" fill={sceneColors.midRidge} />

            {/* Zenith Summit Peak Massif */}
            <polygon points="260,440 392,152 540,365 540,440" fill={sceneColors.peakBody} />
            {/* Flat 2-tone snow / ice cap facet on summit */}
            <polygon points="392,152 346,214 374,206 392,222 418,204 438,212" fill={sceneColors.peakFacet} fillOpacity={isStorm ? 0.92 : 0.95} />

            {/* Near Emerald / Cobalt Hills */}
            <polygon points="-20,440 40,320 190,298 315,382 475,332 580,390 580,440" fill={sceneColors.nearHill} />

            {/* Alpine Lake (Mid-bottom right) */}
            <ellipse cx="458" cy="396" rx="68" ry="15" fill={sceneColors.lake} />
            <g data-ambient="lake-shimmer" className="anim-lake-shimmer">
              <line x1="424" y1="394" x2="482" y2="394" stroke={sceneColors.lakeShimmer} strokeWidth="2" strokeLinecap="round" />
              <line x1="440" y1="400" x2="496" y2="400" stroke={sceneColors.lakeShimmer} strokeWidth="1.5" strokeLinecap="round" />
            </g>

            {/* Foreground Dark Ridge & Pines */}
            <polygon points="-20,440 0,384 150,364 295,412 435,388 580,418 580,440" fill={sceneColors.foreground} />
            <g data-ambient="pine-sway-left" className="anim-pine-sway">
              <polygon points="34,394 46,350 58,394" fill={sceneColors.pine} />
              <polygon points="54,398 64,362 74,398" fill={sceneColors.pine} />
              <polygon points="72,392 80,364 88,392" fill={sceneColors.pine} />
            </g>

            {/* Storm Mist Layers (Drifting flat bands inside clipPath, Storm only) */}
            {isStorm && (
              <>
                <g data-ambient="storm-mist-a" className="anim-storm-mist-a">
                  <path
                    d="M-30,292 Q90,278 210,290 Q320,302 440,288 L590,294 L590,322 L-30,322 Z"
                    fill="#8E9DA7"
                  />
                </g>
                <g data-ambient="storm-mist-b" className="anim-storm-mist-b">
                  <path
                    d="M-20,356 Q120,342 260,356 Q410,368 580,350 L580,378 L-20,378 Z"
                    fill="#8E9DA7"
                  />
                </g>

                {/* Seamless Clipped Diagonal Rain (1.2s GPU transform loop, Storm only) */}
                <g data-ambient="storm-rain">
                  <rect
                    x="-40"
                    y="-80"
                    width={SVG_VIEW_WIDTH + 96}
                    height={SVG_VIEW_HEIGHT + 160}
                    fill="url(#storm-rain-pattern)"
                    className="anim-storm-rain"
                  />
                </g>
              </>
            )}

            {/* Summit Pulse Halo */}
            <circle
              data-ambient="summit-pulse"
              cx={WAYPOINTS[4].svgX}
              cy={WAYPOINTS[4].svgY}
              r="18"
              fill={sceneColors.beacon}
              fillOpacity="0.22"
              className="anim-summit-pulse"
            />

            {/* Climbing Dotted Trail */}
            {TRAIL_DOTS.map((dot, idx) => (
              <circle
                key={idx}
                cx={dot.cx}
                cy={dot.cy}
                r="2.1"
                fill={sceneColors.trailDot}
                fillOpacity={isStorm ? 0.72 : 0.65}
              />
            ))}

            {/* Animated Climbing Coin Disc (Only re-renders on "Play journey") */}
            <g transform={`translate(${climberPoint.cx}, ${climberPoint.cy})`}>
              <circle
                cx="0"
                cy="0"
                r="7.5"
                fill={sceneColors.coinFill}
                stroke={sceneColors.coinRing}
                strokeWidth="2.5"
              />
            </g>
          </g>
        </svg>

        {/* Crisp 1px Leader Lines Overlay (Desktop / >= 480px panel width only) */}
        {!isCompactMobile && (
          <svg
            width={panelSize.width}
            height={panelSize.height}
            viewBox={`0 0 ${panelSize.width} ${panelSize.height}`}
            className="pointer-events-none absolute inset-0 w-full h-full"
            aria-hidden="true"
          >
            {placements.map((p) => (
              <line
                key={p.id}
                data-leader-line={p.id}
                x1={p.leaderLine.x1}
                y1={p.leaderLine.y1}
                x2={p.leaderLine.x2}
                y2={p.leaderLine.y2}
                stroke={sceneColors.leaderLine}
                strokeOpacity={activeWaypoint?.id === p.id || conceptWpId === p.id ? 0.95 : 0.55}
                strokeWidth="1"
              />
            ))}
          </svg>
        )}

        {/* Waypoint Marker Buttons (Always positioned at exact marker center coordinates) */}
        {WAYPOINTS.map((wp) => {
          const px = toPx(wp.svgX, wp.svgY);
          const isHighlighted = activeWaypoint?.id === wp.id || conceptWpId === wp.id;
          return (
            <button
              key={wp.id}
              type="button"
              data-waypoint-marker={wp.id}
              aria-label={`Step ${wp.id}: ${wp.label}`}
              aria-pressed={activeWaypoint?.id === wp.id}
              onClick={() => handleSelectWaypoint(wp)}
              style={{
                left: `${px.x}px`,
                top: `${px.y}px`,
                backgroundColor: isHighlighted ? sceneColors.ringStroke : sceneColors.ringFill,
                borderColor: sceneColors.ringStroke,
                color: isHighlighted ? (isStorm ? '#0A0E11' : '#FFFFFF') : sceneColors.ringText,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[11px] font-extrabold font-tabular cursor-pointer transition-colors shadow-xs z-20"
            >
              {wp.id}
            </button>
          );
        })}

        {/* Floating Non-Overlapping Label Pills (>= 480px panel width) */}
        {!isCompactMobile &&
          WAYPOINTS.map((wp) => {
            const placed = placements.find((p) => p.id === wp.id);
            const isHighlighted = activeWaypoint?.id === wp.id || conceptWpId === wp.id;
            const left = placed ? placed.pillRect.x1 : 24;
            const top = placed ? placed.pillRect.y1 : 24;

            return (
              <button
                key={`pill-${wp.id}`}
                ref={(el) => {
                  pillMeasureRefs.current[wp.id] = el;
                }}
                type="button"
                data-waypoint-label={wp.id}
                onClick={() => handleSelectWaypoint(wp)}
                style={{
                  left: `${left}px`,
                  top: `${top}px`,
                }}
                className={`absolute z-10 h-7 px-2.5 rounded-full border text-[11.5px] font-bold tracking-tight whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isHighlighted
                    ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                    : 'bg-[var(--surface)] text-[var(--text)] border-[var(--hairline)] hover:border-[var(--brand-text)]'
                }`}
              >
                <span
                  className="text-[10px] font-extrabold font-tabular"
                  style={{
                    color: isHighlighted ? '#FFFFFF' : 'var(--brand-text)',
                  }}
                >
                  {wp.id}.
                </span>
                <span>{wp.label}</span>
              </button>
            );
          })}

        {/* Hidden measurer pills on compact screens so resize transition stays instantaneous */}
        {isCompactMobile && (
          <div className="sr-only" aria-hidden="true">
            {WAYPOINTS.map((wp) => (
              <button
                key={`measure-${wp.id}`}
                ref={(el) => {
                  pillMeasureRefs.current[wp.id] = el;
                }}
                type="button"
                tabIndex={-1}
                className="h-7 px-2.5 text-[11.5px] font-bold whitespace-nowrap"
              >
                {wp.id}. {wp.label}
              </button>
            ))}
          </div>
        )}

        {/* Bottom-Left Controls: Play journey (+ optional Storm strike shortcut icon on hover? Keep crisp!) */}
        <div className="absolute bottom-3.5 left-4 z-30 flex items-center gap-2">
          <button
            type="button"
            onClick={handlePlayJourney}
            className="h-8 px-3.5 rounded-full bg-[var(--surface)] border border-[var(--hairline)] text-[12px] font-semibold text-[var(--text)] hover:border-[var(--brand-text)] inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {isPlayingJourney ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 text-[var(--brand-text)] animate-spin" aria-hidden="true" />
                <span>Climbing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[var(--brand-text)] fill-current" aria-hidden="true" />
                <span>Play journey</span>
              </>
            )}
          </button>

          {isStorm && (
            <button
              type="button"
              onClick={() => triggerLightning(false)}
              aria-label="Trigger summit lightning strike"
              title="Trigger summit lightning"
              className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--hairline)] text-[var(--green-300)] hover:border-[var(--green-300)] inline-flex items-center justify-center cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Bottom-Right Ambient Pause Toggle (Explicit label, persisted in sessionStorage) */}
        <button
          type="button"
          onClick={togglePause}
          aria-pressed={isPausedByUser}
          aria-label={isPausedByUser ? 'Resume scene motion' : 'Pause scene motion'}
          className="absolute bottom-3.5 right-4 z-30 h-8 w-8 rounded-full bg-[var(--surface)] border border-[var(--hairline)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--brand-text)] flex items-center justify-center cursor-pointer shadow-xs"
        >
          {isPausedByUser ? (
            <Sun className="w-3.5 h-3.5 text-[var(--brand-text)]" aria-hidden="true" />
          ) : (
            <Pause className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Compact Tappable 5-Item Legend Strip (< 480px panel width) */}
      {isCompactMobile && (
        <div
          data-mobile-waypoint-legend="true"
          className="grid grid-cols-2 sm:grid-cols-3 gap-1.5"
        >
          {WAYPOINTS.map((wp) => {
            const isSelected = activeWaypoint?.id === wp.id || conceptWpId === wp.id;
            return (
              <button
                key={`legend-${wp.id}`}
                type="button"
                data-waypoint-legend-item={wp.id}
                onClick={() => handleSelectWaypoint(wp)}
                className={`px-2.5 py-2 rounded-xl border text-left text-[11.5px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[var(--brand)] text-white border-[var(--brand)]'
                    : 'bg-[var(--surface)] text-[var(--text)] border-[var(--hairline)]'
                }`}
              >
                <span
                  className="font-extrabold font-tabular shrink-0"
                  style={{ color: isSelected ? '#FFFFFF' : 'var(--brand-text)' }}
                >
                  {wp.id}.
                </span>
                <span className="truncate">{wp.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * PolyLance Countdown Engine
 * 
 * Server-authoritative, drift-free, resilient countdown logic.
 * Immune to user device clock tampering, background tab throttling, and laptop sleep.
 */

import { REVEAL_AT_UTC } from '../config';

export interface CountdownUnits {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalRemainingMs: number;
  isLive: boolean;
}

export interface CountdownState {
  units: CountdownUnits;
  usingDeviceClock: boolean;
  lastSyncedAt: number | null;
  serverOffsetMs: number;
  accessibleSummary: string;
}

/**
 * Pure countdown unit calculation.
 * Clamps at zero, never returns NaN or negative numbers.
 */
export function computeCountdownUnits(targetUtcMs: number, currentNowMs: number): CountdownUnits {
  if (isNaN(targetUtcMs) || isNaN(currentNowMs)) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalRemainingMs: 0,
      isLive: true,
    };
  }

  const diff = targetUtcMs - currentNowMs;
  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalRemainingMs: 0,
      isLive: true,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalRemainingMs: diff,
    isLive: false,
  };
}

/**
 * Generates an accessible screen-reader summary
 */
export function formatAccessibleSummary(units: CountdownUnits): string {
  if (units.isLive) {
    return "The new PolyLance UI is now live on polylancezenith.com.";
  }
  const dayStr = units.days === 1 ? "1 day" : `${units.days} days`;
  const hrStr = units.hours === 1 ? "1 hour" : `${units.hours} hours`;
  const minStr = units.minutes === 1 ? "1 minute" : `${units.minutes} minutes`;
  return `PolyLance reveal countdown: ${dayStr}, ${hrStr}, and ${minStr} remaining until December 17, 2026.`;
}

export interface ServerSyncResult {
  serverNow: number;
  serverOffset: number;
  rtt: number;
  usingDeviceClock: boolean;
}

/**
 * Performs a HEAD request to origin with no-store to read the HTTP Date header.
 * Uses round-trip time (rtt / 2) to accurately sync with the server clock.
 */
export async function fetchServerTime(
  fetchFn: typeof fetch = fetch,
  origin: string = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
): Promise<ServerSyncResult> {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const wallStartTime = Date.now();

  try {
    const res = await fetchFn(origin + "/", {
      method: "HEAD",
      cache: "no-store",
    });

    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const rtt = Math.max(0, endTime - startTime);

    const dateHeader = res.headers.get("Date");
    if (!dateHeader) {
      throw new Error("Missing HTTP Date header in response");
    }

    const serverHeaderDate = new Date(dateHeader).getTime();
    if (isNaN(serverHeaderDate)) {
      throw new Error("Invalid Date header value");
    }

    // Accurate server time is the timestamp plus half of the round trip time
    const serverNow = serverHeaderDate + rtt / 2;
    const serverOffset = serverNow - wallStartTime;

    return {
      serverNow,
      serverOffset,
      rtt,
      usingDeviceClock: false,
    };
  } catch {
    // Fall back to device clock
    return {
      serverNow: wallStartTime,
      serverOffset: 0,
      rtt: 0,
      usingDeviceClock: true,
    };
  }
}

/**
 * Checks for QA-only preview override: ?previewMs=...
 * Honored ONLY in DEV mode (never in production builds).
 */
export function getQAPreviewOverrideMs(): number | null {
  if (typeof window === 'undefined') return null;
  // Strictly in DEV mode only
  if (!import.meta.env?.DEV) return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const val = params.get('previewMs');
    if (val !== null) {
      const num = Number(val);
      if (!isNaN(num) && num >= 0) {
        return num;
      }
    }
  } catch {
    // Ignore any search param parsing error
  }
  return null;
}

/**
 * Countdown Engine Controller
 * Manages monotonic time tracking, sync intervals, tab visibility, and second-aligned ticks.
 */
export class CountdownEngine {
  private targetUtcMs: number;
  private serverOffsetMs: number = 0;
  private syncServerTime: number = 0;
  private syncPerfTime: number = 0;
  private usingDeviceClock: boolean = false;
  private lastSyncedAt: number | null = null;
  private isDestroyed: boolean = false;

  private tickTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private resyncIntervalId: ReturnType<typeof setInterval> | null = null;

  private onStateChange: (state: CountdownState) => void;
  private lastSummaryMinute: number = -1;
  private cachedSummary: string = "";

  // QA override offset
  private qaOverrideRemainingMs: number | null = null;
  private qaOverrideStartTime: number = 0;

  constructor(
    targetUtc: string = REVEAL_AT_UTC,
    onStateChange: (state: CountdownState) => void
  ) {
    this.targetUtcMs = new Date(targetUtc).getTime();
    this.onStateChange = onStateChange;

    const qaMs = getQAPreviewOverrideMs();
    if (qaMs !== null) {
      this.qaOverrideRemainingMs = qaMs;
      this.qaOverrideStartTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    }
  }

  public async start(): Promise<void> {
    if (this.isDestroyed) return;

    // Initial sync
    await this.syncTime();

    if (this.isDestroyed) return;

    // Attach visibility & network listeners
    if (typeof document !== 'undefined') {
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener("online", this.handleOnline);
    }

    // Resync every 5 minutes (300,000 ms)
    this.resyncIntervalId = setInterval(() => {
      this.syncTime();
    }, 5 * 60 * 1000);

    // Initial tick
    this.tick();
  }

  public destroy(): void {
    this.isDestroyed = true;
    if (this.tickTimeoutId !== null) {
      clearTimeout(this.tickTimeoutId);
      this.tickTimeoutId = null;
    }
    if (this.resyncIntervalId !== null) {
      clearInterval(this.resyncIntervalId);
      this.resyncIntervalId = null;
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener("online", this.handleOnline);
    }
  }

  /**
   * Calculates the current authoritative server time.
   * Between syncs, uses monotonic performance.now() so changing device clock has zero effect.
   */
  public getCurrentNow(): number {
    if (this.syncPerfTime > 0 && typeof performance !== 'undefined') {
      const elapsed = performance.now() - this.syncPerfTime;
      return this.syncServerTime + elapsed;
    }
    return Date.now() + this.serverOffsetMs;
  }

  public async syncTime(): Promise<void> {
    const result = await fetchServerTime();
    if (this.isDestroyed) return;

    this.serverOffsetMs = result.serverOffset;
    this.usingDeviceClock = result.usingDeviceClock;
    this.lastSyncedAt = Date.now();

    this.syncServerTime = result.serverNow;
    this.syncPerfTime = typeof performance !== 'undefined' ? performance.now() : 0;

    // Force an immediate recalculation
    this.tick();
  }

  private handleVisibilityChange = (): void => {
    if (typeof document === 'undefined') return;

    if (document.visibilityState === 'visible') {
      // Laptop woke up or tab became visible: re-sync and tick immediately
      this.syncTime();
      this.tick();
    } else {
      // Tab is hidden: pause tick timeouts to avoid useless render overhead
      if (this.tickTimeoutId !== null) {
        clearTimeout(this.tickTimeoutId);
        this.tickTimeoutId = null;
      }
    }
  };

  private handleOnline = (): void => {
    this.syncTime();
  };

  /**
   * Precise tick loop aligned to whole-second boundaries
   */
  public tick = (): void => {
    if (this.isDestroyed) return;

    let units: CountdownUnits;

    // Handle QA preview override if active in DEV
    if (this.qaOverrideRemainingMs !== null) {
      const nowPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const elapsed = nowPerf - this.qaOverrideStartTime;
      const remaining = Math.max(0, this.qaOverrideRemainingMs - elapsed);
      units = computeCountdownUnits(remaining, 0);
    } else {
      const now = this.getCurrentNow();
      units = computeCountdownUnits(this.targetUtcMs, now);
    }

    // Update accessible summary once per minute or upon reaching live state
    const currentMinute = Math.floor(units.totalRemainingMs / 60000);
    if (currentMinute !== this.lastSummaryMinute || units.isLive || this.cachedSummary === "") {
      this.lastSummaryMinute = currentMinute;
      this.cachedSummary = formatAccessibleSummary(units);
    }

    const state: CountdownState = {
      units,
      usingDeviceClock: this.usingDeviceClock,
      lastSyncedAt: this.lastSyncedAt,
      serverOffsetMs: this.serverOffsetMs,
      accessibleSummary: this.cachedSummary,
    };

    this.onStateChange(state);

    if (units.isLive) {
      // Reached zero: stop timer, don't schedule next tick
      if (this.tickTimeoutId !== null) {
        clearTimeout(this.tickTimeoutId);
        this.tickTimeoutId = null;
      }
      return;
    }

    // If tab is currently hidden, don't schedule ticking loop until tab becomes visible
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return;
    }

    // Align to the next whole-second boundary
    const now = this.getCurrentNow();
    const remainderInSecond = now % 1000;
    const msToNextSecond = Math.max(20, 1000 - remainderInSecond);

    this.tickTimeoutId = setTimeout(this.tick, msToNextSecond);
  };
}

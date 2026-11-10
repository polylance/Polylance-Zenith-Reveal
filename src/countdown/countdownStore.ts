import { useSyncExternalStore } from 'react';
import {
  CountdownEngine,
  CountdownState,
  computeCountdownUnits,
  formatAccessibleSummary,
} from './countdownEngine';
import { REVEAL_AT_UTC, START_AT_UTC } from '../config';

export type CountdownPhase = 'normal' | 'under24h' | 'under60s' | 'live';

const targetUtcMs = new Date(REVEAL_AT_UTC).getTime();
const startUtcMs = new Date(START_AT_UTC).getTime();

function computeProgressPct(remainingMs: number, isLive: boolean): number {
  if (isLive || remainingMs <= 0) return 100;
  const total = targetUtcMs - startUtcMs;
  if (total <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round(((total - remainingMs) / total) * 1000) / 10));
}

// Safe deterministic initial state for SSR / first paint
const defaultUnits = computeCountdownUnits(
  targetUtcMs,
  typeof window !== 'undefined' ? Date.now() : new Date('2026-11-10T12:00:00Z').getTime()
);

let currentState: CountdownState = {
  units: defaultUnits,
  usingDeviceClock: false,
  lastSyncedAt: null,
  serverOffsetMs: 0,
  accessibleSummary: formatAccessibleSummary(defaultUnits),
};

export function getPhaseFromRemaining(totalRemainingMs: number, isLive: boolean): CountdownPhase {
  if (isLive || totalRemainingMs <= 0) return 'live';
  if (totalRemainingMs < 60000) return 'under60s';
  if (totalRemainingMs < 86400000) return 'under24h';
  return 'normal';
}

let currentPhase: CountdownPhase = getPhaseFromRemaining(
  defaultUnits.totalRemainingMs,
  defaultUnits.isLive
);

const listeners = new Set<() => void>();
const phaseListeners = new Set<() => void>();
const sunListeners = new Set<() => void>();

let currentSunProgress: number = computeProgressPct(
  defaultUnits.totalRemainingMs,
  defaultUnits.isLive
);
let lastSunUpdateAt = 0;
let engineInstance: CountdownEngine | null = null;

function ensureEngineStarted() {
  if (typeof window === 'undefined') return;
  if (engineInstance) return;

  engineInstance = new CountdownEngine(REVEAL_AT_UTC, (newState) => {
    currentState = newState;
    const nextPhase = getPhaseFromRemaining(
      newState.units.totalRemainingMs,
      newState.units.isLive
    );

    listeners.forEach((l) => l());

    const nowMs = Date.now();
    const nextSun = computeProgressPct(newState.units.totalRemainingMs, newState.units.isLive);
    const phaseChanged = nextPhase !== currentPhase;

    if (phaseChanged) {
      currentPhase = nextPhase;
      phaseListeners.forEach((l) => l());
    }

    // Update sun progress on initial sync, phase change, or once every 60s
    if (lastSunUpdateAt === 0 || phaseChanged || nowMs - lastSunUpdateAt >= 60000) {
      lastSunUpdateAt = nowMs;
      if (nextSun !== currentSunProgress || phaseChanged) {
        currentSunProgress = nextSun;
        sunListeners.forEach((l) => l());
      }
    }
  });

  engineInstance.start();
}

function subscribe(listener: () => void) {
  ensureEngineStarted();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CountdownState {
  return currentState;
}

function subscribePhase(listener: () => void) {
  ensureEngineStarted();
  phaseListeners.add(listener);
  return () => {
    phaseListeners.delete(listener);
  };
}

function getPhaseSnapshot(): CountdownPhase {
  return currentPhase;
}

/**
 * Subscribe to 1-second countdown ticks.
 * ONLY use in leaf digit/countdown display components — NEVER in App or 3D wrappers.
 */
export function useCountdownTick(): CountdownState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function subscribeSun(listener: () => void) {
  ensureEngineStarted();
  sunListeners.add(listener);
  return () => {
    sunListeners.delete(listener);
  };
}

function getSunSnapshot(): number {
  return currentSunProgress;
}

/**
 * Subscribe ONLY to phase transitions ('normal' | 'under24h' | 'under60s' | 'live').
 * Prevents parent/3D components from re-rendering every second.
 */
export function useCountdownPhase(): CountdownPhase {
  return useSyncExternalStore(subscribePhase, getPhaseSnapshot, getPhaseSnapshot);
}

/**
 * Low-frequency (60s) subscription for Sun progress percentage (0..100).
 */
export function useSunProgress(): number {
  return useSyncExternalStore(subscribeSun, getSunSnapshot, getSunSnapshot);
}


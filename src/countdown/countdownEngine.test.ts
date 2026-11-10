import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  computeCountdownUnits,
  formatAccessibleSummary,
  fetchServerTime,
  CountdownEngine,
  CountdownState,
} from './countdownEngine';

describe('Countdown Engine - computeCountdownUnits', () => {
  it('correctly calculates days, hours, minutes, seconds for a normal future countdown', () => {
    // 2 days, 3 hours, 4 minutes, 5 seconds = (2*86400 + 3*3600 + 4*60 + 5) * 1000 ms
    const diffMs = (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000;
    const now = 1700000000000;
    const target = now + diffMs;

    const units = computeCountdownUnits(target, now);

    expect(units.days).toBe(2);
    expect(units.hours).toBe(3);
    expect(units.minutes).toBe(4);
    expect(units.seconds).toBe(5);
    expect(units.totalRemainingMs).toBe(diffMs);
    expect(units.isLive).toBe(false);
  });

  it('handles exactly zero boundary without negative values or NaN', () => {
    const timestamp = 1700000000000;
    const units = computeCountdownUnits(timestamp, timestamp);

    expect(units.days).toBe(0);
    expect(units.hours).toBe(0);
    expect(units.minutes).toBe(0);
    expect(units.seconds).toBe(0);
    expect(units.totalRemainingMs).toBe(0);
    expect(units.isLive).toBe(true);
  });

  it('handles already past dates cleanly (clamped to 0, isLive = true)', () => {
    const target = 1700000000000;
    const now = target + 500000; // 500 seconds past

    const units = computeCountdownUnits(target, now);

    expect(units.days).toBe(0);
    expect(units.hours).toBe(0);
    expect(units.minutes).toBe(0);
    expect(units.seconds).toBe(0);
    expect(units.totalRemainingMs).toBe(0);
    expect(units.isLive).toBe(true);
  });

  it('handles invalid inputs gracefully without throwing or NaN', () => {
    const units = computeCountdownUnits(NaN, 1700000000000);
    expect(units.days).toBe(0);
    expect(units.hours).toBe(0);
    expect(units.minutes).toBe(0);
    expect(units.seconds).toBe(0);
    expect(units.totalRemainingMs).toBe(0);
    expect(units.isLive).toBe(true);
  });
});

describe('Countdown Engine - formatAccessibleSummary', () => {
  it('formats human readable summary with proper pluralization', () => {
    const summary = formatAccessibleSummary({
      days: 37,
      hours: 14,
      minutes: 22,
      seconds: 10,
      totalRemainingMs: 3246130000,
      isLive: false,
    });
    expect(summary).toBe(
      'PolyLance reveal countdown: 37 days, 14 hours, and 22 minutes remaining until December 17, 2026.'
    );
  });

  it('formats live state correctly', () => {
    const summary = formatAccessibleSummary({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalRemainingMs: 0,
      isLive: true,
    });
    expect(summary).toBe('The new PolyLance UI is now live on polylancezenith.com.');
  });
});

describe('Server Time Synchronization (fetchServerTime)', () => {
  it('computes accurate server time incorporating RTT and returns serverOffset', async () => {
    const fakeServerDateString = 'Tue, 10 Nov 2026 04:00:00 GMT';
    const serverHeaderTimestamp = new Date(fakeServerDateString).getTime();

    const mockFetch = vi.fn().mockImplementation(async () => {
      // simulate 40ms network round-trip delay
      return {
        headers: {
          get: (headerName: string) => (headerName.toLowerCase() === 'date' ? fakeServerDateString : null),
        },
      } as unknown as Response;
    });

    const result = await fetchServerTime(mockFetch, 'https://polylance.codes');

    expect(result.usingDeviceClock).toBe(false);
    expect(result.serverNow).toBeGreaterThanOrEqual(serverHeaderTimestamp);
  });

  it('falls back to device clock when network request fails or Date header is missing', async () => {
    const mockFailingFetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const before = Date.now();
    const result = await fetchServerTime(mockFailingFetch, 'https://polylance.codes');
    const after = Date.now();

    expect(result.usingDeviceClock).toBe(true);
    expect(result.serverOffset).toBe(0);
    expect(result.serverNow).toBeGreaterThanOrEqual(before);
    expect(result.serverNow).toBeLessThanOrEqual(after);
  });
});

describe('CountdownEngine - Offset, Sleep, and Clock Tampering', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('correctly adjusts countdown when user device clock is 1 day ahead (simulated offset)', async () => {
    // True server time is Nov 10, 2026 10:00:00 UTC
    const trueServerTimestamp = new Date('2026-11-10T10:00:00Z').getTime();
    const revealTarget = '2026-12-16T18:30:00Z';
    const targetMs = new Date(revealTarget).getTime();

    // User's device is set 1 day in the future (Nov 11)
    const deviceTime1DayAhead = trueServerTimestamp + 86400000;
    vi.setSystemTime(deviceTime1DayAhead);

    // Mock fetch returning true server time via Date header
    const mockServerDateString = new Date(trueServerTimestamp).toUTCString();
    globalThis.fetch = vi.fn().mockResolvedValue({
      headers: {
        get: (h: string) => (h.toLowerCase() === 'date' ? mockServerDateString : null),
      },
    } as unknown as Response);

    let latestState: CountdownState | null = null;
    const engine = new CountdownEngine(revealTarget, (state) => {
      latestState = state;
    });

    await engine.start();

    // Expected remaining time is targetMs - trueServerTimestamp, NOT targetMs - deviceTime1DayAhead
    const expectedRemaining = targetMs - trueServerTimestamp;
    const expectedUnits = computeCountdownUnits(targetMs, trueServerTimestamp);

    expect(latestState).not.toBeNull();
    expect(latestState!.usingDeviceClock).toBe(false);
    expect(latestState!.units.days).toBe(expectedUnits.days);
    expect(latestState!.units.hours).toBe(expectedUnits.hours);
    expect(latestState!.units.minutes).toBe(expectedUnits.minutes);

    engine.destroy();
  });

  it('correctly adjusts countdown when user device clock is 1 day behind', async () => {
    const trueServerTimestamp = new Date('2026-11-10T10:00:00Z').getTime();
    const revealTarget = '2026-12-16T18:30:00Z';
    const targetMs = new Date(revealTarget).getTime();

    // User's device is set 1 day in the past (Nov 9)
    const deviceTime1DayBehind = trueServerTimestamp - 86400000;
    vi.setSystemTime(deviceTime1DayBehind);

    const mockServerDateString = new Date(trueServerTimestamp).toUTCString();
    globalThis.fetch = vi.fn().mockResolvedValue({
      headers: {
        get: (h: string) => (h.toLowerCase() === 'date' ? mockServerDateString : null),
      },
    } as unknown as Response);

    let latestState: CountdownState | null = null;
    const engine = new CountdownEngine(revealTarget, (state) => {
      latestState = state;
    });

    await engine.start();

    const expectedUnits = computeCountdownUnits(targetMs, trueServerTimestamp);

    expect(latestState).not.toBeNull();
    expect(latestState!.usingDeviceClock).toBe(false);
    expect(latestState!.units.days).toBe(expectedUnits.days);
    expect(latestState!.units.hours).toBe(expectedUnits.hours);
    expect(latestState!.units.minutes).toBe(expectedUnits.minutes);

    engine.destroy();
  });

  it('stops ticking and remains in live state once reveal date is reached', async () => {
    // Reveal date is now
    const now = Date.now();
    const targetIso = new Date(now - 1000).toISOString(); // 1 second in the past

    globalThis.fetch = vi.fn().mockResolvedValue({
      headers: {
        get: () => new Date(now).toUTCString(),
      },
    } as unknown as Response);

    let latestState: CountdownState | null = null;
    const engine = new CountdownEngine(targetIso, (state) => {
      latestState = state;
    });

    await engine.start();

    expect(latestState).not.toBeNull();
    expect(latestState!.units.isLive).toBe(true);
    expect(latestState!.units.totalRemainingMs).toBe(0);

    engine.destroy();
  });
});


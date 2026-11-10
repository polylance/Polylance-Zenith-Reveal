import { describe, it, expect, vi } from 'vitest';
import { CountdownEngine, CountdownState } from './countdownEngine';
import { REVEAL_AT_UTC } from '../config';

describe('Verification: Clock 1 Day Ahead vs 1 Day Behind Produces Identical Countdown', () => {
  const trueServerUtc = '2026-11-10T04:00:00Z';
  const trueServerTimestamp = new Date(trueServerUtc).getTime();
  const mockDateHeader = new Date(trueServerTimestamp).toUTCString();

  it('proves countdown remaining time is exactly identical regardless of device clock displacement', async () => {
    // 1. Device clock is 1 day ahead
    vi.useFakeTimers();
    vi.setSystemTime(trueServerTimestamp + 86400000); // 1 day ahead
    globalThis.fetch = vi.fn().mockResolvedValue({
      headers: {
        get: (h: string) => (h.toLowerCase() === 'date' ? mockDateHeader : null),
      },
    } as unknown as Response);

    let stateAhead: CountdownState | null = null;
    const engineAhead = new CountdownEngine(REVEAL_AT_UTC, (state) => {
      stateAhead = state;
    });
    await engineAhead.start();

    // 2. Device clock is 1 day behind
    vi.setSystemTime(trueServerTimestamp - 86400000); // 1 day behind
    let stateBehind: CountdownState | null = null;
    const engineBehind = new CountdownEngine(REVEAL_AT_UTC, (state) => {
      stateBehind = state;
    });
    await engineBehind.start();

    // Compare
    expect(stateAhead).not.toBeNull();
    expect(stateBehind).not.toBeNull();

    expect(stateAhead!.units.days).toBe(stateBehind!.units.days);
    expect(stateAhead!.units.hours).toBe(stateBehind!.units.hours);
    expect(stateAhead!.units.minutes).toBe(stateBehind!.units.minutes);
    expect(stateAhead!.units.seconds).toBe(stateBehind!.units.seconds);
    expect(stateAhead!.units.isLive).toBe(stateBehind!.units.isLive);

    engineAhead.destroy();
    engineBehind.destroy();
    vi.useRealTimers();
  });
});


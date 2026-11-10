import { useState, useEffect } from 'react';
import { CountdownEngine, CountdownState, computeCountdownUnits, formatAccessibleSummary } from './countdownEngine';
import { REVEAL_AT_UTC } from '../config';

const targetUtcMs = new Date(REVEAL_AT_UTC).getTime();
const initialUnits = computeCountdownUnits(targetUtcMs, Date.now());

const initialState: CountdownState = {
  units: initialUnits,
  usingDeviceClock: false,
  lastSyncedAt: null,
  serverOffsetMs: 0,
  accessibleSummary: formatAccessibleSummary(initialUnits),
};

export function useCountdown(): CountdownState {
  const [state, setState] = useState<CountdownState>(initialState);

  useEffect(() => {
    const engine = new CountdownEngine(REVEAL_AT_UTC, (newState) => {
      setState(newState);
    });

    engine.start();

    return () => {
      engine.destroy();
    };
  }, []);

  return state;
}


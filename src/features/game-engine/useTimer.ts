import { useState, useEffect } from 'react';
import { useGameContext } from './useGameContext';

interface TimerState {
  elapsedMs: number;
  stationsPerMinute: number;
}

export function useTimer(): TimerState {
  const { state } = useGameContext();
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (state.status !== 'playing' || !state.startedAt) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      setElapsedMs(now - state.startedAt!);
    }, 100);

    return () => clearInterval(interval);
  }, [state.status, state.startedAt]);

  const elapsedSeconds = elapsedMs / 1000;
  const elapsedMinutes = elapsedSeconds / 60;
  const stationsPerMinute = elapsedMinutes > 0 ? state.correctCount / elapsedMinutes : 0;

  return { elapsedMs, stationsPerMinute };
}

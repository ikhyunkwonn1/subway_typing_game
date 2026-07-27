import { useMemo } from 'react';
import { useGameContext } from './useGameContext';

export function useAccuracy(): number {
  const { state } = useGameContext();

  return useMemo(() => {
    const totalAttempts = state.correctCount + state.incorrectAttempts;
    if (totalAttempts === 0) return 100;
    return Math.round((state.correctCount / totalAttempts) * 100);
  }, [state.correctCount, state.incorrectAttempts]);
}

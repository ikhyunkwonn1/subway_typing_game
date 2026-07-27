import { useEffect, useRef } from 'react';
import { LINES } from '../../data/lines';
import { useGameContext } from '../game-engine/useGameContext';
import { isCorrectMatch } from '../game-engine/matching';

export function useStationInputHandling() {
  const { state, dispatch } = useGameContext();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status !== 'playing' || !state.lineId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();

        const input = inputRef.current;
        if (!input) return;

        const line = LINES[state.lineId!];
        const currentStation = line.stations[state.currentIndex];

        if (!currentStation) return;

        const isCorrect = isCorrectMatch(input.value, currentStation);
        dispatch({
          type: 'SUBMIT_INPUT',
          payload: { correct: isCorrect },
        });
      }
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (input) {
        input.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [state.lineId, state.currentIndex, state.status, dispatch]);

  return inputRef;
}

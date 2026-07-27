import { LINES } from '../../data/lines';
import type { GameState, GameAction } from './gameTypes';
import { initialGameState } from './gameTypes';

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_LINE_AND_START': {
      
      return {
        ...initialGameState,
        status: 'playing',
        lineId: action.payload,
        currentIndex: 0,
        startedAt: Date.now(),
      };
    }

    case 'UPDATE_INPUT': {
      return {
        ...state,
        typedInput: action.payload,
      };
    }

    case 'SUBMIT_INPUT': {
      if (state.status !== 'playing' || !state.lineId) {
        return state;
      }

      const line = LINES[state.lineId];
      const isLastStation = state.currentIndex === line.stations.length - 1;

      if (action.payload.correct) {
        const newIndex = state.currentIndex + 1;
        const newCorrectCount = state.correctCount + 1;

        if (isLastStation) {
          return {
            ...state,
            currentIndex: newIndex,
            correctCount: newCorrectCount,
            typedInput: '',
            status: 'finished',
            finishedAt: Date.now(),
          };
        }

        return {
          ...state,
          currentIndex: newIndex,
          correctCount: newCorrectCount,
          typedInput: '',
        };
      } else {
        return {
          ...state,
          incorrectAttempts: state.incorrectAttempts + 1,
        };
      }
    }

    case 'RESTART': {
      return initialGameState;
    }

    default:
      return state;
  }
}

import type { LineId } from '../../data/types';

export type GameStatus = 'setup' | 'playing' | 'finished';

export interface GameState {
  status: GameStatus;
  lineId: LineId | null;
  currentIndex: number;
  typedInput: string;
  correctCount: number;
  incorrectAttempts: number;
  startedAt: number | null;
  finishedAt: number | null;
}

export type GameAction =
  | { type: 'SELECT_LINE_AND_START'; payload: LineId }
  | { type: 'UPDATE_INPUT'; payload: string }
  | { type: 'SUBMIT_INPUT'; payload: { correct: boolean } }
  | { type: 'RESTART' };

export const initialGameState: GameState = {
  status: 'setup',
  lineId: null,
  currentIndex: 0,
  typedInput: '',
  correctCount: 0,
  incorrectAttempts: 0,
  startedAt: null,
  finishedAt: null,
};

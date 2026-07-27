import { createContext, useReducer, ReactNode } from 'react';
import { gameReducer } from './gameReducer';
import { initialGameState } from './gameTypes';
import type { GameState, GameAction } from './gameTypes';

interface GameContextType {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

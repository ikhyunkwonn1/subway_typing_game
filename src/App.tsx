import React from 'react';
import { GameProvider } from './features/game-engine/GameProvider';
import { GameContext } from './features/game-engine/GameProvider';
import { LineSelectScreen } from './features/line-select/LineSelectScreen';
import { GameScreen } from './features/game-engine/GameScreen';
import { FinishedScreen } from './features/game-engine/FinishedScreen';

function AppContent() {
  const gameContext = React.useContext(GameContext);
  if (!gameContext) {
    throw new Error('AppContent must be used within GameProvider');
  }

  const { state } = gameContext;

  switch (state.status) {
    case 'setup':
      return <LineSelectScreen />;
    case 'playing':
      return <GameScreen />;
    case 'finished':
      return (
        <>
          <GameScreen />
          <FinishedScreen />
        </>
      );
    default:
      return <LineSelectScreen />;
  }
}

export function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

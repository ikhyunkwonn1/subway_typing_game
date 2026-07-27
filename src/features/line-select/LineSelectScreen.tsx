import { useState } from 'react';
import { LINE_IDS, LINES } from '../../data/lines';
import { useGameContext } from '../game-engine/useGameContext';
import { LineCard } from './LineCard';
import type { LineId } from '../../data/types';

export function LineSelectScreen() {
  const { dispatch } = useGameContext();
  const [selectedLine, setSelectedLine] = useState<LineId | null>(null);

  const handleStart = () => {
    if (!selectedLine) return;
    dispatch({
      type: 'SELECT_LINE_AND_START',
      payload: selectedLine,
    });
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-2">NYC Subway Typing</h1>
        <p className="text-xl text-gray-600">
          Type station names as you ride the rails
        </p>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-12">
        {LINE_IDS.map((lineId) => {
          const line = LINES[lineId];
          return (
            <LineCard
              key={lineId}
              line={line}
              selected={selectedLine === lineId}
              onClick={() => setSelectedLine(lineId)}
            />
          );
        })}
      </div>

      <button
        onClick={handleStart}
        disabled={!selectedLine}
        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg"
      >
        Start Game
      </button>
    </div>
  );
}

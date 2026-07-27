
import { LINES } from '../../data/lines';
import { useGameContext } from '../game-engine/useGameContext';
import { StationTile } from './StationTile';
import { TypingInput } from './TypingInput';

export function StationNavBar() {
  const { state } = useGameContext();

  if (!state.lineId) return null;

  const line = LINES[state.lineId];
  const prev = state.currentIndex > 0 ? line.stations[state.currentIndex - 1] : null;
  const current = line.stations[state.currentIndex];
  const next = state.currentIndex < line.stations.length - 1 ? line.stations[state.currentIndex + 1] : null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-300 px-6 py-4">
      <div className="flex items-center justify-center gap-8 mb-4">
        {prev ? <StationTile station={prev} /> : <div className="min-w-[100px]" />}

        <div className="flex-1 max-w-md">
          <StationTile station={current} isLarge typedText={state.typedInput} />
        </div>

        {next ? <StationTile station={next} /> : <div className="min-w-[100px]" />}
      </div>

      <div className="max-w-md mx-auto">
        <TypingInput />
      </div>
    </div>
  );
}

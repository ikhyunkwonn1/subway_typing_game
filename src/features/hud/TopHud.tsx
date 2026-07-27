
import { LINES } from '../../data/lines';
import { useGameContext } from '../game-engine/useGameContext';
import { useTimer } from '../game-engine/useTimer';
import { useAccuracy } from '../game-engine/useAccuracy';
import { LineBadge } from './LineBadge';
import { ProgressIndicator } from './ProgressIndicator';
import { AccuracyDisplay } from './AccuracyDisplay';
import { SpeedTimer } from './SpeedTimer';

export function TopHud() {
  const { state } = useGameContext();
  const { elapsedMs, stationsPerMinute } = useTimer();
  const accuracy = useAccuracy();

  if (!state.lineId) return null;

  const line = LINES[state.lineId];
  const total = line.stations.length;
  const current = Math.min(state.currentIndex, total);

  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-white bg-opacity-95 border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <LineBadge lineId={line.displayName} color={line.color} />
          <div className="flex flex-col gap-1">
            <div className="text-sm text-gray-600">운행 중</div>
            <div className="text-sm font-medium text-gray-800">
              {state.lineId}선 타이핑
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div>
            <div className="text-xs text-gray-500 mb-1">진행도</div>
            <ProgressIndicator current={current} total={total} />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">정확도</div>
            <AccuracyDisplay accuracy={accuracy} />
          </div>
          <SpeedTimer elapsedMs={elapsedMs} speed={stationsPerMinute} />
        </div>
      </div>
    </div>
  );
}

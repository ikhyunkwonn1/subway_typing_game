
import { LINES } from '../../data/lines';
import { useGameContext } from './useGameContext';
import { useTimer } from './useTimer';
import { useAccuracy } from './useAccuracy';
import { formatTime, formatSpeed } from '../../shared/utils/format';

export function FinishedScreen() {
  const { state, dispatch } = useGameContext();
  const { elapsedMs, stationsPerMinute } = useTimer();
  const accuracy = useAccuracy();

  if (state.status !== 'finished' || !state.lineId) {
    return null;
  }

  const line = LINES[state.lineId];
  const totalStations = line.stations.length;

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-xl p-12 max-w-md w-full text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-4xl mx-auto mb-6"
          style={{ backgroundColor: line.color }}
        >
          {line.displayName}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          완주!
        </h1>

        <div className="space-y-6 mb-8">
          <div>
            <div className="text-gray-600 text-sm mb-1">Time</div>
            <div className="text-3xl font-bold text-gray-900">
              {formatTime(elapsedMs)}
            </div>
          </div>

          <div>
            <div className="text-gray-600 text-sm mb-1">Speed</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatSpeed(stationsPerMinute)}
            </div>
          </div>

          <div>
            <div className="text-gray-600 text-sm mb-1">Accuracy</div>
            <div className="text-2xl font-bold text-gray-900">
              {accuracy}%
            </div>
          </div>

          <div>
            <div className="text-gray-600 text-sm mb-1">Stations</div>
            <div className="text-2xl font-bold text-gray-900">
              {totalStations} / {totalStations}
            </div>
          </div>
        </div>

        <button
          onClick={() => dispatch({ type: 'RESTART' })}
          className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

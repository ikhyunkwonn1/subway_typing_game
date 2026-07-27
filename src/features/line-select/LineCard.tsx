
import type { LineData } from '../../data/types';

interface LineCardProps {
  line: LineData;
  selected: boolean;
  onClick: () => void;
}

export function LineCard({ line, selected, onClick }: LineCardProps) {
  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-lg border-2 transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
          : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-4xl mb-4"
        style={{ backgroundColor: line.color }}
      >
        {line.displayName}
      </div>
      <div className="text-left">
        <div className="text-lg font-semibold text-gray-800">Line {line.displayName}</div>
        <div className="text-sm text-gray-600">
          {line.stations.length} stations
        </div>
      </div>
    </button>
  );
}


import type { Station } from '../../data/types';

interface StationTileProps {
  station: Station | null;
  isLarge?: boolean;
  typedText?: string;
}

export function StationTile({ station, isLarge = false, typedText }: StationTileProps) {
  if (!station) return null;

  if (isLarge) {
    return (
      <div className="flex flex-col items-center gap-2 min-w-[300px]">
        <div className="text-4xl font-bold text-gray-800 text-center">
          {station.name}
        </div>
        {typedText && (
          <div className="text-2xl text-blue-600 font-semibold">
            {typedText}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 min-w-[100px]">
      <div className="text-sm font-semibold text-gray-400">
        {station.id}
      </div>
      <div className="text-sm text-gray-500 text-center">
        {station.name}
      </div>
    </div>
  );
}

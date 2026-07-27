
import { formatTime, formatSpeed } from '../../shared/utils/format';

interface SpeedTimerProps {
  elapsedMs: number;
  speed: number;
}

export function SpeedTimer({ elapsedMs, speed }: SpeedTimerProps) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="text-sm text-gray-600">{formatSpeed(speed)}</div>
      <div className="text-lg font-mono font-semibold text-gray-800">
        {formatTime(elapsedMs)}
      </div>
    </div>
  );
}

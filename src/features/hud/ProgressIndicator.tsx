

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  return (
    <div className="text-lg font-semibold text-gray-700">
      {current} / {total}
    </div>
  );
}



interface AccuracyDisplayProps {
  accuracy: number;
}

export function AccuracyDisplay({ accuracy }: AccuracyDisplayProps) {
  return (
    <div className="text-lg font-semibold text-gray-700">
      {accuracy}%
    </div>
  );
}

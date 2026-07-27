

interface LineBadgeProps {
  lineId: string;
  color: string;
}

export function LineBadge({ lineId, color }: LineBadgeProps) {
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-2xl"
      style={{ backgroundColor: color }}
    >
      {lineId}
    </div>
  );
}

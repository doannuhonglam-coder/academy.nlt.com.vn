interface ProgressBarProps {
  value: number;             // 0–100
  color?: 'coral' | 'teal' | 'gold' | 'purple';
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

const colorMap = {
  coral: 'bg-coral-500',
  teal: 'bg-teal-400',
  gold: 'bg-gold-500',
  purple: 'bg-violet-500',
};

const heightMap = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

export default function ProgressBar({
  value,
  color = 'teal',
  showLabel = false,
  height = 'md',
}: ProgressBarProps) {
  const pct = Math.min(Math.max(value, 0), 100);

  return (
    <div className="flex items-center gap-2 w-full">
      <div className={`flex-1 bg-white/10 rounded-full overflow-hidden ${heightMap[height]}`}>
        <div
          className={`${colorMap[color]} ${heightMap[height]} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-400 w-10 text-right">{Math.round(pct)}%</span>
      )}
    </div>
  );
}

interface ProgressBarProps {
  total: number;
  completed: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function ProgressBar({ total, completed, showLabel = true, size = "md" }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const heightMap = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };
  const barHeight = heightMap[size];

  const colorClass =
    percent === 100
      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
      : percent > 50
        ? "bg-gradient-to-r from-sky-500 to-sky-400"
        : percent > 0
          ? "bg-gradient-to-r from-amber-500 to-amber-400"
          : "bg-slate-700";

  return (
    <div className="flex items-center gap-3 w-full">
      <div className={`flex-1 ${barHeight} bg-slate-800 rounded-full overflow-hidden`}>
        <div
          className={`${barHeight} ${colorClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap min-w-[4rem] text-right">
          {completed}/{total}
        </span>
      )}
    </div>
  );
}

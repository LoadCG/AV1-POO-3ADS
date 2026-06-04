interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
  type?: "table" | "cards" | "detail";
}

export default function LoadingSkeleton({ rows = 4, columns = 4, type = "table" }: LoadingSkeletonProps) {
  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-slate-800 mb-4" />
            <div className="h-7 bg-slate-800 rounded w-16 mb-2" />
            <div className="h-4 bg-slate-800/60 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "detail") {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
          <div className="h-8 bg-slate-800 rounded w-64 mb-4" />
          <div className="h-4 bg-slate-800/60 rounded w-48 mb-3" />
          <div className="h-3 bg-slate-800/40 rounded w-full mb-2" />
          <div className="h-3 bg-slate-800/40 rounded w-3/4" />
        </div>
        <div className="h-12 bg-slate-800/40 rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-900/50 rounded-xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse">
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        {/* Header row */}
        <div className="grid gap-4 px-5 py-4 border-b border-slate-800" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-800 rounded w-20" />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="grid gap-4 px-5 py-4 border-b border-slate-800/50 last:border-0" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, c) => (
              <div key={c} className="h-4 bg-slate-800/50 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

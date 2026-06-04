import type { ReactNode } from "react";
import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-5 text-slate-500">
        {icon ?? <PackageOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

import type { StatusPeca, StatusEtapa, ResultadoTeste } from "@/lib/types";

type BadgeVariant = StatusPeca | StatusEtapa | ResultadoTeste | string;

const BADGE_STYLES: Record<string, string> = {
  // StatusPeca
  EM_PRODUCAO: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  EM_TRANSPORTE: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  PRONTA: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  // StatusEtapa
  PENDENTE: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  ANDAMENTO: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  CONCLUIDA: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  // ResultadoTeste
  APROVADO: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  REPROVADO: "bg-red-500/15 text-red-300 border-red-500/30",
};

const BADGE_LABELS: Record<string, string> = {
  EM_PRODUCAO: "Em Produção",
  EM_TRANSPORTE: "Em Transporte",
  PRONTA: "Pronta",
  PENDENTE: "Pendente",
  ANDAMENTO: "Em Andamento",
  CONCLUIDA: "Concluída",
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
};

interface StatusBadgeProps {
  status: BadgeVariant;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const style = BADGE_STYLES[status] ?? "bg-slate-500/15 text-slate-300 border-slate-500/30";
  const label = BADGE_LABELS[status] ?? status;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style} ${className}`}>
      {label}
    </span>
  );
}

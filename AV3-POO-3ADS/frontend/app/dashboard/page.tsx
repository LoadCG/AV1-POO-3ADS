"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import ProgressBar from "@/components/ui/ProgressBar";
import { useAuth } from "@/lib/auth-context";
import { getDashboardStats, getAeronaves } from "@/lib/mock-api";
import type { Aeronave } from "@/lib/types";
import { Plane, Settings, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { usuario } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<{ totalAeronaves: number; etapasEmAndamento: number; testesReprovados: number; pecasProntas: number } | null>(null);
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, a] = await Promise.all([getDashboardStats(), getAeronaves()]);
      setStats(s);
      setAeronaves(a);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Bem-vindo de volta, <span className="text-slate-300">{usuario?.nome}</span>!
          </p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <LoadingSkeleton type="cards" />
        ) : stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Plane className="w-5 h-5" />}
              value={stats.totalAeronaves}
              label="Aeronaves"
              color="sky"
            />
            <StatCard
              icon={<Settings className="w-5 h-5" />}
              value={stats.etapasEmAndamento}
              label="Etapas em Andamento"
              color="amber"
            />
            <StatCard
              icon={<AlertTriangle className="w-5 h-5" />}
              value={stats.testesReprovados}
              label="Testes Reprovados"
              color="red"
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5" />}
              value={stats.pecasProntas}
              label="Peças Prontas"
              color="emerald"
            />
          </div>
        )}

        {/* Aeronaves recentes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-200">Aeronaves Recentes</h2>
            <Link
              href="/aeronaves"
              className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton type="table" rows={3} columns={4} />
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Código</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Modelo</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Progresso</th>
                  </tr>
                </thead>
                <tbody>
                  {aeronaves.slice(0, 5).map((a) => {
                    const concluidas = a.etapas.filter((e) => e.status === "CONCLUIDA").length;
                    return (
                      <tr 
                        key={a.codigo} 
                        className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors cursor-pointer group"
                        onClick={() => router.push(`/aeronaves/${a.codigo}`)}
                      >
                        <td className="px-5 py-4">
                          <span className="text-sky-400 group-hover:text-sky-300 font-medium text-sm">
                            {a.codigo}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-300">{a.modelo}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-md ${a.tipo === "MILITAR" ? "bg-orange-500/15 text-orange-300" : "bg-sky-500/15 text-sky-300"}`}>
                            {a.tipo}
                          </span>
                        </td>
                        <td className="px-5 py-4 w-48">
                          <ProgressBar total={a.etapas.length} completed={concluidas} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) {
  const colorMap: Record<string, { bg: string; icon: string; shadow: string }> = {
    sky: { bg: "bg-sky-500/10", icon: "text-sky-400", shadow: "shadow-sky-500/5" },
    amber: { bg: "bg-amber-500/10", icon: "text-amber-400", shadow: "shadow-amber-500/5" },
    red: { bg: "bg-red-500/10", icon: "text-red-400", shadow: "shadow-red-500/5" },
    emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-400", shadow: "shadow-emerald-500/5" },
  };
  const c = colorMap[color] ?? colorMap.sky;

  return (
    <div className={`bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-lg ${c.shadow} hover:border-slate-700 transition-colors`}>
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center ${c.icon} mb-4`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}

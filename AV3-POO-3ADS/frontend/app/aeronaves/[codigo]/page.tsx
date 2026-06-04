"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import ProgressBar from "@/components/ui/ProgressBar";
import { useAuth } from "@/lib/auth-context";
import { getAeronave } from "@/lib/mock-api";
import type { Aeronave } from "@/lib/types";
import { ArrowLeft, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import Image from "next/image";

import TabPecas from "./TabPecas";
import TabEtapas from "./TabEtapas";
import TabTestes from "./TabTestes";
import TabRelatorio from "./TabRelatorio";

export default function DetalheAeronavePage({ params }: { params: Promise<{ codigo: string }> }) {
  const resolvedParams = use(params);
  const { codigo } = resolvedParams;
  const router = useRouter();
  const { temPermissao } = useAuth();
  
  const [aeronave, setAeronave] = useState<Aeronave | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pecas" | "etapas" | "testes" | "relatorio">("pecas");

  const loadData = async () => {
    setLoading(true);
    const data = await getAeronave(codigo);
    if (!data) {
      router.push("/aeronaves");
      return;
    }
    setAeronave(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [codigo, router]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !aeronave) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          <Link href="/aeronaves" className="inline-flex items-center gap-2 text-sm text-slate-400">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <LoadingSkeleton type="detail" />
        </div>
      </AppLayout>
    );
  }

  const concluidas = aeronave.etapas.filter((e) => e.status === "CONCLUIDA").length;
  const pecasEmProducao = aeronave.pecas.filter((p) => p.status !== "PRONTA").length;
  const testesReprovados = aeronave.testes.filter((t) => t.resultado === "REPROVADO").length;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Link */}
        <Link href="/aeronaves" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Aeronaves
        </Link>

        {/* Header Summary */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 lg:p-8">
          <div className="flex items-start gap-5 mb-6">
            <div className="relative w-14 h-14 shrink-0">
              <Image 
                src="/skyforge_logo.svg" 
                alt="SkyForge Logo" 
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3 font-jockey tracking-wide">
                {aeronave.codigo} <span className="text-slate-500 font-normal opacity-50">—</span> {aeronave.modelo}
              </h1>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${aeronave.tipo === "MILITAR" ? "bg-orange-500/15 text-orange-300" : "bg-sky-500/15 text-sky-300"}`}>
                  {aeronave.tipo}
                </span>
                <span>•</span>
                Capacidade: {aeronave.capacidade} pax
                <span>•</span>
                Alcance: {aeronave.alcance} km
              </p>
            </div>
          </div>

          {/* Progress & Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-800">
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Progresso da Produção</h3>
              <ProgressBar total={aeronave.etapas.length} completed={concluidas} size="lg" />
              <p className="text-xs text-slate-500 mt-2">
                {concluidas} de {aeronave.etapas.length} etapas concluídas ({aeronave.etapas.length > 0 ? Math.round((concluidas / aeronave.etapas.length) * 100) : 0}%)
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Resumo de Status</h3>
              
              {pecasEmProducao > 0 ? (
                <div className="flex items-center gap-2 text-sm text-amber-300">
                  <AlertTriangle className="w-4 h-4" /> {pecasEmProducao} peça(s) ainda em produção/transporte.
                </div>
              ) : aeronave.pecas.length > 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Todas as peças estão prontas.
                </div>
              ) : null}

              {testesReprovados > 0 ? (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <AlertTriangle className="w-4 h-4" /> {testesReprovados} teste(s) reprovado(s)!
                </div>
              ) : aeronave.testes.length > 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Todos os testes aprovados.
                </div>
              ) : null}

              {concluidas === aeronave.etapas.length && aeronave.etapas.length > 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Todas as etapas concluídas.
                </div>
              ) : aeronave.etapas.length > 0 ? (
                <div className="flex items-center gap-2 text-sm text-sky-400">
                  <Info className="w-4 h-4" /> Produção em andamento.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-slate-800 flex gap-6 px-2 overflow-x-auto no-scrollbar">
          {(["pecas", "etapas", "testes"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab ? "border-sky-500 text-sky-400" : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
          {temPermissao("ENGENHEIRO") && (
            <button
              onClick={() => setActiveTab("relatorio")}
              className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "relatorio" ? "border-sky-500 text-sky-400" : "border-transparent text-slate-400 hover:text-slate-300"
              }`}
            >
              Relatório
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "pecas" && <TabPecas aeronave={aeronave} onUpdate={loadData} />}
          {activeTab === "etapas" && <TabEtapas aeronave={aeronave} onUpdate={loadData} />}
          {activeTab === "testes" && <TabTestes aeronave={aeronave} onUpdate={loadData} />}
          {activeTab === "relatorio" && temPermissao("ENGENHEIRO") && <TabRelatorio aeronave={aeronave} />}
        </div>
      </div>
    </AppLayout>
  );
}

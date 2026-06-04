"use client";

import { useState } from "react";
import type { Aeronave } from "@/lib/types";
import { FileText, AlertTriangle } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function TabRelatorio({ aeronave }: { aeronave: Aeronave }) {
  const [cliente, setCliente] = useState("");
  const [data, setData] = useState("");
  const [gerado, setGerado] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const pendentes = aeronave.etapas.filter(e => e.status !== "CONCLUIDA").length;
  const reprovados = aeronave.testes.filter(t => t.resultado === "REPROVADO").length;
  const hasAlert = pendentes > 0 || reprovados > 0;

  function handleGerar(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!cliente || !data) return;
    if (hasAlert && !gerado) {
      setConfirmOpen(true);
      return;
    }
    setGerado(true);
    setConfirmOpen(false);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-lg font-semibold text-slate-200">Relatório de Entrega</h2>

      {hasAlert && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-400">Atenção: Aeronave com pendências</h4>
            <ul className="text-sm text-amber-500/80 mt-1 list-disc list-inside">
              {pendentes > 0 && <li>{pendentes} etapa(s) não concluída(s)</li>}
              {reprovados > 0 && <li>{reprovados} teste(s) reprovado(s)</li>}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleGerar} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Cliente</label>
          <input required value={cliente} onChange={e => setCliente(e.target.value)} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 outline-none" />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Data de Entrega</label>
          <input required type="date" value={data} onChange={e => setData(e.target.value)} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 outline-none" />
        </div>
        <div className="sm:col-span-2 pt-2">
          <button type="submit" className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium rounded-xl flex items-center gap-2">
            <FileText className="w-4 h-4" /> Gerar Visualização
          </button>
        </div>
      </form>

      {gerado && (
        <div className="mt-8 bg-slate-950 border border-slate-800 rounded-xl p-6 font-mono text-xs sm:text-sm text-slate-300 whitespace-pre-wrap overflow-x-auto shadow-inner max-w-full">
{`===========================================
       RELATÓRIO DE ENTREGA - SKYFORGE     
===========================================

Data de Entrega: ${data}
Cliente: ${cliente}

--- AERONAVE ---
Código: ${aeronave.codigo}
Modelo: ${aeronave.modelo}
Tipo: ${aeronave.tipo}
Capacidade: ${aeronave.capacidade} passageiros
Alcance: ${aeronave.alcance} km

--- PEÇAS UTILIZADAS ---
${aeronave.pecas.length === 0 ? "Nenhuma peça registrada." : aeronave.pecas.map(p => `  - ${p.nome} | Tipo: ${p.tipo} | Fornecedor: ${p.fornecedor} | Status: ${p.status}`).join("\n")}

--- ETAPAS REALIZADAS ---
${aeronave.etapas.length === 0 ? "Nenhuma etapa registrada." : aeronave.etapas.map(e => `  - ${e.nome} | Prazo: ${e.prazo} | Status: ${e.status}${e.funcionarios.length > 0 ? `\n    Funcionários: ${e.funcionarios.join(", ")}` : ""}`).join("\n")}

--- RESULTADOS DE TESTES ---
${aeronave.testes.length === 0 ? "Nenhum teste registrado." : aeronave.testes.map(t => `  - ${t.tipo}: ${t.resultado}`).join("\n")}

===========================================
           FIM DO RELATÓRIO               
===========================================`}
        </div>
      )}

      <ConfirmDialog 
        open={confirmOpen} 
        title="Gerar com Pendências?" 
        message="Esta aeronave possui etapas não concluídas ou testes reprovados. Tem certeza que deseja gerar o relatório final?" 
        confirmLabel="Sim, Gerar" 
        onConfirm={() => { setGerado(true); setConfirmOpen(false); }} 
        onCancel={() => setConfirmOpen(false)} 
      />
    </div>
  );
}

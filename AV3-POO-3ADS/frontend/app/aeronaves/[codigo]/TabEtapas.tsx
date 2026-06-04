"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { iniciarEtapa, finalizarEtapa, adicionarEtapa, associarFuncionarioEtapa, getFuncionarios } from "@/lib/mock-api";
import type { Aeronave, Funcionario } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { Plus, ListChecks, Play, Check, Users } from "lucide-react";
import toast from "react-hot-toast";
import { isValidString } from "@/lib/validators";

export default function TabEtapas({ aeronave, onUpdate }: { aeronave: Aeronave; onUpdate: () => void }) {
  const { temPermissao } = useAuth();
  const [modalNovaOpen, setModalNovaOpen] = useState(false);
  const [modalAssocOpen, setModalAssocOpen] = useState(false);
  const [selectedEtapaIdx, setSelectedEtapaIdx] = useState<number | null>(null);
  
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState<string | null>(null); // "iniciar-1", "finalizar-2", etc.
  const [submitting, setSubmitting] = useState(false);

  const [formNova, setFormNova] = useState({ nome: "", prazo: "" });
  const [formAssoc, setFormAssoc] = useState({ funcId: "" });

  useEffect(() => {
    if (modalAssocOpen && funcionarios.length === 0) {
      getFuncionarios().then(setFuncionarios);
    }
  }, [modalAssocOpen, funcionarios.length]);

  async function handleIniciar(idx: number) {
    setLoading(`iniciar-${idx}`);
    const res = await iniciarEtapa(aeronave.codigo, idx);
    setLoading(null);
    if (res.ok) {
      toast.success("Etapa iniciada.");
      onUpdate();
    } else {
      toast.error(res.erro || "Erro.");
    }
  }

  async function handleFinalizar(idx: number) {
    setLoading(`finalizar-${idx}`);
    const res = await finalizarEtapa(aeronave.codigo, idx);
    setLoading(null);
    if (res.ok) {
      toast.success("Etapa finalizada.");
      onUpdate();
    } else {
      toast.error(res.erro || "Erro.");
    }
  }

  async function handleNova(e: React.FormEvent) {
    e.preventDefault();
    if (!formNova.prazo) return;
    if (!isValidString(formNova.nome)) return toast.error("Nome da etapa inválido.");

    setSubmitting(true);
    const res = await adicionarEtapa(aeronave.codigo, { nome: formNova.nome, prazo: formNova.prazo });
    setSubmitting(false);
    if (res.ok) {
      toast.success("Etapa adicionada.");
      setModalNovaOpen(false);
      setFormNova({ nome: "", prazo: "" });
      onUpdate();
    } else {
      toast.error(res.erro || "Erro.");
    }
  }

  async function handleAssoc(e: React.FormEvent) {
    e.preventDefault();
    if (selectedEtapaIdx === null || !formAssoc.funcId) return;
    setSubmitting(true);
    const res = await associarFuncionarioEtapa(aeronave.codigo, selectedEtapaIdx, formAssoc.funcId);
    setSubmitting(false);
    if (res.ok) {
      toast.success("Funcionário associado.");
      setModalAssocOpen(false);
      setFormAssoc({ funcId: "" });
      onUpdate();
    } else {
      toast.error(res.erro || "Erro.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">Etapas de Produção</h2>
        {temPermissao("ENGENHEIRO") && (
          <button onClick={() => setModalNovaOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-sm font-medium rounded-lg transition-colors border border-sky-500/20">
            <Plus className="w-4 h-4" /> Nova Etapa
          </button>
        )}
      </div>

      {aeronave.etapas.length === 0 ? (
        <EmptyState icon={<ListChecks className="w-8 h-8" />} title="Nenhuma etapa" />
      ) : (
        <div className="space-y-4">
          {aeronave.etapas.map((e, idx) => {
            const isBlocked = idx > 0 && aeronave.etapas[idx - 1].status !== "CONCLUIDA";
            
            return (
              <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-slate-500 font-mono text-sm">#{idx + 1}</span>
                    <h3 className="text-base font-medium text-slate-200">{e.nome}</h3>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="text-sm text-slate-400 mb-3">Prazo: {e.prazo}</div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {e.funcionarios.map(fid => (
                      <span key={fid} className="px-2 py-1 bg-slate-800 rounded-md text-xs text-slate-300 border border-slate-700">
                        {fid}
                      </span>
                    ))}
                    {temPermissao("OPERADOR") && e.status !== "CONCLUIDA" && (
                      <button onClick={() => { setSelectedEtapaIdx(idx); setModalAssocOpen(true); }} className="px-2 py-1 bg-sky-500/10 text-sky-400 rounded-md text-xs hover:bg-sky-500/20 transition flex items-center gap-1 border border-sky-500/20">
                        <Users className="w-3 h-3" /> Associar
                      </button>
                    )}
                  </div>
                </div>

                {temPermissao("OPERADOR") && (
                  <div className="flex items-center gap-2">
                    {e.status === "PENDENTE" && (
                      <button 
                        onClick={() => handleIniciar(idx)} 
                        disabled={isBlocked || loading === `iniciar-${idx}`}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-sm font-medium rounded-lg flex items-center gap-2 transition"
                        title={isBlocked ? "Etapa anterior pendente" : ""}
                      >
                        <Play className="w-4 h-4" /> Iniciar
                      </button>
                    )}
                    {e.status === "ANDAMENTO" && (
                      <button 
                        onClick={() => handleFinalizar(idx)}
                        disabled={loading === `finalizar-${idx}`}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition shadow-lg shadow-emerald-500/20"
                      >
                        <Check className="w-4 h-4" /> Finalizar
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modais omitidos para brevidade, similares ao de Peças */}
      <Modal open={modalNovaOpen} onClose={() => setModalNovaOpen(false)} title="Nova Etapa">
         <form onSubmit={handleNova} className="space-y-4">
          <div><label className="block text-sm text-slate-400 mb-1">Nome</label><input required value={formNova.nome} onChange={e => setFormNova({ ...formNova, nome: e.target.value })} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 outline-none" /></div>
          <div><label className="block text-sm text-slate-400 mb-1">Prazo</label><input required type="date" value={formNova.prazo} onChange={e => setFormNova({ ...formNova, prazo: e.target.value })} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 outline-none" /></div>
          <div className="pt-4 flex justify-end gap-3"><button type="submit" disabled={submitting} className="px-4 py-2 bg-sky-500 text-white rounded-lg">Salvar</button></div>
        </form>
      </Modal>

      <Modal open={modalAssocOpen} onClose={() => setModalAssocOpen(false)} title="Associar Funcionário">
        <form onSubmit={handleAssoc} className="space-y-5">
          {selectedEtapaIdx !== null && aeronave.etapas[selectedEtapaIdx].funcionarios.length > 0 && (
            <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">Já associados:</span>
              <div className="flex flex-wrap gap-2">
                {aeronave.etapas[selectedEtapaIdx].funcionarios.map(fid => (
                  <span key={fid} className="px-2 py-1 bg-slate-800 rounded-md text-xs text-slate-300 border border-slate-700">
                    {fid}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-2">Selecionar Funcionário</label>
            <select 
              required 
              value={formAssoc.funcId} 
              onChange={e => setFormAssoc({ funcId: e.target.value })} 
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 outline-none focus:border-sky-500 transition-colors"
            >
              <option value="">Selecione um membro da equipe...</option>
              {funcionarios
                .filter(f => selectedEtapaIdx === null || !aeronave.etapas[selectedEtapaIdx].funcionarios.includes(f.usuario))
                .map(f => (
                  <option key={f.id} value={f.id}>
                    {f.nome} ({f.nivelPermissao})
                  </option>
                ))
              }
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setModalAssocOpen(false)} 
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={submitting || !formAssoc.funcId} 
              className="px-5 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/20"
            >
              {submitting ? "Associando..." : "✓ Associar à Etapa"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

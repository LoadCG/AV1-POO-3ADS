"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { evoluirStatusPeca, adicionarPeca } from "@/lib/mock-api";
import type { Aeronave, TipoPeca, StatusPeca } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Plus, ArrowRight, Loader2, Wrench } from "lucide-react";
import toast from "react-hot-toast";
import { isValidString } from "@/lib/validators";

export default function TabPecas({ aeronave, onUpdate }: { aeronave: Aeronave; onUpdate: () => void }) {
  const { temPermissao } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // State for confirm dialog
  const [confirmEvolution, setConfirmEvolution] = useState<{ idx: number, statusAtual: StatusPeca } | null>(null);

  const [form, setForm] = useState({ nome: "", fornecedor: "", tipo: "" as TipoPeca | "" });

  async function handleEvoluir() {
    if (!confirmEvolution) return;
    const { idx } = confirmEvolution;
    
    setLoading(idx);
    setConfirmEvolution(null);
    
    const res = await evoluirStatusPeca(aeronave.codigo, idx);
    setLoading(null);
    if (res.ok) {
      toast.success(`Status atualizado para ${res.novoStatus}`);
      onUpdate();
    } else {
      toast.error(res.erro || "Erro ao atualizar.");
    }
  }

  async function handleAddPeca(e: React.FormEvent) {
    e.preventDefault();
    if (!form.tipo) return;
    if (!isValidString(form.nome)) return toast.error("Nome de peça inválido.");
    if (!isValidString(form.fornecedor)) return toast.error("Fornecedor inválido.");

    setSubmitting(true);
    const res = await adicionarPeca(aeronave.codigo, {
      nome: form.nome,
      fornecedor: form.fornecedor,
      tipo: form.tipo as TipoPeca,
    });
    setSubmitting(false);

    if (res.ok) {
      toast.success("Peça adicionada com sucesso!");
      setModalOpen(false);
      setForm({ nome: "", fornecedor: "", tipo: "" });
      onUpdate();
    } else {
      toast.error(res.erro || "Erro ao adicionar peça.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">Peças da Aeronave</h2>
        {temPermissao("ENGENHEIRO") && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-sm font-medium rounded-lg transition-colors border border-sky-500/20"
          >
            <Plus className="w-4 h-4" /> Nova Peça
          </button>
        )}
      </div>

      {aeronave.pecas.length === 0 ? (
        <EmptyState
          icon={<Wrench className="w-8 h-8" />}
          title="Nenhuma peça"
          description="Esta aeronave ainda não possui peças cadastradas."
        />
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/20">
                <th className="text-left px-5 py-3 font-semibold text-slate-400">Nome</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-400">Tipo</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-400">Fornecedor</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-400">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-slate-400">Ação</th>
              </tr>
            </thead>
            <tbody>
              {aeronave.pecas.map((p, idx) => (
                <tr key={idx} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-200">{p.nome}</td>
                  <td className="px-5 py-4 text-slate-400">{p.tipo}</td>
                  <td className="px-5 py-4 text-slate-400">{p.fornecedor}</td>
                  <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-4 text-right">
                    {p.status !== "PRONTA" && temPermissao("OPERADOR") && (
                      <button
                        onClick={() => setConfirmEvolution({ idx, statusAtual: p.status })}
                        disabled={loading === idx}
                        className="inline-flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
                        title="Evoluir Status"
                      >
                        {loading === idx ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nova Peça */}
      <Modal open={modalOpen} onClose={() => !submitting && setModalOpen(false)} title="Nova Peça">
        <form onSubmit={handleAddPeca} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nome</label>
            <input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:border-sky-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Fornecedor</label>
            <input required value={form.fornecedor} onChange={e => setForm({ ...form, fornecedor: e.target.value })} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:border-sky-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Tipo</label>
            <select required value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as TipoPeca })} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 focus:border-sky-500 outline-none">
              <option value="">Selecione...</option>
              <option value="NACIONAL">NACIONAL</option>
              <option value="IMPORTADA">IMPORTADA</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium rounded-lg flex items-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Salvar
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog 
        open={!!confirmEvolution}
        title="Confirmar Evolução de Status"
        message={confirmEvolution?.statusAtual === "EM_PRODUCAO" 
          ? "Tem certeza que deseja avançar esta peça para EM_TRANSPORTE? Esta ação não pode ser desfeita."
          : "Tem certeza que deseja avançar esta peça para PRONTA? Esta ação não pode ser desfeita."}
        confirmLabel="Sim, Evoluir Status"
        onConfirm={handleEvoluir}
        onCancel={() => setConfirmEvolution(null)}
        variant="warning"
      />
    </div>
  );
}

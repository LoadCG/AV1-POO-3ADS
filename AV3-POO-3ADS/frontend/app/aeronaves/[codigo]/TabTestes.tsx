"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { registrarTeste } from "@/lib/mock-api";
import type { Aeronave, TipoTeste, ResultadoTeste } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { Plus, Beaker } from "lucide-react";
import toast from "react-hot-toast";

export default function TabTestes({ aeronave, onUpdate }: { aeronave: Aeronave; onUpdate: () => void }) {
  const { temPermissao } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ tipo: "" as TipoTeste | "", resultado: "APROVADO" as ResultadoTeste });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.tipo) return;
    setSubmitting(true);
    const res = await registrarTeste(aeronave.codigo, { tipo: form.tipo as TipoTeste, resultado: form.resultado });
    setSubmitting(false);
    if (res.ok) {
      toast.success("Teste registrado.");
      setModalOpen(false);
      onUpdate();
    } else toast.error(res.erro || "Erro.");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">Testes de Qualidade</h2>
        {temPermissao("ENGENHEIRO") && (
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-sm font-medium rounded-lg">
            <Plus className="w-4 h-4" /> Registrar Teste
          </button>
        )}
      </div>

      {aeronave.testes.length === 0 ? (
        <EmptyState icon={<Beaker className="w-8 h-8" />} title="Nenhum teste" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {aeronave.testes.map((t, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
              <span className="font-medium text-slate-200">{t.tipo}</span>
              <StatusBadge status={t.resultado} />
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Teste">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Tipo</label>
            <select required value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as TipoTeste })} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 outline-none">
              <option value="">Selecione...</option>
              <option value="ELETRICO">ELETRICO</option>
              <option value="HIDRAULICO">HIDRAULICO</option>
              <option value="AERODINAMICO">AERODINAMICO</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Resultado</label>
            <select required value={form.resultado} onChange={e => setForm({ ...form, resultado: e.target.value as ResultadoTeste })} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 outline-none">
              <option value="APROVADO">APROVADO</option>
              <option value="REPROVADO">REPROVADO</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3"><button type="submit" disabled={submitting} className="px-4 py-2 bg-sky-500 text-white rounded-lg">Salvar</button></div>
        </form>
      </Modal>
    </div>
  );
}

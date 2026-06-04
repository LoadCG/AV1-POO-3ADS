"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { criarAeronave } from "@/lib/mock-api";
import type { TipoAeronave } from "@/lib/types";
import { ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { isValidString } from "@/lib/validators";

export default function NovaAeronavePage() {
  const router = useRouter();
  const { temPermissao } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    codigo: "",
    modelo: "",
    tipo: "" as TipoAeronave | "",
    capacidade: "",
    alcance: "",
  });
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!temPermissao("ENGENHEIRO")) {
      toast.error("Acesso Negado: Apenas Engenheiros ou Administradores podem cadastrar aeronaves.");
      router.replace("/aeronaves");
    }
  }, [temPermissao, router]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!isValidString(form.codigo)) e.codigo = "Código inválido.";
    if (!isValidString(form.modelo)) e.modelo = "Modelo inválido.";
    if (!form.tipo) e.tipo = "Selecione o tipo.";
    if (!form.capacidade || parseInt(form.capacidade) <= 0) e.capacidade = "Capacidade inválida.";
    if (!form.alcance || parseInt(form.alcance) <= 0) e.alcance = "Alcance inválido.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Verifique os campos obrigatórios.");
      return;
    }

    setLoading(true);
    const result = await criarAeronave({
      codigo: form.codigo.trim(),
      modelo: form.modelo.trim(),
      tipo: form.tipo as TipoAeronave,
      capacidade: parseInt(form.capacidade),
      alcance: parseInt(form.alcance),
    });
    setLoading(false);

    if (result.ok) {
      toast.success(`Aeronave "${form.codigo}" cadastrada com sucesso!`);
      router.push("/aeronaves");
    } else {
      setErros({ codigo: result.erro ?? "Erro ao cadastrar." });
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back */}
        <Link href="/aeronaves" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 lg:p-8">
          <h1 className="text-xl font-bold text-slate-100 mb-6">Nova Aeronave</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Código + Modelo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Código" error={erros.codigo}>
                <input
                  type="text"
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  placeholder="ex: SF-004"
                  className="input-field"
                />
              </Field>
              <Field label="Modelo" error={erros.modelo}>
                <input
                  type="text"
                  value={form.modelo}
                  onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                  placeholder="ex: Boeing 737 MAX"
                  className="input-field"
                />
              </Field>
            </div>

            {/* Tipo + Capacidade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Tipo" error={erros.tipo}>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoAeronave })}
                  className="input-field"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="COMERCIAL">COMERCIAL</option>
                  <option value="MILITAR">MILITAR</option>
                </select>
              </Field>
              <Field label="Capacidade (pax)" error={erros.capacidade}>
                <input
                  type="number"
                  min={1}
                  value={form.capacidade}
                  onChange={(e) => setForm({ ...form, capacidade: e.target.value })}
                  placeholder="ex: 189"
                  className="input-field"
                />
              </Field>
            </div>

            {/* Alcance */}
            <Field label="Alcance (km)" error={erros.alcance}>
              <input
                type="number"
                min={1}
                value={form.alcance}
                onChange={(e) => setForm({ ...form, alcance: e.target.value })}
                placeholder="ex: 6500"
                className="input-field"
              />
            </Field>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <Link
                href="/aeronaves"
                className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Salvando..." : "✓ Cadastrar Aeronave"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        :global(.input-field) {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid #334155;
          border-radius: 0.75rem;
          color: #e2e8f0;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        :global(.input-field::placeholder) {
          color: #475569;
        }
        :global(.input-field:focus) {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
        }
      `}</style>
    </AppLayout>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-2">{label} *</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
    </div>
  );
}

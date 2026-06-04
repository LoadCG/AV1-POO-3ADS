"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { getAeronave, atualizarAeronave } from "@/lib/mock-api";
import type { TipoAeronave, Aeronave } from "@/lib/types";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { isValidString } from "@/lib/validators";

export default function EditarAeronavePage() {
  const router = useRouter();
  const params = useParams();
  const { temPermissao } = useAuth();
  const codigoOriginal = params.codigo as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
      toast.error("Acesso Negado: Apenas Engenheiros ou Administradores podem editar aeronaves.");
      router.replace("/aeronaves");
      return;
    }

    getAeronave(codigoOriginal).then((a) => {
      if (a) {
        setForm({
          codigo: a.codigo,
          modelo: a.modelo,
          tipo: a.tipo,
          capacidade: a.capacidade.toString(),
          alcance: a.alcance.toString(),
        });
      } else {
        toast.error("Aeronave não encontrada.");
        router.push("/aeronaves");
      }
      setLoading(false);
    });
  }, [codigoOriginal, router, temPermissao]);

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

    setSubmitting(true);
    const result = await atualizarAeronave(codigoOriginal, {
      codigo: form.codigo.trim(),
      modelo: form.modelo.trim(),
      tipo: form.tipo as TipoAeronave,
      capacidade: parseInt(form.capacidade),
      alcance: parseInt(form.alcance),
    });
    setSubmitting(false);

    if (result.ok) {
      toast.success("Aeronave atualizada com sucesso!");
      router.push("/aeronaves");
    } else {
      setErros({ codigo: result.erro ?? "Erro ao atualizar." });
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/aeronaves" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 lg:p-8">
          <h1 className="text-xl font-bold text-slate-100 mb-6 font-jockey uppercase tracking-wider">Editar Aeronave: {codigoOriginal}</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Código" error={erros.codigo}>
                <input
                  type="text"
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  className="input-field"
                />
              </Field>
              <Field label="Modelo" error={erros.modelo}>
                <input
                  type="text"
                  value={form.modelo}
                  onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                  className="input-field"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Tipo" error={erros.tipo}>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoAeronave })}
                  className="input-field"
                >
                  <option value="COMERCIAL">COMERCIAL</option>
                  <option value="MILITAR">MILITAR</option>
                </select>
              </Field>
              <Field label="Capacidade (pax)" error={erros.capacidade}>
                <input
                  type="number"
                  value={form.capacidade}
                  onChange={(e) => setForm({ ...form, capacidade: e.target.value })}
                  className="input-field"
                />
              </Field>
            </div>

            <Field label="Alcance (km)" error={erros.alcance}>
              <input
                type="number"
                value={form.alcance}
                onChange={(e) => setForm({ ...form, alcance: e.target.value })}
                className="input-field"
              />
            </Field>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <Link
                href="/aeronaves"
                className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {submitting ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .input-field {
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
        .input-field:focus {
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

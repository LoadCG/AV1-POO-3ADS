"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { criarFuncionario } from "@/lib/mock-api";
import type { NivelPermissao } from "@/lib/types";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { isValidString, formatCEP, formatPhone, UFS } from "@/lib/validators";

export default function NovoFuncionarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const [form, setForm] = useState({
    nome: "", telefone: "", usuario: "", senha: "", nivelPermissao: "OPERADOR" as NivelPermissao
  });

  const [endereco, setEndereco] = useState({
    cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: ""
  });

  async function handleCepBlur() {
    const limpo = endereco.cep.replace(/\D/g, "");
    if (limpo.length !== 8) return;

    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setEndereco(prev => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          uf: data.uf || prev.uf
        }));
        toast.success("Endereço preenchido!");
      } else {
        toast.error("CEP não encontrado.");
      }
    } catch {
      toast.error("Erro ao buscar CEP.");
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Strict Validation
    if (!isValidString(form.nome)) return toast.error("Nome inválido.");
    if (!isValidString(form.usuario)) return toast.error("Usuário inválido.");
    if (!isValidString(form.senha)) return toast.error("Senha inválida.");
    if (form.telefone && !isValidString(form.telefone)) return toast.error("Telefone inválido.");

    if (form.nome.toLowerCase() === "gerson") {
      toast.error("Erro crítico: o sistema não suporta gênios. Cadastro do Prof. Dr. Eng. Gerson negado.", {
        icon: "🎓",
        duration: 5000,
      });
      return;
    }

    // Prepare Endereco JSON
    const hasAddress = endereco.cep || endereco.logradouro || endereco.numero || endereco.bairro || endereco.cidade || endereco.uf;
    if (hasAddress) {
      if (!isValidString(endereco.logradouro)) return toast.error("Logradouro é obrigatório e não pode ser vazio.");
      if (!isValidString(endereco.numero)) return toast.error("Número do endereço é obrigatório (use 'S/N' se não houver).");
      if (!isValidString(endereco.bairro)) return toast.error("Bairro é obrigatório e não pode ser vazio.");
      if (!isValidString(endereco.cidade)) return toast.error("Cidade é obrigatória e não pode ser vazia.");
      if (!endereco.uf) return toast.error("UF é obrigatória.");
    }

    const enderecoString = hasAddress ? JSON.stringify(endereco) : "";

    setLoading(true);
    const res = await criarFuncionario({
      ...form,
      endereco: enderecoString
    });
    setLoading(false);

    if (res.ok) {
      toast.success("Funcionário cadastrado.");
      router.push("/funcionarios");
    } else {
      toast.error(res.erro || "Erro.");
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/funcionarios" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 lg:p-8">
          <h1 className="text-xl font-bold text-slate-100 mb-6 font-jockey tracking-wider uppercase">Novo Funcionário</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dados Pessoais */}
            <div>
              <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-widest border-b border-slate-800 pb-2">Dados Pessoais & Acesso</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Nome">
                  <input required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="input-field" />
                </Field>
                <Field label="Telefone">
                  <input value={form.telefone} onChange={e => setForm({ ...form, telefone: formatPhone(e.target.value) })} placeholder="(00) 00000-0000" className="input-field" />
                </Field>
                <Field label="Nível de Permissão">
                  <select value={form.nivelPermissao} onChange={e => setForm({ ...form, nivelPermissao: e.target.value as NivelPermissao })} className="input-field">
                    <option value="OPERADOR">OPERADOR</option>
                    <option value="ENGENHEIRO">ENGENHEIRO</option>
                    <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                  </select>
                </Field>
                <Field label="Usuário (Login)">
                  <input required value={form.usuario} onChange={e => setForm({ ...form, usuario: e.target.value })} className="input-field" />
                </Field>
                <Field label="Senha">
                  <input required type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} className="input-field" />
                </Field>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-widest border-b border-slate-800 pb-2">Endereço</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
                <Field label="CEP">
                  <div className="relative">
                    <input 
                      value={endereco.cep} 
                      onChange={e => setEndereco({ ...endereco, cep: formatCEP(e.target.value) })} 
                      onBlur={handleCepBlur}
                      placeholder="00000-000" 
                      className="input-field pr-10" 
                    />
                    {cepLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500 animate-spin" />}
                  </div>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Logradouro">
                    <input value={endereco.logradouro} onChange={e => setEndereco({ ...endereco, logradouro: e.target.value })} className="input-field" />
                  </Field>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-5">
                <Field label="Número *">
                  <input value={endereco.numero} onChange={e => setEndereco({ ...endereco, numero: e.target.value })} className="input-field" />
                </Field>
                <div className="sm:col-span-3">
                  <Field label="Complemento">
                    <input value={endereco.complemento} onChange={e => setEndereco({ ...endereco, complemento: e.target.value })} className="input-field" />
                  </Field>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label="Bairro">
                  <input value={endereco.bairro} onChange={e => setEndereco({ ...endereco, bairro: e.target.value })} className="input-field" />
                </Field>
                <Field label="Cidade">
                  <input value={endereco.cidade} onChange={e => setEndereco({ ...endereco, cidade: e.target.value })} className="input-field" />
                </Field>
                <Field label="UF">
                  <select value={endereco.uf} onChange={e => setEndereco({ ...endereco, uf: e.target.value })} className="input-field">
                    <option value="">Selecione...</option>
                    {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
              <Link href="/funcionarios" className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">Cancelar</Link>
              <button type="submit" disabled={loading} className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold rounded-xl flex items-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Cadastrar Funcionário
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
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
      `}</style>
    </AppLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-400 mb-2">{label}</label>
      {children}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!usuario.trim() || !senha.trim()) {
      setErro("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    const result = await login(usuario.trim(), senha);

    if (result.ok) {
      toast.success("Bem-vindo de volta!");
      router.push("/dashboard");
    } else {
      setLoading(false);
      setErro(result.erro ?? "Erro desconhecido.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-sky-500/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="relative w-24 h-24 mb-4" suppressHydrationWarning>
            <Image 
              src="/skyforge_logo.svg" 
              alt="SkyForge Logo" 
              fill
              className="object-contain"
              priority
              suppressHydrationWarning
            />
          </div>
          <h1 className="text-4xl font-bold tracking-wider text-white font-jockey uppercase">
            SkyForge
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Sistema de Gestão de Produção de Aeronaves</p>
        </div>

        {/* Login card */}
        <form onSubmit={handleSubmit} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-100 mb-6 text-center">Acesso ao Sistema</h2>

          {/* Erro */}
          {erro && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {erro}
            </div>
          )}

          {/* Usuario */}
          <div className="mb-4">
            <label htmlFor="usuario" className="block text-sm font-medium text-slate-400 mb-2">
              Usuário
            </label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="ex: admin"
              autoComplete="username"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 outline-none"
            />
          </div>

          {/* Senha */}
          <div className="mb-6">
            <label htmlFor="senha" className="block text-sm font-medium text-slate-400 mb-2">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder:text-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar →"
            )}
          </button>

          {/* Demo credentials */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-2 mb-4 justify-center text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Acesso Rápido / Demonstração</span>
            </div>
            <p className="text-sm text-slate-500 text-center mb-4">
              Clique em um perfil abaixo para preencher automaticamente:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { user: "admin", pass: "admin123", nivel: "Admin", color: "from-indigo-500/20 to-indigo-500/5", border: "border-indigo-500/20", hover: "hover:border-indigo-500/50 hover:bg-indigo-500/10" },
                { user: "eng01", pass: "eng123", nivel: "Engenheiro", color: "from-sky-500/20 to-sky-500/5", border: "border-sky-500/20", hover: "hover:border-sky-500/50 hover:bg-sky-500/10" },
                { user: "op01", pass: "op123", nivel: "Operador", color: "from-slate-500/20 to-slate-500/5", border: "border-slate-500/20", hover: "hover:border-slate-500/50 hover:bg-slate-500/10" },
              ].map((cred) => (
                <button
                  key={cred.user}
                  type="button"
                  onClick={() => { setUsuario(cred.user); setSenha(cred.pass); setErro(""); }}
                  className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border bg-gradient-to-b ${cred.color} ${cred.border} ${cred.hover} transition-all duration-300`}
                >
                  <span className="block text-sm font-semibold text-slate-200 group-hover:text-white transition-colors mb-1">{cred.nivel}</span>
                  <span className="text-xs font-mono text-slate-400 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700/50">
                    {cred.user}
                  </span>
                  
                  {/* Tooltip hint on hover */}
                  <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap">
                    Clique para preencher
                  </span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

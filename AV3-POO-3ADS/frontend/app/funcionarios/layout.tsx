"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Shield } from "lucide-react";

export default function FuncionariosLayout({ children }: { children: React.ReactNode }) {
  const { temPermissao, loading, usuario } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [denied, setDenied] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!loading) {
      if (usuario && !temPermissao("ADMINISTRADOR")) {
        setDenied(true);
        const timer = setInterval(() => {
          setCountdown((prev) => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
      } else {
        setIsChecking(false);
      }
    }
  }, [loading, usuario, temPermissao]);

  useEffect(() => {
    if (denied && countdown === 0) {
      router.replace("/dashboard");
    }
  }, [denied, countdown, router]);

  if (loading || isChecking) {
    if (denied) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 shadow-2xl shadow-red-500/10">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 font-jockey uppercase tracking-wider">Acesso Negado</h1>
          <p className="text-slate-400 max-w-xs mb-8">
            Você não tem permissão de Administrador para acessar a gestão de funcionários.
          </p>
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-500">
            <Loader2 className="w-3 h-3 animate-spin" />
            Redirecionando para o Dashboard em {countdown}s...
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Validando credenciais...</p>
      </div>
    );
  }

  return <>{children}</>;
}

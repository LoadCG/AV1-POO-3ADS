"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Funcionario, NivelPermissao, UsuarioSessao } from "./types";
import { HIERARQUIA_PERMISSAO } from "./types";
import { autenticar, logoutAction } from "./mock-api";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AuthContextType {
  usuario: UsuarioSessao | null;
  loading: boolean;
  login: (user: string, senha: string) => Promise<{ ok: boolean; erro?: string }>;
  logout: () => Promise<void>;
  temPermissao: (nivelMinimo: NivelPermissao) => boolean;
}

const SESSION_KEY = "skyforge_session";

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Restaurar sessão do sessionStorage na montagem
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed: UsuarioSessao = JSON.parse(stored);
        setUsuario(parsed);
      } else if (pathname !== "/") {
        router.replace("/");
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
      if (pathname !== "/") router.replace("/");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirecionar para login se não há sessão e tenta acessar rota protegida
  useEffect(() => {
    if (!loading && !usuario && pathname !== "/") {
      router.replace("/");
    }
  }, [loading, usuario, pathname, router]);

  const login = useCallback(async (user: string, senha: string): Promise<{ ok: boolean; erro?: string }> => {
    const funcionario = await autenticar(user, senha);
    if (!funcionario) {
      return { ok: false, erro: "Usuário ou senha incorretos." };
    }

    // Salvar sem a senha
    const sessao: UsuarioSessao = {
      id: funcionario.id,
      nome: funcionario.nome,
      telefone: funcionario.telefone,
      endereco: funcionario.endereco,
      usuario: funcionario.usuario,
      nivelPermissao: funcionario.nivelPermissao,
    };

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
    setUsuario(sessao);
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await logoutAction();
    sessionStorage.removeItem(SESSION_KEY);
    setUsuario(null);
    router.replace("/");
  }, [router]);

  const temPermissao = useCallback(
    (nivelMinimo: NivelPermissao): boolean => {
      if (!usuario) return false;
      return HIERARQUIA_PERMISSAO[usuario.nivelPermissao] >= HIERARQUIA_PERMISSAO[nivelMinimo];
    },
    [usuario]
  );

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, temPermissao }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() deve ser usado dentro de <AuthProvider>");
  return ctx;
}

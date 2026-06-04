"use client";

import { useAuth } from "@/lib/auth-context";
import { Menu, LogOut } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
}

const NIVEL_COLORS: Record<string, string> = {
  ADMINISTRADOR: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  ENGENHEIRO: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  OPERADOR: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

export default function Header({ onMenuToggle }: HeaderProps) {
  const { usuario, logout } = useAuth();

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      {/* Menu hamburger + Logo (mobile) */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xl font-bold text-white font-jockey uppercase tracking-wider">
          SkyForge
        </span>
      </div>

      <div className="hidden lg:block flex-1" />

      {/* User info + logout */}
      {usuario && (
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-200">{usuario.nome}</p>
            <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full border font-medium ${NIVEL_COLORS[usuario.nivelPermissao] ?? ""}`}>
              {usuario.nivelPermissao}
            </span>
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
            {usuario.nome.charAt(0).toUpperCase()}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      )}
    </header>
  );
}

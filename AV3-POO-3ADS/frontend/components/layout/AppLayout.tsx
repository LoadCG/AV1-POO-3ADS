"use client";

import { useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, usuario } = useAuth();

  // Full-screen loading enquanto restaura sessão
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
          <p className="text-sm text-slate-500">Carregando sessão...</p>
        </div>
      </div>
    );
  }

  // Se não tem usuário, não renderiza o layout (será redirecionado pelo auth-context)
  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col min-w-0 min-h-screen lg:pl-64 transition-all duration-300">
        <Header onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

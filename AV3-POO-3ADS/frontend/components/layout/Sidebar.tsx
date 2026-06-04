"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, Users, X, Plane } from "lucide-react";
import Image from "next/image";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, nivel: null },
  { href: "/aeronaves", label: "Aeronaves", icon: Plane, nivel: null },
  { href: "/funcionarios", label: "Funcionários", icon: Users, nivel: "ADMINISTRADOR" as const },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { temPermissao } = useAuth();

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-slate-900/95 backdrop-blur-xl
          border-r border-slate-800 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 shadow-2xl lg:shadow-none flex flex-col
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8">
              <Image 
                src="/skyforge_logo.svg" 
                alt="SkyForge Logo" 
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-white font-jockey uppercase tracking-wider">
              SkyForge
            </span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 space-y-1 flex-1">
          {NAV_ITEMS.map((item) => {
            // Esconde itens que exigem permissão
            if (item.nivel && !temPermissao(item.nivel)) return null;

            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? "bg-sky-500/15 text-sky-300 shadow-inner"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-sky-400" : ""}`} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <p className="text-[11px] text-slate-500 text-center uppercase tracking-wider font-semibold font-jockey">
            SkyForge
          </p>
        </div>
      </aside>
    </>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/auth-context";
import { getAeronavesPaginated, excluirAeronaves } from "@/lib/mock-api";
import type { Aeronave, TipoAeronave } from "@/lib/types";
import { Plane, Plus, Search, Trash2, Edit2, CheckSquare, Square, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function AeronavesPage() {
  const router = useRouter();
  const { temPermissao } = useAuth();
  const [aeronaves, setAeronaves] = useState<Aeronave[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null);

  // Pagination and Filtering State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");
  const [tipo, setTipo] = useState<TipoAeronave | "ALL">("ALL");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setBuscaDebounced(busca), 500);
    return () => clearTimeout(timer);
  }, [busca]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [buscaDebounced, tipo]);

  const loadData = useCallback(() => {
    setLoading(true);
    getAeronavesPaginated({ busca: buscaDebounced, tipo, page, pageSize: 10 }).then((res) => {
      setAeronaves(res.aeronaves);
      setTotalPages(res.pages);
      setLoading(false);
      setSelecionados([]);
    });
  }, [buscaDebounced, tipo, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleSelect = (codigo: string) => {
    setSelecionados(prev => 
      prev.includes(codigo) ? prev.filter(c => c !== codigo) : [...prev, codigo]
    );
  };

  const toggleSelectAll = () => {
    if (selecionados.length === aeronaves.length && aeronaves.length > 0) {
      setSelecionados([]);
    } else {
      setSelecionados(aeronaves.map(a => a.codigo));
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const res = await excluirAeronaves(confirmDelete);
    if (res.ok) {
      toast.success(`${confirmDelete.length} aeronave(s) removida(s).`);
      setSelecionados([]);
      loadData();
    } else {
      toast.error("Erro ao excluir.");
    }
    setConfirmDelete(null);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Aeronaves</h1>
            <p className="text-sm text-slate-500 mt-1">
              Catálogo e linha de produção
            </p>
          </div>
          {temPermissao("ENGENHEIRO") && (
            <Link
              href="/aeronaves/nova"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nova Aeronave
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/50 p-4 border border-slate-800 rounded-2xl shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar por código ou modelo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-sky-500 focus:bg-slate-900 transition-colors text-sm"
            />
          </div>
          <div className="relative w-full sm:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoAeronave | "ALL")}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-sky-500 focus:bg-slate-900 transition-colors text-sm appearance-none"
            >
              <option value="ALL">Todos os tipos</option>
              <option value="COMERCIAL">Comercial</option>
              <option value="MILITAR">Militar</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selecionados.length > 0 && (
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl px-6 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-sky-300">
                {selecionados.length} item{selecionados.length > 1 ? "s" : ""} selecionado{selecionados.length > 1 ? "s" : ""}
              </span>
              <button 
                onClick={() => setSelecionados([])}
                className="text-xs text-sky-500 hover:text-sky-400 font-semibold uppercase tracking-wider"
              >
                Desmarcar todos
              </button>
            </div>
            {temPermissao("ENGENHEIRO") && (
              <button 
                onClick={() => setConfirmDelete(selecionados)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-lg transition-all border border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                Excluir Selecionados
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <LoadingSkeleton type="table" rows={4} columns={5} />
        ) : aeronaves.length === 0 ? (
          <EmptyState
            icon={<Plane className="w-8 h-8" />}
            title={buscaDebounced || tipo !== "ALL" ? "Nenhuma aeronave encontrada para os filtros atuais." : "Nenhuma aeronave cadastrada"}
            description={!buscaDebounced && tipo === "ALL" ? "Comece cadastrando a primeira aeronave do sistema." : undefined}
            action={
              !buscaDebounced && tipo === "ALL" && temPermissao("ENGENHEIRO") ? (
                <Link
                  href="/aeronaves/nova"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Cadastrar Aeronave
                </Link>
              ) : (buscaDebounced || tipo !== "ALL") ? (
                <button onClick={() => { setBusca(""); setTipo("ALL"); }} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold mt-2">
                  Limpar Filtros
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-800">
                    {temPermissao("ENGENHEIRO") && (
                      <th className="px-5 py-3.5 w-10">
                        <button onClick={toggleSelectAll} className="text-slate-500 hover:text-sky-400 transition-colors">
                          {selecionados.length === aeronaves.length && aeronaves.length > 0 ? (
                            <CheckSquare className="w-5 h-5 text-sky-500" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </th>
                    )}
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Código</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Modelo</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Capacidade</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Progresso</th>
                    {temPermissao("ENGENHEIRO") && (
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {aeronaves.map((a) => {
                    const concluidas = a.etapas.filter((e) => e.status === "CONCLUIDA").length;
                    const isSelected = selecionados.includes(a.codigo);
                    return (
                      <tr 
                        key={a.codigo} 
                        className={`border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors cursor-pointer group ${isSelected ? 'bg-sky-500/5' : ''}`}
                        onClick={() => router.push(`/aeronaves/${a.codigo}`)}
                      >
                        {temPermissao("ENGENHEIRO") && (
                          <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => toggleSelect(a.codigo)} className="text-slate-600 hover:text-sky-400 transition-colors">
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-sky-500" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>
                          </td>
                        )}
                        <td className="px-5 py-4">
                          <span className="text-sky-400 group-hover:text-sky-300 font-medium text-sm">
                            {a.codigo}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-300">{a.modelo}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-md ${a.tipo === "MILITAR" ? "bg-orange-500/15 text-orange-300" : "bg-sky-500/15 text-sky-300"}`}>
                            {a.tipo}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-400 hidden sm:table-cell">{a.capacidade} pax</td>
                        <td className="px-5 py-4 w-40">
                          <ProgressBar total={a.etapas.length} completed={concluidas} size="sm" />
                        </td>
                        <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {temPermissao("ENGENHEIRO") && (
                              <>
                                <Link 
                                  href={`/aeronaves/editar/${a.codigo}`}
                                  className="p-2 text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-all"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Link>
                                <button 
                                  onClick={() => setConfirmDelete([a.codigo])}
                                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 text-sm text-slate-400">
                <div>
                  Página <span className="font-medium text-slate-200">{page}</span> de <span className="font-medium text-slate-200">{totalPages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog 
        open={!!confirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir ${confirmDelete?.length} aeronave(s)? Esta ação não pode ser desfeita.`}
        confirmLabel="Sim, Excluir"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        variant="danger"
      />
    </AppLayout>
  );
}

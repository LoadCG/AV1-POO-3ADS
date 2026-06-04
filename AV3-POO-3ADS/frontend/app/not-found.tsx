import Link from "next/link";
import { Plane, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-24 h-24 bg-sky-500/10 border border-sky-500/20 rounded-3xl flex items-center justify-center mb-8 relative">
        <Plane className="w-12 h-12 text-sky-400 rotate-45" />
        <div className="absolute -top-3 -right-3 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-lg transform rotate-12">
          404
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-jockey tracking-widest uppercase">
        Rota Perdida no Radar
      </h1>
      <p className="text-slate-400 max-w-md mb-8">
        A página que você está tentando acessar não existe ou a aeronave responsável por ela já decolou para outro destino.
      </p>

      <Link 
        href="/dashboard"
        className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-sky-500/20"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para a Base (Dashboard)
      </Link>
    </div>
  );
}

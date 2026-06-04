// lib/types.ts — Tipos TypeScript espelhando exatamente os modelos do backend (src/models.ts e src/enums.ts)

// ─── Enums ────────────────────────────────────────────────────────────────────

export type TipoAeronave = "COMERCIAL" | "MILITAR";

export type TipoPeca = "NACIONAL" | "IMPORTADA";

export type StatusPeca = "EM_PRODUCAO" | "EM_TRANSPORTE" | "PRONTA";

export type StatusEtapa = "PENDENTE" | "ANDAMENTO" | "CONCLUIDA";

export type NivelPermissao = "ADMINISTRADOR" | "ENGENHEIRO" | "OPERADOR";

export type TipoTeste = "ELETRICO" | "HIDRAULICO" | "AERODINAMICO";

export type ResultadoTeste = "APROVADO" | "REPROVADO";

// ─── Interfaces de Entidade ───────────────────────────────────────────────────

export interface Peca {
  nome: string;
  tipo: TipoPeca;
  fornecedor: string;
  status: StatusPeca;
}

export interface Etapa {
  nome: string;
  prazo: string; // ISO date string, ex: "2025-12-31"
  status: StatusEtapa;
  funcionarios: string[]; // array de IDs de funcionários
}

export interface Teste {
  tipo: TipoTeste;
  resultado: ResultadoTeste;
}

export interface Aeronave {
  codigo: string;
  modelo: string;
  tipo: TipoAeronave;
  capacidade: number;
  alcance: number;
  pecas: Peca[];
  etapas: Etapa[];
  testes: Teste[];
}

export interface Funcionario {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
  usuario: string;
  senha: string;
  nivelPermissao: NivelPermissao;
}

// ─── Tipos auxiliares do frontend ────────────────────────────────────────────

/** Usuário da sessão (sem senha) */
export type UsuarioSessao = Omit<Funcionario, "senha">;

/** Hierarquia de permissão para comparação */
export const HIERARQUIA_PERMISSAO: Record<NivelPermissao, number> = {
  OPERADOR: 0,
  ENGENHEIRO: 1,
  ADMINISTRADOR: 2,
};

/** Verifica se um nível tem permissão >= ao nível mínimo exigido */
export function temPermissao(nivel: NivelPermissao, nivelMinimo: NivelPermissao): boolean {
  return HIERARQUIA_PERMISSAO[nivel] >= HIERARQUIA_PERMISSAO[nivelMinimo];
}

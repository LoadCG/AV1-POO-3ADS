"use server";

import prisma from "./db";
import type { Aeronave, Etapa, Funcionario, Peca, StatusEtapa, StatusPeca, Teste, TipoAeronave, NivelPermissao } from "./types";
import { HIERARQUIA_PERMISSAO } from "./types";
import { isValidString } from "./validators";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSession, getSession, deleteSession } from "./session";

async function requirePermission(nivelMinimo: NivelPermissao) {
  const session = await getSession();
  if (!session) {
    throw new Error("Não autorizado: Sessão inválida ou expirada.");
  }
  const userNivel = session.nivelPermissao as NivelPermissao;
  if (HIERARQUIA_PERMISSAO[userNivel] < HIERARQUIA_PERMISSAO[nivelMinimo]) {
    throw new Error("Não autorizado: Nível de permissão insuficiente.");
  }
  return session;
}

// Zod Schemas
const FuncionarioSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  usuario: z.string().min(3, "Usuário deve ter no mínimo 3 caracteres"),
  senha: z.string().min(4, "A senha deve ter no mínimo 4 caracteres")
    .refine(s => s === s.trim(), "A senha não pode conter espaços no início ou no fim")
    .refine(s => !/[\x00-\x1F\x7F]/.test(s), "A senha não pode conter caracteres de controle")
    .refine(s => !/[<>{}[\]"'`;\\]/.test(s), "A senha não pode conter caracteres de injeção"),
  nivelPermissao: z.enum(["ADMINISTRADOR", "ENGENHEIRO", "OPERADOR"]),
});

const AeronaveSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  modelo: z.string().min(1, "Modelo é obrigatório"),
  tipo: z.enum(["COMERCIAL", "MILITAR"]),
  capacidade: z.coerce.number().min(0, "Capacidade deve ser maior ou igual a 0"),
  alcance: z.coerce.number().min(0, "Alcance deve ser maior ou igual a 0"),
});

// Helper para sanitizar strings (trim e previne injeção básica)
function sanitizeString(str: string): string {
  if (!str) return "";
  return str.trim();
}

// ─── Aeronaves ────────────────────────────────────────────────────────────────

export async function getAeronaves(): Promise<Aeronave[]> {
  try {
    await requirePermission("OPERADOR");
    const aeronaves = await prisma.aeronave.findMany({
      include: {
        pecas: true,
        etapas: {
          include: {
            funcionarios: true,
          },
        },
        testes: true,
      },
    });

    const formatted = aeronaves.map((a) => ({
      ...a,
      etapas: a.etapas.map((e) => ({
        ...e,
        funcionarios: e.funcionarios.map((f) => f.usuario), // Retornando usernames
      })),
    }));

    return JSON.parse(JSON.stringify(formatted));
  } catch (error) {
    console.error("Erro em getAeronaves:", error);
    return [];
  }
}

export async function getAeronavesPaginated({
  busca = "",
  tipo = "ALL",
  page = 1,
  pageSize = 10,
}: {
  busca?: string;
  tipo?: TipoAeronave | "ALL";
  page?: number;
  pageSize?: number;
}) {
  try {
    await requirePermission("OPERADOR");
    const whereClause: any = {};
    if (busca) {
      whereClause.OR = [
        { codigo: { contains: busca } },
        { modelo: { contains: busca } },
      ];
    }
    if (tipo && tipo !== "ALL") {
      whereClause.tipo = tipo;
    }

    const total = await prisma.aeronave.count({ where: whereClause });
    const aeronaves = await prisma.aeronave.findMany({
      where: whereClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        pecas: true,
        etapas: {
          include: {
            funcionarios: true,
          },
        },
        testes: true,
      },
      orderBy: { codigo: 'asc' }
    });

    const formatted = aeronaves.map((a) => ({
      ...a,
      etapas: a.etapas.map((e) => ({
        ...e,
        funcionarios: e.funcionarios.map((f) => f.usuario), // Usernames
      })),
    }));

    return {
      aeronaves: JSON.parse(JSON.stringify(formatted)),
      total,
      pages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error("Erro em getAeronavesPaginated:", error);
    return { aeronaves: [], total: 0, pages: 0 };
  }
}

export async function getAeronave(codigo: string): Promise<Aeronave | null> {
  try {
    await requirePermission("OPERADOR");
    const aeronave = await prisma.aeronave.findUnique({
      where: { codigo },
      include: {
        pecas: true,
        etapas: {
          include: {
            funcionarios: true,
          },
        },
        testes: true,
      },
    });

    if (!aeronave) return null;

    const formatted = {
      ...aeronave,
      etapas: aeronave.etapas.map((e) => ({
        ...e,
        funcionarios: e.funcionarios.map((f) => f.usuario),
      })),
    };

    return JSON.parse(JSON.stringify(formatted));
  } catch (error) {
    console.error("Erro em getAeronave:", error);
    return null;
  }
}

export async function criarAeronave(data: Omit<Aeronave, "pecas" | "etapas" | "testes">): Promise<{ ok: boolean; erro?: string }> {
  try {
    await requirePermission("ENGENHEIRO");
    const parsed = AeronaveSchema.parse(data);
    const existing = await prisma.aeronave.findUnique({
      where: { codigo: parsed.codigo },
    });
    if (existing) {
      return { ok: false, erro: `Código "${parsed.codigo}" já está em uso.` };
    }

    await prisma.aeronave.create({
      data: {
        codigo: sanitizeString(parsed.codigo),
        modelo: sanitizeString(parsed.modelo),
        tipo: parsed.tipo,
        capacidade: parsed.capacidade,
        alcance: parsed.alcance,
      },
    });

    return { ok: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { ok: false, erro: (error as any).errors[0].message };
    }
    console.error("Erro ao criar aeronave:", error);
    return { ok: false, erro: "Erro interno do servidor." };
  }
}

export async function atualizarAeronave(codigo: string, data: Partial<Aeronave>): Promise<{ ok: boolean; erro?: string }> {
  try {
    await requirePermission("ENGENHEIRO");
    const existing = await prisma.aeronave.findUnique({
      where: { codigo },
    });
    if (!existing) return { ok: false, erro: "Aeronave não encontrada." };

    if (data.codigo && data.codigo !== codigo) {
      const codeInUse = await prisma.aeronave.findUnique({
        where: { codigo: data.codigo },
      });
      if (codeInUse) {
        return { ok: false, erro: `Novo código "${data.codigo}" já está em uso.` };
      }
    }

    const updateData: any = {};
    if (data.codigo) updateData.codigo = sanitizeString(data.codigo);
    if (data.modelo) updateData.modelo = sanitizeString(data.modelo);
    if (data.tipo) updateData.tipo = data.tipo;
    if (data.capacidade !== undefined) updateData.capacidade = Number(data.capacidade) || 0;
    if (data.alcance !== undefined) updateData.alcance = Number(data.alcance) || 0;

    await prisma.aeronave.update({
      where: { codigo },
      data: updateData,
    });

    return { ok: true };
  } catch (error: any) {
    console.error("Erro ao atualizar aeronave:", error);
    return { ok: false, erro: "Erro interno do servidor." };
  }
}

export async function excluirAeronaves(codigos: string[]): Promise<{ ok: boolean }> {
  try {
    await requirePermission("ENGENHEIRO");
    await prisma.aeronave.deleteMany({
      where: {
        codigo: { in: codigos },
      },
    });
    return { ok: true };
  } catch (error) {
    console.error("Erro em excluirAeronaves:", error);
    return { ok: false };
  }
}

// ─── Peças ────────────────────────────────────────────────────────────────────

export async function adicionarPeca(codigoAeronave: string, peca: Omit<Peca, "status">): Promise<{ ok: boolean; erro?: string }> {
  try {
    await requirePermission("ENGENHEIRO");
    if (!isValidString(peca.nome) || !isValidString(peca.fornecedor)) {
      return { ok: false, erro: "Dados da peça inválidos ou vazios." };
    }
    const aeronave = await prisma.aeronave.findUnique({
      where: { codigo: codigoAeronave },
    });
    if (!aeronave) return { ok: false, erro: "Aeronave não encontrada." };

    await prisma.peca.create({
      data: {
        nome: sanitizeString(peca.nome),
        tipo: peca.tipo,
        fornecedor: sanitizeString(peca.fornecedor),
        status: "EM_PRODUCAO",
        aeronaveCodigo: codigoAeronave,
      },
    });

    return { ok: true };
  } catch (error: any) {
    console.error("Erro ao adicionar peça:", error);
    return { ok: false, erro: "Erro interno do servidor." };
  }
}

export async function evoluirStatusPeca(codigoAeronave: string, indicePeca: number): Promise<{ ok: boolean; erro?: string; novoStatus?: StatusPeca }> {
  try {
    await requirePermission("OPERADOR");
    const pecas = await prisma.peca.findMany({
      where: { aeronaveCodigo: codigoAeronave },
      orderBy: { id: "asc" },
    });
    const peca = pecas[indicePeca];
    if (!peca) return { ok: false, erro: "Peça não encontrada." };

    let novoStatus: StatusPeca;
    if (peca.status === "EM_PRODUCAO") {
      novoStatus = "EM_TRANSPORTE";
    } else if (peca.status === "EM_TRANSPORTE") {
      novoStatus = "PRONTA";
    } else {
      return { ok: false, erro: `Peça "${peca.nome}" já está no status final (PRONTA).` };
    }

    await prisma.peca.update({
      where: { id: peca.id },
      data: { status: novoStatus },
    });

    return { ok: true, novoStatus };
  } catch (error: any) {
    console.error("Erro ao evoluir status da peça:", error);
    return { ok: false, erro: "Erro interno do servidor." };
  }
}

// ─── Etapas ───────────────────────────────────────────────────────────────────

export async function adicionarEtapa(codigoAeronave: string, etapa: Pick<Etapa, "nome" | "prazo">): Promise<{ ok: boolean; erro?: string }> {
  try {
    await requirePermission("ENGENHEIRO");
    if (!isValidString(etapa.nome)) {
      return { ok: false, erro: "Nome da etapa inválido." };
    }
    const aeronave = await prisma.aeronave.findUnique({
      where: { codigo: codigoAeronave },
    });
    if (!aeronave) return { ok: false, erro: "Aeronave não encontrada." };

    await prisma.etapa.create({
      data: {
        nome: sanitizeString(etapa.nome),
        prazo: sanitizeString(etapa.prazo),
        status: "PENDENTE",
        aeronaveCodigo: codigoAeronave,
      },
    });

    return { ok: true };
  } catch (error: any) {
    console.error("Erro ao adicionar etapa:", error);
    return { ok: false, erro: "Erro interno do servidor." };
  }
}

export async function iniciarEtapa(codigoAeronave: string, indiceEtapa: number): Promise<{ ok: boolean; erro?: string }> {
  try {
    await requirePermission("OPERADOR");
    const etapas = await prisma.etapa.findMany({
      where: { aeronaveCodigo: codigoAeronave },
      orderBy: { id: "asc" },
    });
    const etapa = etapas[indiceEtapa];
    if (!etapa) return { ok: false, erro: "Etapa não encontrada." };

    if (indiceEtapa > 0) {
      const anterior = etapas[indiceEtapa - 1];
      if (anterior.status !== "CONCLUIDA") {
        return { ok: false, erro: `A etapa anterior "${anterior.nome}" ainda não foi concluída.` };
      }
    }

    if (etapa.status !== "PENDENTE") {
      return { ok: false, erro: `Etapa "${etapa.nome}" não está pendente.` };
    }

    await prisma.etapa.update({
      where: { id: etapa.id },
      data: { status: "ANDAMENTO" },
    });

    return { ok: true };
  } catch (error: any) {
    console.error("Erro ao iniciar etapa:", error);
    return { ok: false, erro: "Erro interno do servidor." };
  }
}

export async function finalizarEtapa(codigoAeronave: string, indiceEtapa: number): Promise<{ ok: boolean; erro?: string }> {
  try {
    await requirePermission("OPERADOR");
    const etapas = await prisma.etapa.findMany({
      where: { aeronaveCodigo: codigoAeronave },
      include: { funcionarios: true },
      orderBy: { id: "asc" },
    });
    const etapa = etapas[indiceEtapa];
    if (!etapa) return { ok: false, erro: "Etapa não encontrada." };

    if (etapa.status !== "ANDAMENTO") {
      return { ok: false, erro: `Etapa "${etapa.nome}" não está em andamento.` };
    }

    if (etapa.funcionarios.length === 0) {
      return { ok: false, erro: `A etapa "${etapa.nome}" não possui funcionários associados. Não pode ser finalizada.` };
    }

    await prisma.etapa.update({
      where: { id: etapa.id },
      data: { status: "CONCLUIDA" },
    });

    return { ok: true };
  } catch (error: any) {
    console.error("Erro ao finalizar etapa:", error);
    return { ok: false, erro: "Erro interno do servidor." };
  }
}

export async function associarFuncionarioEtapa(
  codigoAeronave: string,
  indiceEtapa: number,
  idFuncionario: string
): Promise<{ ok: boolean; erro?: string }> {
  try {
    await requirePermission("OPERADOR");
    const etapas = await prisma.etapa.findMany({
      where: { aeronaveCodigo: codigoAeronave },
      include: { funcionarios: true },
      orderBy: { id: "asc" },
    });
    const etapa = etapas[indiceEtapa];
    if (!etapa) return { ok: false, erro: "Etapa não encontrada." };

    if (etapa.funcionarios.some((f) => f.id === idFuncionario)) {
      return { ok: false, erro: "Funcionário já está associado." };
    }

    const funcionarioExists = await prisma.funcionario.findUnique({
      where: { id: idFuncionario },
    });
    if (!funcionarioExists) return { ok: false, erro: "Funcionário não encontrado." };

    await prisma.etapa.update({
      where: { id: etapa.id },
      data: {
        funcionarios: {
          connect: { id: idFuncionario },
        },
      },
    });

    return { ok: true };
  } catch (error: any) {
    console.error("Erro ao associar funcionário à etapa:", error);
    return { ok: false, erro: "Erro interno do servidor." };
  }
}

// ─── Testes ───────────────────────────────────────────────────────────────────

export async function registrarTeste(codigoAeronave: string, teste: Teste): Promise<{ ok: boolean; erro?: string }> {
  try {
    await requirePermission("ENGENHEIRO");
    const aeronave = await prisma.aeronave.findUnique({
      where: { codigo: codigoAeronave },
    });
    if (!aeronave) return { ok: false, erro: "Aeronave não encontrada." };

    await prisma.teste.create({
      data: {
        tipo: teste.tipo,
        resultado: teste.resultado,
        aeronaveCodigo: codigoAeronave,
      },
    });

    return { ok: true };
  } catch (error: any) {
    console.error("Erro ao registrar teste:", error);
    return { ok: false, erro: "Erro interno do servidor." };
  }
}

// ─── Funcionários ─────────────────────────────────────────────────────────────

export async function getFuncionarios(): Promise<Funcionario[]> {
  try {
    await requirePermission("ADMINISTRADOR");
    const funcionarios = await prisma.funcionario.findMany();
    return JSON.parse(JSON.stringify(funcionarios));
  } catch (error) {
    console.error("Erro em getFuncionarios:", error);
    return [];
  }
}

export async function getFuncionariosPaginated({
  busca = "",
  nivelPermissao = "ALL",
  page = 1,
  pageSize = 10,
}: {
  busca?: string;
  nivelPermissao?: NivelPermissao | "ALL";
  page?: number;
  pageSize?: number;
}) {
  try {
    await requirePermission("ADMINISTRADOR");
    const whereClause: any = {};
    if (busca) {
      whereClause.OR = [
        { nome: { contains: busca } },
        { usuario: { contains: busca } },
        { telefone: { contains: busca } },
      ];
    }
    if (nivelPermissao && nivelPermissao !== "ALL") {
      whereClause.nivelPermissao = nivelPermissao;
    }

    const total = await prisma.funcionario.count({ where: whereClause });
    const funcionarios = await prisma.funcionario.findMany({
      where: whereClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { nome: 'asc' }
    });

    return {
      funcionarios: JSON.parse(JSON.stringify(funcionarios)),
      total,
      pages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error("Erro em getFuncionariosPaginated:", error);
    return { funcionarios: [], total: 0, pages: 0 };
  }
}

export async function getFuncionario(id: string): Promise<Funcionario | null> {
  try {
    await requirePermission("ADMINISTRADOR");
    const f = await prisma.funcionario.findUnique({ where: { id } });
    return f ? JSON.parse(JSON.stringify(f)) : null;
  } catch (error) {
    console.error("Erro em getFuncionario:", error);
    return null;
  }
}

export async function criarFuncionario(funcionario: Omit<Funcionario, "id">): Promise<{ ok: boolean; erro?: string }> {
  try {
    await requirePermission("ADMINISTRADOR");
    const parsed = FuncionarioSchema.parse(funcionario);

    const userExists = await prisma.funcionario.findUnique({
      where: { usuario: parsed.usuario },
    });
    if (userExists) {
      return { ok: false, erro: `Usuário "${parsed.usuario}" já está em uso.` };
    }

    const hashedSenha = await bcrypt.hash(parsed.senha, 10);

    await prisma.funcionario.create({
      data: {
        nome: sanitizeString(parsed.nome),
        telefone: sanitizeString(parsed.telefone || ""),
        endereco: sanitizeString(parsed.endereco || ""),
        usuario: sanitizeString(parsed.usuario),
        senha: hashedSenha,
        nivelPermissao: parsed.nivelPermissao,
      },
    });

    return { ok: true };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { ok: false, erro: (error as any).errors[0].message };
    }
    console.error("Erro ao criar funcionário:", error);
    return { ok: false, erro: "Erro interno do servidor." };
  }
}

export async function atualizarFuncionario(id: string, data: Partial<Funcionario>): Promise<{ ok: boolean; erro?: string }> {
  try {
    await requirePermission("ADMINISTRADOR");
    const existing = await prisma.funcionario.findUnique({
      where: { id },
    });
    if (!existing) return { ok: false, erro: "Funcionário não encontrado." };

    if (data.usuario && data.usuario !== existing.usuario) {
      const userExists = await prisma.funcionario.findUnique({
        where: { usuario: data.usuario },
      });
      if (userExists) {
        return { ok: false, erro: "Nome de usuário já existe." };
      }
    }

    const updateData: any = {};
    if (data.nome) updateData.nome = sanitizeString(data.nome);
    if (data.telefone !== undefined) updateData.telefone = sanitizeString(data.telefone);
    if (data.endereco !== undefined) updateData.endereco = sanitizeString(data.endereco);
    if (data.usuario) updateData.usuario = sanitizeString(data.usuario);
    if (data.nivelPermissao) updateData.nivelPermissao = data.nivelPermissao;

    if (data.senha) {
      if (data.senha.trim() === "" || data.senha.length < 4) {
        return { ok: false, erro: "A senha é inválida. Deve ter no mínimo 4 caracteres." };
      }
      updateData.senha = await bcrypt.hash(data.senha, 10);
    }

    await prisma.funcionario.update({
      where: { id },
      data: updateData,
    });

    return { ok: true };
  } catch (error: any) {
    console.error("Erro ao atualizar funcionário:", error);
    return { ok: false, erro: "Erro interno do servidor." };
  }
}

export async function excluirFuncionarios(ids: string[]): Promise<{ ok: boolean }> {
  try {
    await requirePermission("ADMINISTRADOR");
    await prisma.funcionario.deleteMany({
      where: {
        id: { in: ids },
      },
    });
    return { ok: true };
  } catch (error) {
    console.error("Erro em excluirFuncionarios:", error);
    return { ok: false };
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function autenticar(usuario: string, senha: string): Promise<Funcionario | null> {
  if (!isValidString(usuario) || !senha) return null;

  try {
    const f = await prisma.funcionario.findUnique({
      where: { usuario },
    });
    
    if (f) {
      const valid = await bcrypt.compare(senha, f.senha);
      if (valid) {
        const sessao = {
          id: f.id,
          nome: f.nome,
          telefone: f.telefone,
          endereco: f.endereco,
          usuario: f.usuario,
          nivelPermissao: f.nivelPermissao,
        };
        await createSession(sessao);
        return JSON.parse(JSON.stringify(f));
      }
    }
    return null;
  } catch (error) {
    console.error("Erro em autenticar:", error);
    return null;
  }
}

export async function logoutAction(): Promise<{ ok: boolean }> {
  try {
    await deleteSession();
    return { ok: true };
  } catch (error) {
    console.error("Erro ao deslogar:", error);
    return { ok: false };
  }
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  try {
    await requirePermission("OPERADOR");
    const totalAeronaves = await prisma.aeronave.count();
    const etapasEmAndamento = await prisma.etapa.count({
      where: { status: "ANDAMENTO" },
    });
    const testesReprovados = await prisma.teste.count({
      where: { resultado: "REPROVADO" },
    });
    const pecasProntas = await prisma.peca.count({
      where: { status: "PRONTA" },
    });

    return { totalAeronaves, etapasEmAndamento, testesReprovados, pecasProntas };
  } catch (error) {
    console.error("Erro em getDashboardStats:", error);
    return { totalAeronaves: 0, etapasEmAndamento: 0, testesReprovados: 0, pecasProntas: 0 };
  }
}

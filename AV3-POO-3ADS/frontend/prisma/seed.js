const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando a semente (seed) do banco de dados...");

  // 1. Caminhos para os arquivos JSON
  const dirDados = path.join(__dirname, "../../backend/dados");
  const pathFuncionarios = path.join(dirDados, "funcionarios.json");
  const pathAeronaves = path.join(dirDados, "aeronaves.json");

  // 2. Carregar e inserir funcionários do JSON
  let funcionariosJSON = [];
  if (fs.existsSync(pathFuncionarios)) {
    try {
      const raw = fs.readFileSync(pathFuncionarios, "utf8");
      funcionariosJSON = JSON.parse(raw);
      console.log(`Carregados ${funcionariosJSON.length} funcionários do arquivo JSON.`);
    } catch (e) {
      console.error("Erro ao ler funcionarios.json:", e);
    }
  }

  // Se o JSON estiver vazio ou não existir, vamos garantir que temos os usuários demo
  if (funcionariosJSON.length === 0) {
    funcionariosJSON = [
      { id: "001", nome: "Administrador", telefone: "00-0000-0000", endereco: "Sede Aerocode", usuario: "admin", senha: "admin123", nivelPermissao: "ADMINISTRADOR" },
      { id: "002", nome: "Engenheiro Chefe", telefone: "11-9999-0001", endereco: "Sede Aerocode - Engenharia", usuario: "eng01", senha: "eng123", nivelPermissao: "ENGENHEIRO" },
      { id: "003", nome: "Operador de Linha", telefone: "11-9999-0002", endereco: "Sede Aerocode - Produção", usuario: "op01", senha: "op123", nivelPermissao: "OPERADOR" }
    ];
  }

  // Mapa de IDs antigos para UUIDs novos
  const idMap = {};

  // Upsert de todos os funcionários
  for (const f of funcionariosJSON) {
    const existing = await prisma.funcionario.findUnique({ where: { usuario: f.usuario } });
    const realId = existing ? existing.id : crypto.randomUUID();
    idMap[f.id] = realId; // Mapeia o ID do JSON para o UUID real

    const hashedSenha = bcrypt.hashSync(f.senha, 10);

    await prisma.funcionario.upsert({
      where: { usuario: f.usuario },
      update: {
        nome: f.nome,
        telefone: f.telefone || "",
        endereco: f.endereco || "",
        senha: hashedSenha,
        nivelPermissao: f.nivelPermissao,
      },
      create: {
        id: realId,
        nome: f.nome,
        telefone: f.telefone || "",
        endereco: f.endereco || "",
        usuario: f.usuario,
        senha: hashedSenha,
        nivelPermissao: f.nivelPermissao,
      },
    });
  }
  console.log("Funcionários inseridos/atualizados com sucesso.");

  // Adicionar funcionário eng02 extra para o mock se não existir
  const eng02Exists = await prisma.funcionario.findUnique({ where: { usuario: "eng02" } });
  const eng02Id = eng02Exists ? eng02Exists.id : crypto.randomUUID();
  idMap["004"] = eng02Id;

  await prisma.funcionario.upsert({
    where: { usuario: "eng02" },
    update: {
      senha: bcrypt.hashSync("eng456", 10)
    },
    create: {
      id: eng02Id,
      nome: "Maria Técnica",
      telefone: "11-9999-0003",
      endereco: "Rua da Aviação, 77 — Gavião Peixoto, SP",
      usuario: "eng02",
      senha: bcrypt.hashSync("eng456", 10),
      nivelPermissao: "ENGENHEIRO",
    }
  });

  // 3. Carregar e inserir aeronaves do JSON
  let aeronavesJSON = [];
  if (fs.existsSync(pathAeronaves)) {
    try {
      const raw = fs.readFileSync(pathAeronaves, "utf8");
      aeronavesJSON = JSON.parse(raw);
      console.log(`Carregadas ${aeronavesJSON.length} aeronaves do arquivo JSON.`);
    } catch (e) {
      console.error("Erro ao ler aeronaves.json:", e);
    }
  }

  // Adicionar dados ricos se o JSON tiver apenas o avião de teste ou estiver vazio
  if (aeronavesJSON.length <= 1) {
    console.log("Injetando aeronaves ricas de demonstração (SF-001, SF-002, SF-003)...");
    aeronavesJSON = [
      {
        codigo: "SF-001",
        modelo: "Embraer E195-E2",
        tipo: "COMERCIAL",
        capacidade: 146,
        alcance: 4200,
        pecas: [
          { nome: "Motor CFM LEAP-1A", tipo: "IMPORTADA", fornecedor: "CFM International", status: "PRONTA" },
          { nome: "Asa Composta", tipo: "NACIONAL", fornecedor: "Embraer S/A", status: "PRONTA" },
          { nome: "Trem de Pouso Principal", tipo: "IMPORTADA", fornecedor: "Safran Landing Systems", status: "EM_TRANSPORTE" },
          { nome: "Avionics Suite", tipo: "IMPORTADA", fornecedor: "Honeywell Aerospace", status: "EM_PRODUCAO" },
          { nome: "Fuselagem Central", tipo: "NACIONAL", fornecedor: "Embraer S/A", status: "PRONTA" },
        ],
        etapas: [
          { nome: "Estrutura da Fuselagem", prazo: "2025-06-30", status: "CONCLUIDA", funcionarios: ["002", "003"] },
          { nome: "Instalação de Sistemas", prazo: "2025-09-30", status: "CONCLUIDA", funcionarios: ["002", "004"] },
          { nome: "Pintura e Acabamento", prazo: "2025-11-30", status: "ANDAMENTO", funcionarios: ["003"] },
          { nome: "Testes em Solo", prazo: "2025-12-31", status: "PENDENTE", funcionarios: [] },
        ],
        testes: [
          { tipo: "ELETRICO", resultado: "APROVADO" },
          { tipo: "HIDRAULICO", resultado: "REPROVADO" },
        ],
      },
      {
        codigo: "SF-002",
        modelo: "F-39 Gripen E",
        tipo: "MILITAR",
        capacidade: 1,
        alcance: 3200,
        pecas: [
          { nome: "Motor GE F414", tipo: "IMPORTADA", fornecedor: "General Electric Aviation", status: "PRONTA" },
          { nome: "Radar AESA", tipo: "IMPORTADA", fornecedor: "Leonardo S.p.A", status: "PRONTA" },
          { nome: "Estrutura Delta", tipo: "NACIONAL", fornecedor: "Saab-ELCA Brasil", status: "PRONTA" },
          { nome: "Sistema EW", tipo: "IMPORTADA", fornecedor: "Saab AB", status: "PRONTA" },
        ],
        etapas: [
          { nome: "Montagem do Motor", prazo: "2025-04-30", status: "CONCLUIDA", funcionarios: ["002"] },
          { nome: "Integração de Aviônicos", prazo: "2025-07-31", status: "CONCLUIDA", funcionarios: ["002", "004"] },
          { nome: "Testes de Sistema", prazo: "2025-10-31", status: "CONCLUIDA", funcionarios: ["003", "004"] },
          { nome: "Voo de Aceitação", prazo: "2025-12-15", status: "ANDAMENTO", funcionarios: ["002"] },
        ],
        testes: [
          { tipo: "ELETRICO", resultado: "APROVADO" },
          { tipo: "HIDRAULICO", resultado: "APROVADO" },
          { tipo: "AERODINAMICO", resultado: "APROVADO" },
        ],
      },
      {
        codigo: "SF-003",
        modelo: "Cessna 172 Skyhawk",
        tipo: "COMERCIAL",
        capacidade: 4,
        alcance: 1289,
        pecas: [
          { nome: "Motor Lycoming IO-360", tipo: "IMPORTADA", fornecedor: "Lycoming Engines", status: "EM_PRODUCAO" },
          { nome: "Hélice Hartzell", tipo: "IMPORTADA", fornecedor: "Hartzell Propeller", status: "EM_PRODUCAO" },
          { nome: "Instrumentos de Voo", tipo: "IMPORTADA", fornecedor: "Garmin Aviation", status: "EM_PRODUCAO" },
        ],
        etapas: [
          { nome: "Montagem da Célula", prazo: "2026-03-31", status: "PENDENTE", funcionarios: [] },
          { nome: "Instalação do Motor", prazo: "2026-06-30", status: "PENDENTE", funcionarios: [] },
          { nome: "Certificação ANAC", prazo: "2026-09-30", status: "PENDENTE", funcionarios: [] },
        ],
        testes: [],
      }
    ];
  }

  for (const a of aeronavesJSON) {
    // 1. Criar/atualizar a Aeronave
    await prisma.aeronave.upsert({
      where: { codigo: a.codigo },
      update: {
        modelo: a.modelo,
        tipo: a.tipo,
        capacidade: a.capacidade,
        alcance: a.alcance,
      },
      create: {
        codigo: a.codigo,
        modelo: a.modelo,
        tipo: a.tipo,
        capacidade: a.capacidade,
        alcance: a.alcance,
      },
    });

    // 2. Peças
    if (a.pecas && a.pecas.length > 0) {
      await prisma.peca.deleteMany({ where: { aeronaveCodigo: a.codigo } });
      for (const p of a.pecas) {
        await prisma.peca.create({
          data: {
            nome: p.nome,
            tipo: p.tipo,
            fornecedor: p.fornecedor,
            status: p.status,
            aeronaveCodigo: a.codigo,
          },
        });
      }
    }

    // 3. Etapas e Relações com Funcionários
    if (a.etapas && a.etapas.length > 0) {
      await prisma.etapa.deleteMany({ where: { aeronaveCodigo: a.codigo } });
      for (const e of a.etapas) {
        const funcsMapped = (e.funcionarios || []).map(oldId => idMap[oldId] || oldId);
        const realFuncs = await prisma.funcionario.findMany({
          where: {
            id: { in: funcsMapped }
          }
        });

        await prisma.etapa.create({
          data: {
            nome: e.nome,
            prazo: e.prazo,
            status: e.status,
            aeronaveCodigo: a.codigo,
            funcionarios: {
              connect: realFuncs.map(rf => ({ id: rf.id }))
            }
          },
        });
      }
    }

    // 4. Testes
    if (a.testes && a.testes.length > 0) {
      await prisma.teste.deleteMany({ where: { aeronaveCodigo: a.codigo } });
      for (const t of a.testes) {
        await prisma.teste.create({
          data: {
            tipo: t.tipo,
            resultado: t.resultado,
            aeronaveCodigo: a.codigo,
          },
        });
      }
    }
  }

  console.log("Aeronaves e sub-entidades inseridas/atualizadas com sucesso.");
  console.log("Semente concluída com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao rodar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

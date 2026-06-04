// lib/mock-data.ts — Dados mockados ricos para o frontend SkyForge

import type { Aeronave, Funcionario } from "./types";

// ─── Funcionários ─────────────────────────────────────────────────────────────

export const MOCK_FUNCIONARIOS: Funcionario[] = [
  {
    id: "001",
    nome: "Carlos Admin",
    telefone: "11-9999-0001",
    endereco: "Av. Paulista, 1000 — São Paulo, SP",
    usuario: "admin",
    senha: "admin123",
    nivelPermissao: "ADMINISTRADOR",
  },
  {
    id: "002",
    nome: "João Engenheiro",
    telefone: "11-9999-0002",
    endereco: "Rua das Indústrias, 250 — São José dos Campos, SP",
    usuario: "eng01",
    senha: "eng123",
    nivelPermissao: "ENGENHEIRO",
  },
  {
    id: "003",
    nome: "Maria Técnica",
    telefone: "11-9999-0003",
    endereco: "Rua da Aviação, 77 — Gavião Peixoto, SP",
    usuario: "eng02",
    senha: "eng456",
    nivelPermissao: "ENGENHEIRO",
  },
  {
    id: "004",
    nome: "Pedro Operador",
    telefone: "11-9999-0004",
    endereco: "Rua do Hangar, 12 — São Carlos, SP",
    usuario: "op01",
    senha: "op123",
    nivelPermissao: "OPERADOR",
  },
];

// ─── Aeronaves ────────────────────────────────────────────────────────────────

export const MOCK_AERONAVES: Aeronave[] = [
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
      {
        nome: "Estrutura da Fuselagem",
        prazo: "2025-06-30",
        status: "CONCLUIDA",
        funcionarios: ["002", "004"],
      },
      {
        nome: "Instalação de Sistemas",
        prazo: "2025-09-30",
        status: "CONCLUIDA",
        funcionarios: ["002", "003"],
      },
      {
        nome: "Pintura e Acabamento",
        prazo: "2025-11-30",
        status: "ANDAMENTO",
        funcionarios: ["003"],
      },
      {
        nome: "Testes em Solo",
        prazo: "2025-12-31",
        status: "PENDENTE",
        funcionarios: [],
      },
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
      {
        nome: "Montagem do Motor",
        prazo: "2025-04-30",
        status: "CONCLUIDA",
        funcionarios: ["002"],
      },
      {
        nome: "Integração de Aviônicos",
        prazo: "2025-07-31",
        status: "CONCLUIDA",
        funcionarios: ["002", "003"],
      },
      {
        nome: "Testes de Sistema",
        prazo: "2025-10-31",
        status: "CONCLUIDA",
        funcionarios: ["003", "004"],
      },
      {
        nome: "Voo de Aceitação",
        prazo: "2025-12-15",
        status: "ANDAMENTO",
        funcionarios: ["002"],
      },
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
      {
        nome: "Montagem da Célula",
        prazo: "2026-03-31",
        status: "PENDENTE",
        funcionarios: [],
      },
      {
        nome: "Instalação do Motor",
        prazo: "2026-06-30",
        status: "PENDENTE",
        funcionarios: [],
      },
      {
        nome: "Certificação ANAC",
        prazo: "2026-09-30",
        status: "PENDENTE",
        funcionarios: [],
      },
    ],
    testes: [],
  },
];

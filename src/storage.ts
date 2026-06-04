// storage.ts — aqui é onde a mágica acontece pra salvar tudo em arquivos JSON

import * as fs from "fs";
import * as path from "path";
import { Aeronave, Funcionario, Peca, Etapa, Teste } from "./models";
import { TipoAeronave, TipoPeca, StatusPeca, StatusEtapa, NivelPermissao, TipoTeste, ResultadoTeste } from "./enums";

const DIR_DADOS = path.join(__dirname, "../dados");
const ARQUIVO_AERONAVES = path.join(DIR_DADOS, "aeronaves.json");
const ARQUIVO_FUNCIONARIOS = path.join(DIR_DADOS, "funcionarios.json");

// cria a pasta "dados" se ela ainda não existir
function garantirPasta(): void {
  if (!fs.existsSync(DIR_DADOS)) {
    fs.mkdirSync(DIR_DADOS, { recursive: true });
  }
}

// grava a lista de aeronaves no arquivo
export function salvarAeronaves(aeronaves: Aeronave[]): void {
  try {
    garantirPasta();
    fs.writeFileSync(ARQUIVO_AERONAVES, JSON.stringify(aeronaves, null, 2), "utf8");
  } catch (error) {
    console.error("\x1b[31m❌ Erro ao salvar aeronaves:\x1b[0m", error);
  }
}

// pega as aeronaves do arquivo e transforma de volta em objetos (pra não perder as funções)
export function carregarAeronaves(): Aeronave[] {
  try {
    garantirPasta();
    if (!fs.existsSync(ARQUIVO_AERONAVES)) return [];

    const raw = JSON.parse(fs.readFileSync(ARQUIVO_AERONAVES, "utf8"));
    return raw.map((a: any) => {
      const aeronave = new Aeronave(a.codigo, a.modelo, a.tipo as TipoAeronave, a.capacidade, a.alcance);

      // bota as peças de volta
      aeronave.pecas = (a.pecas || []).map((p: any) => {
        const peca = new Peca(p.nome, p.tipo as TipoPeca, p.fornecedor);
        peca.status = p.status as StatusPeca;
        return peca;
      });

      // bota as etapas de volta
      aeronave.etapas = (a.etapas || []).map((e: any) => {
        const etapa = new Etapa(e.nome, e.prazo);
        etapa.status = e.status as StatusEtapa;
        etapa.funcionarios = e.funcionarios || [];
        return etapa;
      });

      // bota os testes de volta
      aeronave.testes = (a.testes || []).map((t: any) => {
        return new Teste(t.tipo as TipoTeste, t.resultado as ResultadoTeste);
      });

      return aeronave;
    });
  } catch (error) {
    console.error("\x1b[31m❌ Erro ao carregar aeronaves (arquivo corrompido?):\x1b[0m", error);
    return [];
  }
}

// guarda os funcionários no arquivo
export function salvarFuncionarios(funcionarios: Funcionario[]): void {
  try {
    garantirPasta();
    fs.writeFileSync(ARQUIVO_FUNCIONARIOS, JSON.stringify(funcionarios, null, 2), "utf8");
  } catch (error) {
    console.error("\x1b[31m❌ Erro ao salvar funcionários:\x1b[0m", error);
  }
}

// pega os funcionários do arquivo e transforma em objetos de novo
export function carregarFuncionarios(): Funcionario[] {
  try {
    garantirPasta();
    if (!fs.existsSync(ARQUIVO_FUNCIONARIOS)) return [];

    const raw = JSON.parse(fs.readFileSync(ARQUIVO_FUNCIONARIOS, "utf8"));
    return raw.map((f: any) => new Funcionario(
      f.id, f.nome, f.telefone, f.endereco,
      f.usuario, f.senha, f.nivelPermissao as NivelPermissao
    ));
  } catch (error) {
    console.error("\x1b[31m❌ Erro ao carregar funcionários (arquivo corrompido?):\x1b[0m", error);
    return [];
  }
}

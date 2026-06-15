import * as fs from "fs";
import * as path from "path";
import { Aeronave, Funcionario, Peca, Etapa, Teste } from "./models";
import { TipoAeronave, TipoPeca, StatusPeca, StatusEtapa, NivelPermissao, TipoTeste, ResultadoTeste } from "./enums";
import { hashSenha, isSenhaHashed } from "./auth";

const DIR_DADOS = path.join(process.cwd(), "dados");
const ARQUIVO_AERONAVES = path.join(DIR_DADOS, "aeronaves.json");
const ARQUIVO_FUNCIONARIOS = path.join(DIR_DADOS, "funcionarios.json");

function garantirPasta(): void {
  if (!fs.existsSync(DIR_DADOS)) {
    fs.mkdirSync(DIR_DADOS, { recursive: true });
  }
}

export function salvarAeronaves(aeronaves: Aeronave[]): void {
  try {
    garantirPasta();
    fs.writeFileSync(ARQUIVO_AERONAVES, JSON.stringify(aeronaves, null, 2), "utf8");
  } catch (error) {
    console.error("\x1b[31mErro ao salvar aeronaves:\x1b[0m", error);
  }
}

export function carregarAeronaves(): Aeronave[] {
  try {
    garantirPasta();
    if (!fs.existsSync(ARQUIVO_AERONAVES)) return [];

    const raw = JSON.parse(fs.readFileSync(ARQUIVO_AERONAVES, "utf8"));
    return raw.map((a: any) => {
      const aeronave = new Aeronave(a.codigo, a.modelo, a.tipo as TipoAeronave, a.capacidade, a.alcance);

      aeronave.pecas = (a.pecas || []).map((p: any) => {
        const peca = new Peca(p.nome, p.tipo as TipoPeca, p.fornecedor);
        peca.status = p.status as StatusPeca;
        return peca;
      });

      aeronave.etapas = (a.etapas || []).map((e: any) => {
        const etapa = new Etapa(e.nome, e.prazo);
        etapa.status = e.status as StatusEtapa;
        etapa.funcionarios = e.funcionarios || [];
        return etapa;
      });

      aeronave.testes = (a.testes || []).map((t: any) => {
        return new Teste(t.tipo as TipoTeste, t.resultado as ResultadoTeste);
      });

      return aeronave;
    });
  } catch (error) {
    console.error("\x1b[31mErro ao carregar aeronaves (arquivo corrompido?):\x1b[0m", error);
    return [];
  }
}

export function salvarFuncionarios(funcionarios: Funcionario[]): void {
  try {
    garantirPasta();
    fs.writeFileSync(ARQUIVO_FUNCIONARIOS, JSON.stringify(funcionarios, null, 2), "utf8");
  } catch (error) {
    console.error("\x1b[31mErro ao salvar funcionarios:\x1b[0m", error);
  }
}

export function carregarFuncionarios(): Funcionario[] {
  try {
    garantirPasta();
    if (!fs.existsSync(ARQUIVO_FUNCIONARIOS)) return [];

    const raw = JSON.parse(fs.readFileSync(ARQUIVO_FUNCIONARIOS, "utf8"));
    let precisaSalvar = false;

    const funcionarios = raw.map((f: any) => {
      let senha = f.senha as string;

      // Migra senhas em texto puro para hash seguro
      if (!isSenhaHashed(senha)) {
        senha = hashSenha(senha);
        precisaSalvar = true;
      }

      return new Funcionario(
        f.id, f.nome, f.telefone, f.endereco,
        f.usuario, senha, f.nivelPermissao as NivelPermissao
      );
    });

    if (precisaSalvar) {
      fs.writeFileSync(ARQUIVO_FUNCIONARIOS, JSON.stringify(funcionarios, null, 2), "utf8");
    }

    return funcionarios;
  } catch (error) {
    console.error("\x1b[31mErro ao carregar funcionarios (arquivo corrompido?):\x1b[0m", error);
    return [];
  }
}

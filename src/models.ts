import * as fs from "fs";
import * as path from "path";
import {
  TipoAeronave, TipoPeca, StatusPeca,
  StatusEtapa, NivelPermissao, TipoTeste, ResultadoTeste
} from "./enums";
import { vermelho, verde, amarelo, ciano, negrito } from "./cores";

const DIR_DADOS = path.join(__dirname, "../dados");

function garantirPasta(): void {
  if (!fs.existsSync(DIR_DADOS)) {
    fs.mkdirSync(DIR_DADOS, { recursive: true });
  }
}

export class Peca {
  nome: string;
  tipo: TipoPeca;
  fornecedor: string;
  status: StatusPeca;

  constructor(nome: string, tipo: TipoPeca, fornecedor: string) {
    this.nome = nome;
    this.tipo = tipo;
    this.fornecedor = fornecedor;
    this.status = StatusPeca.EM_PRODUCAO;
  }

  atualizarStatus(novoStatus: StatusPeca): void {
    const ordemStatus = [StatusPeca.EM_PRODUCAO, StatusPeca.EM_TRANSPORTE, StatusPeca.PRONTA];
    const atualIdx = ordemStatus.indexOf(this.status);
    const novoIdx = ordemStatus.indexOf(novoStatus);

    if (novoIdx <= atualIdx) {
      console.log(vermelho(`Peça "${this.nome}": não é possível retroceder o status (atual: ${this.status}).`));
      return;
    }
    this.status = novoStatus;
  }

  salvar(): void {
    // Peça é persistida como parte da Aeronave à qual pertence
  }

  carregar(): void {
    // Peça é carregada como parte da Aeronave à qual pertence
  }

  exibir(): void {
    let statusColorido = this.status as string;
    if (this.status === StatusPeca.PRONTA) statusColorido = verde(this.status);
    if (this.status === StatusPeca.EM_PRODUCAO) statusColorido = amarelo(this.status);
    if (this.status === StatusPeca.EM_TRANSPORTE) statusColorido = ciano(this.status);

    console.log(`  Peça: ${negrito(this.nome)} | Tipo: ${this.tipo} | Fornecedor: ${this.fornecedor} | Status: ${statusColorido}`);
  }
}

export class Funcionario {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
  usuario: string;
  senha: string;
  nivelPermissao: NivelPermissao;

  constructor(
    id: string, nome: string, telefone: string, endereco: string,
    usuario: string, senha: string, nivelPermissao: NivelPermissao
  ) {
    this.id = id;
    this.nome = nome;
    this.telefone = telefone;
    this.endereco = endereco;
    this.usuario = usuario;
    this.senha = senha;
    this.nivelPermissao = nivelPermissao;
  }

  autenticar(usuario: string, senhaHash: string): boolean {
    return this.usuario === usuario && this.senha === senhaHash;
  }

  salvar(): void {
    garantirPasta();
    const nomeArquivo = `funcionario_${this.id.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`;
    fs.writeFileSync(
      path.join(DIR_DADOS, nomeArquivo),
      JSON.stringify(this, null, 2),
      "utf8"
    );
  }

  carregar(): void {
    const nomeArquivo = `funcionario_${this.id.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`;
    const caminho = path.join(DIR_DADOS, nomeArquivo);
    if (!fs.existsSync(caminho)) return;
    try {
      const raw = JSON.parse(fs.readFileSync(caminho, "utf8"));
      this.nome = raw.nome;
      this.telefone = raw.telefone;
      this.endereco = raw.endereco;
      this.usuario = raw.usuario;
      this.senha = raw.senha;
      this.nivelPermissao = raw.nivelPermissao;
    } catch {
      console.log(vermelho(`Erro ao carregar dados do funcionário ${this.id}.`));
    }
  }

  exibir(): void {
    console.log(`  Funcionário: [${ciano(this.id)}] ${negrito(this.nome)} | Tel: ${this.telefone} | Nível: ${amarelo(this.nivelPermissao)}`);
  }
}

export class Etapa {
  nome: string;
  prazo: string;
  status: StatusEtapa;
  funcionarios: string[];

  constructor(nome: string, prazo: string) {
    this.nome = nome;
    this.prazo = prazo;
    this.status = StatusEtapa.PENDENTE;
    this.funcionarios = [];
  }

  iniciar(): boolean {
    if (this.status === StatusEtapa.PENDENTE) {
      this.status = StatusEtapa.ANDAMENTO;
      return true;
    }
    console.log(vermelho(`Etapa "${this.nome}" não pode ser iniciada (status atual: ${this.status})`));
    return false;
  }

  finalizar(): boolean {
    if (this.status !== StatusEtapa.ANDAMENTO) {
      console.log(vermelho(`Etapa "${this.nome}" não pode ser concluída (status atual: ${this.status})`));
      return false;
    }

    if (this.funcionarios.length === 0) {
      console.log(vermelho(`Etapa "${this.nome}" não possui funcionários associados. Associe ao menos um antes de finalizar.`));
      return false;
    }

    this.status = StatusEtapa.CONCLUIDA;
    return true;
  }

  associarFuncionario(funcionario: Funcionario): void {
    if (this.funcionarios.includes(funcionario.id)) {
      console.log(amarelo(`Funcionário ${funcionario.id} já está associado a esta etapa.`));
    } else {
      this.funcionarios.push(funcionario.id);
    }
  }

  listarFuncionarios(): string[] {
    return this.funcionarios;
  }

  salvar(): void {
    // Etapa é persistida como parte da Aeronave à qual pertence
  }

  carregar(): void {
    // Etapa é carregada como parte da Aeronave à qual pertence
  }

  exibir(): void {
    let statusColorido = this.status as string;
    if (this.status === StatusEtapa.CONCLUIDA) statusColorido = verde(this.status);
    if (this.status === StatusEtapa.ANDAMENTO) statusColorido = amarelo(this.status);
    if (this.status === StatusEtapa.PENDENTE) statusColorido = ciano(this.status);

    console.log(`  Etapa: ${negrito(this.nome)} | Prazo: ${this.prazo} | Status: ${statusColorido} | Funcionários: ${this.funcionarios.join(", ") || "nenhum"}`);
  }
}

export class Teste {
  tipo: TipoTeste;
  resultado: ResultadoTeste;

  constructor(tipo: TipoTeste, resultado: ResultadoTeste) {
    this.tipo = tipo;
    this.resultado = resultado;
  }

  salvar(): void {
    // Teste é persistido como parte da Aeronave à qual pertence
  }

  carregar(): void {
    // Teste é carregado como parte da Aeronave à qual pertence
  }

  exibir(): void {
    let resultColorido = this.resultado as string;
    if (this.resultado === ResultadoTeste.APROVADO) resultColorido = verde(this.resultado);
    if (this.resultado === ResultadoTeste.REPROVADO) resultColorido = vermelho(this.resultado);

    console.log(`  Teste: ${this.tipo} | Resultado: ${resultColorido}`);
  }
}

export class Aeronave {
  codigo: string;
  modelo: string;
  tipo: TipoAeronave;
  capacidade: number;
  alcance: number;
  pecas: Peca[];
  etapas: Etapa[];
  testes: Teste[];

  constructor(codigo: string, modelo: string, tipo: TipoAeronave, capacidade: number, alcance: number) {
    this.codigo = codigo;
    this.modelo = modelo;
    this.tipo = tipo;
    this.capacidade = capacidade;
    this.alcance = alcance;
    this.pecas = [];
    this.etapas = [];
    this.testes = [];
  }

  detalhes(): void {
    console.log(ciano("\n" + "=".repeat(40)));
    console.log(ciano(`       DETALHES DA AERONAVE: ${negrito(this.codigo)}`));
    console.log(ciano("=".repeat(40)));

    this.exibirResumoInteligente();

    console.log(`Modelo: ${negrito(this.modelo)}`);
    console.log(`Tipo: ${this.tipo}`);
    console.log(`Capacidade: ${this.capacidade} passageiros`);
    console.log(`Alcance: ${this.alcance} km`);

    this.exibirBarraProgresso();

    console.log(ciano("\n--- Peças ---"));
    if (this.pecas.length === 0) console.log("  Nenhuma peça cadastrada.");
    else this.pecas.forEach(p => p.exibir());

    console.log(ciano("\n--- Etapas ---"));
    if (this.etapas.length === 0) console.log("  Nenhuma etapa cadastrada.");
    else this.etapas.forEach(e => e.exibir());

    console.log(ciano("\n--- Testes ---"));
    if (this.testes.length === 0) console.log("  Nenhum teste registrado.");
    else this.testes.forEach(t => t.exibir());

    console.log(ciano("\n" + "=".repeat(40) + "\n"));
  }

  salvar(): void {
    garantirPasta();
    const nomeArquivo = `aeronave_${this.codigo.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`;
    fs.writeFileSync(
      path.join(DIR_DADOS, nomeArquivo),
      JSON.stringify(this, null, 2),
      "utf8"
    );
  }

  carregar(): void {
    const nomeArquivo = `aeronave_${this.codigo.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`;
    const caminho = path.join(DIR_DADOS, nomeArquivo);
    if (!fs.existsSync(caminho)) return;
    try {
      const raw = JSON.parse(fs.readFileSync(caminho, "utf8"));
      this.modelo = raw.modelo;
      this.tipo = raw.tipo;
      this.capacidade = raw.capacidade;
      this.alcance = raw.alcance;
      this.pecas = raw.pecas || [];
      this.etapas = raw.etapas || [];
      this.testes = raw.testes || [];
    } catch {
      console.log(vermelho(`Erro ao carregar dados da aeronave ${this.codigo}.`));
    }
  }

  private exibirResumoInteligente(): void {
    const pecasEmProducao = this.pecas.filter(p => p.status !== StatusPeca.PRONTA).length;
    const testesReprovados = this.testes.filter(t => t.resultado === ResultadoTeste.REPROVADO).length;
    const etapasConcluidas = this.etapas.filter(e => e.status === StatusEtapa.CONCLUIDA).length;

    console.log(negrito("Resumo de Status:"));

    if (pecasEmProducao > 0) {
      console.log(`  ${amarelo("!")}  ${pecasEmProducao} peca(s) ainda em producao/transporte.`);
    } else if (this.pecas.length > 0) {
      console.log(`  ${verde("OK")}  Todas as pecas estao prontas.`);
    }

    if (testesReprovados > 0) {
      console.log(`  ${vermelho("X")}  ${testesReprovados} teste(s) reprovado(s)!`);
    } else if (this.testes.length > 0) {
      console.log(`  ${verde("OK")}  Todos os testes foram aprovados.`);
    }

    if (etapasConcluidas === this.etapas.length && this.etapas.length > 0) {
      console.log(`  ${verde("OK")}  Todas as etapas concluidas.`);
    } else if (this.etapas.length > 0) {
      console.log(`  [i]  Producao em andamento (${etapasConcluidas}/${this.etapas.length} etapas).`);
    }
    console.log("");
  }

  private exibirBarraProgresso(): void {
    if (this.etapas.length === 0) return;

    const total = this.etapas.length;
    const concluidas = this.etapas.filter(e => e.status === StatusEtapa.CONCLUIDA).length;
    const porcentagem = Math.floor((concluidas / total) * 10);

    const barra = "#".repeat(porcentagem) + "-".repeat(10 - porcentagem);

    console.log(`\nProgresso da Producao: [${verde(barra)}] ${concluidas}/${total} etapas concluidas`);
  }
}

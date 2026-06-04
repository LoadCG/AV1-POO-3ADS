// models.ts — aqui ficam as classes que representam nossas coisas (avião, peças, pessoas...)

import {
  TipoAeronave, TipoPeca, StatusPeca,
  StatusEtapa, NivelPermissao, TipoTeste, ResultadoTeste
} from "./enums";
import { vermelho, verde, amarelo, ciano, negrito } from "./cores";

// cada peça que vai no avião
export class Peca {
  nome: string;
  tipo: TipoPeca;
  fornecedor: string;
  status: StatusPeca;

  constructor(nome: string, tipo: TipoPeca, fornecedor: string) {
    this.nome = nome;
    this.tipo = tipo;
    this.fornecedor = fornecedor;
    this.status = StatusPeca.EM_PRODUCAO; // começa em produção por padrão
  }

  // muda o status da peça na ordem: produção -> transporte -> pronta
  atualizarStatus(): void {
    if (this.status === StatusPeca.EM_PRODUCAO) {
      this.status = StatusPeca.EM_TRANSPORTE;
    } else if (this.status === StatusPeca.EM_TRANSPORTE) {
      this.status = StatusPeca.PRONTA;
    } else {
      console.log(vermelho(`Peça "${this.nome}" já está PRONTA, não dá pra avançar mais.`));
    }
  }

  exibir(): void {
    let statusColorido = this.status as string;
    if (this.status === StatusPeca.PRONTA) statusColorido = verde(this.status);
    if (this.status === StatusPeca.EM_PRODUCAO) statusColorido = amarelo(this.status);
    if (this.status === StatusPeca.EM_TRANSPORTE) statusColorido = ciano(this.status);

    console.log(`  Peça: ${negrito(this.nome)} | Tipo: ${this.tipo} | Fornecedor: ${this.fornecedor} | Status: ${statusColorido}`);
  }
}

// quem trabalha na fábrica
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

  // só checa se a senha é igual, bem simples
  autenticar(usuario: string, senha: string): boolean {
    return this.usuario === usuario && this.senha === senha;
  }

  exibir(): void {
    console.log(`  Funcionário: [${ciano(this.id)}] ${negrito(this.nome)} | Tel: ${this.telefone} | Nível: ${amarelo(this.nivelPermissao)}`);
  }
}

// uma das fases da fabricação
export class Etapa {
  nome: string;
  prazo: string; // ex: "2025-12-31"
  status: StatusEtapa;
  funcionarios: string[]; // guarda os IDs dos funcionários associados

  constructor(nome: string, prazo: string) {
    this.nome = nome;
    this.prazo = prazo;
    this.status = StatusEtapa.PENDENTE;
    this.funcionarios = [];
  }

  // começa o trabalho se tiver pendente
  iniciar(): boolean {
    if (this.status === StatusEtapa.PENDENTE) {
      this.status = StatusEtapa.ANDAMENTO;
      return true;
    }
    console.log(vermelho(`Etapa "${this.nome}" não pode ser iniciada (status atual: ${this.status})`));
    return false;
  }

  // termina o trabalho se tiver em andamento
  finalizar(): boolean {
    if (this.status !== StatusEtapa.ANDAMENTO) {
      console.log(vermelho(`Etapa "${this.nome}" não pode ser concluída (status atual: ${this.status})`));
      return false;
    }

    if (this.funcionarios.length === 0) {
      console.log(vermelho(`❌ Erro: A etapa "${this.nome}" não possui funcionários associados. Não pode ser finalizada.`));
      return false;
    }

    this.status = StatusEtapa.CONCLUIDA;
    return true;
  }

  // bota uma pessoa pra trabalhar nessa etapa
  associarFuncionario(idFuncionario: string): void {
    if (this.funcionarios.includes(idFuncionario)) {
      console.log(amarelo(`Funcionário ${idFuncionario} já está nesta etapa.`));
    } else {
      this.funcionarios.push(idFuncionario);
    }
  }

  listarFuncionarios(): string[] {
    return this.funcionarios;
  }

  exibir(): void {
    let statusColorido = this.status as string;
    if (this.status === StatusEtapa.CONCLUIDA) statusColorido = verde(this.status);
    if (this.status === StatusEtapa.ANDAMENTO) statusColorido = amarelo(this.status);
    if (this.status === StatusEtapa.PENDENTE) statusColorido = ciano(this.status);

    console.log(`  Etapa: ${negrito(this.nome)} | Prazo: ${this.prazo} | Status: ${statusColorido} | Funcionários: ${this.funcionarios.join(", ") || "nenhum"}`);
  }
}

// ficha de um teste de qualidade
export class Teste {
  tipo: TipoTeste;
  resultado: ResultadoTeste;

  constructor(tipo: TipoTeste, resultado: ResultadoTeste) {
    this.tipo = tipo;
    this.resultado = resultado;
  }

  exibir(): void {
    let resultColorido = this.resultado as string;
    if (this.resultado === ResultadoTeste.APROVADO) resultColorido = verde(this.resultado);
    if (this.resultado === ResultadoTeste.REPROVADO) resultColorido = vermelho(this.resultado);

    console.log(`  Teste: ${this.tipo} | Resultado: ${resultColorido}`);
  }
}

// o avião em si, que junta tudo (peças, etapas, testes)
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

  // mostra um resumão bonito de tudo da aeronave
  exibirDetalhes(): void {
    console.log(ciano("\n" + "=".repeat(40)));
    console.log(ciano(`       DETALHES DA AERONAVE: ${negrito(this.codigo)}`));
    console.log(ciano("=".repeat(40)));

    // telinha de resumo rápido com ícones
    this.exibirResumoInteligente();

    console.log(`Modelo: ${negrito(this.modelo)}`);
    console.log(`Tipo: ${this.tipo}`);
    console.log(`Capacidade: ${this.capacidade} passageiros`);
    console.log(`Alcance: ${this.alcance} km`);

    // desenha aquela barra de progresso no console
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

  private exibirResumoInteligente(): void {
    const pecasEmProducao = this.pecas.filter(p => p.status !== StatusPeca.PRONTA).length;
    const testesReprovados = this.testes.filter(t => t.resultado === ResultadoTeste.REPROVADO).length;
    const etapasConcluidas = this.etapas.filter(e => e.status === StatusEtapa.CONCLUIDA).length;

    console.log(negrito("Resumo de Status:"));
    
    if (pecasEmProducao > 0) {
      console.log(`  ${amarelo("⚠️")}  ${pecasEmProducao} peça(s) ainda em produção/transporte.`);
    } else if (this.pecas.length > 0) {
      console.log(`  ${verde("✅")}  Todas as peças estão prontas.`);
    }

    if (testesReprovados > 0) {
      console.log(`  ${vermelho("❌")}  ${testesReprovados} teste(s) reprovado(s)!`);
    } else if (this.testes.length > 0) {
      console.log(`  ${verde("✅")}  Todos os testes foram aprovados.`);
    }

    if (etapasConcluidas === this.etapas.length && this.etapas.length > 0) {
      console.log(`  ${verde("✅")}  Todas as etapas concluídas.`);
    } else if (this.etapas.length > 0) {
      console.log(`  ${amarelo("ℹ️")}  Produção em andamento (${etapasConcluidas}/${this.etapas.length} etapas).`);
    }
    console.log("");
  }

  private exibirBarraProgresso(): void {
    if (this.etapas.length === 0) return;

    const total = this.etapas.length;
    const concluidas = this.etapas.filter(e => e.status === StatusEtapa.CONCLUIDA).length;
    const porcentagem = Math.floor((concluidas / total) * 10);
    
    const barra = "█".repeat(porcentagem) + "░".repeat(10 - porcentagem);
    
    console.log(`\nProgresso da Produção: [${verde(barra)}] ${concluidas}/${total} etapas concluídas`);
  }
}

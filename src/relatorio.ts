import * as fs from "fs";
import * as path from "path";
import { Aeronave } from "./models";
import { verde, ciano, vermelho, amarelo } from "./cores";

const DIR_RELATORIOS = path.join(__dirname, "../relatorios");

function sanitizarNomeArquivo(valor: string): string {
  return valor.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
}

export class Relatorio {
  private aeronave: Aeronave | null = null;
  private nomeCliente: string = "";
  private dataEntrega: string = "";
  private conteudo: string = "";

  gerarRelatorio(aeronave: Aeronave, nomeCliente: string, dataEntrega: string): void {
    this.aeronave = aeronave;
    this.nomeCliente = nomeCliente.trim();
    this.dataEntrega = dataEntrega.trim();
    this.conteudo = this.montarConteudo();
    console.log("\n" + ciano(this.conteudo));
  }

  salvarEmArquivo(): void {
    if (!this.aeronave || this.conteudo === "") {
      console.log(vermelho("Nenhum relatorio foi gerado ainda. Execute gerarRelatorio() primeiro."));
      return;
    }

    if (!fs.existsSync(DIR_RELATORIOS)) {
      fs.mkdirSync(DIR_RELATORIOS, { recursive: true });
    }

    const codigoSafe = sanitizarNomeArquivo(this.aeronave.codigo);
    const dataSafe = sanitizarNomeArquivo(this.dataEntrega);
    const nomeArquivo = `relatorio_${codigoSafe}_${dataSafe}.txt`;
    const caminhoArquivo = path.join(DIR_RELATORIOS, nomeArquivo);

    fs.writeFileSync(caminhoArquivo, this.conteudo, "utf8");
    console.log(verde(`Relatorio salvo em: relatorios/${nomeArquivo}`));
  }

  carregar(): void {
    if (!fs.existsSync(DIR_RELATORIOS)) {
      console.log(amarelo("Nenhum relatorio encontrado (pasta nao existe)."));
      return;
    }

    const arquivos = fs.readdirSync(DIR_RELATORIOS).filter(f => f.endsWith(".txt"));

    if (arquivos.length === 0) {
      console.log(amarelo("Nenhum relatorio salvo encontrado."));
      return;
    }

    console.log(ciano("\n--- Relatorios Salvos ---"));
    arquivos.forEach((arq, i) => {
      console.log(`${i + 1}. ${arq}`);
    });
  }

  private montarConteudo(): string {
    if (!this.aeronave) return "";

    let c = "";
    c += "===========================================\n";
    c += "      RELATORIO DE ENTREGA - AEROCODE      \n";
    c += "===========================================\n\n";

    c += `Data de Entrega: ${this.dataEntrega}\n`;
    c += `Cliente: ${this.nomeCliente}\n\n`;

    c += "--- AERONAVE ---\n";
    c += `Codigo: ${this.aeronave.codigo}\n`;
    c += `Modelo: ${this.aeronave.modelo}\n`;
    c += `Tipo: ${this.aeronave.tipo}\n`;
    c += `Capacidade: ${this.aeronave.capacidade} passageiros\n`;
    c += `Alcance: ${this.aeronave.alcance} km\n\n`;

    c += "--- PECAS UTILIZADAS ---\n";
    if (this.aeronave.pecas.length === 0) {
      c += "Nenhuma peca registrada.\n";
    } else {
      this.aeronave.pecas.forEach(p => {
        c += `  - ${p.nome} | Tipo: ${p.tipo} | Fornecedor: ${p.fornecedor} | Status: ${p.status}\n`;
      });
    }

    c += "\n--- ETAPAS REALIZADAS ---\n";
    if (this.aeronave.etapas.length === 0) {
      c += "Nenhuma etapa registrada.\n";
    } else {
      this.aeronave.etapas.forEach(e => {
        c += `  - ${e.nome} | Prazo: ${e.prazo} | Status: ${e.status}\n`;
        if (e.funcionarios.length > 0) {
          c += `    Funcionarios: ${e.funcionarios.join(", ")}\n`;
        }
      });
    }

    c += "\n--- RESULTADOS DE TESTES ---\n";
    if (this.aeronave.testes.length === 0) {
      c += "Nenhum teste registrado.\n";
    } else {
      this.aeronave.testes.forEach(t => {
        c += `  - ${t.tipo}: ${t.resultado}\n`;
      });
    }

    c += "\n===========================================\n";
    c += "           FIM DO RELATORIO               \n";
    c += "===========================================\n";

    return c;
  }
}

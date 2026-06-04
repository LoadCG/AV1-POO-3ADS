// relatorio.ts — aqui a gente monta aquele arquivo .txt bonitão pra entregar pro cliente

import * as fs from "fs";
import * as path from "path";
import { Aeronave } from "./models";
import { verde, ciano, negrito } from "./cores";

const DIR_RELATORIOS = path.join(__dirname, "../relatorios");

// cria o texto do relatório e salva na pasta "relatorios"
export function gerarRelatorio(aeronave: Aeronave, nomeCliente: string, dataEntrega: string): void {
  if (!fs.existsSync(DIR_RELATORIOS)) {
    fs.mkdirSync(DIR_RELATORIOS, { recursive: true });
  }

  let conteudo = "";
  conteudo += "===========================================\n";
  conteudo += "       RELATÓRIO DE ENTREGA - SKYFORGE     \n";
  conteudo += "===========================================\n\n";

  conteudo += `Data de Entrega: ${dataEntrega}\n`;
  conteudo += `Cliente: ${nomeCliente}\n\n`;

  conteudo += "--- AERONAVE ---\n";
  conteudo += `Código: ${aeronave.codigo}\n`;
  conteudo += `Modelo: ${aeronave.modelo}\n`;
  conteudo += `Tipo: ${aeronave.tipo}\n`;
  conteudo += `Capacidade: ${aeronave.capacidade} passageiros\n`;
  conteudo += `Alcance: ${aeronave.alcance} km\n\n`;

  conteudo += "--- PEÇAS UTILIZADAS ---\n";
  if (aeronave.pecas.length === 0) {
    conteudo += "Nenhuma peça registrada.\n";
  } else {
    aeronave.pecas.forEach(p => {
      conteudo += `  - ${p.nome} | Tipo: ${p.tipo} | Fornecedor: ${p.fornecedor} | Status: ${p.status}\n`;
    });
  }

  conteudo += "\n--- ETAPAS REALIZADAS ---\n";
  if (aeronave.etapas.length === 0) {
    conteudo += "Nenhuma etapa registrada.\n";
  } else {
    aeronave.etapas.forEach(e => {
      conteudo += `  - ${e.nome} | Prazo: ${e.prazo} | Status: ${e.status}\n`;
      if (e.funcionarios.length > 0) {
        conteudo += `    Funcionários: ${e.funcionarios.join(", ")}\n`;
      }
    });
  }

  conteudo += "\n--- RESULTADOS DE TESTES ---\n";
  if (aeronave.testes.length === 0) {
    conteudo += "Nenhum teste registrado.\n";
  } else {
    aeronave.testes.forEach(t => {
      conteudo += `  - ${t.tipo}: ${t.resultado}\n`;
    });
  }

  conteudo += "\n===========================================\n";
  conteudo += "           FIM DO RELATÓRIO               \n";
  conteudo += "===========================================\n";

  // monta o nome do arquivo usando o código do avião e a data pra ficar fácil de achar
  const nomeArquivo = `relatorio_${aeronave.codigo}_${dataEntrega.replace(/\//g, "-")}.txt`;
  const caminhoArquivo = path.join(DIR_RELATORIOS, nomeArquivo);

  fs.writeFileSync(caminhoArquivo, conteudo, "utf8");
  console.log(verde(`\n✅ Relatório salvo em: relatorios/${nomeArquivo}`));
  console.log("\n" + ciano(conteudo));
}

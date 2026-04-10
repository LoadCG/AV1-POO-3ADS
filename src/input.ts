// input.ts — aqui a gente cuida das perguntas que o sistema faz pro usuário no terminal

import * as readline from "readline";
import { ciano, amarelo, vermelho, negrito } from "./cores";

// cria a conexão principal pra ler o que o usuário digita
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// faz uma pergunta e espera o usuário responder pra continuar
export function perguntar(pergunta: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(amarelo(pergunta), resposta => {
      resolve(resposta.trim());
    });
  });
}

// mata o terminal pra liberar o programa
export function fecharTerminal(): void {
  rl.close();
}

// desenha um menu bonitinho e já pede a opção pro usuário
export async function menu(titulo: string, opcoes: string[]): Promise<number> {
  console.log(ciano(`\n========== ${negrito(titulo)} ==========`));
  opcoes.forEach((op, i) => console.log(`${ciano(String(i + 1))}. ${op}`));
  console.log(ciano("=".repeat(titulo.length + 22)));

  const resposta = await perguntar("Escolha uma opção: ");
  const numero = parseInt(resposta);

  if (isNaN(numero) || numero < 1 || numero > opcoes.length) {
    console.log(vermelho("❌ Opção inválida."));
    return 0; // 0 significa opção inválida
  }
  return numero;
}

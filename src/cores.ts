// cores.ts — aqui a gente tem as funções que deixam o terminal todo colorido
// É pra dar um tapa no visual do SkyForge!

const RESET = "\x1b[0m";

export const cores = {
  vermelho: (texto: string) => `\x1b[31m${texto}${RESET}`,
  verde: (texto: string) => `\x1b[32m${texto}${RESET}`,
  amarelo: (texto: string) => `\x1b[33m${texto}${RESET}`,
  ciano: (texto: string) => `\x1b[36m${texto}${RESET}`,
  magenta: (texto: string) => `\x1b[35m${texto}${RESET}`,
  negrito: (texto: string) => `\x1b[1m${texto}${RESET}`,
};

// atalhos pra facilitar a nossa vida na hora de usar
export const vermelho = cores.vermelho;
export const verde = cores.verde;
export const amarelo = cores.amarelo;
export const ciano = cores.ciano;
export const magenta = cores.magenta;
export const negrito = cores.negrito;

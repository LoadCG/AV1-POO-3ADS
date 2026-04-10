// auth.ts — aqui a gente controla quem entrou no sistema e o que cada um pode ou não pode fazer

import { Funcionario } from "./models";
import { NivelPermissao } from "./enums";

// aqui fica guardado quem é o carinha que tá logado agora
let usuarioLogado: Funcionario | null = null;

// tenta logar o usuário — se a senha bater, retorna true
export function login(usuario: string, senha: string, funcionarios: Funcionario[]): boolean {
  const encontrado = funcionarios.find(f => f.autenticar(usuario, senha));
  if (encontrado) {
    usuarioLogado = encontrado;
    return true;
  }
  return false;
}

export function logout(): void {
  usuarioLogado = null;
}

export function getUsuarioLogado(): Funcionario | null {
  return usuarioLogado;
}

// só checa se tem alguém logado no momento
export function estaLogado(): boolean {
  return usuarioLogado !== null;
}

// vê se quem tá logado tem moral pra fazer o que pediu
export function temPermissao(nivelMinimo: NivelPermissao): boolean {
  if (!usuarioLogado) return false;

  // regra de quem manda mais: admin > engenheiro > operador
  const hierarquia = [
    NivelPermissao.OPERADOR,
    NivelPermissao.ENGENHEIRO,
    NivelPermissao.ADMINISTRADOR
  ];

  const nivelUsuario = hierarquia.indexOf(usuarioLogado.nivelPermissao);
  const nivelNecessario = hierarquia.indexOf(nivelMinimo);

  return nivelUsuario >= nivelNecessario;
}

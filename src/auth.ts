import { Funcionario } from "./models";
import { NivelPermissao } from "./enums";
import * as crypto from "crypto";

const SALT = "aerocode_skyforge_2024";

export function hashSenha(senha: string): string {
  return crypto.createHash("sha256").update(senha + SALT).digest("hex");
}

export function isSenhaHashed(senha: string): boolean {
  return /^[a-f0-9]{64}$/.test(senha);
}

let usuarioLogado: Funcionario | null = null;

export function login(usuario: string, senha: string, funcionarios: Funcionario[]): boolean {
  const senhaHash = hashSenha(senha);
  const encontrado = funcionarios.find(f => f.autenticar(usuario.trim(), senhaHash));
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

export function estaLogado(): boolean {
  return usuarioLogado !== null;
}

export function temPermissao(nivelMinimo: NivelPermissao): boolean {
  if (!usuarioLogado) return false;

  const hierarquia = [
    NivelPermissao.OPERADOR,
    NivelPermissao.ENGENHEIRO,
    NivelPermissao.ADMINISTRADOR
  ];

  const nivelUsuario = hierarquia.indexOf(usuarioLogado.nivelPermissao);
  const nivelNecessario = hierarquia.indexOf(nivelMinimo);

  return nivelUsuario >= nivelNecessario;
}

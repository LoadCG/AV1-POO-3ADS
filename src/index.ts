import { Aeronave, Funcionario, Peca, Etapa, Teste } from "./models";
import {
  TipoAeronave, TipoPeca, StatusPeca,
  NivelPermissao, TipoTeste, ResultadoTeste, StatusEtapa
} from "./enums";
import { salvarAeronaves, carregarAeronaves, salvarFuncionarios, carregarFuncionarios } from "./storage";
import { login, logout, getUsuarioLogado, temPermissao, hashSenha } from "./auth";
import { Relatorio } from "./relatorio";
import { perguntar, fecharTerminal, menu } from "./input";
import { vermelho, verde, amarelo, ciano, negrito, magenta } from "./cores";

let aeronaves: Aeronave[] = [];
let funcionarios: Funcionario[] = [];

function contemCaracterInvisivel(texto: string): boolean {
  for (const ch of texto) {
    const cp = ch.codePointAt(0) ?? 0;
    if (
      cp === 0x00AD ||                    // soft hyphen
      (cp >= 0x200B && cp <= 0x200F) ||   // zero-width space/joiner/marks
      cp === 0x2028 || cp === 0x2029 ||   // separadores de linha/paragrafo
      (cp >= 0x202A && cp <= 0x202E) ||   // directional overrides
      cp === 0x2060 ||                    // word joiner
      cp === 0xFEFF                       // BOM
    ) return true;
  }
  return false;
}

/**
 * Valida campo de texto genérico:
 * - Não vazio após trim
 * - Mínimo 2 caracteres visíveis
 * - Deve conter pelo menos uma letra ou dígito
 * - Sem caracteres de controle ASCII (0x00–0x1F, 0x7F)
 * - Sem caracteres Unicode invisíveis (zero-width, BOM, directional overrides, etc.)
 */
function validarEntrada(texto: string, campo: string): boolean {
  const limpo = texto.trim();

  if (limpo.length === 0) {
    console.log(vermelho(`Erro: O campo "${campo}" nao pode estar vazio.`));
    return false;
  }

  if (limpo.length < 2) {
    console.log(vermelho(`Erro: O campo "${campo}" deve ter ao menos 2 caracteres.`));
    return false;
  }

  if (!/[\p{L}\p{N}]/u.test(limpo)) {
    console.log(vermelho(`Erro: O campo "${campo}" deve conter letras ou numeros.`));
    return false;
  }

  // Bloqueia caracteres de controle ASCII (inclui TAB, newline, etc.)
  if (/[\x00-\x1F\x7F]/.test(texto)) {
    console.log(vermelho(`Erro: O campo "${campo}" contem caracteres de controle invalidos.`));
    return false;
  }

  // Bloqueia caracteres Unicode invisíveis (não detectados pela faixa ASCII acima)
  if (contemCaracterInvisivel(texto)) {
    console.log(vermelho(`Erro: O campo "${campo}" contem caracteres invisiveis invalidos.`));
    return false;
  }

  return true;
}

/**
 * Valida senha com regras específicas de segurança:
 * - Sem espaços ou qualquer whitespace
 * - Sem caracteres de controle ou invisíveis
 * - Mínimo 6 e máximo 64 caracteres
 * - Deve conter pelo menos 1 letra e 1 dígito
 */
function validarSenha(senha: string): boolean {
  if (senha.length === 0) {
    console.log(vermelho("Erro: A senha nao pode estar vazia."));
    return false;
  }

  // Nenhum tipo de whitespace (espaço, tab, newline, etc.)
  if (/\s/.test(senha)) {
    console.log(vermelho("Erro: A senha nao pode conter espacos ou caracteres de espaco em branco."));
    return false;
  }

  // Caracteres de controle ASCII
  if (/[\x00-\x1F\x7F]/.test(senha)) {
    console.log(vermelho("Erro: A senha contem caracteres de controle invalidos."));
    return false;
  }

  // Caracteres Unicode invisíveis
  if (contemCaracterInvisivel(senha)) {
    console.log(vermelho("Erro: A senha contem caracteres invisiveis invalidos."));
    return false;
  }

  if (senha.length < 6) {
    console.log(vermelho("Erro: A senha deve ter no minimo 6 caracteres."));
    return false;
  }

  if (senha.length > 64) {
    console.log(vermelho("Erro: A senha nao pode ter mais de 64 caracteres."));
    return false;
  }

  if (!/[a-zA-Z]/.test(senha)) {
    console.log(vermelho("Erro: A senha deve conter pelo menos uma letra."));
    return false;
  }

  if (!/[0-9]/.test(senha)) {
    console.log(vermelho("Erro: A senha deve conter pelo menos um numero."));
    return false;
  }

  return true;
}

/**
 * Valida formato de data YYYY-MM-DD com mês (01-12) e dia (01-31) plausíveis.
 */
function validarData(data: string, campo: string): boolean {
  if (!validarEntrada(data, campo)) return false;
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(data.trim())) {
    console.log(vermelho(`Erro: "${campo}" deve estar no formato YYYY-MM-DD com data valida (ex: 2025-12-31).`));
    return false;
  }
  return true;
}

/**
 * Normaliza o codigo da aeronave: remove espaços extras e converte para maiúsculas.
 */
function normalizarCodigo(codigo: string): string {
  return codigo.trim().toUpperCase();
}

// ============================================================
// MENU AERONAVE
// ============================================================

async function menuAeronave(): Promise<void> {
  const opcao = await menu("AERONAVES", [
    "Cadastrar aeronave",
    "Listar aeronaves",
    "Ver detalhes de aeronave",
    "Voltar"
  ]);

  if (opcao === 1) await cadastrarAeronave();
  else if (opcao === 2) listarAeronaves();
  else if (opcao === 3) await verDetalhesAeronave();
}

async function cadastrarAeronave(): Promise<void> {
  if (!temPermissao(NivelPermissao.ENGENHEIRO)) {
    console.log(vermelho("Voce nao tem permissao para esta acao."));
    return;
  }

  const codigoRaw = await perguntar("Codigo da aeronave: ");
  if (!validarEntrada(codigoRaw, "Codigo")) return;
  const codigo = normalizarCodigo(codigoRaw);

  if (aeronaves.find(a => a.codigo === codigo)) {
    console.log(vermelho("Ja existe uma aeronave com este codigo."));
    return;
  }

  const modelo = await perguntar("Modelo: ");
  if (!validarEntrada(modelo, "Modelo")) return;

  console.log("Tipo: 1-COMERCIAL  2-MILITAR");
  const tipoNum = await perguntar("Tipo: ");
  if (tipoNum !== "1" && tipoNum !== "2") {
    console.log(vermelho("Opcao invalida. Escolha 1 ou 2."));
    return;
  }
  const tipo = tipoNum === "1" ? TipoAeronave.COMERCIAL : TipoAeronave.MILITAR;

  const capStr = await perguntar("Capacidade (passageiros): ");
  const capVal = parseInt(capStr.trim());
  if (isNaN(capVal) || capVal <= 0 || capVal > 9999) {
    console.log(vermelho("Capacidade invalida. Digite um numero entre 1 e 9999."));
    return;
  }

  const alcStr = await perguntar("Alcance (km): ");
  const alcVal = parseInt(alcStr.trim());
  if (isNaN(alcVal) || alcVal <= 0 || alcVal > 50000) {
    console.log(vermelho("Alcance invalido. Digite um numero entre 1 e 50000 km."));
    return;
  }

  const nova = new Aeronave(codigo, modelo.trim(), tipo, capVal, alcVal);
  aeronaves.push(nova);
  salvarAeronaves(aeronaves);
  console.log(verde(`Aeronave "${codigo}" cadastrada com sucesso!`));
}

function listarAeronaves(): void {
  if (aeronaves.length === 0) {
    console.log(amarelo("Nenhuma aeronave cadastrada."));
    return;
  }
  console.log(ciano("\n--- Lista de Aeronaves ---"));
  aeronaves.forEach((a, i) => {
    console.log(`${i + 1}. [${a.codigo}] ${a.modelo} - ${a.tipo} - ${a.capacidade} pax - ${a.alcance} km`);
  });
}

async function verDetalhesAeronave(): Promise<void> {
  const codigoRaw = await perguntar("Codigo da aeronave: ");
  if (!validarEntrada(codigoRaw, "Codigo")) return;
  const codigo = normalizarCodigo(codigoRaw);

  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) {
    console.log(vermelho("Aeronave nao encontrada."));
    return;
  }
  aeronave.detalhes();
}

// ============================================================
// MENU PECA
// ============================================================

async function menuPeca(): Promise<void> {
  const opcao = await menu("PECAS", [
    "Adicionar peca a aeronave",
    "Atualizar status de peca",
    "Voltar"
  ]);

  if (opcao === 1) await adicionarPeca();
  else if (opcao === 2) await atualizarStatusPeca();
}

async function adicionarPeca(): Promise<void> {
  if (!temPermissao(NivelPermissao.ENGENHEIRO)) {
    console.log(vermelho("Voce nao tem permissao para esta acao."));
    return;
  }

  const codigoRaw = await perguntar("Codigo da aeronave: ");
  if (!validarEntrada(codigoRaw, "Codigo")) return;
  const codigo = normalizarCodigo(codigoRaw);

  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) {
    console.log(vermelho("Aeronave nao encontrada."));
    return;
  }

  const nome = await perguntar("Nome da peca: ");
  if (!validarEntrada(nome, "Nome da Peca")) return;

  const fornecedor = await perguntar("Fornecedor: ");
  if (!validarEntrada(fornecedor, "Fornecedor")) return;

  console.log("Tipo: 1-NACIONAL  2-IMPORTADA");
  const tipoNum = await perguntar("Tipo: ");
  if (tipoNum !== "1" && tipoNum !== "2") {
    console.log(vermelho("Opcao invalida. Escolha 1 ou 2."));
    return;
  }
  const tipo = tipoNum === "1" ? TipoPeca.NACIONAL : TipoPeca.IMPORTADA;

  aeronave.pecas.push(new Peca(nome.trim(), tipo, fornecedor.trim()));
  salvarAeronaves(aeronaves);
  console.log(verde(`Peca "${nome.trim()}" adicionada a aeronave ${codigo}.`));
}

async function atualizarStatusPeca(): Promise<void> {
  if (!temPermissao(NivelPermissao.OPERADOR)) {
    console.log(vermelho("Voce nao tem permissao para esta acao."));
    return;
  }

  const codigoRaw = await perguntar("Codigo da aeronave: ");
  if (!validarEntrada(codigoRaw, "Codigo")) return;
  const codigo = normalizarCodigo(codigoRaw);

  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) {
    console.log(vermelho("Aeronave nao encontrada."));
    return;
  }

  if (aeronave.pecas.length === 0) {
    console.log(amarelo("Nenhuma peca cadastrada nesta aeronave."));
    return;
  }

  aeronave.pecas.forEach((p, i) => console.log(`${i + 1}. ${p.nome} - ${p.status}`));
  const resposta = await perguntar("Numero da peca: ");
  const idx = parseInt(resposta.trim()) - 1;

  if (isNaN(idx) || idx < 0 || idx >= aeronave.pecas.length) {
    console.log(vermelho("Peca invalida. Digite o numero correspondente na lista."));
    return;
  }

  const peca = aeronave.pecas[idx];
  console.log(`Status atual: ${peca.status}`);
  console.log("Novo status: 1-EM_PRODUCAO  2-EM_TRANSPORTE  3-PRONTA");
  const novoStatusNum = await perguntar("Novo status: ");

  const statusMap: Record<string, StatusPeca> = {
    "1": StatusPeca.EM_PRODUCAO,
    "2": StatusPeca.EM_TRANSPORTE,
    "3": StatusPeca.PRONTA
  };

  if (!statusMap[novoStatusNum.trim()]) {
    console.log(vermelho("Opcao invalida. Escolha 1, 2 ou 3."));
    return;
  }

  peca.atualizarStatus(statusMap[novoStatusNum.trim()]);
  salvarAeronaves(aeronaves);
  console.log(verde(`Status da peca "${peca.nome}" atualizado para: ${peca.status}`));
}

// ============================================================
// MENU ETAPA
// ============================================================

async function menuEtapa(): Promise<void> {
  const opcao = await menu("ETAPAS DE PRODUCAO", [
    "Adicionar etapa a aeronave",
    "Iniciar etapa",
    "Finalizar etapa",
    "Associar funcionario a etapa",
    "Listar funcionarios da etapa",
    "Voltar"
  ]);

  if (opcao === 1) await adicionarEtapa();
  else if (opcao === 2) await iniciarEtapa();
  else if (opcao === 3) await finalizarEtapa();
  else if (opcao === 4) await associarFuncionarioEtapa();
  else if (opcao === 5) await listarFuncionariosEtapa();
}

async function adicionarEtapa(): Promise<void> {
  if (!temPermissao(NivelPermissao.ENGENHEIRO)) {
    console.log(vermelho("Voce nao tem permissao para esta acao."));
    return;
  }

  const codigoRaw = await perguntar("Codigo da aeronave: ");
  if (!validarEntrada(codigoRaw, "Codigo")) return;
  const codigo = normalizarCodigo(codigoRaw);

  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) {
    console.log(vermelho("Aeronave nao encontrada."));
    return;
  }

  const nome = await perguntar("Nome da etapa: ");
  if (!validarEntrada(nome, "Nome da Etapa")) return;

  if (aeronave.etapas.find(e => e.nome.toLowerCase() === nome.trim().toLowerCase())) {
    console.log(vermelho(`Ja existe uma etapa chamada "${nome.trim()}" nesta aeronave.`));
    return;
  }

  const prazo = await perguntar("Prazo (YYYY-MM-DD, ex: 2025-12-31): ");
  if (!validarData(prazo, "Prazo")) return;

  aeronave.etapas.push(new Etapa(nome.trim(), prazo.trim()));
  salvarAeronaves(aeronaves);
  console.log(verde(`Etapa "${nome.trim()}" adicionada.`));
}

async function iniciarEtapa(): Promise<void> {
  const { aeronave, etapaIdx } = await selecionarEtapa();
  if (!aeronave) return;

  const etapa = aeronave.etapas[etapaIdx];

  // Garante que as etapas sejam executadas em ordem
  if (etapaIdx > 0) {
    const anterior = aeronave.etapas[etapaIdx - 1];
    if (anterior.status !== StatusEtapa.CONCLUIDA) {
      console.log(vermelho(`A etapa anterior "${anterior.nome}" ainda nao foi concluida.`));
      return;
    }
  }

  if (etapa.iniciar()) {
    salvarAeronaves(aeronaves);
    console.log(verde(`Etapa "${etapa.nome}" iniciada.`));
  }
}

async function finalizarEtapa(): Promise<void> {
  const { aeronave, etapaIdx } = await selecionarEtapa();
  if (!aeronave) return;

  const etapa = aeronave.etapas[etapaIdx];
  if (etapa.finalizar()) {
    salvarAeronaves(aeronaves);
    console.log(verde(`Etapa "${etapa.nome}" concluida.`));
  }
}

async function associarFuncionarioEtapa(): Promise<void> {
  const { aeronave, etapaIdx } = await selecionarEtapa();
  if (!aeronave) return;

  const idFunc = await perguntar("ID do funcionario: ");
  if (!validarEntrada(idFunc, "ID")) return;

  const func = funcionarios.find(f => f.id === idFunc.trim());
  if (!func) {
    console.log(vermelho("Funcionario nao encontrado."));
    return;
  }

  aeronave.etapas[etapaIdx].associarFuncionario(func);
  salvarAeronaves(aeronaves);
  console.log(verde(`Funcionario "${func.nome}" associado a etapa.`));
}

async function listarFuncionariosEtapa(): Promise<void> {
  const { aeronave, etapaIdx } = await selecionarEtapa();
  if (!aeronave) return;

  const ids = aeronave.etapas[etapaIdx].listarFuncionarios();
  if (ids.length === 0) {
    console.log(amarelo("Nenhum funcionario associado a esta etapa."));
    return;
  }

  console.log("\nFuncionarios da etapa:");
  ids.forEach(id => {
    const f = funcionarios.find(f => f.id === id);
    console.log(`  - [${id}] ${f ? f.nome : "Funcionario nao encontrado"}`);
  });
}

async function selecionarEtapa(): Promise<{ aeronave: Aeronave | null, etapaIdx: number }> {
  const codigoRaw = await perguntar("Codigo da aeronave: ");
  if (!validarEntrada(codigoRaw, "Codigo")) return { aeronave: null, etapaIdx: -1 };
  const codigo = normalizarCodigo(codigoRaw);

  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) {
    console.log(vermelho("Aeronave nao encontrada."));
    return { aeronave: null, etapaIdx: -1 };
  }

  if (aeronave.etapas.length === 0) {
    console.log(amarelo("Nenhuma etapa cadastrada."));
    return { aeronave: null, etapaIdx: -1 };
  }

  aeronave.etapas.forEach((e, i) => console.log(`${i + 1}. ${e.nome} - ${e.status}`));
  const resposta = await perguntar("Numero da etapa: ");
  const idx = parseInt(resposta.trim()) - 1;

  if (isNaN(idx) || idx < 0 || idx >= aeronave.etapas.length) {
    console.log(vermelho("Etapa invalida. Digite o numero correspondente na lista."));
    return { aeronave: null, etapaIdx: -1 };
  }

  return { aeronave, etapaIdx: idx };
}

// ============================================================
// MENU FUNCIONARIO
// ============================================================

async function menuFuncionario(): Promise<void> {
  const opcao = await menu("FUNCIONARIOS", [
    "Cadastrar funcionario",
    "Listar funcionarios",
    "Voltar"
  ]);

  if (opcao === 1) await cadastrarFuncionario();
  else if (opcao === 2) listarFuncionarios();
}

async function cadastrarFuncionario(): Promise<void> {
  if (!temPermissao(NivelPermissao.ADMINISTRADOR)) {
    console.log(vermelho("Apenas administradores podem cadastrar funcionarios."));
    return;
  }

  const id = await perguntar("ID do funcionario: ");
  if (!validarEntrada(id, "ID")) return;

  if (funcionarios.find(f => f.id === id.trim())) {
    console.log(vermelho("Ja existe um funcionario com este ID."));
    return;
  }

  const nome = await perguntar("Nome: ");
  if (!validarEntrada(nome, "Nome")) return;

  // Easter Egg — o sistema nao suporta gênios
  if (nome.trim().toLowerCase() === "gerson") {
    console.log(vermelho("Erro critico: o sistema nao suporta genios. Cadastro do professor Gerson negado."));
    return;
  }

  const telefone = await perguntar("Telefone: ");
  if (!validarEntrada(telefone, "Telefone")) return;

  const endereco = await perguntar("Endereco: ");
  if (!validarEntrada(endereco, "Endereco")) return;

  const usuario = await perguntar("Usuario (login): ");
  if (!validarEntrada(usuario, "Login")) return;

  if (funcionarios.find(f => f.usuario === usuario.trim())) {
    console.log(vermelho(`O login "${usuario.trim()}" ja esta em uso por outro funcionario.`));
    return;
  }

  const senha = await perguntar("Senha (min. 6 chars, sem espacos, com letra e numero): ");
  if (!validarSenha(senha)) return;

  console.log("Nivel: 1-ADMINISTRADOR  2-ENGENHEIRO  3-OPERADOR");
  const nivelNum = await perguntar("Nivel: ");
  const nivelIdx = parseInt(nivelNum.trim()) - 1;

  if (isNaN(nivelIdx) || nivelIdx < 0 || nivelIdx > 2) {
    console.log(vermelho("Nivel invalido. Escolha 1, 2 ou 3."));
    return;
  }

  const niveis = [NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR];
  const nivel = niveis[nivelIdx];

  const senhaHash = hashSenha(senha.trim());

  funcionarios.push(new Funcionario(id.trim(), nome.trim(), telefone.trim(), endereco.trim(), usuario.trim(), senhaHash, nivel));
  salvarFuncionarios(funcionarios);
  console.log(verde(`Funcionario "${nome.trim()}" cadastrado com sucesso.`));
}

function listarFuncionarios(): void {
  if (funcionarios.length === 0) {
    console.log(amarelo("Nenhum funcionario cadastrado."));
    return;
  }
  console.log("\n--- Lista de Funcionarios ---");
  funcionarios.forEach(f => f.exibir());
}

// ============================================================
// MENU TESTE
// ============================================================

async function menuTeste(): Promise<void> {
  const opcao = await menu("TESTES", [
    "Registrar teste",
    "Voltar"
  ]);

  if (opcao === 1) await registrarTeste();
}

async function registrarTeste(): Promise<void> {
  if (!temPermissao(NivelPermissao.ENGENHEIRO)) {
    console.log(vermelho("Voce nao tem permissao para esta acao."));
    return;
  }

  const codigoRaw = await perguntar("Codigo da aeronave: ");
  if (!validarEntrada(codigoRaw, "Codigo")) return;
  const codigo = normalizarCodigo(codigoRaw);

  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) {
    console.log(vermelho("Aeronave nao encontrada."));
    return;
  }

  console.log("Tipo de teste: 1-ELETRICO  2-HIDRAULICO  3-AERODINAMICO");
  const tipoNum = await perguntar("Tipo: ");
  const tipos = [TipoTeste.ELETRICO, TipoTeste.HIDRAULICO, TipoTeste.AERODINAMICO];
  const tipoIdx = parseInt(tipoNum.trim()) - 1;

  if (isNaN(tipoIdx) || tipoIdx < 0 || tipoIdx >= tipos.length) {
    console.log(vermelho("Opcao de teste invalida. Escolha entre 1 e 3."));
    return;
  }
  const tipo = tipos[tipoIdx];

  console.log("Resultado: 1-APROVADO  2-REPROVADO");
  const resNum = await perguntar("Resultado: ");
  if (resNum.trim() !== "1" && resNum.trim() !== "2") {
    console.log(vermelho("Opcao invalida. Escolha 1 ou 2."));
    return;
  }
  const resultado = resNum.trim() === "1" ? ResultadoTeste.APROVADO : ResultadoTeste.REPROVADO;

  aeronave.testes.push(new Teste(tipo, resultado));
  salvarAeronaves(aeronaves);
  console.log(verde(`Teste ${tipo} registrado como ${resultado}.`));
}

// ============================================================
// MENU RELATORIO
// ============================================================

async function menuRelatorio(): Promise<void> {
  const opcao = await menu("RELATORIOS", [
    "Gerar relatorio de entrega",
    "Listar relatorios salvos",
    "Voltar"
  ]);

  if (opcao === 1) await gerarRelatorioEntrega();
  else if (opcao === 2) listarRelatorios();
}

async function gerarRelatorioEntrega(): Promise<void> {
  if (!temPermissao(NivelPermissao.ENGENHEIRO)) {
    console.log(vermelho("Voce nao tem permissao para esta acao."));
    return;
  }

  const codigoRaw = await perguntar("Codigo da aeronave: ");
  if (!validarEntrada(codigoRaw, "Codigo")) return;
  const codigo = normalizarCodigo(codigoRaw);

  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) {
    console.log(vermelho("Aeronave nao encontrada."));
    return;
  }

  const cliente = await perguntar("Nome do cliente: ");
  if (!validarEntrada(cliente, "Nome do cliente")) return;

  const data = await perguntar("Data de entrega (YYYY-MM-DD, ex: 2025-12-31): ");
  if (!validarData(data, "Data de entrega")) return;

  const etapasPendentes = aeronave.etapas.filter(e => e.status !== StatusEtapa.CONCLUIDA);
  const testesReprovados = aeronave.testes.filter(t => t.resultado === ResultadoTeste.REPROVADO);

  if (etapasPendentes.length > 0 || testesReprovados.length > 0) {
    console.log(amarelo("\nATENCAO: Existem pendencias na aeronave:"));
    if (etapasPendentes.length > 0) {
      console.log(amarelo(`   - ${etapasPendentes.length} etapa(s) nao concluida(s).`));
    }
    if (testesReprovados.length > 0) {
      console.log(vermelho(`   - ${testesReprovados.length} teste(s) reprovado(s)!`));
    }

    const confirmacao = await perguntar("\nDeseja prosseguir mesmo assim? (S/N): ");
    if (confirmacao.trim().toUpperCase() !== "S") {
      console.log(amarelo("Operacao cancelada."));
      return;
    }
  }

  const relatorio = new Relatorio();
  relatorio.gerarRelatorio(aeronave, cliente.trim(), data.trim());
  relatorio.salvarEmArquivo();
}

function listarRelatorios(): void {
  const relatorio = new Relatorio();
  relatorio.carregar();
}

// ============================================================
// LOGIN E MENU PRINCIPAL
// ============================================================

const MAX_TENTATIVAS_LOGIN = 3;

async function fazerLogin(): Promise<boolean> {
  console.log("\n========== LOGIN AEROCODE ==========");

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS_LOGIN; tentativa++) {
    const usuario = await perguntar("Usuario: ");
    const senha = await perguntar("Senha: ");

    if (!validarEntrada(usuario, "Usuario")) {
      console.log(amarelo(`Tentativa ${tentativa}/${MAX_TENTATIVAS_LOGIN}.`));
      continue;
    }

    // Senha no login: só rejeita vazio e whitespace — sem exigir letra+número
    // (o usuário admin padrão pode ainda ter senha antiga durante migração)
    if (senha.length === 0 || /[\x00-\x1F\x7F]/.test(senha)) {
      console.log(vermelho("Erro: Senha invalida."));
      console.log(amarelo(`Tentativa ${tentativa}/${MAX_TENTATIVAS_LOGIN}.`));
      continue;
    }

    if (login(usuario.trim(), senha.trim(), funcionarios)) {
      const logado = getUsuarioLogado()!;
      console.log(verde(`\nBem-vindo, ${logado.nome}! [${logado.nivelPermissao}]`));
      return true;
    }

    console.log(vermelho(`Usuario ou senha incorretos. Tentativa ${tentativa}/${MAX_TENTATIVAS_LOGIN}.`));
  }

  console.log(vermelho("Numero maximo de tentativas atingido. Encerrando sessao."));
  return false;
}

async function menuPrincipal(): Promise<void> {
  while (true) {
    const logado = getUsuarioLogado();
    const opcao = await menu(
      `MENU PRINCIPAL [${logado?.nome} - ${logado?.nivelPermissao}]`,
      [
        "Aeronaves",
        "Pecas",
        "Etapas de Producao",
        "Funcionarios",
        "Testes",
        "Relatorios",
        "Logout",
        "Sair"
      ]
    );

    if (opcao === 1) await menuAeronave();
    else if (opcao === 2) await menuPeca();
    else if (opcao === 3) await menuEtapa();
    else if (opcao === 4) await menuFuncionario();
    else if (opcao === 5) await menuTeste();
    else if (opcao === 6) await menuRelatorio();
    else if (opcao === 7) { logout(); return; }
    else if (opcao === 8) { console.log(magenta("Ate logo!")); fecharTerminal(); process.exit(0); }
  }
}

async function iniciar(): Promise<void> {
  console.log(ciano("AEROCODE — Sistema de Gestao de Producao de Aeronaves"));
  console.log(ciano("======================================================"));

  aeronaves = carregarAeronaves();
  funcionarios = carregarFuncionarios();

  // Cria o administrador padrao se nao existir nenhum funcionario
  if (funcionarios.length === 0) {
    console.log("\nNenhum funcionario encontrado. Criando administrador padrao...");
    const senhaHash = hashSenha("admin123");
    const admin = new Funcionario(
      "001", "Administrador", "00-0000-0000", "Sede Aerocode",
      "admin", senhaHash, NivelPermissao.ADMINISTRADOR
    );
    funcionarios.push(admin);
    salvarFuncionarios(funcionarios);
    console.log("   Usuario: admin | Senha: admin123");
  }

  while (true) {
    const logado = await fazerLogin();
    if (logado) {
      await menuPrincipal();
    }
  }
}

iniciar();

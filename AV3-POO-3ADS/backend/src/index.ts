// index.ts — aqui é por onde o sistema SkyForge começa

import { Aeronave, Funcionario, Peca, Etapa, Teste } from "./models";
import {
  TipoAeronave, TipoPeca, StatusPeca,
  NivelPermissao, TipoTeste, ResultadoTeste, StatusEtapa
} from "./enums";
import { salvarAeronaves, carregarAeronaves, salvarFuncionarios, carregarFuncionarios } from "./storage";
import { login, logout, getUsuarioLogado, estaLogado, temPermissao } from "./auth";
import { gerarRelatorio } from "./relatorio";
import { perguntar, fecharTerminal, menu } from "./input";
import { vermelho, verde, amarelo, ciano, negrito, magenta } from "./cores";

// listas globais pra guardar as coisas em memória enquanto o programa roda
let aeronaves: Aeronave[] = [];
let funcionarios: Funcionario[] = [];

/**
 * Valida se a entrada é segura: 
 * - Não vazia
 * - Contém pelo menos uma letra ou número (evita apenas símbolos)
 * - Não contém caracteres de controle (prevenção de injection/ANSI)
 */
function validarEntrada(texto: string, campo: string): boolean {
  const limpo = texto.trim();
  
  if (limpo.length === 0) {
    console.log(vermelho(`❌ Erro: O campo "${campo}" não pode estar vazio.`));
    return false;
  }

  // Regex Unicode: \p{L} = Letras, \p{N} = Números. Garante que não sejam apenas símbolos/espaços.
  const temAlfanumerico = /[\p{L}\p{N}]/u.test(limpo);
  if (!temAlfanumerico) {
    console.log(vermelho(`❌ Erro: O campo "${campo}" deve conter letras ou números.`));
    return false;
  }

  // Bloqueia caracteres de controle (ASCII 0-31 e 127) para evitar "sujar" o terminal ou arquivos
  if (/[\x00-\x1F\x7F]/.test(texto)) {
    console.log(vermelho(`❌ Erro: O campo "${campo}" contém caracteres inválidos.`));
    return false;
  }

  return true;
}

// menu de opções gerais das aeronaves
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
  // só quem é admin ou engenheiro pode criar aeronave nova
  if (!temPermissao(NivelPermissao.ENGENHEIRO)) {
    console.log(vermelho("❌ Você não tem permissão para esta ação."));
    return;
  }

  const codigo = await perguntar("Código da aeronave: ");
  if (!validarEntrada(codigo, "Código")) return;

  // checa se já existe esse código pra não duplicar
  if (aeronaves.find(a => a.codigo === codigo)) {
    console.log(vermelho("❌ Já existe uma aeronave com este código."));
    return;
  }

  const modelo = await perguntar("Modelo: ");
  if (!validarEntrada(modelo, "Modelo")) return;
  console.log("Tipo: 1-COMERCIAL  2-MILITAR");
  const tipoNum = await perguntar("Tipo: ");
  if (tipoNum !== "1" && tipoNum !== "2") {
    console.log(vermelho("❌ Opção inválida. Escolha 1 ou 2."));
    return;
  }
  const tipo = tipoNum === "1" ? TipoAeronave.COMERCIAL : TipoAeronave.MILITAR;

  const capStr = await perguntar("Capacidade (passageiros): ");
  const capVal = parseInt(capStr);
  if (isNaN(capVal) || capVal <= 0) {
    console.log(vermelho("❌ Capacidade inválida. Digite um número positivo."));
    return;
  }

  const alcStr = await perguntar("Alcance (km): ");
  const alcVal = parseInt(alcStr);
  if (isNaN(alcVal) || alcVal <= 0) {
    console.log(vermelho("❌ Alcance inválido. Digite um número positivo."));
    return;
  }

  const nova = new Aeronave(codigo, modelo, tipo, capVal, alcVal);
  aeronaves.push(nova);
  salvarAeronaves(aeronaves);
  console.log(verde(`✅ Aeronave "${codigo}" cadastrada com sucesso!`));
}

// mostra a lista básica de todas as aeronaves
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

// pede o código e mostra tudo detalhado daquela aeronave
async function verDetalhesAeronave(): Promise<void> {
  const codigo = await perguntar("Código da aeronave: ");
  if (!validarEntrada(codigo, "Código")) return;
  
  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) {
    console.log(vermelho("❌ Aeronave não encontrada."));
    return;
  }
  aeronave.exibirDetalhes();
}

// ============================================================
// MENUS DE PEÇA
// ============================================================

async function menuPeca(): Promise<void> {
  const opcao = await menu("PEÇAS", [
    "Adicionar peça à aeronave",
    "Atualizar status de peça",
    "Voltar"
  ]);

  if (opcao === 1) await adicionarPeca();
  else if (opcao === 2) await atualizarStatusPeca();
}

async function adicionarPeca(): Promise<void> {
  if (!temPermissao(NivelPermissao.ENGENHEIRO)) {
    console.log(vermelho("❌ Você não tem permissão para esta ação."));
    return;
  }

  const codigo = await perguntar("Código da aeronave: ");
  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) { console.log(vermelho("❌ Aeronave não encontrada.")); return; }

  const nome = await perguntar("Nome da peça: ");
  if (!validarEntrada(nome, "Nome da Peça")) return;

  const fornecedor = await perguntar("Fornecedor: ");
  if (!validarEntrada(fornecedor, "Fornecedor")) return;
  console.log("Tipo: 1-NACIONAL  2-IMPORTADA");
  const tipoNum = await perguntar("Tipo: ");
  if (tipoNum !== "1" && tipoNum !== "2") {
    console.log(vermelho("❌ Opção inválida. Escolha 1 ou 2."));
    return;
  }
  const tipo = tipoNum === "1" ? TipoPeca.NACIONAL : TipoPeca.IMPORTADA;

  aeronave.pecas.push(new Peca(nome, tipo, fornecedor));
  salvarAeronaves(aeronaves);
  console.log(verde(`✅ Peça "${nome}" adicionada à aeronave ${codigo}.`));
}

async function atualizarStatusPeca(): Promise<void> {
  if (!temPermissao(NivelPermissao.OPERADOR)) {
    // essa parte aqui só operador pra cima pode mexer
    console.log(vermelho("❌ Você não tem permissão para esta ação."));
    return;
  }

  const codigo = await perguntar("Código da aeronave: ");
  if (!validarEntrada(codigo, "Código")) return;

  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) { console.log(vermelho("❌ Aeronave não encontrada.")); return; }

  if (aeronave.pecas.length === 0) { console.log(amarelo("Nenhuma peça cadastrada nesta aeronave.")); return; }

  aeronave.pecas.forEach((p, i) => console.log(`${i + 1}. ${p.nome} - ${p.status}`));
  const resposta = await perguntar("Número da peça: ");
  const idx = parseInt(resposta) - 1;

  if (isNaN(idx) || idx < 0 || idx >= aeronave.pecas.length) {
    console.log(vermelho("❌ Peça inválida. Digite o número correspondente na lista."));
    return;
  }

  aeronave.pecas[idx].atualizarStatus();
  salvarAeronaves(aeronaves);
  console.log(verde(`✅ Status da peça "${aeronave.pecas[idx].nome}" atualizado para: ${aeronave.pecas[idx].status}`));
}

// cuida da parte das etapas (iniciar, terminar, etc)
async function menuEtapa(): Promise<void> {
  const opcao = await menu("ETAPAS DE PRODUÇÃO", [
    "Adicionar etapa à aeronave",
    "Iniciar etapa",
    "Finalizar etapa",
    "Associar funcionário à etapa",
    "Listar funcionários da etapa",
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
    console.log(vermelho("❌ Você não tem permissão para esta ação."));
    return;
  }

  const codigo = await perguntar("Código da aeronave: ");
  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) { console.log(vermelho("❌ Aeronave não encontrada.")); return; }

  const nome = await perguntar("Nome da etapa: ");
  if (!validarEntrada(nome, "Nome da Etapa")) return;

  // evita etapas com nomes repetidos na mesma aeronave
  if (aeronave.etapas.find(e => e.nome === nome)) {
    console.log(vermelho(`❌ Já existe uma etapa chamada "${nome}" nesta aeronave.`));
    return;
  }

  const prazo = await perguntar("Prazo (ex: 2025-12-31): ");
  if (!validarEntrada(prazo, "Prazo")) return;

  aeronave.etapas.push(new Etapa(nome, prazo));
  salvarAeronaves(aeronaves);
  console.log(verde(`✅ Etapa "${nome}" adicionada.`));
}

async function iniciarEtapa(): Promise<void> {
  const { aeronave, etapaIdx } = await selecionarEtapa();
  if (!aeronave) return;

  const etapa = aeronave.etapas[etapaIdx];

  // trava pra garantir que as etapas sigam a ordem certa
  if (etapaIdx > 0) {
    const anterior = aeronave.etapas[etapaIdx - 1];
    if (anterior.status !== "CONCLUIDA") {
      console.log(vermelho(`❌ A etapa anterior "${anterior.nome}" ainda não foi concluída.`));
      return;
    }
  }

  if (etapa.iniciar()) {
    salvarAeronaves(aeronaves);
    console.log(verde(`✅ Etapa "${etapa.nome}" iniciada.`));
  }
}

async function finalizarEtapa(): Promise<void> {
  const { aeronave, etapaIdx } = await selecionarEtapa();
  if (!aeronave) return;

  const etapa = aeronave.etapas[etapaIdx];
  if (etapa.finalizar()) {
    salvarAeronaves(aeronaves);
    console.log(verde(`✅ Etapa "${etapa.nome}" concluída.`));
  }
}

async function associarFuncionarioEtapa(): Promise<void> {
  const { aeronave, etapaIdx } = await selecionarEtapa();
  if (!aeronave) return;

  const idFunc = await perguntar("ID do funcionário: ");
  if (!validarEntrada(idFunc, "ID")) return;

  const func = funcionarios.find(f => f.id === idFunc);
  if (!func) { console.log(vermelho("❌ Funcionário não encontrado.")); return; }

  aeronave.etapas[etapaIdx].associarFuncionario(idFunc);
  salvarAeronaves(aeronaves);
  console.log(verde(`✅ Funcionário "${func.nome}" associado à etapa.`));
}

async function listarFuncionariosEtapa(): Promise<void> {
  const { aeronave, etapaIdx } = await selecionarEtapa();
  if (!aeronave) return;

  const ids = aeronave.etapas[etapaIdx].listarFuncionarios();
  if (ids.length === 0) {
    console.log(amarelo("Nenhum funcionário associado a esta etapa."));
    return;
  }

  console.log("\nFuncionários da etapa:");
  ids.forEach(id => {
    const f = funcionarios.find(f => f.id === id);
    console.log(`  - [${id}] ${f ? f.nome : "Funcionário não encontrado"}`);
  });
}

// helper pra selecionar aeronave e índice de etapa juntos
async function selecionarEtapa(): Promise<{ aeronave: Aeronave | null, etapaIdx: number }> {
  const codigo = await perguntar("Código da aeronave: ");
  if (!validarEntrada(codigo, "Código")) return { aeronave: null, etapaIdx: -1 };

  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) { console.log(vermelho("❌ Aeronave não encontrada.")); return { aeronave: null, etapaIdx: -1 }; }

  if (aeronave.etapas.length === 0) { console.log(amarelo("Nenhuma etapa cadastrada.")); return { aeronave: null, etapaIdx: -1 }; }

  aeronave.etapas.forEach((e, i) => console.log(`${i + 1}. ${e.nome} - ${e.status}`));
  const resposta = await perguntar("Número da etapa: ");
  const idx = parseInt(resposta) - 1;

  if (isNaN(idx) || idx < 0 || idx >= aeronave.etapas.length) {
    console.log(vermelho("❌ Etapa inválida. Digite o número correspondente na lista."));
    return { aeronave: null, etapaIdx: -1 };
  }

  return { aeronave, etapaIdx: idx };
}

// cuida do cadastro e listagem de quem trabalha na empresa
async function menuFuncionario(): Promise<void> {
  const opcao = await menu("FUNCIONÁRIOS", [
    "Cadastrar funcionário",
    "Listar funcionários",
    "Voltar"
  ]);

  if (opcao === 1) await cadastrarFuncionario();
  else if (opcao === 2) listarFuncionarios();
}

async function cadastrarFuncionario(): Promise<void> {
  // só admin pode cadastrar funcionário
  if (!temPermissao(NivelPermissao.ADMINISTRADOR)) {
    console.log(vermelho("❌ Apenas administradores podem cadastrar funcionários."));
    return;
  }

  const id = await perguntar("ID do funcionário: ");
  if (!validarEntrada(id, "ID")) return;

  if (funcionarios.find(f => f.id === id)) {
    console.log(vermelho("❌ Já existe um funcionário com este ID."));
    return;
  }

  const nome = await perguntar("Nome: ");
  if (!validarEntrada(nome, "Nome")) return;

  // Easter Egg — Nome Proibido (Gerson é gênio demais para o sistema)
  if (nome.toLowerCase() === "gerson") {
    console.log(vermelho("❌  Erro crítico: o sistema não suporta gênios. Cadastro do professor Gerson negado."));
    return;
  }
  const telefone = await perguntar("Telefone: ");
  const endereco = await perguntar("Endereço: ");

  const usuario = await perguntar("Usuário (login): ");
  if (!validarEntrada(usuario, "Login")) return;

  // Validação pedida pelo professor: impedir logins duplicados
  if (funcionarios.find(f => f.usuario === usuario)) {
    console.log(vermelho(`❌ Erro: O login "${usuario}" já está em uso por outro funcionário.`));
    return;
  }

  const senha = await perguntar("Senha: ");
  if (!validarEntrada(senha, "Senha")) return;
  
  if (senha.length < 4) {
    console.log(vermelho("❌ A senha deve ter pelo menos 4 caracteres."));
    return;
  }

  console.log("Nível: 1-ADMINISTRADOR  2-ENGENHEIRO  3-OPERADOR");
  const nivelNum = await perguntar("Nível: ");
  const niveis = [NivelPermissao.ADMINISTRADOR, NivelPermissao.ENGENHEIRO, NivelPermissao.OPERADOR];
  const nivel = niveis[parseInt(nivelNum) - 1] || NivelPermissao.OPERADOR;

  funcionarios.push(new Funcionario(id, nome, telefone, endereco, usuario, senha, nivel));
  salvarFuncionarios(funcionarios);
  console.log(verde(`✅ Funcionário "${nome}" cadastrado.`));
}

function listarFuncionarios(): void {
  if (funcionarios.length === 0) { console.log(amarelo("Nenhum funcionário cadastrado.")); return; }
  console.log("\n--- Lista de Funcionários ---");
  funcionarios.forEach(f => f.exibir());
}

// menu pra lidar com os testes de qualidade
async function menuTeste(): Promise<void> {
  const opcao = await menu("TESTES", [
    "Registrar teste",
    "Voltar"
  ]);

  if (opcao === 1) await registrarTeste();
}

async function registrarTeste(): Promise<void> {
  if (!temPermissao(NivelPermissao.ENGENHEIRO)) {
    console.log(vermelho("❌ Você não tem permissão para esta ação."));
    return;
  }

  const codigo = await perguntar("Código da aeronave: ");
  if (!codigo.trim()) {
    console.log(vermelho("❌ O código da aeronave não pode ser vazio."));
    return;
  }

  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) { console.log(vermelho("❌ Aeronave não encontrada.")); return; }

  console.log("Tipo de teste: 1-ELETRICO  2-HIDRAULICO  3-AERODINAMICO");
  const tipoNum = await perguntar("Tipo: ");
  const tipos = [TipoTeste.ELETRICO, TipoTeste.HIDRAULICO, TipoTeste.AERODINAMICO];
  const idx = parseInt(tipoNum) - 1;

  if (isNaN(idx) || idx < 0 || idx >= tipos.length) {
    console.log(vermelho("❌ Opção de teste inválida. Escolha entre 1 e 3."));
    return;
  }
  const tipo = tipos[idx];

  console.log("Resultado: 1-APROVADO  2-REPROVADO");
  const resNum = await perguntar("Resultado: ");
  if (resNum !== "1" && resNum !== "2") {
    console.log(vermelho("❌ Opção inválida. Escolha 1 ou 2."));
    return;
  }
  const resultado = resNum === "1" ? ResultadoTeste.APROVADO : ResultadoTeste.REPROVADO;

  aeronave.testes.push(new Teste(tipo, resultado));
  salvarAeronaves(aeronaves);
  console.log(verde(`✅ Teste ${tipo} registrado como ${resultado}.`));
}

// parte que gera o arquivo .txt pro cliente
async function menuRelatorio(): Promise<void> {
  if (!temPermissao(NivelPermissao.ENGENHEIRO)) {
    console.log(vermelho("❌ Você não tem permissão para esta ação."));
    return;
  }

  const codigo = await perguntar("Código da aeronave: ");
  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) { console.log(vermelho("❌ Aeronave não encontrada.")); return; }

  const cliente = await perguntar("Nome do cliente: ");
  const data = await perguntar("Data de entrega (ex: 2025-12-31): ");

  // VALIDAÇÃO ANTES DE GERAR RELATÓRIO
  const etapasPendentes = aeronave.etapas.filter(e => e.status !== StatusEtapa.CONCLUIDA);
  const testesReprovados = aeronave.testes.filter(t => t.resultado === ResultadoTeste.REPROVADO);

  if (etapasPendentes.length > 0 || testesReprovados.length > 0) {
    console.log(amarelo("\n⚠️  ATENÇÃO: Existem pendências na aeronave:"));
    if (etapasPendentes.length > 0) {
      console.log(amarelo(`   - ${etapasPendentes.length} etapa(s) não concluída(s).`));
    }
    if (testesReprovados.length > 0) {
      console.log(vermelho(`   - ${testesReprovados.length} teste(s) reprovado(s)!`));
    }

    const confirmacao = await perguntar("\nDeseja prosseguir com a geração do relatório mesmo assim? (S/N): ");
    if (confirmacao.toUpperCase() !== "S") {
      console.log(amarelo("Operação cancelada pelo usuário."));
      return;
    }
  }

  gerarRelatorio(aeronave, cliente, data);
}

// lida com o login e o menu principal que amarra tudo
async function fazerLogin(): Promise<boolean> {
  console.log("\n========== LOGIN SKYFORGE ==========");
  const usuario = await perguntar("Usuário: ");
  const senha = await perguntar("Senha: ");

  if (!validarEntrada(usuario, "Usuário") || !validarEntrada(senha, "Senha")) {
    return false;
  }

  if (login(usuario, senha, funcionarios)) {
    const logado = getUsuarioLogado()!;
    console.log(verde(`\n✅ Bem-vindo, ${logado.nome}! [${logado.nivelPermissao}]`));
    return true;
  } else {
    console.log(vermelho("❌ Usuário ou senha incorretos."));
    return false;
  }
}

async function menuPrincipal(): Promise<void> {
  while (true) {
    const logado = getUsuarioLogado();
    const opcao = await menu(
      `MENU PRINCIPAL [${logado?.nome} - ${logado?.nivelPermissao}]`,
      [
        "Aeronaves",
        "Peças",
        "Etapas de Produção",
        "Funcionários",
        "Testes",
        "Gerar Relatório de Entrega",
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
    else if (opcao === 8) { console.log(magenta("Até logo!")); fecharTerminal(); process.exit(0); }
  }
}



// inicializa tudo: carrega os dados e começa o loop do sistema
async function iniciar(): Promise<void> {

  console.log(ciano("🛩️  SKYFORGE — Sistema de Gestão de Produção de Aeronaves"));
  console.log(ciano("========================================================"));

  // carrega dados salvos
  aeronaves = carregarAeronaves();
  funcionarios = carregarFuncionarios();

  // se não tem nenhum funcionário, cria o admin padrão pra não travar o sistema
  if (funcionarios.length === 0) {
    console.log("\n⚠️  Nenhum funcionário encontrado. Criando administrador padrão...");
    const admin = new Funcionario("001", "Administrador", "00-0000-0000", "Sede Aerocode", "admin", "admin123", NivelPermissao.ADMINISTRADOR);
    funcionarios.push(admin);
    salvarFuncionarios(funcionarios);
    console.log("   Usuário: admin | Senha: admin123");
  }

  // loop de sessão — ao fazer logout volta pro login
  while (true) {
    const logado = await fazerLogin();
    if (logado) {
      await menuPrincipal();
    }
  }
}

// solta o play no sistema
iniciar();

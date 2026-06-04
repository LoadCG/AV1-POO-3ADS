# 🛩️ SkyForge Web — Sistema de Gestão de Produção de Aeronaves

Sistema web Full Stack / Frontend desenvolvido como a **Avaliação 2 (AV2)** da disciplina de POO. Esta versão traz toda a lógica de negócio do CLI da AV1 para uma interface web responsiva utilizando Next.js, React e Tailwind CSS.

## 🎓 Informações Acadêmicas

**Instituição:** FATEC São José dos Campos - Prof. Jessen Vidal  
**Professor:** Gerson da Penha Neto  
**Disciplina:** Programação Orientada a Objetos (POO)  
**Aluno:** Cauan Gabriel da Silva Resende Nascimento  
**Turma:** 3º ADS (2025/1)

## 🎨 Prototipação

O design do projeto foi planejado e estruturado no Figma antes do desenvolvimento.  
🔗 **[Link para o protótipo no Figma](https://www.figma.com/design/Ff03uv28PHWfeHZ7MIECJO/SKYFORGE---AV2---WIREFRAMES---PROT%C3%93TIPOS---Cauan-Gabriel---3ADS-2025-1?node-id=0-1&t=KTkHvcfBVikMcBAf-1)**

## 🚀 Como rodar o projeto facilmente (em qualquer máquina)

Este projeto utiliza **Next.js** e depende do Node.js. Siga os passos abaixo:

1. **Pré-requisito:** Certifique-se de ter o [Node.js](https://nodejs.org/en) instalado (versão 18 ou superior).
2. Abra o terminal na pasta deste projeto (`AV2-POO-3ADS`).
3. Instale as dependências executando:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Abra o navegador e acesse: [http://localhost:3000](http://localhost:3000)

## 🔐 Acesso Padrão

Assim que o sistema carregar pela primeira vez, ele criará automaticamente um administrador para que você possa entrar:

| Usuário | Senha     | Nível          |
|---------|-----------|----------------|
| admin   | admin123  | ADMINISTRADOR  |

## 🛠️ Funcionalidades e Controle de Acesso (RBAC)

O sistema conta com proteção de rotas, componentes e hierarquia estrita:

*   **ADMINISTRADOR:** Acesso total. Único com permissão para acessar e gerenciar o módulo de **Funcionários** (listar, criar, editar com busca de endereço via CEP).
*   **ENGENHEIRO:** Focado na gestão da produção. Pode gerenciar **Aeronaves** (cadastrar, editar, excluir), cadastrar novas **Peças**, cadastrar **Etapas de Produção**, registrar resultados de **Testes de Qualidade**, e gerar o **Relatório Final**.
*   **OPERADOR:** Focado no chão de fábrica. Pode consultar as aeronaves e realizar as operações do dia a dia: **Evoluir Status** das peças, **Iniciar** ou **Finalizar** etapas e **Associar Funcionários** às etapas.

## 💡 Dica Especial (Easter Egg)

Na hora de cadastrar um novo funcionário, tente colocar o nome como **Gerson** e veja o que o sistema responde. O sistema bloqueia ou permite? Teste e descubra!

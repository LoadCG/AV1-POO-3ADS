# 🛩️ SkyForge — Sistema de Gestão de Produção de Aeronaves

Sistema CLI desenvolvido em TypeScript para gerenciar o processo de produção de aeronaves, desde o cadastro até a entrega ao cliente.

## 🎓 Informações Acadêmicas

**Instituição:** FATEC São José dos Campos - Prof. Jessen Vidal
**Professor:** Gerson da Penha Neto
**Disciplina:** Programação Orientada a Objetos (POO)  
**Aluno:** Cauan Gabriel da Silva Resende Nascimento  
**Turma:** 3º ADS (2026/1)

## Requisitos

- Node.js 18+
- npm

## Instalação

```bash
npm install
npm run build
```

## Executar

```bash
npm start
```

## Login padrão (criado automaticamente no primeiro acesso)

| Usuário | Senha     | Nível          |
|---------|-----------|----------------|
| admin   | admin123  | ADMINISTRADOR  |

## Funcionalidades

- **Aeronaves**: cadastro com código único, modelo, tipo (COMERCIAL/MILITAR), capacidade e alcance
- **Peças**: cadastro com tipo (NACIONAL/IMPORTADA) e evolução de status (EM_PRODUCAO → EM_TRANSPORTE → PRONTA)
- **Etapas**: controle sequencial de produção com validação de ordem (não pode concluir uma etapa sem a anterior estar concluída)
- **Funcionários**: cadastro com níveis de permissão (ADMINISTRADOR, ENGENHEIRO, OPERADOR)
- **Testes**: registro de testes elétrico, hidráulico e aerodinâmico com resultado APROVADO/REPROVADO
- **Relatório**: geração de relatório final em .txt na pasta `relatorios/`
- **Persistência**: todos os dados são salvos em `dados/` no formato JSON

## Estrutura

```
aerocode/
├── src/
│   ├── enums.ts       # enumerações do sistema
│   ├── models.ts      # classes Aeronave, Peca, Etapa, Funcionario, Teste
│   ├── storage.ts     # persistência em arquivos JSON
│   ├── auth.ts        # autenticação e controle de permissões
│   ├── relatorio.ts   # geração de relatório final em .txt
│   ├── input.ts       # utilitários de leitura de terminal
│   └── index.ts       # entry point e menus CLI
├── dados/             # arquivos JSON gerados automaticamente
├── relatorios/        # relatórios .txt de entrega
├── dist/              # código compilado (gerado pelo build)
├── package.json
└── tsconfig.json
```

## Compatibilidade

- Windows 10 ou superior
- Linux Ubuntu 24.04 ou superior
- Qualquer distribuição derivada do Ubuntu

## 💡 Dica Especial (Easter Egg)

Tenta cadastrar um funcionário com o nome Gerson e veja o que acontece.

# Auditoria JetaFlow

Análise técnica da calculadora e desfecho das 8 recomendações priorizadas.

- **Versão visual (Artifact):** https://claude.ai/code/artifact/d98f1c1a-e5d5-47eb-80d1-172fde03af6e
- **Commits:** `e7bec75` (feat: harden data persistence, fix quote bugs, split bundle) · `59fe6fd` (chore: stop tracking Vite transient config bundle)
- **Data:** 09/09/2026 · build de produção OK · fluxo de proposta verificado 13/13 em Chromium headless

## Antes → depois

| Métrica | Antes | Depois |
|---|---|---|
| JS na carga inicial | 521 KB gzip | 66 KB gzip |
| `recharts` (424 KB) / `html2pdf` (999 KB) | no bundle principal | chunk assíncrono (só no Dashboard / ao gerar proposta) |
| `Header.jsx` | 270 linhas | 130 linhas (orientado a array) |
| Geradores de código sequencial | 4 funções | 1 função |

## As 8 recomendações — executadas

1. **Backup e restauração de dados** — export/import `.json` de todas as chaves `jetaflow_*` em *Insumos & Preços → Backup & Restauração* (mesclar por `id` ou substituir). Tela de erro oferece exportar antes de recarregar. → `src/utils/storage.js`
2. **Proxy PNCP em produção** — `vercel.json` e `public/_redirects` reescrevem `/api/pncp/*` e `/api/compras/*`; `README` documenta outros hosts.
3. **Inicialização blindada** — `loadJSON` nunca lança exceção; `ErrorBoundary` com tela de recuperação. → `storage.js`, `src/components/ErrorBoundary.jsx`, `src/main.jsx`
4. **Código de orçamento sequencial** — `generateSequentialCode` deriva do maior código existente, não da contagem da lista. Excluir orçamentos não colide mais. → `src/utils/calculatorEngine.js`
5. **Proposta reflete o orçamento certo** — prop `sourceQuote` no `QuoteGenerator`: proposta aberta pelo histórico ou por produto configurável usa aquele registro, não o estado da calculadora.
6. **"Produtos Personalizados" integrado** — botão morto virou *Salvar no Histórico* + *Gerar Proposta*, ligados a `calcularPreco` e ao CRM. → `ProductConfigurator.jsx`, `DigitalCalculator.jsx` (ver ressalva abaixo)
7. **Code-splitting por aba** — `React.lazy` + `<Suspense>` para cada módulo. → `App.jsx`, `vite.config.js`
8. **Refatorações** — `Header.jsx` orientado a array; novo hook `usePersistentState`. → `src/hooks/usePersistentState.js`

## Registro dos 13 pontos do relatório original

| # | Item | Status |
|---|---|---|
| 1 | Busca PNCP só funcionava em `dev` | Resolvido |
| 2 | Perda total de dados trivial | Resolvido |
| 3 | `JSON.parse` sem `try/catch` → tela branca | Resolvido |
| 4 | Migração destrutiva por heurística `isOldFictitious` | **Mantido** — CRM/fornecedores/licitações preservam a heurística por decisão; `App.jsx` ainda mistura 2 padrões de persistência |
| 5 | Dados sensíveis versionados (PDFs, CNPJs reais) | **Aberto** — decisão do responsável: nada removido do Git |
| 6 | Código de orçamento duplicado ao excluir | Resolvido |
| 7 | Proposta do histórico mostrava cálculo errado | Resolvido |
| 8 | `allorigins.win` — proxy de terceiros para CNPJ | **Aberto** — `LicitacaoManager` ainda usa |
| 9 | Acabamento `per_sheet_sra3` usa `grossSheets` no offset | **Aberto** — subprecifica acabamento em offset |
| 10 | Números de precificação fora do `SettingsManager` | **Aberto** — fatores de formato, `bindingSetup` 30/20/25, bulk hardcoded no engine |
| 11 | `Header.jsx` copy-paste (270 linhas) | Resolvido |
| 12 | `vite.config.js.timestamp-*.mjs` versionado | Resolvido |
| 13 | Sem README | Resolvido |

## Ressalva: preços do produto configurável — resolvida

O fluxo do calendário de mesa funciona ponta a ponta (recálculo ao trocar atributo — +15%
de "Personalização Total" bate a matemática —, gravação com código `ORC` sequencial, proposta
com o resumo da configuração).

Os modificadores de preço de papel base/miolo deixaram de ser *"arbitrary markup for mockup"*.
Agora `CALENDAR_CONFIG.paper_pricing` (em `src/data/productConfig.js`) define, por grupo, o
papel de **referência** (custo zero, já embutido na `base_price_table`), as **folhas SRA3 por
unidade** e o **markup**. O modificador de cada papel é `(preço/folha − referência) × folhas ×
markup`, com margem só no upgrade e repasse de custo puro no downgrade. Calibragem atual:
base = Triplex C2S 300g, 0,5 fl/un; miolo = Couché 150g, 3,5 fl/un; markup ×2. Se o papel de
referência for excluído, o cálculo cai para o mais barato do grupo. → `ProductConfigurator.jsx`

## Pendências fora das 8 prioridades

- **Sem suíte de testes.** A verificação foi com script de navegador descartável; não há testes permanentes, TypeScript, ESLint ou CI.
- **`QuoteGenerator` ainda é um chunk de 999 KB** (`html2pdf` + `html2canvas` + `jspdf`). Adiado, mas pesado ao abrir.
- **Estilos majoritariamente inline e `<label>` sem `htmlFor`.** (Tema claro/escuro com alternância já implementado — sistema de tokens em `src/index.css` + `useTheme`. O JS resolve "sistema" para um `data-theme` sempre explícito, então o escuro vive num único bloco `:root[data-theme="dark"]`, sem o `@media (prefers-color-scheme: dark)` duplicado.)
- **Dashboard é a aba inicial** e força o carregamento do `recharts` (~120 KB gzip) no primeiro acesso.

## Refinamentos posteriores

- **Módulo Etiquetas** (`LabelGenerator.jsx`) — busca de CEP via ViaCEP (preenche
  logradouro/bairro/cidade/UF), QR Code do pedido (`qrcode.react`) em cada volume,
  estado de endereço consolidado num único objeto + helper `addressFromClient`,
  blocos `<style>` retirados do loop de render, e impressão em **grid A4 real**
  (1 / 2 / 4 por folha) no lugar da pilha com altura fixa. `<label htmlFor>` em
  todos os campos do painel.

## Arquivos novos nesta rodada

`src/utils/storage.js` · `src/hooks/usePersistentState.js` · `src/components/ErrorBoundary.jsx` ·
`vercel.json` · `public/_redirects` · `README.md`

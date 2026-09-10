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
| 8 | `allorigins.win` — proxy de terceiros para CNPJ | Resolvido — `fetchRazaoSocialByCnpj` usa rotas próprias `/api/cnpjws/*` e `/api/brasilapi/*` (proxy→direto), configuradas em `vercel.json`, `public/_redirects` e `vite.config.js` |
| 9 | Acabamento `per_sheet_sra3` usa `grossSheets` no offset | Resolvido — em offset o acabamento por folha agora incide sobre a folha-máquina impressa (`grossSheets × cutsPerFullSheet`); digital/grande formato inalterados. Tabela Positiva mantém `grossSheets` (cotada por milheiro da folha inteira) |
| 10 | Números de precificação fora do `SettingsManager` | Resolvido (parcial) — fatores de formato e tarifas de encadernação editorial viraram `DEFAULT_FORMAT_MULTIPLIERS` / `DEFAULT_EDITORIAL_BINDING` em `initialData.js`, persistidos em `digitalClickRates` e editáveis em *Insumos & Preços → Cliques Digitais*; a tabela de `bulk` de papel virou `DEFAULT_PAPER_BULK` (constante nomeada, ainda sem UI). Margens de garra do offset e defaults da tabela Positiva seguem no engine |
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
  no lugar da pilha com altura fixa. `<label htmlFor>` em todos os campos do painel.
  - **Impressão em A4 retrato, etiqueta na largura total da folha:** `@page { size: A4
    portrait }`, etiquetas em faixa ocupando os ~198 mm de largura, empilhadas na vertical
    (grid `1fr`). Layouts 1 / 2 / 3 / 4 por folha = frações da altura útil (~285 mm):
    283 / 140 / 92 / 69 mm. Flag `layout.compact` (3 e 4) reduz paddings/fontes no lugar
    do antigo `labelsPerSheet === 4`. QR e blocos internos (destinatário / endereço /
    conteúdo | coluna volume+QR) mantêm proporção legível em todos os layouts.
  - A etiqueta impressa sai a **90 % da largura útil** e **centralizada** na folha
    (`.label-card { width: 90%; margin: 0 auto }` + `.print-area { justify-items: center }`).
    Prévia na tela espelha isso (`width: 90%`, `aspect-ratio: 178 × cardMm`).
  - Coluna direita (Lote Total / Volume / Neste vol. / QR) **+20 %** de largura:
    impressão 116→139 px (compact 96→115 px), prévia 108→130 px.
  - **Logo JETAPRINT no cabeçalho** — o `<img>` (`public/JETAPRINT_LOGO_01_2026-01.jpg`)
    substitui o texto `JETAPRINT` no print (antes era `no-print` + `.print-only-logo`).
    Cabeçalho passou a fundo branco com texto escuro (o logo é colorido sobre branco;
    o `filter: brightness(0) invert(1)` sobre fundo preto o apagava). Altura 30 px
    (22 px nos layouts compactos). Regra `print-color-adjust: exact` em `.print-area *`
    garante logo, fundos cinza e bordas na impressão real (não só no PDF do Chrome).
    Na **impressão** o logo sai **+20 %** (36 px, 26 px nos compactos) via regra
    `@media print .label-header img { height }` — a prévia mantém 30/22 px.
  - **Sem quadros/contornos** — removidas na impressão E na prévia: borda do cartão,
    borda inferior do cabeçalho, caixas de endereço e conteúdo (borda + fundo), e a
    linha tracejada vertical entre o corpo e a coluna volume/QR.
  - **Linha de corte pontilhada** entre as etiquetas: `.label-card { border-bottom:
    2px dotted rgba(0,0,0,0.3) }` (30 % de preto), impressão e prévia, em todos os
    cartões — separador entre etiquetas e guia de refile ao pé da folha.
  - **QR Code removido** — `qrcode.react` desinstalado (dep + import), helper `qrValue` e
    `layout.qrPx` eliminados.
  - **Rediagramação sem QR:** etiqueta agora é coluna única com traços horizontais a
    **50 % de preto** (`FIELD_RULE`) entre cabeçalho, Destinatário, Endereço e Conteúdo;
    a coluna lateral de volume virou uma **faixa de rodapé** — `VOLUME i/n` grande à
    esquerda, `QTD. NESTE VOLUME` e `LOTE TOTAL` à direita. Rótulos de seção
    padronizados (`SEC_LABEL_STYLE`). Sem fundos cinza nem caixas. O número `i/n`
    (`.vol-number`) foi ampliado ~30 % (2,5 rem normal / 1,9 rem compacto).
  - **Respiro acima e abaixo** de cada etiqueta na impressão: `.label-card + .label-card
    { margin-top: 6mm }` (topo, para o logo não colar na linha) e `.label-card {
    padding-bottom: 6mm }` (base, para o QR não colar na linha) — 4mm nos layouts
    compactos, ambos espelhados na prévia. Os `cardMm` dos layouts 1–4 foram reduzidos
    ~5 mm (281/134/87/64) para o conjunto + margens caber na folha.

## Rodada de ajustes — itens 8, 9 e 10

- **#8 — proxy CNPJ próprio.** `api.allorigins.win` saiu. `fetchRazaoSocialByCnpj` agora
  consulta `/api/cnpjws/cnpj/:cnpj` e, no fallback, `/api/brasilapi/api/cnpj/v1/:cnpj`, cada
  um com o padrão proxy→direto do `pncpService`. Rotas adicionadas nos 3 pontos de config
  (`vercel.json`, `public/_redirects`, `vite.config.js`).
- **#9 — acabamento por folha no offset.** Resolvido pela redesenho do off-set (abaixo):
  `grossSheets` agora é sempre a contagem de folhas-máquina impressas, então
  `per_sheet_sra3` incide direto sobre ele em todos os modos, sem caso especial.
- **#10 — parâmetros de precificação editáveis.**
  - `DEFAULT_FORMAT_MULTIPLIERS` (fonte única — antes duplicado 3× no `App.jsx` e 4× no engine).
    Helper `resolveFormatFactor()` no engine; `activeDigitalClickRates` simplificado no `App.jsx`.
  - `DEFAULT_EDITORIAL_BINDING` (`{ setup, unit, label }` por método). O engine lê de
    `digitalClickRates.bindingRates` com fallback aos defaults.
  - Ambos persistidos junto de `jetaflow_clicks` e editáveis em *Cliques Digitais* (dois blocos
    novos: multiplicador por formato com preço efetivo ao vivo, e tarifas de encadernação).
  - `DEFAULT_PAPER_BULK` — a cadeia de `if/includes` do cálculo de lombada virou tabela
    nomeada em `initialData.js` (mesma ordem de match). Sem editor de UI ainda.
## Redesenho do módulo Off-set

Antes: seletor "Formato de Folha Inteira (Compra)" + busca automática de melhor corte
(`cutOptions` 1/2/3/4/8/9) contra o formato máx da prensa. O SRA3 aparecia no meio dos
formatos de compra.

Agora:
- **Ficha técnica da Roland 202 TOB** completada em `initialData.js` (folha 210×280 a
  520×740 mm, impressão máx 510×735, chapa 550×650, `minW/minH`, `maxPrintW/H`, `gripperMm`).
- **Folha inteira de compra** deixa de ter seletor próprio — vem do formato do papel
  selecionado via `PAPER_FORMAT_DIMENSIONS` (`66x96`→660×960, `64x88`→640×880, …).
- **Seletor "Formato na Máquina (folha cortada)"** lista `DEFAULT_SHEET_SIZES` com
  `machineFormat: true` (76×112 a 24×33), filtrados por compatibilidade com a prensa
  (cabe em qualquer orientação, dentro do máx e acima do mín). SRA3 removido do off-set.
- **Engine** (`calculateBudget`, ramo `offset`): calcula folhas-máquina por folha de compra
  (`floor` nas 2 orientações), `grossSheets` = folhas-máquina impressas (com acerto),
  `remaFullSheets` = folhas inteiras de compra, custo do papel por folha inteira
  (usa `pricePerFullSheet` se houver, senão peso × R$/kg). Sem mais `cutOptions`.
- **Normalização** no `OffsetCalculator`: se o equipamento herdado for digital, seleciona a
  1ª prensa off-set; se o formato de máquina não servir, escolhe o default — folha inteira
  quando a prensa roda a folha de compra toda (Industrial → 66×96), senão o maior formato
  que caiba na folha de compra e a divida em ≥2 (Roland + papel 66×96 → 48×66, ½).
  `App.jsx` também força `equipment` off-set no `budgetConfig` da aba.
- Avisos: gramatura, folha-máquina acima do máx / abaixo do mín da prensa, papel sem
  formato definido, folha-máquina maior que a folha de compra.
- `SheetViewer` e `FinancialSummary` atualizados para a nova semântica (folha de compra →
  N folhas de máquina; custo por folha inteira).
- Verificado no engine: Roland+66×96 → 48×66 = 2/folha, 33×48 = 4/folha, 52×74 = 1/folha
  (desperdício, papel ~2×); Industrial+66×96 → 66×96 inteira = 1/folha. `per_sheet_sra3` e
  Positiva batem com `grossSheets`. Digital/editorial inalterados.

## Arquivos novos nesta rodada

`src/utils/storage.js` · `src/hooks/usePersistentState.js` · `src/components/ErrorBoundary.jsx` ·
`vercel.json` · `public/_redirects` · `README.md`

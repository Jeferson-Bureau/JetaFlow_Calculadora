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
| 10 | Números de precificação fora do `SettingsManager` | Resolvido — fatores de formato, tarifas de encadernação editorial e bulk de papel viraram `DEFAULT_FORMAT_MULTIPLIERS` / `DEFAULT_EDITORIAL_BINDING` / `DEFAULT_PAPER_BULK` em `initialData.js`, persistidos em `digitalClickRates` e editáveis em *Insumos & Preços → Cliques Digitais*. Margens de garra do offset e defaults da tabela Positiva seguem no engine (não editáveis via UI) |
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

- **Sem suíte de testes.** A verificação foi com script de navegador descartável; não há testes permanentes, TypeScript, ESLint ou CI. **Aberto.**
- **`QuoteGenerator` ainda é um chunk de 999 KB** (`html2pdf` + `html2canvas` + `jspdf`). Adiado, mas pesado ao abrir. **Aberto.**
- **Estilos majoritariamente inline.** Tema claro/escuro com alternância já implementado — sistema de tokens em `src/index.css` + `useTheme`. O JS resolve "sistema" para um `data-theme` sempre explícito, então o escuro vive num único bloco `:root[data-theme="dark"]`, sem o `@media (prefers-color-scheme: dark)` duplicado. `<label>` sem `htmlFor` — **Resolvido** (ver rodada abaixo); estilos inline em si seguem como estão (baixo risco, alto custo de refatorar sem sistema de design definido).
- **Dashboard é a aba inicial** — **Resolvido** (ver rodada abaixo).

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
  - **Rodapé modernizado** — o número do VOLUME vira o elemento tipográfico dominante
    da etiqueta: dígito principal em destaque (3,9 rem normal / 2,7 rem compacto,
    peso 900) com o `/n` menor e acinzentado ao lado, em vez do antigo "1/3" num
    tamanho só. "Neste volume" e "Lote total" também ampliados (2 rem / 1,5 rem,
    algarismos tabulares) com o sufixo "un." reduzido junto ao número. Cabeçalho e
    corpo ganharam mais respiro (`padding` maior nos layouts não compactos) e o nome
    do destinatário e o texto do conteúdo/endereço subiram um ponto para reforçar a
    hierarquia visual.
  - **Correção: layout bagunçado com conteúdo real.** As fontes ampliadas do rodapé
    somadas ao cabeçalho com NF (3 linhas) faziam o orçamento de altura dos layouts
    compactos (3–4/folha) estourar com endereço completo + nome longo + descrição —
    o bloco Conteúdo/Especificações sumia por completo (`flex:1; min-height:0`
    encolhia a zero) e o texto de Endereço ficava cortado colado no rodapé seguinte.
    Corrigido com: NF unificado na linha do PEDIDO (economiza uma linha no
    cabeçalho); `.label-addr` com `max-height` travada nos compactos (12 mm — cabe
    rua + cidade/CEP; telefone só aparece com folga, 1–2/folha); `.label-content`
    com `min-height` garantido (7 mm compacto / 14 mm normal) em vez de `0`, então
    nunca mais desaparece; paddings de cabeçalho/corpo/rodapé e o próprio
    `padding-bottom` do cartão cortados mais um pouco nos compactos para abrir
    espaço. Números do rodapé recuados de 3,9/2,7 rem para 3,4/2,1 rem (volume) e de
    2/1,5 rem para 1,7/1,1 rem (quantidades) — ainda bem maiores que antes da
    modernização, mas sem espremer o resto. Testado com nome de cliente longo,
    endereço completo (rua + bairro + cidade/UF/CEP + telefone), descrição de 89
    caracteres e observação, nos 4 layouts — sem sobreposição, corte de texto ou
    página extra.

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

## Marcação por faixa de quantidade + aba de orçamentos unificada

**Marcação (substitui o markup por divisor "por dentro"):**
- `DEFAULT_MARKUP_TIERS` em `initialData.js` — `small` ≤ 100 (×2,5) · `medium` ≤ 500 (×2,0)
  · `large` (×1,7). Entra em `DEFAULT_FINANCIAL_CONFIG.markupTiers`;
  `calculationMethod: 'multiplier'`. `desiredProfitPercent` vira **meta/referência**.
- `resolveMarkup(financialConfig, qty, override)` no engine escolhe a faixa por `qty` (ou
  usa o `override` numérico do orçamento). `calculateBudget`:
  `Preço de Venda = Custo Industrial × multiplicador`; imposto e comissão são deduzidos
  e exibidos; **lucro líquido = resíduo** (`netProfitVal` / `netProfitPct`).
  Novos campos em `costs`: `markupMultiplier`, `markupTier(Label)`, `markupTierMultiplier`,
  `markupIsOverride`, `grossMarkupVal`, `netProfitVal`, `netProfitPct`
  (`profitVal` mantido = `netProfitVal` para compat). `generateTierMatrix` roda cada
  linha na sua própria faixa (ignora override).
- `FinancialSummary`: input **Multiplicador de Marcação (×)** pré-preenchido pela faixa,
  editável → grava `markupOverride` transitório (estado no `App.jsx`); link "usar valor
  da faixa" limpa. Tabela editável das 3 faixas (limite + multiplicador). DRE novo
  (CI × mult − imposto − comissão = lucro líquido). Matriz de tiragens ganha coluna
  "Marcação". Verificado: qty 80/300/2000 → ×2,5/2,0/1,7.

**Aba única "Orçamentos":**
- `Header`: removidas as abas `offset` e `large_format`; `digital` → **"Orçamentos"**
  (ícone `Calculator`).
- `App.jsx`: estado `productionMode` (`digital|offset|large_format`) dirige `budgetConfig.mode`,
  `productCategory` efetivo, `budgetEquipment` e o render do workspace. Novo
  `ProductionModeSwitch.jsx` (seletor segmentado no topo). `goToQuote(mode)` para os
  atalhos do Dashboard; `handleReopenQuoteInCalculator` e `handleSaveQuoteToHistory`
  passam a considerar/gravar `quote.mode`.
- Acabamentos, resumo financeiro e proposta continuam compartilhados entre os 3 modos.
- "Produtos Personalizados" (`configurable`, motor `pricing.js`) intacto.

## Rodada de ajustes — pendências fora das 8 prioridades

- **Dashboard deixou de ser a aba inicial.** `activeTab` agora inicia em `'digital'`
  (Orçamentos) — primeiro acesso não carrega mais o chunk do `recharts` (~120 KB gzip).
  → `App.jsx`
- **`DEFAULT_PAPER_BULK` ganhou UI editável.** Cada família de papel recebeu uma `key`
  estável; `calculateSpineThickness` passa a aceitar uma tabela de bulk e um fallback
  como parâmetros (em vez de importar a constante fixa). Novo helper
  `resolvePaperBulkTable()` mescla overrides de `digitalClickRates.paperBulk` com os
  defaults. Editor em *Insumos & Preços → Cliques Digitais* (mesmo padrão das tarifas de
  encadernação): bulk por família + fallback para papel não reconhecido, persistidos em
  `jetaflow_clicks`. → `initialData.js`, `calculatorEngine.js`, `SettingsManager.jsx`
- **`<label>` sem `htmlFor` residual.** Revisão dos componentes restantes
  (`DigitalCalculator`, `FinancialSummary`, `ProductConfigurator`, `QuoteGenerator`):
  labels que eram cabeçalho de grupo (sem input único associado) viraram `<div
  className="form-label">`; labels de campo único ganharam `id`/`htmlFor` pareados.
  Labels que já envolvem o próprio input (checkbox, radio) foram deixados como estavam —
  já são acessíveis sem `htmlFor`. Build de produção OK, smoke test em Chromium headless
  sem erros de console.

## Arquivos novos nesta rodada

`src/utils/storage.js` · `src/hooks/usePersistentState.js` · `src/components/ErrorBoundary.jsx` ·
`src/components/ProductionModeSwitch.jsx` · `vercel.json` · `public/_redirects` · `README.md`

## Bug corrigido — fallback da busca PNCP nunca disparava

`fetchFromPncp()` (`src/services/pncpService.js`) tentava o proxy (`/api/pncp/...`) e, se
falhasse, caía para a URL direta (`https://pncp.gov.br/...`) — mas as duas tentativas
reaproveitavam o **mesmo** `AbortSignal.timeout()`, criado uma única vez pelo chamador. Um
`AbortSignal.timeout()` dispara uma vez só a partir da criação; quando a 1ª tentativa consumia
o timeout inteiro (comum — a API pública do PNCP é lenta/instável), a 2ª chegava com o sinal
já abortado e o `fetch` rejeitava na hora, sem nunca tentar a rede. Corrigido: cada tentativa
do loop cria seu próprio `AbortSignal.timeout()` via um novo parâmetro `timeoutMs` (15s → 25s
por tentativa). Verificado em Chromium headless: antes só 1 requisição aparecia na rede; depois,
as 2 (proxy e direta) são efetivamente disparadas. A API do PNCP em si seguiu instável durante
os testes (confirmado via `curl` direto, fora do app) — isso é externo, sem solução do nosso lado.
Commit `0c823fa`.

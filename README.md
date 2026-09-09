# JetaFlow Calculadora

Calculadora de custos e orçamentos da **JETAPRINT Gráfica Multimídia** — impressão digital,
offset e grande formato, com CRM de clientes, fornecedores, gestão de licitações (integração
PNCP), histórico de orçamentos, proposta comercial em PDF e etiquetas de expedição.

SPA em React + Vite. Sem backend: todo o estado fica no `localStorage` do navegador.

## Desenvolvimento

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # gera dist/
npm run preview  # serve o build localmente
```

## Backup dos dados (importante)

Todos os dados (clientes, fornecedores, licitações, orçamentos e tabelas de preços) vivem
**apenas no navegador**. Limpar os dados do site, trocar de navegador ou de computador apaga tudo.

Use **Insumos & Preços → Backup & Restauração** para exportar/importar um arquivo `.json`
com frequência. A tela de erro (caso a interface quebre) também oferece o botão de exportar
antes de recarregar.

## APIs externas e proxy

As consultas ao **PNCP** (`pncp.gov.br`) e ao **Compras.gov.br** exigem um proxy para evitar
bloqueio de CORS:

- **`npm run dev`**: já configurado em `vite.config.js` (`/api/pncp`, `/api/compras`).
- **Deploy na Vercel**: `vercel.json` reescreve as mesmas rotas.
- **Deploy na Netlify**: `public/_redirects` faz o mesmo.
- **Outro host estático**: configure reescritas equivalentes de `/api/pncp/*` →
  `https://pncp.gov.br/api/consulta/*` e `/api/compras/*` →
  `https://dadosabertos.compras.gov.br/*`, senão a busca de licitações não funciona.

## Estrutura

| Caminho | Papel |
|---|---|
| `src/App.jsx` | Estado central + navegação por abas (lazy-loaded) |
| `src/utils/calculatorEngine.js` | Motor de precificação (folha, corte offset, lombada, DRE) |
| `src/utils/pricing.js` + `src/data/productConfig.js` | Precificação por faixa de quantidade (produtos configuráveis) |
| `src/utils/storage.js` | Leitura tolerante a falhas + backup/restore do `localStorage` |
| `src/hooks/usePersistentState.js` | `useState` que persiste automaticamente |
| `src/services/pncpService.js` | Cliente das APIs PNCP / Compras.gov.br |
| `src/components/` | Um componente por aba/módulo |

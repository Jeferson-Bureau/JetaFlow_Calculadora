// Resumos derivados usados por mais de uma tela (Dashboard, histórico de orçamentos).
// Funções puras, sem React, para serem testáveis.

const sumValue = (list) => list.reduce((acc, b) => acc + (Number(b.totalValue) || 0), 0);

/**
 * Estatísticas das licitações para o Dashboard, com os MESMOS status da aba
 * Licitações (LicitacaoManager): agendada · em_disputa · proposta_enviada ·
 * vencedora · homologada · fracassada · cancelada.
 * - "em disputa" = agendada + em_disputa (igual a "Sessões Agendadas" na aba)
 * - "ganhas"     = vencedora + homologada (igual a "Arrematadas / Vencedoras")
 * - pipeline    = todas menos canceladas/fracassadas (igual a "Valor Total Estimado")
 */
export function summarizeBiddings(biddings = []) {
  const inDispute = biddings.filter(b => b.status === 'agendada' || b.status === 'em_disputa');
  const won = biddings.filter(b => b.status === 'vencedora' || b.status === 'homologada');
  const proposals = biddings.filter(b => b.status === 'proposta_enviada');
  const active = biddings.filter(b => b.status !== 'cancelada' && b.status !== 'fracassada');

  const upcoming = [...inDispute].sort((a, b) =>
    `${a.sessionDate || '9999-12-31'} ${a.sessionTime || '00:00'}`.localeCompare(`${b.sessionDate || '9999-12-31'} ${b.sessionTime || '00:00'}`)
  ).slice(0, 4);

  return {
    total: biddings.length,
    inDisputeCount: inDispute.length,
    wonCount: won.length,
    proposalsCount: proposals.length,
    pipelineValue: sumValue(active),
    inDisputeValue: sumValue(inDispute),
    wonValue: sumValue(won),
    proposalsValue: sumValue(proposals),
    upcoming
  };
}

const MODE_LABELS = {
  digital: 'Impressão Digital',
  offset: 'Off-set',
  large_format: 'Grande Formato'
};

/**
 * Monta o registro de orçamento a partir do estado atual da calculadora, com os
 * campos que o histórico exibe e que o "Recarregar" usa para restaurar a tela
 * (paperId, sheetId, productW/H, colors, quantity, mode).
 */
export function buildQuoteFromCalculator({
  mode = 'digital',
  productCategory = 'flat',
  paper = {},
  sheet = {},
  productW,
  productH,
  colors,
  quantity,
  finishings = [],
  editorial = {},
  largeFormat = {},
  budgetResult = {}
}) {
  const costs = budgetResult.costs || {};
  const qty = Number(budgetResult.quantity || quantity) || 1;
  const isLarge = mode === 'large_format';
  const isEditorial = mode === 'digital' && productCategory === 'editorial';

  const kind = isEditorial
    ? `Editorial ${editorial.pagesCount || ''} págs`.trim()
    : MODE_LABELS[mode] || 'Produção Gráfica';

  const dimensions = isLarge
    ? `${Number(largeFormat.widthM) || 0} x ${Number(largeFormat.heightM) || 0} m`
    : `${productW} x ${productH} mm`;

  const finishingsSummary = finishings.length
    ? finishings.map(f => String(f.name || '').replace('Positiva - ', '').replace('JetaPrint - ', '')).join(', ')
    : '';

  return {
    description: `${kind} — ${dimensions} — ${qty.toLocaleString('pt-BR')} un`,
    paperName: isLarge ? 'Material por m²' : (paper.name || '—'),
    paperId: isLarge ? undefined : paper.id,
    sheetId: isLarge ? undefined : sheet.id,
    dimensions,
    productW: isLarge ? undefined : Number(productW),
    productH: isLarge ? undefined : Number(productH),
    colors: isLarge ? undefined : colors,
    finishingsSummary,
    quantity: qty,
    unitValue: Number(costs.unitPrice) || 0,
    totalValue: Number(costs.finalPrice) || 0
  };
}

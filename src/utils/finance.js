// Lógica do módulo Financeiro (contas a receber / a pagar, fluxo de caixa).
// Funções puras — sem React nem localStorage — para serem testáveis.
//
// Lançamento:
// {
//   id, code: 'FIN-A0001', type: 'receber' | 'pagar',
//   description, category, amount (R$),
//   dueDate: 'YYYY-MM-DD', paidDate: 'YYYY-MM-DD' | null, canceled?: true,
//   clientId?, supplierId?, partyName,
//   origin?: { kind: 'quote' | 'bidding', id, code },
//   groupId?, installment?, installments?, paymentMethod?, notes?, createdAt
// }

import { generateSequentialCode } from './calculatorEngine';

export const RECEIVABLE_CATEGORIES = [
  { id: 'venda', label: 'Venda / Orçamento' },
  { id: 'licitacao', label: 'Licitação / Órgão público' },
  { id: 'servico', label: 'Serviço avulso' },
  { id: 'outras_receitas', label: 'Outras receitas' }
];

export const PAYABLE_CATEGORIES = [
  { id: 'papel', label: 'Papel e substratos' },
  { id: 'insumos', label: 'Tintas, toner e cliques' },
  { id: 'terceirizados', label: 'Acabamento terceirizado' },
  { id: 'fornecedores', label: 'Outros fornecedores' },
  { id: 'aluguel', label: 'Aluguel' },
  { id: 'folha', label: 'Salários e pró-labore' },
  { id: 'impostos', label: 'Impostos' },
  { id: 'energia', label: 'Energia, água e internet' },
  { id: 'manutencao', label: 'Manutenção de equipamentos' },
  { id: 'outras_despesas', label: 'Outras despesas' }
];

export const PAYMENT_METHODS = ['PIX', 'Boleto', 'Transferência', 'Cartão', 'Dinheiro', 'Empenho / Nota de Empenho'];

export const categoryLabel = (type, id) => {
  const list = type === 'pagar' ? PAYABLE_CATEGORIES : RECEIVABLE_CATEGORIES;
  return list.find(c => c.id === id)?.label || id || '—';
};

export const generateNextFinanceCode = (entries = []) => generateSequentialCode('FIN', entries);

export const roundCents = (v) => Math.round((Number(v) || 0) * 100) / 100;

// ── Datas (sempre 'YYYY-MM-DD' no fuso local) ────────────────────────────────

const pad = (n) => String(n).padStart(2, '0');

export function toDateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayStr() {
  return toDateStr(new Date());
}

function parseDate(str) {
  const [y, m, d] = String(str).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(dateStr, days) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + Number(days || 0));
  return toDateStr(d);
}

// Soma meses mantendo o dia; se o mês não tem esse dia (31 → fevereiro), usa o último.
export function addMonths(dateStr, months) {
  const d = parseDate(dateStr);
  const day = d.getDate();
  const target = new Date(d.getFullYear(), d.getMonth() + Number(months || 0), 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, lastDay));
  return toDateStr(target);
}

export const monthKey = (dateStr) => String(dateStr || '').slice(0, 7); // 'YYYY-MM'

export function formatDateBR(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

const MONTHS_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export function formatMonthBR(key) {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS_PT[m - 1]}/${y}`;
}

export const formatBRL = (v) =>
  `R$ ${(Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Status ──────────────────────────────────────────────────────────────────

/** 'pago' | 'cancelado' | 'vencido' | 'aberto' (vence hoje ainda é 'aberto'). */
export function entryStatus(entry, today = todayStr()) {
  if (entry.canceled) return 'cancelado';
  if (entry.paidDate) return 'pago';
  if (entry.dueDate && entry.dueDate < today) return 'vencido';
  return 'aberto';
}

// ── Parcelas ────────────────────────────────────────────────────────────────

export const PAYMENT_PRESETS = {
  avista: { label: 'À vista', percents: [100] },
  sinal_entrega: { label: '50% sinal + 50% na entrega', percents: [50, 50] },
  parcelado: { label: 'Parcelado', percents: null }
};

/**
 * Divide um total em parcelas.
 * - `percents` (ex.: [50, 50]) define a proporção de cada parcela; senão, `count` parcelas iguais.
 * - Vencimentos: o 1º em `firstDue`; os seguintes a cada `intervalDays` dias ou,
 *   com `monthly: true`, no mesmo dia dos meses seguintes.
 * - Os centavos que sobram do arredondamento vão para a última parcela, então a
 *   soma bate exatamente com o total.
 */
export function buildInstallments({ total, count = 1, percents = null, firstDue, intervalDays = 30, monthly = false }) {
  const t = roundCents(total);
  const shares = percents && percents.length
    ? percents.map(Number)
    : Array.from({ length: Math.max(1, Math.floor(Number(count) || 1)) }, () => 1);
  const sum = shares.reduce((a, b) => a + b, 0) || 1;
  const n = shares.length;

  let allocated = 0;
  return shares.map((share, i) => {
    const amount = i === n - 1 ? roundCents(t - allocated) : roundCents((t * share) / sum);
    allocated = roundCents(allocated + amount);
    return {
      installment: i + 1,
      installments: n,
      amount,
      dueDate: monthly ? addMonths(firstDue, i) : addDays(firstDue, i * Number(intervalDays || 0))
    };
  });
}

// ── Resumos ─────────────────────────────────────────────────────────────────

/**
 * Totais do painel. Cancelados ficam de fora de tudo.
 * `cashBalance` = saldo inicial + tudo que foi recebido − tudo que foi pago (realizado).
 */
export function summarize(entries = [], { today = todayStr(), openingBalance = 0 } = {}) {
  const month = monthKey(today);
  const s = {
    receivableOpen: 0, receivableOverdue: 0, receivableOverdueCount: 0,
    payableOpen: 0, payableOverdue: 0, payableOverdueCount: 0,
    receivedMonth: 0, paidMonth: 0,
    dueNext7Receivable: 0, dueNext7Payable: 0,
    cashBalance: roundCents(openingBalance)
  };
  const in7 = addDays(today, 7);

  for (const e of entries) {
    const status = entryStatus(e, today);
    if (status === 'cancelado') continue;
    const amount = Number(e.amount) || 0;
    const isIn = e.type === 'receber';

    if (status === 'pago') {
      s.cashBalance += isIn ? amount : -amount;
      if (monthKey(e.paidDate) === month) {
        if (isIn) s.receivedMonth += amount; else s.paidMonth += amount;
      }
      continue;
    }

    if (isIn) s.receivableOpen += amount; else s.payableOpen += amount;
    if (status === 'vencido') {
      if (isIn) { s.receivableOverdue += amount; s.receivableOverdueCount++; }
      else { s.payableOverdue += amount; s.payableOverdueCount++; }
    } else if (e.dueDate <= in7) {
      if (isIn) s.dueNext7Receivable += amount; else s.dueNext7Payable += amount;
    }
  }

  for (const k of Object.keys(s)) if (!k.endsWith('Count')) s[k] = roundCents(s[k]);
  s.resultMonth = roundCents(s.receivedMonth - s.paidMonth);
  return s;
}

/**
 * Fluxo de caixa mês a mês, a partir do mês de `today`.
 * - Pagos contam no mês da baixa (realizado); em aberto, no mês do vencimento (previsto).
 * - Em aberto já vencidos entram no mês atual (é quando se espera que o dinheiro se mova).
 * - O saldo começa no saldo de caixa realizado até o mês anterior.
 */
export function cashFlowByMonth(entries = [], { today = todayStr(), months = 6, openingBalance = 0 } = {}) {
  const startKey = monthKey(today);
  const keys = Array.from({ length: months }, (_, i) => monthKey(addMonths(`${startKey}-01`, i)));
  const rows = keys.map(key => ({ month: key, inflow: 0, outflow: 0, realizedIn: 0, realizedOut: 0 }));
  const byKey = Object.fromEntries(rows.map(r => [r.month, r]));

  let balance = Number(openingBalance) || 0;

  for (const e of entries) {
    const status = entryStatus(e, today);
    if (status === 'cancelado') continue;
    const amount = Number(e.amount) || 0;
    const sign = e.type === 'receber' ? 1 : -1;

    let key;
    if (status === 'pago') {
      key = monthKey(e.paidDate);
      if (key < startKey) { balance += sign * amount; continue; }
    } else {
      key = monthKey(e.dueDate) < startKey ? startKey : monthKey(e.dueDate);
    }

    const row = byKey[key];
    if (!row) continue; // além do horizonte
    if (sign > 0) row.inflow += amount; else row.outflow += amount;
    if (status === 'pago') {
      if (sign > 0) row.realizedIn += amount; else row.realizedOut += amount;
    }
  }

  return rows.map(r => {
    balance += r.inflow - r.outflow;
    return {
      ...r,
      inflow: roundCents(r.inflow),
      outflow: roundCents(r.outflow),
      realizedIn: roundCents(r.realizedIn),
      realizedOut: roundCents(r.realizedOut),
      net: roundCents(r.inflow - r.outflow),
      balance: roundCents(balance)
    };
  });
}

// ── Integração com Orçamentos e Licitações ──────────────────────────────────

export const WON_BIDDING_STATUSES = ['vencedora', 'homologada'];

/**
 * Orçamentos aprovados e licitações vencedoras/homologadas que ainda não têm
 * nenhuma conta a receber ligada (origin.kind + origin.id).
 */
export function pendingBillables(quotes = [], biddings = [], entries = []) {
  const billed = new Set(
    entries.filter(e => e.origin && !e.canceled).map(e => `${e.origin.kind}:${e.origin.id}`)
  );

  const fromQuotes = quotes
    .filter(q => q.status === 'aprovado' && !billed.has(`quote:${q.id}`))
    .map(q => ({
      kind: 'quote',
      id: q.id,
      code: q.code,
      partyName: q.clientName || 'Cliente',
      clientId: q.clientId || '',
      description: q.description || 'Orçamento aprovado',
      amount: roundCents(q.totalValue),
      category: 'venda'
    }));

  const fromBiddings = biddings
    .filter(b => WON_BIDDING_STATUSES.includes(b.status) && !billed.has(`bidding:${b.id}`))
    .map(b => ({
      kind: 'bidding',
      id: b.id,
      code: b.code,
      partyName: b.agency || 'Órgão público',
      clientId: '',
      description: `${b.biddingNumber || 'Licitação'} — ${b.objectDescription || ''}`.trim().replace(/—\s*$/, '').trim(),
      amount: roundCents(b.totalValue),
      category: 'licitacao'
    }));

  return [...fromQuotes, ...fromBiddings];
}

/**
 * Situação da cobrança de um orçamento/licitação no financeiro, ou `null` se
 * ainda não há conta a receber ativa ligada a ele.
 */
export function billingSummary(kind, id, entries = [], today = todayStr()) {
  const linked = entries.filter(e => e.origin?.kind === kind && e.origin?.id === id && !e.canceled);
  if (linked.length === 0) return null;
  const total = roundCents(linked.reduce((s, e) => s + (Number(e.amount) || 0), 0));
  const paidTotal = roundCents(linked.filter(e => e.paidDate).reduce((s, e) => s + (Number(e.amount) || 0), 0));
  return {
    count: linked.length,
    total,
    paidTotal,
    allPaid: paidTotal >= total,
    hasOverdue: linked.some(e => entryStatus(e, today) === 'vencido')
  };
}

/**
 * Em aberto que pedem atenção: vencidos + os que vencem nos próximos `days` dias,
 * do vencimento mais antigo para o mais novo.
 */
export function upcomingDue(entries = [], { today = todayStr(), days = 7, limit = 5 } = {}) {
  const until = addDays(today, days);
  return entries
    .filter(e => {
      const st = entryStatus(e, today);
      return (st === 'vencido' || st === 'aberto') && e.dueDate <= until;
    })
    .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))
    .slice(0, limit);
}

/** Compara por vencimento (mais antigo primeiro); pagos por último, mais recentes antes. */
export function compareEntries(a, b) {
  const pa = a.paidDate ? 1 : 0;
  const pb = b.paidDate ? 1 : 0;
  if (pa !== pb) return pa - pb;
  if (pa) return String(b.paidDate).localeCompare(String(a.paidDate));
  return String(a.dueDate).localeCompare(String(b.dueDate));
}

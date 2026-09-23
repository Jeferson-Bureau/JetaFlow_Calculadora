import { describe, it, expect } from 'vitest';
import {
  addDays,
  addMonths,
  entryStatus,
  buildInstallments,
  summarize,
  cashFlowByMonth,
  pendingBillables,
  compareEntries,
  generateNextFinanceCode,
  formatDateBR,
  formatMonthBR
} from './finance';

const TODAY = '2026-09-23';
const rec = (amount, dueDate, extra = {}) => ({ type: 'receber', amount, dueDate, paidDate: null, ...extra });
const pay = (amount, dueDate, extra = {}) => ({ type: 'pagar', amount, dueDate, paidDate: null, ...extra });

describe('datas', () => {
  it('addDays atravessa meses e anos', () => {
    expect(addDays('2026-09-23', 30)).toBe('2026-10-23');
    expect(addDays('2026-12-25', 10)).toBe('2027-01-04');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('addMonths mantém o dia e usa o último dia quando o mês é mais curto', () => {
    expect(addMonths('2026-01-15', 1)).toBe('2026-02-15');
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29'); // bissexto
    expect(addMonths('2026-11-30', 3)).toBe('2027-02-28');
  });

  it('formatação pt-BR', () => {
    expect(formatDateBR('2026-09-05')).toBe('05/09/2026');
    expect(formatDateBR(null)).toBe('—');
    expect(formatMonthBR('2026-09')).toBe('set/2026');
  });
});

describe('entryStatus', () => {
  it('pago, cancelado, vencido e aberto', () => {
    expect(entryStatus(rec(10, '2026-09-01', { paidDate: '2026-09-02' }), TODAY)).toBe('pago');
    expect(entryStatus(rec(10, '2026-09-01', { canceled: true }), TODAY)).toBe('cancelado');
    expect(entryStatus(rec(10, '2026-09-22'), TODAY)).toBe('vencido');
    expect(entryStatus(rec(10, TODAY), TODAY)).toBe('aberto'); // vence hoje ainda não venceu
    expect(entryStatus(rec(10, '2026-10-01'), TODAY)).toBe('aberto');
  });
});

describe('buildInstallments', () => {
  it('à vista: uma parcela com o total', () => {
    expect(buildInstallments({ total: 680, firstDue: TODAY })).toEqual([
      { installment: 1, installments: 1, amount: 680, dueDate: TODAY }
    ]);
  });

  it('50% + 50% com intervalo em dias', () => {
    const p = buildInstallments({ total: 1000, percents: [50, 50], firstDue: TODAY, intervalDays: 15 });
    expect(p.map(x => x.amount)).toEqual([500, 500]);
    expect(p.map(x => x.dueDate)).toEqual(['2026-09-23', '2026-10-08']);
  });

  it('parcelas iguais: centavos que sobram vão para a última e a soma bate', () => {
    const p = buildInstallments({ total: 100, count: 3, firstDue: TODAY });
    expect(p.map(x => x.amount)).toEqual([33.33, 33.33, 33.34]);
    expect(p.reduce((s, x) => s + x.amount, 0)).toBeCloseTo(100, 10);
    expect(p.map(x => x.dueDate)).toEqual(['2026-09-23', '2026-10-23', '2026-11-22']);
  });

  it('mensal: mesmo dia nos meses seguintes', () => {
    const p = buildInstallments({ total: 3000, count: 3, firstDue: '2026-01-31', monthly: true });
    expect(p.map(x => x.dueDate)).toEqual(['2026-01-31', '2026-02-28', '2026-03-31']);
    expect(p.map(x => x.amount)).toEqual([1000, 1000, 1000]);
  });

  it('quantidade inválida vira 1 parcela', () => {
    expect(buildInstallments({ total: 50, count: 0, firstDue: TODAY })).toHaveLength(1);
  });
});

describe('summarize', () => {
  const entries = [
    rec(1000, '2026-09-10', { paidDate: '2026-09-10' }),      // recebido no mês
    rec(500, '2026-08-01', { paidDate: '2026-08-05' }),       // recebido mês passado
    rec(300, '2026-09-20'),                                   // a receber vencido
    rec(200, '2026-09-25'),                                   // a receber em 2 dias
    rec(900, '2026-11-01'),                                   // a receber futuro
    pay(400, '2026-09-15', { paidDate: '2026-09-15' }),       // pago no mês
    pay(150, '2026-09-01'),                                   // a pagar vencido
    pay(250, '2026-09-30'),                                   // a pagar em 7 dias
    rec(99999, '2026-09-01', { canceled: true })              // ignorado
  ];
  const s = summarize(entries, { today: TODAY, openingBalance: 100 });

  it('em aberto e vencidos', () => {
    expect(s.receivableOpen).toBe(1400);
    expect(s.receivableOverdue).toBe(300);
    expect(s.receivableOverdueCount).toBe(1);
    expect(s.payableOpen).toBe(400);
    expect(s.payableOverdue).toBe(150);
    expect(s.payableOverdueCount).toBe(1);
  });

  it('vencendo nos próximos 7 dias (sem contar os vencidos)', () => {
    expect(s.dueNext7Receivable).toBe(200);
    expect(s.dueNext7Payable).toBe(250);
  });

  it('realizado no mês e saldo de caixa', () => {
    expect(s.receivedMonth).toBe(1000);
    expect(s.paidMonth).toBe(400);
    expect(s.resultMonth).toBe(600);
    // 100 inicial + 1000 + 500 recebidos − 400 pago
    expect(s.cashBalance).toBe(1200);
  });
});

describe('cashFlowByMonth', () => {
  it('separa realizado/previsto, joga vencidos no mês atual e acumula o saldo', () => {
    const rows = cashFlowByMonth([
      rec(500, '2026-08-01', { paidDate: '2026-08-05' }),   // antes do horizonte → saldo inicial
      rec(1000, '2026-09-10', { paidDate: '2026-09-10' }),  // set realizado
      rec(300, '2026-08-20'),                               // vencido → set previsto
      pay(400, '2026-09-15', { paidDate: '2026-09-15' }),   // set realizado
      rec(900, '2026-11-01'),                               // nov
      pay(250, '2026-10-05'),                               // out
      rec(7000, '2027-06-01')                               // além de 3 meses → fora
    ], { today: TODAY, months: 3, openingBalance: 100 });

    expect(rows.map(r => r.month)).toEqual(['2026-09', '2026-10', '2026-11']);
    expect(rows[0]).toMatchObject({ inflow: 1300, outflow: 400, realizedIn: 1000, realizedOut: 400, net: 900 });
    // saldo inicial 100 + 500 (agosto) = 600 → +900 = 1500
    expect(rows.map(r => r.balance)).toEqual([1500, 1250, 2150]);
  });
});

describe('pendingBillables', () => {
  const quotes = [
    { id: 'q1', code: 'ORC-A0001', status: 'aprovado', clientName: 'Maxx Pool', clientId: 'cli-1', description: 'Panfletos', totalValue: 680 },
    { id: 'q2', code: 'ORC-A0002', status: 'enviado', totalValue: 100 },
    { id: 'q3', code: 'ORC-A0003', status: 'aprovado', totalValue: 250 }
  ];
  const biddings = [
    { id: 'b1', code: 'LIC-A0001', status: 'vencedora', agency: 'Prefeitura', biddingNumber: 'PE 12/2026', objectDescription: 'Impressos', totalValue: 5000 },
    { id: 'b2', code: 'LIC-A0002', status: 'homologada', agency: 'UFPR', totalValue: 1200 },
    { id: 'b3', code: 'LIC-A0003', status: 'agendada', totalValue: 999 }
  ];

  it('lista aprovados e vencedoras/homologadas', () => {
    const p = pendingBillables(quotes, biddings, []);
    expect(p.map(x => x.code)).toEqual(['ORC-A0001', 'ORC-A0003', 'LIC-A0001', 'LIC-A0002']);
    expect(p[0]).toMatchObject({ kind: 'quote', partyName: 'Maxx Pool', clientId: 'cli-1', amount: 680, category: 'venda' });
    expect(p[2]).toMatchObject({ kind: 'bidding', partyName: 'Prefeitura', description: 'PE 12/2026 — Impressos', category: 'licitacao' });
  });

  it('some da lista quando já tem conta a receber ligada (cancelada não conta)', () => {
    const entries = [
      rec(340, TODAY, { origin: { kind: 'quote', id: 'q1' } }),
      rec(5000, TODAY, { origin: { kind: 'bidding', id: 'b1' }, canceled: true })
    ];
    expect(pendingBillables(quotes, biddings, entries).map(x => x.code)).toEqual(['ORC-A0003', 'LIC-A0001', 'LIC-A0002']);
  });
});

describe('ordem e códigos', () => {
  it('em aberto por vencimento primeiro; pagos no fim, mais recentes antes', () => {
    const list = [
      rec(1, '2026-10-01'),
      rec(2, '2026-09-01', { paidDate: '2026-09-01' }),
      rec(3, '2026-09-05'),
      rec(4, '2026-09-01', { paidDate: '2026-09-20' })
    ].sort(compareEntries);
    expect(list.map(e => e.amount)).toEqual([3, 1, 4, 2]);
  });

  it('códigos FIN sequenciais', () => {
    expect(generateNextFinanceCode([])).toBe('FIN-A0001');
    expect(generateNextFinanceCode([{ code: 'FIN-A0009' }])).toBe('FIN-A0010');
  });
});

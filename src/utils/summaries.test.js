import { describe, it, expect } from 'vitest';
import { summarizeBiddings, buildQuoteFromCalculator } from './summaries';

describe('summarizeBiddings — Dashboard com os status reais da aba Licitações', () => {
  const b = (status, totalValue, extra = {}) => ({ status, totalValue, ...extra });
  const list = [
    b('agendada', 1000, { sessionDate: '2026-10-05', sessionTime: '09:00' }),
    b('em_disputa', 2000, { sessionDate: '2026-09-30', sessionTime: '14:00' }),
    b('proposta_enviada', 300),
    b('vencedora', 5000),
    b('homologada', 1200),
    b('fracassada', 999),
    b('cancelada', 888)
  ];
  const s = summarizeBiddings(list);

  it('vencedora e em_disputa entram nas contas', () => {
    expect(s.wonCount).toBe(2);
    expect(s.wonValue).toBe(6200);
    expect(s.inDisputeCount).toBe(2);
    expect(s.inDisputeValue).toBe(3000);
    expect(s.proposalsCount).toBe(1);
    expect(s.proposalsValue).toBe(300);
  });

  it('pipeline exclui canceladas e fracassadas; total conta todas', () => {
    expect(s.pipelineValue).toBe(1000 + 2000 + 300 + 5000 + 1200);
    expect(s.total).toBe(7);
  });

  it('próximas sessões por data e hora, só as em disputa', () => {
    expect(s.upcoming.map(x => x.status)).toEqual(['em_disputa', 'agendada']);
  });

  it('lista vazia', () => {
    expect(summarizeBiddings([])).toMatchObject({ total: 0, pipelineValue: 0, upcoming: [] });
  });
});

describe('buildQuoteFromCalculator — orçamento salvo com os dados reais', () => {
  const budgetResult = { quantity: 1000, costs: { finalPrice: 102.94, unitPrice: 0.1 } };

  it('digital: papel, formato, medidas, cores e ids para o "Recarregar"', () => {
    const q = buildQuoteFromCalculator({
      mode: 'digital',
      paper: { id: 'paper-9', name: 'Couché Brilho 150g' },
      sheet: { id: 'sra3' },
      productW: 90, productH: 50, colors: '4/4', quantity: 1000,
      finishings: [{ name: 'Positiva - Laminação Fosca' }, { name: 'Corte reto' }],
      budgetResult
    });
    expect(q).toMatchObject({
      description: 'Impressão Digital — 90 x 50 mm — 1.000 un',
      paperName: 'Couché Brilho 150g',
      paperId: 'paper-9',
      sheetId: 'sra3',
      dimensions: '90 x 50 mm',
      productW: 90, productH: 50, colors: '4/4',
      finishingsSummary: 'Laminação Fosca, Corte reto',
      quantity: 1000, unitValue: 0.1, totalValue: 102.94
    });
  });

  it('editorial: descrição com o número de páginas', () => {
    const q = buildQuoteFromCalculator({
      mode: 'digital', productCategory: 'editorial', editorial: { pagesCount: 64 },
      paper: { id: 'p', name: 'Offset 90g' }, sheet: { id: 'sra3' }, productW: 148, productH: 210, budgetResult
    });
    expect(q.description).toBe('Editorial 64 págs — 148 x 210 mm — 1.000 un');
  });

  it('off-set usa o rótulo do modo', () => {
    const q = buildQuoteFromCalculator({ mode: 'offset', paper: { id: 'p', name: 'Couché 115g' }, sheet: { id: 's' }, productW: 210, productH: 297, budgetResult });
    expect(q.description).toBe('Off-set — 210 x 297 mm — 1.000 un');
  });

  it('grande formato: medidas em metros, sem papel de folha', () => {
    const q = buildQuoteFromCalculator({ mode: 'large_format', largeFormat: { widthM: 2, heightM: 1 }, budgetResult: { quantity: 10, costs: { finalPrice: 500 } } });
    expect(q).toMatchObject({ dimensions: '2 x 1 m', paperName: 'Material por m²', paperId: undefined, quantity: 10, totalValue: 500 });
  });
});

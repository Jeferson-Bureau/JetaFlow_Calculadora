import { describe, it, expect } from 'vitest';
import { calcularPreco } from './pricing';

// Produto de teste (não usa o CALENDAR_CONFIG real, que muda com a tabela de preços).
const product = {
  min_order_qty: 10,
  max_order_qty: 1000,
  custom_qty_allowed: false,
  base_price_table: [
    { min_qty: 10, unit_price: 20 },
    { min_qty: 50, unit_price: 15 },
    { min_qty: 100, unit_price: 12 }
  ],
  attribute_groups: [
    {
      id: 'tamanho',
      defaultOption: 'p',
      options: [
        { id: 'p', modifier_fixed: 0, modifier_pct: 0 },
        { id: 'g', modifier_fixed: 2, modifier_pct: 0.05 }
      ]
    },
    {
      id: 'arte',
      defaultOption: 'padrao',
      options: [
        { id: 'padrao', modifier_fixed: 0, modifier_pct: 0 },
        { id: 'total', modifier_fixed: 0, modifier_pct: 0.15 }
      ]
    }
  ]
};

describe('calcularPreco — produtos personalizados', () => {
  it('abaixo do mínimo retorna erro e preço zero', () => {
    const r = calcularPreco({ quantity: 5, selectedOptions: {} }, product);
    expect(r.error).toMatch(/mínima/);
    expect(r.totalPrice).toBe(0);
  });

  it('acima do máximo retorna erro quando não aceita quantidade livre', () => {
    const r = calcularPreco({ quantity: 1001, selectedOptions: {} }, product);
    expect(r.error).toMatch(/máxima/);
  });

  it('acima do máximo usa a última faixa quando aceita quantidade livre', () => {
    const r = calcularPreco({ quantity: 5000, selectedOptions: {} }, { ...product, custom_qty_allowed: true });
    expect(r.error).toBeNull();
    expect(r.unitPrice).toBe(12);
  });

  it('escolhe a faixa pelo min_qty (limite inclusivo)', () => {
    expect(calcularPreco({ quantity: 49, selectedOptions: {} }, product).unitPrice).toBe(20);
    expect(calcularPreco({ quantity: 50, selectedOptions: {} }, product).unitPrice).toBe(15);
    expect(calcularPreco({ quantity: 100, selectedOptions: {} }, product).unitPrice).toBe(12);
  });

  it('opções padrão não alteram o preço', () => {
    const r = calcularPreco({ quantity: 10, selectedOptions: {} }, product);
    expect(r).toMatchObject({ unitPrice: 20, totalPrice: 200, discountPct: 0 });
  });

  it('soma modificadores fixos e aplica os percentuais somados', () => {
    // (20 + 2) × (1 + 0,05 + 0,15) = 26,4
    const r = calcularPreco({ quantity: 10, selectedOptions: { tamanho: 'g', arte: 'total' } }, product);
    expect(r.unitPrice).toBeCloseTo(26.4, 4);
    expect(r.totalPrice).toBe(264);
  });

  it('desconto é relativo ao preço da menor faixa com as mesmas opções', () => {
    // 100 un: 12 vs 20 → 40% de desconto
    const r = calcularPreco({ quantity: 100, selectedOptions: {} }, product);
    expect(r.discountPct).toBeCloseTo(0.4, 4);
  });
});

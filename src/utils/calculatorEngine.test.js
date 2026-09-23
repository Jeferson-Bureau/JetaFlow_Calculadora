import { describe, it, expect } from 'vitest';
import {
  resolveMarkup,
  calculateSpineThickness,
  calculateSheetLayout,
  calculateBudget,
  generateTierMatrix,
  generateSequentialCode,
  generateNextQuoteCode
} from './calculatorEngine';
import { DEFAULT_SHEET_SIZES, DEFAULT_FINANCIAL_CONFIG } from '../data/initialData';

const SRA3 = DEFAULT_SHEET_SIZES.find(s => s.id === 'sra3');

// Cartão de visita 90×50 em SRA3, 4/0 — o caso mais comum do digital.
const digitalCard = (overrides = {}) => ({
  mode: 'digital',
  quantity: 1000,
  paper: { pricePerSheetSra3: 0.5 },
  sheetSize: SRA3,
  productW: 90,
  productH: 50,
  bleed: 2,
  colors: '4/0',
  financialConfig: DEFAULT_FINANCIAL_CONFIG,
  ...overrides
});

describe('resolveMarkup — marcação por faixa de tiragem', () => {
  it('escolhe a faixa pelos limites (inclusivos) de quantidade', () => {
    expect(resolveMarkup({}, 1)).toMatchObject({ tier: 'small', multiplier: 2.5 });
    expect(resolveMarkup({}, 100)).toMatchObject({ tier: 'small', multiplier: 2.5 });
    expect(resolveMarkup({}, 101)).toMatchObject({ tier: 'medium', multiplier: 2.0 });
    expect(resolveMarkup({}, 500)).toMatchObject({ tier: 'medium', multiplier: 2.0 });
    expect(resolveMarkup({}, 501)).toMatchObject({ tier: 'large', multiplier: 1.7 });
  });

  it('usa as faixas configuradas em financialConfig', () => {
    const cfg = { markupTiers: { small: { maxQty: 50, multiplier: 3 }, medium: { maxQty: 200, multiplier: 2.2 }, large: { multiplier: 1.5 } } };
    expect(resolveMarkup(cfg, 50)).toMatchObject({ tier: 'small', multiplier: 3 });
    expect(resolveMarkup(cfg, 51)).toMatchObject({ tier: 'medium', multiplier: 2.2 });
    expect(resolveMarkup(cfg, 201)).toMatchObject({ tier: 'large', multiplier: 1.5 });
  });

  it('override numérico > 0 vence a faixa, mas mantém a faixa de referência', () => {
    const r = resolveMarkup({}, 1000, 2.8);
    expect(r).toMatchObject({ tier: 'large', tierMultiplier: 1.7, multiplier: 2.8, isOverride: true });
  });

  it('ignora override vazio, zero, negativo ou inválido', () => {
    for (const ov of [null, undefined, '', 0, -1, 'abc']) {
      expect(resolveMarkup({}, 1000, ov)).toMatchObject({ multiplier: 1.7, isOverride: false });
    }
  });
});

describe('calculateSheetLayout — aproveitamento da folha', () => {
  it('escolhe a orientação que cabe mais peças', () => {
    // 90×50 + sangria 2 → 94×54. Normal: 3×8 = 24. Girado: 5×4 = 20.
    const l = calculateSheetLayout(310, 440, 90, 50, 2);
    expect(l).toMatchObject({ nUp: 24, orientation: 'normal', cols: 3, rows: 8, effW: 94, effH: 54 });
  });

  it('gira a peça quando rende mais', () => {
    // 200×100 sem sangria em 310×440. Normal: 1×4 = 4. Girado: 3×2 = 6.
    const l = calculateSheetLayout(310, 440, 200, 100, 0);
    expect(l).toMatchObject({ nUp: 6, orientation: 'rotated', cols: 3, rows: 2 });
  });

  it('calcula o aproveitamento sobre a área útil do produto (sem sangria)', () => {
    const l = calculateSheetLayout(310, 440, 90, 50, 2);
    expect(l.yieldPercent).toBeCloseTo((24 * 90 * 50) / (310 * 440) * 100, 1);
  });

  it('peça maior que a folha rende 0', () => {
    expect(calculateSheetLayout(310, 440, 500, 500, 2).nUp).toBe(0);
  });

  it('dimensões zeradas não quebram', () => {
    expect(calculateSheetLayout(0, 440, 90, 50).nUp).toBe(0);
  });
});

describe('calculateSpineThickness — lombada', () => {
  it('Couché 90g, 100 páginas, hot melt', () => {
    // 50 folhas × (90 × 0,95 / 1000) + 0,8 = 5,075 → 5,1 mm
    const r = calculateSpineThickness(100, 90, 'Couché Brilho');
    expect(r.bulk).toBe(0.95);
    expect(r.sheets).toBe(50);
    expect(r.rawSpineMm).toBeCloseTo(5.075, 6);
    expect(r.spineMm).toBe(5.1);
  });

  it('PUR usa compensação de 0,4 mm', () => {
    const r = calculateSpineThickness(100, 90, 'couche', null, null, 'PUR');
    expect(r.technicalCompensationMm).toBe(0.4);
    expect(r.spineMm).toBe(4.7);
  });

  it('"Pólen Bold" casa antes de "Pólen" (ordem da tabela)', () => {
    expect(calculateSpineThickness(100, 80, 'Polen Bold 90g').bulk).toBe(1.8);
    expect(calculateSpineThickness(100, 80, 'Polen Soft 80g').bulk).toBe(1.5);
  });

  it('papel desconhecido usa o bulk de fallback', () => {
    expect(calculateSpineThickness(100, 90, 'Papel Misterioso').bulk).toBe(1.1);
  });

  it('bulk e espessura informados manualmente têm prioridade', () => {
    expect(calculateSpineThickness(100, 90, 'couche', 2.0).bulk).toBe(2.0);
    // 50 folhas × 0,1 mm + 0,8 = 5,8 mm
    expect(calculateSpineThickness(100, 90, 'couche', null, 0.1).spineMm).toBe(5.8);
  });

  it('lombada mínima de 1 mm', () => {
    expect(calculateSpineThickness(0, 90, 'couche', null, null, 'pur').spineMm).toBe(1.0);
  });
});

describe('calculateBudget — digital', () => {
  // Conta feita à mão:
  //   24 por folha → ceil(1000/24) = 42 folhas + 5% perda = ceil(44,1) = 45 folhas
  //   papel 45 × 0,50 = 22,50 · clique 0,305 × 2,3 (SRA3) = 0,7015 → 45 × 0,7015 = 31,5675
  //   custo direto 54,0675 · perda já nas folhas (não soma de novo no DRE)
  //   +12% custo fixo = 60,5556 (CI) · 1000 un → faixa large ×1,7 → 102,94452
  const r = calculateBudget(digitalCard());

  it('folhas e aproveitamento', () => {
    expect(r.layout.nUp).toBe(24);
    expect(r.requiredSheets).toBe(42);
    expect(r.grossSheets).toBe(45);
    expect(r.remaFullSheets).toBe(12); // ceil(45 / 4)
  });

  it('custos de papel e impressão', () => {
    expect(r.costs.paperCost).toBe(22.5);
    // 0,305 × 2,3 = 0,7015 (em ponto flutuante 0,70149…, exibido como 0,701)
    expect(r.costs.clickRate).toBeCloseTo(0.7015, 2);
    expect(r.costs.printCost).toBe(31.57);
    expect(r.costs.directCost).toBe(54.07);
  });

  it('custo industrial, preço e DRE', () => {
    expect(r.costs.techLossInSheets).toBe(true);
    expect(r.costs.techLossVal).toBe(0);
    expect(r.costs.fixedOverheadVal).toBe(6.49);
    expect(r.costs.totalIndustrialCost).toBe(60.56);
    expect(r.costs.markupTier).toBe('large');
    expect(r.costs.markupMultiplier).toBe(1.7);
    expect(r.costs.finalPrice).toBe(102.94);
    expect(r.costs.unitPrice).toBe(0.1);
    expect(r.costs.taxVal).toBe(3.09);         // 3% produto
    expect(r.costs.commissionVal).toBe(5.15);  // 5%
    // lucro = preço − CI − imposto − comissão
    expect(r.costs.netProfitVal).toBe(34.15);
    expect(r.costs.profitVal).toBe(r.costs.netProfitVal);
  });

  it('cores alteram o clique: 4/4 custa o dobro de 4/0', () => {
    const duplex = calculateBudget(digitalCard({ colors: '4/4' }));
    expect(duplex.costs.printCost).toBeCloseTo(r.costs.printCost * 2, 1);
  });

  it('tarifas de clique e multiplicador de formato vêm das configurações', () => {
    const custom = calculateBudget(digitalCard({
      digitalClickRates: { clickColorSimplex: 0.5, formatMultipliers: { sra3: 2 } }
    }));
    expect(custom.costs.clickRate).toBe(1);
    expect(custom.costs.printCost).toBe(45);
  });

  it('override de marcação muda o preço, não o custo', () => {
    const ov = calculateBudget(digitalCard({ markupOverride: 3 }));
    expect(ov.costs.totalIndustrialCost).toBe(r.costs.totalIndustrialCost);
    expect(ov.costs.markupIsOverride).toBe(true);
    expect(ov.costs.finalPrice).toBeCloseTo(60.5556 * 3, 1);
  });

  it('imposto de serviço (6%)', () => {
    const svc = calculateBudget(digitalCard({ financialConfig: { ...DEFAULT_FINANCIAL_CONFIG, taxType: 'service' } }));
    expect(svc.costs.taxPct).toBe(6);
    expect(svc.costs.taxVal).toBe(6.18);
  });

  it('quantidade mínima é 1', () => {
    expect(calculateBudget(digitalCard({ quantity: 0 })).quantity).toBe(1);
  });
});

describe('calculateBudget — acabamentos', () => {
  const finishings = [
    { id: 'f1', name: 'Laminação', type: 'per_sheet_sra3', unitCost: 0.4, setupCost: 10 },
    { id: 'f2', name: 'Corte especial', type: 'per_unit', unitCost: 0.02, setupCost: 5 },
    { id: 'f3', name: 'Faca', type: 'fixed', setupCost: 80 }
  ];
  const r = calculateBudget(digitalCard({ finishings }));

  it('por folha usa as folhas impressas; por unidade usa a quantidade; fixo é só o setup', () => {
    const [sheet, unit, fixed] = r.finishingsDetail.map(f => f.calculatedTotal);
    expect(sheet).toBeCloseTo(45 * 0.4 + 10, 6);   // 28
    expect(unit).toBeCloseTo(1000 * 0.02 + 5, 6);  // 25
    expect(fixed).toBe(80);
    expect(r.costs.finishingsCost).toBe(133);
  });

  it('acabamento entra no custo direto', () => {
    expect(r.costs.directCost).toBeCloseTo(54.0675 + 133, 1);
  });
});

describe('calculateBudget — off-set', () => {
  // Papel 66×96 150 g a R$ 15/kg, folha de máquina 48×66 na Roland (pinça 10 mm).
  //   área útil 460×640 → 90×50 rende 48 (girado 8×6)
  //   folha de compra 660×960 → 2 folhas de 480×660
  //   5000 un → ceil(5000/48) = 105 + 200 acerto = 305 folhas-máquina → ceil(305/2) = 153 folhas inteiras
  //   papel: 0,66 × 0,96 × 0,15 kg × 15 = 1,4256/folha → 153 × 1,4256 = 218,1168
  //   4/0 → 4 chapas × 35 = 140 · rodagem max(70, 1 × 35) = 70 → impressão 210
  const r = calculateBudget({
    mode: 'offset',
    quantity: 5000,
    paper: { format: '66x96', weightGsm: 150, pricePerKg: 15 },
    sheetSize: { widthMm: 480, heightMm: 660 },
    equipment: { gripperMm: 10 },
    productW: 90,
    productH: 50,
    colors: '4/0',
    offsetSettings: { ctpPlatePrice: 35, makeReadySheets: 200, costPerThousandTurns: 35, minTurnFee: 70 },
    financialConfig: DEFAULT_FINANCIAL_CONFIG
  });

  it('folhas de máquina por folha de compra e montagem', () => {
    expect(r.layout.cutsPerFullSheet).toBe(2);
    expect(r.layout.nUp).toBe(48);
    expect(r.requiredSheets).toBe(105);
    expect(r.grossSheets).toBe(305);
    expect(r.remaFullSheets).toBe(153);
  });

  it('custo do papel pela folha inteira (peso × R$/kg)', () => {
    expect(r.costs.paperCost).toBe(218.12);
  });

  it('chapas + rodagem com mínimo', () => {
    expect(r.costs.printCost).toBe(210);
  });

  it('perda técnica entra no DRE (off-set não tem folhas extras em %, só o acerto)', () => {
    expect(r.costs.techLossInSheets).toBe(false);
    expect(r.costs.techLossVal).toBeCloseTo((218.1168 + 210) * 0.05, 2); // 21,41
  });

  it('preço da resma (pricePerFullSheet) substitui o cálculo por kg', () => {
    const rema = calculateBudget({
      mode: 'offset', quantity: 5000,
      paper: { format: '66x96', weightGsm: 150, pricePerKg: 15, pricePerFullSheet: 2 },
      sheetSize: { widthMm: 480, heightMm: 660 }, equipment: { gripperMm: 10 },
      productW: 90, productH: 50, colors: '4/0'
    });
    expect(rema.costs.paperCost).toBe(306); // 153 × 2
  });

  it('4/4 usa 8 chapas e 2 passadas', () => {
    const duplex = calculateBudget({
      mode: 'offset', quantity: 50000,
      paper: { format: '66x96', weightGsm: 150, pricePerKg: 15 },
      sheetSize: { widthMm: 480, heightMm: 660 }, equipment: { gripperMm: 10 },
      productW: 90, productH: 50, colors: '4/4',
      offsetSettings: { ctpPlatePrice: 35, makeReadySheets: 200, costPerThousandTurns: 35, minTurnFee: 70 }
    });
    // ceil(50000/48) = 1042 + 200 = 1242 folhas × 2 passadas = 2484 giros → 3 milheiros × 35 = 105
    expect(duplex.costs.printCost).toBe(8 * 35 + 105);
  });
});

describe('calculateBudget — grande formato', () => {
  it('cobra material + tinta por m²', () => {
    // 10 banners de 2 × 1 m = 20 m² · material 25/m² = 500 · tinta 12/m² = 240
    const r = calculateBudget({
      mode: 'large_format', quantity: 10,
      largeFormat: { widthM: 2, heightM: 1, materialPriceM2: 25 },
      financialConfig: DEFAULT_FINANCIAL_CONFIG
    });
    expect(r.costs.paperCost).toBe(500);
    expect(r.costs.printCost).toBe(240);
    expect(r.remaFullSheets).toBe(20);
    expect(r.costs.markupTier).toBe('small');
    expect(r.costs.techLossVal).toBe(37); // 5% de 740 no DRE
  });
});

describe('calculateBudget — percentuais configurados em 0%', () => {
  const fin = (patch) => ({ ...DEFAULT_FINANCIAL_CONFIG, ...patch });

  it('perda técnica 0% não gera folhas extras', () => {
    const r = calculateBudget(digitalCard({ financialConfig: fin({ technicalLossPercent: 0 }) }));
    expect(r.grossSheets).toBe(42);
    expect(r.costs.techLossPct).toBe(0);
  });

  it('perda técnica 0% zera a perda no DRE do off-set', () => {
    const r = calculateBudget({
      mode: 'offset', quantity: 5000, paper: { format: '66x96', weightGsm: 150, pricePerKg: 15 },
      sheetSize: { widthMm: 480, heightMm: 660 }, equipment: { gripperMm: 10 }, productW: 90, productH: 50,
      financialConfig: fin({ technicalLossPercent: 0 })
    });
    expect(r.costs.techLossVal).toBe(0);
  });

  it('custo fixo 0% deixa o custo industrial igual ao custo direto', () => {
    const r = calculateBudget(digitalCard({ financialConfig: fin({ fixedOverheadPercent: 0 }) }));
    expect(r.costs.fixedOverheadVal).toBe(0);
    expect(r.costs.totalIndustrialCost).toBe(r.costs.directCost);
  });

  it('comissão 0% não desconta nada do lucro', () => {
    const r = calculateBudget(digitalCard({ financialConfig: fin({ salesCommissionPercent: 0 }) }));
    expect(r.costs.commissionPct).toBe(0);
    expect(r.costs.commissionVal).toBe(0);
  });

  it('campo vazio ou ausente continua usando o padrão', () => {
    for (const v of [undefined, null, '']) {
      const r = calculateBudget(digitalCard({ financialConfig: { technicalLossPercent: v, fixedOverheadPercent: v, salesCommissionPercent: v } }));
      expect(r.costs.techLossPct).toBe(5);
      expect(r.costs.fixedOverheadPct).toBe(12);
      expect(r.costs.commissionPct).toBe(5);
    }
  });
});

describe('calculateBudget — editorial', () => {
  it('soma capa, miolo e encadernação da configuração', () => {
    const base = {
      mode: 'digital', productCategory: 'editorial', quantity: 100,
      paper: { pricePerSheetSra3: 0.5 }, sheetSize: SRA3,
      productW: 148, productH: 210,
      editorial: {
        pagesCount: 64, mioloPaper: {}, mioloColors: '1/1', coverPaper: {}, coverColors: '4/0',
        flapW: 0, bindingMethod: 'lombada_quadrada'
      },
      financialConfig: DEFAULT_FINANCIAL_CONFIG
    };
    const r = calculateBudget(base);
    expect(r.spineMm).toBeGreaterThan(1);

    // Trocar a encadernação muda só a parcela da encadernação:
    // lombada quadrada 30 + 100 × 0,50 = 80 · wire-o 25 + 100 × 2,50 = 275
    const wire = calculateBudget({ ...base, editorial: { ...base.editorial, bindingMethod: 'wire_o' } });
    expect(wire.costs.printCost - r.costs.printCost).toBeCloseTo(275 - 80, 1);

    // Tarifa editada nas configurações vence o default
    const custom = calculateBudget({ ...base, digitalClickRates: { bindingRates: { lombada_quadrada: { setup: 0, unit: 1 } } } });
    expect(r.costs.printCost - custom.costs.printCost).toBeCloseTo(80 - 100, 1);
  });
});

describe('generateTierMatrix', () => {
  it('cada tiragem usa a própria faixa e ignora o override do orçamento', () => {
    const rows = generateTierMatrix(digitalCard({ markupOverride: 5 }), [80, 300, 2000]);
    expect(rows.map(r => r.markupMultiplier)).toEqual([2.5, 2.0, 1.7]);
    expect(rows.map(r => r.markupTier)).toEqual(['small', 'medium', 'large']);
  });
});

describe('generateSequentialCode — códigos ORC/CLI/FOR/LIC', () => {
  const codes = (...c) => c.map(code => ({ code }));

  it('lista vazia começa em A0001', () => {
    expect(generateSequentialCode('ORC', [])).toBe('ORC-A0001');
    expect(generateNextQuoteCode()).toBe('ORC-A0001');
  });

  it('deriva do maior código, não do tamanho da lista (excluir não duplica)', () => {
    expect(generateSequentialCode('ORC', codes('ORC-A0001', 'ORC-A0007'))).toBe('ORC-A0008');
    expect(generateSequentialCode('ORC', codes('ORC-A0007', 'ORC-A0003'))).toBe('ORC-A0008');
  });

  it('ignora itens sem código ou de outro prefixo', () => {
    expect(generateSequentialCode('LIC', [{}, null, { code: 'ORC-A0050' }, { code: 'LIC-A0002' }])).toBe('LIC-A0003');
  });

  it('não diferencia maiúsculas/minúsculas', () => {
    expect(generateSequentialCode('CLI', codes('cli-a0009'))).toBe('CLI-A0010');
  });

  it('passa para a letra seguinte depois de 9999', () => {
    expect(generateSequentialCode('ORC', codes('ORC-A9999'))).toBe('ORC-B0001');
  });

  it('depois da virada de letra continua na letra nova, sem repetir código', () => {
    expect(generateSequentialCode('ORC', codes('ORC-A9999', 'ORC-B0001'))).toBe('ORC-B0002');
    expect(generateSequentialCode('ORC', codes('ORC-B0003', 'ORC-A9998'))).toBe('ORC-B0004');
  });
});

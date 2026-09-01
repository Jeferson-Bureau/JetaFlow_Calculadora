// Calculator Engine for JetaFlow Calculadora

/**
 * Calculates book spine thickness based on page count, paper GSM, paper bulk (cm³/g), and glue technical compensation.
 * Formula: Lombada = (Páginas / 2 * EspessuraFolha) + CompensaçãoTécnica
 * EspessuraFolha (mm) = (Gramatura * Bulk) / 1000  (se espessura direta não informada)
 */
export function calculateSpineThickness(pageCount, gsm, paperType = 'couche', customBulk = null, customSheetThicknessMm = null, glueType = 'hot_melt') {
  const pages = Math.max(0, Number(pageCount || 0));
  const g = Number(gsm || 90);
  const sheets = pages / 2;

  // Determine bulk in cm³/g if not directly provided
  let bulk = Number(customBulk);
  if (!bulk || isNaN(bulk) || bulk <= 0) {
    const pType = String(paperType).toLowerCase();
    if (pType.includes('polen bold')) bulk = 1.8;
    else if (pType.includes('polen soft') || pType.includes('polen')) bulk = 1.5;
    else if (pType.includes('offset') || pType.includes('sulfite') || pType.includes('chambril')) bulk = 1.2;
    else if (pType.includes('couche') || pType.includes('couché')) bulk = 0.95;
    else if (pType.includes('triplex') || pType.includes('duplex')) bulk = 1.3;
    else bulk = 1.1;
  }

  // Calculate sheet thickness in mm
  let sheetThicknessMm = Number(customSheetThicknessMm);
  if (!sheetThicknessMm || isNaN(sheetThicknessMm) || sheetThicknessMm <= 0) {
    sheetThicknessMm = (g * bulk) / 1000;
  }

  // Technical compensation for glue layer & hinge score compression
  let technicalCompensationMm = 0.8; // Hot-Melt padrão
  if (String(glueType).toLowerCase().includes('pur')) {
    technicalCompensationMm = 0.4; // PUR (filme de cola de 0,4mm)
  }

  const rawSpineMm = (sheets * sheetThicknessMm) + technicalCompensationMm;
  const roundedSpineMm = Math.max(1.0, Math.round(rawSpineMm * 10) / 10);

  return {
    spineMm: roundedSpineMm,
    rawSpineMm,
    sheets,
    sheetThicknessMm: Math.round(sheetThicknessMm * 10000) / 10000,
    bulk,
    technicalCompensationMm
  };
}

/**
 * Calculates optimal N-up layout on a print sheet.
 */
export function calculateSheetLayout(sheetW, sheetH, productW, productH, bleed = 2, gap = 0) {
  const effW = Number(productW) + Number(bleed) * 2 + Number(gap);
  const effH = Number(productH) + Number(bleed) * 2 + Number(gap);

  if (effW <= 0 || effH <= 0 || sheetW <= 0 || sheetH <= 0) {
    return {
      nUp: 0,
      orientation: 'normal',
      cols: 0,
      rows: 0,
      effW,
      effH,
      yieldPercent: 0,
      usedArea: 0,
      totalArea: sheetW * sheetH
    };
  }

  // 1. Normal Orientation
  const colsNormal = Math.floor(sheetW / effW);
  const rowsNormal = Math.floor(sheetH / effH);
  const nUpNormal = colsNormal * rowsNormal;

  // 2. Rotated Orientation (90 deg)
  const colsRotated = Math.floor(sheetW / effH);
  const rowsRotated = Math.floor(sheetH / effW);
  const nUpRotated = colsRotated * rowsRotated;

  let bestLayout = {
    nUp: nUpNormal,
    orientation: 'normal',
    cols: colsNormal,
    rows: rowsNormal,
    itemW: effW,
    itemH: effH
  };

  if (nUpRotated > nUpNormal) {
    bestLayout = {
      nUp: nUpRotated,
      orientation: 'rotated',
      cols: colsRotated,
      rows: rowsRotated,
      itemW: effH,
      itemH: effW
    };
  }

  const totalArea = sheetW * sheetH;
  const usedArea = bestLayout.nUp * (productW * productH);
  const yieldPercent = totalArea > 0 ? (usedArea / totalArea) * 100 : 0;

  return {
    ...bestLayout,
    effW,
    effH,
    productW: Number(productW),
    productH: Number(productH),
    totalArea,
    usedArea,
    yieldPercent: Math.round(yieldPercent * 10) / 10
  };
}

/**
 * Helper to calculate Positiva 2025 finishing table prices.
 */
function calculatePositivaFinishing(f, grossSheets, sheetSize, qty) {
  const sheetW = (sheetSize.widthMm || 320) / 1000;
  const sheetH = (sheetSize.heightMm || 450) / 1000;
  const sheetAreaM2 = sheetW * sheetH;
  const milheirosCount = Math.max(1, Math.ceil(grossSheets / 1000));

  let totalCost = 0;

  if (f.calculationType === 'm2_milheiro') {
    const rawCost = sheetAreaM2 * grossSheets * (f.pricePerM2Milheiro || 0);
    const minCost = (f.minPricePerMilheiro || 0) * milheirosCount;
    totalCost = Math.max(minCost, rawCost) + (f.setupCost || 0);
  } else if (f.calculationType === 'verniz_local_format' || f.calculationType === 'corte_vinco_format' || f.calculationType === 'meio_corte_format') {
    const is77x113 = (sheetSize.baseFormat === '77x113' || sheetSize.widthMm > 700);
    const rates = is77x113 ? (f.rates77x113 || {}) : (f.rates66x96 || {});
    
    const ratio = sheetSize.formatRatio || 4;
    let ratePerMilheiro = rates.format4 || 110.00;
    if (ratio === 8) ratePerMilheiro = rates.format8 || 84.00;
    else if (ratio === 6) ratePerMilheiro = rates.format6 || 84.00;
    else if (ratio === 3) ratePerMilheiro = rates.format3 || 121.00;
    else if (ratio === 2) ratePerMilheiro = rates.format2 || 135.00;
    else if (ratio === 1) ratePerMilheiro = rates.format1 || 180.00;

    const minPrice = (f.minPricePerMilheiro || ratePerMilheiro);
    const calculatedRate = Math.max(minPrice, ratePerMilheiro);
    totalCost = calculatedRate * milheirosCount + (f.setupCost || 0);
  }

  return totalCost;
}

/**
 * Calculates complete pricing breakdown for Digital or Offset print, including Editorial books & catalogs.
 */
export function calculateBudget(config) {
  const {
    mode,
    productCategory = 'flat',
    quantity = 100,
    paper = {},
    sheetSize = {},
    productW = 90,
    productH = 50,
    bleed = 2,
    colors = '4/0',
    digitalClickRates = {},
    offsetSettings = {},
    finishings = [],
    financialConfig = {},
    largeFormat = { widthM: 1, heightM: 1, materialPriceM2: 25 },
    editorial = {
      pagesCount: 32,
      mioloPaper: {},
      mioloColors: '1/1',
      coverPaper: {},
      coverColors: '4/0',
      flapW: 0,
      bindingMethod: 'lombada_quadrada'
    }
  } = config;

  let qty = Math.max(1, Number(quantity));

  let layout = { nUp: 1, yieldPercent: 100 };
  let requiredSheets = 0;
  let grossSheets = 0;
  let remaFullSheets = 0;
  let totalRefiledPieces = 0;
  let paperCost = 0;
  let printCost = 0;
  let spineMm = 0;
  let clickRate = 0;
  let formatFactor = 1.0;

  const formatRatio = sheetSize.formatRatio || 4;

  if (mode === 'large_format') {
    const areaM2Unit = Number(largeFormat.widthM) * Number(largeFormat.heightM);
    const totalAreaM2 = areaM2Unit * qty;
    paperCost = totalAreaM2 * Number(largeFormat.materialPriceM2 || 0);
    printCost = totalAreaM2 * Number(digitalClickRates.largeFormatM2Tinta || 12);
    grossSheets = qty;
    remaFullSheets = Math.ceil(totalAreaM2);
    totalRefiledPieces = qty;
  } else if (productCategory === 'editorial') {
    const pages = Math.max(4, Number(editorial.pagesCount || 16));
    const mioloPaper = editorial.mioloPaper.id ? editorial.mioloPaper : paper;
    const coverPaper = editorial.coverPaper.id ? editorial.coverPaper : paper;
    
    const spineResult = calculateSpineThickness(
      pages,
      mioloPaper.weightGsm || 90,
      mioloPaper.name || 'offset',
      editorial.customBulk,
      editorial.customSheetThicknessMm,
      editorial.glueType || 'hot_melt'
    );
    spineMm = typeof spineResult === 'object' ? spineResult.spineMm : spineResult;
    const flapW = Number(editorial.flapW || 0);

    const flatCoverW = (2 * Number(productW)) + spineMm + (2 * flapW);
    const flatCoverH = Number(productH);

    const coverLayout = calculateSheetLayout(sheetSize.printableW || 310, sheetSize.printableH || 440, flatCoverW, flatCoverH, bleed);
    const coverNup = Math.max(1, coverLayout.nUp);
    const reqCoverSheets = Math.ceil(qty / coverNup);
    const techLossPct = Number(financialConfig.technicalLossPercent || 5) / 100;
    const grossCoverSheets = Math.ceil(reqCoverSheets * (1 + techLossPct));

    const coverPaperPrice = Number(coverPaper.pricePerSheetSra3 || 0.70);
    const coverPaperCost = grossCoverSheets * coverPaperPrice;

    // Determinar multiplicador de formato de folha para editorial
    let editorialFormatFactor = 1.0;
    if (digitalClickRates.formatMultipliers) {
      editorialFormatFactor = digitalClickRates.formatMultipliers[sheetSize.id] || 1.0;
    } else {
      if (sheetSize.id === 'sra3' || sheetSize.id === 'maxi-digital') editorialFormatFactor = 2.3;
      else if (sheetSize.id === 'a3') editorialFormatFactor = 2.0;
      else if (sheetSize.id === 'banner-digital') editorialFormatFactor = 3.5;
    }

    let baseCoverClick = digitalClickRates.clickColorSimplex || 0.357;
    if (editorial.coverColors === '4/4') baseCoverClick = digitalClickRates.clickColorDuplex || 0.714;
    else if (editorial.coverColors === '1/0') baseCoverClick = digitalClickRates.clickMonoSimplex || 0.085;
    else if (editorial.coverColors === '1/1') baseCoverClick = digitalClickRates.clickMonoDuplex || 0.170;

    const coverClickRate = baseCoverClick * editorialFormatFactor;
    const coverPrintCost = grossCoverSheets * coverClickRate;

    const mioloLayout = calculateSheetLayout(sheetSize.printableW || 310, sheetSize.printableH || 440, productW, productH, bleed);
    const mioloNup = Math.max(1, mioloLayout.nUp);
    
    const pagesPerSheet = 2 * mioloNup;
    const sheetsPerBook = Math.ceil(pages / pagesPerSheet);
    const reqMioloSheets = sheetsPerBook * qty;
    const grossMioloSheets = Math.ceil(reqMioloSheets * (1 + techLossPct));

    const mioloPaperPrice = Number(mioloPaper.pricePerSheetSra3 || 0.35);
    const mioloPaperCost = grossMioloSheets * mioloPaperPrice;

    let baseMioloClick = digitalClickRates.clickMonoDuplex || 0.170;
    if (editorial.mioloColors === '4/4') baseMioloClick = digitalClickRates.clickColorDuplex || 0.714;
    else if (editorial.mioloColors === '1/0') baseMioloClick = digitalClickRates.clickMonoSimplex || 0.085;
    else if (editorial.mioloColors === '4/0') baseMioloClick = digitalClickRates.clickColorSimplex || 0.357;

    const mioloClickRate = baseMioloClick * editorialFormatFactor;
    const mioloPrintCost = grossMioloSheets * mioloClickRate;

    let bindingSetup = 30.00;
    let bindingUnitPrice = 0.50;
    if (editorial.bindingMethod === 'grampo_canoa') {
      bindingSetup = 20.00;
      bindingUnitPrice = 0.25;
    } else if (editorial.bindingMethod === 'wire_o') {
      bindingSetup = 25.00;
      bindingUnitPrice = 2.50;
    }
    const bindingTotalCost = bindingSetup + (qty * bindingUnitPrice);

    paperCost = coverPaperCost + mioloPaperCost;
    printCost = coverPrintCost + mioloPrintCost + bindingTotalCost;
    grossSheets = grossCoverSheets + grossMioloSheets;
    requiredSheets = reqCoverSheets + reqMioloSheets;
    remaFullSheets = Math.ceil(grossSheets / formatRatio);
    totalRefiledPieces = qty;
    layout = coverLayout;

  } else if (mode === 'digital') {
    layout = calculateSheetLayout(sheetSize.printableW || 310, sheetSize.printableH || 440, productW, productH, bleed);
    const nUp = Math.max(1, layout.nUp);
    requiredSheets = Math.ceil(qty / nUp);
    const techLossPct = Number(financialConfig.technicalLossPercent || 5) / 100;
    grossSheets = Math.ceil(requiredSheets * (1 + techLossPct));

    remaFullSheets = Math.ceil(grossSheets / formatRatio);
    totalRefiledPieces = grossSheets * nUp;

    const sheetPaperPrice = Number(paper.pricePerSheetSra3 || 0.50);
    paperCost = grossSheets * sheetPaperPrice;

    // Determinar multiplicador de formato de folha (ex: A4 = 1.0, A3 = 2.0, SRA3 = 2.3)
    formatFactor = 1.0;
    if (digitalClickRates.formatMultipliers) {
      formatFactor = digitalClickRates.formatMultipliers[sheetSize.id] || 1.0;
    } else {
      // Fallback baseado no identificador do formato
      if (sheetSize.id === 'sra3' || sheetSize.id === 'maxi-digital') formatFactor = 2.3;
      else if (sheetSize.id === 'a3') formatFactor = 2.0;
      else if (sheetSize.id === 'banner-digital') formatFactor = 3.5;
      else if (sheetSize.id === 'a4') formatFactor = 1.0;
    }

    let baseClick = digitalClickRates.clickColorSimplex || 0.357;
    if (colors === '4/4') baseClick = digitalClickRates.clickColorDuplex || 0.714;
    else if (colors === '1/0') baseClick = digitalClickRates.clickMonoSimplex || 0.085;
    else if (colors === '1/1') baseClick = digitalClickRates.clickMonoDuplex || 0.170;

    clickRate = baseClick * formatFactor;

    printCost = grossSheets * clickRate;
  } else if (mode === 'offset') {
    layout = calculateSheetLayout(sheetSize.printableW || 640, sheetSize.printableH || 940, productW, productH, bleed);
    const nUp = Math.max(1, layout.nUp);
    requiredSheets = Math.ceil(qty / nUp);

    const makeReadySheets = Number(offsetSettings.makeReadySheets || 200);
    grossSheets = requiredSheets + makeReadySheets;
    remaFullSheets = Math.ceil(grossSheets / formatRatio);
    totalRefiledPieces = grossSheets * nUp;

    const sheetW_m = (sheetSize.widthMm || 660) / 1000;
    const sheetH_m = (sheetSize.heightMm || 960) / 1000;
    const gsm = Number(paper.weightGsm || 150);
    const weightPerSheetKg = sheetW_m * sheetH_m * (gsm / 1000);
    const totalWeightKg = grossSheets * weightPerSheetKg;
    const pricePerKg = Number(paper.pricePerKg || 15.00);

    paperCost = totalWeightKg * pricePerKg;

    let numPlates = 4;
    if (colors === '4/4') numPlates = 8;
    else if (colors === '1/0') numPlates = 1;
    else if (colors === '1/1') numPlates = 2;

    const ctpPrice = Number(offsetSettings.ctpPlatePrice || 35);
    const ctpTotalCost = numPlates * ctpPrice;

    const passes = (colors === '4/4' || colors === '1/1') ? 2 : 1;
    const totalTurns = grossSheets * passes;
    const ratePer1000 = Number(offsetSettings.costPerThousandTurns || 35);
    const minFee = Number(offsetSettings.minTurnFee || 70);
    const turnCost = Math.max(minFee, Math.ceil(totalTurns / 1000) * ratePer1000);

    printCost = ctpTotalCost + turnCost;
  }

  // --- 2. FINISHINGS COST ---
  let finishingsCost = 0;
  const finishingsDetail = finishings.map(f => {
    let itemCost = 0;
    
    if (f.category === 'positiva') {
      itemCost = calculatePositivaFinishing(f, grossSheets, sheetSize, qty);
    } else {
      const setup = Number(f.setupCost || 0);
      const unitPrice = Number(f.unitCost || 0);

      if (f.type === 'per_sheet_sra3') {
        itemCost = (grossSheets * unitPrice) + setup;
      } else if (f.type === 'per_unit') {
        itemCost = (qty * unitPrice) + setup;
      } else if (f.type === 'fixed') {
        itemCost = setup;
      }
    }
    finishingsCost += itemCost;
    return { ...f, calculatedTotal: itemCost };
  });

  // --- 3. FINANCIAL DRE & PRICING (Markup por Divisor "Por Dentro") ---
  const directCost = paperCost + printCost + finishingsCost;

  const techLossPct = Number(financialConfig.technicalLossPercent || 5);
  const fixedOverheadPct = Number(financialConfig.fixedOverheadPercent || 12);
  
  // Resolução de Impostos: Produto (3%), Serviço (6%) ou Custom
  const taxType = financialConfig.taxType || 'product';
  let taxPct = 3.0;
  let taxTypeName = 'Simples Nacional Produto (3.0%)';

  if (taxType === 'product') {
    taxPct = Number(financialConfig.taxProductPercent !== undefined ? financialConfig.taxProductPercent : 3.0);
    taxTypeName = 'Simples Nacional Produto (3.0%)';
  } else if (taxType === 'service') {
    taxPct = Number(financialConfig.taxServicePercent !== undefined ? financialConfig.taxServicePercent : 6.0);
    taxTypeName = 'Simples Nacional Serviço (6.0%)';
  } else if (taxType === 'custom') {
    taxPct = Number(financialConfig.taxCustomPercent !== undefined ? financialConfig.taxCustomPercent : (financialConfig.taxSimplesPercent || 3.0));
    taxTypeName = `Personalizado (${taxPct}%)`;
  }

  const commissionPct = Number(financialConfig.salesCommissionPercent || 5);
  const profitPct = Number(financialConfig.desiredProfitPercent || 30);

  const techLossVal = directCost * (techLossPct / 100);
  const baseCost = directCost + techLossVal;
  const fixedOverheadVal = baseCost * (fixedOverheadPct / 100);
  const totalIndustrialCost = baseCost + fixedOverheadVal;

  // Cálculo "Por Dentro" (Markup por Divisor): PV = CI / (1 - (Imposto% + Comissão% + Lucro%) / 100)
  const totalDeductionsPct = taxPct + commissionPct + profitPct;
  const effectiveDivisor = Math.max(0.01, 1 - (totalDeductionsPct / 100));

  let finalPrice = 0;
  if (totalDeductionsPct < 100) {
    finalPrice = totalIndustrialCost / effectiveDivisor;
  } else {
    finalPrice = totalIndustrialCost * 2.0;
  }

  const taxVal = finalPrice * (taxPct / 100);
  const commissionVal = finalPrice * (commissionPct / 100);
  const profitVal = finalPrice * (profitPct / 100);

  const markupMultiplier = totalIndustrialCost > 0 ? (finalPrice / totalIndustrialCost) : 1;
  const unitCost = totalIndustrialCost / qty;
  const unitPrice = finalPrice / qty;

  return {
    quantity: qty,
    layout,
    spineMm,
    requiredSheets,
    grossSheets,
    remaFullSheets,
    totalRefiledPieces,
    costs: {
      paperCost: Math.round(paperCost * 100) / 100,
      printCost: Math.round(printCost * 100) / 100,
      finishingsCost: Math.round(finishingsCost * 100) / 100,
      directCost: Math.round(directCost * 100) / 100,
      clickRate: typeof clickRate !== 'undefined' ? Math.round(clickRate * 1000) / 1000 : 0,
      formatFactor: typeof formatFactor !== 'undefined' ? formatFactor : 1.0,
      techLossVal: Math.round(techLossVal * 100) / 100,
      fixedOverheadVal: Math.round(fixedOverheadVal * 100) / 100,
      totalIndustrialCost: Math.round(totalIndustrialCost * 100) / 100,
      taxType,
      taxTypeName,
      taxPct,
      effectiveDivisor: Math.round(effectiveDivisor * 10000) / 10000,
      markupMultiplier: Math.round(markupMultiplier * 10000) / 10000,
      taxVal: Math.round(taxVal * 100) / 100,
      commissionVal: Math.round(commissionVal * 100) / 100,
      profitVal: Math.round(profitVal * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      unitCost: Math.round(unitCost * 100) / 100,
      unitPrice: Math.round(unitPrice * 100) / 100
    },
    finishingsDetail
  };
}

/**
 * Generates pricing scale comparison across multiple quantity tiers.
 */
export function generateTierMatrix(config, tiers = [100, 250, 500, 1000, 2500, 5000]) {
  return tiers.map(qty => {
    const res = calculateBudget({ ...config, quantity: qty });
    return {
      qty,
      totalPrice: res.costs.finalPrice,
      unitPrice: res.costs.unitPrice,
      totalIndustrialCost: res.costs.totalIndustrialCost,
      profitVal: res.costs.profitVal
    };
  });
}

/**
 * Generates next sequential client code in the format CLI-A0001, CLI-A0002, etc.
 */
export function generateNextClientCode(clients = []) {
  if (!clients || clients.length === 0) return 'CLI-A0001';

  let maxNum = 0;
  let activeLetter = 'A';

  clients.forEach(c => {
    const codeStr = c.code || '';
    const match = codeStr.match(/CLI-([A-Z])(\d+)/i);
    if (match) {
      const letter = match[1].toUpperCase();
      const num = parseInt(match[2], 10);
      if (num > maxNum) {
        maxNum = num;
        activeLetter = letter;
      }
    }
  });

  let nextNum = maxNum + 1;
  let nextLetter = activeLetter;

  if (nextNum > 9999) {
    nextNum = 1;
    nextLetter = String.fromCharCode(activeLetter.charCodeAt(0) + 1);
  }

  const paddedNum = String(nextNum).padStart(4, '0');
  return `CLI-${nextLetter}${paddedNum}`;
}

/**
 * Generates next sequential supplier code in the format FOR-A0001, FOR-A0002, etc.
 */
export function generateNextSupplierCode(suppliers = []) {
  if (!suppliers || suppliers.length === 0) return 'FOR-A0001';

  let maxNum = 0;
  let activeLetter = 'A';

  suppliers.forEach(s => {
    const codeStr = s.code || '';
    const match = codeStr.match(/FOR-([A-Z])(\d+)/i);
    if (match) {
      const letter = match[1].toUpperCase();
      const num = parseInt(match[2], 10);
      if (num > maxNum) {
        maxNum = num;
        activeLetter = letter;
      }
    }
  });

  let nextNum = maxNum + 1;
  let nextLetter = activeLetter;

  if (nextNum > 9999) {
    nextNum = 1;
    nextLetter = String.fromCharCode(activeLetter.charCodeAt(0) + 1);
  }

  const paddedNum = String(nextNum).padStart(4, '0');
  return `FOR-${nextLetter}${paddedNum}`;
}

/**
 * Generates next sequential bidding code in the format LIC-A0001, LIC-A0002, etc.
 */
export function generateNextBiddingCode(biddings = []) {
  if (!biddings || biddings.length === 0) return 'LIC-A0001';

  let maxNum = 0;
  let activeLetter = 'A';

  biddings.forEach(b => {
    const codeStr = b.code || '';
    const match = codeStr.match(/LIC-([A-Z])(\d+)/i);
    if (match) {
      const letter = match[1].toUpperCase();
      const num = parseInt(match[2], 10);
      if (num > maxNum) {
        maxNum = num;
        activeLetter = letter;
      }
    }
  });

  let nextNum = maxNum + 1;
  let nextLetter = activeLetter;

  if (nextNum > 9999) {
    nextNum = 1;
    nextLetter = String.fromCharCode(activeLetter.charCodeAt(0) + 1);
  }

  const paddedNum = String(nextNum).padStart(4, '0');
  return `LIC-${nextLetter}${paddedNum}`;
}





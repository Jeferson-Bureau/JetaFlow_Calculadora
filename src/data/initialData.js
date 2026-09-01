// Initial default prices and materials data for JETAPRINT GRÁFICA MULTIMÍDIA

// MÁQUINAS E EQUIPAMENTOS COM FICHA TÉCNICA E LIMITES DA JETAPRINT
export const DEFAULT_EQUIPMENTS = [
  {
    id: 'xerox-c8035',
    name: 'Xerox AltaLink C8035 (Digital Laser A3)',
    type: 'digital_laser',
    maxW: 330,
    maxH: 480,
    maxGsm: 256,
    speedPpm: 35,
    // Custos Base A4 (+10% sobre referência: PB R$ 0,143 / Color R$ 0,605)
    clickMono: 0.143,        // A4 Preto (1/0) - de 0,13 para 0,143 (+10%)
    clickColor: 0.605,       // A4 Colorido (4/0) - de 0,55 para 0,605 (+10%)
    clickMonoDuplex: 0.286,  // A4 Preto Duplex (1/1 = 2x) - de 0,26 para 0,286 (+10%)
    clickColorDuplex: 1.21,  // A4 Colorido Duplex (4/4 = 2x) - de 1,10 para 1,21 (+10%)
    // Multiplicadores por formato de folha
    formatMultipliers: {
      a4: 1.0,              // A4: 1x (Preto: 0,143 / Color: 0,605)
      a3: 2.0,              // A3: 2x (Preto: 0,286 / Color: 1,21)
      sra3: 2.3,            // SRA3: 2,3x (Preto: 0,329 / Color: 1,392)
      'maxi-digital': 2.3,   // Super A3 Extra: 2,3x
      'banner-digital': 3.5 // Banner Digital (33x66cm): 3,5x
    },
    notes: 'Base A4 (+10%): PB R$ 0,143 / Color R$ 0,605 | Multiplicadores: A3 (2x), SRA3 (2,3x). Duplex = 2x face.'
  },
  {
    id: 'canon-gx7010',
    name: 'Canon MAXIFY GX7010 (Jato de Tinta MegaTank A4)',
    type: 'inkjet_tank',
    maxW: 216,
    maxH: 356,
    maxGsm: 220,
    speedPpm: 24,
    clickMono: 0.02,
    clickColor: 0.04,
    clickMonoDuplex: 0.035,
    clickColorDuplex: 0.07,
    notes: 'Custo ultrabaixo por página (Tinta GI-16). Máximo A4/Ofício e gramatura até 220g.'
  },
  {
    id: 'bannercut-pro-60',
    name: 'BannerCut Pro 60cm (Plotter de Recorte Linha SV)',
    type: 'cutting_plotter',
    maxW: 600,
    maxH: 5000,
    maxGsm: 300,
    speedPpm: 60,
    maxForce: 2000,
    notes: 'Corte de contorno por câmera, meio corte (adesivos), corte total (tags até 300g) e vincos.'
  },
  {
    id: 'offset-press',
    name: 'Impressora Off-set Industrial (66x96 / 76x112)',
    type: 'offset',
    maxW: 760,
    maxH: 1120,
    maxGsm: 350,
    speedPpm: 200,
    notes: 'Produção industrial de grandes tiragens com chapas CTP.'
  }
];

// CATALOGO OFICIAL DA PLANILHA DE CUSTO DE PAPEL DA JETAPRINT
export const DEFAULT_PAPERS = [
  { id: 'paper-1', name: 'Duplex 350g (66x96 - Battaglia)', weightGsm: 350, pricePerKg: 10.01, pricePerSheetSra3: 0.5547, pricePerFullSheet: 2.2190, remaFls: 100, remaPrice: 221.90, brand: 'Battaglia', format: '66x96' },
  { id: 'paper-2', name: 'Sulfite 75g (A4 - Suzano)', weightGsm: 75, pricePerKg: 10.48, pricePerSheetSra3: 0.0980, pricePerFullSheet: 0.0490, remaFls: 5000, remaPrice: 245.00, brand: 'Suzano', format: 'A4' },
  { id: 'paper-3', name: 'Sulfite 90g (A4 - Suzano)', weightGsm: 90, pricePerKg: 10.90, pricePerSheetSra3: 0.1224, pricePerFullSheet: 0.0612, remaFls: 2500, remaPrice: 153.00, brand: 'Suzano', format: 'A4' },
  { id: 'paper-4', name: 'Couche Brilho 115g (64x88 - Suzano)', weightGsm: 115, pricePerKg: 8.81, pricePerSheetSra3: 0.1426, pricePerFullSheet: 0.5706, remaFls: 250, remaPrice: 142.65, brand: 'Suzano', format: '64x88' },
  { id: 'paper-5', name: 'Offset 180g (66x96 - Chambril)', weightGsm: 180, pricePerKg: 11.22, pricePerSheetSra3: 0.3200, pricePerFullSheet: 1.2800, remaFls: 125, remaPrice: 160.00, brand: 'Chambril', format: '66x96' },
  { id: 'paper-6', name: 'Auto Copiativo CB 56g (66x96 - CAC)', weightGsm: 56, pricePerKg: 22.43, pricePerSheetSra3: 0.1990, pricePerFullSheet: 0.7960, remaFls: 250, remaPrice: 199.00, brand: 'CAC', format: '66x96' },
  { id: 'paper-7', name: 'Auto Copiativo CFB 53g (66x96 - CAC)', weightGsm: 53, pricePerKg: 28.35, pricePerSheetSra3: 0.2380, pricePerFullSheet: 0.9520, remaFls: 250, remaPrice: 238.00, brand: 'CAC', format: '66x96' },
  { id: 'paper-8', name: 'Auto Copiativo CF 53g (66x96 - CAC)', weightGsm: 53, pricePerKg: 21.88, pricePerSheetSra3: 0.1837, pricePerFullSheet: 0.7348, remaFls: 250, remaPrice: 183.70, brand: 'CAC', format: '66x96' },
  { id: 'paper-9', name: 'Couche Brilho 150g (66x96 - Designe)', weightGsm: 150, pricePerKg: 9.05, pricePerSheetSra3: 0.2150, pricePerFullSheet: 0.8600, remaFls: 250, remaPrice: 215.00, brand: 'Designe', format: '66x96' },
  { id: 'paper-10', name: 'Couche Brilho 170g (66x96 - Designe)', weightGsm: 170, pricePerKg: 8.88, pricePerSheetSra3: 0.2390, pricePerFullSheet: 0.9560, remaFls: 250, remaPrice: 239.00, brand: 'Designe', format: '66x96' },
  { id: 'paper-11', name: 'Triplex C2S 300g (66x96 - Ningbo Star)', weightGsm: 300, pricePerKg: 9.38, pricePerSheetSra3: 0.4457, pricePerFullSheet: 1.7829, remaFls: 100, remaPrice: 178.29, brand: 'Ningbo Star', format: '66x96' },
  { id: 'adesivo-couche', name: 'Papel Adesivo Couché (Fototac)', weightGsm: 190, pricePerKg: 22.00, pricePerSheetSra3: 1.10, pricePerFullSheet: 4.4000, remaFls: 100, remaPrice: 440.00, brand: 'Fototac', format: '66x96' },
  { id: 'adesivo-vinil-m2', name: 'Vinil Adesivo Brilho/Fosco (m² Grande Formato)', weightGsm: 0, pricePerKg: 0, pricePerM2: 28.00 },
  { id: 'lona-440g-m2', name: 'Lona Frontlight 440g (m² Grande Formato)', weightGsm: 0, pricePerKg: 0, pricePerM2: 25.00 }
];

export const DEFAULT_SHEET_SIZES = [
  { id: 'sra3', name: 'SRA3 (320 x 450 mm)', widthMm: 320, heightMm: 450, printableW: 310, printableH: 440, baseFormat: '66x96', formatRatio: 4 },
  { id: 'maxi-digital', name: 'Super A3 Extra (330 x 480 mm)', widthMm: 330, heightMm: 480, printableW: 320, printableH: 470, baseFormat: '66x96', formatRatio: 4 },
  { id: 'a3', name: 'A3 Padrão (297 x 420 mm)', widthMm: 297, heightMm: 420, printableW: 287, printableH: 410, baseFormat: '66x96', formatRatio: 4 },
  { id: 'banner-digital', name: 'Banner Digital (330 x 660 mm)', widthMm: 330, heightMm: 660, printableW: 320, printableH: 650, baseFormat: '66x96', formatRatio: 3 },
  { id: 'a4', name: 'A4 Padronizado (210 x 297 mm)', widthMm: 210, heightMm: 297, printableW: 200, printableH: 287, baseFormat: '66x96', formatRatio: 8 },
  { id: 'full-66x96', name: 'Folha Inteira Offset (660 x 960 mm)', widthMm: 660, heightMm: 960, printableW: 640, printableH: 940, baseFormat: '66x96', formatRatio: 1 },
  { id: 'full-64x88', name: 'Folha Inteira Offset (640 x 880 mm)', widthMm: 640, heightMm: 880, printableW: 620, printableH: 860, baseFormat: '64x88', formatRatio: 1 },
  { id: 'full-76x112', name: 'Folha Inteira Offset (760 x 1120 mm)', widthMm: 760, heightMm: 1120, printableW: 740, printableH: 1100, baseFormat: '77x113', formatRatio: 1 }
];

export const DEFAULT_DIGITAL_CLICKS = {
  clickColorSimplex: 0.605,  // 4/0 Base A4 (+10%)
  clickColorDuplex: 1.21,    // 4/4 Base A4 (2x) (+10%)
  clickMonoSimplex: 0.143,   // 1/0 Base A4 (+10%)
  clickMonoDuplex: 0.286,    // 1/1 Base A4 (2x) (+10%)
  largeFormatM2Tinta: 12.00  // Impressão m² Comunicação Visual
};

export const DEFAULT_OFFSET_SETTINGS = {
  ctpPlatePrice: 35.00,       // Custo de cada chapa CTP
  makeReadySheets: 200,       // Perda padrão de acerto
  costPerThousandTurns: 35.0, // Custo de rodagem por mil giros
  minTurnFee: 70.00           // Custo mínimo de rodagem
};

// TABELA OFICIAL POSITIVA ACABAMENTOS GRÁFICOS (2025)
export const DEFAULT_POSITIVA_FINISHINGS = [
  { id: 'pos-lam-fosca', name: 'Positiva - Laminação Fosca', category: 'positiva', calculationType: 'm2_milheiro', pricePerM2Milheiro: 1.98, minPricePerMilheiro: 120.00 },
  { id: 'pos-lam-brilho', name: 'Positiva - Laminação Brilho', category: 'positiva', calculationType: 'm2_milheiro', pricePerM2Milheiro: 1.98, minPricePerMilheiro: 120.00 },
  { id: 'pos-lam-softtouch', name: 'Positiva - Laminação Soft Touch', category: 'positiva', calculationType: 'm2_milheiro', pricePerM2Milheiro: 6.80, minPricePerMilheiro: 150.00 },
  { id: 'pos-plast-brilho', name: 'Positiva - Plastificação Brilho', category: 'positiva', calculationType: 'm2_milheiro', pricePerM2Milheiro: 1.32, minPricePerMilheiro: 120.00 },
  { id: 'pos-plast-brilho-adesivo', name: 'Positiva - Plastificação Brilho Adesivo', category: 'positiva', calculationType: 'm2_milheiro', pricePerM2Milheiro: 1.42, minPricePerMilheiro: 120.00 },
  { id: 'pos-acoplagem-papel', name: 'Positiva - Acoplagem Papel c/ Papel', category: 'positiva', calculationType: 'm2_milheiro', pricePerM2Milheiro: 1.80, minPricePerMilheiro: 130.00 },
  { id: 'pos-acoplagem-micro', name: 'Positiva - Acoplagem Papel c/ Microondulado', category: 'positiva', calculationType: 'm2_milheiro', pricePerM2Milheiro: 1.98, minPricePerMilheiro: 130.00 },
  { id: 'pos-verniz-total', name: 'Positiva - Verniz UV Total', category: 'positiva', calculationType: 'm2_milheiro', pricePerM2Milheiro: 0.90, minPricePerMilheiro: 110.00, setupCost: 66.00 },
  { id: 'pos-verniz-local', name: 'Positiva - Verniz UV Localizado (Até 30%)', category: 'positiva', calculationType: 'verniz_local_format', minPricePerMilheiro: 183.00,
    rates66x96: { format8: 183.00, format6: 195.00, format4: 222.00, format3: 290.00, format2: 350.00 },
    rates77x113: { format8: 195.00, format6: 209.00, format4: 290.00, format3: 350.00, format2: 440.00 }
  },
  { id: 'pos-corte-vinco', name: 'Positiva - Corte e Vinco (Pasta/Envelope/Caixa)', category: 'positiva', calculationType: 'corte_vinco_format',
    rates66x96: { format8: 84.00, format6: 84.00, format4: 84.00, format3: 110.00, format2: 110.00, format1: 180.00 },
    rates77x113: { format8: 84.00, format6: 84.00, format4: 110.00, format3: 121.00, format2: 135.00, format1: 180.00 }
  },
  { id: 'pos-meio-corte', name: 'Positiva - Meio Corte Adesivo', category: 'positiva', calculationType: 'meio_corte_format',
    rates66x96: { format8: 94.00, format6: 94.00, format4: 100.00, format3: 135.00, format2: 150.00 },
    rates77x113: { format8: 94.00, format6: 94.00, format4: 121.00, format3: 145.00, format2: 165.00 }
  },
  { id: 'pos-hot-ouro-prata', name: 'Positiva - Hot Stamping (Prata / Ouro)', category: 'positiva', calculationType: 'm2_milheiro', pricePerM2Milheiro: 10.00, minPricePerMilheiro: 176.00 },
  { id: 'pos-hot-colorido', name: 'Positiva - Hot Stamping (Colorido)', category: 'positiva', calculationType: 'm2_milheiro', pricePerM2Milheiro: 12.00, minPricePerMilheiro: 209.00 }
];

export const DEFAULT_FINISHINGS = [
  // BannerCut Pro 60cm (Plotter de Recorte Digital Câmera)
  { id: 'bannercut-meio-corte', name: 'BannerCut Pro - Meio Corte Digital (Adesivos/Rótulos)', category: 'bannercut', type: 'per_unit', unitCost: 0.08, setupCost: 15.00 },
  { id: 'bannercut-corte-passante', name: 'BannerCut Pro - Corte Total Contorno (Tags/Caixas até 300g)', category: 'bannercut', type: 'per_unit', unitCost: 0.15, setupCost: 20.00 },
  { id: 'bannercut-vinco', name: 'BannerCut Pro - Vinco Mecânico Digital (Até 300g)', category: 'bannercut', type: 'per_unit', unitCost: 0.06, setupCost: 15.00 },

  ...DEFAULT_POSITIVA_FINISHINGS,

  // Acabamentos Internos JetaPrint
  { id: 'corte-vinco-std', name: 'JetaPrint - Refile em Guilhotina Standard', category: 'interna', type: 'fixed', unitCost: 0.00, setupCost: 15.00 },
  { id: 'dobras', name: 'JetaPrint - Dobra Automática', category: 'interna', type: 'per_unit', unitCost: 0.04, setupCost: 20.00 },
  { id: 'vincos', name: 'JetaPrint - Vinco Mecânico', category: 'interna', type: 'per_unit', unitCost: 0.05, setupCost: 15.00 },
  { id: 'grampo-canoa', name: 'JetaPrint - Encadernação Grampo Canoa', category: 'interna', type: 'per_unit', unitCost: 0.35, setupCost: 30.00 },
  { id: 'wire-o', name: 'JetaPrint - Encadernação Wire-O Metálico', category: 'interna', type: 'per_unit', unitCost: 2.80, setupCost: 25.00 },
  { id: 'espiral-plastico', name: 'JetaPrint - Encadernação Espiral Plástico', category: 'interna', type: 'per_unit', unitCost: 1.50, setupCost: 15.00 },
  { id: 'cantos-arredondados', name: 'JetaPrint - Cantos Arredondados', category: 'interna', type: 'per_unit', unitCost: 0.10, setupCost: 20.00 },
  { id: 'ilhos-bastao', name: 'JetaPrint - Ilhós + Bastão (Banners)', category: 'interna', type: 'per_unit', unitCost: 8.00, setupCost: 0.00 }
];

export const DEFAULT_FINANCIAL_CONFIG = {
  taxType: 'product',            // 'product' (3.0%), 'service' (6.0%), 'custom'
  taxProductPercent: 3.0,        // Simples Nacional Produto / Indústria (3.0%)
  taxServicePercent: 6.0,        // Simples Nacional Serviço / ISS (6.0%)
  taxCustomPercent: 3.0,         // Alíquota personalizada
  taxSimplesPercent: 3.0,        // Alíquota ativa (default produto)
  calculationMethod: 'divisor',  // Markup por Divisor ("Por Dentro")
  technicalLossPercent: 5.0,     // Perda técnica (%)
  fixedOverheadPercent: 12.0,    // Rateio Custo Fixo (%)
  salesCommissionPercent: 5.0,   // Comissão de Venda (%)
  desiredProfitPercent: 30.0     // Margem de Lucro Desejada sobre Venda (%)
};

export const DEFAULT_CLIENTS = [
  {
    id: 'cli-1',
    code: 'CLI-A0001',
    tradeName: 'Maxx Pool',
    name: 'MAXX POOL INDUSTRIA E COMERCIO LTDA',
    docType: 'cnpj',
    doc: '57.591.607/0001-00',
    contactPerson: 'Celiane / Cezar',
    phone: '(44) 3017-1158',
    email: 'MAXXPOOLINDUSTRIA@GMAIL.COM',
    street: 'AV JOSÉ MOSER, 1076',
    neighborhood: 'CENTRO',
    city: 'Peabiru',
    state: 'PR',
    notes: 'WhatsApp: (44) 99727-0714 | Segmento: Indústria',
    createdAt: '2026-02-28'
  },
  {
    id: 'cli-2',
    code: 'CLI-A0002',
    tradeName: 'THOR',
    name: 'THOR COMPONENTES AUTOMOTIVOS LTDA',
    docType: 'cnpj',
    doc: '01.304.933/0001-35',
    contactPerson: 'ROGÉRIO',
    phone: '(44) 99692-4440',
    email: 'rogerio@thor.ind.br',
    street: 'BR. 376, 9620, KM 130 LOTE 108/C',
    city: 'Maringá',
    state: 'PR',
    notes: 'WhatsApp: (44) 99692-4440 | Segmento: Automotiva',
    createdAt: '2026-02-28'
  },
  {
    id: 'cli-3',
    code: 'CLI-A0003',
    tradeName: 'PULVERIZE',
    name: 'PULVERIZE IND. E COMERC. DE PEÇAS AGRICOLAS LTDA.',
    docType: 'cnpj',
    doc: '41.632.629/0001-31',
    contactPerson: 'Edson / Igor',
    phone: '(44) 3034-4463',
    street: 'AV. JINROKU KUBOTA N° 4265',
    city: 'Maringá',
    state: 'PR',
    zipCode: '87043-647',
    notes: 'WhatsApp: (44) 99846-3008 | Segmento: Agrícola',
    createdAt: '2026-02-28'
  },
  {
    id: 'cli-4',
    code: 'CLI-A0004',
    tradeName: 'Alimentos Atalaia',
    name: 'Alimentos Atalaia Ltda',
    docType: 'cnpj',
    doc: '82.234.071/0001-13',
    contactPerson: 'Leandro / Maurício',
    phone: '(44) 3254-1195',
    email: 'financeiro@alimentosatalaia.com.br',
    street: 'Rodovia PR 218, s/n - Lote 03 - Parque Industrial II',
    city: 'Atalaia',
    state: 'PR',
    zipCode: '87.630-000',
    notes: 'WhatsApp: (44) 3245-1431 | Segmento: Alimentos',
    createdAt: '2026-02-28'
  },
  {
    id: 'cli-5',
    code: 'CLI-A0005',
    tradeName: 'UEM',
    name: 'FUNDAÇÃO UNIVERSIDADE ESTADUAL DE MARINGA - UEM',
    docType: 'cnpj',
    doc: '79.151.312/0001-56',
    phone: '(44) 3011-4175',
    email: 'nfe.contasapagar@uem.br',
    street: 'Avenida Colombo, 5790',
    neighborhood: 'Zona 7',
    city: 'Maringá',
    state: 'PR',
    zipCode: '87.020-900',
    notes: 'Tipo: Órgão Governamental | Segmento: Educação',
    createdAt: '2026-02-28'
  },
  {
    id: 'cli-6',
    code: 'CLI-A0006',
    tradeName: 'FADEC',
    name: 'FUNDACAO DE APOIO AO DESENVOLVIMENTO CIENTIFICO DA UNIVERSIDADE ESTADUAL DE MARINGA',
    docType: 'cnpj',
    doc: '80.897.432/0001-86',
    phone: '(44) 3011-4462',
    email: 'FADECMGA@GMAIL.COM',
    street: 'Avenida Colombo, 5790, Bloco B09',
    neighborhood: 'Zona 7',
    city: 'Maringá',
    state: 'PR',
    zipCode: '87.020-900',
    notes: 'Tipo: Órgão Governamental | Segmento: Educação',
    createdAt: '2026-02-28'
  },
  {
    id: 'cli-7',
    code: 'CLI-A0007',
    tradeName: 'CENTER POOL',
    name: 'CENTER POOL INDÚSTRIA E COMÉRCIO EIRELI',
    docType: 'cnpj',
    doc: '13.532.455/0001-08',
    contactPerson: 'ELAINE CRISTINA DA SILVA AREIAS',
    street: 'Avenida Parque Industrial, s/n.° Quadra 05, Lote 01, Cedime I',
    city: 'Peabiru',
    state: 'PR',
    zipCode: '87.250-000',
    notes: 'Segmento: Indústria',
    createdAt: '2026-02-28'
  },
  {
    id: 'cli-8',
    code: 'CLI-A0008',
    tradeName: 'TAKAHASHI AQUECEDORES',
    name: 'M F TAKAHASHI AQUECEDORES',
    docType: 'cnpj',
    doc: '42.699.836/0001-76',
    contactPerson: 'MARIA FERNANDA TAKAHASHI',
    phone: '(44) 9845-0044',
    email: 'BRATH.CONTABILIDADE@OUTLOOK.COM',
    street: 'ROD BR-158 S/N SALA 02 CEDIME III PARQUE INDUSTRIAL',
    city: 'Peabiru',
    state: 'PR',
    zipCode: '87.250-000',
    notes: 'Segmento: Indústria',
    createdAt: '2026-02-28'
  },
  {
    id: 'cli-9',
    code: 'CLI-A0009',
    tradeName: 'AQUECE INDUSTRIAL LTDA',
    name: 'AQUECE INDUSTRIAL LTDA',
    docType: 'cnpj',
    doc: '52.303.285/0001-33',
    contactPerson: 'NATHALYA SILVA DA ROSA',
    phone: '(44) 3017-1158',
    email: 'AQUECEINDUSTRIAL@GMAIL.COM',
    street: 'RUA PROJETADA A, nº 70B, LOTE 9 A; QUADRA 02;',
    neighborhood: 'CENTRO',
    city: 'Peabiru',
    state: 'PR',
    zipCode: '87250000',
    notes: 'Segmento: Indústria',
    createdAt: '2026-02-28'
  },
  {
    id: 'cli-10',
    code: 'CLI-A0010',
    tradeName: 'Fhortsol',
    name: 'FHORTSOL INDÚSTRIA E COMÉRCIO LTDA',
    docType: 'cnpj',
    doc: '05.019.056/0001-01',
    contactPerson: 'Eymy do Nascimento Silva da Rosa',
    phone: '(44) 3531-2828',
    email: 'comprassanspray@gmail.com',
    street: 'Rua Pista Exclusiva Do Parque Industrial (Marginal), n.° 277',
    neighborhood: 'Parque Industrial I',
    city: 'Peabiru',
    state: 'PR',
    zipCode: '87.250-000',
    notes: 'Segmento: Indústria',
    createdAt: '2026-02-28'
  },
  {
    id: 'cli-11',
    code: 'CLI-A0011',
    tradeName: 'Sanspray',
    name: 'AQUECEMAX INDÚSTRIA E COMÉRCIO EIRELI',
    docType: 'cnpj',
    doc: '38.312.607/0001-80',
    contactPerson: 'YASMIN CRISTINA DA SILVA AREIAS',
    phone: '(44) 3531-1009',
    street: 'Rua A, n° 70',
    neighborhood: 'Parque Industrial',
    city: 'Peabiru',
    state: 'PR',
    zipCode: '87.250-000',
    notes: 'Segmento: Indústria',
    createdAt: '2026-02-28'
  },
  {
    id: 'cli-12',
    code: 'CLI-A0012',
    tradeName: 'F M P FUNDIÇÃO',
    name: 'F M INDUSTRIAL LTDA',
    docType: 'cnpj',
    doc: '07.688.335/0001-93',
    contactPerson: 'FABIANO LEITE DA ROSA',
    phone: '(44) 3531-1101',
    email: 'nfsanspray@gmail.com',
    street: 'Rodovia BR 158, S/N, Cedime III, Sala 01',
    neighborhood: 'Parque Industrial',
    city: 'Peabiru',
    state: 'PR',
    zipCode: '87.250-000',
    notes: 'Segmento: Indústria',
    createdAt: '2026-02-28'
  },
  {
    id: 'cli-13',
    code: 'CLI-A0013',
    tradeName: 'RefrigerarMax',
    name: 'L. B. Cruz e Cia Ltda',
    docType: 'cnpj',
    doc: '11.123.303/0001-18',
    contactPerson: 'Leandro / Neliane',
    phone: '(44) 3264-2110',
    email: 'refrimaxadm@gmail.com',
    street: 'Rua Guiapó nº 877',
    neighborhood: 'Centro',
    city: 'Sarandi',
    state: 'PR',
    zipCode: '87111-120',
    notes: 'WhatsApp: (44) 99747-1616 | Segmento: Refrigeração',
    createdAt: '2026-02-28'
  }
];

export const DEFAULT_SUPPLIERS = [
  {
    id: 'sup-1',
    code: 'FOR-A0001',
    name: 'BANNERJET IMP EXP E COM DE MAQ EQUIP PARA COM VISUAL LTDA.',
    tradeName: 'Bannerjet',
    category: 'comunicacao_visual',
    docType: 'cnpj',
    doc: '06.276.736/0001-73',
    phone: '(17) 99741-9548',
    email: 'noreply@bjcontrol.com.br',
    street: 'Avenida José Munia, 5535 Andar 2 Conj. 205 Sala 5',
    city: 'São José do Rio Preto',
    state: 'SP',
    notes: 'Máquinas e equipamentos para comunicação visual.',
    createdAt: '2026-02-28'
  },
  {
    id: 'sup-2',
    code: 'FOR-A0002',
    name: 'CAC comércio de Papeis Ltda',
    tradeName: 'CAC Papéis',
    category: 'papeis',
    docType: 'cnpj',
    doc: '02.282.485/0001-89',
    contactPerson: 'Juliane',
    notes: 'Fornecedor de papéis e cartões copiativos / offset.',
    createdAt: '2026-02-28'
  },
  {
    id: 'sup-3',
    code: 'FOR-A0003',
    name: 'F. L. NEGRI SERVIÇOS GRÁFICOS LTDA-ME',
    tradeName: 'POSITIVOS ACABAMENTOS GRÁFICOS',
    category: 'acabamento',
    docType: 'cnpj',
    doc: '15.385.838/0001-18',
    phone: '(44) 3025-6325',
    email: 'flaviofacaria@hotmail.com',
    contactPerson: 'Flavio Negri Lima',
    street: 'Rua Rodolfo Cremm, 18900',
    neighborhood: 'JD Três Lagoas',
    city: 'Maringá',
    state: 'PR',
    zipCode: '87075-855',
    notes: 'WhatsApp: (44) 99851-1998. Acabamentos gráficos, facas e cortes.',
    createdAt: '2026-02-28'
  },
  {
    id: 'sup-4',
    code: 'FOR-A0004',
    name: 'EPRINT SOLUCOES EM IMPRESSAO LTDA',
    tradeName: 'EPRINT',
    category: 'equipamento',
    docType: 'cnpj',
    doc: '35.927.734/0001-03',
    phone: '(44) 3200-0813',
    street: 'Avenida Nilso Bertoni, 1185',
    neighborhood: 'Jardim Europa',
    city: 'Maringá',
    state: 'PR',
    zipCode: '87060-750',
    notes: 'Soluções em impressão e assistência técnica.',
    createdAt: '2026-02-28'
  },
  {
    id: 'sup-5',
    code: 'FOR-A0005',
    name: 'Companhia Paranaense de Energia',
    tradeName: 'COPEL',
    category: 'outros',
    docType: 'cnpj',
    doc: '76.483.817/0001-20',
    city: 'Curitiba',
    state: 'PR',
    notes: 'Fornecedor de energia elétrica industrial.',
    createdAt: '2026-02-28'
  },
  {
    id: 'sup-6',
    code: 'FOR-A0006',
    name: 'IRED INTERNET LTDA',
    tradeName: 'Ired Internet',
    category: 'outros',
    docType: 'cnpj',
    doc: '28.418.494/0001-48',
    phone: '(44) 3032-6868',
    email: 'adm@iredinternet.com.br',
    street: 'Rua Almerinda Silveira Coelho 2261',
    city: 'Maringá',
    state: 'PR',
    notes: 'Provedor de internet e telecomunicações.',
    createdAt: '2026-02-28'
  }
];

export const DEFAULT_BIDDINGS = [
  {
    id: 'lic-1',
    code: 'LIC-A0001',
    uasg: '791513',
    biddingNumber: 'Pregão Eletrônico nº 05/2026',
    agency: 'FUNDAÇÃO UNIVERSIDADE ESTADUAL DE MARINGÁ - UEM',
    agencyCnpj: '79.151.312/0001-56',
    objectDescription: 'Registro de preços para confecção e fornecimento de material impresso gráfico (Agendas Institucionais, Cartilhas, Guias Acadêmicos A5 e Envelopes de Provas).',
    catser: '18244 - SERVIÇOS DE IMPRESSÃO GRÁFICA',
    totalValue: 48500.00,
    sessionDate: '2026-03-15',
    sessionTime: '09:00',
    modality: 'Pregão Eletrônico',
    platform: 'Compras.gov.br (Comprasnet)',
    deliveryAddress: 'Almoxarifado Central UEM - Av. Colombo, 5790, Bloco M02 - Maringá/PR',
    status: 'agendada',
    notes: 'Exige envio de amostras físicas de capa em até 3 dias úteis após homologação.',
    createdAt: '2026-02-28'
  },
  {
    id: 'lic-2',
    code: 'LIC-A0002',
    uasg: '987654',
    biddingNumber: 'Dispensa Eletrônica nº 12/2026',
    agency: 'PREFEITURA MUNICIPAL DE PEABIRU',
    agencyCnpj: '75.792.805/0001-44',
    objectDescription: 'Contratação de empresa especializada para impressão de Blocos de Aritmética, Blocos de Notificação de Saúde e Panfletos Informativos Dengue.',
    catser: '24180 - CONFECÇÃO DE IMPRESSOS EM GERAL',
    totalValue: 18200.00,
    sessionDate: '2026-03-05',
    sessionTime: '14:30',
    modality: 'Dispensa de Licitação',
    platform: 'BLL Compras',
    deliveryAddress: 'Secretaria Municipal de Saúde - Av. Brasil, 120 - Peabiru/PR',
    status: 'proposta_enviada',
    notes: 'Prazo de entrega em até 10 dias corridos após emissão da Ordem de Serviço.',
    createdAt: '2026-02-28'
  },
  {
    id: 'lic-3',
    code: 'LIC-A0003',
    uasg: '480319',
    biddingNumber: 'Contratação Direta PNCP nº 2151/2026',
    agency: 'UNIVERSIDADE ESTADUAL PAULISTA JULIO DE MESQUITA FILHO',
    agencyCnpj: '48.031.918/0001-24',
    objectDescription: 'Contratação de empresa para confecção e fornecimento de material impresso gráfico conforme especificações do edital PNCP.',
    catser: '18244 - SERVIÇOS DE IMPRESSÃO GRÁFICA',
    totalValue: 400.00,
    sessionDate: '2026-03-01',
    sessionTime: '09:00',
    modality: 'Dispensa de Licitação',
    platform: 'Portal Nacional (PNCP)',
    deliveryAddress: 'Almoxarifado Geral UNESP - Câmpus Universitário',
    status: 'agendada',
    pncpUrl: 'https://pncp.gov.br/app/editais/48031918000124/2026/2151',
    editalUrl: 'https://alertalicitacao.com.br/!licitacao/PNCP-48031918000124-1-002151-2026',
    notes: 'Importado via Alerta Licitação (jeferson.arte@gmail.com)',
    createdAt: '2026-02-28'
  }
];


// ── Banco de dados de referência para parsing rápido de alertas PNCP ───
export const KNOWN_PNCP_DATABASE = {
  '56024581000156-1-000374-2026': {
    biddingNumber: 'Contratação Direta 199/2026',
    uasg: '986969',
    agencyCnpj: '56.024.581/0001-56',
    agency: 'MUNICIPIO DE RIBEIRAO PRETO',
    objectDescription: 'Contratação de serviços gráficos de impressão de blocos personalizados, nos termos da tabela abaixo, conforme condições e exigências estabelecidas neste instrumento.',
    sessionDate: '2026-09-02',
    sessionTime: '08:00',
    totalValue: 855.00,
    modality: 'Dispensa de Licitação',
    platform: 'Compras.gov.br (Comprasnet)',
    deliveryAddress: 'Local / Entrega: Ribeirão Preto (SP)',
    editalUrl: 'https://alertalicitacao.com.br/!licitacao/PNCP-56024581000156-1-000374-2026',
    pncpUrl: 'https://pncp.gov.br/app/editais/56024581000156/2026/374'
  },
  '48031918000124-1-002151-2026': {
    biddingNumber: 'Contratação Direta 218/2026',
    uasg: '154049',
    agencyCnpj: '48.031.918/0001-24',
    agency: 'UNIVERSIDADE ESTADUAL PAULISTA JULIO DE MESQUITA FILHO',
    objectDescription: 'SERVIÇO DE IMPRESSÃO DE CARTILHA "GT UNESP MULHERES" — Specs: Capa Papel Offset 180g / Interno Sulfite 75g / Formato 14x20cm / Cor 4x0 / Dobra e Grampo Canoa.',
    sessionDate: '2026-09-01',
    sessionTime: '08:30',
    totalValue: 400.00,
    modality: 'Dispensa de Licitação',
    platform: 'Compras.gov.br (Comprasnet)',
    deliveryAddress: 'UNESP - São Paulo/SP',
    editalUrl: 'https://alertalicitacao.com.br/!licitacao/PNCP-48031918000124-1-002151-2026',
    pncpUrl: 'https://pncp.gov.br/app/editais/48031918000124/2026/2151'
  },
  '77996312000121-1-000238-2026': {
    biddingNumber: 'Pregão Eletrônico nº 238/2026',
    uasg: '925457',
    agencyCnpj: '77.996.312/0001-21',
    agency: 'TRIBUNAL DE CONTAS DO ESTADO DO PARANÁ',
    objectDescription: 'Contratação de empresa especializada para prestação de serviços de publicação de atos oficiais em jornal diário de grande circulação, impresso ou digital, com alcance em Curitiba/PR.',
    sessionDate: '2026-09-15',
    sessionTime: '10:00',
    totalValue: 4395.00,
    modality: 'Pregão Eletrônico',
    platform: 'Compras.gov.br (Comprasnet)',
    deliveryAddress: 'Tribunal de Contas do Estado do Paraná - Curitiba/PR',
    editalUrl: 'https://alertalicitacao.com.br/!licitacao/PNCP-77996312000121-1-000238-2026',
    pncpUrl: 'https://pncp.gov.br/app/editais/77996312000121/2026/238'
  },
  '63025530000104-1-003313-2026': {
    biddingNumber: 'Pregão Eletrônico nº 179/2026',
    uasg: '102174',
    agencyCnpj: '63.025.530/0001-04',
    agency: 'UNIVERSIDADE DE SAO PAULO - IAU/USP',
    objectDescription: 'Contratação de serviço de impressão e acabamento dos livros "Fazenda Santa Maria do Monjolinho: História, Memória e Representação" e "EXPERIÊNCIAS URBANÍSTICAS NO BRASIL CONTEMPORÂNEO: Planejamento e projeto em diferentes escalas".',
    sessionDate: '2026-09-15',
    sessionTime: '09:00',
    totalValue: 25192.92,
    modality: 'Pregão Eletrônico',
    platform: 'Compras.gov.br (Comprasnet)',
    deliveryAddress: 'ESP-INSTITUTO DE ARQUITETURA E URBANISMO- USP — São Carlos/SP',
    editalUrl: 'https://compras.dados.gov.br/pregoes/v1/pregoes.html?uasg=102174&numero_aviso=179',
    pncpUrl: 'https://pncp.gov.br/app/editais/63025530000104/2026/3313'
  }
};




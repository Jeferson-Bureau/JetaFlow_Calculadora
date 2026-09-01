import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import DigitalCalculator from './components/DigitalCalculator';
import OffsetCalculator from './components/OffsetCalculator';
import LargeFormatCalculator from './components/LargeFormatCalculator';
import SheetViewer from './components/SheetViewer';
import FinishingSelector from './components/FinishingSelector';
import FinancialSummary from './components/FinancialSummary';
import QuoteGenerator from './components/QuoteGenerator';
import SettingsManager from './components/SettingsManager';
import ClientManager from './components/ClientManager';
import SupplierManager from './components/SupplierManager';
import LicitacaoManager from './components/LicitacaoManager';
import DashboardOverview from './components/DashboardOverview';
import QuoteHistoryManager from './components/QuoteHistoryManager';

import {
  DEFAULT_EQUIPMENTS,
  DEFAULT_PAPERS,
  DEFAULT_SHEET_SIZES,
  DEFAULT_DIGITAL_CLICKS,
  DEFAULT_OFFSET_SETTINGS,
  DEFAULT_FINISHINGS,
  DEFAULT_FINANCIAL_CONFIG,
  DEFAULT_CLIENTS,
  DEFAULT_SUPPLIERS,
  DEFAULT_BIDDINGS
} from './data/initialData';

import { calculateBudget, generateTierMatrix, generateNextClientCode, generateNextSupplierCode, generateNextBiddingCode } from './utils/calculatorEngine';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');

  // Quotes History Storage
  const [quotesHistory, setQuotesHistory] = useState(() => {
    const saved = localStorage.getItem('jetaflow_quotes_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'orc-001',
        code: 'ORC-A0001',
        date: new Date().toLocaleDateString('pt-BR'),
        clientName: 'Prefeitura Municipal de Maringá',
        clientDoc: '76.282.656/0001-06',
        description: 'Panfletos Informativos A5 — Impressão Digital SRA3',
        paperName: 'Couché 150g',
        dimensions: '140 x 210 mm',
        quantity: 5000,
        totalValue: 680.00,
        status: 'enviado'
      }
    ];
  });

  const handleSaveQuoteToHistory = (quoteData) => {
    const nextNum = quotesHistory.length + 1;
    const code = `ORC-A${String(nextNum).padStart(4, '0')}`;
    const newQuote = {
      id: `orc-${Date.now()}`,
      code,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'enviado',
      ...quoteData
    };
    const updated = [newQuote, ...quotesHistory];
    setQuotesHistory(updated);
    localStorage.setItem('jetaflow_quotes_v1', JSON.stringify(updated));
  };

  const handleUpdateQuoteInHistory = (updatedQuote) => {
    const updated = quotesHistory.map(q => q.id === updatedQuote.id ? updatedQuote : q);
    setQuotesHistory(updated);
    localStorage.setItem('jetaflow_quotes_v1', JSON.stringify(updated));
  };

  const handleDeleteQuoteFromHistory = (id) => {
    const updated = quotesHistory.filter(q => q.id !== id);
    setQuotesHistory(updated);
    localStorage.setItem('jetaflow_quotes_v1', JSON.stringify(updated));
  };

  // Input Data Databases
  const [equipments] = useState(DEFAULT_EQUIPMENTS);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('xerox-c8035');

  const [papers, setPapers] = useState(() => {
    const saved = localStorage.getItem('jetaflow_papers');
    return saved ? JSON.parse(saved) : DEFAULT_PAPERS;
  });

  const [sheetSizes] = useState(DEFAULT_SHEET_SIZES);

  const [digitalClickRates, setDigitalClickRates] = useState(() => {
    const saved = localStorage.getItem('jetaflow_clicks');
    return saved ? JSON.parse(saved) : DEFAULT_DIGITAL_CLICKS;
  });

  const [offsetSettings, setOffsetSettings] = useState(() => {
    const saved = localStorage.getItem('jetaflow_offset');
    return saved ? JSON.parse(saved) : DEFAULT_OFFSET_SETTINGS;
  });

  const [availableFinishings, setAvailableFinishings] = useState(() => {
    const saved = localStorage.getItem('jetaflow_finishings');
    return saved ? JSON.parse(saved) : DEFAULT_FINISHINGS;
  });

  const [financialConfig, setFinancialConfig] = useState(() => {
    const saved = localStorage.getItem('jetaflow_financial');
    return saved ? { ...DEFAULT_FINANCIAL_CONFIG, ...JSON.parse(saved) } : DEFAULT_FINANCIAL_CONFIG;
  });

  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('jetaflow_clients_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isOldFictitious = parsed.some(c => (c.name || '').includes('Brasil Ltda') || c.doc === '12.345.678/0001-90');
        if (Array.isArray(parsed) && parsed.length > 0 && !isOldFictitious) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem('jetaflow_clients');
    localStorage.setItem('jetaflow_clients_v2', JSON.stringify(DEFAULT_CLIENTS));
    return DEFAULT_CLIENTS;
  });

  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('jetaflow_suppliers_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isOldFictitious = parsed.some(s => (s.name || '').includes('Battaglia Distribuidora') || s.doc === '61.123.456/0001-88');
        if (Array.isArray(parsed) && parsed.length > 0 && !isOldFictitious) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem('jetaflow_suppliers');
    localStorage.setItem('jetaflow_suppliers_v2', JSON.stringify(DEFAULT_SUPPLIERS));
    return DEFAULT_SUPPLIERS;
  });

  const [biddings, setBiddings] = useState(() => {
    const saved = localStorage.getItem('jetaflow_biddings_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('jetaflow_biddings_v2', JSON.stringify(DEFAULT_BIDDINGS));
    return DEFAULT_BIDDINGS;
  });

  const handleSetFinancialConfig = (newConfig) => {
    setFinancialConfig(newConfig);
    localStorage.setItem('jetaflow_financial', JSON.stringify(newConfig));
  };

  const handleAddClient = (newClient) => {
    const clientWithCode = {
      ...newClient,
      code: newClient.code || generateNextClientCode(clients)
    };
    const updated = [clientWithCode, ...clients];
    setClients(updated);
    localStorage.setItem('jetaflow_clients_v2', JSON.stringify(updated));
  };

  const handleUpdateClient = (updatedClient) => {
    const updated = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
    setClients(updated);
    localStorage.setItem('jetaflow_clients_v2', JSON.stringify(updated));
  };

  const handleDeleteClient = (id) => {
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    localStorage.setItem('jetaflow_clients_v2', JSON.stringify(updated));
  };

  const handleAddSupplier = (newSupplier) => {
    const supplierWithCode = {
      ...newSupplier,
      code: newSupplier.code || generateNextSupplierCode(suppliers)
    };
    const updated = [supplierWithCode, ...suppliers];
    setSuppliers(updated);
    localStorage.setItem('jetaflow_suppliers_v2', JSON.stringify(updated));
  };

  const handleUpdateSupplier = (updatedSupplier) => {
    const updated = suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s);
    setSuppliers(updated);
    localStorage.setItem('jetaflow_suppliers_v2', JSON.stringify(updated));
  };

  const handleDeleteSupplier = (id) => {
    const updated = suppliers.filter(s => s.id !== id);
    setSuppliers(updated);
    localStorage.setItem('jetaflow_suppliers_v2', JSON.stringify(updated));
  };

  const handleAddBidding = (newBidding) => {
    const biddingWithCode = {
      ...newBidding,
      code: newBidding.code || generateNextBiddingCode(biddings)
    };
    const updated = [biddingWithCode, ...biddings];
    setBiddings(updated);
    localStorage.setItem('jetaflow_biddings_v2', JSON.stringify(updated));
  };

  const handleUpdateBidding = (updatedBidding) => {
    const updated = biddings.map(b => b.id === updatedBidding.id ? updatedBidding : b);
    setBiddings(updated);
    localStorage.setItem('jetaflow_biddings_v2', JSON.stringify(updated));
  };

  const handleDeleteBidding = (id) => {
    const updated = biddings.filter(b => b.id !== id);
    setBiddings(updated);
    localStorage.setItem('jetaflow_biddings_v2', JSON.stringify(updated));
  };

  const handleReopenQuoteInCalculator = (quote) => {
    setProductCategory('flat');
    if (quote.quantity) setQuantity(Number(quote.quantity));
    if (quote.paperId) setSelectedPaperId(quote.paperId);
    if (quote.sheetId) setSelectedSheetId(quote.sheetId);
    if (quote.productW) setProductW(Number(quote.productW));
    if (quote.productH) setProductH(Number(quote.productH));
    if (quote.colors) setColors(quote.colors);
  };

  const handleResetClients = () => {
    setClients(DEFAULT_CLIENTS);
    localStorage.setItem('jetaflow_clients_v2', JSON.stringify(DEFAULT_CLIENTS));
  };

  const handleResetSuppliers = () => {
    setSuppliers(DEFAULT_SUPPLIERS);
    localStorage.setItem('jetaflow_suppliers_v2', JSON.stringify(DEFAULT_SUPPLIERS));
  };

  const handleResetBiddings = () => {
    setBiddings(DEFAULT_BIDDINGS);
    localStorage.setItem('jetaflow_biddings_v2', JSON.stringify(DEFAULT_BIDDINGS));
  };


  // Active Quote Parameters
  const [productCategory, setProductCategory] = useState('flat');
  const [selectedPaperId, setSelectedPaperId] = useState('paper-9'); // Couche 150g
  const [selectedSheetId, setSelectedSheetId] = useState('sra3');
  const [productW, setProductW] = useState(140);
  const [productH, setProductH] = useState(210);
  const [bleed, setBleed] = useState(2);
  const [colors, setColors] = useState('4/0');
  const [quantity, setQuantity] = useState(500);
  const [selectedFinishings, setSelectedFinishings] = useState([]);
  
  // Editorial Book / Catalog Parameters
  const [editorial, setEditorial] = useState({
    pagesCount: 32,
    mioloPaper: DEFAULT_PAPERS[2] || DEFAULT_PAPERS[0],
    coverPaper: DEFAULT_PAPERS[8] || DEFAULT_PAPERS[0],
    mioloColors: '1/1',
    coverColors: '4/0',
    flapW: 0,
    bindingMethod: 'lombada_quadrada'
  });

  // Large Format parameters
  const [largeFormat, setLargeFormat] = useState({
    widthM: 1.0,
    heightM: 1.0,
    materialPriceM2: 25.0
  });

  // Proposal Modal
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Selected Equipment & Paper
  const selectedEquipment = useMemo(() => {
    return equipments.find(e => e.id === selectedEquipmentId) || equipments[0];
  }, [equipments, selectedEquipmentId]);

  const selectedPaper = useMemo(() => {
    return papers.find(p => p.id === selectedPaperId) || papers[0];
  }, [papers, selectedPaperId]);

  const selectedSheet = useMemo(() => {
    return sheetSizes.find(s => s.id === selectedSheetId) || sheetSizes[0];
  }, [sheetSizes, selectedSheetId]);

  // Adjust Click Rates dynamically based on active Equipment if selected
  const activeDigitalClickRates = useMemo(() => {
    if (selectedEquipment.id === 'canon-gx7010') {
      return {
        ...digitalClickRates,
        clickColorSimplex: selectedEquipment.clickColor,
        clickColorDuplex: selectedEquipment.clickColorDuplex,
        clickMonoSimplex: selectedEquipment.clickMono,
        clickMonoDuplex: selectedEquipment.clickMonoDuplex,
        formatMultipliers: selectedEquipment.formatMultipliers || { a4: 1.0, a3: 2.0, sra3: 2.3, 'maxi-digital': 2.3 }
      };
    } else if (selectedEquipment.id === 'xerox-c8035') {
      return {
        ...digitalClickRates,
        clickColorSimplex: selectedEquipment.clickColor,
        clickColorDuplex: selectedEquipment.clickColorDuplex,
        clickMonoSimplex: selectedEquipment.clickMono,
        clickMonoDuplex: selectedEquipment.clickMonoDuplex,
        formatMultipliers: selectedEquipment.formatMultipliers || { a4: 1.0, a3: 2.0, sra3: 2.3, 'maxi-digital': 2.3, 'banner-digital': 3.5 }
      };
    }
    return {
      ...digitalClickRates,
      formatMultipliers: { a4: 1.0, a3: 2.0, sra3: 2.3, 'maxi-digital': 2.3, 'banner-digital': 3.5 }
    };
  }, [selectedEquipment, digitalClickRates]);

  // Current Budget Calculation
  const budgetConfig = useMemo(() => ({
    mode: activeTab === 'large_format' ? 'large_format' : activeTab === 'offset' ? 'offset' : 'digital',
    productCategory,
    quantity,
    paper: selectedPaper,
    sheetSize: selectedSheet,
    productW,
    productH,
    bleed,
    colors,
    digitalClickRates: activeDigitalClickRates,
    offsetSettings,
    finishings: selectedFinishings,
    financialConfig,
    largeFormat,
    editorial
  }), [
    activeTab, productCategory, quantity, selectedPaper, selectedSheet, productW, productH,
    bleed, colors, activeDigitalClickRates, offsetSettings, selectedFinishings,
    financialConfig, largeFormat, editorial
  ]);

  const budgetResult = useMemo(() => {
    return calculateBudget(budgetConfig);
  }, [budgetConfig]);

  const tierMatrix = useMemo(() => {
    const defaultTiers = [50, 100, 250, 500, 1000, 2500];
    if (!defaultTiers.includes(quantity)) {
      defaultTiers.push(quantity);
      defaultTiers.sort((a, b) => a - b);
    }
    return generateTierMatrix(budgetConfig, defaultTiers);
  }, [budgetConfig, quantity]);

  const handleResetDefaults = () => {
    setPapers(DEFAULT_PAPERS);
    setDigitalClickRates(DEFAULT_DIGITAL_CLICKS);
    setOffsetSettings(DEFAULT_OFFSET_SETTINGS);
    setAvailableFinishings(DEFAULT_FINISHINGS);
    setFinancialConfig(DEFAULT_FINANCIAL_CONFIG);
    setSelectedEquipmentId('xerox-c8035');
    setProductCategory('flat');
    setSelectedPaperId('paper-9');
    setSelectedSheetId('sra3');
    setProductW(140);
    setProductH(210);
    setBleed(2);
    setColors('4/0');
    setQuantity(500);
    setSelectedFinishings([]);
    localStorage.removeItem('jetaflow_papers');
    localStorage.removeItem('jetaflow_clicks');
    localStorage.removeItem('jetaflow_offset');
    localStorage.removeItem('jetaflow_finishings');
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px 40px 16px' }}>
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReset={handleResetDefaults}
      />

      {/* Main Workspace Tabs */}
      {activeTab === 'dashboard' ? (
        <DashboardOverview
          biddings={biddings}
          clients={clients}
          suppliers={suppliers}
          papers={papers}
          equipments={equipments}
          financialConfig={financialConfig}
          digitalClickRates={digitalClickRates}
          setActiveTab={setActiveTab}
        />
      ) : activeTab === 'settings' ? (
        <SettingsManager
          papers={papers}
          setPapers={setPapers}
          digitalClickRates={digitalClickRates}
          setDigitalClickRates={setDigitalClickRates}
          offsetSettings={offsetSettings}
          setOffsetSettings={setOffsetSettings}
          availableFinishings={availableFinishings}
          setAvailableFinishings={setAvailableFinishings}
          onResetDefaults={handleResetDefaults}
        />
      ) : activeTab === 'clients' ? (
        <ClientManager
          clients={clients}
          onAddClient={handleAddClient}
          onUpdateClient={handleUpdateClient}
          onDeleteClient={handleDeleteClient}
          onResetClients={handleResetClients}
        />
      ) : activeTab === 'suppliers' ? (
        <SupplierManager
          suppliers={suppliers}
          onAddSupplier={handleAddSupplier}
          onUpdateSupplier={handleUpdateSupplier}
          onDeleteSupplier={handleDeleteSupplier}
          onResetSuppliers={handleResetSuppliers}
        />
      ) : activeTab === 'biddings' ? (
        <LicitacaoManager
          biddings={biddings}
          clients={clients}
          onAddBidding={handleAddBidding}
          onUpdateBidding={handleUpdateBidding}
          onDeleteBidding={handleDeleteBidding}
          onResetBiddings={handleResetBiddings}
        />
      ) : activeTab === 'quotes' ? (
        <QuoteHistoryManager
          quotes={quotesHistory}
          onUpdateQuote={handleUpdateQuoteInHistory}
          onDeleteQuote={handleDeleteQuoteFromHistory}
          onOpenQuoteModal={(quote) => setIsQuoteModalOpen(true)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Section: Form Inputs & 2D Sheet Viewer */}
          {activeTab === 'digital' && productCategory === 'quotes_history' ? (
            <QuoteHistoryManager
              quotes={quotesHistory}
              onUpdateQuote={handleUpdateQuoteInHistory}
              onDeleteQuote={handleDeleteQuoteFromHistory}
              onOpenQuoteModal={(quote) => setIsQuoteModalOpen(true)}
              onReopenQuoteInCalculator={handleReopenQuoteInCalculator}
            />
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                
                {/* Left Column: Specific Calculator Inputs */}
                {activeTab === 'digital' && (
                  <DigitalCalculator
                    papers={papers}
                    sheetSizes={sheetSizes}
                    equipments={equipments}
                    selectedEquipmentId={selectedEquipmentId}
                    setSelectedEquipmentId={setSelectedEquipmentId}
                    selectedPaperId={selectedPaperId}
                    setSelectedPaperId={setSelectedPaperId}
                    selectedSheetId={selectedSheetId}
                    setSelectedSheetId={setSelectedSheetId}
                    productW={productW}
                    setProductW={setProductW}
                    productH={productH}
                    setProductH={setProductH}
                    bleed={bleed}
                    setBleed={setBleed}
                    colors={colors}
                    setColors={setColors}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    productCategory={productCategory}
                    setProductCategory={setProductCategory}
                    editorial={editorial}
                    setEditorial={setEditorial}
                    spineMm={budgetResult.spineMm || 0}
                  />
                )}

                {activeTab === 'offset' && (
                  <OffsetCalculator
                    papers={papers}
                    sheetSizes={sheetSizes}
                    selectedPaperId={selectedPaperId}
                    setSelectedPaperId={setSelectedPaperId}
                    selectedSheetId={selectedSheetId}
                    setSelectedSheetId={setSelectedSheetId}
                    productW={productW}
                    setProductW={setProductW}
                    productH={productH}
                    setProductH={setProductH}
                    bleed={bleed}
                    setBleed={setBleed}
                    colors={colors}
                    setColors={setColors}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    offsetSettings={offsetSettings}
                    setOffsetSettings={setOffsetSettings}
                  />
                )}

                {activeTab === 'large_format' && (
                  <LargeFormatCalculator
                    largeFormat={largeFormat}
                    setLargeFormat={setLargeFormat}
                    quantity={quantity}
                    setQuantity={setQuantity}
                  />
                )}

                {/* Right Column: Sheet Visualizer */}
                {activeTab !== 'large_format' && (
                  <SheetViewer
                    layout={budgetResult.layout}
                    sheetSize={selectedSheet}
                    productW={productCategory === 'editorial' ? ((2 * productW) + (budgetResult.spineMm || 0) + (2 * (editorial.flapW || 0))) : productW}
                    productH={productH}
                    bleed={bleed}
                  />
                )}

              </div>

              {/* Middle Section: Finishings */}
              <FinishingSelector
                availableFinishings={availableFinishings}
                selectedFinishings={selectedFinishings}
                setSelectedFinishings={setSelectedFinishings}
              />

              {/* Bottom Section: DRE Financial Breakdown & Tier Matrix */}
              <FinancialSummary
                budgetResult={budgetResult}
                tierMatrix={tierMatrix}
                financialConfig={financialConfig}
                setFinancialConfig={handleSetFinancialConfig}
                onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
              />
            </>
          )}

        </div>
      )}

      {/* Printable / Exportable Quote Proposal Modal */}
      {isQuoteModalOpen && (
        <QuoteGenerator
          budgetResult={budgetResult}
          selectedPaper={selectedPaper}
          selectedSheet={selectedSheet}
          productW={productW}
          productH={productH}
          colors={colors}
          mode={activeTab}
          selectedFinishings={selectedFinishings}
          clients={clients}
          onAddClient={handleAddClient}
          onClose={() => setIsQuoteModalOpen(false)}
        />
      )}

    </div>
  );
}

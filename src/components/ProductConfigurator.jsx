import React, { useState, useEffect, useMemo } from 'react';
import { calcularPreco } from '../utils/pricing';
import { CALENDAR_CONFIG } from '../data/productConfig';
import { AlertCircle, ShoppingCart, Tag, PackageSearch, BookmarkPlus, FileCheck, CheckCircle2 } from 'lucide-react';

export default function ProductConfigurator({
  papers = [],
  clients = [],
  selectedClientId = '',
  onSaveQuoteToHistory,
  onOpenProposal
}) {
  const productData = useMemo(() => {
    // Clone original config to avoid mutating
    const config = JSON.parse(JSON.stringify(CALENDAR_CONFIG));
    
    // Find base_paper and miolo_paper and replace their options with real papers
    const basePaperGroup = config.attribute_groups.find(g => g.id === 'base_paper');
    const mioloPaperGroup = config.attribute_groups.find(g => g.id === 'miolo_paper');
    
    // Filter heavy papers for base (>= 250g) and lighter for miolo (< 250g)
    const basePapers = papers.filter(p => p.weightGsm >= 250);
    const mioloPapers = papers.filter(p => p.weightGsm > 0 && p.weightGsm < 250);

    if (basePaperGroup && basePapers.length > 0) {
      basePaperGroup.options = basePapers.map(p => ({
        id: p.id,
        name: p.name,
        modifier_fixed: (p.pricePerSheetSra3 || 0) * 1.5, // Arbitrary markup for mockup
        modifier_pct: 0
      }));
      basePaperGroup.defaultOption = basePapers[0].id;
    }

    if (mioloPaperGroup && mioloPapers.length > 0) {
      mioloPaperGroup.options = mioloPapers.map(p => ({
        id: p.id,
        name: p.name,
        modifier_fixed: (p.pricePerSheetSra3 || 0) * 3, // Arbitrary markup for mockup (e.g. 3 sheets)
        modifier_pct: 0
      }));
      mioloPaperGroup.defaultOption = mioloPapers[0].id;
    }

    return config;
  }, [papers]);
  
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    if (Object.keys(selectedOptions).length === 0 && productData) {
      const initialOptions = {};
      productData.attribute_groups.forEach(group => {
        initialOptions[group.id] = group.defaultOption;
      });
      setSelectedOptions(initialOptions);
    }
  }, [productData, selectedOptions]);

  const [quantity, setQuantity] = useState(100);
  const [priceResult, setPriceResult] = useState({ unitPrice: 0, totalPrice: 0, discountPct: 0, error: null });

  useEffect(() => {
    const result = calcularPreco({ quantity, selectedOptions }, productData);
    setPriceResult(result);
  }, [quantity, selectedOptions, productData]);

  const handleOptionChange = (groupId, optionId) => {
    setSelectedOptions(prev => ({ ...prev, [groupId]: optionId }));
  };

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setQuantity(isNaN(val) ? 0 : val);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const [savedMsg, setSavedMsg] = useState(false);

  const optionName = (groupId) => {
    const group = productData.attribute_groups.find(g => g.id === groupId);
    if (!group) return '';
    const opt = group.options.find(o => o.id === selectedOptions[groupId]);
    return opt ? opt.name : '';
  };

  const configSummary = useMemo(() => (
    productData.attribute_groups
      .map(g => `${g.name}: ${optionName(g.id) || '—'}`)
      .join(' | ')
  ), [productData, selectedOptions]);

  const linkedClient = clients.find(c => c.id === selectedClientId) || null;

  const buildQuoteData = () => ({
    description: `${productData.name} — ${configSummary}`,
    paperName: optionName('base_paper') || optionName('miolo_paper') || '—',
    dimensions: optionName('base_format') || 'Formato personalizado',
    colors: '4/4',
    quantity: Number(quantity) || 0,
    totalValue: Number(priceResult.totalPrice) || 0,
    unitValue: Number(priceResult.unitPrice) || 0,
    finishingsSummary: configSummary,
    productType: 'configurable'
  });

  const handleSaveToHistory = () => {
    if (priceResult.error || !onSaveQuoteToHistory) return;
    onSaveQuoteToHistory(buildQuoteData());
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  const handleGenerateProposal = () => {
    if (priceResult.error || !onOpenProposal) return;
    onOpenProposal({
      ...buildQuoteData(),
      code: 'ORÇAMENTO',
      date: new Date().toLocaleDateString('pt-BR'),
      clientId: selectedClientId || '',
      clientName: linkedClient ? (linkedClient.tradeName || linkedClient.name) : 'Cliente Balcão',
      clientDoc: linkedClient ? linkedClient.doc : 'Não Informado'
    });
  };

  return (
    <div style={{
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
      gap: '24px',
      alignItems: 'start'
    }}>
      {/* Left Column: Configuration Form */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: 'var(--brand-magenta)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PackageSearch size={18} /> Configurar: {productData.name}
        </h3>

        {/* Quantity Field */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">
            Quantidade <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.85em', textTransform: 'none' }}>(Mínimo: {productData.min_order_qty})</span>
          </label>
          <input 
            type="number"
            className="form-input"
            min={productData.min_order_qty}
            max={productData.custom_qty_allowed ? undefined : productData.max_order_qty}
            value={quantity === 0 ? '' : quantity}
            onChange={handleQuantityChange}
            style={{ maxWidth: '200px', fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-cyan)' }}
          />
          {priceResult.error && (
            <div style={{ color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.15)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--danger)' }}>
              <AlertCircle size={14} />
              <span>{priceResult.error}</span>
            </div>
          )}
        </div>

        {/* Dynamic Attribute Groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {productData.attribute_groups.map(group => (
            <div key={group.id} className="form-group" style={{ background: 'var(--tint-hairline)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <label className="form-label" style={{ color: 'var(--text-main)' }}>
                {group.name}
              </label>
              
              <div style={{ display: 'grid', gap: '8px' }}>
                {group.options.map(option => {
                  const isSelected = selectedOptions[group.id] === option.id;
                  return (
                    <label key={option.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 14px',
                      border: isSelected ? '1px solid var(--brand-cyan)' : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(0, 168, 232, 0.1)' : 'var(--bg-input)',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 0 10px rgba(0, 168, 232, 0.2)' : 'none'
                    }}>
                      <input
                        type="radio"
                        name={group.id}
                        value={option.id}
                        checked={isSelected}
                        onChange={() => handleOptionChange(group.id, option.id)}
                        style={{ marginRight: '12px', accentColor: 'var(--brand-cyan)' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? '#ffffff' : 'var(--text-main)', fontSize: '0.9rem' }}>
                          {option.name}
                        </span>
                        {(option.modifier_fixed !== 0 || option.modifier_pct !== 0) && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {option.modifier_fixed > 0 ? '+' : ''}{option.modifier_fixed !== 0 ? formatCurrency(option.modifier_fixed) + ' / un ' : ''}
                            {option.modifier_pct > 0 ? '+' : ''}{option.modifier_pct !== 0 ? (option.modifier_pct * 100) + '%' : ''}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Summary & Price */}
      <div style={{ position: 'sticky', top: '24px' }}>
        <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, var(--panel-grad-2), var(--panel-grad-1))', border: '1px solid rgba(0, 168, 232, 0.3)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
            <ShoppingCart size={20} color="var(--brand-cyan)" /> Preço Final
          </h3>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <span>Preço Unitário:</span>
              <strong style={{ color: 'var(--text-strong)' }}>{formatCurrency(priceResult.unitPrice)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px dashed var(--border-color)', paddingTop: '16px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Custo Total:</span>
              <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--brand-cyan)', textShadow: '0 0 15px rgba(0, 168, 232, 0.4)' }}>
                {formatCurrency(priceResult.totalPrice)}
              </span>
            </div>
            
            {priceResult.discountPct > 0 && !priceResult.error && (
              <div style={{ 
                marginTop: '16px', 
                background: 'rgba(16, 185, 129, 0.15)', 
                color: '#34d399', 
                padding: '10px 14px', 
                borderRadius: '8px', 
                fontSize: '0.85rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontWeight: 'bold',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <Tag size={16} /> Economia de {(priceResult.discountPct * 100).toFixed(0)}% por unidade!
              </div>
            )}
          </div>

          {savedMsg && (
            <div style={{ marginBottom: '10px', fontSize: '0.8rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Salvo no Histórico de Orçamentos!
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              disabled={!!priceResult.error}
              onClick={handleSaveToHistory}
              style={{
                width: '100%',
                padding: '12px',
                background: priceResult.error ? 'var(--bg-input)' : 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(109, 40, 217, 0.35))',
                color: priceResult.error ? 'var(--text-muted)' : '#ffffff',
                border: priceResult.error ? '1px solid var(--border-color)' : '1px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: priceResult.error ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <BookmarkPlus size={16} /> Salvar no Histórico
            </button>

            <button
              type="button"
              disabled={!!priceResult.error}
              onClick={handleGenerateProposal}
              style={{
                width: '100%',
                padding: '14px',
                background: priceResult.error ? 'var(--bg-input)' : 'linear-gradient(135deg, var(--brand-cyan), #0077b6)',
                color: priceResult.error ? 'var(--text-muted)' : '#ffffff',
                border: priceResult.error ? '1px solid var(--border-color)' : 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: priceResult.error ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: priceResult.error ? 'none' : '0 4px 15px rgba(0, 168, 232, 0.4)'
              }}
            >
              <FileCheck size={16} /> {priceResult.error ? 'Verifique os Erros' : 'Gerar Proposta Comercial PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { DollarSign, PieChart, TrendingUp, FileCheck, Layers, ChevronDown, ChevronUp, Package, Printer, Scissors, Hash, Box, CheckSquare, Sparkles, BookmarkPlus, CheckCircle2 } from 'lucide-react';

export default function FinancialSummary({
  budgetResult,
  tierMatrix,
  financialConfig,
  setFinancialConfig,
  onOpenQuoteModal,
  onSaveQuoteToHistory
}) {
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(true);
  const [savedMsg, setSavedMsg] = useState(false);
  const costs = budgetResult ? budgetResult.costs : {};
  const finishingsDetail = budgetResult ? budgetResult.finishingsDetail || [] : [];
  const qty = budgetResult.quantity || 1;

  const handleQuickSave = () => {
    if (!onSaveQuoteToHistory || !budgetResult) return;

    const quoteData = {
      clientName: 'Cliente Balcão',
      clientDoc: 'Não Informado',
      description: `Produção Gráfica — ${qty.toLocaleString()} un`,
      paperName: 'Couché 150g',
      dimensions: 'Formato Personalizado',
      quantity: qty,
      totalValue: Number(costs.finalPrice || 0)
    };

    onSaveQuoteToHistory(quoteData);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  // Percentage distribution calculations
  const direct = costs.directCost || 1;
  const paperPct = Math.min(100, Math.round(((costs.paperCost || 0) / direct) * 100));
  const printPct = Math.min(100, Math.round(((costs.printCost || 0) / direct) * 100));
  const finishPct = Math.max(0, 100 - paperPct - printPct);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Cards de Destaque Financeiro */}
      <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(0, 168, 232, 0.3)', background: 'linear-gradient(135deg, rgba(23, 53, 91, 0.4), rgba(15, 23, 42, 0.8))' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={22} color="var(--brand-cyan)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Formação do Preço de Venda
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {savedMsg && (
              <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} /> Salvo no Histórico!
              </span>
            )}

            <button
              onClick={handleQuickSave}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(109, 40, 217, 0.3))',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <BookmarkPlus size={16} color="#a78bfa" />
              Salvar no Histórico
            </button>

            <button
              onClick={onOpenQuoteModal}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--brand-cyan), #0077b6)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0, 168, 232, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <FileCheck size={18} />
              Gerar Proposta Comercial PDF
            </button>
          </div>
        </div>

        {/* Big Numbers Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          
          {/* Preço de Venda Total */}
          <div style={{ background: 'rgba(0, 168, 232, 0.1)', border: '1px solid rgba(0, 168, 232, 0.3)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-cyan)', textTransform: 'uppercase' }}>
              Preço Total de Venda
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
              R$ {Number(costs.finalPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Para {qty} unidade(s)
            </div>
          </div>

          {/* Valor Unitário */}
          <div style={{ background: 'rgba(230, 46, 107, 0.1)', border: '1px solid rgba(230, 46, 107, 0.3)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-magenta)', textTransform: 'uppercase' }}>
              Preço por Unidade
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
              R$ {Number(costs.unitPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Custo unitário: R$ {Number(costs.unitCost || 0).toFixed(2)}
            </div>
          </div>

          {/* Lucro Bruto Previsto */}
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase' }}>
              Lucro Líquido Previsto
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
              R$ {Number(costs.profitVal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Margem líquida de {financialConfig.desiredProfitPercent}%
            </div>
          </div>

          {/* Custo Industrial Total */}
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Custo Industrial Total
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
              R$ {Number(costs.totalIndustrialCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Papel + Impressão + Acabamento + Rateio
            </div>
          </div>

        </div>
      </div>

      {/* Detalhamento de Custos Diretos & Configuração de Margens */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        
        {/* REFINADO: DRE DE CUSTOS DIRETO, QUANTIDADES & REFILE */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={18} color="var(--brand-cyan)" />
              Detalhamento de Custos Diretos & Produção
            </h4>
            
            <button
              onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--brand-cyan)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {showDetailedBreakdown ? 'Ocultar Itens' : 'Ver Todos os Itens'}
              {showDetailedBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* BOX DE ENGENHARIA DE QUANTIDADES & REFILE */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(23, 53, 91, 0.6), rgba(13, 21, 37, 0.9))',
            border: '1px solid rgba(0, 168, 232, 0.3)',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '16px'
          }}>
            <h5 style={{ fontSize: '0.8rem', color: 'var(--brand-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Box size={14} /> Engenharia de Papel, Folhas & Refile:
            </h5>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', fontSize: '0.8rem' }}>
              
              {/* Quantidade Solicitada */}
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Quantidade Desejada:</div>
                <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{qty.toLocaleString()} un</strong>
              </div>

              {/* Folhas de Impressão (Entrada Máquina) */}
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Folhas de Impressão:</div>
                <strong style={{ fontSize: '1rem', color: 'var(--brand-cyan)' }}>{budgetResult.grossSheets || 0} fls</strong>
              </div>

              {/* Folhas Inteiras de Compra (Resma Mãe) */}
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Folhas Resma (Mãe):</div>
                <strong style={{ fontSize: '1rem', color: 'var(--brand-yellow)' }}>{budgetResult.remaFullSheets || 0} fls inteiras</strong>
              </div>

              {/* Quantidade de Peças Finais após Refile */}
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Peças Cortadas (Refile):</div>
                <strong style={{ fontSize: '1rem', color: 'var(--success)' }}>{budgetResult.totalRefiledPieces || qty} peças</strong>
              </div>

            </div>
          </div>

          {/* Barra Visual de Distribuição do Custo Direto */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Distribuição do Custo Direto:</span>
              <span>R$ {Number(costs.directCost || 0).toFixed(2)}</span>
            </div>
            
            <div style={{ height: '10px', borderRadius: '5px', background: 'var(--bg-input)', display: 'flex', overflow: 'hidden' }}>
              <div style={{ width: `${paperPct}%`, background: 'var(--brand-navy)' }} />
              <div style={{ width: `${printPct}%`, background: 'var(--brand-cyan)' }} />
              <div style={{ width: `${finishPct}%`, background: 'var(--brand-magenta)' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--brand-navy)', borderRadius: '50%' }} /> Papel ({paperPct}%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--brand-cyan)', borderRadius: '50%' }} /> Impressão ({printPct}%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--brand-magenta)', borderRadius: '50%' }} /> Acabamentos ({finishPct}%)
              </span>
            </div>
          </div>

          {/* Tabela Granular Discriminada */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            
            {/* Custo de Substrato / Papel */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={14} color="var(--brand-yellow)" /> 1. Substrato / Papel
                </span>
                <strong style={{ color: 'var(--text-main)' }}>R$ {Number(costs.paperCost || 0).toFixed(2)}</strong>
              </div>

              {showDetailedBreakdown && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', paddingLeft: '20px' }}>
                  • {budgetResult.grossSheets || 0} folhas de impressão ({budgetResult.remaFullSheets || 0} folhas inteiras de compra).<br />
                  • Custo por folha: R$ {((costs.paperCost || 0) / Math.max(1, budgetResult.grossSheets || 1)).toFixed(4)}/fl.
                </div>
              )}
            </div>

            {/* Custo de Impressão / Cliques / Chapas */}
            <div style={{ background: 'rgba(0, 168, 232, 0.04)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0, 168, 232, 0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Printer size={14} color="var(--brand-cyan)" /> 2. Impressão, Cliques & Matrizes
                </span>
                <strong style={{ color: 'var(--brand-cyan)' }}>R$ {Number(costs.printCost || 0).toFixed(2)}</strong>
              </div>

              {showDetailedBreakdown && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', paddingLeft: '20px' }}>
                  • {budgetResult.grossSheets || 0} passadas de máquina (folhas brutas).<br />
                  {costs.clickRate > 0 && (
                    <>• Custo efetivo por clique: <strong>R$ {Number(costs.clickRate).toFixed(3)}</strong>/folha (Fator formato: {costs.formatFactor || 1.0}x).<br /></>
                  )}
                  • Custo de impressão unitário por produto: R$ {((costs.printCost || 0) / qty).toFixed(4)}/un.
                </div>
              )}
            </div>

            {/* Custo de Acabamentos Discriminados Um a Um */}
            <div style={{ background: 'rgba(230, 46, 107, 0.04)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(230, 46, 107, 0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Scissors size={14} color="var(--brand-magenta)" /> 3. Acabamentos ({finishingsDetail.length} selecionado(s))
                </span>
                <strong style={{ color: 'var(--brand-magenta)' }}>R$ {Number(costs.finishingsCost || 0).toFixed(2)}</strong>
              </div>

              {showDetailedBreakdown && finishingsDetail.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '12px' }}>
                  {finishingsDetail.map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px dashed var(--border-color)', paddingBottom: '2px' }}>
                      <span>• {f.name.replace('Positiva - ', '').replace('JetaPrint - ', '').replace('BannerCut Pro - ', '')}</span>
                      <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>R$ {Number(f.calculatedTotal || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resumo Consolidado DRE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '8px', fontWeight: 700 }}>
              <span>= Custo Direto de Produção:</span>
              <span style={{ color: 'var(--brand-cyan)' }}>R$ {Number(costs.directCost || 0).toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>+ Perda Técnica ({financialConfig.technicalLossPercent}%):</span>
              <span>R$ {Number(costs.techLossVal || 0).toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>+ Rateio de Custo Fixo ({financialConfig.fixedOverheadPercent}%):</span>
              <span>R$ {Number(costs.fixedOverheadVal || 0).toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-input)', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 800, border: '1px solid var(--border-color)' }}>
              <span style={{ color: '#ffffff' }}>= Custo Industrial Total:</span>
              <span style={{ color: 'var(--brand-yellow)' }}>R$ {Number(costs.totalIndustrialCost || 0).toFixed(2)}</span>
            </div>

            {/* DRE de Deduções do Preço Final (Por Dentro) */}
            <div style={{ marginTop: '8px', background: 'rgba(0, 168, 232, 0.05)', borderRadius: '8px', padding: '10px 12px', border: '1px border-color' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-cyan)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Formação por Dentro (Divisor Markup {costs.effectiveDivisor}):
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>+ Imposto ({costs.taxTypeName}):</span>
                <span style={{ color: 'var(--brand-magenta)' }}>R$ {Number(costs.taxVal || 0).toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>+ Comissão de Venda ({financialConfig.salesCommissionPercent}%):</span>
                <span>R$ {Number(costs.commissionVal || 0).toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>+ Lucro Líquido Real ({financialConfig.desiredProfitPercent}%):</span>
                <span style={{ color: 'var(--success)' }}>R$ {Number(costs.profitVal || 0).toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: '#ffffff', borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '6px' }}>
                <span>= Preço de Venda Final:</span>
                <span style={{ color: 'var(--brand-cyan)' }}>R$ {Number(costs.finalPrice || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ajuste Dinâmico de Margens & Impostos */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--brand-yellow)" />
            Regime Tributário & Divisor Markup
          </h4>

          {/* Seleção do Tipo de Nota / Tributação */}
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontWeight: 700, color: 'var(--brand-cyan)' }}>
              Tipo de Nota / Segregação de Impostos:
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setFinancialConfig({ ...financialConfig, taxType: 'product', taxSimplesPercent: financialConfig.taxProductPercent || 3.0 })}
                style={{
                  padding: '10px 8px',
                  borderRadius: '8px',
                  border: (financialConfig.taxType === 'product' || !financialConfig.taxType) ? '2px solid var(--brand-cyan)' : '1px solid var(--border-color)',
                  background: (financialConfig.taxType === 'product' || !financialConfig.taxType) ? 'rgba(0, 168, 232, 0.2)' : 'var(--bg-input)',
                  color: (financialConfig.taxType === 'product' || !financialConfig.taxType) ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                📦 Produto (3,0%)
              </button>

              <button
                type="button"
                onClick={() => setFinancialConfig({ ...financialConfig, taxType: 'service', taxSimplesPercent: financialConfig.taxServicePercent || 6.0 })}
                style={{
                  padding: '10px 8px',
                  borderRadius: '8px',
                  border: financialConfig.taxType === 'service' ? '2px solid var(--brand-magenta)' : '1px solid var(--border-color)',
                  background: financialConfig.taxType === 'service' ? 'rgba(230, 46, 107, 0.2)' : 'var(--bg-input)',
                  color: financialConfig.taxType === 'service' ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                ⚙️ Serviço ISS (6,0%)
              </button>

              <button
                type="button"
                onClick={() => setFinancialConfig({ ...financialConfig, taxType: 'custom' })}
                style={{
                  padding: '10px 8px',
                  borderRadius: '8px',
                  border: financialConfig.taxType === 'custom' ? '2px solid var(--brand-yellow)' : '1px solid var(--border-color)',
                  background: financialConfig.taxType === 'custom' ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-input)',
                  color: financialConfig.taxType === 'custom' ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                ✏️ Personalizado
              </button>
            </div>
          </div>

          {/* Form Inputs com Alíquotas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            
            <div className="form-group">
              <label className="form-label">Alíquota Produto - Anexo II (%)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={financialConfig.taxProductPercent !== undefined ? financialConfig.taxProductPercent : 3.0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setFinancialConfig({
                    ...financialConfig,
                    taxProductPercent: val,
                    ...(financialConfig.taxType === 'product' ? { taxSimplesPercent: val } : {})
                  });
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alíquota Serviço - ISS (%)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={financialConfig.taxServicePercent !== undefined ? financialConfig.taxServicePercent : 6.0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setFinancialConfig({
                    ...financialConfig,
                    taxServicePercent: val,
                    ...(financialConfig.taxType === 'service' ? { taxSimplesPercent: val } : {})
                  });
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Perda Técnica (%)</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                value={financialConfig.technicalLossPercent}
                onChange={(e) => setFinancialConfig({ ...financialConfig, technicalLossPercent: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Custo Fixo Rateio (%)</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                value={financialConfig.fixedOverheadPercent}
                onChange={(e) => setFinancialConfig({ ...financialConfig, fixedOverheadPercent: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Comissão de Venda (%)</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                value={financialConfig.salesCommissionPercent}
                onChange={(e) => setFinancialConfig({ ...financialConfig, salesCommissionPercent: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--success)' }}>
                Margem Lucro Líquido (%)
              </label>
              <input
                type="number"
                step="1"
                className="form-input"
                style={{ fontWeight: 700, borderColor: 'var(--success)' }}
                value={financialConfig.desiredProfitPercent}
                onChange={(e) => setFinancialConfig({ ...financialConfig, desiredProfitPercent: parseFloat(e.target.value) || 0 })}
              />
            </div>

          </div>

          {/* Resumo do Cálculo "Por Dentro" (Markup por Divisor) */}
          <div style={{
            marginTop: '14px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(23, 53, 91, 0.4))',
            border: '1px solid rgba(0, 168, 232, 0.3)',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '0.8rem'
          }}>
            <div style={{ fontWeight: 700, color: 'var(--brand-cyan)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} /> Metodologia: Markup por Divisor ("Por Dentro")
            </div>
            <div style={{ color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Fórmula: <code>Preço Final = Custo Industrial / Divisor Efetivo</code><br />
              • Divisor Efetivo: <strong style={{ color: '#ffffff' }}>{costs.effectiveDivisor}</strong> <i>(100% - {costs.taxPct}% Imposto - {financialConfig.salesCommissionPercent}% Comis. - {financialConfig.desiredProfitPercent}% Lucro)</i><br />
              • Multiplicador Equivalente: <strong style={{ color: 'var(--brand-yellow)' }}>{costs.markupMultiplier}x</strong> sobre Custo Industrial.
            </div>
          </div>
        </div>

      </div>

      {/* Tabela Comparativa de Escala de Tiragens */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--brand-cyan)" />
          Matriz Comparativa de Tiragens (Escala de Quantidades)
        </h4>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>Quantidade</th>
                <th style={{ padding: '10px 12px' }}>Custo Industrial</th>
                <th style={{ padding: '10px 12px' }}>Preço Total Venda</th>
                <th style={{ padding: '10px 12px' }}>Preço Unitário</th>
                <th style={{ padding: '10px 12px' }}>Lucro Gerado</th>
              </tr>
            </thead>
            <tbody>
              {tierMatrix.map((tier) => {
                const isCurrent = tier.qty === qty;
                return (
                  <tr
                    key={tier.qty}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      background: isCurrent ? 'rgba(0, 168, 232, 0.15)' : 'transparent',
                      fontWeight: isCurrent ? 700 : 400
                    }}
                  >
                    <td style={{ padding: '10px 12px', color: isCurrent ? 'var(--brand-cyan)' : 'var(--text-main)' }}>
                      {tier.qty.toLocaleString()} un {isCurrent ? '(Atual)' : ''}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      R$ {tier.totalIndustrialCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--brand-cyan)' }}>
                      R$ {tier.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--brand-magenta)' }}>
                      R$ {tier.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--success)' }}>
                      R$ {tier.profitVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

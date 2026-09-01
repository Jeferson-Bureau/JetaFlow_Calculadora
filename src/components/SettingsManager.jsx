import React, { useState } from 'react';
import { Sliders, Save, RotateCcw, Plus, Trash2, Layers, Cpu, Scissors } from 'lucide-react';

export default function SettingsManager({
  papers,
  setPapers,
  digitalClickRates,
  setDigitalClickRates,
  offsetSettings,
  setOffsetSettings,
  availableFinishings,
  setAvailableFinishings,
  onResetDefaults
}) {
  const [activeSubTab, setActiveSubTab] = useState('papers');
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const saveToStorage = () => {
    localStorage.setItem('jetaflow_papers', JSON.stringify(papers));
    localStorage.setItem('jetaflow_clicks', JSON.stringify(digitalClickRates));
    localStorage.setItem('jetaflow_offset', JSON.stringify(offsetSettings));
    localStorage.setItem('jetaflow_finishings', JSON.stringify(availableFinishings));
    
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 3000);
  };

  const handlePaperChange = (id, field, value) => {
    setPapers(papers.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, [field]: value };
      
      // Recalculate derivative sheet prices if rema price or rema fls changed
      if (field === 'remaPrice' || field === 'remaFls') {
        const rPrice = parseFloat(field === 'remaPrice' ? value : p.remaPrice) || 0;
        const rFls = parseFloat(field === 'remaFls' ? value : p.remaFls) || 1;
        const fullSheetPrice = rPrice / rFls;
        
        let sra3Price = fullSheetPrice / 4;
        if (p.format === 'A4') sra3Price = fullSheetPrice * 2;
        
        const gsm = p.weightGsm || 150;
        const area = (p.format === '64x88') ? (0.64 * 0.88) : (0.66 * 0.96);
        const weightSheetKg = area * (gsm / 1000);
        const priceKg = weightSheetKg > 0 ? fullSheetPrice / weightSheetKg : 0;

        updated.pricePerFullSheet = Math.round(fullSheetPrice * 10000) / 10000;
        updated.pricePerSheetSra3 = Math.round(sra3Price * 10000) / 10000;
        updated.pricePerKg = Math.round(priceKg * 100) / 100;
      }
      return updated;
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={22} color="var(--brand-cyan)" />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              Gerenciador de Insumos & Custos Gráficos
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Tabela de Papéis/Resmas da JETAPRINT + Parâmetros de Cliques, Chapas e Acabamentos.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={saveToStorage}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--success), #059669)',
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Save size={16} /> Salvar Preços
          </button>
          
          <button
            onClick={onResetDefaults}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-input)',
              color: 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={16} /> Restaurar Padrão
          </button>
        </div>
      </div>

      {showSavedMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--success)', borderRadius: '10px', color: 'var(--success)', fontWeight: 700 }}>
          ✓ Preços e configurações de insumos salvos com sucesso!
        </div>
      )}

      {/* Subtabs Header */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveSubTab('papers')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'papers' ? 'var(--brand-cyan)' : 'transparent',
            color: activeSubTab === 'papers' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Layers size={16} /> Tabela de Papéis (Resma / Kg)
        </button>

        <button
          onClick={() => setActiveSubTab('digital')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'digital' ? 'var(--brand-cyan)' : 'transparent',
            color: activeSubTab === 'digital' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          Cliques Digitais
        </button>

        <button
          onClick={() => setActiveSubTab('offset')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'offset' ? 'var(--brand-cyan)' : 'transparent',
            color: activeSubTab === 'offset' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Cpu size={16} /> Parâmetros Offset
        </button>

        <button
          onClick={() => setActiveSubTab('finishings')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeSubTab === 'finishings' ? 'var(--brand-cyan)' : 'transparent',
            color: activeSubTab === 'finishings' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Scissors size={16} /> Acabamentos
        </button>
      </div>

      {/* Subtab Content: Papéis */}
      {activeSubTab === 'papers' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
            Planilha Oficial JETAPRINT - Custos de Papel & Resmas
          </h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Papel / Gramatura / Marca</th>
                  <th style={{ padding: '10px' }}>Formato</th>
                  <th style={{ padding: '10px' }}>Fls/Resma</th>
                  <th style={{ padding: '10px' }}>Preço Resma (R$)</th>
                  <th style={{ padding: '10px' }}>Custo Folha Inteira</th>
                  <th style={{ padding: '10px' }}>Custo SRA3</th>
                  <th style={{ padding: '10px' }}>Custo/Kg (R$)</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '10px' }}>{p.format || '66x96'}</td>
                    <td style={{ padding: '10px' }}>
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: '80px' }}
                        value={p.remaFls || 250}
                        onChange={(e) => handlePaperChange(p.id, 'remaFls', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '10px' }}>
                      <input
                        type="number"
                        step="0.10"
                        className="form-input"
                        style={{ width: '110px', fontWeight: 700, color: 'var(--brand-cyan)' }}
                        value={p.remaPrice || 0}
                        onChange={(e) => handlePaperChange(p.id, 'remaPrice', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '10px' }}>
                      R$ {Number(p.pricePerFullSheet || (p.remaPrice / (p.remaFls || 1))).toFixed(4)}
                    </td>
                    <td style={{ padding: '10px', color: 'var(--brand-yellow)', fontWeight: 600 }}>
                      R$ {Number(p.pricePerSheetSra3 || 0).toFixed(4)}
                    </td>
                    <td style={{ padding: '10px' }}>
                      R$ {Number(p.pricePerKg || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab Content: Cliques Digitais */}
      {activeSubTab === 'digital' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              Valores por Clique Base (Formato A4) — Xerox AltaLink C8035
            </h4>
            <span style={{ fontSize: '0.75rem', background: 'rgba(0, 168, 232, 0.1)', color: 'var(--brand-cyan)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(0, 168, 232, 0.2)' }}>
              Maringá/PR • Equipamento Próprio
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            
            <div className="form-group">
              <label className="form-label">Colorido Frente (4/0) - A4 (R$/Clique)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                style={{ fontWeight: 700, color: 'var(--brand-cyan)' }}
                value={digitalClickRates.clickColorSimplex}
                onChange={(e) => setDigitalClickRates({ ...digitalClickRates, clickColorSimplex: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Colorido Frente e Verso (4/4) - A4 (R$/Clique)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                style={{ fontWeight: 700, color: 'var(--brand-cyan)' }}
                value={digitalClickRates.clickColorDuplex}
                onChange={(e) => setDigitalClickRates({ ...digitalClickRates, clickColorDuplex: parseFloat(e.target.value) || 0 })}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>2x o clique face (4/0 + 4/0)</span>
            </div>

            <div className="form-group">
              <label className="form-label">PB Frente (1/0) - A4 (R$/Clique)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={digitalClickRates.clickMonoSimplex}
                onChange={(e) => setDigitalClickRates({ ...digitalClickRates, clickMonoSimplex: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">PB Frente e Verso (1/1) - A4 (R$/Clique)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={digitalClickRates.clickMonoDuplex}
                onChange={(e) => setDigitalClickRates({ ...digitalClickRates, clickMonoDuplex: parseFloat(e.target.value) || 0 })}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>2x o clique face (1/0 + 1/0)</span>
            </div>

            <div className="form-group">
              <label className="form-label">Tinta Grande Formato (R$/m²)</label>
              <input
                type="number"
                step="1"
                className="form-input"
                value={digitalClickRates.largeFormatM2Tinta}
                onChange={(e) => setDigitalClickRates({ ...digitalClickRates, largeFormatM2Tinta: parseFloat(e.target.value) || 0 })}
              />
            </div>

          </div>

          {/* Tabela de Conversão Dinâmica por Formato */}
          <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-light)' }}>
              📊 Tabela de Custo Efetivo por Formato de Folha (Multiplicador Automático)
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '6px' }}>Formato da Folha</th>
                  <th style={{ padding: '6px' }}>Fator</th>
                  <th style={{ padding: '6px' }}>Preto 1/0</th>
                  <th style={{ padding: '6px' }}>Preto 1/1 (Duplex)</th>
                  <th style={{ padding: '6px' }}>Colorido 4/0</th>
                  <th style={{ padding: '6px' }}>Colorido 4/4 (Duplex)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '6px', fontWeight: 600 }}>A4 Padronizado (210 x 297 mm)</td>
                  <td style={{ padding: '6px', color: 'var(--text-muted)' }}>1,0x</td>
                  <td style={{ padding: '6px' }}>R$ {(digitalClickRates.clickMonoSimplex || 0.10).toFixed(2)}</td>
                  <td style={{ padding: '6px' }}>R$ {(digitalClickRates.clickMonoDuplex || 0.20).toFixed(2)}</td>
                  <td style={{ padding: '6px', color: 'var(--brand-cyan)' }}>R$ {(digitalClickRates.clickColorSimplex || 0.44).toFixed(2)}</td>
                  <td style={{ padding: '6px', color: 'var(--brand-cyan)' }}>R$ {(digitalClickRates.clickColorDuplex || 0.88).toFixed(2)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '6px', fontWeight: 600 }}>A3 Padrão (297 x 420 mm)</td>
                  <td style={{ padding: '6px', color: 'var(--text-muted)' }}>2,0x</td>
                  <td style={{ padding: '6px' }}>R$ {((digitalClickRates.clickMonoSimplex || 0.10) * 2).toFixed(2)}</td>
                  <td style={{ padding: '6px' }}>R$ {((digitalClickRates.clickMonoDuplex || 0.20) * 2).toFixed(2)}</td>
                  <td style={{ padding: '6px', color: 'var(--brand-cyan)' }}>R$ {((digitalClickRates.clickColorSimplex || 0.44) * 2).toFixed(2)}</td>
                  <td style={{ padding: '6px', color: 'var(--brand-cyan)' }}>R$ {((digitalClickRates.clickColorDuplex || 0.88) * 2).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px', fontWeight: 700, color: 'var(--brand-yellow)' }}>SRA3 / Super A3 (Gráfica Rápida)</td>
                  <td style={{ padding: '6px', color: 'var(--brand-yellow)', fontWeight: 700 }}>2,3x</td>
                  <td style={{ padding: '6px' }}>R$ {((digitalClickRates.clickMonoSimplex || 0.10) * 2.3).toFixed(2)}</td>
                  <td style={{ padding: '6px' }}>R$ {((digitalClickRates.clickMonoDuplex || 0.20) * 2.3).toFixed(2)}</td>
                  <td style={{ padding: '6px', color: 'var(--brand-cyan)', fontWeight: 700 }}>R$ {((digitalClickRates.clickColorSimplex || 0.44) * 2.3).toFixed(2)}</td>
                  <td style={{ padding: '6px', color: 'var(--brand-cyan)', fontWeight: 700 }}>R$ {((digitalClickRates.clickColorDuplex || 0.88) * 2.3).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab Content: Offset */}
      {activeSubTab === 'offset' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
            Parâmetros da Impressora Off-set e Chapas CTP
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            
            <div className="form-group">
              <label className="form-label">Preço por Chapa CTP (R$)</label>
              <input
                type="number"
                step="1"
                className="form-input"
                value={offsetSettings.ctpPlatePrice}
                onChange={(e) => setOffsetSettings({ ...offsetSettings, ctpPlatePrice: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Folhas de Acerto (Make-ready)</label>
              <input
                type="number"
                step="10"
                className="form-input"
                value={offsetSettings.makeReadySheets}
                onChange={(e) => setOffsetSettings({ ...offsetSettings, makeReadySheets: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Custo por 1.000 Giros (R$)</label>
              <input
                type="number"
                step="1"
                className="form-input"
                value={offsetSettings.costPerThousandTurns}
                onChange={(e) => setOffsetSettings({ ...offsetSettings, costPerThousandTurns: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Taxa Mínima de Rodagem (R$)</label>
              <input
                type="number"
                step="5"
                className="form-input"
                value={offsetSettings.minTurnFee}
                onChange={(e) => setOffsetSettings({ ...offsetSettings, minTurnFee: parseFloat(e.target.value) || 0 })}
              />
            </div>

          </div>
        </div>
      )}

      {/* Subtab Content: Acabamentos */}
      {activeSubTab === 'finishings' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>
            Tabela de Acabamentos e Matrizes
          </h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Nome do Acabamento</th>
                  <th style={{ padding: '10px' }}>Preço Unitário / Folha (R$)</th>
                  <th style={{ padding: '10px' }}>Custo de Setup / Faca (R$)</th>
                </tr>
              </thead>
              <tbody>
                {availableFinishings.map((f) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{f.name}</td>
                    <td style={{ padding: '10px' }}>
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        style={{ width: '110px' }}
                        value={f.unitCost || f.pricePerM2Milheiro || 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setAvailableFinishings(availableFinishings.map(item => item.id === f.id ? { ...item, unitCost: val, pricePerM2Milheiro: val } : item));
                        }}
                      />
                    </td>
                    <td style={{ padding: '10px' }}>
                      <input
                        type="number"
                        step="1"
                        className="form-input"
                        style={{ width: '110px' }}
                        value={f.setupCost || 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setAvailableFinishings(availableFinishings.map(item => item.id === f.id ? { ...item, setupCost: val } : item));
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

import React from 'react';
import { Cpu, Layers, Palette, Hash, Box, AlertTriangle } from 'lucide-react';

export default function OffsetCalculator({
  papers,
  sheetSizes,
  selectedPaperId,
  setSelectedPaperId,
  selectedSheetId,
  setSelectedSheetId,
  productW,
  setProductW,
  productH,
  setProductH,
  bleed,
  setBleed,
  colors,
  setColors,
  quantity,
  setQuantity,
  offsetSettings,
  setOffsetSettings
}) {
  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={20} color="var(--brand-magenta)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
            Parâmetros da Impressão Off-set (Produção Industrial)
          </h2>
        </div>
        <span style={{ fontSize: '0.75rem', background: 'rgba(230, 46, 107, 0.15)', color: 'var(--brand-magenta)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
          Grandes Rodagens
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Substrato / Papel de Compra */}
        <div className="form-group">
          <label className="form-label">
            <Layers size={14} /> Papel (Custo por Kg / Rema)
          </label>
          <select
            className="form-select"
            value={selectedPaperId}
            onChange={(e) => setSelectedPaperId(e.target.value)}
          >
            {papers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - (R$ {Number(p.pricePerKg || 15).toFixed(2)}/kg)
              </option>
            ))}
          </select>
        </div>

        {/* Formato de Máquina Offset */}
        <div className="form-group">
          <label className="form-label">
            <Box size={14} /> Formato de Folha Inteira (Compra)
          </label>
          <select
            className="form-select"
            value={selectedSheetId}
            onChange={(e) => setSelectedSheetId(e.target.value)}
          >
            {sheetSizes.filter(s => s.id.startsWith('full-') || s.id === 'sra3').map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cores / Chapas CTP */}
        <div className="form-group">
          <label className="form-label">
            <Palette size={14} /> Cores (Chapagem CTP)
          </label>
          <select
            className="form-select"
            value={colors}
            onChange={(e) => setColors(e.target.value)}
          >
            <option value="4/0">4/0 - Quadricromia Frente (4 Chapas)</option>
            <option value="4/4">4/4 - Quadricromia Frente e Verso (8 Chapas)</option>
            <option value="1/0">1/0 - Monocromático Frente (1 Chapa)</option>
            <option value="1/1">1/1 - Monocromático Frente e Verso (2 Chapas)</option>
          </select>
        </div>

        {/* Tiragem */}
        <div className="form-group">
          <label className="form-label">
            <Hash size={14} /> Tiragem / Quantidade
          </label>
          <input
            type="number"
            min="100"
            className="form-input"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>

      </div>

      {/* Dimensões do Produto */}
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Tamanho do Produto Final (mm)
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          
          <div className="form-group">
            <label className="form-label">Largura (mm)</label>
            <input
              type="number"
              className="form-input"
              value={productW}
              onChange={(e) => setProductW(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Altura (mm)</label>
            <input
              type="number"
              className="form-input"
              value={productH}
              onChange={(e) => setProductH(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Sangria (mm)</label>
            <input
              type="number"
              className="form-input"
              value={bleed}
              onChange={(e) => setBleed(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>

          {/* Acerto de Máquina / Make-Ready */}
          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--brand-yellow)' }}>
              <AlertTriangle size={14} /> Folhas de Acerto
            </label>
            <input
              type="number"
              className="form-input"
              value={offsetSettings.makeReadySheets || 200}
              onChange={(e) => setOffsetSettings({ ...offsetSettings, makeReadySheets: Math.max(0, parseInt(e.target.value) || 0) })}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

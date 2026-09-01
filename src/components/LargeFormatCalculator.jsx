import React from 'react';
import { Layers, Maximize2, Hash, DollarSign } from 'lucide-react';

export default function LargeFormatCalculator({
  largeFormat,
  setLargeFormat,
  quantity,
  setQuantity
}) {
  const areaM2 = (Number(largeFormat.widthM || 1) * Number(largeFormat.heightM || 1)).toFixed(2);
  const totalM2 = (areaM2 * quantity).toFixed(2);

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={20} color="var(--brand-yellow)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
            Comunicação Visual & Grande Formato (m²)
          </h2>
        </div>
        <span style={{ fontSize: '0.75rem', background: 'rgba(247, 181, 0, 0.15)', color: 'var(--brand-yellow)', padding: '4px 8px', borderRadius: '6px', fontWeight: 700 }}>
          Banners, Lonas e Adesivos
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        
        {/* Substrato Grande Formato */}
        <div className="form-group">
          <label className="form-label">Material / Mídia</label>
          <select
            className="form-select"
            value={largeFormat.materialPriceM2}
            onChange={(e) => setLargeFormat({ ...largeFormat, materialPriceM2: parseFloat(e.target.value) })}
          >
            <option value="25.00">Lona Frontlight 440g (R$ 25,00/m²)</option>
            <option value="28.00">Vinil Adesivo Brilho/Fosco (R$ 28,00/m²)</option>
            <option value="35.00">Vinil Microperfurado (R$ 35,00/m²)</option>
            <option value="42.00">Lona Backlight Translúcida (R$ 42,00/m²)</option>
            <option value="55.00">Tecido Canvas 100% Algodão (R$ 55,00/m²)</option>
          </select>
        </div>

        {/* Largura (Metros) */}
        <div className="form-group">
          <label className="form-label">
            <Maximize2 size={14} /> Largura (Metros)
          </label>
          <input
            type="number"
            step="0.05"
            min="0.1"
            className="form-input"
            value={largeFormat.widthM}
            onChange={(e) => setLargeFormat({ ...largeFormat, widthM: parseFloat(e.target.value) || 0.1 })}
          />
        </div>

        {/* Altura (Metros) */}
        <div className="form-group">
          <label className="form-label">
            <Maximize2 size={14} /> Altura (Metros)
          </label>
          <input
            type="number"
            step="0.05"
            min="0.1"
            className="form-input"
            value={largeFormat.heightM}
            onChange={(e) => setLargeFormat({ ...largeFormat, heightM: parseFloat(e.target.value) || 0.1 })}
          />
        </div>

        {/* Quantidade */}
        <div className="form-group">
          <label className="form-label">
            <Hash size={14} /> Quantidade de Unidades
          </label>
          <input
            type="number"
            min="1"
            className="form-input"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>

      </div>

      {/* Indicador de Área em m² */}
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        background: 'rgba(0, 168, 232, 0.08)',
        border: '1px solid rgba(0, 168, 232, 0.2)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
          Área por peça: <strong>{areaM2} m²</strong> ({largeFormat.widthM}m x {largeFormat.heightM}m)
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--brand-cyan)' }}>
          Área Total do Pedido: {totalM2} m²
        </div>
      </div>
    </div>
  );
}

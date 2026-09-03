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
  setOffsetSettings,
  equipments,
  selectedEquipmentId,
  setSelectedEquipmentId
}) {
  const selectedEquipment = equipments?.find(e => e.id === selectedEquipmentId) || equipments?.find(e => e.type === 'offset') || {};
  const selectedPaper = papers.find(p => p.id === selectedPaperId) || papers[0];
  const selectedSheet = sheetSizes.find(s => s.id === selectedSheetId) || sheetSizes[0];

  // Technical Compatibility Checks
  const gsmExceeded = selectedPaper.weightGsm > (selectedEquipment.maxGsm || 450);
  const sizeExceeded = (selectedSheet.widthMm > selectedEquipment.maxW || selectedSheet.heightMm > selectedEquipment.maxH);

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

      {/* SELEÇÃO DO EQUIPAMENTO DE IMPRESSÃO */}
      <div className="form-group" style={{ background: 'rgba(230, 46, 107, 0.06)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(230, 46, 107, 0.2)', marginBottom: '16px' }}>
        <label className="form-label" style={{ color: 'var(--brand-magenta)' }}>
          Impressora Off-set Selecionada
        </label>
        <select
          className="form-select"
          style={{ fontWeight: 700, fontSize: '0.95rem' }}
          value={selectedEquipmentId}
          onChange={(e) => setSelectedEquipmentId(e.target.value)}
        >
          {equipments?.filter(eq => eq.type === 'offset').map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.name} (Máx: {eq.maxGsm}g | Formato Máx: {eq.maxW}x{eq.maxH}mm)
            </option>
          ))}
        </select>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          {selectedEquipment.notes}
        </div>
      </div>

      {/* AVISOS AUTOMÁTICOS DE INCOMPATIBILIDADE TÉCNICA */}
      {gsmExceeded && (
        <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.8rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} color="var(--danger)" />
          Atenção: A gramatura de {selectedPaper.weightGsm}g excede o limite máximo suportado pela {selectedEquipment.name} ({selectedEquipment.maxGsm}g).
        </div>
      )}

      {sizeExceeded && (
        <div style={{ padding: '10px 14px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid var(--warning)', borderRadius: '8px', color: '#fcd34d', fontSize: '0.8rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} color="var(--warning)" />
          Atenção: O formato da folha ({selectedSheet.widthMm}x{selectedSheet.heightMm}mm) excede o tamanho máximo de cilindro da {selectedEquipment.name} ({selectedEquipment.maxW}x{selectedEquipment.maxH}mm).
        </div>
      )}

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

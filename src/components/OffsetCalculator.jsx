import React, { useEffect } from 'react';
import { Cpu, Layers, Palette, Hash, Box, AlertTriangle, Scissors } from 'lucide-react';
import { PAPER_FORMAT_DIMENSIONS } from '../data/initialData';

// Uma folha de máquina "cabe" na prensa se entrar em qualquer orientação, dentro do
// formato máximo e acima do mínimo alimentável.
function fitsPress(sheet, eq) {
  const maxW = eq.maxW || 9999;
  const maxH = eq.maxH || 9999;
  const straight = sheet.widthMm <= maxW && sheet.heightMm <= maxH;
  const rotated = sheet.heightMm <= maxW && sheet.widthMm <= maxH;
  if (!straight && !rotated) return false;
  if (eq.minW && eq.minH) {
    const okMin =
      (sheet.widthMm >= eq.minW && sheet.heightMm >= eq.minH) ||
      (sheet.heightMm >= eq.minW && sheet.widthMm >= eq.minH);
    if (!okMin) return false;
  }
  return true;
}

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
  const offsetPresses = equipments?.filter(e => e.type === 'offset') || [];
  const isOffsetSelected = offsetPresses.some(e => e.id === selectedEquipmentId);
  const foundEquipment = equipments?.find(e => e.id === selectedEquipmentId);
  // Enquanto a seleção herdada for uma impressora digital, usa a 1ª prensa off-set.
  const selectedEquipment = (foundEquipment && foundEquipment.type === 'offset')
    ? foundEquipment
    : (offsetPresses[0] || foundEquipment || {});
  const selectedPaper = papers.find(p => p.id === selectedPaperId) || papers[0];

  // Ao abrir a aba com uma impressora digital herdada, seleciona a 1ª prensa off-set.
  const firstOffsetId = offsetPresses[0]?.id;
  useEffect(() => {
    if (!isOffsetSelected && firstOffsetId) setSelectedEquipmentId(firstOffsetId);
  }, [isOffsetSelected, firstOffsetId, setSelectedEquipmentId]);

  // Folha INTEIRA de compra: derivada do formato do papel selecionado.
  const purchaseDims = PAPER_FORMAT_DIMENSIONS[selectedPaper?.format];
  const purchaseW = purchaseDims?.widthMm || 660;
  const purchaseH = purchaseDims?.heightMm || 960;
  const purchaseUnknown = !purchaseDims;

  // Quantas folhas de máquina de um formato saem de 1 folha de compra.
  const sheetsPerPurchaseOf = (s) => Math.max(
    1,
    Math.floor(purchaseW / s.widthMm) * Math.floor(purchaseH / s.heightMm),
    Math.floor(purchaseW / s.heightMm) * Math.floor(purchaseH / s.widthMm)
  );
  const fitsInsidePurchase = (s) =>
    (s.widthMm <= purchaseW && s.heightMm <= purchaseH) ||
    (s.heightMm <= purchaseW && s.widthMm <= purchaseH);

  // Formatos de MÁQUINA (folha já cortada) compatíveis com a prensa selecionada,
  // do maior para o menor.
  const machineSheets = sheetSizes
    .filter(s => s.machineFormat && fitsPress(s, selectedEquipment))
    .sort((a, b) => (b.widthMm * b.heightMm) - (a.widthMm * a.heightMm));

  const selectedSheet =
    machineSheets.find(s => s.id === selectedSheetId) ||
    sheetSizes.find(s => s.id === selectedSheetId) ||
    machineSheets[0] ||
    sheetSizes[0];

  // Se a seleção atual não é um formato de máquina válido para esta prensa
  // (troca de equipamento, estado herdado da aba Digital…), escolhe um default
  // sensato: maior formato que caiba na folha de compra e a divida em ≥2 (ou, na
  // falta, o maior que caiba; ou o maior de todos).
  const validSheetIds = machineSheets.map(s => s.id).join(',');
  useEffect(() => {
    if (!isOffsetSelected) return; // espera o equipamento normalizar primeiro
    if (!machineSheets.length || machineSheets.some(s => s.id === selectedSheetId)) return;
    const insidePurchase = machineSheets.filter(fitsInsidePurchase);
    // Se a prensa roda a folha de compra inteira, esse é o default; senão, o maior
    // formato que caiba na folha de compra e a divida em ≥2 pedaços.
    const pressRunsFullSheet = fitsPress({ widthMm: purchaseW, heightMm: purchaseH }, selectedEquipment);
    const pick = pressRunsFullSheet
      ? (insidePurchase[0] || machineSheets[0])
      : (insidePurchase.find(s => sheetsPerPurchaseOf(s) >= 2) || insidePurchase[0] || machineSheets[0]);
    if (pick) setSelectedSheetId(pick.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOffsetSelected, validSheetIds, selectedSheetId, purchaseW, purchaseH, setSelectedSheetId]);

  const mW = selectedSheet?.widthMm || 520;
  const mH = selectedSheet?.heightMm || 740;
  const sheetsPerPurchase = sheetsPerPurchaseOf(selectedSheet || { widthMm: mW, heightMm: mH });
  const machineBiggerThanPurchase = mW > purchaseW || mH > purchaseH;

  // Compatibility checks
  const gsmExceeded = selectedPaper.weightGsm > (selectedEquipment.maxGsm || 450);
  const sizeExceeded = (mW > (selectedEquipment.maxW || 9999) || mH > (selectedEquipment.maxH || 9999));
  const sizeUndersized = (
    (selectedEquipment.minW && mW < selectedEquipment.minW) ||
    (selectedEquipment.minH && mH < selectedEquipment.minH)
  );

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
        <label className="form-label" htmlFor="offset-equip" style={{ color: 'var(--brand-magenta)' }}>
          Impressora Off-set Selecionada
        </label>
        <select
          id="offset-equip"
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
          A folha de máquina ({mW}x{mH}mm) é maior que o formato máximo da {selectedEquipment.name} ({selectedEquipment.maxW}x{selectedEquipment.maxH}mm).
        </div>
      )}

      {sizeUndersized && (
        <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.8rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} color="var(--danger)" />
          Atenção: A folha de máquina ({mW}x{mH}mm) é menor que o formato mínimo alimentável da {selectedEquipment.name} ({selectedEquipment.minW}x{selectedEquipment.minH}mm).
        </div>
      )}

      {purchaseUnknown && (
        <div style={{ padding: '10px 14px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid var(--warning)', borderRadius: '8px', color: '#fcd34d', fontSize: '0.8rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} color="var(--warning)" />
          O papel "{selectedPaper?.name}" não tem formato de folha inteira definido — assumindo 66 × 96 cm no cálculo.
        </div>
      )}

      {machineBiggerThanPurchase && (
        <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.8rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} color="var(--danger)" />
          A folha de máquina ({mW}x{mH}mm) é maior que a folha de compra do papel ({purchaseW}x{purchaseH}mm). Escolha um formato de máquina menor ou um papel maior.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>

        {/* Substrato / Papel de Compra — define a folha inteira */}
        <div className="form-group">
          <label className="form-label" htmlFor="offset-paper">
            <Layers size={14} /> Papel &amp; Folha Inteira (Compra)
          </label>
          <select
            id="offset-paper"
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
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Folha inteira: {purchaseW} × {purchaseH} mm{selectedPaper?.format ? ` (${selectedPaper.format})` : ''}
          </span>
        </div>

        {/* Formato de Máquina Offset (folha já cortada) */}
        <div className="form-group">
          <label className="form-label" htmlFor="offset-sheet">
            <Scissors size={14} /> Formato na Máquina (folha cortada)
          </label>
          <select
            id="offset-sheet"
            className="form-select"
            value={selectedSheet?.id || ''}
            onChange={(e) => setSelectedSheetId(e.target.value)}
          >
            {machineSheets.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {mW >= purchaseW && mH >= purchaseH
              ? 'Roda a folha de compra inteira (sem sub-corte)'
              : sheetsPerPurchase > 1
                ? `${sheetsPerPurchase} folhas de máquina por folha de compra`
                : '1 folha de máquina por folha de compra (sobra refilada)'}
          </span>
        </div>

        {/* Cores / Chapas CTP */}
        <div className="form-group">
          <label className="form-label" htmlFor="offset-colors">
            <Palette size={14} /> Cores (Chapagem CTP)
          </label>
          <select
            id="offset-colors"
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
          <label className="form-label" htmlFor="offset-qty">
            <Hash size={14} /> Tiragem / Quantidade
          </label>
          <input
            id="offset-qty"
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
            <label className="form-label" htmlFor="offset-prod-w">Largura (mm)</label>
            <input
              id="offset-prod-w"
              type="number"
              className="form-input"
              value={productW}
              onChange={(e) => setProductW(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="offset-prod-h">Altura (mm)</label>
            <input
              id="offset-prod-h"
              type="number"
              className="form-input"
              value={productH}
              onChange={(e) => setProductH(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="offset-bleed">Sangria (mm)</label>
            <input
              id="offset-bleed"
              type="number"
              className="form-input"
              value={bleed}
              onChange={(e) => setBleed(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>

          {/* Acerto de Máquina / Make-Ready */}
          <div className="form-group">
            <label className="form-label" htmlFor="offset-makeready" style={{ color: 'var(--brand-yellow)' }}>
              <AlertTriangle size={14} /> Folhas de Acerto
            </label>
            <input
              id="offset-makeready"
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

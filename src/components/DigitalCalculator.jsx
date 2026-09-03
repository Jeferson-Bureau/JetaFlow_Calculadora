import React from 'react';
import { Layers, FileText, Palette, Hash, Box, BookOpen, Bookmark, Printer, AlertTriangle, CheckCircle2, User, PackageSearch } from 'lucide-react';
import ProductConfigurator from './ProductConfigurator';

export default function DigitalCalculator({
  papers,
  sheetSizes,
  equipments,
  selectedEquipmentId,
  setSelectedEquipmentId,
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
  productCategory,
  setProductCategory,
  editorial,
  setEditorial,
  spineMm,
  clients = [],
  selectedClientId,
  setSelectedClientId
}) {
  const selectedEquipment = equipments.find(e => e.id === selectedEquipmentId) || equipments[0];
  const selectedPaper = papers.find(p => p.id === selectedPaperId) || papers[0];
  const selectedSheet = sheetSizes.find(s => s.id === selectedSheetId) || sheetSizes[0];

  // Technical Compatibility Checks
  const gsmExceeded = selectedPaper.weightGsm > (selectedEquipment.maxGsm || 256);
  const sizeExceeded = (selectedSheet.widthMm > selectedEquipment.maxW || selectedSheet.heightMm > selectedEquipment.maxH);

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      
      {/* Category Toggle: Comercial / Editorial / Histórico de Orçamentos */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} color="var(--brand-cyan)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
            Orçamento & Engenharia Digital
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-input)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => setProductCategory('flat')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: productCategory === 'flat' ? 'var(--brand-cyan)' : 'transparent',
              color: productCategory === 'flat' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Comercial / Avulso
          </button>

          <button
            type="button"
            onClick={() => setProductCategory('editorial')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: productCategory === 'editorial' ? 'linear-gradient(135deg, var(--brand-magenta), #b81b4f)' : 'transparent',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BookOpen size={14} /> Editorial (Livros/Catálogos)
          </button>

          <button
            type="button"
            onClick={() => setProductCategory('quotes_history')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: productCategory === 'quotes_history' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'transparent',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={14} /> Orçamentos Salvos
          </button>
          
          <button
            type="button"
            onClick={() => setProductCategory('configurable')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: productCategory === 'configurable' ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'transparent',
              color: productCategory === 'configurable' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PackageSearch size={14} /> Produtos Personalizados
          </button>
        </div>
      </div>

      {productCategory !== 'quotes_history' && (
        <>
          {/* VINCULAÇÃO DE CLIENTE AO ORÇAMENTO (CÓDIGO DO CLIENTE & NOME FANTASIA) */}
          <div className="form-group" style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <label className="form-label" style={{ color: 'var(--success)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}>
                <User size={18} /> Vinculação do Cliente (CRM)
              </label>

              {selectedClientId ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '3px 10px', borderRadius: '6px', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                    ✓ Cliente Vinculado
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedClientId && setSelectedClientId('')}
                    style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Desvincular
                  </button>
                </div>
              ) : (
                <span style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: '6px' }}>
                  Atendimento Balcão / Avulso
                </span>
              )}
            </div>

            {/* Grid com Campos Específicos: Código do Cliente & Nome Fantasia */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              
              {/* Campo 1: Código do Cliente (Com auto-preenchimento e busca rápida) */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Código do Cliente (Ex: CLI-A0001)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Digite o código (ex: CLI-A0001)..."
                  style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--brand-cyan)', background: '#0f172a', border: '1px solid rgba(0, 168, 232, 0.4)' }}
                  value={
                    clients.find(c => c.id === selectedClientId)?.code || ''
                  }
                  onChange={(e) => {
                    const codeTyped = e.target.value.trim().toUpperCase();
                    const found = clients.find(c => c.code && c.code.toUpperCase() === codeTyped);
                    if (found) {
                      setSelectedClientId(found.id);
                    } else if (codeTyped === '') {
                      setSelectedClientId('');
                    }
                  }}
                />
              </div>

              {/* Campo 2: Nome Fantasia (Auto-preenchimento + Dropdown de Clientes) */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Nome Fantasia do Cliente
                </label>
                <select
                  className="form-select"
                  style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff', background: '#0f172a', border: '1px solid rgba(16, 185, 129, 0.4)' }}
                  value={selectedClientId || ''}
                  onChange={(e) => setSelectedClientId && setSelectedClientId(e.target.value)}
                >
                  <option value="">-- Selecionar Nome Fantasia (ou Balcão) --</option>
                  {clients && clients.length > 0 && clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tradeName || c.name} — ({c.code || 'CLI'}) [{c.doc || 'Sem Doc'}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resumo do Cliente Selecionado */}
            {selectedClientId && (() => {
              const currentClient = clients.find(c => c.id === selectedClientId);
              if (!currentClient) return null;
              return (
                <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                  <div><strong style={{ color: 'var(--text-muted)' }}>Razão Social:</strong> {currentClient.name}</div>
                  <div><strong style={{ color: 'var(--text-muted)' }}>CNPJ/CPF:</strong> {currentClient.doc}</div>
                  <div><strong style={{ color: 'var(--text-muted)' }}>Cidade:</strong> {currentClient.city || 'Maringá'}</div>
                  <div><strong style={{ color: 'var(--text-muted)' }}>Contato:</strong> {currentClient.phone || 'N/A'}</div>
                </div>
              );
            })()}
          </div>

          {/* SELEÇÃO DO EQUIPAMENTO DE IMPRESSÃO */}
          {productCategory !== 'configurable' && (
            <>
              <div className="form-group" style={{ background: 'rgba(0, 168, 232, 0.06)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(0, 168, 232, 0.2)', marginBottom: '16px' }}>
                <label className="form-label" style={{ color: 'var(--brand-cyan)' }}>
                  <Printer size={16} /> Impressora Digital Selecionada
                </label>
            <select
              className="form-select"
              style={{ fontWeight: 700, fontSize: '0.95rem' }}
              value={selectedEquipmentId}
              onChange={(e) => setSelectedEquipmentId(e.target.value)}
            >
              {equipments.filter(eq => eq.type !== 'offset').map((eq) => (
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
              Atenção: A gramatura de {selectedPaper.weightGsm}g excede o limite máximo suportado pela {selectedEquipment.name} ({selectedEquipment.maxGsm}g). Escolha a Xerox C8035 ou Impressão Off-set.
            </div>
          )}

          {sizeExceeded && (
            <div style={{ padding: '10px 14px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid var(--warning)', borderRadius: '8px', color: '#fcd34d', fontSize: '0.8rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="var(--warning)" />
              Atenção: O formato da folha ({selectedSheet.widthMm}x{selectedSheet.heightMm}mm) excede o tamanho máximo de gaveta da {selectedEquipment.name} ({selectedEquipment.maxW}x{selectedEquipment.maxH}mm).
            </div>
          )}
          </>
          )}
        </>
      )}

      {productCategory === 'configurable' ? (
        <ProductConfigurator papers={papers} />
      ) : productCategory === 'flat' ? (
        /* --- PRODUTO COMERCIAL / AVULSO --- */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">
              <Layers size={14} /> Substrato (Papel)
            </label>
            <select
              className="form-select"
              value={selectedPaperId}
              onChange={(e) => setSelectedPaperId(e.target.value)}
            >
              {papers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - (R$ {Number(p.pricePerSheetSra3 || 0).toFixed(2)}/fl SRA3)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Box size={14} /> Formato da Folha de Impressão
            </label>
            <select
              className="form-select"
              value={selectedSheetId}
              onChange={(e) => setSelectedSheetId(e.target.value)}
            >
              {sheetSizes.filter(s => !s.id.startsWith('full-')).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Palette size={14} /> Cores de Impressão
            </label>
            <select
              className="form-select"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
            >
              <option value="4/0">Colorido Frente Apenas (4/0)</option>
              <option value="4/4">Colorido Frente e Verso (4/4)</option>
              <option value="1/0">Preto e Branco Frente (1/0)</option>
              <option value="1/1">Preto e Branco Frente e Verso (1/1)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Hash size={14} /> Tiragem / Quantidade
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
      ) : (
        /* --- PRODUTO EDITORIAL (LIVROS, REVISTAS, CATÁLOGOS) --- */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--brand-yellow)' }}>
                <BookOpen size={14} /> Número de Páginas (Miolo)
              </label>
              <input
                type="number"
                step="4"
                min="4"
                className="form-input"
                style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--brand-yellow)' }}
                value={editorial.pagesCount}
                onChange={(e) => setEditorial({ ...editorial, pagesCount: Math.max(4, parseInt(e.target.value) || 4) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Hash size={14} /> Tiragem de Exemplares
              </label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Encadernação</label>
              <select
                className="form-select"
                value={editorial.bindingMethod}
                onChange={(e) => setEditorial({ ...editorial, bindingMethod: e.target.value })}
              >
                <option value="lombada_quadrada">Lombada Quadrada (PUR / Hot-Melt)</option>
                <option value="grampo_canoa">Grampo Canoa (Revistas/Catálogos)</option>
                <option value="wire_o">Wire-O Metálico</option>
              </select>
            </div>
          </div>

          {editorial.bindingMethod === 'lombada_quadrada' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
              <div className="form-group">
                <label className="form-label">Tipo de Cola / Processo</label>
                <select
                  className="form-select"
                  value={editorial.glueType || 'hot_melt'}
                  onChange={(e) => setEditorial({ ...editorial, glueType: e.target.value })}
                >
                  <option value="hot_melt">Hot-Melt (+0.8 mm compensação)</option>
                  <option value="pur">PUR (+0.4 mm compensação)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Bulk do Papel (cm³/g - Opcional)</label>
                <input
                  type="number"
                  step="0.05"
                  placeholder="Ex: 1.5 (Pólen Soft)"
                  className="form-input"
                  value={editorial.customBulk || ''}
                  onChange={(e) => setEditorial({ ...editorial, customBulk: parseFloat(e.target.value) || null })}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Páginas:</span>
            {[16, 32, 48, 64, 96, 128, 160, 256].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setEditorial({ ...editorial, pagesCount: p })}
                style={{
                  padding: '3px 8px',
                  background: editorial.pagesCount === p ? 'var(--brand-cyan)' : 'var(--bg-input)',
                  color: editorial.pagesCount === p ? '#ffffff' : 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {p} págs
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '8px' }}>
            <div style={{ background: 'rgba(0, 168, 232, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(0, 168, 232, 0.2)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-cyan)', marginBottom: '10px', textTransform: 'uppercase' }}>
                1. Papel & Impressão do Miolo
              </h4>
              <div className="form-group">
                <label className="form-label">Papel do Miolo</label>
                <select
                  className="form-select"
                  value={editorial.mioloPaper.id || selectedPaperId}
                  onChange={(e) => {
                    const pObj = papers.find(p => p.id === e.target.value);
                    setEditorial({ ...editorial, mioloPaper: pObj });
                  }}
                >
                  {papers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Cores do Miolo</label>
                <select
                  className="form-select"
                  value={editorial.mioloColors}
                  onChange={(e) => setEditorial({ ...editorial, mioloColors: e.target.value })}
                >
                  <option value="1/1">1/1 - Monocromático / Preto (Frente/Verso)</option>
                  <option value="4/4">4/4 - Colorido (Frente/Verso)</option>
                  <option value="4/0">4/0 - Colorido Apenas Frente</option>
                </select>
              </div>
            </div>

            <div style={{ background: 'rgba(230, 46, 107, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(230, 46, 107, 0.2)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-magenta)', marginBottom: '10px', textTransform: 'uppercase' }}>
                2. Papel & Capa Aberta
              </h4>
              <div className="form-group">
                <label className="form-label">Papel da Capa</label>
                <select
                  className="form-select"
                  value={editorial.coverPaper.id || selectedPaperId}
                  onChange={(e) => {
                    const pObj = papers.find(p => p.id === e.target.value);
                    setEditorial({ ...editorial, coverPaper: pObj });
                  }}
                >
                  {papers.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className="form-group">
                  <label className="form-label">Cores Capa</label>
                  <select
                    className="form-select"
                    value={editorial.coverColors}
                    onChange={(e) => setEditorial({ ...editorial, coverColors: e.target.value })}
                  >
                    <option value="4/0">4/0 Colorido</option>
                    <option value="4/4">4/4 Colorido</option>
                    <option value="1/0">1/0 Preto</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Orelha/Flap (mm)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editorial.flapW}
                    onChange={(e) => setEditorial({ ...editorial, flapW: Math.max(0, parseInt(e.target.value) || 0) })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Badge de Lombada Quadrada com Fórmula Passo a Passo */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(247, 181, 0, 0.15), rgba(15, 23, 42, 0.7))',
            border: '1px solid var(--brand-yellow)',
            padding: '14px 18px',
            borderRadius: '10px',
            marginTop: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bookmark size={20} color="var(--brand-yellow)" />
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                    Cálculo de Lombada Quadrada:
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Fórmula: <code>Lombada = (Páginas/2 × EspessuraFolha) + Compensação</code>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-yellow)' }}>
                {spineMm} mm
              </div>
            </div>

            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px dashed rgba(247, 181, 0, 0.3)',
              display: 'flex',
              justify: 'space-between',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              <span>
                • Formato Capa Aberta (Arte Final): <strong style={{ color: 'var(--brand-cyan)' }}>{((2 * productW) + spineMm + (2 * editorial.flapW)).toFixed(1)} x {productH} mm</strong>
              </span>
              <span>
                • Cola: <strong style={{ color: '#ffffff' }}>{editorial.glueType === 'pur' ? 'PUR (+0.4mm)' : 'Hot-Melt (+0.8mm)'}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dimensões do Produto Fechado */}
      {productCategory !== 'configurable' && (
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Tamanho do Produto Fechado (mm)
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
        </div>
      </div>
      )}
    </div>
  );
}

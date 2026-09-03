import React, { useState, useMemo } from 'react';
import { Tag, Printer, Package, Search } from 'lucide-react';

export default function LabelGenerator({ quotes, clients }) {
  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [volumes, setVolumes] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [labelsPerSheet, setLabelsPerSheet] = useState(4);
  const [notaFiscal, setNotaFiscal] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [manualClient, setManualClient] = useState('');
  const [manualDoc, setManualDoc] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualQty, setManualQty] = useState(1);
  const [manualCode, setManualCode] = useState('');

  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => 
      (q.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [quotes, searchTerm]);

  const selectedQuote = quotes.find(q => q.id === selectedQuoteId);

  const computedQuote = selectedQuoteId === 'manual' ? {
    code: manualCode || 'AVULSO',
    clientName: manualClient || 'Destinatário não informado',
    clientDoc: manualDoc || '',
    description: manualDesc || 'Material não informado',
    quantity: manualQty || 1,
    date: new Date().toLocaleDateString('pt-BR')
  } : selectedQuote;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="label-generator-container">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 0;
            display: grid !important;
            grid-template-columns: repeat(1, 1fr) !important;
            grid-gap: 5mm !important;
            padding-top: 5mm !important;
            padding-left: 10mm !important;
            padding-right: 10mm !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .label-card {
            border: 2px solid #000 !important;
            background: #fff !important;
            color: #000 !important;
            page-break-inside: avoid;
            ${labelsPerSheet === 1 ? `
              height: 277mm !important;
            ` : labelsPerSheet === 2 ? `
              height: 138mm !important;
            ` : labelsPerSheet === 3 ? `
              height: 90mm !important;
            ` : `
              height: 66mm !important;
            `}
            width: 190mm !important;
            
            box-shadow: none !important;
            border-radius: 8px !important;
          }
          /* Hide app background */
          body { background: #fff !important; }
        }
      `}</style>

      <div className="glass-card no-print" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Tag size={24} color="var(--brand-magenta)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Emissão de Etiquetas (Expedição)</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'end' }}>
          <div className="form-group">
            <label className="form-label">Buscar Pedido / Orçamento</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Buscar por código ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Selecionar Pedido</label>
            <select
              className="form-select"
              value={selectedQuoteId}
              onChange={(e) => setSelectedQuoteId(e.target.value)}
            >
              <option value="">-- Selecione o Pedido --</option>
              <option value="manual" style={{ fontWeight: 'bold', color: 'var(--brand-cyan)' }}>+ Etiqueta Avulsa (Preenchimento Manual)</option>
              {filteredQuotes.map(q => (
                <option key={q.id} value={q.id}>
                  {q.code} - {q.clientName} ({q.description?.substring(0, 30)}...)
                </option>
              ))}
            </select>
          </div>
        </div>

        {computedQuote && (
          <div style={{ marginTop: '20px', display: 'flex', gap: '20px', alignItems: 'flex-end', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
            <div className="form-group" style={{ width: '150px', marginBottom: 0 }}>
              <label className="form-label"><Package size={14} /> Quantidade de Volumes</label>
              <input
                type="number"
                className="form-input"
                min="1"
                value={volumes}
                onChange={(e) => setVolumes(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            
            <div className="form-group" style={{ width: '180px', marginBottom: 0 }}>
              <label className="form-label">Tamanho / Layout</label>
              <select
                className="form-select"
                value={labelsPerSheet}
                onChange={(e) => setLabelsPerSheet(Number(e.target.value))}
              >
                <option value={1}>1 por Folha A4</option>
                <option value={2}>2 por Folha A4</option>
                <option value={3}>3 por Folha A4</option>
                <option value={4}>4 por Folha A4</option>
              </select>
            </div>
            
            <button 
              onClick={handlePrint}
              style={{
                background: 'var(--brand-magenta)',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Printer size={18} /> Imprimir Etiquetas (A4)
            </button>
          </div>
        )}

        {selectedQuoteId === 'manual' && (
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'rgba(0,168,232,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid var(--brand-cyan)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nome do Cliente / Destinatário</label>
              <input 
                type="text" 
                className="form-input" 
                list="label-clients-list"
                value={manualClient} 
                onChange={(e) => {
                  const val = e.target.value;
                  setManualClient(val);
                  const matchedClient = clients.find(c => c.name === val || c.tradeName === val);
                  if (matchedClient) {
                    setManualDoc(matchedClient.doc || '');
                  }
                }} 
                placeholder="Busque ou digite o cliente..." 
              />
              <datalist id="label-clients-list">
                {clients.map(c => (
                  <option key={c.id} value={c.name}>{c.tradeName && `(${c.tradeName})`}</option>
                ))}
              </datalist>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Documento (CNPJ/CPF) - Opcional</label>
              <input type="text" className="form-input" value={manualDoc} onChange={(e) => setManualDoc(e.target.value)} placeholder="Ex: 00.000.000/0001-00" />
            </div>
            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">Descrição do Material</label>
              <input type="text" className="form-input" value={manualDesc} onChange={(e) => setManualDesc(e.target.value)} placeholder="Ex: 5000 Panfletos A5 90g" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Número do Pedido (Opcional)</label>
              <input type="text" className="form-input" value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="Ex: PED-123" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Quantidade Total Produzida (Lote)</label>
              <input type="number" min="1" className="form-input" value={manualQty} onChange={(e) => setManualQty(Math.max(1, parseInt(e.target.value) || 1))} />
            </div>
          </div>
        )}

        {computedQuote && (
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nota Fiscal (Opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: NF 1234"
                value={notaFiscal}
                onChange={(e) => setNotaFiscal(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Observações (Opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Cuidado Frágil"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {computedQuote && (
        <div className="print-area" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {Array.from({ length: volumes }).map((_, i) => (
            <div key={i} className="label-card glass-card" style={{ padding: '16px', display: 'flex', gap: '20px', alignItems: 'stretch' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '8px' }}>
                  <img src="/JETAPRINT_LOGO_01_2026-01.jpg" alt="Logo" style={{ height: '30px' }} className="no-print" />
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }} className="print-only-logo">JETAPRINT</div>
                  <style>{`
                    .print-only-logo { display: none; }
                    @media print {
                      .print-only-logo { display: block !important; color: #000 !important; }
                      .no-print { display: none !important; }
                    }
                  `}</style>
                  <div style={{ textAlign: 'right', color: '#000' }}>
                    {notaFiscal && <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>NF: {notaFiscal}</div>}
                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>PEDIDO: {computedQuote.code}</div>
                    <div style={{ fontSize: '0.75rem' }}>{computedQuote.date}</div>
                  </div>
                </div>

                <div style={{ marginBottom: '8px', color: '#000' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Destinatário</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>{computedQuote.clientName}</div>
                  <div style={{ fontSize: '0.85rem' }}>Documento: {computedQuote.clientDoc || 'Não informado'}</div>
                </div>

                <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #cbd5e1', flex: 1, color: '#000', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Conteúdo / Material</div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>{computedQuote.description}</div>
                  {observacoes && (
                    <div style={{ marginTop: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#b91c1c' }}>
                      <style>{`@media print { .print-obs { color: #000 !important; } }`}</style>
                      <span className="print-obs">Obs: {observacoes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ width: '140px', borderLeft: '2px dashed #000', paddingLeft: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', color: '#000', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', width: '100%' }}>
                  Lote Total: {computedQuote.quantity} un.
                </div>
                
                <div style={{ padding: '8px 0' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 900 }}>VOLUME</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: '1', marginTop: '4px' }}>{i + 1}/{volumes}</div>
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 700, borderTop: '1px solid #e2e8f0', paddingTop: '4px', width: '100%' }}>
                  Neste vol: {Math.floor(computedQuote.quantity / volumes) + (i === volumes - 1 ? computedQuote.quantity % volumes : 0)} un.
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

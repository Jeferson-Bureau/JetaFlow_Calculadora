import React, { useState, useMemo, useEffect } from 'react';
import { Tag, Printer, Package, Search, MapPin, Phone, User, Building, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export default function LabelGenerator({ quotes = [], clients = [] }) {
  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [volumes, setVolumes] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [labelsPerSheet, setLabelsPerSheet] = useState(4);
  const [notaFiscal, setNotaFiscal] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Campos Manuais
  const [manualClient, setManualClient] = useState('');
  const [manualDoc, setManualDoc] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualQty, setManualQty] = useState(1);
  const [manualCode, setManualCode] = useState('');

  // Campos de Endereço de Entrega Completo
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNeighborhood, setAddressNeighborhood] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressZip, setAddressZip] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressContact, setAddressContact] = useState('');

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
    description: manualDesc || 'Material impresso gráfico',
    quantity: manualQty || 1,
    date: new Date().toLocaleDateString('pt-BR')
  } : selectedQuote;

  // Localizar cliente vinculado no cadastro (CRM)
  const matchedClient = useMemo(() => {
    if (!clients || clients.length === 0) return null;

    if (selectedQuoteId === 'manual') {
      const cleanDoc = (manualDoc || '').replace(/\D/g, '');
      const cleanName = (manualClient || '').trim().toLowerCase();
      if (!cleanDoc && !cleanName) return null;

      return clients.find(c => {
        const cDoc = (c.doc || '').replace(/\D/g, '');
        if (cleanDoc && cDoc && cleanDoc === cDoc) return true;
        const cName = (c.name || '').toLowerCase();
        const cTrade = (c.tradeName || '').toLowerCase();
        if (cleanName && (cName === cleanName || cTrade === cleanName)) return true;
        return false;
      }) || null;
    }

    if (selectedQuote) {
      // 1. Pelo ID do cliente vinculado no orçamento
      if (selectedQuote.clientId) {
        const byId = clients.find(c => c.id === selectedQuote.clientId);
        if (byId) return byId;
      }
      // 2. Pelo CNPJ / CPF
      const qDoc = (selectedQuote.clientDoc || '').replace(/\D/g, '');
      if (qDoc) {
        const byDoc = clients.find(c => (c.doc || '').replace(/\D/g, '') === qDoc);
        if (byDoc) return byDoc;
      }
      // 3. Pelo Nome / Razão Social ou Nome Fantasia
      const qName = (selectedQuote.clientName || '').trim().toLowerCase();
      if (qName) {
        const byName = clients.find(c => 
          (c.name || '').toLowerCase() === qName || 
          (c.tradeName || '').toLowerCase() === qName
        );
        if (byName) return byName;
      }
    }

    return null;
  }, [selectedQuoteId, selectedQuote, manualDoc, manualClient, clients]);

  // Rastreia o último orçamento para detectar troca de seleção
  const prevQuoteIdRef = React.useRef(selectedQuoteId);

  // Atualiza os campos de endereço automaticamente ao selecionar o pedido ou cliente
  useEffect(() => {
    const quoteChanged = prevQuoteIdRef.current !== selectedQuoteId;
    prevQuoteIdRef.current = selectedQuoteId;

    if (matchedClient) {
      // Cliente encontrado no CRM: preenche tudo
      setAddressStreet(matchedClient.street || '');
      setAddressNeighborhood(matchedClient.neighborhood || '');
      setAddressCity(matchedClient.city || '');
      setAddressState(matchedClient.state || '');
      setAddressZip(matchedClient.zipCode || '');
      setAddressPhone(matchedClient.phone || '');
      setAddressContact(matchedClient.contactPerson || '');
    } else if (quoteChanged) {
      // Trocou de orçamento e cliente não está no CRM: limpa para nova entrada manual
      setAddressStreet('');
      setAddressNeighborhood('');
      setAddressCity('');
      setAddressState('');
      setAddressZip('');
      setAddressPhone('');
      setAddressContact('');
    }
    // Se não trocou de orçamento e não há match, mantém o que o usuário digitou
  }, [matchedClient, selectedQuoteId]);

  const handleManualClientChange = (val) => {
    setManualClient(val);
    const found = clients.find(c => c.name === val || c.tradeName === val || c.name?.toLowerCase() === val.toLowerCase());
    if (found) {
      setManualDoc(found.doc || '');
      setAddressStreet(found.street || '');
      setAddressNeighborhood(found.neighborhood || '');
      setAddressCity(found.city || '');
      setAddressState(found.state || '');
      setAddressZip(found.zipCode || '');
      setAddressPhone(found.phone || '');
      setAddressContact(found.contactPerson || '');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="label-generator-container">
      <style>{`
        @media print {
          body * { visibility: hidden; }

          .print-area, .print-area * { visibility: visible; }

          .print-area {
            position: absolute;
            left: 0; top: 0;
            width: 100%;
            margin: 0; padding: 0;
            display: flex !important;
            flex-direction: column !important;
            gap: 4mm !important;
            padding: 8mm 10mm !important;
            background: white !important;
            box-sizing: border-box !important;
          }

          .no-print { display: none !important; }

          .label-card {
            display: flex !important;
            flex-direction: column !important;
            width: 190mm !important;
            box-sizing: border-box !important;
            border: 2px solid #000 !important;
            background: #fff !important;
            color: #000 !important;
            border-radius: 5px !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-shadow: none !important;
            ${labelsPerSheet === 1 ? `
              height: 270mm !important;
              min-height: 270mm !important;
            ` : labelsPerSheet === 2 ? `
              height: 130mm !important;
              min-height: 130mm !important;
            ` : labelsPerSheet === 3 ? `
              height: 84mm !important;
              min-height: 84mm !important;
            ` : `
              height: 62mm !important;
              min-height: 62mm !important;
            `}
          }

          .label-card .label-header {
            flex-shrink: 0 !important;
          }

          .label-card .label-body {
            flex: 1 !important;
            display: flex !important;
            overflow: hidden !important;
            min-height: 0 !important;
          }

          .label-card .label-col-main {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            padding: ${labelsPerSheet >= 3 ? '4px 8px' : '8px 10px'} !important;
            gap: ${labelsPerSheet >= 4 ? '4px' : '6px'} !important;
            overflow: hidden !important;
            min-height: 0 !important;
          }

          .label-card .label-col-vol {
            width: ${labelsPerSheet >= 4 ? '80px' : '100px'} !important;
            flex-shrink: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: ${labelsPerSheet >= 3 ? '4px 4px' : '8px 6px'} !important;
            border-left: 2px dashed #000 !important;
            box-sizing: border-box !important;
          }

          .label-dest { flex-shrink: 0 !important; }

          .label-addr {
            flex-shrink: 0 !important;
            ${labelsPerSheet >= 4 ? 'padding: 3px 6px !important; font-size: 0.72rem !important;' : ''}
          }

          .label-content {
            flex: 1 !important;
            min-height: 0 !important;
            overflow: hidden !important;
            ${labelsPerSheet >= 4 ? 'padding: 3px 6px !important;' : ''}
          }

          .label-dest-name {
            ${labelsPerSheet >= 4 ? 'font-size: 0.88rem !important;' :
              labelsPerSheet === 3 ? 'font-size: 0.92rem !important;' : ''}
          }

          .vol-number {
            ${labelsPerSheet >= 4 ? 'font-size: 1.8rem !important;' :
              labelsPerSheet === 3 ? 'font-size: 2rem !important;' : ''}
          }

          body { background: #fff !important; }

          @page {
            margin: 0;
            size: A4 portrait;
          }
        }
      `}</style>

      {/* Control Panel (no-print) */}
      <div className="glass-card no-print" style={{ padding: '24px', marginBottom: '24px' }}>
        
        {/* Header Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(230, 46, 107, 0.15)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(230, 46, 107, 0.3)' }}>
              <Tag size={24} color="var(--brand-magenta)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-strong)' }}>
                Emissão de Etiquetas de Expedição
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Geração de etiquetas para caixas e volumes com endereço completo puxado do CRM de clientes.
              </p>
            </div>
          </div>

          {computedQuote && (
            <button 
              onClick={handlePrint}
              style={{
                background: 'linear-gradient(135deg, var(--brand-magenta), #b81b4f)',
                color: 'var(--on-accent)',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(230, 46, 107, 0.4)'
              }}
            >
              <Printer size={18} /> Imprimir Etiquetas (A4)
            </button>
          )}
        </div>

        {/* Selection Row: Search & Dropdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Buscar Pedido / Orçamento no Histórico</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Buscar por código (ORC-A0001), cliente ou material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Selecionar Pedido</label>
            <select
              className="form-select"
              value={selectedQuoteId}
              onChange={(e) => setSelectedQuoteId(e.target.value)}
            >
              <option value="">-- Selecione um Pedido do Histórico --</option>
              <option value="manual" style={{ fontWeight: 800, color: 'var(--brand-cyan)' }}>
                ➕ Etiqueta Avulsa (Preenchimento Manual / Buscar do CRM)
              </option>
              {filteredQuotes.map(q => (
                <option key={q.id} value={q.id}>
                  {q.code} — {q.clientName} ({q.description?.substring(0, 32)}...)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Manual Mode Input Fields */}
        {selectedQuoteId === 'manual' && (
          <div style={{
            marginTop: '20px',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr 1fr',
            gap: '14px',
            background: 'rgba(0, 168, 232, 0.05)',
            padding: '18px',
            borderRadius: '12px',
            border: '1px solid rgba(0, 168, 232, 0.3)'
          }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: 'var(--brand-cyan)' }}>
                Destinatário (CRM ou Avulso)
              </label>
              <input 
                type="text" 
                className="form-input" 
                list="label-clients-list"
                value={manualClient} 
                onChange={(e) => handleManualClientChange(e.target.value)} 
                placeholder="Digite ou escolha da lista..." 
                autoFocus
              />
              <datalist id="label-clients-list">
                {clients.map(c => (
                  <option key={c.id} value={c.tradeName || c.name}>
                    {c.tradeName ? `${c.tradeName} — ${c.name}` : c.name}
                  </option>
                ))}
              </datalist>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">CNPJ / CPF</label>
              <input 
                type="text" 
                className="form-input" 
                value={manualDoc} 
                onChange={(e) => setManualDoc(e.target.value)} 
                placeholder="Ex: 00.000.000/0001-00" 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nº Pedido / Código</label>
              <input 
                type="text" 
                className="form-input" 
                value={manualCode} 
                onChange={(e) => setManualCode(e.target.value)} 
                placeholder="Ex: PED-1025" 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Qtd Total do Lote</label>
              <input 
                type="number" 
                min="1" 
                className="form-input" 
                value={manualQty} 
                onChange={(e) => setManualQty(Math.max(1, parseInt(e.target.value) || 1))} 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
              <label className="form-label">Descrição do Material / Conteúdo</label>
              <input 
                type="text" 
                className="form-input" 
                value={manualDesc} 
                onChange={(e) => setManualDesc(e.target.value)} 
                placeholder="Ex: 5.000 Folders 14x20cm Couché 150g 4x4 Cores Dobra ao Meio" 
              />
            </div>
          </div>
        )}

        {/* Section: Complete Recipient Address (Auto-filled from Client CRM) */}
        {computedQuote && (
          <div style={{
            marginTop: '20px',
            background: 'linear-gradient(135deg, var(--panel-grad-1), var(--panel-grad-2))',
            padding: '18px',
            borderRadius: '12px',
            border: matchedClient ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-color)'
          }}>
            {/* Address Header & Origin Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--tint-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="var(--brand-cyan)" />
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-strong)' }}>
                  Endereço Completo de Entrega (Destinatário)
                </span>
              </div>

              {matchedClient ? (
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--success)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <CheckCircle2 size={13} /> Puxado do CRM: {matchedClient.tradeName || matchedClient.name}
                </span>
              ) : (
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: 'rgba(247, 181, 0, 0.15)',
                  color: 'var(--brand-yellow)',
                  border: '1px solid rgba(247, 181, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <AlertCircle size={13} /> Preencha o endereço de entrega abaixo
                </span>
              )}
            </div>

            {/* Address Input Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 0.6fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Logradouro & Número</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Av. Brasil, 1200 ou Rua A, nº 70"
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Bairro</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Centro / Pq. Industrial"
                  value={addressNeighborhood}
                  onChange={(e) => setAddressNeighborhood(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Cidade</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Maringá, Peabiru, Sarandi"
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>UF</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="PR"
                  maxLength={2}
                  style={{ textTransform: 'uppercase' }}
                  value={addressState}
                  onChange={(e) => setAddressState(e.target.value.toUpperCase())}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>CEP</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="87000-000"
                  value={addressZip}
                  onChange={(e) => setAddressZip(e.target.value)}
                />
              </div>
            </div>

            {/* Contact & Phone Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Telefone / WhatsApp de Contato</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '32px' }}
                    placeholder="Ex: (44) 3032-6868 ou (44) 99851-1998"
                    value={addressPhone}
                    onChange={(e) => setAddressPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Pessoa de Contato / Aos Cuidados de (A/C)</label>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '32px' }}
                    placeholder="Ex: Almoxarifado / Responsável pelo Recebimento"
                    value={addressContact}
                    onChange={(e) => setAddressContact(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section: Volumes, Layout, NF & Observações */}
        {computedQuote && (
          <div style={{
            marginTop: '20px',
            display: 'grid',
            gridTemplateColumns: '140px 180px 180px 1fr',
            gap: '14px',
            background: 'var(--tint-hairline)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            alignItems: 'end'
          }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Package size={14} color="var(--brand-yellow)" /> Volumes
              </label>
              <input
                type="number"
                className="form-input"
                min="1"
                value={volumes}
                onChange={(e) => setVolumes(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tamanho / Layout</label>
              <select
                className="form-select"
                value={labelsPerSheet}
                onChange={(e) => setLabelsPerSheet(Number(e.target.value))}
              >
                <option value={1}>1 por Folha (A4 Inteiro)</option>
                <option value={2}>2 por Folha (138mm)</option>
                <option value={3}>3 por Folha (90mm)</option>
                <option value={4}>4 por Folha (67mm)</option>
              </select>
            </div>

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
              <label className="form-label">Observações de Transporte / Caixa</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Cuidado Frágil / Manter Seco"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Printable Area */}
      {computedQuote && (
        <div className="print-area" style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {Array.from({ length: volumes }).map((_, i) => {
            const baseQty = Math.floor((computedQuote.quantity || 0) / volumes);
            const remainder = (computedQuote.quantity || 0) % volumes;
            const volQty = baseQty + (i < remainder ? 1 : 0);

            return (
              <div 
                key={i} 
                className="label-card"
                style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#ffffff',
                  border: '2px solid #000000',
                  color: '#000000',
                  borderRadius: '8px',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  minHeight: labelsPerSheet === 1 ? '420px'
                    : labelsPerSheet === 2 ? '220px'
                    : labelsPerSheet === 3 ? '160px'
                    : '130px'
                }}
              >
                {/* ── CABEÇALHO ── */}
                <div className="label-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '2px solid #000',
                  padding: '7px 12px',
                  background: '#000',
                  color: 'var(--text-strong)',
                  flexShrink: 0
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src="/JETAPRINT_LOGO_01_2026-01.jpg" 
                      alt="JETAPRINT" 
                      style={{ height: '24px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
                      className="no-print" 
                    />
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '1px' }} className="print-only-logo">JETAPRINT</span>
                    <style>{`
                      .print-only-logo { display: none; }
                      @media print {
                        .print-only-logo { display: inline !important; color: #fff !important; }
                        .no-print { display: none !important; }
                      }
                    `}</style>
                    <span style={{ fontSize: '0.68rem', color: '#aaa', letterSpacing: '0.3px' }} className="no-print">Gráfica Multimídia</span>
                  </div>

                  <div style={{ textAlign: 'right', lineHeight: 1.25 }}>
                    {notaFiscal && (
                      <div style={{ fontSize: '0.65rem', color: '#bbb' }}>NF: {notaFiscal}</div>
                    )}
                    <div style={{ fontWeight: 900, fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                      PEDIDO: {computedQuote.code}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#bbb' }}>{computedQuote.date}</div>
                  </div>
                </div>

                {/* ── CORPO PRINCIPAL ── */}
                <div className="label-body" style={{ display: 'flex', flex: 1, minHeight: 0 }}>

                  {/* Coluna Principal */}
                  <div className="label-col-main" style={{ 
                    flex: 1, 
                    padding: '8px 10px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '6px',
                    minHeight: 0,
                    overflow: 'hidden'
                  }}>

                    {/* Destinatário */}
                    <div className="label-dest" style={{ flexShrink: 0 }}>
                      <div style={{
                        fontSize: '0.58rem',
                        textTransform: 'uppercase',
                        fontWeight: 800,
                        color: '#475569',
                        letterSpacing: '0.8px',
                        marginBottom: '2px',
                        borderBottom: '1px solid #e2e8f0',
                        paddingBottom: '1px'
                      }}>
                        Destinatário / Entrega
                      </div>

                      <div className="label-dest-name" style={{ fontSize: '0.96rem', fontWeight: 900, lineHeight: 1.15, color: '#000' }}>
                        {computedQuote.clientName}
                      </div>

                      {addressContact && (
                        <div style={{ fontSize: '0.72rem', color: '#334155', marginTop: '1px' }}>
                          A/C: <strong>{addressContact}</strong>
                        </div>
                      )}

                      {computedQuote.clientDoc && (
                        <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '1px' }}>
                          CNPJ/CPF: <strong>{computedQuote.clientDoc}</strong>
                        </div>
                      )}
                    </div>

                    {/* Endereço */}
                    <div className="label-addr" style={{
                      padding: '5px 7px',
                      background: '#f1f5f9',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.76rem',
                      lineHeight: 1.45,
                      color: '#0f172a',
                      flexShrink: 0
                    }}>
                      {addressStreet ? (
                        <div style={{ fontWeight: 700 }}>
                          {addressStreet}
                          {addressNeighborhood ? ` — ${addressNeighborhood}` : ''}
                        </div>
                      ) : null}

                      {(addressCity || addressState || addressZip) && (
                        <div>
                          {addressCity && <span>{addressCity}</span>}
                          {addressState && <span style={{ fontWeight: 700 }}> — {addressState}</span>}
                          {addressZip && <span style={{ marginLeft: '6px' }}>CEP: <strong>{addressZip}</strong></span>}
                        </div>
                      )}

                      {addressPhone && (
                        <div style={{ color: '#334155' }}>
                          Tel: <strong>{addressPhone}</strong>
                        </div>
                      )}

                      {!addressStreet && !addressCity && !addressZip && !addressPhone && (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Endereço de entrega não informado</span>
                      )}
                    </div>

                    {/* Conteúdo / Material */}
                    <div className="label-content" style={{
                      padding: '5px 7px',
                      background: '#fff',
                      borderRadius: '4px',
                      border: '1px solid #94a3b8',
                      flex: 1,
                      minHeight: 0,
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        fontSize: '0.58rem',
                        textTransform: 'uppercase',
                        fontWeight: 800,
                        color: '#64748b',
                        letterSpacing: '0.8px',
                        marginBottom: '2px'
                      }}>
                        Conteúdo / Especificações
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.8rem', lineHeight: 1.3, color: '#0f172a' }}>
                        {computedQuote.description}
                      </div>
                      {observacoes && (
                        <div style={{ marginTop: '3px', fontSize: '0.72rem', fontWeight: 800, color: '#b91c1c' }}>
                          <style>{`@media print { .print-obs { color: #000 !important; } }`}</style>
                          <span className="print-obs">⚠ {observacoes}</span>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* ── COLUNA DIREITA: Volume ── */}
                  <div className="label-col-vol" style={{
                    width: '96px',
                    borderLeft: '2px dashed #000',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 6px',
                    color: '#000',
                    textAlign: 'center',
                    flexShrink: 0
                  }}>
                    <div style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      borderBottom: '1px solid #000',
                      paddingBottom: '4px',
                      width: '100%',
                      lineHeight: 1.4
                    }}>
                      Lote Total<br />
                      <span style={{ fontSize: '0.82rem', fontWeight: 900 }}>
                        {computedQuote.quantity} un.
                      </span>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>Volume</div>
                      <div className="vol-number" style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>
                        {i + 1}
                      </div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>de {volumes}</div>
                    </div>

                    <div style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      borderTop: '1px solid #000',
                      paddingTop: '4px',
                      width: '100%',
                      lineHeight: 1.4
                    }}>
                      Neste vol.<br />
                      <span style={{ fontSize: '0.82rem', fontWeight: 900 }}>
                        {volQty} un.
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

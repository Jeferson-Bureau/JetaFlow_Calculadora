import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Tag, Printer, Package, Search, MapPin, Phone, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const EMPTY_ADDRESS = {
  street: '', neighborhood: '', city: '', state: '', zip: '', phone: '', contact: ''
};

// Extrai os campos de endereço de um cliente do CRM.
const addressFromClient = (c) => ({
  street: c.street || '',
  neighborhood: c.neighborhood || '',
  city: c.city || '',
  state: c.state || '',
  zip: c.zipCode || '',
  phone: c.phone || '',
  contact: c.contactPerson || ''
});

// Layouts de impressão: grid real na folha A4 (retrato, margem @page de 6mm).
const LAYOUTS = {
  1: { label: '1 por folha (A4 inteiro)', cols: '1fr', cardMm: 283, qrPx: 96 },
  2: { label: '2 por folha (A5 landscape)', cols: '1fr', cardMm: 140, qrPx: 88 },
  4: { label: '4 por folha (A6)', cols: '1fr 1fr', cardMm: 140, qrPx: 58 }
};

export default function LabelGenerator({ quotes = [], clients = [] }) {
  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [volumes, setVolumes] = useState(1);
  // Quantidade por volume: só guarda os que o operador editou à mão;
  // os demais seguem a divisão automática do lote.
  const [volOverrides, setVolOverrides] = useState({});
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

  // Endereço de entrega — um único objeto no lugar de 7 useState.
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const setField = (key) => (e) => {
    const value = key === 'state' ? e.target.value.toUpperCase() : e.target.value;
    setAddress((a) => ({ ...a, [key]: value }));
  };

  // Busca de CEP (ViaCEP — responde com CORS liberado, não precisa de proxy).
  const [cepStatus, setCepStatus] = useState({ loading: false, error: '' });
  const streetRef = useRef(null);
  const lastCepRef = useRef('');

  const lookupCep = useCallback(async (rawZip) => {
    const digits = (rawZip || '').replace(/\D/g, '');
    if (digits.length !== 8 || digits === lastCepRef.current) return;
    lastCepRef.current = digits;
    setCepStatus({ loading: true, error: '' });
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepStatus({ loading: false, error: 'CEP não encontrado.' });
        return;
      }
      setAddress((a) => ({
        ...a,
        street: data.logradouro ? `${data.logradouro}, ` : a.street,
        neighborhood: data.bairro || a.neighborhood,
        city: data.localidade || a.city,
        state: (data.uf || a.state).toUpperCase()
      }));
      setCepStatus({ loading: false, error: '' });
      // Foca o logradouro para o usuário completar o número.
      requestAnimationFrame(() => {
        const el = streetRef.current;
        if (el) {
          el.focus();
          const end = el.value.length;
          el.setSelectionRange(end, end);
        }
      });
    } catch {
      setCepStatus({ loading: false, error: 'Falha ao consultar o CEP.' });
    }
  }, []);

  // Dispara a busca quando o CEP chega a 8 dígitos.
  useEffect(() => {
    const digits = (address.zip || '').replace(/\D/g, '');
    if (digits.length === 8) lookupCep(digits);
    else lastCepRef.current = '';
  }, [address.zip, lookupCep]);

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

  const totalQty = computedQuote?.quantity || 0;

  // Divisão automática do lote entre os volumes (resto vai para os primeiros).
  const autoVolQty = useCallback((i) => {
    const base = Math.floor(totalQty / volumes);
    return base + (i < totalQty % volumes ? 1 : 0);
  }, [totalQty, volumes]);

  const volQtyOf = (i) => (
    Object.prototype.hasOwnProperty.call(volOverrides, i) ? volOverrides[i] : autoVolQty(i)
  );

  const setVolQty = (i, raw) => {
    const n = Math.max(0, parseInt(raw, 10) || 0);
    setVolOverrides((o) => ({ ...o, [i]: n }));
  };

  const volSum = Array.from({ length: volumes }).reduce((s, _, i) => s + volQtyOf(i), 0);

  // Trocar de pedido ou mudar o nº de volumes volta tudo para a divisão automática.
  useEffect(() => { setVolOverrides({}); }, [selectedQuoteId, volumes]);

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
  const prevQuoteIdRef = useRef(selectedQuoteId);

  // Atualiza os campos de endereço automaticamente ao selecionar o pedido ou cliente
  useEffect(() => {
    const quoteChanged = prevQuoteIdRef.current !== selectedQuoteId;
    prevQuoteIdRef.current = selectedQuoteId;

    if (matchedClient) {
      // Cliente encontrado no CRM: preenche tudo
      setAddress(addressFromClient(matchedClient));
      lastCepRef.current = (matchedClient.zipCode || '').replace(/\D/g, '');
    } else if (quoteChanged) {
      // Trocou de orçamento e cliente não está no CRM: limpa para nova entrada manual
      setAddress(EMPTY_ADDRESS);
      lastCepRef.current = '';
    }
    // Se não trocou de orçamento e não há match, mantém o que o usuário digitou
  }, [matchedClient, selectedQuoteId]);

  const handleManualClientChange = (val) => {
    setManualClient(val);
    const found = clients.find(c =>
      c.name === val || c.tradeName === val || c.name?.toLowerCase() === val.toLowerCase()
    );
    if (found) {
      setManualDoc(found.doc || '');
      setAddress(addressFromClient(found));
      lastCepRef.current = (found.zipCode || '').replace(/\D/g, '');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const layout = LAYOUTS[labelsPerSheet] || LAYOUTS[4];

  // Payload do QR — compacto para escanear mesmo na etiqueta A6.
  const qrValue = (volIndex) => {
    if (!computedQuote) return '';
    const parts = [
      `PEDIDO ${computedQuote.code}`,
      `VOL ${volIndex + 1}/${volumes}`,
      computedQuote.clientName
    ];
    if (computedQuote.clientDoc) parts.push(`DOC ${computedQuote.clientDoc}`);
    return parts.join(' | ');
  };

  return (
    <div className="label-generator-container">
      <style>{`
        .print-only-logo { display: none; }

        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }

          .print-area {
            position: absolute;
            left: 0; top: 0;
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            display: grid !important;
            grid-template-columns: ${layout.cols} !important;
            gap: 0 !important;
            background: #fff !important;
            box-sizing: border-box !important;
          }

          .no-print { display: none !important; }
          .print-only-logo { display: inline !important; color: #fff !important; }
          .print-obs { color: #000 !important; }

          .label-card {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            height: ${layout.cardMm}mm !important;
            box-sizing: border-box !important;
            border: 1.5px solid #000 !important;
            background: #fff !important;
            color: #000 !important;
            border-radius: 0 !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-shadow: none !important;
          }

          .label-card .label-header { flex-shrink: 0 !important; }

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
            padding: ${labelsPerSheet === 4 ? '4px 8px' : '8px 10px'} !important;
            gap: ${labelsPerSheet === 4 ? '4px' : '6px'} !important;
            overflow: hidden !important;
            min-height: 0 !important;
          }

          .label-card .label-col-vol {
            width: ${labelsPerSheet === 4 ? '86px' : '108px'} !important;
            flex-shrink: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: ${labelsPerSheet === 4 ? '4px 4px' : '8px 6px'} !important;
            border-left: 2px dashed #000 !important;
            box-sizing: border-box !important;
          }

          .label-dest { flex-shrink: 0 !important; }

          .label-addr {
            flex-shrink: 0 !important;
            ${labelsPerSheet === 4 ? 'padding: 3px 6px !important; font-size: 0.72rem !important;' : ''}
          }

          .label-content {
            flex: 1 !important;
            min-height: 0 !important;
            overflow: hidden !important;
            ${labelsPerSheet === 4 ? 'padding: 3px 6px !important;' : ''}
          }

          .label-dest-name {
            ${labelsPerSheet === 4 ? 'font-size: 0.88rem !important;' : ''}
          }

          .vol-number {
            ${labelsPerSheet === 4 ? 'font-size: 1.5rem !important;' : ''}
          }

          body { background: #fff !important; }

          @page {
            margin: 6mm;
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
                Geração de etiquetas para caixas e volumes com endereço puxado do CRM, busca de CEP e QR Code do pedido.
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
            <label className="form-label" htmlFor="label-search">Buscar Pedido / Orçamento no Histórico</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="label-search"
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
            <label className="form-label" htmlFor="label-quote-select">Selecionar Pedido</label>
            <select
              id="label-quote-select"
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
              <label className="form-label" htmlFor="label-manual-client" style={{ color: 'var(--brand-cyan)' }}>
                Destinatário (CRM ou Avulso)
              </label>
              <input
                id="label-manual-client"
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
              <label className="form-label" htmlFor="label-manual-doc">CNPJ / CPF</label>
              <input
                id="label-manual-doc"
                type="text"
                className="form-input"
                value={manualDoc}
                onChange={(e) => setManualDoc(e.target.value)}
                placeholder="Ex: 00.000.000/0001-00"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="label-manual-code">Nº Pedido / Código</label>
              <input
                id="label-manual-code"
                type="text"
                className="form-input"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Ex: PED-1025"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="label-manual-qty">Qtd Total do Lote</label>
              <input
                id="label-manual-qty"
                type="number"
                min="1"
                className="form-input"
                value={manualQty}
                onChange={(e) => setManualQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
              <label className="form-label" htmlFor="label-manual-desc">Descrição do Material / Conteúdo</label>
              <input
                id="label-manual-desc"
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.2fr 1fr 0.6fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="label-addr-zip" style={{ fontSize: '0.75rem' }}>CEP</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="label-addr-zip"
                    type="text"
                    className="form-input"
                    placeholder="87000-000"
                    inputMode="numeric"
                    value={address.zip}
                    onChange={setField('zip')}
                    onBlur={() => lookupCep(address.zip)}
                  />
                  {cepStatus.loading && (
                    <Loader2 size={14} className="cep-spin" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-cyan)' }} />
                  )}
                </div>
                {cepStatus.error && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: '3px' }}>{cepStatus.error}</span>
                )}
                <style>{`@keyframes cep-spin { to { transform: translateY(-50%) rotate(360deg); } } .cep-spin { animation: cep-spin 0.8s linear infinite; }`}</style>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="label-addr-street" style={{ fontSize: '0.75rem' }}>Logradouro & Número</label>
                <input
                  id="label-addr-street"
                  ref={streetRef}
                  type="text"
                  className="form-input"
                  placeholder="Ex: Av. Brasil, 1200 ou Rua A, nº 70"
                  value={address.street}
                  onChange={setField('street')}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="label-addr-neigh" style={{ fontSize: '0.75rem' }}>Bairro</label>
                <input
                  id="label-addr-neigh"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Centro / Pq. Industrial"
                  value={address.neighborhood}
                  onChange={setField('neighborhood')}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="label-addr-city" style={{ fontSize: '0.75rem' }}>Cidade</label>
                <input
                  id="label-addr-city"
                  type="text"
                  className="form-input"
                  placeholder="Ex: Maringá, Peabiru, Sarandi"
                  value={address.city}
                  onChange={setField('city')}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="label-addr-uf" style={{ fontSize: '0.75rem' }}>UF</label>
                <input
                  id="label-addr-uf"
                  type="text"
                  className="form-input"
                  placeholder="PR"
                  maxLength={2}
                  style={{ textTransform: 'uppercase' }}
                  value={address.state}
                  onChange={setField('state')}
                />
              </div>
            </div>

            {/* Contact & Phone Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="label-addr-phone" style={{ fontSize: '0.75rem' }}>Telefone / WhatsApp de Contato</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="label-addr-phone"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '32px' }}
                    placeholder="Ex: (44) 3032-6868 ou (44) 99851-1998"
                    value={address.phone}
                    onChange={setField('phone')}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="label-addr-contact" style={{ fontSize: '0.75rem' }}>Pessoa de Contato / Aos Cuidados de (A/C)</label>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="label-addr-contact"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '32px' }}
                    placeholder="Ex: Almoxarifado / Responsável pelo Recebimento"
                    value={address.contact}
                    onChange={setField('contact')}
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
            gridTemplateColumns: '140px 200px 180px 1fr',
            gap: '14px',
            background: 'var(--tint-hairline)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            alignItems: 'end'
          }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="label-volumes" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Package size={14} color="var(--brand-yellow)" /> Volumes
              </label>
              <input
                id="label-volumes"
                type="number"
                className="form-input"
                min="1"
                value={volumes}
                onChange={(e) => setVolumes(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="label-layout">Tamanho / Layout</label>
              <select
                id="label-layout"
                className="form-select"
                value={labelsPerSheet}
                onChange={(e) => setLabelsPerSheet(Number(e.target.value))}
              >
                {Object.entries(LAYOUTS).map(([n, cfg]) => (
                  <option key={n} value={n}>{cfg.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="label-nf">Nota Fiscal (Opcional)</label>
              <input
                id="label-nf"
                type="text"
                className="form-input"
                placeholder="Ex: NF 1234"
                value={notaFiscal}
                onChange={(e) => setNotaFiscal(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="label-obs">Observações de Transporte / Caixa</label>
              <input
                id="label-obs"
                type="text"
                className="form-input"
                placeholder="Ex: Cuidado Frágil / Manter Seco"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Quantidade por volume (editável — as caixas nem sempre levam a mesma qtd) */}
        {computedQuote && volumes > 1 && (
          <div style={{
            marginTop: '16px',
            background: 'var(--tint-hairline)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                Quantidade em cada volume
              </span>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: volSum === totalQty ? 'var(--success)' : 'var(--brand-yellow)'
              }}>
                Lote total: {volSum} un.
                {volSum !== totalQty && ` (orçamento: ${totalQty} un. · ${volSum > totalQty ? '+' : '−'}${Math.abs(volSum - totalQty)})`}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {Array.from({ length: volumes }).map((_, i) => (
                <div key={i} className="form-group" style={{ marginBottom: 0, width: '110px' }}>
                  <label className="form-label" htmlFor={`label-volqty-${i}`} style={{ fontSize: '0.72rem' }}>
                    Vol. {i + 1}/{volumes}
                  </label>
                  <input
                    id={`label-volqty-${i}`}
                    type="number"
                    min="0"
                    className="form-input"
                    value={volQtyOf(i)}
                    onChange={(e) => setVolQty(i, e.target.value)}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setVolOverrides({})}
                style={{
                  alignSelf: 'end',
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Dividir igual
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Printable Area */}
      {computedQuote && (
        <div className="print-area" style={{
          display: 'grid',
          gridTemplateColumns: layout.cols,
          gap: '16px'
        }}>
          {Array.from({ length: volumes }).map((_, i) => {
            const volQty = volQtyOf(i);

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
                    : labelsPerSheet === 2 ? '240px'
                    : '150px'
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
                  color: '#ffffff',
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

                      {address.contact && (
                        <div style={{ fontSize: '0.72rem', color: '#334155', marginTop: '1px' }}>
                          A/C: <strong>{address.contact}</strong>
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
                      {address.street ? (
                        <div style={{ fontWeight: 700 }}>
                          {address.street}
                          {address.neighborhood ? ` — ${address.neighborhood}` : ''}
                        </div>
                      ) : null}

                      {(address.city || address.state || address.zip) && (
                        <div>
                          {address.city && <span>{address.city}</span>}
                          {address.state && <span style={{ fontWeight: 700 }}> — {address.state}</span>}
                          {address.zip && <span style={{ marginLeft: '6px' }}>CEP: <strong>{address.zip}</strong></span>}
                        </div>
                      )}

                      {address.phone && (
                        <div style={{ color: '#334155' }}>
                          Tel: <strong>{address.phone}</strong>
                        </div>
                      )}

                      {!address.street && !address.city && !address.zip && !address.phone && (
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
                          <span className="print-obs">⚠ {observacoes}</span>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* ── COLUNA DIREITA: Volume + QR ── */}
                  <div className="label-col-vol" style={{
                    width: '108px',
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
                        {volSum} un.
                      </span>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>Volume</div>
                      <div className="vol-number" style={{ fontSize: '2rem', fontWeight: 400, lineHeight: 1 }}>
                        <span style={{ fontWeight: 800 }}>{i + 1}</span>/{volumes}
                      </div>
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

                    <div style={{ marginTop: '4px', background: '#fff', padding: '2px', borderRadius: '2px', lineHeight: 0 }}>
                      <QRCodeSVG
                        value={qrValue(i)}
                        size={layout.qrPx}
                        level="M"
                        marginSize={0}
                        bgColor="#ffffff"
                        fgColor="#000000"
                      />
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

import React, { useState } from 'react';
import { X, Printer, CheckCircle2, Building, User, Phone, Mail, Calendar, Plus, Trash2, Download, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function QuoteGenerator({
  budgetResult,
  selectedPaper,
  selectedSheet,
  productW,
  productH,
  colors,
  mode,
  selectedFinishings = [],
  clients = [],
  onAddClient,
  onClose
}) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState(clients[0] ? clients[0].name : 'Cliente Exemplo Ltda');
  const [clientDoc, setClientDoc] = useState(clients[0] ? clients[0].doc : '12.345.678/0001-90');
  const [clientPhone, setClientPhone] = useState(clients[0] ? clients[0].phone : '(44) 99999-8888');
  const [clientEmail, setClientEmail] = useState(clients[0] ? clients[0].email : 'contato@cliente.com.br');
  const [quoteValidity, setQuoteValidity] = useState('7 Dias');
  const [deliveryTerm, setDeliveryTerm] = useState('3 a 5 Dias Úteis');
  const [paymentTerms, setPaymentTerms] = useState('50% Sinal no Pedido + 50% na Entrega / PIX ou Cartão');
  const [generalNotes, setGeneralNotes] = useState('Valores sujeitos a alteração sem aviso prévio. Arte final sob responsabilidade do cliente.');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Item inicial vindo do cálculo atual
  const initialItem = {
    id: `item-${Date.now()}`,
    description: `Produção Gráfica — ${mode === 'digital' ? 'Impressão Digital A3/SRA3' : mode === 'offset' ? 'Off-set Industrial CTP' : 'Comunicação Visual'}`,
    paperName: selectedPaper?.name || 'Couché 150g',
    dimensions: `${productW} x ${productH} mm`,
    colors: colors || '4x4 (Colorido)',
    finishings: selectedFinishings.length > 0 ? selectedFinishings.map(f => f.name.replace('Positiva - ', '').replace('JetaPrint - ', '')).join(', ') : 'Corte e Refile Guilhotina',
    quantity: budgetResult?.quantity || 1000,
    unitPrice: budgetResult?.costs?.unitPrice || 0,
    totalPrice: budgetResult?.costs?.finalPrice || 0
  };

  const [items, setItems] = useState([initialItem]);

  // Form para inclusão de novo item
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPaper, setNewItemPaper] = useState('Couché 150g');
  const [newItemDim, setNewItemDim] = useState('210 x 297 mm (A4)');
  const [newItemColors, setNewItemColors] = useState('4x4 (Colorido Frente e Verso)');
  const [newItemFinishings, setNewItemFinishings] = useState('Corte e Refile');
  const [newItemQty, setNewItemQty] = useState(500);
  const [newItemUnitPrice, setNewItemUnitPrice] = useState(0.50);

  const handleAddItem = () => {
    if (!newItemDesc.trim()) return;
    const qty = Number(newItemQty) || 1;
    const unitP = Number(newItemUnitPrice) || 0;
    const totalP = qty * unitP;

    const added = {
      id: `item-${Date.now()}`,
      description: newItemDesc,
      paperName: newItemPaper,
      dimensions: newItemDim,
      colors: newItemColors,
      finishings: newItemFinishings,
      quantity: qty,
      unitPrice: unitP,
      totalPrice: totalP
    };

    setItems([...items, added]);
    setNewItemDesc('');
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const grandTotal = items.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0);

  const handleSelectClient = (clientId) => {
    setSelectedClientId(clientId);
    const found = clients.find(c => c.id === clientId);
    if (found) {
      setClientName(found.name || '');
      setClientDoc(found.doc || '');
      setClientPhone(found.phone || '');
      setClientEmail(found.email || '');
    }
  };

  const handleQuickSaveClient = () => {
    if (!clientName.trim() || !onAddClient) return;
    const newClient = {
      id: `cli-${Date.now()}`,
      name: clientName,
      docType: clientDoc.length > 14 ? 'cnpj' : 'cpf',
      doc: clientDoc,
      phone: clientPhone,
      email: clientEmail,
      createdAt: new Date().toISOString().split('T')[0]
    };
    onAddClient(newClient);
    setSelectedClientId(newClient.id);
    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 2500);
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('printable-quote');
    if (!element) return;

    setIsExportingPdf(true);

    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     `Proposta_JetaPrint_${clientName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsExportingPdf(false);
    }).catch(err => {
      console.error(err);
      setIsExportingPdf(false);
      window.print();
    });
  };

  const todayStr = new Date().toLocaleDateString('pt-BR');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      overflowY: 'auto'
    }}>
      
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '920px',
        maxHeight: '92vh',
        overflowY: 'auto',
        background: '#ffffff',
        color: '#0f172a',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>

        {/* Modal Action Controls (Hidden on Print) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#17355B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText color="#00a8e8" size={22} /> Gerador de Proposta Comercial JETAPRINT
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Dados oficiais: CNPJ 49.460.198/0001-85 | Sarandi - PR
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              style={{
                padding: '10px 18px',
                background: 'linear-gradient(135deg, #00a8e8, #0077b6)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Download size={16} /> {isExportingPdf ? 'Gerando PDF...' : 'Baixar PDF Direto'}
            </button>

            <button
              onClick={() => window.print()}
              style={{
                padding: '10px 18px',
                background: 'linear-gradient(135deg, #17355B, #0d213a)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Printer size={16} /> Imprimir
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '10px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <X size={18} color="#334155" />
            </button>
          </div>
        </div>

        {/* Painel de Edição (No-Print) */}
        <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc', padding: '18px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
          
          {/* Dados do Cliente */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                1. Dados do Cliente
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
              <input
                type="text"
                placeholder="Nome / Razão Social"
                list="quote-clients-list"
                value={clientName}
                onChange={(e) => {
                  const val = e.target.value;
                  setClientName(val);
                  const matchedClient = clients.find(c => c.name === val || c.tradeName === val);
                  if (matchedClient) {
                    setSelectedClientId(matchedClient.id);
                    setClientDoc(matchedClient.doc || '');
                    setClientPhone(matchedClient.phone || '');
                    setClientEmail(matchedClient.email || '');
                  } else {
                    setSelectedClientId('');
                  }
                }}
                style={{ padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
              />
              <datalist id="quote-clients-list">
                {clients.map(c => (
                  <option key={c.id} value={c.name}>{c.tradeName && `(${c.tradeName})`}</option>
                ))}
              </datalist>
              <input
                type="text"
                placeholder="CNPJ / CPF"
                value={clientDoc}
                onChange={(e) => setClientDoc(e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
              />
              <input
                type="text"
                placeholder="Telefone / Whats"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
              />
              <input
                type="text"
                placeholder="E-mail"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                type="button"
                onClick={handleQuickSaveClient}
                style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, background: '#e0f2fe', color: '#0284c7', border: '1px solid #7dd3fc', borderRadius: '6px', cursor: 'pointer' }}
              >
                💾 Salvar no CRM
              </button>
            </div>
          </div>

          {/* Adicionar Múltiplos Itens ao Orçamento */}
          <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '12px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              2. Adicionar Outro Item / Produto ao Orçamento Multi-Itens
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="Descrição do Material (ex: Cartão de Visita)"
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
              />
              <input
                type="text"
                placeholder="Papel (ex: Couché 300g)"
                value={newItemPaper}
                onChange={(e) => setNewItemPaper(e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
              />
              <input
                type="number"
                placeholder="Quantidade"
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Valor Unit. (R$)"
                value={newItemUnitPrice}
                onChange={(e) => setNewItemUnitPrice(e.target.value)}
                style={{ padding: '7px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
              />
            </div>

            <button
              onClick={handleAddItem}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 700,
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Plus size={14} /> Incluir Produto na Tabela
            </button>
          </div>

          {/* Condições & Observações Personalizadas */}
          <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Validade:</label>
              <input
                type="text"
                value={quoteValidity}
                onChange={(e) => setQuoteValidity(e.target.value)}
                style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Prazo de Produção:</label>
              <input
                type="text"
                value={deliveryTerm}
                onChange={(e) => setDeliveryTerm(e.target.value)}
                style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Observações / Condições:</label>
              <input
                type="text"
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem' }}
              />
            </div>
          </div>

        </div>

        {/* ── PROPOSTA COMERCIAL IMPRESSA (PDF OFICIAL) ── */}
        <div id="printable-quote" style={{ fontFamily: "'Outfit', sans-serif", padding: '10px', background: '#ffffff' }}>
          
          {/* Header com Logo Oficial JETAPRINT */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #17355B', paddingBottom: '16px', marginBottom: '18px' }}>
            <div>
              <img 
                src="/JETAPRINT_LOGO_01_2026-01.jpg" 
                alt="JETAPRINT Gráfica Multimídia" 
                style={{ height: '48px', objectFit: 'contain' }}
              />
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                <strong>JETA PRINT GRAFICA MULTIMIDIA LTDA</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#17355B' }}>
                PROPOSTA COMERCIAL
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Data: <strong>{todayStr}</strong> | Validade: <strong>{quoteValidity}</strong>
              </div>
            </div>
          </div>

          {/* Box Cliente & Emissor com CNPJ/IE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px', fontSize: '0.82rem' }}>
            
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#17355B', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                EMISSOR / GRÁFICA:
              </div>
              <div><strong>JETA PRINT GRAFICA MULTIMIDIA LTDA</strong></div>
              <div><strong>CNPJ:</strong> 49.460.198/0001-85 | <strong>I.E.:</strong> 91140286-62</div>
              <div>Rua Ignácio Pelchibeski, 1244 - Sarandi - PR</div>
              <div><strong>Contato:</strong> (44) 9956-8620 / jeferson.arte@gmail.com</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#17355B', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                DADOS DO CLIENTE:
              </div>
              <div><strong>Cliente:</strong> {clientName}</div>
              <div><strong>CNPJ/CPF:</strong> {clientDoc}</div>
              <div><strong>Telefone:</strong> {clientPhone}</div>
              <div><strong>E-mail:</strong> {clientEmail}</div>
            </div>

          </div>

          {/* Tabela de Produtos / Itens da Proposta */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#17355B', borderBottom: '2px solid #17355B', paddingBottom: '4px', marginBottom: '10px', textTransform: 'uppercase' }}>
            ESPECIFICAÇÕES DOS MATERIAIS & TABELA DE PREÇOS
          </h4>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '18px' }}>
            <thead>
              <tr style={{ background: '#17355B', color: '#ffffff', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', width: '40%' }}>Descrição do Material & Papel</th>
                <th style={{ padding: '8px 10px' }}>Dimensões / Acabamento</th>
                <th style={{ padding: '8px 10px', textAlign: 'center' }}>Qtd</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Unitário</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total</th>
                <th className="no-print" style={{ padding: '8px', width: '30px' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '10px' }}>
                    <strong style={{ color: '#0f172a' }}>{item.description}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      Substrato: <strong>{item.paperName}</strong> | Cores: {item.colors}
                    </div>
                  </td>
                  <td style={{ padding: '10px', fontSize: '0.78rem', color: '#334155' }}>
                    <div><strong>Tam:</strong> {item.dimensions}</div>
                    <div><strong>Acab:</strong> {item.finishings}</div>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700 }}>
                    {item.quantity.toLocaleString()} un
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    R$ {Number(item.unitPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 800, color: '#17355B' }}>
                    R$ {Number(item.totalPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="no-print" style={{ padding: '6px', textAlign: 'center' }}>
                    {items.length > 1 && (
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        title="Remover Item"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
                <td colSpan={4} style={{ padding: '10px', textAlign: 'right', fontSize: '0.9rem', color: '#17355B' }}>
                  INVESTIMENTO TOTAL DA PROPOSTA:
                </td>
                <td style={{ padding: '10px', textAlign: 'right', fontSize: '1.1rem', color: '#00a8e8' }}>
                  R$ {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="no-print"></td>
              </tr>
            </tfoot>
          </table>

          {/* Condições de Pagamento e Observações */}
          <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: 700, color: '#17355B', marginBottom: '4px' }}>CONDIÇÕES DE PAGAMENTO & INFORMAÇÕES BANCÁRIAS:</div>
            <div>• <strong>Pagamento:</strong> {paymentTerms}</div>
            <div>• <strong>Prazo de Entrega:</strong> {deliveryTerm} após aprovação da arte final</div>
            <div>• <strong>Chave PIX Oficial (CNPJ):</strong> 49.460.198/0001-85 (JETA PRINT GRAFICA MULTIMIDIA LTDA)</div>
            {generalNotes && (
              <div style={{ marginTop: '4px', color: '#64748b' }}>
                • <strong>Observações:</strong> {generalNotes}
              </div>
            )}
          </div>

          {/* Assinatura e Aceite */}
          <div style={{ marginTop: '30px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.78rem', color: '#475569' }}>
            <div style={{ textAlign: 'center', width: '240px' }}>
              <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
              JETA PRINT GRAFICA MULTIMIDIA LTDA<br />
              CNPJ: 49.460.198/0001-85
            </div>

            <div style={{ textAlign: 'center', width: '240px' }}>
              <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
              ACEITE DO CLIENTE (DATA / ASSINATURA)
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

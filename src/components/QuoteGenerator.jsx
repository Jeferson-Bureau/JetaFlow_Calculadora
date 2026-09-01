import React, { useState } from 'react';
import { X, Printer, CheckCircle2, Building, User, Phone, Mail, Calendar } from 'lucide-react';

export default function QuoteGenerator({
  budgetResult,
  selectedPaper,
  selectedSheet,
  productW,
  productH,
  colors,
  mode,
  selectedFinishings,
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
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);

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

  const todayStr = new Date().toLocaleDateString('pt-BR');
  const costs = budgetResult ? budgetResult.costs : {};

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
        maxWidth: '880px',
        maxHeight: '90vh',
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
              Gerador de Proposta Comercial JETAPRINT
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Dados oficiais: CNPJ 49.460.198/0001-85 | I.E. 91140286-62 (Sarandi - PR)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
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
              <Printer size={16} /> Imprimir / PDF
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

        {/* Form para preenchimento de Dados do Cliente (No-Print) */}
        <div className="no-print" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Dados do Cliente para o Orçamento:
            </h4>

            {/* Client Select Dropdown */}
            {clients.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Buscar Cliente:</span>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleSelectClient(e.target.value)}
                  style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', background: '#ffffff', fontWeight: 600 }}
                >
                  <option value="">-- Selecionar da Base --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>[{c.code || 'CLI-A0000'}] {c.tradeName || c.name} ({c.doc || 'Sem Doc'})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <input
              type="text"
              placeholder="Nome / Razão Social do Cliente"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
            <input
              type="text"
              placeholder="CNPJ / CPF"
              value={clientDoc}
              onChange={(e) => setClientDoc(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
            <input
              type="text"
              placeholder="Telefone / WhatsApp"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
            <input
              type="text"
              placeholder="E-mail"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
          </div>

          {/* Quick Save to CRM button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', gap: '10px', alignItems: 'center' }}>
            {savedSuccessMsg && (
              <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Salvo no Cadastro de Clientes!
              </span>
            )}
            <button
              type="button"
              onClick={handleQuickSaveClient}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 700,
                background: '#e0f2fe',
                color: '#0284c7',
                border: '1px solid #7dd3fc',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              💾 Salvar como Novo Cliente no CRM
            </button>
          </div>
        </div>

        {/* PROPOSTA COMERCIAL IMPRESSA (FORMATAÇÃO OFICIAL) */}
        <div id="printable-quote" style={{ fontFamily: "'Outfit', sans-serif" }}>
          
          {/* Header com Logo Oficial JETAPRINT */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #17355B', paddingBottom: '16px', marginBottom: '20px' }}>
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

          {/* Box Cliente & Empresa Emissora com CNPJ/IE Oficial */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', fontSize: '0.85rem' }}>
            
            {/* Dados da Gráfica */}
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#17355B', marginBottom: '4px', textTransform: 'uppercase' }}>
                EMISSOR / GRÁFICA:
              </div>
              <div><strong>JETA PRINT GRAFICA MULTIMIDIA LTDA</strong></div>
              <div><strong>CNPJ:</strong> 49.460.198/0001-85</div>
              <div><strong>Inscrição Estadual:</strong> 91140286-62 (PR)</div>
              <div>Rua Ignácio Pelchibeski, 1244 - Jd. Nova Independência</div>
              <div>Sarandi - PR | CEP: 87.114-665</div>
              <div><strong>Contato:</strong> (44) 9956-8620 / (44) 3028-1300</div>
              <div><strong>E-mail:</strong> jeferson.arte@gmail.com</div>
            </div>

            {/* Dados do Cliente */}
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#17355B', marginBottom: '4px', textTransform: 'uppercase' }}>
                DADOS DO CLIENTE:
              </div>
              <div><strong>Cliente:</strong> {clientName}</div>
              <div><strong>CNPJ/CPF:</strong> {clientDoc}</div>
              <div><strong>Telefone:</strong> {clientPhone}</div>
              <div><strong>E-mail:</strong> {clientEmail}</div>
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                Regime Tributário Emissor: <strong>Simples Nacional</strong>
              </div>
            </div>

          </div>

          {/* Especificações Técnicas do Produto */}
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#17355B', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '12px' }}>
            ESPECIFICAÇÕES TÉCNICAS DO MATERIAL
          </h4>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '20px' }}>
            <tbody>
              <tr style={{ background: '#f1f5f9' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700, width: '30%' }}>Modalidade de Impressão:</td>
                <td style={{ padding: '8px 12px' }}>
                  {mode === 'digital' ? 'Impressão Digital de Alta Definição' : mode === 'offset' ? 'Impressão Off-set Industrial' : 'Comunicação Visual Grande Formato'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700 }}>Substrato / Papel:</td>
                <td style={{ padding: '8px 12px' }}>{selectedPaper.name || 'Couché 150g'}</td>
              </tr>
              <tr style={{ background: '#f1f5f9' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700 }}>Formato Acabado:</td>
                <td style={{ padding: '8px 12px' }}>{productW} x {productH} mm</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700 }}>Cores / Impressão:</td>
                <td style={{ padding: '8px 12px' }}>{colors}</td>
              </tr>
              <tr style={{ background: '#f1f5f9' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700 }}>Acabamentos Incluídos:</td>
                <td style={{ padding: '8px 12px' }}>
                  {selectedFinishings.length > 0 ? selectedFinishings.map(f => f.name.replace('Positiva - ', '').replace('JetaPrint - ', '')).join(', ') : 'Corte e Refile Standard em Guilhotina'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700 }}>Prazo de Produção:</td>
                <td style={{ padding: '8px 12px' }}>{deliveryTerm} após aprovação da arte final</td>
              </tr>
            </tbody>
          </table>

          {/* Tabela de Preços & Valores */}
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#17355B', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginBottom: '12px' }}>
            INVESTIMENTO & CONDIÇÕES
          </h4>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '20px' }}>
            <thead>
              <tr style={{ background: '#17355B', color: '#ffffff', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>Item / Descrição</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Quantidade</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Valor Unitário</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Valor Total</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '12px' }}>
                  <strong>Produção Gráfica Completa JETAPRINT</strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Inclui papel, impressões, acabamentos e controle de qualidade.
                  </div>
                </td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700 }}>
                  {budgetResult.quantity ? budgetResult.quantity.toLocaleString() : 1} un
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  R$ {Number(costs.unitPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#17355B', fontSize: '1rem' }}>
                  R$ {Number(costs.finalPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Condições de Pagamento */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 700, color: '#17355B', marginBottom: '4px' }}>CONDIÇÕES DE PAGAMENTO & INFORMAÇÕES BANCÁRIAS:</div>
            <div>• <strong>Pagamento:</strong> {paymentTerms}</div>
            <div>• <strong>Chave PIX Oficial (CNPJ):</strong> 49.460.198/0001-85 (JETA PRINT GRAFICA MULTIMIDIA LTDA)</div>
          </div>

          {/* Assinatura e Aceite */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.8rem', color: '#475569' }}>
            <div style={{ textAlign: 'center', width: '250px' }}>
              <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
              JETA PRINT GRAFICA MULTIMIDIA LTDA<br />
              CNPJ: 49.460.198/0001-85
            </div>

            <div style={{ textAlign: 'center', width: '250px' }}>
              <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
              ACEITE DO CLIENTE (DATA / ASSINATURA)
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

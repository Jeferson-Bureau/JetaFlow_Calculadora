import React, { useState, useMemo } from 'react';
import { FileText, Search, Plus, Trash2, Printer, Eye, Copy, CheckCircle2, Clock, Calendar, DollarSign, User, AlertCircle, FileCheck, Edit, X, Save, RefreshCw } from 'lucide-react';

export default function QuoteHistoryManager({
  quotes = [],
  onUpdateQuote,
  onDeleteQuote,
  onOpenQuoteModal,
  onReopenQuoteInCalculator
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingQuote, setEditingQuote] = useState(null);

  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      const matchSearch =
        (q.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || q.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [quotes, searchTerm, statusFilter]);

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingQuote || !onUpdateQuote) return;
    onUpdateQuote(editingQuote);
    setEditingQuote(null);
  };

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'aprovado':
        return <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>Aprovado</span>;
      case 'enviado':
        return <span style={{ background: 'rgba(0, 168, 232, 0.2)', color: '#00a8e8', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>Enviado ao Cliente</span>;
      case 'recusado':
        return <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>Recusado</span>;
      default:
        return <span style={{ background: 'rgba(247, 181, 0, 0.2)', color: '#f7b500', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>Em Rascunho</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header do Módulo */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText color="var(--brand-cyan)" size={24} /> Histórico & Gestão de Orçamentos
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Consulte e edite orçamentos salvos, altere status de vendas e reimprima propostas em PDF.
          </p>
        </div>

        {/* Filtros e Busca */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Buscar por cliente, código ou item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <option value="all">Todos os Status</option>
            <option value="rascunho">Em Rascunho</option>
            <option value="enviado">Enviados</option>
            <option value="aprovado">Aprovados</option>
            <option value="recusado">Recusados</option>
          </select>
        </div>
      </div>

      {/* Tabela de Orçamentos */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {filteredQuotes.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={32} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
            <div>Nenhum orçamento cadastrado ou localizado no filtro.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                <th style={{ padding: '14px 16px' }}>Código & Data</th>
                <th style={{ padding: '14px 16px' }}>Cliente / Documento</th>
                <th style={{ padding: '14px 16px' }}>Descrição do Material</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Qtd</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Valor Total</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((q) => (
                <tr key={q.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s ease' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <strong style={{ color: 'var(--brand-cyan)', fontSize: '0.9rem' }}>{q.code || 'ORC-000'}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Calendar size={12} /> {q.date || new Date().toLocaleDateString('pt-BR')}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <strong style={{ color: '#ffffff' }}>{q.clientName || 'Cliente Balcão'}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.clientDoc || 'Sem Doc'}</div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#ffffff', fontWeight: 600 }}>{q.description || 'Produção Gráfica'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Papel: {q.paperName || 'Couché'} | {q.dimensions || 'A4'}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, color: '#ffffff' }}>
                    {q.quantity ? q.quantity.toLocaleString() : 1} un
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: 'var(--brand-cyan)', fontSize: '1rem' }}>
                    {formatCurrency(q.totalValue)}
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    {getStatusBadge(q.status)}
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <button
                        onClick={() => onReopenQuoteInCalculator && onReopenQuoteInCalculator(q)}
                        title="Recarregar Parâmetros na Calculadora"
                        style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: 'var(--success)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        <RefreshCw size={14} /> Recarregar
                      </button>

                      <button
                        onClick={() => setEditingQuote({ ...q })}
                        title="Editar Dados e Status"
                        style={{ background: 'rgba(247, 181, 0, 0.15)', border: '1px solid rgba(247, 181, 0, 0.4)', color: 'var(--brand-yellow)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        <Edit size={14} /> Editar
                      </button>

                      <button
                        onClick={() => onOpenQuoteModal && onOpenQuoteModal(q)}
                        title="Visualizar / Reemitir Proposta PDF"
                        style={{ background: 'rgba(0, 168, 232, 0.15)', border: '1px solid rgba(0, 168, 232, 0.4)', color: 'var(--brand-cyan)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        <Printer size={14} /> PDF
                      </button>

                      {onDeleteQuote && (
                        <button
                          onClick={() => onDeleteQuote(q.id)}
                          title="Excluir Orçamento"
                          style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DE EDIÇÃO DE ORÇAMENTO */}
      {editingQuote && (
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
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '650px',
            background: '#0f172a',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            color: '#ffffff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--brand-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={20} /> Editar Orçamento [{editingQuote.code}]
              </h3>
              <button onClick={() => setEditingQuote(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Nome / Razão Social do Cliente</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingQuote.clientName || ''}
                    onChange={(e) => setEditingQuote({ ...editingQuote, clientName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CNPJ / CPF do Cliente</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingQuote.clientDoc || ''}
                    onChange={(e) => setEditingQuote({ ...editingQuote, clientDoc: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Descrição do Material / Produto</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingQuote.description || ''}
                  onChange={(e) => setEditingQuote({ ...editingQuote, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={editingQuote.quantity || 1}
                    onChange={(e) => setEditingQuote({ ...editingQuote, quantity: Number(e.target.value) || 1 })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    style={{ fontWeight: 700, color: 'var(--brand-cyan)' }}
                    value={editingQuote.totalValue || 0}
                    onChange={(e) => setEditingQuote({ ...editingQuote, totalValue: Number(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status da Venda</label>
                  <select
                    className="form-select"
                    style={{ fontWeight: 700 }}
                    value={editingQuote.status || 'rascunho'}
                    onChange={(e) => setEditingQuote({ ...editingQuote, status: e.target.value })}
                  >
                    <option value="rascunho">Em Rascunho</option>
                    <option value="enviado">Enviado ao Cliente</option>
                    <option value="aprovado">Aprovado (Venda Fechada)</option>
                    <option value="recusado">Recusado</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingQuote(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: '#ffffff', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--brand-cyan), #0077b6)', border: 'none', color: '#ffffff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={16} /> Salvar Alterações
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}


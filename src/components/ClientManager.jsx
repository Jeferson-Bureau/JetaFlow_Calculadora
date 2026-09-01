import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  X,
  Check,
  Plus,
  Briefcase,
  Copy,
  Hash
} from 'lucide-react';

export default function ClientManager({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onResetClients
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDocType, setFilterDocType] = useState('all'); // 'all', 'cnpj', 'cpf'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    tradeName: '',
    docType: 'cnpj',
    doc: '',
    phone: '',
    email: '',
    contactPerson: '',
    street: '',
    number: '',
    neighborhood: '',
    city: 'Sarandi',
    state: 'PR',
    zipCode: '',
    notes: ''
  });

  const openNewClientModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      tradeName: '',
      docType: 'cnpj',
      doc: '',
      phone: '',
      email: '',
      contactPerson: '',
      street: '',
      number: '',
      neighborhood: '',
      city: 'Sarandi',
      state: 'PR',
      zipCode: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditClientModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      tradeName: client.tradeName || '',
      docType: client.docType || 'cnpj',
      doc: client.doc || '',
      phone: client.phone || '',
      email: client.email || '',
      contactPerson: client.contactPerson || '',
      street: client.street || '',
      number: client.number || '',
      neighborhood: client.neighborhood || '',
      city: client.city || 'Sarandi',
      state: client.state || 'PR',
      zipCode: client.zipCode || '',
      notes: client.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingClient) {
      onUpdateClient({
        ...editingClient,
        ...formData
      });
    } else {
      const newClient = {
        id: `cli-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onAddClient(newClient);
    }

    setIsModalOpen(false);
  };

  const handleCopyClient = (client) => {
    const info = `Código: ${client.code || ''}\nFantasia: ${client.tradeName || client.name}\nRazão Social: ${client.name}\nCPF/CNPJ: ${client.doc}\nTel: ${client.phone}\nE-mail: ${client.email}\nContato: ${client.contactPerson}`;
    navigator.clipboard.writeText(info);
    setCopiedId(client.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered Clients List
  const filteredClients = clients.filter(c => {
    const matchesSearch =
      (c.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.tradeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.doc || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDocType = filterDocType === 'all' || c.docType === filterDocType;

    return matchesSearch && matchesDocType;
  });

  const totalCnpj = clients.filter(c => c.docType === 'cnpj').length;
  const totalCpf = clients.filter(c => c.docType === 'cpf').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner & Action Controls */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(0, 168, 232, 0.15)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(0, 168, 232, 0.3)' }}>
            <Users size={28} color="var(--brand-cyan)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Gestão e Cadastro de Clientes (CRM)
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Base central de clientes da JETAPRINT para emanação automática de orçamentos e propostas comerciais.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {onResetClients && (
            <button
              type="button"
              onClick={onResetClients}
              title="Recarregar a lista inicial dos 13 clientes oficial"
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'var(--bg-input)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🔄 Recarregar 13 Clientes
            </button>
          )}

          <button
            onClick={openNewClientModal}
            style={{
              padding: '12px 22px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--brand-cyan), #0077b6)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(0, 168, 232, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={18} /> Novo Cliente
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        
        <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total de Clientes
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
            {clients.length}
          </div>
        </div>

        <div style={{ background: 'rgba(0, 168, 232, 0.06)', border: '1px solid rgba(0, 168, 232, 0.2)', borderRadius: '12px', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-cyan)', textTransform: 'uppercase' }}>
            Pessoa Jurídica (CNPJ)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-cyan)', marginTop: '2px' }}>
            {totalCnpj}
          </div>
        </div>

        <div style={{ background: 'rgba(230, 46, 107, 0.06)', border: '1px solid rgba(230, 46, 107, 0.2)', borderRadius: '12px', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-magenta)', textTransform: 'uppercase' }}>
            Pessoa Física (CPF)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-magenta)', marginTop: '2px' }}>
            {totalCpf}
          </div>
        </div>

      </div>

      {/* Search & Filters */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Buscar por Nome, Razão Social, CNPJ/CPF, Telefone ou E-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter FilterDocType */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setFilterDocType('all')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: filterDocType === 'all' ? '1px solid var(--brand-cyan)' : '1px solid var(--border-color)',
              background: filterDocType === 'all' ? 'rgba(0, 168, 232, 0.2)' : 'var(--bg-input)',
              color: filterDocType === 'all' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Todos ({clients.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterDocType('cnpj')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: filterDocType === 'cnpj' ? '1px solid var(--brand-cyan)' : '1px solid var(--border-color)',
              background: filterDocType === 'cnpj' ? 'rgba(0, 168, 232, 0.2)' : 'var(--bg-input)',
              color: filterDocType === 'cnpj' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            CNPJ ({totalCnpj})
          </button>

          <button
            type="button"
            onClick={() => setFilterDocType('cpf')}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: filterDocType === 'cpf' ? '1px solid var(--brand-magenta)' : '1px solid var(--border-color)',
              background: filterDocType === 'cpf' ? 'rgba(230, 46, 107, 0.2)' : 'var(--bg-input)',
              color: filterDocType === 'cpf' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            CPF ({totalCpf})
          </button>
        </div>

      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Users size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: '0 0 6px 0' }}>Nenhum cliente encontrado</h3>
          <p style={{ fontSize: '0.85rem', margin: '0 0 16px 0' }}>
            {searchTerm ? 'Tente buscar com outros termos ou limpe o campo de busca.' : 'A base de clientes está vazia ou aguardando sincronização.'}
          </p>
          {onResetClients && (
            <button
              onClick={onResetClients}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--brand-cyan), #0077b6)',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔄 Carregar 13 Clientes da Lista Oficial
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {filteredClients.map((client) => {
            const isCnpj = client.docType === 'cnpj';
            return (
              <div
                key={client.id}
                className="glass-card"
                style={{
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  border: isCnpj ? '1px solid rgba(0, 168, 232, 0.25)' : '1px solid rgba(230, 46, 107, 0.25)',
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(23, 53, 91, 0.3))'
                }}
              >
                <div>
                  {/* Card Header: Code, Type Badge & Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {client.code && (
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          background: 'rgba(247, 181, 0, 0.2)',
                          color: 'var(--brand-yellow)',
                          border: '1px solid rgba(247, 181, 0, 0.4)',
                          letterSpacing: '0.5px'
                        }}>
                          {client.code}
                        </span>
                      )}

                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: isCnpj ? 'rgba(0, 168, 232, 0.2)' : 'rgba(230, 46, 107, 0.2)',
                        color: isCnpj ? 'var(--brand-cyan)' : 'var(--brand-magenta)',
                        border: isCnpj ? '1px solid rgba(0, 168, 232, 0.4)' : '1px solid rgba(230, 46, 107, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {isCnpj ? <Building size={12} /> : <User size={12} />}
                        {isCnpj ? 'Pessoa Jurídica (CNPJ)' : 'Pessoa Física (CPF)'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleCopyClient(client)}
                        title="Copiar informações"
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: copiedId === client.id ? 'var(--success)' : 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {copiedId === client.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>

                      <button
                        onClick={() => openEditClientModal(client)}
                        title="Editar cliente"
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--brand-cyan)',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        onClick={() => onDeleteClient(client.id)}
                        title="Excluir cliente"
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Client Trade Name, Razão Social & Document */}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 2px 0', lineHeight: '1.3' }}>
                    {client.tradeName || client.name}
                  </h3>

                  {client.tradeName && client.tradeName !== client.name && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Razão Social: {client.name}
                    </div>
                  )}

                  <div style={{ fontSize: '0.8rem', color: 'var(--brand-yellow)', fontWeight: 600, marginBottom: '12px' }}>
                    {client.docType === 'cnpj' ? 'CNPJ' : 'CPF'}: {client.doc || 'Não informado'}
                  </div>

                  {/* Contact Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    
                    {client.contactPerson && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="var(--brand-cyan)" />
                        <span>Contato: <strong style={{ color: 'var(--text-main)' }}>{client.contactPerson}</strong></span>
                      </div>
                    )}

                    {client.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="var(--success)" />
                        <span style={{ color: 'var(--text-main)' }}>{client.phone}</span>
                      </div>
                    )}

                    {client.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="var(--brand-magenta)" />
                        <span style={{ color: 'var(--text-main)' }}>{client.email}</span>
                      </div>
                    )}

                    {(client.street || client.city) && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <MapPin size={14} color="var(--brand-yellow)" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>
                          {client.street}{client.number ? `, ${client.number}` : ''}
                          {client.neighborhood ? ` - ${client.neighborhood}` : ''}
                          {client.city ? ` (${client.city}/${client.state || 'PR'})` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notes Badge */}
                  {client.notes && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      lineHeight: '1.3'
                    }}>
                      💬 {client.notes}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form: Add / Edit Client */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
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
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--brand-cyan)'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus size={22} color="var(--brand-cyan)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  {editingClient ? 'Editar Cadastro de Cliente' : 'Novo Cadastro de Cliente'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Type, Trade Name & Razão Social */}
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Tipo de Pessoa</label>
                  <select
                    className="form-select"
                    value={formData.docType}
                    onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
                  >
                    <option value="cnpj">PJ (CNPJ)</option>
                    <option value="cpf">PF (CPF)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Nome Fantasia / Marca</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Editora Brasil"
                    value={formData.tradeName}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Razão Social / Nome Completo *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ex: Gráfica & Editora Brasil Ltda"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Doc & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">{formData.docType === 'cnpj' ? 'CNPJ' : 'CPF'}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={formData.docType === 'cnpj' ? '00.000.000/0001-00' : '000.000.000-00'}
                    value={formData.doc}
                    onChange={(e) => setFormData({ ...formData, doc: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="(44) 99999-8888"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Email & Contact Person */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">E-mail Comercial</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="contato@cliente.com.br"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pessoa de Contato / Responsável</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Carlos Eduardo (Compras)"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>
              </div>

              {/* Address Row 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Logradouro / Rua</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Av. Brasil"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Número</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="1500"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bairro</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Centro"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  />
                </div>
              </div>

              {/* Address Row 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Cidade</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">UF</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CEP</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="87000-000"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Observações / Condições Comerciais</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Ex: Faturado 15 dias, entrega prioritária, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, var(--brand-cyan), #0077b6)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {editingClient ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

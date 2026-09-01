import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  X,
  Check,
  CreditCard,
  Copy,
  Package,
  Scissors,
  Layers,
  Cpu
} from 'lucide-react';

export default function SupplierManager({
  suppliers,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    tradeName: '',
    category: 'papeis',
    docType: 'cnpj',
    doc: '',
    ie: '',
    phone: '',
    email: '',
    contactPerson: '',
    website: '',
    street: '',
    number: '',
    neighborhood: '',
    city: 'Maringá',
    state: 'PR',
    zipCode: '',
    paymentTerms: '',
    notes: ''
  });

  const categoryLabels = {
    papeis: { label: 'Papéis & Resmas', icon: Package, color: 'var(--brand-yellow)' },
    acabamento: { label: 'Acabamentos & Terceirizados', icon: Scissors, color: 'var(--brand-magenta)' },
    comunicacao_visual: { label: 'Mídias & Comunicação Visual', icon: Layers, color: 'var(--brand-cyan)' },
    equipamento: { label: 'Equipamentos & Assistência', icon: Cpu, color: '#10b981' },
    insumos: { label: 'Insumos & Embalagens', icon: Building, color: '#8b5cf6' },
    outros: { label: 'Outros Serviços', icon: Truck, color: '#64748b' }
  };

  const openNewSupplierModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      tradeName: '',
      category: 'papeis',
      docType: 'cnpj',
      doc: '',
      ie: '',
      phone: '',
      email: '',
      contactPerson: '',
      website: '',
      street: '',
      number: '',
      neighborhood: '',
      city: 'Maringá',
      state: 'PR',
      zipCode: '',
      paymentTerms: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditSupplierModal = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name || '',
      tradeName: sup.tradeName || '',
      category: sup.category || 'papeis',
      docType: sup.docType || 'cnpj',
      doc: sup.doc || '',
      ie: sup.ie || '',
      phone: sup.phone || '',
      email: sup.email || '',
      contactPerson: sup.contactPerson || '',
      website: sup.website || '',
      street: sup.street || '',
      number: sup.number || '',
      neighborhood: sup.neighborhood || '',
      city: sup.city || 'Maringá',
      state: sup.state || 'PR',
      zipCode: sup.zipCode || '',
      paymentTerms: sup.paymentTerms || '',
      notes: sup.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingSupplier) {
      onUpdateSupplier({
        ...editingSupplier,
        ...formData
      });
    } else {
      const newSupplier = {
        id: `sup-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onAddSupplier(newSupplier);
    }

    setIsModalOpen(false);
  };

  const handleCopySupplier = (sup) => {
    const info = `Código: ${sup.code || ''}\nRazão Social: ${sup.name}\nNome Fantasia: ${sup.tradeName || sup.name}\nCNPJ/CPF: ${sup.doc}\nTel: ${sup.phone}\nE-mail: ${sup.email}\nContato: ${sup.contactPerson}`;
    navigator.clipboard.writeText(info);
    setCopiedId(sup.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered Suppliers List
  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch =
      (s.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.tradeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.doc || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || s.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner & Action Controls */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(247, 181, 0, 0.15)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(247, 181, 0, 0.3)' }}>
            <Truck size={28} color="var(--brand-yellow)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Gestão e Cadastro de Fornecedores
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Cadastro unificado de distribuidoras de papéis, terceirizados de acabamentos, mídias e insumos gráficos.
            </p>
          </div>
        </div>

        <button
          onClick={openNewSupplierModal}
          style={{
            padding: '12px 22px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, var(--brand-yellow), #d99b00)',
            color: '#000000',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 15px rgba(247, 181, 0, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          <Plus size={18} /> Novo Fornecedor
        </button>
      </div>

      {/* Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        
        <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total de Fornecedores
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
            {suppliers.length}
          </div>
        </div>

        <div style={{ background: 'rgba(247, 181, 0, 0.06)', border: '1px solid rgba(247, 181, 0, 0.2)', borderRadius: '12px', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-yellow)', textTransform: 'uppercase' }}>
            Papéis & Resmas
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-yellow)', marginTop: '2px' }}>
            {suppliers.filter(s => s.category === 'papeis').length}
          </div>
        </div>

        <div style={{ background: 'rgba(230, 46, 107, 0.06)', border: '1px solid rgba(230, 46, 107, 0.2)', borderRadius: '12px', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-magenta)', textTransform: 'uppercase' }}>
            Acabamentos & Terceirizados
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-magenta)', marginTop: '2px' }}>
            {suppliers.filter(s => s.category === 'acabamento').length}
          </div>
        </div>

        <div style={{ background: 'rgba(0, 168, 232, 0.06)', border: '1px solid rgba(0, 168, 232, 0.2)', borderRadius: '12px', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-cyan)', textTransform: 'uppercase' }}>
            Mídias & Visuais
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-cyan)', marginTop: '2px' }}>
            {suppliers.filter(s => s.category === 'comunicacao_visual').length}
          </div>
        </div>

      </div>

      {/* Search & Category Filter Bar */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Buscar por Código (FOR-A0001), Nome, Fantasia, CNPJ ou Contato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: filterCategory === 'all' ? '1px solid var(--brand-cyan)' : '1px solid var(--border-color)',
              background: filterCategory === 'all' ? 'rgba(0, 168, 232, 0.2)' : 'var(--bg-input)',
              color: filterCategory === 'all' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Todos ({suppliers.length})
          </button>

          {Object.entries(categoryLabels).map(([catKey, catObj]) => {
            const count = suppliers.filter(s => s.category === catKey).length;
            const isSel = filterCategory === catKey;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setFilterCategory(catKey)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: isSel ? `1px solid ${catObj.color}` : '1px solid var(--border-color)',
                  background: isSel ? 'rgba(255,255,255,0.1)' : 'var(--bg-input)',
                  color: isSel ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {catObj.label.split(' ')[0]} ({count})
              </button>
            );
          })}
        </div>

      </div>

      {/* Suppliers Grid */}
      {filteredSuppliers.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Truck size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: '0 0 6px 0' }}>Nenhum fornecedor encontrado</h3>
          <p style={{ fontSize: '0.85rem', margin: 0 }}>
            {searchTerm ? 'Tente buscar por outros termos ou limpe o campo de busca.' : 'Cadastre seu primeiro fornecedor clicando em "+ Novo Fornecedor".'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {filteredSuppliers.map((supplier) => {
            const catObj = categoryLabels[supplier.category] || categoryLabels.outros;
            const IconComp = catObj.icon;

            return (
              <div
                key={supplier.id}
                className="glass-card"
                style={{
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  border: '1px solid var(--border-color)',
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(23, 53, 91, 0.3))'
                }}
              >
                <div>
                  {/* Header: Code & Category Badges + Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                        {supplier.code || 'FOR-A0000'}
                      </span>

                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: catObj.color,
                        border: `1px solid ${catObj.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <IconComp size={12} />
                        {catObj.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleCopySupplier(supplier)}
                        title="Copiar dados do fornecedor"
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: copiedId === supplier.id ? 'var(--success)' : 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {copiedId === supplier.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>

                      <button
                        onClick={() => openEditSupplierModal(supplier)}
                        title="Editar fornecedor"
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
                        onClick={() => onDeleteSupplier(supplier.id)}
                        title="Excluir fornecedor"
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

                  {/* Name & Trade Name */}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 2px 0', lineHeight: '1.3' }}>
                    {supplier.tradeName || supplier.name}
                  </h3>
                  
                  {supplier.tradeName && supplier.tradeName !== supplier.name && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Razão Social: {supplier.name}
                    </div>
                  )}

                  <div style={{ fontSize: '0.8rem', color: 'var(--brand-cyan)', fontWeight: 600, marginBottom: '12px' }}>
                    CNPJ: {supplier.doc || 'Não informado'} {supplier.ie ? `| I.E. ${supplier.ie}` : ''}
                  </div>

                  {/* Contact Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    
                    {supplier.contactPerson && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="var(--brand-cyan)" />
                        <span>Contato: <strong style={{ color: 'var(--text-main)' }}>{supplier.contactPerson}</strong></span>
                      </div>
                    )}

                    {supplier.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="var(--success)" />
                        <span style={{ color: 'var(--text-main)' }}>{supplier.phone}</span>
                      </div>
                    )}

                    {supplier.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="var(--brand-magenta)" />
                        <span style={{ color: 'var(--text-main)' }}>{supplier.email}</span>
                      </div>
                    )}

                    {supplier.paymentTerms && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CreditCard size={14} color="var(--brand-yellow)" />
                        <span>Condições: <strong style={{ color: 'var(--brand-yellow)' }}>{supplier.paymentTerms}</strong></span>
                      </div>
                    )}

                    {(supplier.street || supplier.city) && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <MapPin size={14} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>
                          {supplier.street}{supplier.number ? `, ${supplier.number}` : ''}
                          {supplier.city ? ` (${supplier.city}/${supplier.state || 'PR'})` : ''}
                        </span>
                      </div>
                    )}

                  </div>

                  {/* Notes */}
                  {supplier.notes && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      lineHeight: '1.3'
                    }}>
                      💬 {supplier.notes}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form: Add / Edit Supplier */}
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
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--brand-yellow)'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Truck size={22} color="var(--brand-yellow)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  {editingSupplier ? `Editar Fornecedor (${editingSupplier.code})` : 'Novo Cadastro de Fornecedor'}
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
              
              {/* Category & Trade Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="papeis">Papéis & Resmas</option>
                    <option value="acabamento">Acabamentos / Terceirizados</option>
                    <option value="comunicacao_visual">Mídias & Comunicação Visual</option>
                    <option value="equipamento">Equipamentos & Assistência</option>
                    <option value="insumos">Insumos & Embalagens</option>
                    <option value="outros">Outros Serviços</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Nome Fantasia *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ex: Battaglia Papéis"
                    value={formData.tradeName}
                    onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                  />
                </div>
              </div>

              {/* Razão Social & CNPJ */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Razão Social Completa</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Battaglia Distribuidora de Papéis Ltda"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CNPJ / CPF</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="00.000.000/0001-00"
                    value={formData.doc}
                    onChange={(e) => setFormData({ ...formData, doc: e.target.value })}
                  />
                </div>
              </div>

              {/* IE & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Inscrição Estadual (I.E.)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Isento ou Nº I.E."
                    value={formData.ie}
                    onChange={(e) => setFormData({ ...formData, ie: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="(44) 3333-4444"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pessoa de Contato</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Vendas / Roberto"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>
              </div>

              {/* Email & Website & Payment Terms */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">E-mail Comercial</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="vendas@fornecedor.com.br"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Site / Portal</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="www.fornecedor.com.br"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Condições de Pagamento</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Faturado 30/60 Dias"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  />
                </div>
              </div>

              {/* Address */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Logradouro / Rua</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Av. das Indústrias"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  />
                </div>

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
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Observações Técnicas / Comerciais</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Ex: Prazos de entrega, limites de faturamento, frete cif/fob, etc."
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
                    background: 'linear-gradient(135deg, var(--brand-yellow), #d99b00)',
                    color: '#000000',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {editingSupplier ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

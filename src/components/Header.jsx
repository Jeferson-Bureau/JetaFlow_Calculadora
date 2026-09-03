import React from 'react';
import { LayoutDashboard, Printer, Cpu, Sliders, FileText, Layers, RefreshCw, Users, Truck, Award, PackageSearch, Tag } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onReset }) {
  return (
    <header className="glass-card no-print" style={{ borderRadius: '0 0 16px 16px', marginBottom: '24px', padding: '16px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Logo & Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '8px 16px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <img 
              src="/JETAPRINT_LOGO_01_2026-01.jpg" 
              alt="JETAPRINT Gráfica Multimídia Logo" 
              style={{ height: '38px', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(90deg, #FFFFFF, #00A8E8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                JetaFlow
              </h1>
              <span style={{
                background: 'linear-gradient(135deg, var(--brand-magenta), #b81b4f)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '20px',
                letterSpacing: '0.5px'
              }}>
                PRECIFICAÇÃO PRO
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Calculadora de Custos & Orçamentos | Digital & Off-set
            </p>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'dashboard' ? 'linear-gradient(135deg, #00A8E8, #0077b6)' : 'var(--bg-input)',
              color: activeTab === 'dashboard' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'dashboard' ? '0 0 15px rgba(0, 168, 232, 0.5)' : 'none'
            }}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('digital')}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'digital' ? 'linear-gradient(135deg, #00A8E8, #0077b6)' : 'var(--bg-input)',
              color: activeTab === 'digital' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'digital' ? '0 0 15px rgba(0, 168, 232, 0.4)' : 'none'
            }}
          >
            <Printer size={18} />
            Digital & Orçamentos
          </button>

          <button
            onClick={() => setActiveTab('offset')}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              background: activeTab === 'offset' ? 'linear-gradient(135deg, var(--brand-navy), #0d213a)' : 'var(--bg-input)',
              color: activeTab === 'offset' ? '#ffffff' : 'var(--text-muted)',
              border: activeTab === 'offset' ? '1px solid var(--brand-cyan)' : '1px solid transparent',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'offset' ? '0 0 15px rgba(230, 46, 107, 0.3)' : 'none'
            }}
          >
            <Cpu size={18} />
            Impressão Off-set
          </button>

          <button
            onClick={() => setActiveTab('large_format')}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'large_format' ? 'linear-gradient(135deg, var(--brand-yellow), #d99b00)' : 'var(--bg-input)',
              color: activeTab === 'large_format' ? '#000000' : 'var(--text-muted)',
              fontWeight: activeTab === 'large_format' ? 700 : 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Layers size={18} />
            Grande Formato
          </button>



          <button
            onClick={() => setActiveTab('clients')}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'clients' ? 'linear-gradient(135deg, #10B981, #059669)' : 'var(--bg-input)',
              color: activeTab === 'clients' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'clients' ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none'
            }}
          >
            <Users size={18} />
            Clientes (CRM)
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'suppliers' ? 'linear-gradient(135deg, var(--brand-yellow), #d99b00)' : 'var(--bg-input)',
              color: activeTab === 'suppliers' ? '#000000' : 'var(--text-muted)',
              fontWeight: activeTab === 'suppliers' ? 800 : 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'suppliers' ? '0 0 15px rgba(247, 181, 0, 0.4)' : 'none'
            }}
          >
            <Truck size={18} />
            Fornecedores
          </button>

          <button
            onClick={() => setActiveTab('biddings')}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'biddings' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'var(--bg-input)',
              color: activeTab === 'biddings' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: activeTab === 'biddings' ? 800 : 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'biddings' ? '0 0 15px rgba(139, 92, 246, 0.4)' : 'none'
            }}
          >
            <Award size={18} />
            Licitações
          </button>

          <button
            onClick={() => setActiveTab('labels')}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'labels' ? 'linear-gradient(135deg, #f43f5e, #be123c)' : 'var(--bg-input)',
              color: activeTab === 'labels' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: activeTab === 'labels' ? 800 : 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'labels' ? '0 0 15px rgba(244, 63, 94, 0.4)' : 'none'
            }}
          >
            <Tag size={18} />
            Etiquetas
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'settings' ? 'rgba(255, 255, 255, 0.15)' : 'var(--bg-input)',
              color: activeTab === 'settings' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Sliders size={18} />
            Insumos & Preços
          </button>

          <button
            onClick={onReset}
            title="Resetar Orçamento"
            style={{
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-input)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={18} />
          </button>
        </nav>

      </div>
    </header>
  );
}

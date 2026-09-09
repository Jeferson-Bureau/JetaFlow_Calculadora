import React from 'react';
import { LayoutDashboard, Printer, Cpu, Sliders, Layers, RefreshCw, Users, Truck, Award, Tag } from 'lucide-react';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard, activeBg: 'linear-gradient(135deg, #00A8E8, #0077b6)', glow: '0 0 15px rgba(0, 168, 232, 0.5)' },
  { key: 'digital', label: 'Digital & Orçamentos', Icon: Printer, activeBg: 'linear-gradient(135deg, #00A8E8, #0077b6)', glow: '0 0 15px rgba(0, 168, 232, 0.4)' },
  { key: 'offset', label: 'Impressão Off-set', Icon: Cpu, activeBg: 'linear-gradient(135deg, var(--brand-navy), #0d213a)', activeBorder: '1px solid var(--brand-cyan)', glow: '0 0 15px rgba(230, 46, 107, 0.3)' },
  { key: 'large_format', label: 'Grande Formato', Icon: Layers, activeBg: 'linear-gradient(135deg, var(--brand-yellow), #d99b00)', activeColor: '#000000' },
  { key: 'clients', label: 'Clientes (CRM)', Icon: Users, activeBg: 'linear-gradient(135deg, #10B981, #059669)', glow: '0 0 15px rgba(16, 185, 129, 0.4)' },
  { key: 'suppliers', label: 'Fornecedores', Icon: Truck, activeBg: 'linear-gradient(135deg, var(--brand-yellow), #d99b00)', activeColor: '#000000', glow: '0 0 15px rgba(247, 181, 0, 0.4)' },
  { key: 'biddings', label: 'Licitações', Icon: Award, activeBg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', glow: '0 0 15px rgba(139, 92, 246, 0.4)' },
  { key: 'labels', label: 'Etiquetas', Icon: Tag, activeBg: 'linear-gradient(135deg, #f43f5e, #be123c)', glow: '0 0 15px rgba(244, 63, 94, 0.4)' },
  { key: 'settings', label: 'Insumos & Preços', Icon: Sliders, activeBg: 'rgba(255, 255, 255, 0.15)' }
];

function tabStyle(tab, isActive) {
  return {
    padding: '10px 16px',
    borderRadius: '10px',
    border: isActive && tab.activeBorder ? tab.activeBorder : '1px solid transparent',
    background: isActive ? tab.activeBg : 'var(--bg-input)',
    color: isActive ? (tab.activeColor || '#ffffff') : 'var(--text-muted)',
    fontWeight: isActive ? 700 : 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    boxShadow: isActive ? (tab.glow || 'none') : 'none'
  };
}

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
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const { Icon } = tab;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={tabStyle(tab, isActive)}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}

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

import React, { useEffect, useRef } from 'react';
import { LayoutDashboard, Calculator, Sliders, RefreshCw, Users, Truck, Award, Tag, Wallet } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { key: 'digital', label: 'Orçamentos', Icon: Calculator },
  { key: 'finance', label: 'Financeiro', Icon: Wallet },
  { key: 'clients', label: 'Clientes', Icon: Users },
  { key: 'suppliers', label: 'Fornecedores', Icon: Truck },
  { key: 'biddings', label: 'Licitações', Icon: Award },
  { key: 'labels', label: 'Etiquetas', Icon: Tag },
  { key: 'settings', label: 'Insumos & Preços', Icon: Sliders }
];

function tabStyle(isActive) {
  return {
    padding: '9px 14px',
    borderRadius: 10,
    border: '1px solid ' + (isActive ? 'transparent' : 'var(--border-color)'),
    background: isActive ? 'var(--brand-cyan)' : 'transparent',
    color: isActive ? 'var(--on-accent)' : 'var(--text-muted)',
    fontWeight: isActive ? 700 : 600,
    fontSize: '0.86rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    whiteSpace: 'nowrap',
    transition: 'background 0.15s var(--ease), color 0.15s var(--ease), border-color 0.15s var(--ease)'
  };
}

export default function Header({ activeTab, setActiveTab, onReset }) {
  // No celular as abas rolam na horizontal: mantém a aba ativa à vista.
  const navRef = useRef(null);
  useEffect(() => {
    const active = navRef.current?.querySelector('[aria-current="page"]');
    active?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [activeTab]);

  return (
    <header
      className="no-print"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        margin: '0 -16px 24px',
        padding: '14px 16px',
        background: 'var(--bg-secondary)',
        backgroundColor: 'color-mix(in srgb, var(--bg-main) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      <div className="app-header-top" style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>

        {/* Marca */}
        <div className="app-header-brand" style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{
            flexShrink: 0,
            background: '#FFFFFF',
            padding: '7px 12px',
            borderRadius: 12,
            boxShadow: 'var(--shadow-xs)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <img src="/JETAPRINT_LOGO_01_2026-01.jpg" alt="JETAPRINT" className="app-header-logo" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="app-header-name" style={{ fontSize: '1.32rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-strong)' }}>
                JetaFlow
              </span>
              <span className="app-header-badge" style={{
                background: 'var(--tint-subtle)',
                color: 'var(--text-muted)',
                fontSize: '0.62rem',
                fontWeight: 700,
                padding: '3px 7px',
                borderRadius: 20,
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                Precificação Pro
              </span>
            </div>
            <p className="app-header-subtitle" style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
              Custos & orçamentos — digital · off-set · grande formato
            </p>
          </div>
        </div>

        {/* Ações à direita */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            onClick={onReset}
            title="Restaurar valores padrão do orçamento"
            aria-label="Restaurar padrão"
            style={{
              width: 40, height: 40,
              display: 'grid', placeItems: 'center',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-input)',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={17} />
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Navegação */}
      <nav ref={navRef} className="app-header-nav" aria-label="Módulos">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = activeTab === key;
          return (
            <button key={key} onClick={() => setActiveTab(key)} style={tabStyle(isActive)} aria-current={isActive ? 'page' : undefined}>
              <Icon size={16} />
              {label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

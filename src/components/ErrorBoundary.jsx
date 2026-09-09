import React from 'react';
import { downloadBackup } from '../utils/storage';

/**
 * Captura qualquer erro de renderização e mostra uma tela de recuperação
 * em vez da tela branca. Os dados do usuário continuam no localStorage —
 * a tela oferece exportar o backup antes de recarregar.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[JetaFlow] Erro não tratado na interface:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#F8FAFC'
      }}>
        <div style={{
          maxWidth: '560px',
          width: '100%',
          background: '#162032',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '16px',
          padding: '28px'
        }}>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px 0', color: '#EF4444' }}>
            Algo deu errado na calculadora
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
            A interface encontrou um erro inesperado. Seus dados (clientes, orçamentos,
            licitações e preços) continuam salvos neste navegador. Exporte um backup por
            segurança e recarregue a página.
          </p>

          <pre style={{
            background: '#0d1525',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '0.75rem',
            color: '#fca5a5',
            overflowX: 'auto',
            margin: '0 0 18px 0'
          }}>
            {String(this.state.error && (this.state.error.stack || this.state.error.message || this.state.error))}
          </pre>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => downloadBackup()}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(16,185,129,0.4)',
                background: 'rgba(16,185,129,0.15)',
                color: '#10B981',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Exportar backup (.json)
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #00A8E8, #0077b6)',
                color: 'var(--on-accent)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Recarregar página
            </button>
          </div>
        </div>
      </div>
    );
  }
}

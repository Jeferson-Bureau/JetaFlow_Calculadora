import React from 'react';
import { Printer, Cpu, Layers } from 'lucide-react';

const MODES = [
  { id: 'digital', label: 'Digital', Icon: Printer },
  { id: 'offset', label: 'Off-set', Icon: Cpu },
  { id: 'large_format', label: 'Grande Formato', Icon: Layers }
];

// Seletor de modalidade de produção dentro da aba única "Orçamentos".
export default function ProductionModeSwitch({ value, onChange }) {
  return (
    <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Modalidade
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', background: 'var(--bg-input)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
        {MODES.map(({ id, label, Icon }) => {
          const active = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-pressed={active}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: active ? 'var(--brand-cyan)' : 'transparent',
                color: active ? 'var(--on-accent)' : 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'background 0.15s var(--ease), color 0.15s var(--ease)'
              }}
            >
              <Icon size={15} /> {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

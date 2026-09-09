import React, { useEffect, useRef, useState } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const OPTIONS = [
  { id: 'light', label: 'Claro', Icon: Sun },
  { id: 'dark', label: 'Escuro', Icon: Moon },
  { id: 'system', label: 'Sistema', Icon: Monitor }
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const Current = (OPTIONS.find(o => o.id === theme) || OPTIONS[2]).Icon;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Alternar tema"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Tema (claro / escuro)"
        style={{
          width: 40,
          height: 40,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 10,
          border: '1px solid var(--border-color)',
          background: open ? 'var(--tint-subtle)' : 'var(--bg-input)',
          color: 'var(--text-main)',
          cursor: 'pointer',
          transition: 'background 0.15s var(--ease), border-color 0.15s var(--ease)'
        }}
      >
        <Current size={18} />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: 168,
            padding: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-color)',
            borderRadius: 12,
            boxShadow: 'var(--shadow-pop)',
            zIndex: 200
          }}
        >
          {OPTIONS.map(({ id, label, Icon }) => {
            const active = theme === id;
            return (
              <button
                key={id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => { setTheme(id); setOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 10px',
                  borderRadius: 8,
                  border: 'none',
                  background: active ? 'var(--tint-subtle)' : 'transparent',
                  color: active ? 'var(--text-strong)' : 'var(--text-muted)',
                  fontSize: '0.86rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--tint-hairline)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{label}</span>
                {active && <Check size={15} color="var(--brand-cyan)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

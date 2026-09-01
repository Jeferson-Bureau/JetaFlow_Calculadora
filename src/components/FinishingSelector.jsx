import React, { useState } from 'react';
import { Scissors, CheckCircle, Circle, ExternalLink, ShieldCheck, Crosshair } from 'lucide-react';

export default function FinishingSelector({
  availableFinishings,
  selectedFinishings,
  setSelectedFinishings
}) {
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'bannercut' | 'positiva' | 'interna'

  const toggleFinishing = (finishing) => {
    const exists = selectedFinishings.some(f => f.id === finishing.id);
    if (exists) {
      setSelectedFinishings(selectedFinishings.filter(f => f.id !== finishing.id));
    } else {
      setSelectedFinishings([...selectedFinishings, finishing]);
    }
  };

  const filteredList = availableFinishings.filter(f => {
    if (filterCategory === 'bannercut') return f.category === 'bannercut';
    if (filterCategory === 'positiva') return f.category === 'positiva';
    if (filterCategory === 'interna') return f.category === 'interna';
    return true;
  });

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Scissors size={20} color="var(--brand-cyan)" />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
              Acabamentos, Facas & Recorte Digital
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              BannerCut Pro (Plotter de Recorte c/ Câmera) + Tabela Positiva 2025 + Guilhotina Interna
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterCategory('all')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: filterCategory === 'all' ? 'var(--brand-cyan)' : 'var(--bg-input)',
              color: filterCategory === 'all' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Todos ({availableFinishings.length})
          </button>

          <button
            onClick={() => setFilterCategory('bannercut')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: filterCategory === 'bannercut' ? 'linear-gradient(135deg, var(--brand-yellow), #d99b00)' : 'var(--bg-input)',
              color: filterCategory === 'bannercut' ? '#000000' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Crosshair size={12} /> BannerCut Pro
          </button>
          
          <button
            onClick={() => setFilterCategory('positiva')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: filterCategory === 'positiva' ? 'linear-gradient(135deg, var(--brand-magenta), #b81b4f)' : 'var(--bg-input)',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ExternalLink size={12} /> Positiva 2025
          </button>

          <button
            onClick={() => setFilterCategory('interna')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              background: filterCategory === 'interna' ? 'var(--brand-navy)' : 'var(--bg-input)',
              color: filterCategory === 'interna' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Guilhotina / Internos
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
        {filteredList.map((f) => {
          const isSelected = selectedFinishings.some(sf => sf.id === f.id);
          const isPositiva = f.category === 'positiva';
          const isBannerCut = f.category === 'bannercut';

          return (
            <div
              key={f.id}
              onClick={() => toggleFinishing(f)}
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: isSelected ? '1px solid var(--brand-cyan)' : '1px solid var(--border-color)',
                background: isSelected ? 'rgba(0, 168, 232, 0.14)' : 'var(--bg-input)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                {isSelected ? (
                  <CheckCircle size={18} color="var(--brand-cyan)" />
                ) : (
                  <Circle size={18} color="var(--text-muted)" />
                )}
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? 700 : 500, color: 'var(--text-main)' }}>
                      {f.name.replace('Positiva - ', '').replace('JetaPrint - ', '').replace('BannerCut Pro - ', '')}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isBannerCut ? (
                      <span style={{ color: 'var(--brand-yellow)', fontWeight: 700 }}>
                        [BannerCut Pro]
                      </span>
                    ) : isPositiva ? (
                      <span style={{ color: 'var(--brand-magenta)', fontWeight: 700 }}>
                        [Terceirizado Positiva]
                      </span>
                    ) : (
                      <span style={{ color: 'var(--brand-cyan)' }}>
                        [Interno]
                      </span>
                    )}
                    {f.pricePerM2Milheiro ? `R$ ${f.pricePerM2Milheiro.toFixed(2)}/m²` : f.unitCost > 0 ? `R$ ${f.unitCost.toFixed(2)}/un` : ''}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

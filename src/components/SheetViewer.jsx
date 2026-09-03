import React, { useRef, useEffect } from 'react';
import { Maximize2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function SheetViewer({ layout, sheetSize, productW, productH, bleed }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0d1525';
    ctx.fillRect(0, 0, width, height);

    const sheetW = (layout && layout.machineW) ? layout.machineW : (sheetSize.widthMm || 320);
    const sheetH = (layout && layout.machineH) ? layout.machineH : (sheetSize.heightMm || 450);
    const printableW = (layout && layout.machineW) ? sheetW - 10 : (sheetSize.printableW || (sheetW - 10));
    const printableH = (layout && layout.machineH) ? sheetH - 10 : (sheetSize.printableH || (sheetH - 10));

    // Padding inside canvas
    const padding = 25;
    const maxDrawW = width - padding * 2;
    const maxDrawH = height - padding * 2;

    // Calculate scale factor
    const scale = Math.min(maxDrawW / sheetW, maxDrawH / sheetH);

    const drawSheetW = sheetW * scale;
    const drawSheetH = sheetH * scale;
    const startX = (width - drawSheetW) / 2;
    const startY = (height - drawSheetH) / 2;

    // 1. Draw Full Sheet (White/Light gray paper)
    ctx.fillStyle = '#f8fafc';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillRect(startX, startY, drawSheetW, drawSheetH);
    ctx.shadowBlur = 0; // reset shadow

    // Sheet Border
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, startY, drawSheetW, drawSheetH);

    // 2. Draw Printable Margin (dashed cyan line)
    const drawPrintableW = printableW * scale;
    const drawPrintableH = printableH * scale;
    const printableX = startX + ((sheetW - printableW) / 2) * scale;
    const printableY = startY + ((sheetH - printableH) / 2) * scale;

    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#00A8E8';
    ctx.strokeRect(printableX, printableY, drawPrintableW, drawPrintableH);
    ctx.setLineDash([]); // reset dash

    // 3. Draw Cut Pieces Grid
    if (layout && layout.nUp > 0) {
      const cols = layout.cols || 1;
      const rows = layout.rows || 1;
      const itemW = layout.itemW * scale;
      const itemH = layout.itemH * scale;
      const actualProdW = productW * scale;
      const actualProdH = productH * scale;

      // Center items inside printable area
      const gridW = cols * itemW;
      const gridH = rows * itemH;
      const gridStartX = printableX + (drawPrintableW - gridW) / 2;
      const gridStartY = printableY + (drawPrintableH - gridH) / 2;

      ctx.lineWidth = 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const posX = gridStartX + c * itemW;
          const posY = gridStartY + r * itemH;

          // Fill product item box
          ctx.fillStyle = 'rgba(0, 168, 232, 0.15)';
          ctx.fillRect(posX, posY, itemW, itemH);

          // Draw Bleed/Cut Border
          ctx.strokeStyle = 'rgba(0, 168, 232, 0.6)';
          ctx.strokeRect(posX, posY, itemW, itemH);

          // Draw Inner Net Cut Box if Bleed > 0
          if (bleed > 0) {
            const bleedPx = bleed * scale;
            ctx.strokeStyle = '#E62E6B';
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(posX + bleedPx, posY + bleedPx, actualProdW, actualProdH);
            ctx.setLineDash([]);
          }

          // Item Index Label
          const itemIndex = r * cols + c + 1;
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`#${itemIndex}`, posX + itemW / 2, posY + itemH / 2);
        }
      }
    }

    // 4. Dimensions Text Legend on Canvas
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Folha: ${sheetW} x ${sheetH} mm`, 10, height - 10);
  }, [layout, sheetSize, productW, productH, bleed]);

  const yieldVal = layout ? layout.yieldPercent : 0;
  let yieldBadgeColor = '#10B981'; // Green
  let yieldBadgeText = 'Excelente Aproveitamento';
  if (yieldVal < 65) {
    yieldBadgeColor = '#EF4444'; // Red
    yieldBadgeText = 'Alto Desperdício de Papel';
  } else if (yieldVal < 80) {
    yieldBadgeColor = '#F59E0B'; // Yellow
    yieldBadgeText = 'Aproveitamento Moderado';
  }

  return (
    <div className="glass-card" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Maximize2 size={18} color="var(--brand-cyan)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
            Gabarito de Corte & Montagem
          </h3>
        </div>
        <span style={{
          background: `${yieldBadgeColor}20`,
          color: yieldBadgeColor,
          border: `1px solid ${yieldBadgeColor}50`,
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {yieldVal >= 80 ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
          {yieldVal}% Útil ({layout ? layout.nUp : 0} por folha)
        </span>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
        Simulação visual de montagem para o formato <strong>{productW}x{productH} mm</strong> na folha de entrada <strong>{(layout && layout.machineFormat) || sheetSize.name || 'SRA3'}</strong>.
        {layout && layout.cutName && (
          <span style={{ display: 'block', color: 'var(--brand-magenta)', marginTop: '4px' }}>
            <strong>Corte Inteligente (Off-set):</strong> A folha de compra inteira ({sheetSize.name}) será dividida em <strong>{layout.cutsPerFullSheet} pedaço(s)</strong> ({layout.cutName}) para rodar na máquina. O desenho acima exibe 1 pedaço de máquina.
          </span>
        )}
      </p>

      {/* Canvas Drawing Container */}
      <div style={{
        flex: 1,
        minHeight: '280px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0f1d',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        padding: '12px'
      }}>
        <canvas
          ref={canvasRef}
          width={380}
          height={320}
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
        />
      </div>

      {/* Legend Footer */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', background: 'rgba(0, 168, 232, 0.3)', border: '1px solid #00A8E8', borderRadius: '2px' }}></span>
          Área Bruta (+Sangria)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', border: '1px dashed #E62E6B', borderRadius: '2px' }}></span>
          Corte Final ({productW}x{productH}mm)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', border: '1px dashed #00A8E8', borderRadius: '2px' }}></span>
          Margem Útil da Folha
        </div>
      </div>
    </div>
  );
}

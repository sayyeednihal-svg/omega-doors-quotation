import React from 'react';
import { UpvcWindowType, WindowSeriesType } from '../types/quotation';

interface WindowCadSvgProps {
  series: WindowSeriesType;
  windowType?: UpvcWindowType;
  widthMm: number;
  heightMm: number;
  hasMesh?: boolean;
  className?: string;
}

export const WindowCadSvg: React.FC<WindowCadSvgProps> = ({
  series,
  windowType,
  widthMm,
  heightMm,
  hasMesh = false,
  className = '',
}) => {
  const safeW = Math.max(300, widthMm || 1000);
  const safeH = Math.max(300, heightMm || 1000);
  const resolvedType =
    windowType ||
    (series === 'CASEMENT SERIES 47MM'
      ? 'Casement Window (Single Shutter)'
      : series === 'FIXED SERIES 47MM'
        ? 'Fixed Glass Window'
        : series === 'VENTILATOR SERIES 47MM'
          ? 'Ventilator (Top-Hung / Exhaust)'
          : '2-Track Sliding Window (2 Panel)');

  const isSliding =
    resolvedType.includes('Sliding') ||
    resolvedType.includes('Lift & Slide') ||
    (!resolvedType.includes('Bi-Fold') && !resolvedType.includes('Villa') && series.includes('SLIDING'));
  const isVilla = resolvedType === 'Villa Window (Twin Sash + Grill & Mesh)';
  const isBiFold = resolvedType === 'Bi-Fold Door (Multi-Panel)';
  const isDoubleCasement =
    resolvedType === 'Casement Window (Double Shutter)' ||
    resolvedType === 'Casement Door' ||
    isVilla;
  const isTiltTurn = resolvedType === 'Tilt & Turn Window';
  const isVentilator = resolvedType === 'Ventilator (Top-Hung / Exhaust)';
  const isCombination = resolvedType === 'Combination (Fixed + Openable)';
  const isCasement =
    !isSliding &&
    !isDoubleCasement &&
    !isCombination &&
    !isBiFold &&
    (resolvedType.includes('Casement') || isTiltTurn || isVentilator || series.includes('CASEMENT') || series.includes('VENTILATOR'));

  const slidingPanels = resolvedType.includes('4-Panel')
    ? 4
    : resolvedType.includes('3 Panel')
      ? 3
      : 2;

  // Fit drawing proportionally into a 220x185 viewBox
  const maxBoxW = 132;
  const maxBoxH = isSliding ? 96 : 118;
  const scale = Math.min(maxBoxW / safeW, maxBoxH / safeH);
  const drawW = Math.max(54, Math.round(safeW * scale));
  const drawH = Math.max(46, Math.round(safeH * scale));

  const ox = Math.round((220 - drawW) / 2) + 8;
  const oy = isSliding ? 18 : 22;

  const ghh = Math.round(safeH * 0.47);
  const framePad = 5;
  const sashPad = 10;

  return (
    <svg
      viewBox="0 0 220 185"
      className={`w-full h-auto select-none ${className}`}
      role="img"
      aria-label={`${resolvedType} ${safeW}mm by ${safeH}mm technical elevation`}
    >
      <defs>
        <pattern id="meshHatch" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M 0 4 L 4 0 M -1 1 L 1 -1 M 3 5 L 5 3" stroke="#94A3B8" strokeWidth="0.45" />
        </pattern>
      </defs>

      {/* Left vertical height dimension */}
      <line x1={ox - 16} y1={oy} x2={ox - 16} y2={oy + drawH} stroke="#1E293B" strokeWidth="0.7" />
      <line x1={ox - 19} y1={oy} x2={ox - 4} y2={oy} stroke="#64748B" strokeWidth="0.45" />
      <line x1={ox - 19} y1={oy + drawH} x2={ox - 4} y2={oy + drawH} stroke="#64748B" strokeWidth="0.45" />
      <polygon points={`${ox - 16},${oy} ${ox - 18},${oy + 4} ${ox - 14},${oy + 4}`} fill="#1E293B" />
      <polygon points={`${ox - 16},${oy + drawH} ${ox - 18},${oy + drawH - 4} ${ox - 14},${oy + drawH - 4}`} fill="#1E293B" />
      <rect x={ox - 24} y={oy + drawH / 2 - 12} width="16" height="24" fill="#FFFFFF" />
      <text
        x={ox - 16}
        y={oy + drawH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        transform={`rotate(-90 ${ox - 16} ${oy + drawH / 2})`}
        fontSize="8.5"
        fontFamily="JetBrains Mono, monospace"
        fill="#0F172A"
      >
        {safeH}
      </text>

      {/* Outer Frame */}
      <rect x={ox} y={oy} width={drawW} height={drawH} fill="#F8FAFC" stroke="#334155" strokeWidth="1.1" />
      <rect
        x={ox + framePad}
        y={oy + framePad}
        width={drawW - framePad * 2}
        height={drawH - framePad * 2}
        fill="#FFFFFF"
        stroke="#475569"
        strokeWidth="0.8"
      />
      {/* Mitered frame corners */}
      <line x1={ox} y1={oy} x2={ox + framePad} y2={oy + framePad} stroke="#475569" strokeWidth="0.6" />
      <line x1={ox + drawW} y1={oy} x2={ox + drawW - framePad} y2={oy + framePad} stroke="#475569" strokeWidth="0.6" />
      <line x1={ox} y1={oy + drawH} x2={ox + framePad} y2={oy + drawH - framePad} stroke="#475569" strokeWidth="0.6" />
      <line x1={ox + drawW} y1={oy + drawH} x2={ox + drawW - framePad} y2={oy + drawH - framePad} stroke="#475569" strokeWidth="0.6" />

      {isCasement && (
        <>
          <rect
            x={ox + sashPad}
            y={oy + sashPad}
            width={drawW - sashPad * 2}
            height={drawH - sashPad * 2}
            fill="#F1F5F9"
            stroke="#334155"
            strokeWidth="0.8"
          />
          <rect
            x={ox + sashPad + 4}
            y={oy + sashPad + 4}
            width={drawW - (sashPad + 4) * 2}
            height={drawH - (sashPad + 4) * 2}
            fill="#E0F2FE"
            fillOpacity="0.45"
            stroke="#64748B"
            strokeWidth="0.65"
          />
          {isVentilator ? (
            <>
              <line x1={ox + sashPad + 4} y1={oy + drawH - sashPad - 4} x2={ox + drawW / 2} y2={oy + sashPad + 4} stroke="#334155" strokeWidth="0.7" strokeDasharray="3 2" />
              <line x1={ox + drawW - sashPad - 4} y1={oy + drawH - sashPad - 4} x2={ox + drawW / 2} y2={oy + sashPad + 4} stroke="#334155" strokeWidth="0.7" strokeDasharray="3 2" />
            </>
          ) : (
            <>
              <line x1={ox + sashPad + 4} y1={oy + sashPad + 4} x2={ox + drawW - sashPad - 4} y2={oy + drawH / 2} stroke="#334155" strokeWidth="0.7" strokeDasharray="3 2" />
              <line x1={ox + sashPad + 4} y1={oy + drawH - sashPad - 4} x2={ox + drawW - sashPad - 4} y2={oy + drawH / 2} stroke="#334155" strokeWidth="0.7" strokeDasharray="3 2" />
              {isTiltTurn && (
                <>
                  <line x1={ox + sashPad + 4} y1={oy + drawH - sashPad - 4} x2={ox + drawW / 2} y2={oy + sashPad + 4} stroke="#0891B2" strokeWidth="0.65" strokeDasharray="2 2" />
                  <line x1={ox + drawW - sashPad - 4} y1={oy + drawH - sashPad - 4} x2={ox + drawW / 2} y2={oy + sashPad + 4} stroke="#0891B2" strokeWidth="0.65" strokeDasharray="2 2" />
                </>
              )}
            </>
          )}
          <rect x={ox + drawW / 2 - 9} y={oy + sashPad + 6} width="18" height="10" fill="#FFFFFF" stroke="#475569" strokeWidth="0.5" />
          <text x={ox + drawW / 2} y={oy + sashPad + 11.5} textAnchor="middle" dominantBaseline="central" fontSize="6.5" fill="#0F172A">S1</text>
          <circle cx={ox + drawW / 2} cy={oy + drawH / 2 - 4} r="6.5" fill="#FFFFFF" stroke="#334155" strokeWidth="0.6" />
          <text x={ox + drawW / 2} y={oy + drawH / 2 - 4} textAnchor="middle" dominantBaseline="central" fontSize="6.5" fill="#0F172A">1</text>
          <rect x={ox + drawW / 2 - 14} y={oy + drawH / 2 + 6} width="28" height="9" rx="2" fill="#E0F2FE" stroke="#0891B2" strokeWidth="0.5" />
          <text x={ox + drawW / 2} y={oy + drawH / 2 + 10.5} textAnchor="middle" dominantBaseline="central" fontSize="5.4" fontWeight="600" fill="#0E7490">
            {isVentilator ? 'TOP' : isTiltTurn ? 'T&T' : 'OUT'}
          </text>
          <rect x={ox + drawW - sashPad - 31} y={oy + drawH / 2 - 4} width="27" height="8" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.45" />
          <text x={ox + drawW - sashPad - 17.5} y={oy + drawH / 2} textAnchor="middle" dominantBaseline="central" fontSize="5" fill="#0F172A">
            GHH = {ghh}
          </text>
          <rect x={ox + drawW / 2 - 8} y={oy + drawH - sashPad - 15} width="16" height="9" fill="#FFFFFF" stroke="#475569" strokeWidth="0.5" />
          <text x={ox + drawW / 2} y={oy + drawH - sashPad - 10.5} textAnchor="middle" dominantBaseline="central" fontSize="6.2" fill="#0F172A">F1</text>
        </>
      )}

      {(isDoubleCasement || isCombination) && (
        <>
          {(() => {
            const innerX = ox + framePad;
            const innerY = oy + framePad;
            const innerW = drawW - framePad * 2;
            const innerH = drawH - framePad * 2;
            const bayW = innerW / 2;

            return (
              <>
                <rect x={innerX + 2} y={innerY + 2} width={bayW - 3} height={innerH - 4} fill="#F1F5F9" stroke="#334155" strokeWidth="0.7" />
                <rect x={innerX + 5} y={innerY + 5} width={bayW - 9} height={innerH - 10} fill={isVilla ? 'url(#meshHatch)' : '#E0F2FE'} fillOpacity={isVilla ? 0.5 : 0.45} stroke="#64748B" strokeWidth="0.6" />
                <rect x={innerX + bayW + 1} y={innerY + 2} width={bayW - 3} height={innerH - 4} fill="#F1F5F9" stroke="#334155" strokeWidth="0.7" />
                <rect x={innerX + bayW + 4} y={innerY + 5} width={bayW - 9} height={innerH - 10} fill={isVilla ? 'url(#meshHatch)' : '#E0F2FE'} fillOpacity={isVilla ? 0.5 : 0.45} stroke="#64748B" strokeWidth="0.6" />
                <line x1={innerX + bayW} y1={innerY} x2={innerX + bayW} y2={innerY + innerH} stroke="#1E293B" strokeWidth="1" />

                {isVilla && (
                  <>
                    {/* Georgian grill horizontal & vertical muntin bars */}
                    <line x1={innerX + 5} y1={innerY + innerH * 0.35} x2={innerX + bayW - 4} y2={innerY + innerH * 0.35} stroke="#334155" strokeWidth="0.7" />
                    <line x1={innerX + 5} y1={innerY + innerH * 0.65} x2={innerX + bayW - 4} y2={innerY + innerH * 0.65} stroke="#334155" strokeWidth="0.7" />
                    <line x1={innerX + bayW + 4} y1={innerY + innerH * 0.35} x2={innerX + innerW - 5} y2={innerY + innerH * 0.35} stroke="#334155" strokeWidth="0.7" />
                    <line x1={innerX + bayW + 4} y1={innerY + innerH * 0.65} x2={innerX + innerW - 5} y2={innerY + innerH * 0.65} stroke="#334155" strokeWidth="0.7" />
                  </>
                )}

                {isDoubleCasement && (
                  <>
                    <line x1={innerX + 5} y1={innerY + 5} x2={innerX + bayW - 4} y2={innerY + innerH / 2} stroke="#334155" strokeWidth="0.65" strokeDasharray="3 2" />
                    <line x1={innerX + 5} y1={innerY + innerH - 5} x2={innerX + bayW - 4} y2={innerY + innerH / 2} stroke="#334155" strokeWidth="0.65" strokeDasharray="3 2" />
                  </>
                )}
                <line x1={innerX + innerW - 5} y1={innerY + 5} x2={innerX + bayW + 4} y2={innerY + innerH / 2} stroke="#334155" strokeWidth="0.65" strokeDasharray="3 2" />
                <line x1={innerX + innerW - 5} y1={innerY + innerH - 5} x2={innerX + bayW + 4} y2={innerY + innerH / 2} stroke="#334155" strokeWidth="0.65" strokeDasharray="3 2" />

                <rect x={innerX + bayW / 2 - 8} y={innerY + 6} width="16" height="8" fill="#FFFFFF" stroke="#475569" strokeWidth="0.45" />
                <text x={innerX + bayW / 2} y={innerY + 10} textAnchor="middle" dominantBaseline="central" fontSize="5.5" fill="#0F172A">
                  {isCombination ? 'FIX' : 'S1'}
                </text>
                <rect x={innerX + bayW + bayW / 2 - 8} y={innerY + 6} width="16" height="8" fill="#FFFFFF" stroke="#475569" strokeWidth="0.45" />
                <text x={innerX + bayW + bayW / 2} y={innerY + 10} textAnchor="middle" dominantBaseline="central" fontSize="5.5" fill="#0F172A">
                  {isCombination ? 'S1' : 'S2'}
                </text>
                <circle cx={innerX + bayW / 2} cy={innerY + innerH / 2} r="5.5" fill="#FFFFFF" stroke="#334155" strokeWidth="0.55" />
                <text x={innerX + bayW / 2} y={innerY + innerH / 2} textAnchor="middle" dominantBaseline="central" fontSize="5.8" fill="#0F172A">1</text>
                <circle cx={innerX + bayW + bayW / 2} cy={innerY + innerH / 2} r="5.5" fill="#FFFFFF" stroke="#334155" strokeWidth="0.55" />
                <text x={innerX + bayW + bayW / 2} y={innerY + innerH / 2} textAnchor="middle" dominantBaseline="central" fontSize="5.8" fill="#0F172A">2</text>
              </>
            );
          })()}
        </>
      )}

      {isBiFold && (
        <>
          {(() => {
            const innerX = ox + framePad;
            const innerY = oy + framePad;
            const innerW = drawW - framePad * 2;
            const innerH = drawH - framePad * 2;
            const panels = 3;
            const bayW = innerW / panels;

            return (
              <>
                {Array.from({ length: panels }).map((_, pIdx) => {
                  const px = innerX + bayW * pIdx;
                  const cx = px + bayW / 2;
                  return (
                    <React.Fragment key={`bf-${pIdx}`}>
                      <rect x={px + 1.5} y={innerY + 2} width={bayW - 3} height={innerH - 4} fill="#F1F5F9" stroke="#334155" strokeWidth="0.7" />
                      <rect x={px + 3.5} y={innerY + 4.5} width={Math.max(4, bayW - 7)} height={innerH - 9} fill="#E0F2FE" fillOpacity="0.45" stroke="#64748B" strokeWidth="0.55" />
                      {/* Accordion fold hinge triangle */}
                      <line x1={px + 3.5} y1={innerY + 4.5} x2={px + bayW - 3.5} y2={innerY + innerH / 2} stroke="#0F766E" strokeWidth="0.6" strokeDasharray="3 2" />
                      <line x1={px + 3.5} y1={innerY + innerH - 4.5} x2={px + bayW - 3.5} y2={innerY + innerH / 2} stroke="#0F766E" strokeWidth="0.6" strokeDasharray="3 2" />
                      <rect x={cx - 7} y={innerY + 6} width="14" height="7.5" fill="#FFFFFF" stroke="#475569" strokeWidth="0.45" />
                      <text x={cx} y={innerY + 9.8} textAnchor="middle" dominantBaseline="central" fontSize="5" fill="#0F172A">{`F${pIdx + 1}`}</text>
                    </React.Fragment>
                  );
                })}
                <rect x={ox + drawW + 3} y={oy + drawH - 11} width="17" height="9" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.45" />
                <text x={ox + drawW + 11.5} y={oy + drawH - 6.5} textAnchor="middle" dominantBaseline="central" fontSize="4.8" fill="#0F172A">FOLD</text>
              </>
            );
          })()}
        </>
      )}

      {isSliding && (
        <>
          {(() => {
            const innerX = ox + framePad;
            const innerY = oy + framePad;
            const innerW = drawW - framePad * 2;
            const innerH = drawH - framePad * 2;
            const bayW = innerW / slidingPanels;
            const panelWLabel = Math.round(safeW / slidingPanels);

            return (
              <>
                {Array.from({ length: slidingPanels }).map((_, pIdx) => {
                  const px = innerX + bayW * pIdx;
                  const isMeshPanel = hasMesh && pIdx === slidingPanels - 1;
                  const arrowRight = pIdx < slidingPanels / 2;
                  const cx = px + bayW / 2;

                  return (
                    <React.Fragment key={pIdx}>
                      <rect
                        x={px + 1.5}
                        y={innerY + 2}
                        width={bayW - 3}
                        height={innerH - 4}
                        fill="#F8FAFC"
                        stroke="#334155"
                        strokeWidth="0.7"
                      />
                      <rect
                        x={px + 3.5}
                        y={innerY + 4.5}
                        width={Math.max(4, bayW - 7)}
                        height={innerH - 9}
                        fill={isMeshPanel ? 'url(#meshHatch)' : '#E0F2FE'}
                        fillOpacity={isMeshPanel ? 0.85 : 0.45}
                        stroke="#64748B"
                        strokeWidth="0.55"
                      />
                      {pIdx > 0 && (
                        <line x1={px} y1={innerY} x2={px} y2={innerY + innerH} stroke="#1E293B" strokeWidth="0.9" />
                      )}

                      <rect x={cx - 7} y={innerY + 6} width="14" height="7.5" fill="#FFFFFF" stroke="#475569" strokeWidth="0.45" />
                      <text x={cx} y={innerY + 9.8} textAnchor="middle" dominantBaseline="central" fontSize="5" fill="#0F172A">
                        {`S${pIdx + 1}`}
                      </text>

                      {isMeshPanel && (
                        <>
                          <rect x={cx - 7} y={innerY + 14.5} width="14" height="7.5" fill="#FFFFFF" stroke="#475569" strokeWidth="0.45" />
                          <text x={cx} y={innerY + 18.2} textAnchor="middle" dominantBaseline="central" fontSize="4.8" fill="#0F172A">M3</text>
                        </>
                      )}

                      <circle cx={cx} cy={innerY + innerH / 2} r="5" fill="#FFFFFF" stroke="#334155" strokeWidth="0.55" />
                      <text x={cx} y={innerY + innerH / 2} textAnchor="middle" dominantBaseline="central" fontSize="5.4" fill="#0F172A">
                        {pIdx + 1}
                      </text>

                      {/* Direction arrow */}
                      <line x1={cx - 7} y1={innerY + innerH / 2 + 9} x2={cx + 7} y2={innerY + innerH / 2 + 9} stroke="#0F172A" strokeWidth="0.65" />
                      {arrowRight ? (
                        <polygon points={`${cx + 8},${innerY + innerH / 2 + 9} ${cx + 4.5},${innerY + innerH / 2 + 7.2} ${cx + 4.5},${innerY + innerH / 2 + 10.8}`} fill="#0F172A" />
                      ) : (
                        <polygon points={`${cx - 8},${innerY + innerH / 2 + 9} ${cx - 4.5},${innerY + innerH / 2 + 7.2} ${cx - 4.5},${innerY + innerH / 2 + 10.8}`} fill="#0F172A" />
                      )}
                    </React.Fragment>
                  );
                })}

                <rect x={innerX + innerW - bayW / 2 - 8} y={innerY + innerH - 13} width="16" height="7.5" fill="#FFFFFF" stroke="#475569" strokeWidth="0.45" />
                <text x={innerX + innerW - bayW / 2} y={innerY + innerH - 9.2} textAnchor="middle" dominantBaseline="central" fontSize="4.8" fill="#0F172A">
                  {hasMesh ? 'MS3' : 'F1'}
                </text>

                <rect x={ox + drawW + 3} y={oy + drawH - 11} width="15" height="9" fill="#FFFFFF" stroke="#64748B" strokeWidth="0.45" />
                <text x={ox + drawW + 10.5} y={oy + drawH - 6.5} textAnchor="middle" dominantBaseline="central" fontSize="5" fill="#0F172A">
                  {resolvedType.includes('Lift') ? 'L&S' : resolvedType.includes('Door') ? 'DR' : 'TN'}
                </text>

                {/* Split width dimensions */}
                <line x1={ox} y1={oy + drawH + 10} x2={ox + drawW} y2={oy + drawH + 10} stroke="#334155" strokeWidth="0.6" />
                {Array.from({ length: slidingPanels }).map((_, pIdx) => {
                  const segCenter = ox + (drawW / slidingPanels) * (pIdx + 0.5);
                  const splitLineX = ox + (drawW / slidingPanels) * pIdx;
                  return (
                    <React.Fragment key={`dim-${pIdx}`}>
                      {pIdx > 0 && (
                        <line x1={splitLineX} y1={oy + drawH + 4} x2={splitLineX} y2={oy + drawH + 14} stroke="#64748B" strokeWidth="0.5" />
                      )}
                      <rect x={segCenter - 10} y={oy + drawH + 5} width="20" height="9" fill="#FFFFFF" />
                      <text x={segCenter} y={oy + drawH + 9.5} textAnchor="middle" dominantBaseline="central" fontSize="6" fontFamily="JetBrains Mono, monospace" fill="#0F172A">
                        {pIdx === slidingPanels - 1 ? safeW - panelWLabel * (slidingPanels - 1) : panelWLabel}
                      </text>
                    </React.Fragment>
                  );
                })}

                {/* Horizontal Track Section Plan */}
                <g transform={`translate(${ox}, ${oy + drawH + 34})`}>
                  <text x={drawW / 2} y="-3" textAnchor="middle" fontSize="4.8" fill="#64748B">OUT</text>
                  <rect x="0" y="0" width={drawW} height="8" fill="#F8FAFC" stroke="#334155" strokeWidth="0.7" />
                  <rect x="3" y="1.5" width={drawW / 2 - 1} height="2" fill="#475569" />
                  <rect x={drawW / 2 - 2} y="4.5" width={drawW / 2 - 1} height="2" fill="#475569" />
                  <text x={drawW / 2} y="14" textAnchor="middle" fontSize="4.8" fill="#64748B">IN</text>
                </g>
              </>
            );
          })()}
        </>
      )}

      {!isCasement && !isSliding && !isDoubleCasement && !isCombination && !isBiFold && (
        <>
          <rect
            x={ox + framePad + 3}
            y={oy + framePad + 3}
            width={drawW - (framePad + 3) * 2}
            height={drawH - (framePad + 3) * 2}
            fill="#E0F2FE"
            fillOpacity="0.45"
            stroke="#64748B"
            strokeWidth="0.7"
          />
          <circle cx={ox + drawW / 2} cy={oy + drawH / 2} r="6.5" fill="#FFFFFF" stroke="#334155" strokeWidth="0.6" />
          <text x={ox + drawW / 2} y={oy + drawH / 2} textAnchor="middle" dominantBaseline="central" fontSize="6.5" fill="#0F172A">
            1
          </text>
          <rect x={ox + drawW / 2 - 8} y={oy + drawH - framePad - 15} width="16" height="9" fill="#FFFFFF" stroke="#475569" strokeWidth="0.5" />
          <text x={ox + drawW / 2} y={oy + drawH - framePad - 10.5} textAnchor="middle" dominantBaseline="central" fontSize="6.2" fill="#0F172A">
            F1
          </text>
        </>
      )}

      {/* Overall Bottom Width Dimension */}
      {(() => {
        const dimY = isSliding ? oy + drawH + 22 : oy + drawH + 14;
        return (
          <>
            <line x1={ox} y1={dimY} x2={ox + drawW} y2={dimY} stroke="#1E293B" strokeWidth="0.7" />
            <line x1={ox} y1={oy + drawH + 2} x2={ox} y2={dimY + 3} stroke="#64748B" strokeWidth="0.45" />
            <line x1={ox + drawW} y1={oy + drawH + 2} x2={ox + drawW} y2={dimY + 3} stroke="#64748B" strokeWidth="0.45" />
            <polygon points={`${ox},${dimY} ${ox + 4},${dimY - 2} ${ox + 4},${dimY + 2}`} fill="#1E293B" />
            <polygon points={`${ox + drawW},${dimY} ${ox + drawW - 4},${dimY - 2} ${ox + drawW - 4},${dimY + 2}`} fill="#1E293B" />
            <rect x={ox + drawW / 2 - 14} y={dimY - 5} width="28" height="10" fill="#FFFFFF" />
            <text
              x={ox + drawW / 2}
              y={dimY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="8.5"
              fontFamily="JetBrains Mono, monospace"
              fill="#0F172A"
            >
              {safeW}
            </text>
          </>
        );
      })()}
    </svg>
  );
};

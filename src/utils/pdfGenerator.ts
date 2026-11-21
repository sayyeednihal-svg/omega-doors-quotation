import { jsPDF } from 'jspdf';
import { QuotationState, WindowItem } from '../types/quotation';
import { calcQuotationTotals, formatINR, inferWindowType } from './calculations';

interface LoadedImages {
  omegaLogo: string | null;
  apolloLogo: string | null;
  footerBanner: string | null;
  offeringTop: string | null;
  offeringLeft: string | null;
  offeringRight: string | null;
  offeringBottom: string | null;
  profileColors: string | null;
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function loadAllAssets(): Promise<LoadedImages> {
  const [
    omegaLogo,
    apolloLogo,
    footerBanner,
    offeringTop,
    offeringLeft,
    offeringRight,
    offeringBottom,
    profileColors,
  ] = await Promise.all([
    fetchAsDataUrl('/assets/quotation/omega-logo.jpg'),
    fetchAsDataUrl('/assets/quotation/apl-apollo-logo.jpg'),
    fetchAsDataUrl('/assets/quotation/footer-banner.jpg'),
    fetchAsDataUrl('/assets/quotation/offering-top.png'),
    fetchAsDataUrl('/assets/quotation/offering-left.png'),
    fetchAsDataUrl('/assets/quotation/offering-right.png'),
    fetchAsDataUrl('/assets/quotation/offering-bottom.png'),
    fetchAsDataUrl('/assets/quotation/profile-colors.png'),
  ]);

  return {
    omegaLogo,
    apolloLogo,
    footerBanner,
    offeringTop,
    offeringLeft,
    offeringRight,
    offeringBottom,
    profileColors,
  };
}

function drawFooter(doc: jsPDF, pageNum: number, totalPages: number, footerBanner: string | null) {
  if (footerBanner) {
    // 2048x245 -> aspect ~8.36
    doc.addImage(footerBanner, 'JPEG', 31, 264, 148, 17.7);
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${pageNum} of ${totalPages}`, 10.5, 288);
  doc.text('powered by EvA WinOptimize Software', 199.5, 288, { align: 'right' });
}

function drawQuoteMetaTable(doc: jsPDF, state: QuotationState, startY: number, font: 'times' | 'helvetica' = 'times') {
  const cols = [40.5, 34, 34, 34, 46.5]; // sums to 189mm
  const x0 = 10.5;
  const rowH = 6.5;
  const headers = ['Quote No.', 'Quote Date', 'Modified On', 'Valid Upto', 'Responsible'];
  const values = [
    state.meta.quoteNo,
    state.meta.quoteDate,
    state.meta.modifiedOn,
    state.meta.validUpto,
    state.meta.responsible,
  ];

  doc.setDrawColor(110, 110, 110);
  doc.setLineWidth(0.25);

  let cx = x0;
  for (let i = 0; i < cols.length; i++) {
    doc.rect(cx, startY, cols[i], rowH);
    doc.rect(cx, startY + rowH, cols[i], rowH);

    doc.setFont(font, 'bold');
    doc.setFontSize(font === 'times' ? 9.5 : 8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(headers[i], cx + cols[i] / 2, startY + 4.4, { align: 'center' });

    doc.setFont(font, 'normal');
    doc.setFontSize(font === 'times' ? 9 : 8.2);
    doc.text(values[i] || '-', cx + cols[i] / 2, startY + rowH + 4.4, { align: 'center' });

    cx += cols[i];
  }
}

function drawWindowCadInPdf(doc: jsPDF, win: WindowItem, boxX: number, boxY: number, boxW: number, boxH: number) {
  const safeW = Math.max(300, win.widthMm || 1000);
  const safeH = Math.max(300, win.heightMm || 1000);
  const resolvedType = inferWindowType(win);
  const isVilla = resolvedType === 'Villa Window (Twin Sash + Grill & Mesh)';
  const isBiFold = resolvedType === 'Bi-Fold Door (Multi-Panel)';
  const isSliding =
    resolvedType.includes('Sliding') ||
    resolvedType.includes('Lift & Slide') ||
    (!isBiFold && !isVilla && win.series.includes('SLIDING'));
  const isDoubleCasement =
    resolvedType === 'Casement Window (Double Shutter)' ||
    resolvedType === 'Casement Door' ||
    isVilla;
  const isCombination = resolvedType === 'Combination (Fixed + Openable)';
  const isTiltTurn = resolvedType === 'Tilt & Turn Window';
  const isVentilator = resolvedType === 'Ventilator (Top-Hung / Exhaust)';
  const isCasement =
    !isSliding &&
    !isDoubleCasement &&
    !isCombination &&
    !isBiFold &&
    (resolvedType.includes('Casement') || isTiltTurn || isVentilator || win.series.includes('CASEMENT') || win.series.includes('VENTILATOR'));
  const slidingPanels = resolvedType.includes('4-Panel')
    ? 4
    : resolvedType.includes('3 Panel')
      ? 3
      : 2;
  const hasMesh = win.meshType !== '' && win.meshType.toLowerCase() !== 'no';

  const maxDrawW = boxW - 26;
  const maxDrawH = isSliding ? boxH - 22 : boxH - 14;
  const scale = Math.min(maxDrawW / safeW, maxDrawH / safeH);
  const drawW = Math.max(22, safeW * scale);
  const drawH = Math.max(18, safeH * scale);

  const ox = boxX + (boxW - drawW) / 2 + 3;
  const oy = boxY + 4;
  const framePad = 1.6;
  const sashPad = 3.2;

  // Left vertical height dimension
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.22);
  const dimX = ox - 5.5;
  doc.line(dimX, oy, dimX, oy + drawH);
  doc.line(dimX - 1.2, oy, ox - 1, oy);
  doc.line(dimX - 1.2, oy + drawH, ox - 1, oy + drawH);
  doc.line(dimX, oy, dimX - 0.7, oy + 1.5);
  doc.line(dimX, oy, dimX + 0.7, oy + 1.5);
  doc.line(dimX, oy + drawH, dimX - 0.7, oy + drawH - 1.5);
  doc.line(dimX, oy + drawH, dimX + 0.7, oy + drawH - 1.5);

  doc.setFillColor(255, 255, 255);
  doc.rect(dimX - 2, oy + drawH / 2 - 4, 4, 8, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(String(safeH), dimX + 1, oy + drawH / 2, { angle: 90, align: 'center' });

  // Outer Frame
  doc.setDrawColor(60, 70, 85);
  doc.setLineWidth(0.32);
  doc.rect(ox, oy, drawW, drawH);
  doc.setLineWidth(0.2);
  doc.rect(ox + framePad, oy + framePad, drawW - framePad * 2, drawH - framePad * 2);
  doc.line(ox, oy, ox + framePad, oy + framePad);
  doc.line(ox + drawW, oy, ox + drawW - framePad, oy + framePad);
  doc.line(ox, oy + drawH, ox + framePad, oy + drawH - framePad);
  doc.line(ox + drawW, oy + drawH, ox + drawW - framePad, oy + drawH - framePad);

  if (isCasement) {
    doc.rect(ox + sashPad, oy + sashPad, drawW - sashPad * 2, drawH - sashPad * 2);
    doc.setFillColor(240, 248, 255);
    doc.rect(ox + sashPad + 1.2, oy + sashPad + 1.2, drawW - (sashPad + 1.2) * 2, drawH - (sashPad + 1.2) * 2, 'FD');

    doc.setLineDashPattern([1.2, 0.9], 0);
    doc.setDrawColor(50, 60, 75);
    if (isVentilator) {
      doc.line(ox + sashPad + 1.2, oy + drawH - sashPad - 1.2, ox + drawW / 2, oy + sashPad + 1.2);
      doc.line(ox + drawW - sashPad - 1.2, oy + drawH - sashPad - 1.2, ox + drawW / 2, oy + sashPad + 1.2);
    } else {
      doc.line(ox + sashPad + 1.2, oy + sashPad + 1.2, ox + drawW - sashPad - 1.2, oy + drawH / 2);
      doc.line(ox + sashPad + 1.2, oy + drawH - sashPad - 1.2, ox + drawW - sashPad - 1.2, oy + drawH / 2);
      if (isTiltTurn) {
        doc.line(ox + sashPad + 1.2, oy + drawH - sashPad - 1.2, ox + drawW / 2, oy + sashPad + 1.2);
        doc.line(ox + drawW - sashPad - 1.2, oy + drawH - sashPad - 1.2, ox + drawW / 2, oy + sashPad + 1.2);
      }
    }
    doc.setLineDashPattern([], 0);

    doc.setFillColor(255, 255, 255);
    doc.rect(ox + drawW / 2 - 3, oy + sashPad + 2, 6, 3.2, 'FD');
    doc.setFontSize(5.5);
    doc.text('S1', ox + drawW / 2, oy + sashPad + 4.3, { align: 'center' });

    doc.circle(ox + drawW / 2, oy + drawH / 2 - 1.5, 2.2, 'FD');
    doc.text('1', ox + drawW / 2, oy + drawH / 2 - 0.7, { align: 'center' });

    doc.setDrawColor(8, 145, 178);
    doc.setFillColor(224, 242, 254);
    doc.rect(ox + drawW / 2 - 4, oy + drawH / 2 + 2.2, 8, 3.2, 'FD');
    doc.setTextColor(14, 116, 144);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.text(isVentilator ? 'TOP' : isTiltTurn ? 'T&T' : 'OUT', ox + drawW / 2, oy + drawH / 2 + 4.5, { align: 'center' });

    const ghh = Math.round(safeH * 0.47);
    doc.setDrawColor(100, 116, 139);
    doc.setFillColor(255, 255, 255);
    doc.rect(ox + drawW - sashPad - 10.5, oy + drawH / 2 - 1.5, 9, 2.8, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(4.2);
    doc.text(`GHH = ${ghh}`, ox + drawW - sashPad - 6, oy + drawH / 2 + 0.5, { align: 'center' });

    doc.rect(ox + drawW / 2 - 2.8, oy + drawH - sashPad - 5.2, 5.6, 3, 'FD');
    doc.setFontSize(5.2);
    doc.text('F1', ox + drawW / 2, oy + drawH - sashPad - 3, { align: 'center' });
  } else if (isDoubleCasement || isCombination) {
    const innerX = ox + framePad;
    const innerY = oy + framePad;
    const innerW = drawW - framePad * 2;
    const innerH = drawH - framePad * 2;
    const bayW = innerW / 2;

    doc.setFillColor(244, 249, 253);
    doc.rect(innerX + 0.8, innerY + 0.8, bayW - 1, innerH - 1.6, 'FD');
    doc.rect(innerX + bayW + 0.2, innerY + 0.8, bayW - 1, innerH - 1.6, 'FD');
    doc.line(innerX + bayW, innerY, innerX + bayW, innerY + innerH);

    if (isVilla) {
      doc.setDrawColor(80, 90, 105);
      doc.line(innerX + 0.8, innerY + innerH * 0.35, innerX + bayW - 0.2, innerY + innerH * 0.35);
      doc.line(innerX + 0.8, innerY + innerH * 0.65, innerX + bayW - 0.2, innerY + innerH * 0.65);
      doc.line(innerX + bayW + 0.2, innerY + innerH * 0.35, innerX + innerW - 0.8, innerY + innerH * 0.35);
      doc.line(innerX + bayW + 0.2, innerY + innerH * 0.65, innerX + innerW - 0.8, innerY + innerH * 0.65);
    }

    doc.setLineDashPattern([1.1, 0.8], 0);
    if (isDoubleCasement) {
      doc.line(innerX + 1.2, innerY + 1.2, innerX + bayW - 1, innerY + innerH / 2);
      doc.line(innerX + 1.2, innerY + innerH - 1.2, innerX + bayW - 1, innerY + innerH / 2);
    }
    doc.line(innerX + innerW - 1.2, innerY + 1.2, innerX + bayW + 1, innerY + innerH / 2);
    doc.line(innerX + innerW - 1.2, innerY + innerH - 1.2, innerX + bayW + 1, innerY + innerH / 2);
    doc.setLineDashPattern([], 0);

    doc.setFillColor(255, 255, 255);
    doc.setFontSize(4.6);
    doc.setTextColor(15, 23, 42);
    doc.rect(innerX + bayW / 2 - 2.8, innerY + 1.8, 5.6, 2.6, 'FD');
    doc.text(isCombination ? 'FIX' : 'S1', innerX + bayW / 2, innerY + 3.6, { align: 'center' });
    doc.rect(innerX + bayW + bayW / 2 - 2.8, innerY + 1.8, 5.6, 2.6, 'FD');
    doc.text(isCombination ? 'S1' : 'S2', innerX + bayW + bayW / 2, innerY + 3.6, { align: 'center' });
  } else if (isBiFold) {
    const innerX = ox + framePad;
    const innerY = oy + framePad;
    const innerW = drawW - framePad * 2;
    const innerH = drawH - framePad * 2;
    const panels = 3;
    const bayW = innerW / panels;
    for (let pIdx = 0; pIdx < panels; pIdx++) {
      const px = innerX + bayW * pIdx;
      const cx = px + bayW / 2;
      doc.setFillColor(244, 249, 253);
      doc.rect(px + 0.6, innerY + 0.8, bayW - 1.2, innerH - 1.6, 'FD');
      doc.setLineDashPattern([1, 0.8], 0);
      doc.line(px + 1, innerY + 1.2, px + bayW - 1, innerY + innerH / 2);
      doc.line(px + 1, innerY + innerH - 1.2, px + bayW - 1, innerY + innerH / 2);
      doc.setLineDashPattern([], 0);
      doc.setFillColor(255, 255, 255);
      doc.setFontSize(4.4);
      doc.rect(cx - 2.2, innerY + 1.8, 4.4, 2.4, 'FD');
      doc.text(`F${pIdx + 1}`, cx, innerY + 3.4, { align: 'center' });
    }
    doc.setFillColor(255, 255, 255);
    doc.rect(ox + drawW + 1, oy + drawH - 3.6, 5.4, 2.8, 'FD');
    doc.setFontSize(4.2);
    doc.text('FOLD', ox + drawW + 3.7, oy + drawH - 1.7, { align: 'center' });
  } else if (isSliding) {
    const innerX = ox + framePad;
    const innerY = oy + framePad;
    const innerW = drawW - framePad * 2;
    const innerH = drawH - framePad * 2;
    const bayW = innerW / slidingPanels;
    const panelWLabel = Math.round(safeW / slidingPanels);

    for (let pIdx = 0; pIdx < slidingPanels; pIdx++) {
      const px = innerX + bayW * pIdx;
      const isMeshPanel = hasMesh && pIdx === slidingPanels - 1;
      const cx = px + bayW / 2;

      doc.setFillColor(isMeshPanel ? 242 : 244, isMeshPanel ? 245 : 249, isMeshPanel ? 248 : 253);
      doc.rect(px + 0.6, innerY + 0.8, bayW - 1.2, innerH - 1.6, 'FD');

      if (isMeshPanel) {
        doc.setDrawColor(200, 208, 218);
        doc.setLineWidth(0.1);
        for (let gx = px + 1.5; gx < px + bayW - 1; gx += 1.8) {
          doc.line(gx, innerY + 1.5, gx, innerY + innerH - 1.5);
        }
        doc.setDrawColor(60, 70, 85);
        doc.setLineWidth(0.2);
      }

      if (pIdx > 0) {
        doc.line(px, innerY, px, innerY + innerH);
      }

      doc.setFillColor(255, 255, 255);
      doc.setFontSize(4.4);
      doc.setTextColor(15, 23, 42);
      doc.rect(cx - 2.4, innerY + 1.8, 4.8, 2.5, 'FD');
      doc.text(`S${pIdx + 1}`, cx, innerY + 3.5, { align: 'center' });

      if (isMeshPanel) {
        doc.rect(cx - 2.4, innerY + 4.7, 4.8, 2.4, 'FD');
        doc.text('M3', cx, innerY + 6.3, { align: 'center' });
      }

      doc.circle(cx, innerY + innerH / 2, 1.7, 'FD');
      doc.text(String(pIdx + 1), cx, innerY + innerH / 2 + 0.6, { align: 'center' });

      const arrowRight = pIdx < slidingPanels / 2;
      doc.line(cx - 2.4, innerY + innerH / 2 + 3.2, cx + 2.4, innerY + innerH / 2 + 3.2);
      if (arrowRight) {
        doc.line(cx + 2.4, innerY + innerH / 2 + 3.2, cx + 1.4, innerY + innerH / 2 + 2.6);
        doc.line(cx + 2.4, innerY + innerH / 2 + 3.2, cx + 1.4, innerY + innerH / 2 + 3.8);
      } else {
        doc.line(cx - 2.4, innerY + innerH / 2 + 3.2, cx - 1.4, innerY + innerH / 2 + 2.6);
        doc.line(cx - 2.4, innerY + innerH / 2 + 3.2, cx - 1.4, innerY + innerH / 2 + 3.8);
      }
    }

    doc.setFillColor(255, 255, 255);
    doc.rect(innerX + innerW - bayW / 2 - 2.8, innerY + innerH - 4.5, 5.6, 2.5, 'FD');
    doc.text(hasMesh ? 'MS3' : 'F1', innerX + innerW - bayW / 2, innerY + innerH - 2.8, { align: 'center' });

    doc.rect(ox + drawW + 1, oy + drawH - 3.6, 5.0, 2.8, 'FD');
    doc.setFontSize(4.2);
    doc.text(
      resolvedType.includes('Lift') ? 'L&S' : resolvedType.includes('Door') ? 'DR' : 'TN',
      ox + drawW + 3.5,
      oy + drawH - 1.7,
      { align: 'center' }
    );

    const splitY = oy + drawH + 3.5;
    doc.line(ox, splitY, ox + drawW, splitY);
    for (let pIdx = 0; pIdx < slidingPanels; pIdx++) {
      if (pIdx > 0) {
        const splitX = ox + (drawW / slidingPanels) * pIdx;
        doc.line(splitX, oy + drawH + 1, splitX, splitY + 1.5);
      }
      const segCenter = ox + (drawW / slidingPanels) * (pIdx + 0.5);
      doc.setFillColor(255, 255, 255);
      doc.rect(segCenter - 3.6, splitY - 1.5, 7.2, 3, 'F');
      doc.setFontSize(5.5);
      const val = pIdx === slidingPanels - 1 ? safeW - panelWLabel * (slidingPanels - 1) : panelWLabel;
      doc.text(String(val), segCenter, splitY + 0.8, { align: 'center' });
    }

    const secY = oy + drawH + 12.2;
    doc.setFontSize(4.2);
    doc.setTextColor(100, 116, 139);
    doc.text('OUT', ox + drawW / 2, secY - 0.8, { align: 'center' });
    doc.setDrawColor(60, 70, 85);
    doc.rect(ox, secY, drawW, 2.8);
    doc.setFillColor(80, 90, 105);
    doc.rect(ox + 1, secY + 0.5, drawW / 2 - 0.5, 0.7, 'F');
    doc.rect(ox + drawW / 2 - 0.5, secY + 1.6, drawW / 2 - 0.5, 0.7, 'F');
    doc.text('IN', ox + drawW / 2, secY + 4.8, { align: 'center' });
  } else {
    doc.setFillColor(240, 248, 255);
    doc.rect(ox + framePad + 1, oy + framePad + 1, drawW - (framePad + 1) * 2, drawH - (framePad + 1) * 2, 'FD');
    doc.setFillColor(255, 255, 255);
    doc.circle(ox + drawW / 2, oy + drawH / 2, 2.2, 'FD');
    doc.setFontSize(5.5);
    doc.text('1', ox + drawW / 2, oy + drawH / 2 + 0.7, { align: 'center' });
    doc.rect(ox + drawW / 2 - 2.8, oy + drawH - framePad - 5, 5.6, 2.8, 'FD');
    doc.text('F1', ox + drawW / 2, oy + drawH - framePad - 3, { align: 'center' });
  }

  // Overall width dimension line
  const wDimY = isSliding ? oy + drawH + 8 : oy + drawH + 5;
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.22);
  doc.line(ox, wDimY, ox + drawW, wDimY);
  doc.line(ox, oy + drawH + 0.8, ox, wDimY + 1.2);
  doc.line(ox + drawW, oy + drawH + 0.8, ox + drawW, wDimY + 1.2);
  doc.line(ox, wDimY, ox + 1.5, wDimY - 0.7);
  doc.line(ox, wDimY, ox + 1.5, wDimY + 0.7);
  doc.line(ox + drawW, wDimY, ox + drawW - 1.5, wDimY - 0.7);
  doc.line(ox + drawW, wDimY, ox + drawW - 1.5, wDimY + 0.7);

  doc.setFillColor(255, 255, 255);
  doc.rect(ox + drawW / 2 - 5.5, wDimY - 1.6, 11, 3.2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(String(safeW), ox + drawW / 2, wDimY + 0.9, { align: 'center' });
}

export interface GeneratedPdfResult {
  blob: Blob;
  fileName: string;
  dataUrl: string;
  totalPages: number;
}

export async function generateQuotationPdf(state: QuotationState): Promise<GeneratedPdfResult> {
  const assets = await loadAllAssets();
  const totals = calcQuotationTotals(state.windows, state.charges);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Chunk windows at 3 per page so Page 2 matches the reference PDF for 1–3 windows
  // and cleanly paginates if user adds 4+ windows.
  const windowPages: typeof totals.lines[] = [];
  for (let i = 0; i < totals.lines.length; i += 3) {
    windowPages.push(totals.lines.slice(i, i + 3));
  }
  if (windowPages.length === 0) {
    windowPages.push([]);
  }

  const totalPages = 1 + windowPages.length + 3; // Cover + Window pages + Summary + Offerings + T&C

  // =========================================================================
  // PAGE 1: Cover letter, customer/company details, quotation information
  // =========================================================================
  if (assets.omegaLogo) {
    doc.addImage(assets.omegaLogo, 'JPEG', 11, 10, 28, 28);
  }
  if (assets.apolloLogo) {
    doc.addImage(assets.apolloLogo, 'JPEG', 160, 9.5, 38, 32);
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Quotation-Material', 105, 13, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(9.5);
  doc.text('Omega Doors Industries', 105, 19.5, { align: 'center' });

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.text('Gat No. 177, Laxmi Complex, Talwade Nigdi Road, Ganesh Nagar,', 105, 23.5, { align: 'center' });
  doc.text('Talwade, Pimpri Chinchwad, Pune 411062, Maharashtra MH', 105, 27.3, { align: 'center' });
  doc.text('Contact No. : +91 9225537971', 105, 31.1, { align: 'center' });
  doc.text('Email : info@omegagroupofindustries.com', 105, 34.9, { align: 'center' });
  doc.text('GSTIN : 27ERFPS3275D2ZJ', 105, 38.7, { align: 'center' });

  // To / Deliver To Table
  const toY = 49;
  const colW = 94.5;
  doc.setDrawColor(110, 110, 110);
  doc.setLineWidth(0.25);
  doc.rect(10.5, toY, colW, 6);
  doc.rect(10.5 + colW, toY, colW, 6);
  doc.rect(10.5, toY + 6, colW, 21.5);
  doc.rect(10.5 + colW, toY + 6, colW, 21.5);

  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text('To', 12.2, toY + 4.2);
  doc.text('Deliver To', 10.5 + colW + 1.7, toY + 4.2);

  // Left (To)
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text(state.client.clientName || '-', 12.2, toY + 10.2);
  doc.setFontSize(8.5);
  const siteLines = doc.splitTextToSize(state.client.siteAddress || '-', colW - 4).slice(0, 2);
  doc.text(siteLines, 12.2, toY + 16.5);
  doc.text(`Contact No.: ${state.client.mobile || '-'}`, 12.2, toY + 22.8);
  doc.text(`Email Id: ${state.client.email || ''}`, 12.2, toY + 26.2);

  // Right (Deliver To)
  const delName = state.client.useSeparateDelivery
    ? state.client.deliveryName || state.client.clientName
    : state.client.clientName;
  const delAddr = state.client.useSeparateDelivery
    ? state.client.deliveryAddress || state.client.siteAddress
    : state.client.siteAddress;
  const delMob = state.client.useSeparateDelivery
    ? state.client.deliveryMobile || state.client.mobile
    : state.client.mobile;
  const delEmail = state.client.useSeparateDelivery
    ? state.client.deliveryEmail
    : state.client.email;

  doc.setFontSize(9);
  doc.text(delName || '-', 10.5 + colW + 1.7, toY + 10.2);
  doc.setFontSize(8.5);
  const delLines = doc.splitTextToSize(delAddr || '-', colW - 4).slice(0, 2);
  doc.text(delLines, 10.5 + colW + 1.7, toY + 16.5);
  doc.text(`Contact No.: ${delMob || '-'}`, 10.5 + colW + 1.7, toY + 22.8);
  doc.text(`Email Id: ${delEmail || ''}`, 10.5 + colW + 1.7, toY + 26.2);

  // Quote Metadata Table
  drawQuoteMetaTable(doc, state, toY + 27.5, 'times');

  // Cover letter text
  let cy = 95.5;
  doc.setFont('times', 'normal');
  doc.setFontSize(9.5);
  doc.text('Dear Sir/Mam,', 11.5, cy);
  cy += 6;

  doc.setFont('times', 'bold');
  doc.text('We’re pleased to know that you are considering APL APOLLO Doors and Windows for your premises.', 11.5, cy);
  cy += 6;

  doc.setFont('times', 'normal');
  const p1 = doc.splitTextToSize(
    'APL Apollo is committed to delivering superior quality solutions right to your doorstep—engineered to offer enhanced protection against noise, heat, rain, dust, and pollution making it the preferred choice for contemporary living and work environments.',
    186
  );
  doc.text(p1, 11.5, cy);
  cy += p1.length * 4.2 + 3.5;

  const p2 = doc.splitTextToSize(
    'In preparing this proposal, our objective has been to recommend designs that not only enhance interior comfort and aesthetics but also elevate the external appearance of your building.',
    186
  );
  doc.text(p2, 11.5, cy);
  cy += p2.length * 4.2 + 4.5;

  const p3 = doc.splitTextToSize(
    'With a well-established and responsive service network, APL Apollo ensures a smooth and hassle-free experience right from selection to installation, delivered directly to your doorstep. Please find enclosed our detailed proposal for your kind consideration.',
    186
  );
  doc.text(p3, 11.5, cy);
  cy += p3.length * 4.2 + 5.5;

  doc.text('a) Window design, specification and value', 21.5, cy);
  cy += 5.2;
  doc.text('b) Terms and conditions of Contract', 21.5, cy);
  cy += 5.2;
  doc.text('c) Floor Plan and Route map to site', 21.5, cy);
  cy += 5.8;

  doc.text('We are looking forward to getting your approval on the submitted quotation.', 11.5, cy);
  cy += 9.5;

  doc.text('For', 11.5, cy);
  cy += 4.3;
  doc.setFont('times', 'bold');
  doc.text('Omega Doors Industries,', 11.5, cy);
  cy += 16;

  if (state.meta.createdBy) {
    doc.setFont('times', 'bold');
    doc.text(`Created By : ${state.meta.createdBy}`, 11.5, cy);
    cy += 4.4;
  }

  doc.setFont('times', 'normal');
  doc.text('Omega Doors Industries', 11.5, cy);
  cy += 4.2;
  doc.text('+91 9225537971', 11.5, cy);

  drawFooter(doc, 1, totalPages, assets.footerBanner);

  // =========================================================================
  // PAGE 2+: Window Line Items & Specifications
  // =========================================================================
  let globalIndex = 0;
  windowPages.forEach((pageLines, wpIdx) => {
    doc.addPage();
    drawQuoteMetaTable(doc, state, 8, 'helvetica');

    // Sales Line | Details Header
    const headY = 21;
    const leftW = 87.5;
    const rightW = 101.5;
    doc.setDrawColor(110, 110, 110);
    doc.setLineWidth(0.25);
    doc.rect(10.5, headY, leftW, 6.2);
    doc.rect(10.5 + leftW, headY, rightW, 6.2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Sales Line', 12, headY + 4.4);
    doc.text('Details', 10.5 + leftW + 1.5, headY + 4.4);

    let rowY = headY + 6.2;
    const itemH = 74;

    pageLines.forEach(({ item, areaSqFt, lineAmount }) => {
      globalIndex += 1;
      const rx = 10.5 + leftW;

      // Outer boxes for line item
      doc.setDrawColor(110, 110, 110);
      doc.setLineWidth(0.25);
      doc.rect(10.5, rowY, leftW, itemH);
      doc.rect(rx, rowY, rightW, itemH);

      // Left column header: "1. CASEMENT SERIES 47MM" + "Size: 890mm X 890mm"
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`${globalIndex}.`, 12, rowY + 4.5);
      doc.text(item.series, 19.5, rowY + 4.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`Size: ${item.widthMm}mm X ${item.heightMm}mm`, 10.5 + leftW - 2, rowY + 4.5, { align: 'right' });

      // CAD drawing
      drawWindowCadInPdf(doc, item, 12, rowY + 7, leftW - 4, itemH - 16);

      // Left column footer: Area | View From Inside | Wt.
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(`Area : ${areaSqFt.toFixed(2)}Sq.ft.`, 11.8, rowY + itemH - 2.3);
      doc.text('View From Inside', 10.5 + leftW / 2, rowY + itemH - 2.3, { align: 'center' });
      doc.text(`Wt. ${item.weightKg.toFixed(3)} Kg`, 10.5 + leftW - 1.8, rowY + itemH - 2.3, { align: 'right' });

      // Right column: Code | Location
      const halfR = 52;
      doc.rect(rx, rowY, halfR, 6);
      doc.rect(rx + halfR, rowY, rightW - halfR, 6);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.4);
      doc.text(`Code : ${item.code || '-'}`, rx + 1.5, rowY + 4.2);
      doc.text(`Location : ${item.location || '-'}`, rx + halfR + 1.5, rowY + 4.2);

      // Materials | Accessories shaded header
      doc.setFillColor(196, 207, 219);
      doc.rect(rx, rowY + 6, halfR, 5.2, 'FD');
      doc.rect(rx + halfR, rowY + 6, rightW - halfR, 5.2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Materials', rx + 1.5, rowY + 9.7);
      doc.text('Accessories', rx + halfR + 1.5, rowY + 9.7);

      // Spec body borders
      const specH = itemH - 6 - 5.2 - 10; // 52.8mm
      doc.rect(rx, rowY + 11.2, halfR, specH);
      doc.rect(rx + halfR, rowY + 11.2, rightW - halfR, specH);

      // Materials lines
      const isSliding = item.series.includes('SLIDING');
      const matLines = [
        ['Type', inferWindowType(item)],
        ['Profile Color', item.profileColor],
        ['MeshType', item.meshType || 'No'],
        ['Glass', item.glass],
        [isSliding ? 'Track' : 'Outer', item.outerFrame],
        [isSliding ? 'Track RI' : 'Outer RI', item.outerRI],
        [isSliding ? 'Sliding Sash' : 'Casement Sash', item.sash],
        [isSliding ? 'Sliding RI' : 'Casement RI', item.sashRI],
        ...(item.flymeshSash ? [['Flymesh Sash', item.flymeshSash]] : []),
        ...(item.guideRail ? [['Guide Rail', item.guideRail]] : []),
      ];

      let my = rowY + 14.5;
      doc.setFontSize(6.6);
      matLines.forEach(([k, v]) => {
        if (!v || my > rowY + 11.2 + specH - 1.5) return;
        const wrapped = doc.splitTextToSize(`${k} : ${v}`, halfR - 2.6);
        wrapped.forEach((line: string, lIdx: number) => {
          if (my <= rowY + 11.2 + specH - 1) {
            if (lIdx === 0) {
              const colonPos = line.indexOf(' : ');
              if (colonPos > 0) {
                const keyPart = line.slice(0, colonPos + 3);
                const valPart = line.slice(colonPos + 3);
                doc.setFont('helvetica', 'bold');
                doc.text(keyPart, rx + 1.3, my);
                const kw = doc.getTextWidth(keyPart);
                doc.setFont('helvetica', 'normal');
                doc.text(valPart, rx + 1.3 + kw, my);
              } else {
                doc.setFont('helvetica', 'normal');
                doc.text(line, rx + 1.3, my);
              }
            } else {
              doc.setFont('helvetica', 'normal');
              doc.text(line, rx + 1.3, my);
            }
            my += 3.2;
          }
        });
      });

      // Accessories lines
      const accLines = [
        ['Handle Type', item.handleType],
        ['Locking', item.locking],
        ['Handle color', item.handleColor],
        [isSliding ? 'Roller' : 'Friction Stay', item.frictionStayOrRoller],
        ...(item.flymeshHandle ? [['Flymesh Handle', item.flymeshHandle]] : []),
      ];

      let ay = rowY + 14.5;
      const accW = rightW - halfR;
      accLines.forEach(([k, v]) => {
        if (!v || ay > rowY + 11.2 + specH - 1.5) return;
        const wrapped = doc.splitTextToSize(`${k} : ${v}`, accW - 2.6);
        wrapped.forEach((line: string, lIdx: number) => {
          if (ay <= rowY + 11.2 + specH - 1) {
            if (lIdx === 0) {
              const colonPos = line.indexOf(' : ');
              if (colonPos > 0) {
                const keyPart = line.slice(0, colonPos + 3);
                const valPart = line.slice(colonPos + 3);
                doc.setFont('helvetica', 'bold');
                doc.text(keyPart, rx + halfR + 1.3, ay);
                const kw = doc.getTextWidth(keyPart);
                doc.setFont('helvetica', 'normal');
                doc.text(valPart, rx + halfR + 1.3 + kw, ay);
              } else {
                doc.setFont('helvetica', 'normal');
                doc.text(line, rx + halfR + 1.3, ay);
              }
            } else {
              doc.setFont('helvetica', 'normal');
              doc.text(line, rx + halfR + 1.3, ay);
            }
            ay += 3.3;
          }
        });
      });

      // Bottom 4-col pricing strip
      const pY = rowY + itemH - 10;
      const pCols = [16, 27, 29, 29.5]; // sums to 101.5
      const pHeaders = ['Qty', 'Per Sq.ft', 'Rate', 'Amount'];
      const unitRate = item.quantity > 0 ? lineAmount / item.quantity : lineAmount;
      const pVals = [
        String(item.quantity),
        `${item.ratePerSqFt} INR`,
        formatINR(unitRate),
        formatINR(lineAmount),
      ];

      let px = rx;
      for (let i = 0; i < 4; i++) {
        doc.rect(px, pY, pCols[i], 5);
        doc.rect(px, pY + 5, pCols[i], 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.text(pHeaders[i], px + pCols[i] / 2, pY + 3.5, { align: 'center' });
        doc.text(pVals[i], px + pCols[i] / 2, pY + 8.5, { align: 'center' });
        px += pCols[i];
      }

      rowY += itemH;
    });

    drawFooter(doc, 2 + wpIdx, totalPages, assets.footerBanner);
  });

  // =========================================================================
  // PAGE 3: Area & price summary, totals, and customer signature section
  // =========================================================================
  doc.addPage();
  const p3Num = 2 + windowPages.length;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Total:', 10.5, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Total Area : ${totals.totalAreaSqFt.toFixed(3)} Sq.Ft.`, 10.5, 18);
  doc.text(`Total Windows : ${totals.totalWindows} Nos`, 10.5, 22.5);
  doc.text(`Avg. price per Sqft without GST : INR ${formatINR(totals.avgPricePerSqFtWithoutGst)}`, 10.5, 27);

  doc.setFont('helvetica', 'bold');
  doc.text('Payment Terms :', 10.5, 33.5);
  const ptW = doc.getTextWidth('Payment Terms : ');
  doc.setFont('helvetica', 'normal');
  doc.text(state.charges.paymentTerms || '100% Advance', 10.5 + ptW, 33.5);

  // Right financial summary table
  const sumX = 90;
  const sumY = 8.5;
  const sCols = [72, 3, 9, 25.5]; // sums to 109.5 -> ends at 199.5
  const sRowH = 5.6;
  const sRows: Array<{ label: string; value: string; bold?: boolean }> = [
    { label: 'Basic Value', value: formatINR(totals.basicValue) },
    {
      label: 'Discount',
      value: totals.discountAmount > 0 ? `-${formatINR(totals.discountAmount)}` : '0.00',
    },
    { label: 'Sub Total', value: formatINR(totals.subTotal), bold: true },
    { label: 'Transportation Cost', value: formatINR(totals.transportationCost) },
    { label: 'Total Project Cost', value: formatINR(totals.totalProjectCost), bold: true },
    { label: `Gst @${state.charges.gstPercent}%`, value: formatINR(totals.gstAmount) },
    { label: 'Grand Total', value: formatINR(totals.grandTotal), bold: true },
  ];

  doc.setDrawColor(110, 110, 110);
  doc.setLineWidth(0.25);

  sRows.forEach((r, idx) => {
    const ry = sumY + idx * sRowH;
    let cx = sumX;
    sCols.forEach((cw) => {
      doc.rect(cx, ry, cw, sRowH);
      cx += cw;
    });

    doc.setFont('helvetica', r.bold ? 'bold' : 'normal');
    doc.setFontSize(8.2);
    doc.text(r.label, sumX + 1.5, ry + 4);
    doc.text(':', sumX + sCols[0] + sCols[1] / 2, ry + 4, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text('INR', sumX + sCols[0] + sCols[1] + 1, ry + 4);
    doc.setFont('helvetica', r.bold ? 'bold' : 'normal');
    doc.text(r.value, sumX + sCols[0] + sCols[1] + sCols[2] + sCols[3] - 1.5, ry + 4, { align: 'right' });
  });

  // Note
  const noteY = sumY + sRows.length * sRowH + 5.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('\u2022   Any Change in taxes will be borne by customer', 95.5, noteY);

  // Signature lines
  const sigY = noteY + 12.5;
  doc.setDrawColor(90, 90, 90);
  doc.setLineWidth(0.25);
  doc.line(90, sigY, 148, sigY);
  doc.line(154, sigY, 199.5, sigY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.text('Signed by Client', 90, sigY + 4);
  doc.text('Date', 154, sigY + 4);

  const signerName = state.client.useSeparateDelivery
    ? state.client.deliveryName || state.client.clientName
    : state.client.clientName;
  const signerEmail = state.client.useSeparateDelivery
    ? state.client.deliveryEmail
    : state.client.email;
  const signerPhone = state.client.useSeparateDelivery
    ? state.client.deliveryMobile || state.client.mobile
    : state.client.mobile;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.text(signerName || '-', 90, sigY + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Email : ${signerEmail || ''}`, 90, sigY + 15);
  doc.text(`Contact No. : ${signerPhone || '-'}`, 90, sigY + 20);

  drawFooter(doc, p3Num, totalPages, assets.footerBanner);

  // =========================================================================
  // PAGE 4: Apollo Offerings & Profile Color's
  // =========================================================================
  doc.addPage();
  const p4Num = p3Num + 1;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Apollo Offerings', 105, 14.5, { align: 'center' });

  if (assets.offeringTop) {
    doc.addImage(assets.offeringTop, 'PNG', 66, 17, 78, 45.7);
  }
  if (assets.offeringLeft) {
    doc.addImage(assets.offeringLeft, 'PNG', 16.5, 68, 70, 58.3);
  }
  if (assets.offeringRight) {
    doc.addImage(assets.offeringRight, 'PNG', 122.5, 68, 69, 58.1);
  }
  if (assets.offeringBottom) {
    doc.addImage(assets.offeringBottom, 'PNG', 57, 130, 96, 56);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.text('Profile Color’s', 105, 195, { align: 'center' });

  if (assets.profileColors) {
    doc.addImage(assets.profileColors, 'PNG', 13, 202, 184, 31.3);
  }

  drawFooter(doc, p4Num, totalPages, assets.footerBanner);

  // =========================================================================
  // PAGE 5: Terms and Conditions, Pre-Requisites & Acceptance
  // =========================================================================
  doc.addPage();
  const p5Num = p4Num + 1;
  let y = 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Terms and Conditions:-', 10.5, y);
  doc.line(10.5, y + 0.6, 44, y + 0.6);
  y += 5.5;

  const tcIntro = [
    { num: '1.', text: 'Payments terms: -', indent: 23 },
    { num: 'a.', text: '100% Advance along with order, if it is less than INR 100000.', indent: 37 },
    { num: 'b.', text: '50% advance along with order, 50% before delivery, if it is more than INR 100000.', indent: 37 },
    { num: '2.', text: 'Validation of quote 30 days, total execution of project should be completed latest by 3-months.', indent: 23 },
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  tcIntro.forEach((item) => {
    doc.text(item.num, item.indent, y);
    doc.text(item.text, item.indent + 4.5, y);
    y += 5;
  });

  // Item 3 with bold Omega Doors Industries
  doc.text('3.', 23, y);
  const t3Pre = 'P.O & Payments should made in the name of ';
  doc.text(t3Pre, 27.5, y);
  const preW = doc.getTextWidth(t3Pre);
  doc.setFont('helvetica', 'bold');
  doc.text('Omega Doors Industries.', 27.5 + preW, y);
  doc.setFont('helvetica', 'normal');
  y += 12;

  const tcRest = [
    {
      num: '4.',
      text: 'The prices are based on the sizes provided by the customer. The prices are valid for variation in sizes up to +/- 30mm per window provided the design and style of product remains unchanged. The customer will be charged on pro-rate basis for difference between the actual sizes and given sizes, if any, beyond the above variation.',
    },
    { num: '5.', text: 'After handovering the windows, cleaning not our scope.' },
    {
      num: '6.',
      text: 'Windows security tape should be remove while installing windows freely, After installation security tape will be removed by us that should be chargeable per window INR 100.',
    },
    {
      num: '7.',
      text: 'If any other commitments given by our sales team, before placing order please call us . Cell : +91 9225537971',
    },
    {
      num: '8.',
      text: 'After handovering windows, If any service require related to windows & doors , that should be chargeable. Per visit - INR 350.',
    },
    { num: '9.', text: 'Material unloading & storage should be your scope.' },
    { num: '10.', text: 'All disputes shall be subject  jurisdiction only.' },
  ];

  tcRest.forEach((item) => {
    doc.text(item.num, 23, y);
    const lines = doc.splitTextToSize(item.text, 169);
    doc.text(lines, 27.5, y);
    y += lines.length * 4 + 1.5;
  });

  y += 1.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Pre-Requisites for installation of Windows:-', 10.5, y);
  doc.line(10.5, y + 0.6, 75, y + 0.6);
  y += 5.5;

  const preReqs = [
    { num: '1.', text: 'Walls should be plastered from inside and outside, with inside POP complete.', indent: 23 },
    { num: '2.', text: 'All jams, sills and soffits should be plastered.', indent: 23 },
    { num: '3.', text: 'Flooring (where doors have to be installed) should be complete.', indent: 23 },
    { num: '4.', text: 'Aperture should be smooth.', indent: 23 },
    { num: '5.', text: 'Base and top of window should be water leveled and sides should be in vertical plump.', indent: 23 },
    { num: '6.', text: 'Sill width should be more than the window width.', indent: 23 },
    { num: '7.', text: 'Opening should be accessible from inside for installation.', indent: 23 },
    { num: '8.', text: 'Grills: Adequate care should be taken if grills have to be installed.', indent: 23 },
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  preReqs.forEach((item) => {
    doc.text(item.num, item.indent, y);
    doc.text(item.text, item.indent + 4.5, y);
    y += 5.1;
  });

  // 8a & 8b with bold prefix
  doc.text('a.', 27.5, y);
  doc.setFont('helvetica', 'bold');
  const p8a = 'For Horizontal slider Window: ';
  doc.text(p8a, 34.5, y);
  const w8a = doc.getTextWidth(p8a);
  doc.setFont('helvetica', 'normal');
  doc.text('Grill should be provided on the outer face of slider before the installation of the window.', 34.5 + w8a, y);
  y += 5.1;

  doc.text('b.', 27.5, y);
  doc.setFont('helvetica', 'bold');
  const p8b = 'For Casement windows: ';
  doc.text(p8b, 34.5, y);
  const w8b = doc.getTextWidth(p8b);
  doc.setFont('helvetica', 'normal');
  doc.text('Screw type grill is recommended after installation of casement window.', 34.5 + w8b, y);
  y += 5.4;

  // 9 & 10
  doc.text('9.', 23, y);
  doc.text('Installation should happen before the last coat of paint. At least one coat of paint should be done before installation begins.', 27.5, y);
  y += 5.1;

  doc.text('10.', 23, y);
  const p10Lines = doc.splitTextToSize(
    'Scaffoldings/ bracing should not interrupt the window openings where openings where windows are supposed to be installed.',
    169
  );
  doc.text(p10Lines, 28, y);
  y += p10Lines.length * 4 + 4;

  // Acceptance line
  const acceptLines = doc.splitTextToSize(
    'I hereby accept the estimate as per above mentioned price and specifications. I have read and understood the terms & conditions and agree to them.',
    189
  );
  doc.text(acceptLines, 10.5, y);
  y += 18;

  doc.text('Authorized Signatory', 10.5, y);
  doc.text('Signature of Customer', 179.5, y, { align: 'right' });

  drawFooter(doc, p5Num, totalPages, assets.footerBanner);

  const safeClient = (signerName || 'Client').replace(/[^a-zA-Z0-9._-]+/g, '_');
  const safeQuote = (state.meta.quoteNo || 'Quotation').replace(/[^a-zA-Z0-9._-]+/g, '-');
  const fileName = `${safeClient}-${safeQuote}-Quotation_Report.pdf`;
  const blob = doc.output('blob');
  const dataUrl = doc.output('datauristring');

  return { blob, fileName, dataUrl, totalPages };
}

import {
  CalculatedWindowLine,
  PricingCharges,
  ProfileColorOption,
  QuotationState,
  QuotationTotals,
  UpvcWindowType,
  WindowItem,
  WindowSeriesType,
} from '../types/quotation';
import { allocateNextQuoteNumber } from './storage';

export const SQ_MM_PER_SQ_FT = 92903.04;

export const SERIES_OPTIONS: WindowSeriesType[] = [
  'CASEMENT SERIES 47MM',
  'SLIDING SERIES 50MM',
  'SLIDING SERIES 60MM',
  'FIXED SERIES 47MM',
  'VENTILATOR SERIES 47MM',
];

export const UPVC_WINDOW_TYPE_OPTIONS: UpvcWindowType[] = [
  '2-Track Sliding Window (2 Panel)',
  '3-Track Sliding Window (2 Glass + 1 Mesh)',
  '3-Track Sliding Window (3 Panel)',
  '4-Panel Sliding Window',
  'Casement Window (Single Shutter)',
  'Casement Window (Double Shutter)',
  'Villa Window (Twin Sash + Grill & Mesh)',
  'Tilt & Turn Window',
  'Sliding Balcony Door',
  'Casement Door',
  'Lift & Slide Door (Panoramic)',
  'Bi-Fold Door (Multi-Panel)',
  'Fixed Glass Window',
  'Ventilator (Top-Hung / Exhaust)',
  'Combination (Fixed + Openable)',
];

export const PROJECT_TYPE_OPTIONS = [
  'All UPVC Windows & Doors',
  'Sliding Windows (2-Track / 3-Track)',
  'Casement & Villa Windows',
  'UPVC Doors (Sliding, Casement, Bi-Fold, Lift & Slide)',
  'Fixed & Ventilators',
  'Tilt & Turn / High-Rise Windows',
  'Residential Apartment / Bungalow',
  'Commercial / Office / Hotel Project',
] as const;

export const PROFILE_COLOR_OPTIONS: ProfileColorOption[] = [
  'WHITE',
  'Nutmeg Oak Super Matt',
  'Honey Oak Super Matt',
  'Black Smooth 2',
  'Walnut V',
  'Anthracite Grey 7016 Smooth 2',
  'Coriander Oak Super Matt',
];

export const GLASS_OPTIONS = [
  '(1) 5mm Clear Toughened',
  '(1,2) 5mm Clear Toughened',
  '(1) 5mm Frosted Toughened',
  '(1,2) 5mm Frosted Toughened',
  '(1) 6mm Clear Toughened',
  '(1,2) 6mm Clear Toughened',
  '(1) 22mm Clear DGU (5+12+5)',
  '(1,2) 22mm Clear DGU (5+12+5)',
];

export const MESH_OPTIONS = [
  'No',
  '(3) SS FLYMESH',
  'Pleated Flymesh',
  'SS 304 Security Mesh',
];

export const CREATED_BY_OPTIONS = [
  'Nihal Sayyed',
  'Yogesh Joshi',
  'Nasiruddin Shaikh',
  'Susheel Pandey',
  'Sales',
] as const;

export function formatDateDDMMYYYY(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function createDefaultMeta() {
  const now = new Date();
  const valid = new Date(now);
  valid.setDate(valid.getDate() + 30);
  return {
    quoteNo: allocateNextQuoteNumber(),
    quoteDate: formatDateDDMMYYYY(now),
    modifiedOn: formatDateDDMMYYYY(now),
    validUpto: formatDateDDMMYYYY(valid),
    responsible: 'Omega Doors Industries',
    createdBy: '',
    projectType: 'All UPVC Windows & Doors',
  };
}

export function inferWindowType(win: Pick<WindowItem, 'windowType' | 'series' | 'meshType'>): UpvcWindowType {
  if (win.windowType) return win.windowType;
  if (win.series === 'CASEMENT SERIES 47MM') return 'Casement Window (Single Shutter)';
  if (win.series === 'FIXED SERIES 47MM') return 'Fixed Glass Window';
  if (win.series === 'VENTILATOR SERIES 47MM') return 'Ventilator (Top-Hung / Exhaust)';
  if (win.series === 'SLIDING SERIES 60MM') return '3-Track Sliding Window (2 Glass + 1 Mesh)';
  if (win.meshType && win.meshType.toLowerCase() !== 'no') {
    return '3-Track Sliding Window (2 Glass + 1 Mesh)';
  }
  return '2-Track Sliding Window (2 Panel)';
}

export function getDefaultWindowTypeForProject(projectType?: string): UpvcWindowType {
  if (!projectType) return '2-Track Sliding Window (2 Panel)';
  if (projectType.includes('Casement & Villa')) return 'Villa Window (Twin Sash + Grill & Mesh)';
  if (projectType.includes('Casement')) return 'Casement Window (Single Shutter)';
  if (projectType.includes('UPVC Doors')) return 'Sliding Balcony Door';
  if (projectType.includes('Fixed & Ventilators')) return 'Fixed Glass Window';
  if (projectType.includes('Tilt & Turn')) return 'Tilt & Turn Window';
  return '2-Track Sliding Window (2 Panel)';
}

export function getWindowTypePreset(windowType: UpvcWindowType): Omit<
  WindowItem,
  'id' | 'code' | 'location' | 'widthMm' | 'heightMm' | 'quantity' | 'ratePerSqFt' | 'weightKg' | 'profileColor'
> {
  switch (windowType) {
    case '2-Track Sliding Window (2 Panel)':
      return {
        ...getSeriesPreset('SLIDING SERIES 50MM'),
        windowType,
        meshType: 'No',
        outerFrame: 'SLD 2T FRAME 60MM X 45MM',
        flymeshSash: '',
        flymeshHandle: '',
        locking: 'Single-point',
      };
    case '3-Track Sliding Window (2 Glass + 1 Mesh)':
      return {
        ...getSeriesPreset('SLIDING SERIES 50MM'),
        windowType,
        meshType: '(3) SS FLYMESH',
      };
    case '3-Track Sliding Window (3 Panel)':
      return {
        ...getSeriesPreset('SLIDING SERIES 60MM'),
        windowType,
        meshType: 'No',
        flymeshSash: '',
        flymeshHandle: '',
      };
    case '4-Panel Sliding Window':
      return {
        ...getSeriesPreset('SLIDING SERIES 60MM'),
        windowType,
        meshType: 'No',
        outerFrame: 'SLD 2T/4P FRAME 112MM X 48MM',
        flymeshSash: '',
        flymeshHandle: '',
      };
    case 'Sliding Balcony Door':
      return {
        ...getSeriesPreset('SLIDING SERIES 60MM'),
        windowType,
        meshType: '(3) SS FLYMESH',
        glass: '(1,2) 6mm Clear Toughened',
        handleType: 'D-Handle Heavy Duty Lockable',
        frictionStayOrRoller: 'Roller Heavy Duty 80Kg',
      };
    case 'Casement Window (Single Shutter)':
      return {
        ...getSeriesPreset('CASEMENT SERIES 47MM'),
        windowType,
      };
    case 'Casement Window (Double Shutter)':
      return {
        ...getSeriesPreset('CASEMENT SERIES 47MM'),
        windowType,
        handleType: '(S1,S2)-L HANDLE30',
        frictionStayOrRoller: '(S1,S2)-Friction Stay Ss304 17Mmx18',
      };
    case 'Casement Door':
      return {
        ...getSeriesPreset('CASEMENT SERIES 47MM'),
        windowType,
        glass: '(1) 6mm Clear Toughened',
        outerFrame: 'CMT DOOR OUTER FRAME 60MM X 58MM',
        sash: 'CMT DOOR SASH 60MM X 104MM',
        handleType: '3D Hinge + Multi-point Door Handle Set',
        frictionStayOrRoller: '3D Heavy Duty Door Hinges (3 Nos)',
      };
    case 'Villa Window (Twin Sash + Grill & Mesh)':
      return {
        ...getSeriesPreset('CASEMENT SERIES 47MM'),
        windowType,
        meshType: '(3) SS FLYMESH',
        outerFrame: 'VILLA TWIN-SASH FRAME + INTEGRATED GRILL',
        flymeshSash: 'TWIN INWARD FLYMESH SASH',
        handleType: '(S1,S2)-L HANDLE30 + Twin Mesh Latch',
        locking: 'Multi-point + Security Grill',
      };
    case 'Fixed Glass Window':
      return {
        ...getSeriesPreset('FIXED SERIES 47MM'),
        windowType,
      };
    case 'Ventilator (Top-Hung / Exhaust)':
      return {
        ...getSeriesPreset('VENTILATOR SERIES 47MM'),
        windowType,
      };
    case 'Tilt & Turn Window':
      return {
        ...getSeriesPreset('CASEMENT SERIES 47MM'),
        windowType,
        glass: '(1) 22mm Clear DGU (5+12+5)',
        handleType: 'Tilt & Turn Euro Groove Handle',
        locking: 'Tilt & Turn Multi-point Gear',
        frictionStayOrRoller: 'Tilt & Turn Scissor Stay Mechanism',
      };
    case 'Lift & Slide Door (Panoramic)':
      return {
        ...getSeriesPreset('SLIDING SERIES 60MM'),
        windowType,
        meshType: 'No',
        glass: '(1,2) 22mm Clear DGU (5+12+5)',
        outerFrame: 'LIFT & SLIDE HEAVY TRACK FRAME 150MM',
        sash: 'LIFT & SLIDE PANORAMIC SASH (UP TO 400KG)',
        flymeshSash: '',
        flymeshHandle: '',
        handleType: 'Heavy-Duty Lift & Slide Lever Handle',
        locking: 'Drop-Seal Multi-Point Lock',
        frictionStayOrRoller: 'Precision Lift & Slide Carriage (Up to 400Kg)',
      };
    case 'Bi-Fold Door (Multi-Panel)':
      return {
        ...getSeriesPreset('CASEMENT SERIES 47MM'),
        windowType,
        glass: '(1) 6mm Clear Toughened',
        outerFrame: 'BI-FOLD HEAVY OUTER & TRACK FRAME',
        sash: 'BI-FOLD DOOR SASH 60MM X 104MM',
        handleType: 'Bi-Fold Intermediate + Traffic Handle Set',
        locking: 'Multi-Point Shootbolt Locking',
        frictionStayOrRoller: 'Heavy-Duty Bottom-Running Hinges & Bogie Rollers',
      };
    case 'Combination (Fixed + Openable)':
      return {
        ...getSeriesPreset('CASEMENT SERIES 47MM'),
        windowType,
        outerFrame: 'CMT OUTER + MULLION FRAME 47MM',
        handleType: '(S1)-L HANDLE30 + Fixed Mullion',
      };
  }
}

export function getSeriesPreset(series: WindowSeriesType): Omit<
  WindowItem,
  'id' | 'code' | 'location' | 'widthMm' | 'heightMm' | 'quantity' | 'ratePerSqFt' | 'weightKg' | 'profileColor'
> {
  if (series === 'CASEMENT SERIES 47MM') {
    return {
      series,
      meshType: 'No',
      glass: '(1) 5mm Clear Toughened',
      outerFrame: 'CMT OUTER FRAME 47MM X 54MM',
      outerRI: '21MM X 17.8MM X 21MM',
      sash: 'CMT OUTWARD SASH 47MM X 78MM',
      sashRI: '25.9MM X 34.1MM X 25.4MM X 10MM',
      flymeshSash: '',
      guideRail: '',
      handleType: '(S1)-L HANDLE30',
      locking: 'Multi-point',
      handleColor: 'WHITE',
      frictionStayOrRoller: '(S1)-Friction Stay Ss304 17Mmx18',
      flymeshHandle: '',
    };
  }

  if (series === 'SLIDING SERIES 60MM') {
    return {
      series,
      meshType: '(3) SS FLYMESH',
      glass: '(1,2) 5mm Clear Toughened',
      outerFrame: 'SLD 3T FRAME 112MM X 48MM',
      outerRI: '14MM X 28MM X 14MM',
      sash: 'SLD SASH 42MM X 72MM',
      sashRI: '10MM X 16MM X 18MM',
      flymeshSash: 'SLD SASH 42MM X 72MM',
      guideRail: 'AL TRACK OUTER FRAME (AL00SS0RLTRKF)',
      handleType: '(S1)-TCH LOCK HAND L05, (S2)-TCH LOCK HAND R05',
      locking: 'Multi-point',
      handleColor: 'WHITE',
      frictionStayOrRoller: 'Roller Heavy Duty 40Kg',
      flymeshHandle: 'Ms3-Mesh Tch Lock 09 Rs Al Body Al Lever',
    };
  }

  if (series === 'FIXED SERIES 47MM') {
    return {
      series,
      meshType: 'No',
      glass: '(1) 5mm Clear Toughened',
      outerFrame: 'CMT OUTER FRAME 47MM X 54MM',
      outerRI: '21MM X 17.8MM X 21MM',
      sash: 'FIXED GLAZING BEAD 20MM',
      sashRI: 'N/A',
      flymeshSash: '',
      guideRail: '',
      handleType: 'None',
      locking: 'Fixed',
      handleColor: 'WHITE',
      frictionStayOrRoller: 'None',
      flymeshHandle: '',
    };
  }

  if (series === 'VENTILATOR SERIES 47MM') {
    return {
      series,
      meshType: 'No',
      glass: '(1) 5mm Frosted Toughened',
      outerFrame: 'CMT OUTER FRAME 47MM X 54MM',
      outerRI: '21MM X 17.8MM X 21MM',
      sash: 'CMT OUTWARD SASH 47MM X 78MM',
      sashRI: '25.9MM X 34.1MM X 25.4MM X 10MM',
      flymeshSash: '',
      guideRail: '',
      handleType: '(S1)-COCKSPUR HANDLE',
      locking: 'Single-point',
      handleColor: 'WHITE',
      frictionStayOrRoller: '(S1)-Friction Stay Ss304 10Inch',
      flymeshHandle: '',
    };
  }

  // Default: SLIDING SERIES 50MM
  return {
    series: 'SLIDING SERIES 50MM',
    meshType: '(3) SS FLYMESH',
    glass: '(1,2) 5mm Clear Toughened',
    outerFrame: 'SLD 3T FRAME 98MM X 45MM',
    outerRI: '11.3MM X 26.98MM X 11.3MM',
    sash: 'SLD SASH 37MM X 64MM',
    sashRI: '8.94MM X 13.94MM X 17MM',
    flymeshSash: 'SLD SASH 37MM X 64MM',
    guideRail: 'AL TRACK OUTER FRAME (AL00SS0RLTRKF)',
    handleType: '(S1)-TCH LOCK HAND L05, (S2)-TCH LOCK HAND R05',
    locking: 'Single-point',
    handleColor: 'WHITE',
    frictionStayOrRoller: 'Roller Nylon 25Kg',
    flymeshHandle: 'Ms3-Mesh Tch Lock 09 Rs Al Body Al Lever',
  };
}

export function estimateWeightKg(widthMm: number, heightMm: number, qty: number, series: WindowSeriesType): number {
  const area = calcAreaSqFt(widthMm, heightMm, qty);
  const factor = series.includes('SLIDING') ? 2.45 : 2.1;
  return Number((area * factor).toFixed(3));
}

export function calcAreaSqFt(widthMm: number, heightMm: number, quantity: number): number {
  const w = Number.isFinite(widthMm) && widthMm > 0 ? widthMm : 0;
  const h = Number.isFinite(heightMm) && heightMm > 0 ? heightMm : 0;
  const q = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
  return (w * h * q) / SQ_MM_PER_SQ_FT;
}

export function calcQuotationTotals(windows: WindowItem[], charges: PricingCharges): QuotationTotals {
  const lines: CalculatedWindowLine[] = windows.map((item) => {
    const areaSqFt = calcAreaSqFt(item.widthMm, item.heightMm, item.quantity);
    const rate = Number.isFinite(item.ratePerSqFt) && item.ratePerSqFt >= 0 ? item.ratePerSqFt : 0;
    const lineAmount = Number((areaSqFt * rate).toFixed(2));
    return { item, areaSqFt, lineAmount };
  });

  const totalAreaSqFt = lines.reduce((acc, l) => acc + l.areaSqFt, 0);
  const totalWindows = windows.reduce((acc, w) => acc + (w.quantity > 0 ? w.quantity : 0), 0);
  const basicValue = Number(lines.reduce((acc, l) => acc + l.lineAmount, 0).toFixed(2));

  const rawDiscount =
    charges.discountMode === 'percent'
      ? (basicValue * Math.max(0, charges.discountValue || 0)) / 100
      : Math.max(0, charges.discountValue || 0);
  const discountAmount = Number(Math.min(basicValue, rawDiscount).toFixed(2));

  const subTotal = Number((basicValue - discountAmount).toFixed(2));
  const transportationCost = Number(Math.max(0, charges.transportationCost || 0).toFixed(2));
  const totalProjectCost = Number((subTotal + transportationCost).toFixed(2));
  const gstPct = Math.max(0, charges.gstPercent ?? 18);
  const gstAmount = Number(((totalProjectCost * gstPct) / 100).toFixed(2));
  const grandTotal = Number((totalProjectCost + gstAmount).toFixed(2));
  const avgPricePerSqFtWithoutGst = totalAreaSqFt > 0 ? Number((totalProjectCost / totalAreaSqFt).toFixed(2)) : 0;

  return {
    lines,
    totalAreaSqFt,
    totalWindows,
    basicValue,
    discountAmount,
    subTotal,
    transportationCost,
    totalProjectCost,
    gstAmount,
    grandTotal,
    avgPricePerSqFtWithoutGst,
  };
}

export function formatINR(value: number): string {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function createEmptyWindow(
  index = 1,
  windowType: UpvcWindowType = '2-Track Sliding Window (2 Panel)'
): WindowItem {
  const preset = getWindowTypePreset(windowType);
  const isWideDoor = windowType === 'Lift & Slide Door (Panoramic)' || windowType === 'Bi-Fold Door (Multi-Panel)';
  const isDoor = windowType.includes('Door');
  const isVentilator = windowType.includes('Ventilator');
  const isVilla = windowType.includes('Villa');
  const defaultW = isVentilator ? 600 : isWideDoor ? 2400 : isDoor ? 1800 : isVilla ? 1200 : 1200;
  const defaultH = isVentilator ? 600 : isWideDoor ? 2400 : isDoor ? 2100 : isVilla ? 1500 : 1200;
  return {
    id: `win-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...preset,
    code: `Window ${index}`,
    location: `Room ${index}`,
    widthMm: defaultW,
    heightMm: defaultH,
    quantity: 1,
    ratePerSqFt: 0,
    weightKg: estimateWeightKg(defaultW, defaultH, 1, preset.series),
    profileColor: 'WHITE',
  };
}

export function createEmptyQuotation(): QuotationState {
  return {
    product: 'UPVC Window',
    meta: createDefaultMeta(),
    client: {
      clientName: '',
      mobile: '',
      email: '',
      siteAddress: '',
      useSeparateDelivery: false,
      deliveryName: '',
      deliveryMobile: '',
      deliveryEmail: '',
      deliveryAddress: '',
    },
    windows: [createEmptyWindow(1)],
    charges: {
      discountMode: 'percent',
      discountValue: 0,
      transportationCost: 1000,
      gstPercent: 18,
      paymentTerms: '100% Advance',
    },
  };
}

export function createSampleQuotation(): QuotationState {
  const now = new Date();
  const valid = new Date(now);
  valid.setDate(valid.getDate() + 30);
  return {
    product: 'UPVC Window',
    meta: {
      quoteNo: allocateNextQuoteNumber(),
      quoteDate: formatDateDDMMYYYY(now),
      modifiedOn: formatDateDDMMYYYY(now),
      validUpto: formatDateDDMMYYYY(valid),
      responsible: 'Omega Doors Industries',
      createdBy: 'Nihal Sayyed',
      projectType: 'All UPVC Windows & Doors',
    },
    client: {
      clientName: 'kkashthakala',
      mobile: '+91 7507049540',
      email: 'infokkashatakala@gmail.com',
      siteAddress: 'Pune Maharashtra',
      useSeparateDelivery: true,
      deliveryName: 'Mr Nitin Rathore',
      deliveryMobile: '+91 9390416634',
      deliveryEmail: '',
      deliveryAddress: 'Pune Maharashtra',
    },
    windows: [
      {
        id: 'sample-1',
        windowType: 'Casement Window (Single Shutter)',
        ...getSeriesPreset('CASEMENT SERIES 47MM'),
        code: 'KITCHEN WINDOW',
        location: 'KITCHEN',
        widthMm: 890,
        heightMm: 890,
        quantity: 1,
        ratePerSqFt: 822.5,
        weightKg: 17.834,
        profileColor: 'WHITE',
      },
      {
        id: 'sample-2',
        windowType: '3-Track Sliding Window (2 Glass + 1 Mesh)',
        ...getSeriesPreset('SLIDING SERIES 50MM'),
        code: 'Bedroom1 window',
        location: 'Bedroom1',
        widthMm: 1770,
        heightMm: 1420,
        quantity: 1,
        ratePerSqFt: 720.89,
        weightKg: 64.136,
        profileColor: 'WHITE',
      },
      {
        id: 'sample-3',
        windowType: '3-Track Sliding Window (2 Glass + 1 Mesh)',
        ...getSeriesPreset('SLIDING SERIES 50MM'),
        code: 'Bedroom2 window',
        location: 'Bedroom2',
        widthMm: 1310,
        heightMm: 930,
        quantity: 1,
        ratePerSqFt: 931.07,
        weightKg: 36.791,
        profileColor: 'WHITE',
      },
    ],
    charges: {
      discountMode: 'percent',
      discountValue: 15,
      transportationCost: 1000,
      gstPercent: 18,
      paymentTerms: '100% Advance',
    },
  };
}

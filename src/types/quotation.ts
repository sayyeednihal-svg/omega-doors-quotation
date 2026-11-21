export type WindowSeriesType =
  | 'CASEMENT SERIES 47MM'
  | 'SLIDING SERIES 50MM'
  | 'SLIDING SERIES 60MM'
  | 'FIXED SERIES 47MM'
  | 'VENTILATOR SERIES 47MM';

export type UpvcWindowType =
  | '2-Track Sliding Window (2 Panel)'
  | '3-Track Sliding Window (2 Glass + 1 Mesh)'
  | '3-Track Sliding Window (3 Panel)'
  | '4-Panel Sliding Window'
  | 'Casement Window (Single Shutter)'
  | 'Casement Window (Double Shutter)'
  | 'Villa Window (Twin Sash + Grill & Mesh)'
  | 'Tilt & Turn Window'
  | 'Sliding Balcony Door'
  | 'Casement Door'
  | 'Lift & Slide Door (Panoramic)'
  | 'Bi-Fold Door (Multi-Panel)'
  | 'Fixed Glass Window'
  | 'Ventilator (Top-Hung / Exhaust)'
  | 'Combination (Fixed + Openable)';

export type ProfileColorOption =
  | 'WHITE'
  | 'Nutmeg Oak Super Matt'
  | 'Honey Oak Super Matt'
  | 'Black Smooth 2'
  | 'Walnut V'
  | 'Anthracite Grey 7016 Smooth 2'
  | 'Coriander Oak Super Matt';

export interface ClientInfo {
  clientName: string;
  mobile: string;
  email: string;
  siteAddress: string;
  useSeparateDelivery: boolean;
  deliveryName: string;
  deliveryMobile: string;
  deliveryEmail: string;
  deliveryAddress: string;
}

export interface QuotationMeta {
  quoteNo: string;
  quoteDate: string; // DD-MM-YYYY
  modifiedOn: string; // DD-MM-YYYY
  validUpto: string; // DD-MM-YYYY
  responsible: string;
  createdBy?: string;
  projectType?: string;
}

export interface WindowItem {
  id: string;
  windowType?: UpvcWindowType;
  series: WindowSeriesType;
  code: string;
  location: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
  ratePerSqFt: number;
  weightKg: number;
  // Materials
  profileColor: ProfileColorOption;
  meshType: string;
  glass: string;
  outerFrame: string;
  outerRI: string;
  sash: string;
  sashRI: string;
  flymeshSash: string;
  guideRail: string;
  // Accessories
  handleType: string;
  locking: string;
  handleColor: string;
  frictionStayOrRoller: string;
  flymeshHandle: string;
}

export interface PricingCharges {
  discountMode: 'percent' | 'amount';
  discountValue: number; // % or flat INR
  transportationCost: number;
  gstPercent: number;
  paymentTerms: string;
}

export interface CalculatedWindowLine {
  item: WindowItem;
  areaSqFt: number;
  lineAmount: number;
}

export interface QuotationTotals {
  lines: CalculatedWindowLine[];
  totalAreaSqFt: number;
  totalWindows: number;
  basicValue: number;
  discountAmount: number;
  subTotal: number;
  transportationCost: number;
  totalProjectCost: number;
  gstAmount: number;
  grandTotal: number;
  avgPricePerSqFtWithoutGst: number;
}

export interface QuotationState {
  product: 'UPVC Window';
  meta: QuotationMeta;
  client: ClientInfo;
  windows: WindowItem[];
  charges: PricingCharges;
}

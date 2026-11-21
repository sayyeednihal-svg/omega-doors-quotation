import { UpvcWindowType, WindowSeriesType } from '../types/quotation';

export interface SizePreset {
  label: string;
  widthMm: number;
  heightMm: number;
}

export interface ApolloCatalogEntry {
  windowType: UpvcWindowType;
  category: 'Window' | 'Door';
  brochureTitle: string;
  series: WindowSeriesType;
  profileDepth: string;
  recommendedMinMm: string;
  recommendedMaxMm: string;
  glassRange: string;
  signatureAdvantages: string;
  idealSettings: string;
  features: string[];
  standardSizes: SizePreset[];
}

export const APOLLO_COLORS_INFO = [
  { name: 'WHITE', swatch: '#FFFFFF', border: '#CBD5E1', note: 'UV-stable pure architectural white' },
  { name: 'Nutmeg Oak Super Matt', swatch: '#5C432E', border: '#4A3422', note: 'Deep natural dark oak wood lamination' },
  { name: 'Honey Oak Super Matt', swatch: '#7D4E29', border: '#653D1F', note: 'Warm honey woodgrain super-matt finish' },
  { name: 'Black Smooth 2', swatch: '#1E2022', border: '#0F172A', note: 'Modern sleek black architectural laminate' },
  { name: 'Walnut V', swatch: '#4B2F1D', border: '#3A2315', note: 'Classic rich walnut timber finish' },
  { name: 'Anthracite Grey 7016 Smooth 2', swatch: '#3B454E', border: '#273038', note: 'Contemporary RAL 7016 grey finish' },
  { name: 'Coriander Oak Super Matt', swatch: '#AE9061', border: '#8F7349', note: 'Light natural oak super-matt lamination' },
] as const;

export const APOLLO_WINDOW_DOOR_CATALOG: ApolloCatalogEntry[] = [
  {
    windowType: '2-Track Sliding Window (2 Panel)',
    category: 'Window',
    brochureTitle: 'Sliding Windows (2-Track)',
    series: 'SLIDING SERIES 50MM',
    profileDepth: 'Frame 60×45 mm | Sash 37×64 mm',
    recommendedMinMm: '600 × 600 mm (2 × 2 ft)',
    recommendedMaxMm: '2400 × 1800 mm (8 × 6 ft)',
    glassRange: '5mm / 6mm Single Toughened or 22mm DGU',
    signatureAdvantages:
      'Steel-reinforced profiles and SS precision rollers create wide glass expanses without encroaching on interior space.',
    idealSettings: 'Balconies, high-rise apartments, bedrooms, and compact areas needing ample daylight',
    features: [
      'Stainless-steel rollers on dust-free tracks',
      'Anti-lift center seal for high weather tightness',
      'Reinforced GI steel profiles as per structural wind-load',
    ],
    standardSizes: [
      { label: '3 × 4 ft (900 × 1200 mm)', widthMm: 900, heightMm: 1200 },
      { label: '4 × 4 ft (1200 × 1200 mm)', widthMm: 1200, heightMm: 1200 },
      { label: '5 × 4 ft (1500 × 1200 mm)', widthMm: 1500, heightMm: 1200 },
      { label: '6 × 4 ft (1800 × 1200 mm)', widthMm: 1800, heightMm: 1200 },
      { label: '6 × 5 ft (1800 × 1500 mm)', widthMm: 1800, heightMm: 1500 },
    ],
  },
  {
    windowType: '3-Track Sliding Window (2 Glass + 1 Mesh)',
    category: 'Window',
    brochureTitle: 'Sliding Windows (3-Track w/ Flymesh)',
    series: 'SLIDING SERIES 50MM',
    profileDepth: '3T Frame 98×45 mm | Sash 37×64 mm',
    recommendedMinMm: '900 × 900 mm (3 × 3 ft)',
    recommendedMaxMm: '3000 × 2100 mm (10 × 7 ft)',
    glassRange: '5mm / 6mm Toughened + SS 304 Flymesh Track',
    signatureAdvantages:
      '3-track sliding system with an integrated SS mosquito mesh track for uninterrupted ventilation without insects.',
    idealSettings: 'Bedrooms, living rooms, kitchens, and high-rise apartments',
    features: [
      'Optional integrated fly-screen track (3rd track)',
      'Aluminium track outer frame (AL00SS0RLTRKF)',
      'Multi-point or single-point touch lock hardware',
    ],
    standardSizes: [
      { label: '4 × 4 ft (1200 × 1200 mm)', widthMm: 1200, heightMm: 1200 },
      { label: '5 × 4 ft (1500 × 1200 mm)', widthMm: 1500, heightMm: 1200 },
      { label: '6 × 4 ft (1800 × 1200 mm)', widthMm: 1800, heightMm: 1200 },
      { label: '6 × 5 ft (1800 × 1500 mm)', widthMm: 1800, heightMm: 1500 },
      { label: '8 × 5 ft (2400 × 1500 mm)', widthMm: 2400, heightMm: 1500 },
    ],
  },
  {
    windowType: '3-Track Sliding Window (3 Panel)',
    category: 'Window',
    brochureTitle: 'Sliding Windows (3-Track 3-Glass Heavy)',
    series: 'SLIDING SERIES 60MM',
    profileDepth: '3T Frame 112×48 mm | Sash 42×72 mm',
    recommendedMinMm: '1500 × 1200 mm (5 × 4 ft)',
    recommendedMaxMm: '3600 × 2100 mm (12 × 7 ft)',
    glassRange: '5mm / 6mm Toughened or 22mm DGU',
    signatureAdvantages:
      'All three sashes glide on independent heavy-duty tracks, opening up to 66% of the window aperture.',
    idealSettings: 'Wide living rooms, patios, offices needing 2/3 opening span',
    features: [
      'Heavy-duty 112mm 3-track outer frame',
      '40Kg+ heavy-duty stainless-steel rollers',
      'Multi-point locking for high wind-load zones',
    ],
    standardSizes: [
      { label: '6 × 4 ft (1800 × 1200 mm)', widthMm: 1800, heightMm: 1200 },
      { label: '6 × 5 ft (1800 × 1500 mm)', widthMm: 1800, heightMm: 1500 },
      { label: '8 × 5 ft (2400 × 1500 mm)', widthMm: 2400, heightMm: 1500 },
      { label: '10 × 5 ft (3000 × 1500 mm)', widthMm: 3000, heightMm: 1500 },
    ],
  },
  {
    windowType: '4-Panel Sliding Window',
    category: 'Window',
    brochureTitle: 'Sliding Windows (4-Panel Wide Span)',
    series: 'SLIDING SERIES 60MM',
    profileDepth: 'Frame 112×48 mm | Sash 42×72 mm',
    recommendedMinMm: '2100 × 1200 mm (7 × 4 ft)',
    recommendedMaxMm: '4200 × 2400 mm (14 × 8 ft)',
    glassRange: '5mm / 6mm Toughened or 22mm DGU',
    signatureAdvantages:
      'Dual-center opening 4-panel slider engineered for panoramic spans with maximum daylight.',
    idealSettings: 'Large halls, balconies, villas, and commercial facades',
    features: [
      'Center-meeting sashes for expansive symmetrical openings',
      'Heavy-duty GI reinforcement across outer frame and interlocks',
      'Smooth-glide 40Kg+ rollers with anti-lift blocks',
    ],
    standardSizes: [
      { label: '8 × 4 ft (2400 × 1200 mm)', widthMm: 2400, heightMm: 1200 },
      { label: '8 × 5 ft (2400 × 1500 mm)', widthMm: 2400, heightMm: 1500 },
      { label: '10 × 5 ft (3000 × 1500 mm)', widthMm: 3000, heightMm: 1500 },
      { label: '12 × 5 ft (3600 × 1500 mm)', widthMm: 3600, heightMm: 1500 },
    ],
  },
  {
    windowType: 'Casement Window (Single Shutter)',
    category: 'Window',
    brochureTitle: 'Casement Doors & Windows (Single)',
    series: 'CASEMENT SERIES 47MM',
    profileDepth: 'Frame 47×54 mm | Sash 47×78 mm',
    recommendedMinMm: '450 × 600 mm (1.5 × 2 ft)',
    recommendedMaxMm: '900 × 1500 mm (3 × 5 ft)',
    glassRange: '5mm / 6mm Single or 22mm Clear DGU',
    signatureAdvantages:
      '90° inward or outward opening sash with multi-seal system for superior air, water tightness, and acoustic insulation.',
    idealSettings: 'Kitchens, study rooms, bedrooms, heritage facades',
    features: [
      '90° inward or outward opening sash',
      'Multi-point locking and SS 304 friction stays',
      'High acoustic and thermal insulation values',
    ],
    standardSizes: [
      { label: '2 × 3 ft (600 × 900 mm)', widthMm: 600, heightMm: 900 },
      { label: '2 × 4 ft (600 × 1200 mm)', widthMm: 600, heightMm: 1200 },
      { label: '2.5 × 4 ft (750 × 1200 mm)', widthMm: 750, heightMm: 1200 },
      { label: '3 × 3 ft (890 × 890 mm)', widthMm: 890, heightMm: 890 },
      { label: '3 × 4 ft (900 × 1200 mm)', widthMm: 900, heightMm: 1200 },
    ],
  },
  {
    windowType: 'Casement Window (Double Shutter)',
    category: 'Window',
    brochureTitle: 'Casement Doors & Windows (French / Double)',
    series: 'CASEMENT SERIES 47MM',
    profileDepth: 'Frame 47×54 mm | Mullion + Dual Sash 47×78 mm',
    recommendedMinMm: '900 × 900 mm (3 × 3 ft)',
    recommendedMaxMm: '1800 × 1800 mm (6 × 6 ft)',
    glassRange: '5mm / 6mm Single or 22mm DGU',
    signatureAdvantages:
      'Hinged twin panels open wide for maximum airflow; multi-point locking ensures tight, weather-sealed closure.',
    idealSettings: 'Living rooms, bedrooms, French window bays',
    features: [
      'Wide unobstructed 100% clear opening',
      'Multi-point espagnolette locking',
      'Double EPDM weather seals',
    ],
    standardSizes: [
      { label: '4 × 4 ft (1200 × 1200 mm)', widthMm: 1200, heightMm: 1200 },
      { label: '4 × 5 ft (1200 × 1500 mm)', widthMm: 1200, heightMm: 1500 },
      { label: '5 × 4 ft (1500 × 1200 mm)', widthMm: 1500, heightMm: 1200 },
      { label: '6 × 5 ft (1800 × 1500 mm)', widthMm: 1800, heightMm: 1500 },
    ],
  },
  {
    windowType: 'Villa Window (Twin Sash + Grill & Mesh)',
    category: 'Window',
    brochureTitle: 'Villa Windows',
    series: 'CASEMENT SERIES 47MM',
    profileDepth: 'Twin-Sash Frame w/ Integrated Grill & Mesh',
    recommendedMinMm: '900 × 1050 mm (3 × 3.5 ft)',
    recommendedMaxMm: '1800 × 1800 mm (6 × 6 ft)',
    glassRange: '5mm / 6mm Toughened + Built-in Georgian Bar & Bug Mesh',
    signatureAdvantages:
      'Twin-sash frame with integrated grill and bug mesh; generous ventilation plus added security for tropical climates.',
    idealSettings: 'Luxury residences, coastal villas, independent bungalows',
    features: [
      'Twin-sash system with built-in bug mesh and MS/UPVC grill',
      'Wide ventilation without compromising security',
      'Low-maintenance UV-stable uPVC finish suitable for large apertures',
    ],
    standardSizes: [
      { label: '4 × 4 ft (1200 × 1200 mm)', widthMm: 1200, heightMm: 1200 },
      { label: '4 × 5 ft (1200 × 1500 mm)', widthMm: 1200, heightMm: 1500 },
      { label: '5 × 5 ft (1500 × 1500 mm)', widthMm: 1500, heightMm: 1500 },
      { label: '6 × 5 ft (1800 × 1500 mm)', widthMm: 1800, heightMm: 1500 },
    ],
  },
  {
    windowType: 'Tilt & Turn Window',
    category: 'Window',
    brochureTitle: 'Tilt-and-Turn Windows',
    series: 'CASEMENT SERIES 47MM',
    profileDepth: 'European Dual-Action Frame 60mm / 47mm',
    recommendedMinMm: '600 × 750 mm (2 × 2.5 ft)',
    recommendedMaxMm: '1400 × 2100 mm (4.5 × 7 ft)',
    glassRange: '5mm / 6mm Toughened or 22mm Clear DGU (5+12+5)',
    signatureAdvantages:
      'European dual-action versatility in one sash: tilts inward for micro-ventilation or swings inward for cleaning access.',
    idealSettings: 'High-rise apartments, kitchens, study areas needing easy cleaning',
    features: [
      'Tilt mode for safe, continuous draft-free ventilation',
      'Turn mode (90° inward) for full exterior glass cleaning & egress',
      'Concealed multi-point locking around the entire perimeter',
    ],
    standardSizes: [
      { label: '2.5 × 4 ft (750 × 1200 mm)', widthMm: 750, heightMm: 1200 },
      { label: '3 × 4 ft (900 × 1200 mm)', widthMm: 900, heightMm: 1200 },
      { label: '3 × 5 ft (900 × 1500 mm)', widthMm: 900, heightMm: 1500 },
      { label: '4 × 5 ft (1200 × 1500 mm)', widthMm: 1200, heightMm: 1500 },
    ],
  },
  {
    windowType: 'Sliding Balcony Door',
    category: 'Door',
    brochureTitle: 'Sliding Doors',
    series: 'SLIDING SERIES 60MM',
    profileDepth: '3T Heavy Frame 112×48 mm | Door Sash 42×72 mm',
    recommendedMinMm: '1500 × 2000 mm (5 × 6.5 ft)',
    recommendedMaxMm: '4000 × 2700 mm (13 × 9 ft)',
    glassRange: '6mm Clear Toughened or 22mm DGU Safety Glass',
    signatureAdvantages:
      'Smooth-glide heavy panels on dust-free tracks; excellent energy efficiency and secure sealing for indoor–outdoor flow.',
    idealSettings: 'Patios, apartment balconies, offices, high-rise decks',
    features: [
      'Heavy-duty 80Kg stainless-steel Tandem rollers',
      'Integrated SS 304 mosquito mesh option',
      'Lockable D-handle with multi-point shootbolt security',
    ],
    standardSizes: [
      { label: '5 × 7 ft (1500 × 2100 mm)', widthMm: 1500, heightMm: 2100 },
      { label: '6 × 7 ft (1800 × 2100 mm)', widthMm: 1800, heightMm: 2100 },
      { label: '8 × 7 ft (2400 × 2100 mm)', widthMm: 2400, heightMm: 2100 },
      { label: '10 × 8 ft (3000 × 2400 mm)', widthMm: 3000, heightMm: 2400 },
    ],
  },
  {
    windowType: 'Casement Door',
    category: 'Door',
    brochureTitle: 'Casement Doors',
    series: 'CASEMENT SERIES 47MM',
    profileDepth: 'Door Frame 60×58 mm | Door Sash 60×104 mm',
    recommendedMinMm: '750 × 2000 mm (2.5 × 6.5 ft)',
    recommendedMaxMm: '1800 × 2400 mm (6 × 8 ft)',
    glassRange: '6mm Toughened / Frosted or 22mm DGU + Designer Panel',
    signatureAdvantages:
      'Traditional single or double-leaf hinged door with deep reinforcement and airtight perimeter compression seals.',
    idealSettings: 'Main entrances, balconies, terrace access, offices',
    features: [
      '3D adjustable heavy-duty door hinges',
      'Multi-point Euro-cylinder key lockset',
      'Low aluminum threshold for effortless passage',
    ],
    standardSizes: [
      { label: '3 × 7 ft Single (900 × 2100 mm)', widthMm: 900, heightMm: 2100 },
      { label: '3.5 × 7 ft Single (1050 × 2100 mm)', widthMm: 1050, heightMm: 2100 },
      { label: '5 × 7 ft Double (1500 × 2100 mm)', widthMm: 1500, heightMm: 2100 },
      { label: '6 × 7 ft Double (1800 × 2100 mm)', widthMm: 1800, heightMm: 2100 },
    ],
  },
  {
    windowType: 'Lift & Slide Door (Panoramic)',
    category: 'Door',
    brochureTitle: 'Lift-and-Slide Doors',
    series: 'SLIDING SERIES 60MM',
    profileDepth: 'Panoramic Heavy Track | Sash up to 400 Kg',
    recommendedMinMm: '2400 × 2100 mm (8 × 7 ft)',
    recommendedMaxMm: '6000 × 3000 mm (20 × 10 ft)',
    glassRange: '22mm – 32mm DGU / Laminated Acoustic Glass',
    signatureAdvantages:
      'Lift mechanism raises heavy sashes (up to 400 kg) for fingertip movement; lowered position drop-seals tight for acoustic insulation.',
    idealSettings: 'Luxury villas, infinity-pool views, boardrooms, high-rise panoramic openings',
    features: [
      'Lift sash disengages gasket for effortless heavy gliding',
      'Sashes up to 400 kg handled by precision carriages',
      'Drop-seal locking yields top-tier air and water tightness',
    ],
    standardSizes: [
      { label: '8 × 8 ft (2400 × 2400 mm)', widthMm: 2400, heightMm: 2400 },
      { label: '10 × 8 ft (3000 × 2400 mm)', widthMm: 3000, heightMm: 2400 },
      { label: '12 × 8 ft (3600 × 2400 mm)', widthMm: 3600, heightMm: 2400 },
      { label: '16 × 9 ft (4800 × 2700 mm)', widthMm: 4800, heightMm: 2700 },
    ],
  },
  {
    windowType: 'Bi-Fold Door (Multi-Panel)',
    category: 'Door',
    brochureTitle: 'Bi-Fold Doors',
    series: 'CASEMENT SERIES 47MM',
    profileDepth: 'Multi-Panel Accordion Fold | Bottom-Running Rollers',
    recommendedMinMm: '1800 × 2100 mm (6 × 7 ft)',
    recommendedMaxMm: '5400 × 2700 mm (18 × 9 ft)',
    glassRange: '6mm Toughened or 22mm DGU Safety Glass',
    signatureAdvantages:
      'Multiple panels fold and stack neatly to a single side, opening up to 90%+ of entire walls for seamless indoor–outdoor living.',
    idealSettings: 'Cafes, entertainment zones, garden patios, villa openings',
    features: [
      'Multiple panels fold & stack flat to one side',
      'Heavy-duty bottom-running hinges and bogie rollers',
      'Continuous bottom seal for monsoon weather protection',
    ],
    standardSizes: [
      { label: '6 × 7 ft 3-Panel (1800 × 2100 mm)', widthMm: 1800, heightMm: 2100 },
      { label: '8 × 7 ft 3-Panel (2400 × 2100 mm)', widthMm: 2400, heightMm: 2100 },
      { label: '10 × 8 ft 4-Panel (3000 × 2400 mm)', widthMm: 3000, heightMm: 2400 },
      { label: '12 × 8 ft 5-Panel (3600 × 2400 mm)', widthMm: 3600, heightMm: 2400 },
    ],
  },
  {
    windowType: 'Fixed Glass Window',
    category: 'Window',
    brochureTitle: 'Fixed Picture Windows',
    series: 'FIXED SERIES 47MM',
    profileDepth: 'Frame 47×54 mm | 20mm Glazing Bead',
    recommendedMinMm: '300 × 300 mm (1 × 1 ft)',
    recommendedMaxMm: '2400 × 2400 mm (8 × 8 ft)',
    glassRange: '5mm / 6mm Toughened, Tinted, or 22mm Acoustic DGU',
    signatureAdvantages:
      'Non-operable sealed picture frame maximizing daylight, scenic framing, and acoustic isolation.',
    idealSettings: 'Stairwells, double-height foyers, offices, picture walls',
    features: [
      'Zero moving parts for maximum airtightness',
      'Supports large clear glass spans',
      'Compatible with privacy PDLC / frosted / DGU glass',
    ],
    standardSizes: [
      { label: '2 × 4 ft (600 × 1200 mm)', widthMm: 600, heightMm: 1200 },
      { label: '3 × 4 ft (900 × 1200 mm)', widthMm: 900, heightMm: 1200 },
      { label: '4 × 5 ft (1200 × 1500 mm)', widthMm: 1200, heightMm: 1500 },
      { label: '6 × 6 ft (1800 × 1800 mm)', widthMm: 1800, heightMm: 1800 },
    ],
  },
  {
    windowType: 'Ventilator (Top-Hung / Exhaust)',
    category: 'Window',
    brochureTitle: 'Bathroom & Utility Ventilators',
    series: 'VENTILATOR SERIES 47MM',
    profileDepth: 'Frame 47×54 mm | Top-Hung Sash 47×78 mm',
    recommendedMinMm: '450 × 450 mm (1.5 × 1.5 ft)',
    recommendedMaxMm: '900 × 900 mm (3 × 3 ft)',
    glassRange: '5mm Frosted / Pinhead Privacy Glass (+ Exhaust Cutout Option)',
    signatureAdvantages:
      'Compact moisture-proof unit built for privacy, continuous exhaust ventilation, and rain-shielded top-hung opening.',
    idealSettings: 'Bathrooms, washrooms, utility balconies, kitchens',
    features: [
      'Outward top-hung opening sheds rain while venting steam',
      'Cockspur handle + SS 304 10-inch friction stay',
      'Termite, rust, and bathroom-humidity proof',
    ],
    standardSizes: [
      { label: '1.5 × 2 ft (450 × 600 mm)', widthMm: 450, heightMm: 600 },
      { label: '2 × 2 ft (600 × 600 mm)', widthMm: 600, heightMm: 600 },
      { label: '2 × 3 ft (600 × 900 mm)', widthMm: 600, heightMm: 900 },
      { label: '3 × 2 ft (900 × 600 mm)', widthMm: 900, heightMm: 600 },
    ],
  },
  {
    windowType: 'Combination (Fixed + Openable)',
    category: 'Window',
    brochureTitle: 'Combination Windows',
    series: 'CASEMENT SERIES 47MM',
    profileDepth: 'Outer + Structural Mullion Frame 47mm',
    recommendedMinMm: '1200 × 1200 mm (4 × 4 ft)',
    recommendedMaxMm: '3000 × 2400 mm (10 × 8 ft)',
    glassRange: '5mm / 6mm Toughened or 22mm Clear DGU',
    signatureAdvantages:
      'Couples fixed daylight panes with openable casement or sliding vents in one unified structural uPVC frame.',
    idealSettings: 'Living rooms, stair landings, corner bedrooms, offices',
    features: [
      'Combines fixed glass + casement shutter in single frame',
      'Reinforced structural transom/mullion coupler',
      'Custom split proportions for architectural elevations',
    ],
    standardSizes: [
      { label: '4 × 4 ft (1200 × 1200 mm)', widthMm: 1200, heightMm: 1200 },
      { label: '5 × 4 ft (1500 × 1200 mm)', widthMm: 1500, heightMm: 1200 },
      { label: '6 × 5 ft (1800 × 1500 mm)', widthMm: 1800, heightMm: 1500 },
      { label: '8 × 6 ft (2400 × 1800 mm)', widthMm: 2400, heightMm: 1800 },
    ],
  },
];

export function getCatalogEntry(windowType: UpvcWindowType): ApolloCatalogEntry {
  return (
    APOLLO_WINDOW_DOOR_CATALOG.find((entry) => entry.windowType === windowType) ||
    APOLLO_WINDOW_DOOR_CATALOG[0]
  );
}

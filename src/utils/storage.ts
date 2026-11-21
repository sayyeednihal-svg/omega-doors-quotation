import { QuotationState } from '../types/quotation';
import { calcQuotationTotals } from './calculations';

export interface QuotationHistoryEntry {
  quoteNo: string;
  savedAt: string; // ISO timestamp
  clientName: string;
  mobile: string;
  createdBy?: string;
  totalWindows: number;
  totalAreaSqFt: number;
  grandTotal: number;
  state: QuotationState;
}

const HISTORY_KEY = 'omega_quote_history_v1';
const COUNTER_KEY = 'omega_quote_seq_counter_v1';
const INITIAL_SEQUENCE_START = 30; // First issued quote: OME-QT-00000030

function extractQuoteSequence(quoteNo: string): number {
  const match = quoteNo.match(/(\d+)$/);
  if (!match) return 0;
  const num = Number.parseInt(match[1], 10);
  return Number.isFinite(num) ? num : 0;
}

export function formatQuoteNo(seq: number): string {
  return `OME-QT-${String(seq).padStart(8, '0')}`;
}

export function getQuotationHistory(): QuotationHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function peekNextQuoteNumber(): string {
  const history = getQuotationHistory();
  const maxInHistory = history.reduce((max, entry) => {
    const n = extractQuoteSequence(entry.quoteNo);
    return n > max ? n : max;
  }, 0);

  let storedCounter = 0;
  try {
    const raw = localStorage.getItem(COUNTER_KEY);
    storedCounter = raw ? Number.parseInt(raw, 10) || 0 : 0;
  } catch {
    storedCounter = 0;
  }

  const nextSeq = Math.max(INITIAL_SEQUENCE_START, storedCounter + 1, maxInHistory + 1);
  return formatQuoteNo(nextSeq);
}

export function allocateNextQuoteNumber(): string {
  const history = getQuotationHistory();
  const maxInHistory = history.reduce((max, entry) => {
    const n = extractQuoteSequence(entry.quoteNo);
    return n > max ? n : max;
  }, 0);

  let storedCounter = 0;
  try {
    const raw = localStorage.getItem(COUNTER_KEY);
    storedCounter = raw ? Number.parseInt(raw, 10) || 0 : 0;
  } catch {
    storedCounter = 0;
  }

  const nextSeq = Math.max(INITIAL_SEQUENCE_START, storedCounter + 1, maxInHistory + 1);
  try {
    localStorage.setItem(COUNTER_KEY, String(nextSeq));
  } catch {
    // Ignore storage quota errors
  }
  return formatQuoteNo(nextSeq);
}

export function ensureCounterAtLeast(quoteNo: string): void {
  const seq = extractQuoteSequence(quoteNo);
  if (seq <= 0) return;
  try {
    const raw = localStorage.getItem(COUNTER_KEY);
    const current = raw ? Number.parseInt(raw, 10) || 0 : 0;
    if (seq > current) {
      localStorage.setItem(COUNTER_KEY, String(seq));
    }
  } catch {
    // Ignore
  }
}

export function saveQuotationToHistory(state: QuotationState): QuotationHistoryEntry[] {
  const totals = calcQuotationTotals(state.windows, state.charges);
  const displayClient = state.client.useSeparateDelivery
    ? state.client.deliveryName || state.client.clientName
    : state.client.clientName;
  const displayMobile = state.client.useSeparateDelivery
    ? state.client.deliveryMobile || state.client.mobile
    : state.client.mobile;

  ensureCounterAtLeast(state.meta.quoteNo);

  const entry: QuotationHistoryEntry = {
    quoteNo: state.meta.quoteNo,
    savedAt: new Date().toISOString(),
    clientName: displayClient || 'Walk-in Client',
    mobile: displayMobile || '-',
    createdBy: state.meta.createdBy || '',
    totalWindows: totals.totalWindows,
    totalAreaSqFt: totals.totalAreaSqFt,
    grandTotal: totals.grandTotal,
    state: JSON.parse(JSON.stringify(state)) as QuotationState,
  };

  const existing = getQuotationHistory();
  const filtered = existing.filter((item) => item.quoteNo !== entry.quoteNo);
  const updated = [entry, ...filtered];

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }

  return updated;
}

export function exportHistoryJson(): string {
  const history = getQuotationHistory();
  return JSON.stringify(
    {
      app: 'omega-doors-quotation',
      version: 1,
      exportedAt: new Date().toISOString(),
      history,
    },
    null,
    2
  );
}

export function importHistoryJson(jsonText: string): {
  history: QuotationHistoryEntry[];
  addedCount: number;
} {
  const parsed = JSON.parse(jsonText) as { history?: unknown } | unknown[];
  const incomingRaw = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as { history?: unknown }).history)
      ? (parsed as { history: unknown[] }).history
      : null;

  if (!incomingRaw) {
    throw new Error('Invalid quotation backup file.');
  }

  const existing = getQuotationHistory();
  const byQuoteNo = new Map<string, QuotationHistoryEntry>();
  existing.forEach((item) => {
    if (item && typeof item.quoteNo === 'string') {
      byQuoteNo.set(item.quoteNo, item);
    }
  });

  let addedCount = 0;
  for (const rawItem of incomingRaw) {
    if (!rawItem || typeof rawItem !== 'object') continue;
    const item = rawItem as QuotationHistoryEntry;
    if (
      typeof item.quoteNo !== 'string' ||
      !item.state ||
      !item.state.client ||
      !Array.isArray(item.state.windows)
    ) {
      continue;
    }
    ensureCounterAtLeast(item.quoteNo);
    if (!byQuoteNo.has(item.quoteNo)) {
      byQuoteNo.set(item.quoteNo, item);
      addedCount += 1;
    }
  }

  const merged = Array.from(byQuoteNo.values()).sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(merged));
  } catch {
    // Ignore storage quota errors
  }

  return { history: merged, addedCount };
}

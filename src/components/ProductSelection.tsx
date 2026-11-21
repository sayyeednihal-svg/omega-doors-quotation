import React, { useState } from 'react';
import { Archive, ArrowRight, BookOpen, CheckCircle2, FileText, History, Plus, Share2 } from 'lucide-react';
import { UpvcWindowType } from '../types/quotation';
import { ApolloCatalogModal } from './ApolloCatalogModal';

interface ProductSelectionProps {
  currentQuoteNo: string;
  hasActiveDraftData: boolean;
  historyCount: number;
  onStartNewUpvcQuote: () => void;
  onAddCatalogWindowToNewQuote: (windowType: UpvcWindowType, widthMm?: number, heightMm?: number) => void;
  onContinueDraft: () => void;
  onLoadSampleQuote: () => void;
  onOpenHistory: () => void;
}

export const ProductSelection: React.FC<ProductSelectionProps> = ({
  currentQuoteNo,
  hasActiveDraftData,
  historyCount,
  onStartNewUpvcQuote,
  onAddCatalogWindowToNewQuote,
  onContinueDraft,
  onLoadSampleQuote,
  onOpenHistory,
}) => {
  const [busyZip, setBusyZip] = useState<string | null>(null);
  const [zipStatus, setZipStatus] = useState<string>('');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const handleExportZip = async (path: string, fileName: string, mode: 'download' | 'share') => {
    setBusyZip(fileName);
    setZipStatus('');
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: 'application/zip' });

      if (mode === 'share' && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: fileName,
          files: [file],
        });
        setZipStatus(`Saved / shared ${fileName}.`);
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setZipStatus(`Downloaded ${fileName}. If blocked on mobile, tap Share next to it.`);
    } catch {
      setZipStatus(`Could not export ${fileName}. Please try the Share button.`);
    } finally {
      setBusyZip(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:py-10">
      <div className="mb-6">
        <p className="text-xs font-medium text-slate-500">Step 1 of 4 · Product Selection</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
          Choose Product Category
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Every new quotation automatically generates a unique, locked quotation number.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Primary Product Card: UPVC Window */}
        <button
          type="button"
          onClick={onStartNewUpvcQuote}
          className="md:col-span-7 text-left group bg-white border border-slate-200 hover:border-teal-600 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        >
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-semibold text-teal-700">APL APOLLO System</span>
                <h2 className="mt-1 text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  UPVC Window
                </h2>
              </div>
              <span className="min-w-[44px] min-h-[44px] rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </span>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 mb-4">
              <img
                src="/assets/quotation/offering-top.png"
                alt="APL Apollo UPVC Window Systems"
                referrerPolicy="no-referrer"
                className="w-full h-44 object-contain p-2"
              />
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Includes Sliding (2T/3T/4P), Casement, Villa, Tilt &amp; Turn, Sliding/Casement/Bi-Fold/Lift &amp; Slide Doors, Fixed &amp; Ventilator systems with standard mm/ft sizes and automatic area calculation.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900 inline-flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Start New UPVC Window Quote</span>
            </span>
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 text-white group-hover:bg-teal-700 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </button>

        {/* Quick Actions: Draft, History, Sample */}
        <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-base mb-2">
              <FileText className="w-5 h-5 text-slate-600" />
              <span>Quotes &amp; History</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Resume your current draft, browse all saved quotations to view or download PDFs again, or load sample data.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Active Quote No.</span>
                <span className="font-mono font-semibold text-slate-900">{currentQuoteNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Saved History</span>
                <span className="font-mono font-semibold text-slate-900">{historyCount} Quotes</span>
              </div>
              <div className="flex justify-between">
                <span>Formula</span>
                <span className="font-mono text-slate-900">W × H × Qty ÷ 92903.04</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {hasActiveDraftData && (
              <button
                type="button"
                onClick={onContinueDraft}
                className="w-full min-h-[46px] px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Continue Draft ({currentQuoteNo})
              </button>
            )}

            <button
              type="button"
              onClick={onOpenHistory}
              className="w-full min-h-[46px] px-4 py-2.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-semibold text-sm rounded-xl inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>View Quotation History ({historyCount})</span>
            </button>

            <button
              type="button"
              onClick={onLoadSampleQuote}
              className="w-full min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-xl transition-colors cursor-pointer"
            >
              Load Sample Quote (New Quote No.)
            </button>

            <button
              type="button"
              onClick={() => setIsCatalogOpen(true)}
              className="w-full min-h-[44px] px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-xs rounded-xl inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-700" />
              <span>Browse APL Apollo Types &amp; Sizes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compact App Backup & Deployment ZIP Bar */}
      <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-900">App Backup &amp; Cloudflare Deployment ZIPs</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {zipStatus || 'Upload "Cloudflare Upload (.zip)" directly on pages.cloudflare.com (zero third-party logo).'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void handleExportZip('/omega-doors-web-build.zip', 'omega-doors-cloudflare-upload.zip', 'download')}
            disabled={busyZip !== null}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{busyZip === 'omega-doors-cloudflare-upload.zip' ? 'Saving...' : 'Cloudflare Upload (.zip)'}</span>
          </button>
          <button
            type="button"
            onClick={() => void handleExportZip('/omega-doors-web-build.zip', 'omega-doors-cloudflare-upload.zip', 'share')}
            disabled={busyZip !== null}
            aria-label="Share or save Cloudflare upload zip to phone"
            className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Save / Share</span>
          </button>
          <button
            type="button"
            onClick={() => void handleExportZip('/omega-doors-full-project.zip', 'omega-doors-full-project.zip', 'download')}
            disabled={busyZip !== null}
            className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900 text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{busyZip === 'omega-doors-full-project.zip' ? 'Saving...' : 'Source Code (.zip)'}</span>
          </button>
          <button
            type="button"
            onClick={() => void handleExportZip('/omega-doors-full-project.zip', 'omega-doors-full-project.zip', 'share')}
            disabled={busyZip !== null}
            aria-label="Share or save full source zip to phone"
            className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Save / Share</span>
          </button>
        </div>
      </div>

      <ApolloCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onAddFromCatalog={onAddCatalogWindowToNewQuote}
      />
    </div>
  );
};

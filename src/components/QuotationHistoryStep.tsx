import React, { useMemo, useRef, useState } from 'react';
import JSZip from 'jszip';
import { Archive, Copy, Download, Eye, FileDown, FileText, Plus, Search, Share2, Upload } from 'lucide-react';
import { QuotationState } from '../types/quotation';
import { formatINR } from '../utils/calculations';
import { generateQuotationPdf } from '../utils/pdfGenerator';
import {
  exportHistoryJson,
  importHistoryJson,
  QuotationHistoryEntry,
} from '../utils/storage';

interface QuotationHistoryStepProps {
  history: QuotationHistoryEntry[];
  onStartNewQuote: () => void;
  onViewQuote: (state: QuotationState) => void;
  onCloneAsNewQuote: (state: QuotationState) => void;
  onHistoryUpdated: (updated: QuotationHistoryEntry[]) => void;
}

export const QuotationHistoryStep: React.FC<QuotationHistoryStepProps> = ({
  history,
  onStartNewQuote,
  onViewQuote,
  onCloneAsNewQuote,
  onHistoryUpdated,
}) => {
  const [query, setQuery] = useState('');
  const [busyQuoteNo, setBusyQuoteNo] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return history;
    return history.filter((item) => {
      const creator = (item.createdBy || item.state?.meta?.createdBy || '').toLowerCase();
      return (
        item.quoteNo.toLowerCase().includes(q) ||
        item.clientName.toLowerCase().includes(q) ||
        item.mobile.toLowerCase().includes(q) ||
        creator.includes(q)
      );
    });
  }, [history, query]);

  const handleDownload = async (entry: QuotationHistoryEntry) => {
    setBusyQuoteNo(entry.quoteNo);
    setFeedback('');
    try {
      const res = await generateQuotationPdf(entry.state);
      const url = URL.createObjectURL(res.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = res.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setFeedback(`Downloaded ${res.fileName}`);
    } catch {
      setFeedback(`Could not download PDF for ${entry.quoteNo}.`);
    } finally {
      setBusyQuoteNo(null);
    }
  };

  const handleShare = async (entry: QuotationHistoryEntry) => {
    setBusyQuoteNo(entry.quoteNo);
    setFeedback('');
    try {
      const res = await generateQuotationPdf(entry.state);
      const file = new File([res.blob], res.fileName, { type: 'application/pdf' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Quotation ${entry.quoteNo}`,
          text: `Omega Doors Industries UPVC Window Quotation for ${entry.clientName}`,
          files: [file],
        });
        setFeedback(`Shared ${res.fileName}`);
      } else {
        const url = URL.createObjectURL(res.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = res.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        setFeedback(`Saved ${res.fileName}`);
      }
    } catch {
      // Cancelled share dialog
    } finally {
      setBusyQuoteNo(null);
    }
  };

  const handleExportBackup = async () => {
    const json = exportHistoryJson();
    const fileName = `omega-quotations-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([json], { type: 'application/json' });
    const file = new File([blob], fileName, { type: 'application/json' });

    try {
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Omega Quotations Backup',
          text: 'Import this file in the History tab on another phone.',
          files: [file],
        });
        setFeedback(`Shared backup ${fileName}.`);
        return;
      }
    } catch {
      // Fallback to download
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    setFeedback(`Downloaded backup ${fileName}.`);
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const { history: merged, addedCount } = importHistoryJson(text);
      onHistoryUpdated(merged);
      setFeedback(`Imported ${addedCount} new quotation(s). Total saved: ${merged.length}.`);
    } catch {
      setFeedback('Could not import file. Please select a valid Omega backup JSON file.');
    }
  };

  const handleDownloadAllZip = async () => {
    if (history.length === 0) return;
    setIsZipping(true);
    setFeedback('');
    try {
      const zip = new JSZip();
      const pdfFolder = zip.folder('Omega_Quotations_PDFs');
      for (const entry of history) {
        const res = await generateQuotationPdf(entry.state);
        if (pdfFolder) {
          pdfFolder.file(res.fileName, res.blob);
        } else {
          zip.file(res.fileName, res.blob);
        }
      }
      zip.file('quotations-backup.json', exportHistoryJson());
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipName = `Omega-Quotations-All-${new Date().toISOString().slice(0, 10)}.zip`;

      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = zipName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setFeedback(`Saved ${history.length} quotation PDF(s) + backup in ${zipName}.`);
    } catch {
      setFeedback('Could not create ZIP archive. Please try again.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-medium text-slate-500">Saved Quotations · Permanent History</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
            Quotation History
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            View or download any generated quotation PDF at any time. Quotation numbers are permanently locked.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportBackup}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import Backup</span>
          </button>
          {history.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                className="min-h-[44px] px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl inline-flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
              >
                <Archive className="w-4 h-4" />
                <span>{isZipping ? 'Creating ZIP...' : 'Download All (.zip)'}</span>
              </button>
              <button
                type="button"
                onClick={handleExportBackup}
                className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Share Backup</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onStartNewQuote}
            className="min-h-[44px] px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Quotation</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="mb-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-sm text-teal-900">
          {feedback}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-5">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Quote No., client, mobile, or created by..."
          className="w-full min-h-[46px] pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-slate-900">
            {history.length === 0 ? 'No generated quotations yet' : 'No matching quotations found'}
          </h2>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            {history.length === 0
              ? 'Once you generate or share a quotation PDF, it will automatically be saved here for instant viewing and re-downloading.'
              : 'Try searching with a different quotation number, client name, or mobile number.'}
          </p>
          {history.length === 0 && (
            <button
              type="button"
              onClick={onStartNewQuote}
              className="mt-5 min-h-[44px] px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-xl inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Quotation</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => {
            const isBusy = busyQuoteNo === entry.quoteNo;
            const dateStr = new Date(entry.savedAt).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const creator = entry.createdBy || entry.state?.meta?.createdBy;

            return (
              <article
                key={entry.quoteNo}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {entry.quoteNo}
                    </span>
                    <span className="text-slate-300" aria-hidden="true">·</span>
                    <span className="text-xs text-slate-500">{dateStr}</span>
                    {creator && (
                      <>
                        <span className="text-slate-300" aria-hidden="true">·</span>
                        <span className="text-xs font-medium text-slate-700">Created by {creator}</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-base font-semibold text-slate-900 truncate">
                    {entry.clientName}
                  </h2>
                  <p className="text-xs text-slate-600 font-mono tabular-nums">
                    {entry.mobile} · {entry.totalWindows} Nos · {entry.totalAreaSqFt.toFixed(2)} Sq.ft ·{' '}
                    <span className="font-bold text-teal-800">INR {formatINR(entry.grandTotal)}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onViewQuote(entry.state)}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(entry)}
                    disabled={isBusy}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isBusy ? 'Preparing...' : 'Download PDF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(entry)}
                    disabled={isBusy}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onCloneAsNewQuote(entry.state)}
                    title="Duplicate into a brand-new quotation number"
                    className="min-h-[44px] px-3.5 py-2 rounded-xl border border-teal-700/40 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span>New Quote Copy</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

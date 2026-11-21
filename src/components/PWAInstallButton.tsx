import React, { useState } from 'react';
import { Check, Copy, Download, Share2, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const getAppUrl = () => (typeof window !== 'undefined' ? window.location.origin : '');

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);
  const appUrl = getAppUrl();

  const handleClick = async () => {
    if (!isInstalled && isInstallable) {
      await install();
      return;
    }
    setShowGuide(true);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleShareUrl = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Omega Doors Quotation App',
          text: 'Open this link in Chrome on your Android phone and tap Install App for offline lifetime use (Username: omega / Password: omega)',
          url: appUrl,
        });
        return;
      }
    } catch {
      // User cancelled share
    }
    await handleCopyUrl();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="min-h-[40px] px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
      >
        {isInstalled ? (
          <>
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share to Staff</span>
            <span className="sm:hidden">Share</span>
          </>
        ) : isInstallable ? (
          <>
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </>
        ) : (
          <>
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install &amp; Share</span>
            <span className="sm:hidden">Install</span>
          </>
        )}
      </button>

      {showGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-guide-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4"
        >
          <div className="w-full max-w-md max-h-[90dvh] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h3 id="install-guide-title" className="text-base font-bold text-slate-900">
                {isInstalled
                  ? 'Share App with Staff'
                  : isIOS
                    ? 'Install on iPhone / iPad'
                    : 'Offline Android Install & Staff Sharing'}
              </h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Close install guide"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm text-slate-700 leading-relaxed overflow-y-auto">
              {/* Shareable App Link Box */}
              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 space-y-2.5">
                <p className="font-semibold text-teal-950 text-xs">
                  Send this link to your staff (Username: <span className="font-mono">omega</span> / Password: <span className="font-mono">omega</span>):
                </p>
                <p className="font-mono text-[11px] break-all bg-white border border-teal-200 rounded-lg px-2.5 py-2 text-slate-800 select-all">
                  {appUrl}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShareUrl}
                    className="flex-1 min-h-[42px] px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share on WhatsApp / Apps</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="min-h-[42px] px-3 py-2 bg-white hover:bg-slate-50 border border-teal-300 text-teal-900 text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {isIOS ? (
                <div className="space-y-1.5 text-xs text-slate-600">
                  <p>1. Open the link above in Safari on iPhone.</p>
                  <p>
                    2. Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs text-slate-600">
                  <p className="font-semibold text-slate-900">Offline Lifetime Install on Android</p>
                  <p>
                    Open the link in <strong>Google Chrome</strong> on Android and tap <strong>⋮ → Install app</strong> (or <strong>Add to Home screen</strong>). All logos, CAD drawings, quotation history, locked quote numbers, and 5-page PDFs work 100% offline.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-full min-h-[44px] py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

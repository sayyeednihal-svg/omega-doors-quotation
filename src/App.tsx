import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { ClientInfoStep } from './components/ClientInfoStep';
import { LoginScreen } from './components/LoginScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ProductSelection } from './components/ProductSelection';
import { PWAInstallButton } from './components/PWAInstallButton';
import { QuotationHistoryStep } from './components/QuotationHistoryStep';
import { QuotationPreviewStep } from './components/QuotationPreviewStep';
import { WindowBuilderStep } from './components/WindowBuilderStep';
import { QuotationState, UpvcWindowType } from './types/quotation';
import {
  createDefaultMeta,
  createEmptyQuotation,
  createEmptyWindow,
  createSampleQuotation,
  estimateWeightKg,
  getDefaultWindowTypeForProject,
} from './utils/calculations';
import {
  ensureCounterAtLeast,
  getQuotationHistory,
  QuotationHistoryEntry,
  saveQuotationToHistory,
} from './utils/storage';

type AppStep = 'product' | 'client' | 'windows' | 'preview' | 'history';

const AUTH_STORAGE_KEY = 'omega_quote_auth_v1';
const DRAFT_STORAGE_KEY = 'omega_quote_draft_v1';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [step, setStep] = useState<AppStep>('product');

  const [history, setHistory] = useState<QuotationHistoryEntry[]>(() => getQuotationHistory());

  const [quotation, setQuotation] = useState<QuotationState>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as QuotationState;
        if (parsed && parsed.client && Array.isArray(parsed.windows) && parsed.charges) {
          ensureCounterAtLeast(parsed.meta?.quoteNo || '');
          return parsed;
        }
      }
    } catch {
      // Ignore storage errors
    }
    return createEmptyQuotation();
  });

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(quotation));
    } catch {
      // Ignore storage errors
    }
  }, [quotation]);

  const handleLoginSuccess = () => {
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } catch {
      // Ignore
    }
    setIsAuthenticated(true);
    setStep('product');
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setIsAuthenticated(false);
    setStep('product');
  };

  const navigateStep = (target: AppStep) => {
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartNewUpvcQuote = () => {
    const fresh = createEmptyQuotation();
    setQuotation(fresh);
    navigateStep('client');
  };

  const handleAddCatalogWindowToNewQuote = (
    windowType: UpvcWindowType,
    widthMm?: number,
    heightMm?: number
  ) => {
    const base = createEmptyWindow(1, windowType);
    const finalW = widthMm || base.widthMm;
    const finalH = heightMm || base.heightMm;
    const configuredWin = {
      ...base,
      widthMm: finalW,
      heightMm: finalH,
      weightKg: estimateWeightKg(finalW, finalH, 1, base.series),
    };
    const fresh = createEmptyQuotation();
    setQuotation({
      ...fresh,
      windows: [configuredWin],
    });
    navigateStep('windows');
  };

  const handleContinueDraft = () => {
    navigateStep('client');
  };

  const handleLoadSampleQuote = () => {
    setQuotation(createSampleQuotation());
    navigateStep('client');
  };

  const handleSaveToHistory = (stateToSave: QuotationState) => {
    const updated = saveQuotationToHistory(stateToSave);
    setHistory(updated);
  };

  const handleViewHistoricalQuote = (state: QuotationState) => {
    setQuotation(JSON.parse(JSON.stringify(state)) as QuotationState);
    navigateStep('preview');
  };

  const handleCloneAsNewQuote = (state: QuotationState) => {
    const cloned: QuotationState = {
      ...(JSON.parse(JSON.stringify(state)) as QuotationState),
      meta: createDefaultMeta(),
    };
    setQuotation(cloned);
    navigateStep('client');
  };

  const hasActiveDraftData = Boolean(
    quotation.client.clientName.trim() ||
      quotation.client.mobile.trim() ||
      quotation.windows.some((w) => w.ratePerSqFt > 0)
  );

  if (!isAuthenticated) {
    return (
      <>
        <OfflineIndicator />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  const navItems: Array<{ id: AppStep; label: string }> = [
    { id: 'product', label: 'Product' },
    { id: 'client', label: 'Client' },
    { id: 'windows', label: 'Windows' },
    { id: 'preview', label: 'Preview' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <OfflineIndicator />

      {/* Compact Sticky Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 h-14 flex items-center justify-between gap-3 sm:gap-6">
        <button
          type="button"
          onClick={() => navigateStep('product')}
          className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
        >
          Omega Doors
        </button>

        <nav className="flex items-center gap-2.5 sm:gap-5 overflow-x-auto text-xs sm:text-sm font-medium">
          {navItems.map((item) => {
            const active = step === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateStep(item.id)}
                className={`min-h-[40px] px-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'text-teal-700 font-semibold border-b-2 border-teal-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            className="min-h-[40px] px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="flex-1">
        {step === 'product' && (
          <ProductSelection
            currentQuoteNo={quotation.meta.quoteNo}
            hasActiveDraftData={hasActiveDraftData}
            historyCount={history.length}
            onStartNewUpvcQuote={handleStartNewUpvcQuote}
            onAddCatalogWindowToNewQuote={handleAddCatalogWindowToNewQuote}
            onContinueDraft={handleContinueDraft}
            onLoadSampleQuote={handleLoadSampleQuote}
            onOpenHistory={() => navigateStep('history')}
          />
        )}

        {step === 'client' && (
          <ClientInfoStep
            client={quotation.client}
            meta={quotation.meta}
            onChangeClient={(client) => setQuotation((prev) => ({ ...prev, client }))}
            onChangeMeta={(meta) =>
              setQuotation((prev) => {
                const projectChanged = meta.projectType !== prev.meta.projectType;
                let nextWindows = prev.windows;
                if (
                  projectChanged &&
                  prev.windows.length === 1 &&
                  prev.windows[0].ratePerSqFt === 0 &&
                  prev.windows[0].code === 'Window 1'
                ) {
                  const defaultType = getDefaultWindowTypeForProject(meta.projectType);
                  const fresh = createEmptyWindow(1, defaultType);
                  nextWindows = [{ ...fresh, id: prev.windows[0].id }];
                }
                return {
                  ...prev,
                  meta: { ...meta, quoteNo: prev.meta.quoteNo },
                  windows: nextWindows,
                };
              })
            }
            onBack={() => navigateStep('product')}
            onNext={() => navigateStep('windows')}
          />
        )}

        {step === 'windows' && (
          <WindowBuilderStep
            windows={quotation.windows}
            charges={quotation.charges}
            projectType={quotation.meta.projectType}
            onChangeWindows={(windows) => setQuotation((prev) => ({ ...prev, windows }))}
            onChangeCharges={(charges) => setQuotation((prev) => ({ ...prev, charges }))}
            onBack={() => navigateStep('client')}
            onNext={() => navigateStep('preview')}
          />
        )}

        {step === 'preview' && (
          <QuotationPreviewStep
            quotation={quotation}
            onChangeWindows={(windows) => setQuotation((prev) => ({ ...prev, windows }))}
            onChangeCharges={(charges) => setQuotation((prev) => ({ ...prev, charges }))}
            onSaveToHistory={handleSaveToHistory}
            onBack={() => navigateStep('windows')}
          />
        )}

        {step === 'history' && (
          <QuotationHistoryStep
            history={history}
            onStartNewQuote={handleStartNewUpvcQuote}
            onViewQuote={handleViewHistoricalQuote}
            onCloneAsNewQuote={handleCloneAsNewQuote}
            onHistoryUpdated={setHistory}
          />
        )}
      </main>
    </div>
  );
}

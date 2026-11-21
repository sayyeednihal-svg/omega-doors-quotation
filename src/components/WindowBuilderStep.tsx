import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  PricingCharges,
  ProfileColorOption,
  UpvcWindowType,
  WindowItem,
  WindowSeriesType,
} from '../types/quotation';
import {
  calcAreaSqFt,
  calcQuotationTotals,
  createEmptyWindow,
  estimateWeightKg,
  formatINR,
  getDefaultWindowTypeForProject,
  getSeriesPreset,
  getWindowTypePreset,
  GLASS_OPTIONS,
  inferWindowType,
  MESH_OPTIONS,
  PROFILE_COLOR_OPTIONS,
  SERIES_OPTIONS,
  UPVC_WINDOW_TYPE_OPTIONS,
} from '../utils/calculations';
import { getCatalogEntry } from '../data/apolloCatalog';
import { ApolloCatalogModal } from './ApolloCatalogModal';
import { WindowCadSvg } from './WindowCadSvg';

interface WindowBuilderStepProps {
  windows: WindowItem[];
  charges: PricingCharges;
  projectType?: string;
  onChangeWindows: (windows: WindowItem[]) => void;
  onChangeCharges: (charges: PricingCharges) => void;
  onBack: () => void;
  onNext: () => void;
}

export const WindowBuilderStep: React.FC<WindowBuilderStepProps> = ({
  windows,
  charges,
  projectType,
  onChangeWindows,
  onChangeCharges,
  onBack,
  onNext,
}) => {
  const [expandedSpecs, setExpandedSpecs] = useState<Record<string, boolean>>({});
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const totals = calcQuotationTotals(windows, charges);

  const toggleSpecs = (id: string) => {
    setExpandedSpecs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateWindow = (id: string, patch: Partial<WindowItem>) => {
    onChangeWindows(
      windows.map((w) => {
        if (w.id !== id) return w;
        const next = { ...w, ...patch };
        if (
          patch.widthMm !== undefined ||
          patch.heightMm !== undefined ||
          patch.quantity !== undefined ||
          patch.series !== undefined
        ) {
          if (patch.weightKg === undefined) {
            next.weightKg = estimateWeightKg(next.widthMm, next.heightMm, next.quantity, next.series);
          }
        }
        return next;
      })
    );
  };

  const handleSeriesChange = (id: string, series: WindowSeriesType) => {
    const preset = getSeriesPreset(series);
    onChangeWindows(
      windows.map((w) => {
        if (w.id !== id) return w;
        return {
          ...w,
          ...preset,
          weightKg: estimateWeightKg(w.widthMm, w.heightMm, w.quantity, series),
        };
      })
    );
  };

  const handleWindowTypeChange = (id: string, windowType: UpvcWindowType) => {
    const preset = getWindowTypePreset(windowType);
    onChangeWindows(
      windows.map((w) => {
        if (w.id !== id) return w;
        return {
          ...w,
          ...preset,
          weightKg: estimateWeightKg(w.widthMm, w.heightMm, w.quantity, preset.series),
        };
      })
    );
  };

  const addWindow = () => {
    const defaultType = getDefaultWindowTypeForProject(projectType);
    const newWin = createEmptyWindow(windows.length + 1, defaultType);
    onChangeWindows([...windows, newWin]);
    setTimeout(() => {
      document.getElementById(newWin.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const addFromCatalog = (windowType: UpvcWindowType, widthMm?: number, heightMm?: number) => {
    const base = createEmptyWindow(windows.length + 1, windowType);
    const finalW = widthMm || base.widthMm;
    const finalH = heightMm || base.heightMm;
    const newWin: WindowItem = {
      ...base,
      widthMm: finalW,
      heightMm: finalH,
      weightKg: estimateWeightKg(finalW, finalH, 1, base.series),
    };
    onChangeWindows([...windows, newWin]);
    setTimeout(() => {
      document.getElementById(newWin.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const duplicateWindow = (win: WindowItem) => {
    const copy: WindowItem = {
      ...win,
      id: `win-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code: `${win.code} (Copy)`,
    };
    onChangeWindows([...windows, copy]);
  };

  const removeWindow = (id: string) => {
    if (windows.length <= 1) return;
    onChangeWindows(windows.filter((w) => w.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 pt-6 pb-28 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-medium text-slate-500">Step 3 of 4 · UPVC Window</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
            Window Details &amp; Pricing
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Area calculates automatically as Width (mm) × Height (mm) × Qty ÷ 92903.04.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsCatalogOpen(true)}
            className="min-h-[44px] px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-sm rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-teal-700" />
            <span>APL Apollo Sizes &amp; Catalog</span>
          </button>
          <button
            type="button"
            onClick={addWindow}
            className="min-h-[44px] px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-xl inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Window</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Main Column: Window Cards */}
        <div className="lg:col-span-8 space-y-5">
          {windows.map((win, idx) => {
            const areaSqFt = calcAreaSqFt(win.widthMm, win.heightMm, win.quantity);
            const lineAmount = Number((areaSqFt * (win.ratePerSqFt || 0)).toFixed(2));
            const isSpecsOpen = Boolean(expandedSpecs[win.id]);
            const isSliding = win.series.includes('SLIDING');

            return (
              <section
                key={win.id}
                id={win.id}
                className="scroll-mt-16 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Card Header */}
                <div className="px-4 sm:px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-mono text-slate-500">Window #{idx + 1}</span>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {win.location || win.code || `Window ${idx + 1}`}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => duplicateWindow(win)}
                      aria-label={`Duplicate window ${idx + 1}`}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {windows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWindow(win.id)}
                        aria-label={`Remove window ${idx + 1}`}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  {/* Top Split: CAD Preview + Primary Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-2 flex flex-col items-center">
                      <WindowCadSvg
                        series={win.series}
                        windowType={inferWindowType(win)}
                        widthMm={win.widthMm}
                        heightMm={win.heightMm}
                        hasMesh={win.meshType !== '' && win.meshType.toLowerCase() !== 'no'}
                      />
                      <span className="text-[11px] font-mono text-slate-500 mt-1">
                        {win.widthMm || 0}mm × {win.heightMm || 0}mm
                      </span>
                    </div>

                    <div className="sm:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Location / Name *
                        </label>
                        <input
                          type="text"
                          value={win.location}
                          onChange={(e) => updateWindow(win.id, { location: e.target.value })}
                          placeholder="e.g. KITCHEN, Bedroom1"
                          className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Window Code
                        </label>
                        <input
                          type="text"
                          value={win.code}
                          onChange={(e) => updateWindow(win.id, { code: e.target.value })}
                          placeholder="e.g. KITCHEN WINDOW"
                          className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          UPVC Window / Door Type
                        </label>
                        <select
                          value={inferWindowType(win)}
                          onChange={(e) => handleWindowTypeChange(win.id, e.target.value as UpvcWindowType)}
                          className="w-full min-h-[44px] px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        >
                          {UPVC_WINDOW_TYPE_OPTIONS.map((wt) => (
                            <option key={wt} value={wt}>
                              {wt}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Product Series
                        </label>
                        <select
                          value={win.series}
                          onChange={(e) => handleSeriesChange(win.id, e.target.value as WindowSeriesType)}
                          className="w-full min-h-[44px] px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        >
                          {SERIES_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Standard Size Preset + Recommended Range */}
                  {(() => {
                    const catalogEntry = getCatalogEntry(inferWindowType(win));
                    const matchedPreset = catalogEntry.standardSizes.find(
                      (sz) => sz.widthMm === win.widthMm && sz.heightMm === win.heightMm
                    );
                    return (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="block text-[11px] font-semibold text-slate-700">
                            APL Apollo Standard Size Presets (or type custom mm below)
                          </span>
                          <span className="block text-[11px] text-slate-500 truncate">
                            Range: {catalogEntry.recommendedMinMm} – {catalogEntry.recommendedMaxMm}
                          </span>
                        </div>
                        <select
                          aria-label={`Standard size preset for window ${idx + 1}`}
                          value={matchedPreset ? `${matchedPreset.widthMm}x${matchedPreset.heightMm}` : ''}
                          onChange={(e) => {
                            if (!e.target.value) return;
                            const [wStr, hStr] = e.target.value.split('x');
                            const widthMm = Number(wStr);
                            const heightMm = Number(hStr);
                            if (widthMm > 0 && heightMm > 0) {
                              updateWindow(win.id, { widthMm, heightMm });
                            }
                          }}
                          className="min-h-[38px] px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 sm:min-w-[215px]"
                        >
                          <option value="">Custom ({win.widthMm || 0} × {win.heightMm || 0} mm)</option>
                          {catalogEntry.standardSizes.map((sz) => (
                            <option key={sz.label} value={`${sz.widthMm}x${sz.heightMm}`}>
                              {sz.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })()}

                  {/* Dimensions, Qty, Rate */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Width (mm) *
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={100}
                        step={1}
                        value={win.widthMm || ''}
                        onChange={(e) => updateWindow(win.id, { widthMm: Number(e.target.value) })}
                        className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl font-mono tabular-nums text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Height (mm) *
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={100}
                        step={1}
                        value={win.heightMm || ''}
                        onChange={(e) => updateWindow(win.id, { heightMm: Number(e.target.value) })}
                        className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl font-mono tabular-nums text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        step={1}
                        value={win.quantity || ''}
                        onChange={(e) => updateWindow(win.id, { quantity: Math.max(1, Number(e.target.value)) })}
                        className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl font-mono tabular-nums text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Rate / Sq.ft (INR) *
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        value={win.ratePerSqFt || ''}
                        onChange={(e) =>
                          updateWindow(win.id, {
                            ratePerSqFt: e.target.value === '' ? 0 : Number(e.target.value),
                          })
                        }
                        placeholder="Enter rate"
                        className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl font-mono tabular-nums text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        required
                      />
                    </div>
                  </div>

                  {/* Quick Material Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Profile Color
                      </label>
                      <select
                        value={win.profileColor}
                        onChange={(e) =>
                          updateWindow(win.id, {
                            profileColor: e.target.value as ProfileColorOption,
                            handleColor: e.target.value === 'WHITE' ? 'WHITE' : e.target.value,
                          })
                        }
                        className="w-full min-h-[44px] px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      >
                        {PROFILE_COLOR_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Glass Specification
                      </label>
                      <select
                        value={GLASS_OPTIONS.includes(win.glass) ? win.glass : '__custom__'}
                        onChange={(e) => {
                          if (e.target.value !== '__custom__') {
                            updateWindow(win.id, { glass: e.target.value });
                          }
                        }}
                        className="w-full min-h-[44px] px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      >
                        {GLASS_OPTIONS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                        {!GLASS_OPTIONS.includes(win.glass) && (
                          <option value="__custom__">{win.glass}</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Mesh Type
                      </label>
                      <select
                        value={MESH_OPTIONS.includes(win.meshType) ? win.meshType : '__custom__'}
                        onChange={(e) => {
                          if (e.target.value !== '__custom__') {
                            updateWindow(win.id, { meshType: e.target.value });
                          }
                        }}
                        className="w-full min-h-[44px] px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      >
                        {MESH_OPTIONS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                        {!MESH_OPTIONS.includes(win.meshType) && (
                          <option value="__custom__">{win.meshType}</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Live Calculated Area & Amount Strip */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="block text-[11px] font-medium text-slate-500">
                        Calculated Area
                      </span>
                      <span className="font-mono tabular-nums text-base font-bold text-slate-900">
                        {areaSqFt.toFixed(2)} Sq.ft
                      </span>
                      <span className="ml-1.5 text-xs font-mono text-slate-500">
                        ({areaSqFt.toFixed(3)})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[11px] font-medium text-slate-500">
                        Line Amount
                      </span>
                      <span className="font-mono tabular-nums text-base font-bold text-teal-800">
                        INR {formatINR(lineAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Collapsible Technical Materials & Accessories */}
                  <div className="border-t border-slate-100 pt-2">
                    <button
                      type="button"
                      onClick={() => toggleSpecs(win.id)}
                      className="w-full min-h-[44px] flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      <span>Profile, Reinforcement &amp; Accessories Specifications</span>
                      {isSpecsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isSpecsOpen && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            {isSliding ? 'Track' : 'Outer Frame'}
                          </label>
                          <input
                            type="text"
                            value={win.outerFrame}
                            onChange={(e) => updateWindow(win.id, { outerFrame: e.target.value })}
                            className="w-full min-h-[40px] px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            {isSliding ? 'Track RI' : 'Outer RI'}
                          </label>
                          <input
                            type="text"
                            value={win.outerRI}
                            onChange={(e) => updateWindow(win.id, { outerRI: e.target.value })}
                            className="w-full min-h-[40px] px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            {isSliding ? 'Sliding Sash' : 'Casement Sash'}
                          </label>
                          <input
                            type="text"
                            value={win.sash}
                            onChange={(e) => updateWindow(win.id, { sash: e.target.value })}
                            className="w-full min-h-[40px] px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            {isSliding ? 'Sliding RI' : 'Casement RI'}
                          </label>
                          <input
                            type="text"
                            value={win.sashRI}
                            onChange={(e) => updateWindow(win.id, { sashRI: e.target.value })}
                            className="w-full min-h-[40px] px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            Flymesh Sash
                          </label>
                          <input
                            type="text"
                            value={win.flymeshSash}
                            onChange={(e) => updateWindow(win.id, { flymeshSash: e.target.value })}
                            placeholder="Optional"
                            className="w-full min-h-[40px] px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            Guide Rail
                          </label>
                          <input
                            type="text"
                            value={win.guideRail}
                            onChange={(e) => updateWindow(win.id, { guideRail: e.target.value })}
                            placeholder="Optional"
                            className="w-full min-h-[40px] px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            Handle Type
                          </label>
                          <input
                            type="text"
                            value={win.handleType}
                            onChange={(e) => updateWindow(win.id, { handleType: e.target.value })}
                            className="w-full min-h-[40px] px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            Locking
                          </label>
                          <input
                            type="text"
                            value={win.locking}
                            onChange={(e) => updateWindow(win.id, { locking: e.target.value })}
                            className="w-full min-h-[40px] px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            Handle Color
                          </label>
                          <input
                            type="text"
                            value={win.handleColor}
                            onChange={(e) => updateWindow(win.id, { handleColor: e.target.value })}
                            className="w-full min-h-[40px] px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            {isSliding ? 'Roller' : 'Friction Stay'}
                          </label>
                          <input
                            type="text"
                            value={win.frictionStayOrRoller}
                            onChange={(e) => updateWindow(win.id, { frictionStayOrRoller: e.target.value })}
                            className="w-full min-h-[40px] px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            Flymesh Handle
                          </label>
                          <input
                            type="text"
                            value={win.flymeshHandle}
                            onChange={(e) => updateWindow(win.id, { flymeshHandle: e.target.value })}
                            placeholder="Optional"
                            className="w-full min-h-[40px] px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            Estimated Weight (Kg)
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            min={0}
                            value={win.weightKg}
                            onChange={(e) => updateWindow(win.id, { weightKg: Number(e.target.value) })}
                            className="w-full min-h-[40px] px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs text-slate-900"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          })}

          <button
            type="button"
            onClick={addWindow}
            className="w-full min-h-[52px] px-4 py-3 bg-white hover:bg-teal-50 border-2 border-dashed border-teal-600/60 hover:border-teal-700 text-teal-800 font-semibold text-sm rounded-2xl inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add More Windows ({windows.length} added)</span>
          </button>
        </div>

        {/* Right Column: Editable Charges & Grand Total Summary */}
        <aside className="lg:col-span-4 lg:sticky lg:top-20 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Charges &amp; Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Total Windows</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {totals.totalWindows} Nos
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Area</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {totals.totalAreaSqFt.toFixed(3)} Sq.Ft.
              </span>
            </div>
            <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-100">
              <span>Basic Value</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                INR {formatINR(totals.basicValue)}
              </span>
            </div>
          </div>

          {/* Editable Discount */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-600">Discount</label>
                <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
                  <button
                    type="button"
                    onClick={() => onChangeCharges({ ...charges, discountMode: 'percent', discountValue: 0 })}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                      charges.discountMode === 'percent'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeCharges({ ...charges, discountMode: 'amount', discountValue: 0 })}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                      charges.discountMode === 'amount'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    INR
                  </button>
                </div>
              </div>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={charges.discountValue}
                onChange={(e) =>
                  onChangeCharges({ ...charges, discountValue: Math.max(0, Number(e.target.value)) })
                }
                className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl font-mono tabular-nums text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <p className="mt-1 text-xs font-mono tabular-nums text-slate-500">
                Discount applied: -INR {formatINR(totals.discountAmount)}
              </p>
            </div>

            <div>
              <label htmlFor="transport-cost" className="block text-xs font-medium text-slate-600 mb-1">
                Transportation Cost (INR)
              </label>
              <input
                id="transport-cost"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={charges.transportationCost}
                onChange={(e) =>
                  onChangeCharges({ ...charges, transportationCost: Math.max(0, Number(e.target.value)) })
                }
                className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl font-mono tabular-nums text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label htmlFor="gst-pct" className="block text-xs font-medium text-slate-600 mb-1">
                GST (%)
              </label>
              <input
                id="gst-pct"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                value={charges.gstPercent}
                onChange={(e) =>
                  onChangeCharges({ ...charges, gstPercent: Math.max(0, Number(e.target.value)) })
                }
                className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl font-mono tabular-nums text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label htmlFor="payment-terms" className="block text-xs font-medium text-slate-600 mb-1">
                Payment Terms
              </label>
              <input
                id="payment-terms"
                type="text"
                value={charges.paymentTerms}
                onChange={(e) => onChangeCharges({ ...charges, paymentTerms: e.target.value })}
                className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Calculated Totals Breakdown */}
          <div className="pt-3 border-t border-slate-200 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Sub Total</span>
              <span className="font-mono tabular-nums font-medium text-slate-900">
                INR {formatINR(totals.subTotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Project Cost</span>
              <span className="font-mono tabular-nums font-medium text-slate-900">
                INR {formatINR(totals.totalProjectCost)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST @{charges.gstPercent}%</span>
              <span className="font-mono tabular-nums font-medium text-slate-900">
                INR {formatINR(totals.gstAmount)}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-900">Grand Total</span>
              <span className="font-mono tabular-nums text-lg font-bold text-teal-800">
                INR {formatINR(totals.grandTotal)}
              </span>
            </div>
            <p className="text-xs font-mono tabular-nums text-slate-500">
              Avg. without GST: INR {formatINR(totals.avgPricePerSqFtWithoutGst)} / Sq.ft
            </p>
          </div>
        </aside>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 pb-safe">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm inline-flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Client</span>
          </button>
          <button
            type="button"
            onClick={addWindow}
            className="min-h-[46px] px-3.5 py-2.5 rounded-xl border border-teal-700 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-sm inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Window</span>
          </button>
          <div className="hidden md:block text-right mr-auto ml-3">
            <span className="text-xs text-slate-500">Grand Total</span>
            <p className="font-mono tabular-nums text-sm font-bold text-slate-900">
              INR {formatINR(totals.grandTotal)}
            </p>
          </div>
          <button
            type="submit"
            className="flex-1 sm:flex-none sm:min-w-[200px] min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Final Rates &amp; PDF</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ApolloCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onAddFromCatalog={addFromCatalog}
      />
    </form>
  );
};

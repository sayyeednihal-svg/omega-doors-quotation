import React, { useState } from 'react';
import { BookOpen, Plus, X } from 'lucide-react';
import {
  APOLLO_COLORS_INFO,
  APOLLO_WINDOW_DOOR_CATALOG,
  ApolloCatalogEntry,
} from '../data/apolloCatalog';
import { UpvcWindowType } from '../types/quotation';

interface ApolloCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFromCatalog: (windowType: UpvcWindowType, widthMm?: number, heightMm?: number) => void;
}

export const ApolloCatalogModal: React.FC<ApolloCatalogModalProps> = ({
  isOpen,
  onClose,
  onAddFromCatalog,
}) => {
  const [filter, setFilter] = useState<'All' | 'Window' | 'Door'>('All');

  if (!isOpen) return null;

  const filteredItems = APOLLO_WINDOW_DOOR_CATALOG.filter((item) =>
    filter === 'All' ? true : item.category === filter
  );

  const handleSelectSize = (entry: ApolloCatalogEntry, widthMm?: number, heightMm?: number) => {
    onAddFromCatalog(entry.windowType, widthMm, heightMm);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apollo-catalog-title"
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-600/30 border border-teal-400/40 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-teal-300" />
            </div>
            <div className="min-w-0">
              <h2 id="apollo-catalog-title" className="text-base sm:text-lg font-bold truncate">
                APL Apollo Windows &amp; Doors — Types &amp; Sizes
              </h2>
              <p className="text-xs text-slate-300 truncate">
                Official APL Apollo uPVC systems · Custom-sized on survey + standard mm/ft apertures
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close APL Apollo catalog"
            className="min-w-[40px] min-h-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter + Sizing Note */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="inline-flex rounded-xl bg-slate-200/70 p-1">
            {(['All', 'Window', 'Door'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filter === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'All' ? 'All Systems (15)' : tab === 'Window' ? 'Windows (11)' : 'Doors (4)'}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-600">
            Tap any <span className="font-semibold text-teal-800">size preset</span> or{' '}
            <span className="font-semibold text-slate-900">+ Add</span> to insert into your quote.
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Custom Manufacturing Notice */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 text-xs text-teal-950 leading-relaxed">
            <strong>Site-Survey Custom Sizing:</strong> Per <span className="font-mono">aplapollowindows.com</span>, all APL Apollo uPVC windows and doors are custom-manufactured to exact site aperture measurements (wind load, wall depth, single/double glazing). Standard Indian architectural sizes (mm &amp; ft) below can be clicked directly or adjusted manually in Step 3.
          </div>

          {/* Product Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.windowType}
                className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-teal-600/50 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wide text-teal-800 font-semibold">
                        {item.category} · {item.series}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{item.windowType}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectSize(item)}
                      className="min-h-[34px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{item.signatureAdvantages}</p>

                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-[11px]">
                    <div>
                      <dt className="text-slate-500">Min Size</dt>
                      <dd className="font-mono font-semibold text-slate-800">{item.recommendedMinMm}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Max Size</dt>
                      <dd className="font-mono font-semibold text-slate-800">{item.recommendedMaxMm}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-slate-500">Profile Section</dt>
                      <dd className="font-mono text-slate-800">{item.profileDepth}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-slate-500">Compatible Glass</dt>
                      <dd className="text-slate-800">{item.glassRange}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-slate-500">Ideal Settings</dt>
                      <dd className="text-slate-700">{item.idealSettings}</dd>
                    </div>
                  </dl>
                </div>

                {/* Clickable Standard Size Buttons */}
                <div>
                  <span className="block text-[11px] font-medium text-slate-500 mb-1.5">
                    Quick-Add Standard Sizes:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {item.standardSizes.map((sz) => (
                      <button
                        key={sz.label}
                        type="button"
                        onClick={() => handleSelectSize(item, sz.widthMm, sz.heightMm)}
                        className="text-left px-2.5 py-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-600 rounded-lg text-[11px] font-mono text-slate-800 hover:text-teal-900 transition-colors cursor-pointer"
                      >
                        + {sz.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Official 7-Color Palette */}
          <section className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700 mb-3">
              Official APL Apollo Profile Color Palette (Brochure Pages 27–28)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {APOLLO_COLORS_INFO.map((color) => (
                <div
                  key={color.name}
                  className="border border-slate-200 rounded-xl p-2 bg-white flex flex-col items-center text-center"
                >
                  <div
                    className="w-full h-10 rounded-lg border mb-1.5"
                    style={{ backgroundColor: color.swatch, borderColor: color.border }}
                  />
                  <span className="text-[11px] font-semibold text-slate-900 leading-tight">
                    {color.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

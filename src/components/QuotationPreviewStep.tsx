import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Download, FileDown, Share2 } from 'lucide-react';
import { PricingCharges, QuotationState, WindowItem } from '../types/quotation';
import { calcQuotationTotals, formatINR, inferWindowType } from '../utils/calculations';
import { generateQuotationPdf } from '../utils/pdfGenerator';
import { WindowCadSvg } from './WindowCadSvg';

interface QuotationPreviewStepProps {
  quotation: QuotationState;
  onChangeWindows: (windows: WindowItem[]) => void;
  onChangeCharges: (charges: PricingCharges) => void;
  onSaveToHistory: (state: QuotationState) => void;
  onBack: () => void;
}

export const QuotationPreviewStep: React.FC<QuotationPreviewStepProps> = ({
  quotation,
  onChangeWindows,
  onChangeCharges,
  onSaveToHistory,
  onBack,
}) => {
  const [activePage, setActivePage] = useState<number>(1);
  const [bulkRate, setBulkRate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFile, setGeneratedFile] = useState<{
    blob: Blob;
    fileName: string;
    totalPages: number;
  } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const updateRate = (id: string, rate: number) => {
    setGeneratedFile(null);
    setStatusMessage('');
    onChangeWindows(
      quotation.windows.map((w) => (w.id === id ? { ...w, ratePerSqFt: Math.max(0, rate) } : w))
    );
  };

  const applyBulkRate = () => {
    const val = Number(bulkRate);
    if (!Number.isFinite(val) || val < 0) return;
    setGeneratedFile(null);
    setStatusMessage('');
    onChangeWindows(quotation.windows.map((w) => ({ ...w, ratePerSqFt: val })));
  };

  const updateCharge = (patch: Partial<PricingCharges>) => {
    setGeneratedFile(null);
    setStatusMessage('');
    onChangeCharges({ ...quotation.charges, ...patch });
  };

  const totals = calcQuotationTotals(quotation.windows, quotation.charges);
  const delName = quotation.client.useSeparateDelivery
    ? quotation.client.deliveryName || quotation.client.clientName
    : quotation.client.clientName;
  const delAddr = quotation.client.useSeparateDelivery
    ? quotation.client.deliveryAddress || quotation.client.siteAddress
    : quotation.client.siteAddress;
  const delMob = quotation.client.useSeparateDelivery
    ? quotation.client.deliveryMobile || quotation.client.mobile
    : quotation.client.mobile;
  const delEmail = quotation.client.useSeparateDelivery
    ? quotation.client.deliveryEmail
    : quotation.client.email;

  const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    setStatusMessage('');
    try {
      const result = await generateQuotationPdf(quotation);
      onSaveToHistory(quotation);
      setGeneratedFile({
        blob: result.blob,
        fileName: result.fileName,
        totalPages: result.totalPages,
      });
      triggerDownload(result.blob, result.fileName);
      setStatusMessage(`Saved to History & downloaded ${result.fileName} (${result.totalPages} pages).`);
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? `Failed to generate PDF: ${err.message}` : 'Failed to generate PDF.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSharePdf = async () => {
    setIsGenerating(true);
    try {
      let fileData = generatedFile;
      if (!fileData) {
        const res = await generateQuotationPdf(quotation);
        onSaveToHistory(quotation);
        fileData = { blob: res.blob, fileName: res.fileName, totalPages: res.totalPages };
        setGeneratedFile(fileData);
      }

      const file = new File([fileData.blob], fileData.fileName, { type: 'application/pdf' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Quotation ${quotation.meta.quoteNo}`,
          text: `Omega Doors Industries UPVC Window Quotation for ${delName || 'Client'}`,
          files: [file],
        });
        setStatusMessage(`Saved to History & shared ${fileData.fileName}.`);
      } else {
        triggerDownload(fileData.blob, fileData.fileName);
        setStatusMessage(`Saved to History & device downloads: ${fileData.fileName}.`);
      }
    } catch {
      // User cancelled share sheet or share unavailable; fallback ignored silently
    } finally {
      setIsGenerating(false);
    }
  };

  const pages = [
    { num: 1, label: '1 · Cover' },
    { num: 2, label: '2 · Windows' },
    { num: 3, label: '3 · Totals' },
    { num: 4, label: '4 · Offerings' },
    { num: 5, label: '5 · Terms' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-32 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Step 4 of 4 · <span className="font-mono">{quotation.meta.quoteNo}</span> (Locked)
            {quotation.meta.createdBy ? ` · Created by ${quotation.meta.createdBy}` : ''}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
            Quotation Preview
          </h1>
        </div>

        {/* Summary KPI Strip */}
        <div className="flex items-center gap-4 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-4 py-2.5">
          <div>
            <span className="text-slate-500">Windows</span>
            <p className="font-mono tabular-nums font-bold text-slate-900">{totals.totalWindows} Nos</p>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-slate-500">Area</span>
            <p className="font-mono tabular-nums font-bold text-slate-900">
              {totals.totalAreaSqFt.toFixed(2)} Sq.ft
            </p>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="text-slate-500">Grand Total</span>
            <p className="font-mono tabular-nums font-bold text-teal-800">
              INR {formatINR(totals.grandTotal)}
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-sm text-teal-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          {generatedFile && (
            <button
              type="button"
              onClick={() => triggerDownload(generatedFile.blob, generatedFile.fileName)}
              className="text-xs font-semibold text-teal-800 underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Download again
            </button>
          )}
        </div>
      )}

      {/* Finalize Per Sq.Ft Rates & Charges Before PDF Download */}
      <section className="mb-5 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Finalize Per Sq.Ft Rates Before Generating PDF
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter or confirm each window’s manual rate per sq.ft and final charges before downloading.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={bulkRate}
              onChange={(e) => setBulkRate(e.target.value)}
              placeholder="Same rate for all"
              aria-label="Apply same per square foot rate to all windows"
              className="w-36 min-h-[42px] px-3 py-1.5 border border-slate-300 rounded-xl font-mono tabular-nums text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <button
              type="button"
              onClick={applyBulkRate}
              className="min-h-[42px] px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
            >
              Apply All
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {totals.lines.map(({ item, areaSqFt, lineAmount }, idx) => (
            <div
              key={item.id}
              className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {idx + 1}. {item.location || item.code || `Window ${idx + 1}`}
                </p>
                <p className="text-xs font-mono text-slate-500">
                  {item.widthMm}×{item.heightMm}mm · Qty {item.quantity} · {areaSqFt.toFixed(2)} Sq.ft
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`final-rate-${item.id}`}
                    className="text-xs font-medium text-slate-600 whitespace-nowrap"
                  >
                    Rate / Sq.ft
                  </label>
                  <input
                    id={`final-rate-${item.id}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={item.ratePerSqFt || ''}
                    onChange={(e) =>
                      updateRate(item.id, e.target.value === '' ? 0 : Number(e.target.value))
                    }
                    placeholder="0.00"
                    className="w-28 min-h-[44px] px-3 py-1.5 border border-slate-300 rounded-xl font-mono tabular-nums text-sm text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div className="min-w-[105px] text-right">
                  <span className="block text-[10px] text-slate-500">Amount</span>
                  <span className="font-mono tabular-nums text-sm font-bold text-teal-800">
                    INR {formatINR(lineAmount)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Discount ({quotation.charges.discountMode === 'percent' ? '%' : 'INR'})
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={quotation.charges.discountValue}
              onChange={(e) =>
                updateCharge({ discountValue: e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)) })
              }
              className="w-full min-h-[42px] px-3 py-1.5 border border-slate-300 rounded-xl font-mono tabular-nums text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Transportation (INR)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={quotation.charges.transportationCost}
              onChange={(e) =>
                updateCharge({ transportationCost: e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)) })
              }
              className="w-full min-h-[42px] px-3 py-1.5 border border-slate-300 rounded-xl font-mono tabular-nums text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              GST (%)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              value={quotation.charges.gstPercent}
              onChange={(e) =>
                updateCharge({ gstPercent: e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)) })
              }
              className="w-full min-h-[42px] px-3 py-1.5 border border-slate-300 rounded-xl font-mono tabular-nums text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">
              Payment Terms
            </label>
            <input
              type="text"
              value={quotation.charges.paymentTerms}
              onChange={(e) => updateCharge({ paymentTerms: e.target.value })}
              placeholder="100% Advance"
              className="w-full min-h-[42px] px-3 py-1.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <span>
            Total Project Cost (Excl. GST):{' '}
            <strong className="font-mono text-slate-900">INR {formatINR(totals.totalProjectCost)}</strong>
          </span>
          <span>
            Avg. price per Sqft without GST:{' '}
            <strong className="font-mono text-teal-800">
              INR {formatINR(totals.avgPricePerSqFtWithoutGst)}
            </strong>
          </span>
        </div>
      </section>

      {/* 5-Page Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4">
        {pages.map((p) => (
          <button
            key={p.num}
            type="button"
            onClick={() => setActivePage(p.num)}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activePage === p.num
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Live A4 Sheet Preview */}
      <div className="bg-white border border-slate-300 rounded-xl shadow-sm p-4 sm:p-8 text-slate-900 overflow-x-auto">
        {/* PAGE 1 PREVIEW */}
        {activePage === 1 && (
          <div className="min-w-[640px] max-w-[780px] mx-auto space-y-5 text-xs">
            <div className="flex items-start justify-between gap-4">
              <img
                src="/assets/quotation/omega-logo.jpg"
                alt="Omega"
                referrerPolicy="no-referrer"
                className="w-20 h-20 object-contain"
              />
              <div className="text-center leading-snug">
                <h2 className="text-base font-bold">Quotation-Material</h2>
                <p className="font-bold mt-1">Omega Doors Industries</p>
                <p>Gat No. 177, Laxmi Complex, Talwade Nigdi Road, Ganesh Nagar,</p>
                <p>Talwade, Pimpri Chinchwad, Pune 411062, Maharashtra MH</p>
                <p>Contact No. : +91 9225537971</p>
                <p>Email : info@omegagroupofindustries.com</p>
                <p>GSTIN : 27ERFPS3275D2ZJ</p>
              </div>
              <img
                src="/assets/quotation/apl-apollo-logo.jpg"
                alt="APL Apollo"
                referrerPolicy="no-referrer"
                className="w-28 h-24 object-contain"
              />
            </div>

            <div className="border border-slate-400">
              <div className="grid grid-cols-2 border-b border-slate-400 font-bold">
                <div className="px-2 py-1 border-r border-slate-400">To</div>
                <div className="px-2 py-1">Deliver To</div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-2 border-r border-slate-400 font-semibold space-y-1">
                  <p>{quotation.client.clientName || '-'}</p>
                  <p className="pt-1">{quotation.client.siteAddress || '-'}</p>
                  <p>Contact No.: {quotation.client.mobile || '-'}</p>
                  <p>Email Id: {quotation.client.email}</p>
                </div>
                <div className="p-2 font-semibold space-y-1">
                  <p>{delName || '-'}</p>
                  <p className="pt-1">{delAddr || '-'}</p>
                  <p>Contact No.: {delMob || '-'}</p>
                  <p>Email Id: {delEmail}</p>
                </div>
              </div>
              <div className="grid grid-cols-5 border-t border-slate-400 text-center">
                {['Quote No.', 'Quote Date', 'Modified On', 'Valid Upto', 'Responsible'].map((h, i) => (
                  <div key={h} className={`px-1 py-1 font-bold ${i < 4 ? 'border-r border-slate-400' : ''}`}>
                    {h}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 border-t border-slate-400 text-center font-mono text-[11px]">
                {[
                  quotation.meta.quoteNo,
                  quotation.meta.quoteDate,
                  quotation.meta.modifiedOn,
                  quotation.meta.validUpto,
                  quotation.meta.responsible,
                ].map((v, i) => (
                  <div key={i} className={`px-1 py-1.5 ${i < 4 ? 'border-r border-slate-400' : ''}`}>
                    {v}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 leading-relaxed text-[12px]">
              <p>Dear Sir/Mam,</p>
              <p className="font-bold">
                We’re pleased to know that you are considering APL APOLLO Doors and Windows for your premises.
              </p>
              <p>
                APL Apollo is committed to delivering superior quality solutions right to your doorstep—engineered to offer enhanced protection against noise, heat, rain, dust, and pollution making it the preferred choice for contemporary living and work environments.
              </p>
              <p>
                In preparing this proposal, our objective has been to recommend designs that not only enhance interior comfort and aesthetics but also elevate the external appearance of your building.
              </p>
              <p>
                With a well-established and responsive service network, APL Apollo ensures a smooth and hassle-free experience right from selection to installation, delivered directly to your doorstep. Please find enclosed our detailed proposal for your kind consideration.
              </p>
              <div className="pl-6 space-y-1">
                <p>a) Window design, specification and value</p>
                <p>b) Terms and conditions of Contract</p>
                <p>c) Floor Plan and Route map to site</p>
              </div>
              <p>We are looking forward to getting your approval on the submitted quotation.</p>
              <div className="pt-2">
                <p>For</p>
                <p className="font-bold">Omega Doors Industries,</p>
              </div>
              <div className="pt-6">
                {quotation.meta.createdBy && (
                  <p className="font-semibold">Created By : {quotation.meta.createdBy}</p>
                )}
                <p>Omega Doors Industries</p>
                <p>+91 9225537971</p>
              </div>
            </div>

            <div className="pt-4">
              <img
                src="/assets/quotation/footer-banner.jpg"
                alt="Certifications"
                referrerPolicy="no-referrer"
                className="w-3/4 mx-auto h-auto object-contain"
              />
              <div className="flex justify-between text-[11px] font-bold mt-2">
                <span>1 of 5</span>
                <span>powered by EvA WinOptimize Software</span>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 2 PREVIEW */}
        {activePage === 2 && (
          <div className="min-w-[660px] max-w-[780px] mx-auto space-y-3 text-xs">
            <div className="border border-slate-400">
              <div className="grid grid-cols-5 text-center font-bold border-b border-slate-400">
                {['Quote No.', 'Quote Date', 'Modified On', 'Valid Upto', 'Responsible'].map((h, i) => (
                  <div key={h} className={`py-1 ${i < 4 ? 'border-r border-slate-400' : ''}`}>
                    {h}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 text-center border-b border-slate-400 font-mono text-[11px]">
                {[
                  quotation.meta.quoteNo,
                  quotation.meta.quoteDate,
                  quotation.meta.modifiedOn,
                  quotation.meta.validUpto,
                  quotation.meta.responsible,
                ].map((v, i) => (
                  <div key={i} className={`py-1 ${i < 4 ? 'border-r border-slate-400' : ''}`}>
                    {v}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-12 font-bold border-b border-slate-400">
                <div className="col-span-5 px-2 py-1 border-r border-slate-400">Sales Line</div>
                <div className="col-span-7 px-2 py-1">Details</div>
              </div>

              {totals.lines.map(({ item, areaSqFt, lineAmount }, idx) => {
                const isSliding = item.series.includes('SLIDING');
                const unitRate = item.quantity > 0 ? lineAmount / item.quantity : lineAmount;
                return (
                  <div key={item.id} className="grid grid-cols-12 border-b border-slate-400 last:border-b-0">
                    <div className="col-span-5 p-2 border-r border-slate-400 flex flex-col justify-between">
                      <div className="flex justify-between gap-2 text-[11px]">
                        <span>
                          {idx + 1}. {item.series}
                        </span>
                        <span className="font-bold whitespace-nowrap">
                          Size: {item.widthMm}mm X {item.heightMm}mm
                        </span>
                      </div>
                      <div className="my-1 px-2">
                        <WindowCadSvg
                          series={item.series}
                          windowType={inferWindowType(item)}
                          widthMm={item.widthMm}
                          heightMm={item.heightMm}
                          hasMesh={item.meshType !== '' && item.meshType.toLowerCase() !== 'no'}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>Area : {areaSqFt.toFixed(2)}Sq.ft.</span>
                        <span>View From Inside</span>
                        <span>Wt. {item.weightKg.toFixed(3)} Kg</span>
                      </div>
                    </div>

                    <div className="col-span-7 flex flex-col justify-between text-[10.5px]">
                      <div>
                        <div className="grid grid-cols-2 border-b border-slate-400 font-bold">
                          <div className="px-2 py-1 border-r border-slate-400">Code : {item.code}</div>
                          <div className="px-2 py-1">Location : {item.location}</div>
                        </div>
                        <div className="grid grid-cols-2 border-b border-slate-400 bg-slate-300/70 font-bold">
                          <div className="px-2 py-0.5 border-r border-slate-400">Materials</div>
                          <div className="px-2 py-0.5">Accessories</div>
                        </div>
                        <div className="grid grid-cols-2 text-[10px] leading-tight">
                          <div className="p-1.5 border-r border-slate-400 space-y-0.5">
                            <p><strong>Type :</strong> {inferWindowType(item)}</p>
                            <p><strong>Profile Color :</strong> {item.profileColor}</p>
                            <p><strong>MeshType :</strong> {item.meshType || 'No'}</p>
                            <p><strong>Glass :</strong> {item.glass}</p>
                            <p><strong>{isSliding ? 'Track' : 'Outer'} :</strong> {item.outerFrame}</p>
                            <p><strong>{isSliding ? 'Track RI' : 'Outer RI'} :</strong> {item.outerRI}</p>
                            <p><strong>{isSliding ? 'Sliding Sash' : 'Casement Sash'} :</strong> {item.sash}</p>
                            <p><strong>{isSliding ? 'Sliding RI' : 'Casement RI'} :</strong> {item.sashRI}</p>
                            {item.flymeshSash && <p><strong>Flymesh Sash :</strong> {item.flymeshSash}</p>}
                            {item.guideRail && <p><strong>Guide Rail :</strong> {item.guideRail}</p>}
                          </div>
                          <div className="p-1.5 space-y-0.5">
                            <p><strong>Handle Type :</strong> {item.handleType}</p>
                            <p><strong>Locking :</strong> {item.locking}</p>
                            <p><strong>Handle color :</strong> {item.handleColor}</p>
                            <p><strong>{isSliding ? 'Roller' : 'Friction Stay'} :</strong> {item.frictionStayOrRoller}</p>
                            {item.flymeshHandle && <p><strong>Flymesh Handle :</strong> {item.flymeshHandle}</p>}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-400 grid grid-cols-4 text-center">
                        {['Qty', 'Per Sq.ft', 'Rate', 'Amount'].map((h, i) => (
                          <div key={h} className={`py-0.5 border-b border-slate-400 ${i < 3 ? 'border-r border-slate-400' : ''}`}>
                            {h}
                          </div>
                        ))}
                        <div className="py-0.5 border-r border-slate-400 font-mono">{item.quantity}</div>
                        <div className="py-0.5 border-r border-slate-400 font-mono">{item.ratePerSqFt} INR</div>
                        <div className="py-0.5 border-r border-slate-400 font-mono">{formatINR(unitRate)}</div>
                        <div className="py-0.5 font-mono">{formatINR(lineAmount)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4">
              <img
                src="/assets/quotation/footer-banner.jpg"
                alt="Certifications"
                referrerPolicy="no-referrer"
                className="w-3/4 mx-auto h-auto object-contain"
              />
              <div className="flex justify-between text-[11px] font-bold mt-2">
                <span>2 of 5</span>
                <span>powered by EvA WinOptimize Software</span>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 3 PREVIEW */}
        {activePage === 3 && (
          <div className="min-w-[600px] max-w-[780px] mx-auto space-y-6 text-xs">
            <div className="grid grid-cols-12 gap-6 items-start">
              <div className="col-span-5 space-y-1.5">
                <p className="font-bold">Total:</p>
                <p>Total Area : {totals.totalAreaSqFt.toFixed(3)} Sq.Ft.</p>
                <p>Total Windows : {totals.totalWindows} Nos</p>
                <p>Avg. price per Sqft without GST : INR {formatINR(totals.avgPricePerSqFtWithoutGst)}</p>
                <p className="pt-2">
                  <strong>Payment Terms :</strong> {quotation.charges.paymentTerms}
                </p>
              </div>

              <div className="col-span-7 space-y-4">
                <table className="w-full border-collapse border border-slate-400 font-mono tabular-nums text-[11.5px]">
                  <tbody>
                    {[
                      ['Basic Value', formatINR(totals.basicValue), false],
                      ['Discount', totals.discountAmount > 0 ? `-${formatINR(totals.discountAmount)}` : '0.00', false],
                      ['Sub Total', formatINR(totals.subTotal), true],
                      ['Transportation Cost', formatINR(totals.transportationCost), false],
                      ['Total Project Cost', formatINR(totals.totalProjectCost), true],
                      [`Gst @${quotation.charges.gstPercent}%`, formatINR(totals.gstAmount), false],
                      ['Grand Total', formatINR(totals.grandTotal), true],
                    ].map(([label, val, bold]) => (
                      <tr key={String(label)} className="border-b border-slate-400">
                        <td className={`px-2 py-1 border-r border-slate-400 font-sans ${bold ? 'font-bold' : ''}`}>
                          {label}
                        </td>
                        <td className="px-1.5 py-1 border-r border-slate-400 text-center">:</td>
                        <td className="px-2 py-1 border-r border-slate-400 font-sans font-bold">INR</td>
                        <td className={`px-2 py-1 text-right ${bold ? 'font-bold' : ''}`}>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="pl-2">• Any Change in taxes will be borne by customer</p>

                <div className="pt-4 grid grid-cols-2 gap-6">
                  <div className="border-t border-slate-500 pt-1">
                    <p>Signed by Client</p>
                    <p className="font-bold mt-2">{delName || '-'}</p>
                    <p>Email : {delEmail}</p>
                    <p>Contact No. : {delMob || '-'}</p>
                  </div>
                  <div className="border-t border-slate-500 pt-1">
                    <p>Date</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-12">
              <img
                src="/assets/quotation/footer-banner.jpg"
                alt="Certifications"
                referrerPolicy="no-referrer"
                className="w-3/4 mx-auto h-auto object-contain"
              />
              <div className="flex justify-between text-[11px] font-bold mt-2">
                <span>3 of 5</span>
                <span>powered by EvA WinOptimize Software</span>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 4 PREVIEW */}
        {activePage === 4 && (
          <div className="min-w-[580px] max-w-[780px] mx-auto space-y-5 text-center">
            <h2 className="text-lg font-medium">Apollo Offerings</h2>
            <img
              src="/assets/quotation/offering-top.png"
              alt="Apollo Offerings"
              referrerPolicy="no-referrer"
              className="w-60 mx-auto h-auto object-contain"
            />
            <div className="grid grid-cols-2 gap-8 px-6">
              <img
                src="/assets/quotation/offering-left.png"
                alt="Casement and Door Systems"
                referrerPolicy="no-referrer"
                className="w-52 mx-auto h-auto object-contain"
              />
              <img
                src="/assets/quotation/offering-right.png"
                alt="Sliding Balcony Doors"
                referrerPolicy="no-referrer"
                className="w-52 mx-auto h-auto object-contain"
              />
            </div>
            <img
              src="/assets/quotation/offering-bottom.png"
              alt="Living Room Sliding System"
              referrerPolicy="no-referrer"
              className="w-72 mx-auto h-auto object-contain"
            />

            <h2 className="text-lg font-medium pt-2">Profile Color’s</h2>
            <img
              src="/assets/quotation/profile-colors.png"
              alt="Profile Colors"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-contain"
            />

            <div className="pt-4">
              <img
                src="/assets/quotation/footer-banner.jpg"
                alt="Certifications"
                referrerPolicy="no-referrer"
                className="w-3/4 mx-auto h-auto object-contain"
              />
              <div className="flex justify-between text-[11px] font-bold mt-2">
                <span>4 of 5</span>
                <span>powered by EvA WinOptimize Software</span>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 5 PREVIEW */}
        {activePage === 5 && (
          <div className="min-w-[600px] max-w-[780px] mx-auto space-y-4 text-[11px] leading-relaxed">
            <div>
              <h3 className="font-bold underline mb-1.5">Terms and Conditions:-</h3>
              <ol className="pl-6 space-y-1">
                <li>
                  1. Payments terms: -
                  <div className="pl-6">
                    <p>a. 100% Advance along with order, if it is less than INR 100000.</p>
                    <p>b. 50% advance along with order, 50% before delivery, if it is more than INR 100000.</p>
                  </div>
                </li>
                <li>2. Validation of quote 30 days, total execution of project should be completed latest by 3-months.</li>
                <li>
                  3. P.O &amp; Payments should made in the name of <strong>Omega Doors Industries.</strong>
                </li>
                <li>
                  4. The prices are based on the sizes provided by the customer. The prices are valid for variation in sizes up to +/- 30mm per window provided the design and style of product remains unchanged. The customer will be charged on pro-rate basis for difference between the actual sizes and given sizes, if any, beyond the above variation.
                </li>
                <li>5. After handovering the windows, cleaning not our scope.</li>
                <li>
                  6. Windows security tape should be remove while installing windows freely, After installation security tape will be removed by us that should be chargeable per window INR 100.
                </li>
                <li>7. If any other commitments given by our sales team, before placing order please call us . Cell : +91 9225537971</li>
                <li>8. After handovering windows, If any service require related to windows &amp; doors , that should be chargeable. Per visit - INR 350.</li>
                <li>9. Material unloading &amp; storage should be your scope.</li>
                <li>10. All disputes shall be subject jurisdiction only.</li>
              </ol>
            </div>

            <div>
              <h3 className="font-bold underline mb-1.5">Pre-Requisites for installation of Windows:-</h3>
              <ol className="pl-6 space-y-1">
                <li>1. Walls should be plastered from inside and outside, with inside POP complete.</li>
                <li>2. All jams, sills and soffits should be plastered.</li>
                <li>3. Flooring (where doors have to be installed) should be complete.</li>
                <li>4. Aperture should be smooth.</li>
                <li>5. Base and top of window should be water leveled and sides should be in vertical plump.</li>
                <li>6. Sill width should be more than the window width.</li>
                <li>7. Opening should be accessible from inside for installation.</li>
                <li>
                  8. Grills: Adequate care should be taken if grills have to be installed.
                  <div className="pl-6">
                    <p>
                      a. <strong>For Horizontal slider Window:</strong> Grill should be provided on the outer face of slider before the installation of the window.
                    </p>
                    <p>
                      b. <strong>For Casement windows:</strong> Screw type grill is recommended after installation of casement window.
                    </p>
                  </div>
                </li>
                <li>9. Installation should happen before the last coat of paint. At least one coat of paint should be done before installation begins.</li>
                <li>10. Scaffoldings/ bracing should not interrupt the window openings where openings where windows are supposed to be installed.</li>
              </ol>
            </div>

            <p className="pt-2">
              I hereby accept the estimate as per above mentioned price and specifications. I have read and understood the terms &amp; conditions and agree to them.
            </p>

            <div className="flex justify-between pt-8 font-medium">
              <span>Authorized Signatory</span>
              <span>Signature of Customer</span>
            </div>

            <div className="pt-6">
              <img
                src="/assets/quotation/footer-banner.jpg"
                alt="Certifications"
                referrerPolicy="no-referrer"
                className="w-3/4 mx-auto h-auto object-contain"
              />
              <div className="flex justify-between text-[11px] font-bold mt-2">
                <span>5 of 5</span>
                <span>powered by EvA WinOptimize Software</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Generate & Share PDF Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 pb-safe">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm inline-flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Windows</span>
          </button>

          <button
            type="button"
            onClick={handleSharePdf}
            disabled={isGenerating}
            className="min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={isGenerating}
            className="flex-1 sm:flex-none sm:min-w-[220px] min-h-[48px] px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <span>Generating PDF...</span>
            ) : generatedFile ? (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>Generate PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

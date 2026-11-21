import React from 'react';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { ClientInfo, QuotationMeta } from '../types/quotation';
import { CREATED_BY_OPTIONS, PROJECT_TYPE_OPTIONS } from '../utils/calculations';

interface ClientInfoStepProps {
  client: ClientInfo;
  meta: QuotationMeta;
  onChangeClient: (updated: ClientInfo) => void;
  onChangeMeta: (updated: QuotationMeta) => void;
  onBack: () => void;
  onNext: () => void;
}

export const ClientInfoStep: React.FC<ClientInfoStepProps> = ({
  client,
  meta,
  onChangeClient,
  onChangeMeta,
  onBack,
  onNext,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 pt-6 pb-28 sm:px-6">
      <div className="mb-6">
        <p className="text-xs font-medium text-slate-500">Step 2 of 4 · UPVC Window</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">
          Client &amp; Quotation Details
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter billing contact, site address, and optional delivery recipient details.
        </p>
      </div>

      <div className="space-y-5">
        {/* Quotation Metadata */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Quotation Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="quote-no" className="block text-xs font-medium text-slate-600 mb-1">
                Quote No. (Locked)
              </label>
              <div className="relative">
                <input
                  id="quote-no"
                  type="text"
                  value={meta.quoteNo}
                  readOnly
                  aria-readonly="true"
                  tabIndex={-1}
                  className="w-full min-h-[44px] pl-3.5 pr-9 py-2 bg-slate-100 border border-slate-300 rounded-xl font-mono text-sm font-semibold text-slate-700 cursor-not-allowed select-all focus:outline-none"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 pointer-events-none"
                >
                  <Lock className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
            <div>
              <label htmlFor="created-by" className="block text-xs font-medium text-slate-600 mb-1">
                Quotation Created By *
              </label>
              <select
                id="created-by"
                value={meta.createdBy || ''}
                onChange={(e) => onChangeMeta({ ...meta, createdBy: e.target.value })}
                required
                className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="" disabled>
                  Select person...
                </option>
                {CREATED_BY_OPTIONS.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="quote-date" className="block text-xs font-medium text-slate-600 mb-1">
                Quote Date
              </label>
              <input
                id="quote-date"
                type="text"
                value={meta.quoteDate}
                onChange={(e) => onChangeMeta({ ...meta, quoteDate: e.target.value })}
                placeholder="DD-MM-YYYY"
                className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>
            <div>
              <label htmlFor="valid-upto" className="block text-xs font-medium text-slate-600 mb-1">
                Valid Upto
              </label>
              <input
                id="valid-upto"
                type="text"
                value={meta.validUpto}
                onChange={(e) => onChangeMeta({ ...meta, validUpto: e.target.value })}
                placeholder="DD-MM-YYYY"
                className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>
            <div>
              <label htmlFor="responsible" className="block text-xs font-medium text-slate-600 mb-1">
                Responsible
              </label>
              <input
                id="responsible"
                type="text"
                value={meta.responsible}
                onChange={(e) => onChangeMeta({ ...meta, responsible: e.target.value })}
                className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label htmlFor="project-type" className="block text-xs font-medium text-slate-600 mb-1">
                UPVC Project Type
              </label>
              <select
                id="project-type"
                value={meta.projectType || 'All UPVC Windows & Doors'}
                onChange={(e) => onChangeMeta({ ...meta, projectType: e.target.value })}
                className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {PROJECT_TYPE_OPTIONS.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Client (To) Information */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Client Information (To)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="client-name" className="block text-xs font-medium text-slate-600 mb-1">
                Client Name *
              </label>
              <input
                id="client-name"
                type="text"
                value={client.clientName}
                onChange={(e) => onChangeClient({ ...client, clientName: e.target.value })}
                placeholder="e.g. Mr. Nitin Rathore / Company Name"
                className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label htmlFor="client-mobile" className="block text-xs font-medium text-slate-600 mb-1">
                Mobile Number *
              </label>
              <input
                id="client-mobile"
                type="tel"
                value={client.mobile}
                onChange={(e) => onChangeClient({ ...client, mobile: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>

            <div>
              <label htmlFor="client-email" className="block text-xs font-medium text-slate-600 mb-1">
                Email Address
              </label>
              <input
                id="client-email"
                type="email"
                value={client.email}
                onChange={(e) => onChangeClient({ ...client, email: e.target.value })}
                placeholder="client@example.com"
                className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="site-address" className="block text-xs font-medium text-slate-600 mb-1">
                Site Address *
              </label>
              <textarea
                id="site-address"
                rows={2}
                value={client.siteAddress}
                onChange={(e) => onChangeClient({ ...client, siteAddress: e.target.value })}
                placeholder="Enter full site / billing address"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                required
              />
            </div>
          </div>
        </section>

        {/* Optional Separate Delivery Address */}
        <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Delivery Address (Deliver To)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enable if the delivery recipient or site differs from the billing client.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer min-h-[44px] px-1">
              <input
                type="checkbox"
                checked={client.useSeparateDelivery}
                onChange={(e) =>
                  onChangeClient({ ...client, useSeparateDelivery: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[12px] after:left-[6px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-700" />
            </label>
          </div>

          {client.useSeparateDelivery && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="del-name" className="block text-xs font-medium text-slate-600 mb-1">
                  Delivery Contact Name
                </label>
                <input
                  id="del-name"
                  type="text"
                  value={client.deliveryName}
                  onChange={(e) => onChangeClient({ ...client, deliveryName: e.target.value })}
                  placeholder="Recipient name"
                  className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div>
                <label htmlFor="del-mobile" className="block text-xs font-medium text-slate-600 mb-1">
                  Delivery Contact Number
                </label>
                <input
                  id="del-mobile"
                  type="tel"
                  value={client.deliveryMobile}
                  onChange={(e) => onChangeClient({ ...client, deliveryMobile: e.target.value })}
                  placeholder="+91 9390416634"
                  className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div>
                <label htmlFor="del-email" className="block text-xs font-medium text-slate-600 mb-1">
                  Delivery Email Address
                </label>
                <input
                  id="del-email"
                  type="email"
                  value={client.deliveryEmail}
                  onChange={(e) => onChangeClient({ ...client, deliveryEmail: e.target.value })}
                  placeholder="Optional"
                  className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="del-address" className="block text-xs font-medium text-slate-600 mb-1">
                  Delivery Address
                </label>
                <textarea
                  id="del-address"
                  rows={2}
                  value={client.deliveryAddress}
                  onChange={(e) => onChangeClient({ ...client, deliveryAddress: e.target.value })}
                  placeholder="Enter delivery site address"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 pb-safe">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm inline-flex items-center gap-2 hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Product</span>
          </button>
          <button
            type="submit"
            className="flex-1 sm:flex-none sm:min-w-[210px] min-h-[46px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Add Windows &amp; Pricing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  );
};

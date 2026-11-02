import React, { useState } from 'react';
import { ShieldCheckIcon, RefreshIcon } from '../Icons';
import { checkCustomerFraud, getCachedFraudReport } from '../../lib/fraudCheck';
import { RISK_COPY, toLocalBdPhone, type FraudReport, type RiskLevel } from '../../utils/fraudCheck';

const BADGE: Record<RiskLevel, string> = {
  safe: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  caution: 'bg-amber-50 text-amber-800 border-amber-300',
  danger: 'bg-rose-50 text-rose-800 border-rose-300',
  unknown: 'bg-stone-100 text-stone-700 border-stone-300',
};

const DOT: Record<RiskLevel, string> = {
  safe: 'bg-emerald-500',
  caution: 'bg-amber-500',
  danger: 'bg-rose-500',
  unknown: 'bg-stone-400',
};

const fmt = (n: number | null): string => (n === null ? '-' : String(n));
const pct = (n: number | null): string => (n === null ? '-' : `${Math.round(n * 100) / 100}%`);

interface Props {
  phone: string;
  /** compact = order table row, full = order details popup */
  variant?: 'compact' | 'full';
}

export const FraudCheck: React.FC<Props> = ({ phone, variant = 'compact' }) => {
  const [report, setReport] = useState<FraudReport | null>(() => getCachedFraudReport(phone));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validPhone = toLocalBdPhone(phone) !== null;

  const run = async (force: boolean) => {
    setLoading(true);
    setError(null);
    try {
      setReport(await checkCustomerFraud(phone, { force }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not run the fraud check.');
    } finally {
      setLoading(false);
    }
  };

  if (!report) {
    return (
      <div className={variant === 'full' ? 'space-y-2' : 'mt-1.5'}>
        <button
          type="button"
          onClick={() => run(false)}
          disabled={loading || !validPhone}
          title={validPhone ? 'Check this customer\'s delivery history with BD Courier' : 'Not a valid Bangladesh mobile number'}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-[11px] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ShieldCheckIcon size={12} />
          <span>{loading ? 'Checking...' : 'Fraud check'}</span>
        </button>
        {!validPhone && <p className="text-[11px] text-stone-500">This phone number looks invalid.</p>}
        {error && (
          <p role="alert" className="text-[11px] text-rose-700 font-medium">
            {error}
          </p>
        )}
      </div>
    );
  }

  const copy = RISK_COPY[report.risk];
  const s = report.summary;

  if (variant === 'compact') {
    return (
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-bold ${BADGE[report.risk]}`}
          title={copy.hint}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${DOT[report.risk]}`} />
          {copy.label}
        </span>
        {s && s.successRatio !== null && (
          <span className="text-[11px] text-stone-500 tabular-nums">
            {pct(s.successRatio)} success{s.total !== null ? ` of ${s.total}` : ''}
          </span>
        )}
        <button
          type="button"
          onClick={() => run(true)}
          disabled={loading}
          className="p-1 text-stone-400 hover:text-stone-800 rounded disabled:opacity-50"
          title="Check again"
          aria-label="Check again"
        >
          <RefreshIcon size={12} />
        </button>
        {error && (
          <span role="alert" className="text-[11px] text-rose-700 font-medium w-full">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={`p-3 rounded-xl border ${BADGE[report.risk]}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <span className={`w-2.5 h-2.5 rounded-full ${DOT[report.risk]}`} />
            {copy.label}
          </div>
          <button
            type="button"
            onClick={() => run(true)}
            disabled={loading}
            className="inline-flex items-center gap-1 text-[11px] font-bold underline disabled:opacity-50"
          >
            <RefreshIcon size={11} />
            {loading ? 'Checking...' : 'Check again'}
          </button>
        </div>
        <p className="mt-1 text-[11px] font-medium">{copy.hint}</p>
        {report.riskLabel && (
          <p className="mt-1 text-[10px] opacity-70">BD Courier risk level: {report.riskLabel}</p>
        )}
      </div>

      {s && (
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            ['Parcels', fmt(s.total)],
            ['Delivered', fmt(s.success)],
            ['Cancelled', fmt(s.cancel)],
            ['Success', pct(s.successRatio)],
          ].map(([label, value]) => (
            <div key={label} className="bg-stone-50 border border-stone-200 rounded-lg py-2">
              <div className="font-bold text-stone-900 tabular-nums">{value}</div>
              <div className="text-[10px] text-stone-500">{label}</div>
            </div>
          ))}
        </div>
      )}

      {report.couriers.length > 0 && (
        <div className="overflow-x-auto border border-stone-200 rounded-lg">
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="bg-stone-50 text-stone-600">
                <th className="py-1.5 px-2 font-bold">Courier</th>
                <th className="py-1.5 px-2 font-bold text-right">Parcels</th>
                <th className="py-1.5 px-2 font-bold text-right">Delivered</th>
                <th className="py-1.5 px-2 font-bold text-right">Cancelled</th>
                <th className="py-1.5 px-2 font-bold text-right">Success</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {report.couriers.map((c) => (
                <tr key={c.courier}>
                  <td className="py-1.5 px-2 font-semibold capitalize">{c.courier}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmt(c.total)}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmt(c.success)}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmt(c.cancel)}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{pct(c.successRatio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <details className="text-[11px] text-stone-500">
        <summary className="cursor-pointer font-semibold">Raw response from BD Courier</summary>
        <pre className="mt-1.5 p-2 bg-stone-50 border border-stone-200 rounded-lg overflow-x-auto max-h-48 text-[10px] text-stone-700">
          {JSON.stringify(report.raw, null, 2)}
        </pre>
      </details>

      {error && (
        <p role="alert" className="text-[11px] text-rose-700 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

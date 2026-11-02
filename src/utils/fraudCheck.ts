import { phoneDigits } from './orderTracking';

// Helpers for the admin "Fraud check" button. Pure functions only (no React, no network),
// so they can be unit tested. The network call lives in src/lib/fraudCheck.ts.
//
// BD Courier's `risk_level` field drives the badge. The per-courier numbers are read
// defensively (a few common field names) because the response can contain more than we
// show; anything we do not recognise is still available under "Raw response" in the UI.

export type RiskLevel = 'safe' | 'caution' | 'danger' | 'unknown';

export interface CourierStat {
  courier: string;
  success: number | null;
  cancel: number | null;
  total: number | null;
  /** 0-100 */
  successRatio: number | null;
}

export interface FraudReport {
  risk: RiskLevel;
  /** exactly what BD Courier sent in risk_level, for display */
  riskLabel: string | null;
  summary: CourierStat | null;
  couriers: CourierStat[];
  raw: unknown;
}

/** "+880 1712-345678", "8801712345678", "১৭১২৩৪৫৬৭৮" -> "01712345678", or null when it is not a BD mobile. */
export function toLocalBdPhone(input: string): string | null {
  const digits = phoneDigits(input);
  let local = digits;
  if (digits.startsWith('880') && digits.length === 13) local = `0${digits.slice(3)}`;
  else if (digits.length === 10 && digits.startsWith('1')) local = `0${digits}`;
  return /^01[3-9]\d{8}$/.test(local) ? local : null;
}

const DANGER = new Set(['danger', 'dangerous', 'high', 'high_risk', 'highrisk', 'risky', 'fraud', 'block', 'blocked']);
const CAUTION = new Set(['warning', 'warn', 'medium', 'moderate', 'caution', 'suspicious', 'medium_risk', 'mediumrisk']);
const SAFE = new Set(['safe', 'low', 'low_risk', 'lowrisk', 'trusted', 'good', 'normal', 'ok']);

export function mapRiskLevel(value: unknown): RiskLevel {
  if (typeof value !== 'string') return 'unknown';
  const v = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (DANGER.has(v)) return 'danger';
  if (CAUTION.has(v)) return 'caution';
  if (SAFE.has(v)) return 'safe';
  return 'unknown';
}

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

function toNum(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function pickNum(o: Obj, keys: string[]): number | null {
  for (const k of keys) {
    const n = toNum(o[k]);
    if (n !== null) return n;
  }
  return null;
}

const SUCCESS_KEYS = ['success', 'success_parcel', 'success_parcels', 'delivered', 'total_success', 'total_delivered'];
const CANCEL_KEYS = ['cancel', 'cancelled', 'canceled', 'cancel_parcel', 'cancelled_parcel', 'returned', 'total_cancel', 'total_cancelled'];
const TOTAL_KEYS = ['total', 'total_parcel', 'total_parcels', 'total_deliveries', 'total_delivery', 'parcels'];
const RATIO_KEYS = ['success_ratio', 'success_rate', 'delivery_ratio', 'delivery_rate'];

const SUMMARY_NAMES = new Set(['summary', 'aggregate', 'overall', 'total', 'all', 'combined']);

function readStat(courier: string, o: Obj): CourierStat | null {
  const success = pickNum(o, SUCCESS_KEYS);
  const cancel = pickNum(o, CANCEL_KEYS);
  let total = pickNum(o, TOTAL_KEYS);
  let ratio = pickNum(o, RATIO_KEYS);
  if (success === null && cancel === null && total === null && ratio === null) return null;
  if (total === null && success !== null && cancel !== null) total = success + cancel;
  if (ratio === null && total !== null && total > 0 && success !== null) {
    ratio = Math.round((success / total) * 10000) / 100;
  }
  return { courier, success, cancel, total, successRatio: ratio };
}

/** Turns whatever BD Courier answered into something the UI can show. Never throws. */
export function parseFraudResponse(raw: unknown): FraudReport {
  const levels: Obj[] = [];
  const push = (v: unknown) => {
    if (isObj(v)) levels.push(v);
  };
  push(raw);
  if (isObj(raw)) {
    push(raw.data);
    if (isObj(raw.data)) push(raw.data.data);
    push(raw.result);
  }

  let riskLabel: string | null = null;
  for (const lvl of levels) {
    const v = lvl.risk_level ?? lvl.riskLevel;
    if (typeof v === 'string' && v.trim()) {
      riskLabel = v.trim();
      break;
    }
  }

  const couriers: CourierStat[] = [];
  let summary: CourierStat | null = null;
  const seenObjects = new Set<Obj>();

  const scan = (container: Obj) => {
    if (seenObjects.has(container)) return;
    seenObjects.add(container);
    for (const [key, value] of Object.entries(container)) {
      if (!isObj(value)) continue;
      const name = key.toLowerCase();
      if (name === 'couriers' || name === 'courier_data' || name === 'courier') {
        scan(value);
        continue;
      }
      const stat = readStat(key, value);
      if (!stat) continue;
      if (SUMMARY_NAMES.has(name)) summary = summary ?? { ...stat, courier: 'All couriers' };
      else if (!couriers.some((c) => c.courier === key)) couriers.push(stat);
    }
  };
  levels.forEach(scan);

  // a flat response (stats straight on the object, no summary key)
  if (!summary) {
    for (const lvl of levels) {
      const flat = readStat('All couriers', lvl);
      if (flat) {
        summary = flat;
        break;
      }
    }
  }

  // build the summary ourselves when only per-courier numbers came back
  if (!summary && couriers.length > 0) {
    const sum = (pick: (c: CourierStat) => number | null) =>
      couriers.reduce((acc, c) => acc + (pick(c) ?? 0), 0);
    const success = sum((c) => c.success);
    const cancel = sum((c) => c.cancel);
    const total = sum((c) => c.total) || success + cancel;
    summary = {
      courier: 'All couriers',
      success,
      cancel,
      total,
      successRatio: total > 0 ? Math.round((success / total) * 10000) / 100 : null,
    };
  }

  return { risk: mapRiskLevel(riskLabel), riskLabel, summary, couriers, raw };
}

export const RISK_COPY: Record<RiskLevel, { label: string; hint: string }> = {
  safe: { label: 'Safe to ship', hint: 'Good delivery history.' },
  caution: { label: 'Be careful', hint: 'Mixed delivery history. Consider confirming by phone first.' },
  danger: { label: 'High risk customer', hint: 'Poor delivery history. Confirm by phone or ask for advance payment.' },
  unknown: { label: 'No risk level', hint: 'BD Courier did not send a risk level. Check the raw response.' },
};

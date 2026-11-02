import type { Order, OrderStatus, OrderStatusChange } from '../types';

// Helpers for the customer "Track Order" page. Pure functions only (no React, no network),
// so they can be unit tested.

const BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯';

const toAsciiDigits = (value: string): string =>
  value.replace(/[০-৯]/g, (d) => String(BENGALI_DIGITS.indexOf(d)));

/** "sbs-1234", "#SBS-1234", "SBS1234" and plain "1234" all become "SBS-1234". */
export function normalizeOrderId(input: string): string {
  let v = toAsciiDigits(input || '').trim().toUpperCase().replace(/^#/, '').replace(/\s+/g, '');
  if (/^\d+$/.test(v)) return `SBS-${v}`;
  if (/^SBS\d+$/.test(v)) v = `SBS-${v.slice(3)}`;
  return v;
}

export function phoneDigits(input: string): string {
  return toAsciiDigits(input || '').replace(/[^0-9]/g, '');
}

export function isValidPhoneInput(input: string): boolean {
  return phoneDigits(input).length >= 10;
}

/** Compares the last 10 digits, so 01712345678, 8801712345678 and +880 1712-345678 all match. */
export function phonesMatch(a: string, b: string): boolean {
  const da = phoneDigits(a);
  const db = phoneDigits(b);
  if (da.length < 10 || db.length < 10) return false;
  return da.slice(-10) === db.slice(-10);
}

/**
 * Dates arrive in two shapes: full ISO strings from the database history ("...T08:00:00.123456+00:00")
 * and the short "YYYY-MM-DD HH:MM" strings the store keeps for createdAt (those are UTC).
 */
export function parseOrderDate(value?: string | null): Date | null {
  if (!value) return null;
  let v = value.trim();
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(v)) {
    v = `${v.replace(' ', 'T')}:00Z`;
  } else {
    // some browsers choke on more than 3 fractional digits
    v = v.replace(/(\.\d{3})\d+/, '$1');
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const TRACKING_FLOW = ['pending', 'confirmed', 'shipped', 'delivered'] as const;
export type FlowStatus = (typeof TRACKING_FLOW)[number];
export type TrackingStepState = 'done' | 'current' | 'upcoming';

export interface TrackingStep {
  status: FlowStatus;
  state: TrackingStepState;
  at: string | null;
}

export interface TrackingTimeline {
  steps: TrackingStep[];
  cancelled: boolean;
  cancelledAt: string | null;
}

const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export function cleanStatusHistory(raw: unknown): OrderStatusChange[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (e): e is OrderStatusChange =>
      !!e &&
      typeof e === 'object' &&
      typeof (e as any).at === 'string' &&
      ALL_STATUSES.includes((e as any).status)
  );
}

function lastEntry(history: OrderStatusChange[], status: OrderStatus): OrderStatusChange | undefined {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].status === status) return history[i];
  }
  return undefined;
}

export function buildTrackingTimeline(
  order: Pick<Order, 'status' | 'createdAt' | 'statusHistory' | 'updatedAt'>
): TrackingTimeline {
  const history = cleanStatusHistory(order.statusHistory);
  const cancelled = order.status === 'cancelled';
  const currentIdx = TRACKING_FLOW.indexOf(order.status as FlowStatus);

  const reached = new Set<OrderStatus>(['pending']);
  history.forEach((h) => reached.add(h.status));

  const steps: TrackingStep[] = TRACKING_FLOW.map((status, i) => {
    let state: TrackingStepState;
    if (cancelled) {
      state = reached.has(status) ? 'done' : 'upcoming';
    } else if (order.status === 'delivered' || i < currentIdx) {
      state = 'done';
    } else if (i === currentIdx) {
      state = 'current';
    } else {
      state = 'upcoming';
    }

    const entry = lastEntry(history, status);
    let at: string | null = entry?.at ?? null;
    if (!at && status === 'pending') at = order.createdAt || null;
    if (!at && status === order.status && order.updatedAt) at = order.updatedAt;
    if (state === 'upcoming') at = null;
    return { status, state, at };
  });

  const cancelledAt = cancelled ? lastEntry(history, 'cancelled')?.at ?? order.updatedAt ?? null : null;
  return { steps, cancelled, cancelledAt };
}

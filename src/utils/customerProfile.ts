import type { Order } from '../types';
import { toLocalBdPhone } from './fraudCheck';

// One customer = one phone number. "+880 1712-345678" and "01712345678" are the same person.

export interface CustomerProfile {
  /** normalized phone, used to match orders */
  key: string;
  /** phone as it appears on the newest order */
  phone: string;
  /** every name used with this phone, newest first */
  names: string[];
  /** every delivery address used with this phone, newest first */
  addresses: string[];
  /** all orders from this customer, newest first */
  orders: Order[];
  totalOrders: number;
  delivered: number;
  cancelled: number;
  /** pending + confirmed + shipped */
  inProgress: number;
  /** cancelled / total orders, 0-100 */
  cancelRate: number;
  /** sum of delivered orders (what the customer really paid) */
  totalSpent: number;
  firstOrderAt: string | null;
  lastOrderAt: string | null;
}

export function customerKey(phone: string): string {
  const local = toLocalBdPhone(phone);
  if (local) return local;
  const digits = (phone || '').replace(/\D/g, '');
  return digits || (phone || '').trim();
}

const unique = (values: string[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const v = (raw || '').trim();
    const k = v.toLowerCase().replace(/\s+/g, ' ');
    if (v && !seen.has(k)) {
      seen.add(k);
      out.push(v);
    }
  }
  return out;
};

export function buildCustomerProfile(allOrders: Order[], phone: string): CustomerProfile {
  const key = customerKey(phone);
  // createdAt is "YYYY-MM-DD HH:MM", so plain string comparison sorts by time
  const orders = allOrders
    .filter((o) => customerKey(o.customerPhone) === key)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));

  const delivered = orders.filter((o) => o.status === 'delivered');
  const cancelled = orders.filter((o) => o.status === 'cancelled').length;

  return {
    key,
    phone: orders[0]?.customerPhone || phone,
    names: unique(orders.map((o) => o.customerName)),
    addresses: unique(
      orders.map((o) => [o.customerAddress, o.customerCityDistrict].filter(Boolean).join(', '))
    ),
    orders,
    totalOrders: orders.length,
    delivered: delivered.length,
    cancelled,
    inProgress: orders.length - delivered.length - cancelled,
    cancelRate: orders.length ? Math.round((cancelled / orders.length) * 100) : 0,
    totalSpent: delivered.reduce((sum, o) => sum + (o.total || 0), 0),
    firstOrderAt: orders.length ? orders[orders.length - 1].createdAt : null,
    lastOrderAt: orders.length ? orders[0].createdAt : null,
  };
}

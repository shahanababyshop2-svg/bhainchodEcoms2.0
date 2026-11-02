// Remembers the orders placed from THIS browser (order id + phone) so the customer can
// open the tracking page with one tap. Stored separately from the admin order list on purpose.

const KEY = 'sbs_my_orders';
const MAX = 5;

export interface RememberedOrder {
  id: string;
  phone: string;
}

export function getRememberedOrders(): RememberedOrder[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((o) => o && typeof o.id === 'string' && typeof o.phone === 'string')
      .slice(0, MAX);
  } catch {
    return [];
  }
}

export function rememberOrder(id: string, phone: string): void {
  try {
    const rest = getRememberedOrders().filter((o) => o.id !== id);
    localStorage.setItem(KEY, JSON.stringify([{ id, phone }, ...rest].slice(0, MAX)));
  } catch {
    // storage blocked -> the customer can still type the order id by hand
  }
}

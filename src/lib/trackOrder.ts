import type { Order } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { mapRowToOrder } from '../context/StoreContext';
import { normalizeOrderId, phoneDigits, phonesMatch } from '../utils/orderTracking';

export type TrackResult =
  | { kind: 'found'; order: Order }
  | { kind: 'not_found' }
  | { kind: 'error'; message: string };

// Postgres 42883 / PostgREST PGRST202 = "function does not exist". That just means the
// updated SQL has not been run yet, so we fall back to a plain lookup instead of failing.
function isMissingFunction(error: { code?: string; message?: string }): boolean {
  return (
    error.code === 'PGRST202' ||
    error.code === '42883' ||
    /track_order/i.test(error.message || '')
  );
}

/**
 * Finds one order from its id + the phone number it was placed with.
 * 1. Supabase function `track_order` (only ever returns the matching order).
 * 2. If that function is not installed yet: select that single order and check the phone here.
 * 3. No Supabase / unreachable: look in the orders kept in this browser.
 */
export async function lookupOrder(
  rawOrderId: string,
  rawPhone: string,
  localOrders: Order[]
): Promise<TrackResult> {
  const id = normalizeOrderId(rawOrderId);
  const phone = phoneDigits(rawPhone);
  let serverProblem: string | null = null;

  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('track_order', { p_order_id: id, p_phone: phone });
      if (!error) {
        // the server answered, so trust it (a null means no order with that id + phone)
        return data ? { kind: 'found', order: mapRowToOrder(data as any) } : { kind: 'not_found' };
      }

      if (isMissingFunction(error)) {
        const { data: row, error: selectError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!selectError) {
          return row && phonesMatch(row.customer_phone, phone)
            ? { kind: 'found', order: mapRowToOrder(row as any) }
            : { kind: 'not_found' };
        }
        serverProblem = selectError.message;
      } else {
        serverProblem = error.message;
      }
    } catch (err: any) {
      serverProblem = err?.message || 'Network error';
    }
  }

  const local = localOrders.find((o) => o.id.toUpperCase() === id && phonesMatch(o.customerPhone, phone));
  if (local) return { kind: 'found', order: local };
  return serverProblem ? { kind: 'error', message: serverProblem } : { kind: 'not_found' };
}

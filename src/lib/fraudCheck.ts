import { supabase, supabaseUrl } from './supabase';
import { parseFraudResponse, toLocalBdPhone, type FraudReport } from '../utils/fraudCheck';

// Calls the `fraud-check` Supabase Edge Function (supabase/functions/fraud-check).
// The BD Courier API key lives only on the server as a secret, never in this app.

const cache = new Map<string, FraudReport>();

export class FraudCheckError extends Error {}

async function readFunctionError(error: unknown): Promise<string> {
  const ctx = (error as { context?: unknown } | null)?.context;
  if (ctx instanceof Response) {
    try {
      const body = (await ctx.clone().json()) as { error?: unknown };
      if (typeof body?.error === 'string' && body.error) return body.error;
    } catch {
      // fall through
    }
    if (ctx.status === 404) {
      return 'The fraud-check function is not deployed yet. See "Fraud check" in the README.';
    }
  }
  // FunctionsFetchError = the browser got no answer at all. When a function does not exist, Supabase's
  // reply to the browser's pre-check has no CORS headers, so the browser blocks it and this is all we see.
  if ((error as { name?: unknown } | null)?.name === 'FunctionsFetchError') {
    let project = '';
    try {
      project = new URL(supabaseUrl).hostname.split('.')[0];
    } catch {
      // ignore
    }
    return (
      'Could not reach the fraud-check function. Most likely it is not deployed yet' +
      (project ? ` on the Supabase project "${project}"` : '') +
      ' (the one this site uses). See "Fraud check" in the README. Other causes: no internet, or an ad blocker.'
    );
  }
  const message = (error as { message?: unknown } | null)?.message;
  return typeof message === 'string' && message
    ? message
    : 'Could not run the fraud check. Please try again.';
}

/** Cached result for a phone number from earlier in this browser session (saves API credits). */
export function getCachedFraudReport(phone: string): FraudReport | null {
  const local = toLocalBdPhone(phone);
  return local ? cache.get(local) ?? null : null;
}

export async function checkCustomerFraud(phone: string, options?: { force?: boolean }): Promise<FraudReport> {
  const local = toLocalBdPhone(phone);
  if (!local) throw new FraudCheckError('That is not a valid Bangladesh mobile number.');

  if (!options?.force) {
    const hit = cache.get(local);
    if (hit) return hit;
  }

  if (!supabase) throw new FraudCheckError('Supabase is not connected, so the fraud check cannot run.');

  const { data, error } = await supabase.functions.invoke('fraud-check', { body: { phone: local } });
  if (error) throw new FraudCheckError(await readFunctionError(error));
  if (!data || typeof data !== 'object' || (data as { ok?: unknown }).ok !== true) {
    const msg = (data as { error?: unknown } | null)?.error;
    throw new FraudCheckError(typeof msg === 'string' && msg ? msg : 'Unexpected answer from the fraud check.');
  }

  const report = parseFraudResponse((data as { data?: unknown }).data);
  cache.set(local, report);
  return report;
}

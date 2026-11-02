// Supabase Edge Function: fraud-check
//
// The browser never sees the BD Courier API key. The admin panel calls THIS function,
// and this function calls https://api.bdcourier.com/courier-check with the key.
//
// Setup (once):
//   supabase secrets set BDCOURIER_API_KEY=your_real_key
//   supabase functions deploy fraud-check
//
// Only the shop admin can use it: the caller must be logged in AND listed in public.admin_emails
// (same is_shop_admin() check that protects the orders table).

import { createClient } from 'npm:@supabase/supabase-js@2';

const BDCOURIER_URL = 'https://api.bdcourier.com/courier-check';
const UPSTREAM_TIMEOUT_MS = 15_000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-retry-count, traceparent, tracestate, baggage',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯';

/** "+880 1712-345678", "8801712345678", "১৭১২৩৪৫৬৭৮" etc. -> "01712345678" (or null if not a BD mobile). */
function toLocalBdPhone(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const digits = input
    .replace(/[০-৯]/g, (d) => String(BENGALI_DIGITS.indexOf(d)))
    .replace(/[^0-9]/g, '');
  let local = digits;
  if (digits.startsWith('880') && digits.length === 13) local = `0${digits.slice(3)}`;
  else if (digits.length === 10 && digits.startsWith('1')) local = `0${digits}`;
  return /^01[3-9]\d{8}$/.test(local) ? local : null;
}

/**
 * Every public key this function could use to talk to the database, best first.
 *
 * 1. The key the browser itself just used (the `apikey` header). It is the public/publishable key, it is
 *    known to work for this site, and it works even if the old-style SUPABASE_ANON_KEY secret is
 *    disabled or missing on newer Supabase projects.
 * 2. The keys Supabase gives every function by default.
 */
function candidateKeys(req: Request): string[] {
  const keys: string[] = [];
  const add = (k: unknown) => {
    if (typeof k === 'string' && k.trim() && !keys.includes(k.trim())) keys.push(k.trim());
  };
  add(req.headers.get('apikey'));
  add(Deno.env.get('SUPABASE_ANON_KEY'));
  add(Deno.env.get('SUPABASE_PUBLISHABLE_KEY'));
  try {
    const parsed = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') ?? '{}');
    if (parsed && typeof parsed === 'object') Object.values(parsed).forEach(add);
  } catch {
    // not JSON, ignore
  }
  return keys;
}

type AdminCheck = { ok: true } | { ok: false; status: number; error: string };

/**
 * Asks the database (is_shop_admin(), the same check that protects the orders table) whether the logged-in
 * user is the shop admin. Unlike a plain "true/false", it says WHY it said no, so "Admin only." is never a
 * mystery: wrong email, SQL not run, expired login, or a bad key.
 */
async function checkShopAdmin(req: Request, supabaseUrl: string, token: string): Promise<AdminCheck> {
  const keys = candidateKeys(req);
  if (keys.length === 0) return { ok: false, status: 500, error: 'Function has no Supabase API key to use.' };

  let lastError = '';
  for (const key of keys) {
    const supabase = createClient(supabaseUrl, key, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.rpc('is_shop_admin');

    if (error) {
      const code = (error as { code?: string }).code ?? '';
      const message = error.message ?? 'unknown error';
      // The login itself is bad or expired: another key will not help.
      if (['PGRST301', 'PGRST302', 'PGRST303'].includes(code) || /jwt expired/i.test(message)) {
        return {
          ok: false,
          status: 401,
          error: 'Your admin login has expired. Log out of the admin panel, log in again, then retry.',
        };
      }
      // The SQL was never run: another key will not help either.
      if (code === 'PGRST202' || code === '42883' || /could not find the function/i.test(message)) {
        return {
          ok: false,
          status: 500,
          error:
            'The database has no is_shop_admin() function yet. Run supabase/migrations/002_lock_down_with_admin_login.sql in the Supabase SQL Editor.',
        };
      }
      lastError = message; // maybe this key is the problem; try the next one
      continue;
    }

    if (data === true) return { ok: true };

    // The database answered "no". Find out whose login it saw, so the message is useful.
    const { data: userData } = await supabase.auth.getUser(token);
    const email = userData?.user?.email;
    if (!email) {
      return {
        ok: false,
        status: 401,
        error: 'The request did not carry an admin login. Log out of the admin panel, log in again, then retry.',
      };
    }
    return {
      ok: false,
      status: 403,
      error: `Logged in as ${email}, but that email is not in the shop admin list. In Supabase -> SQL Editor run: INSERT INTO public.admin_emails (email) VALUES ('${email.replace(/'/g, "''")}') ON CONFLICT DO NOTHING;`,
    };
  }

  return { ok: false, status: 500, error: `Could not check admin status: ${lastError}` };
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);

  // 1) Only the logged-in shop admin may spend API credits.
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return json({ error: 'Not logged in. Log in to the admin panel again.' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  if (!supabaseUrl) return json({ error: 'Function is missing Supabase settings.' }, 500);

  const check = await checkShopAdmin(req, supabaseUrl, token);
  if (!check.ok) return json({ error: check.error }, check.status);

  // 2) Read + validate the phone number.
  let phoneInput: unknown;
  try {
    phoneInput = (await req.json())?.phone;
  } catch {
    return json({ error: 'Send JSON like {"phone":"01712345678"}.' }, 400);
  }
  const phone = toLocalBdPhone(phoneInput);
  if (!phone) return json({ error: 'That is not a valid Bangladesh mobile number.' }, 400);

  // 3) Call BD Courier with the secret key.
  const apiKey = Deno.env.get('BDCOURIER_API_KEY');
  if (!apiKey) {
    return json({ error: 'BDCOURIER_API_KEY secret is not set on the server.' }, 500);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const upstream = await fetch(BDCOURIER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ phone }),
      signal: controller.signal,
    });

    const text = await upstream.text();
    let data: unknown = null;
    try {
      data = JSON.parse(text);
    } catch {
      // not JSON, handled below
    }

    if (!upstream.ok || data === null) {
      // pass along BD Courier's own message when it gives one (e.g. invalid key, no credits left)
      const message =
        data && typeof data === 'object' && typeof (data as Record<string, unknown>).message === 'string'
          ? (data as Record<string, string>).message
          : `BD Courier answered with status ${upstream.status}.`;
      return json({ error: message, upstreamStatus: upstream.status }, 502);
    }

    return json({ ok: true, phone, data });
  } catch (err) {
    const timedOut = err instanceof DOMException && err.name === 'AbortError';
    return json(
      { error: timedOut ? 'BD Courier took too long to answer. Try again.' : 'Could not reach BD Courier.' },
      504,
    );
  } finally {
    clearTimeout(timer);
  }
});

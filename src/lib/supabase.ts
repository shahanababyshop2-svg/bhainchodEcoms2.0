import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from './supabaseUrl';

// fallback creds, env na thakle eta use hoy. publishable key so public thakle problem na,
// but RLS ta open so... yeah
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY } from './supabaseDefaults';
export { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_KEY };

export function sanitizeAnonKey(key: string): string {
  return (key || '').trim();
}

export function getActiveSupabaseConfig(): { url: string; key: string } {
  let savedUrl = '';
  let savedKey = '';
  try {
    savedUrl = localStorage.getItem('sbs_supabase_url') || '';
    savedKey = localStorage.getItem('sbs_supabase_key') || '';
  } catch {
    // ignore
  }

  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  const finalUrl = normalizeSupabaseUrl(savedUrl || envUrl || DEFAULT_SUPABASE_URL);
  const finalKey = sanitizeAnonKey(savedKey || envKey || DEFAULT_SUPABASE_KEY);

  return { url: finalUrl, key: finalKey };
}

const initialConfig = getActiveSupabaseConfig();
export let supabaseUrl = initialConfig.url;
export let supabaseAnonKey = initialConfig.key;

export let isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  !supabaseAnonKey.includes('YOUR_SUPABASE')
);

// ei client ta jeno kaj kore, shala plzz work
export let supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export function updateSupabaseCredentials(url: string, key: string): { success: boolean; client: SupabaseClient | null } {
  const normUrl = normalizeSupabaseUrl(url);
  const cleanKey = sanitizeAnonKey(key);

  try {
    localStorage.setItem('sbs_supabase_url', normUrl);
    localStorage.setItem('sbs_supabase_key', cleanKey);
  } catch {
    // ignore
  }

  supabaseUrl = normUrl;
  supabaseAnonKey = cleanKey;
  isSupabaseConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl !== 'https://your-project-ref.supabase.co' &&
    !supabaseAnonKey.includes('YOUR_SUPABASE')
  );

  if (isSupabaseConfigured) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return { success: true, client: supabase };
  } else {
    supabase = null;
    return { success: false, client: null };
  }
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string;
  normalizedUrl: string;
  rawUrl: string;
  key: string;
  maskedKey: string;
}

export function getSupabaseStatus(): SupabaseConfigStatus {
  const cfg = getActiveSupabaseConfig();
  const k = cfg.key;
  const masked = k.length > 12 ? `${k.slice(0, 15)}...${k.slice(-4)}` : (k ? 'configured' : 'none');
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  return {
    isConfigured: Boolean(cfg.url && cfg.key),
    url: cfg.url,
    normalizedUrl: cfg.url,
    rawUrl: envUrl || cfg.url,
    key: cfg.key,
    maskedKey: masked,
  };
}

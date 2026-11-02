import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SUPABASE_SQL_SCHEMA } from '../../lib/supabaseSchemaCode';
import { getSupabaseStatus } from '../../lib/supabase';
import {
  CheckIcon,
  DatabaseIcon,
  CopyIcon,
  RefreshIcon,
} from '../Icons';

export const DatabaseTab: React.FC = () => {
  const {
    products,
    orders,
    isSupabaseConfigured,
    supabaseSyncStatus,
    supabaseErrorMessage,
    refreshFromSupabase,
    updateSupabaseCredentialsState,
    syncLocalDataToSupabase,
  } = useStore();

  const supabaseInfo = getSupabaseStatus();

  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedConnString, setCopiedConnString] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const [supabaseUrlInput, setSupabaseUrlInput] = useState(supabaseInfo.url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(supabaseInfo.key);
  const [isSavingCreds, setIsSavingCreds] = useState(false);
  const [isPushingData, setIsPushingData] = useState(false);
  const [pushDataFeedback, setPushDataFeedback] = useState<string | null>(null);

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isSupabaseConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              <DatabaseIcon size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isSupabaseConfigured
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      isSupabaseConfigured ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}
                  />
                  {isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage Fallback'}
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  Status: {supabaseSyncStatus}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-stone-900 mt-1">
                {isSupabaseConfigured
                  ? 'Live Cloud Database Active'
                  : 'PostgreSQL Database Integration Guide'}
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                {isSupabaseConfigured
                  ? 'All orders, products, and site settings are synchronized with your Supabase PostgreSQL instance.'
                  : 'The store is currently running safely in browser localStorage. Follow the steps below to link your Supabase account.'}
              </p>
              {supabaseInfo.isConfigured && (
                <div className="mt-2 text-[11px] text-stone-600 bg-stone-100 p-2.5 rounded-lg border border-stone-200 font-mono">
                  <div><span className="font-bold text-stone-700">Database API Endpoint:</span> {supabaseInfo.normalizedUrl}</div>
                  {supabaseInfo.rawUrl !== supabaseInfo.normalizedUrl && (
                    <div className="text-emerald-700 font-sans mt-0.5 font-medium">
                      Automatically normalized dashboard URL to valid REST API endpoint.
                    </div>
                  )}
                </div>
              )}
              {supabaseErrorMessage && (
                <div className="mt-2 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200 font-mono">
                  Supabase Sync Notice: {supabaseErrorMessage}
                </div>
              )}
              {syncFeedback && (
                <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  {syncFeedback}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isRefreshing}
              onClick={async () => {
                setIsRefreshing(true);
                setSyncFeedback(null);
                const success = await refreshFromSupabase();
                setIsRefreshing(false);
                if (success) {
                  setSyncFeedback('Database synchronized successfully from Supabase!');
                  setTimeout(() => setSyncFeedback(null), 4000);
                } else if (!isSupabaseConfigured) {
                  setSyncFeedback('Running in local offline mode. Provide API keys to sync with Supabase.');
                  setTimeout(() => setSyncFeedback(null), 4000);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshIcon size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Connecting...' : 'Test / Refresh Sync'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-5">
              <div className="border-b pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                    Supabase Connection Settings
                  </span>
                  <h4 className="text-sm font-bold text-stone-900 mt-0.5">
                    Active Database Credentials
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Live
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  Project REST URL
                </label>
                <input
                  type="text"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  placeholder="https://zxlyxhmbzfwcsdlaryov.supabase.co"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono text-stone-900 focus:border-amber-700 outline-hidden bg-stone-50"
                />
                <p className="text-[11px] text-stone-500">
                  Standard REST endpoint or dashboard project link (automatically converted).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  Publishable / Anon API Key
                </label>
                <input
                  type="text"
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  placeholder="sb_publishable_... or anon JWT key"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono text-stone-900 focus:border-amber-700 outline-hidden bg-stone-50 break-all"
                />
                <p className="text-[11px] text-stone-500">
                  Publishable key (sb_publishable_...) or standard anon public JWT key.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isSavingCreds}
                  onClick={async () => {
                    setIsSavingCreds(true);
                    setSyncFeedback(null);
                    const success = await updateSupabaseCredentialsState(
                      supabaseUrlInput.trim(),
                      supabaseKeyInput.trim()
                    );
                    setIsSavingCreds(false);
                    if (success) {
                      setSyncFeedback('Credentials saved and connection verified successfully!');
                    } else {
                      setSyncFeedback('Failed to connect. Please verify URL and key.');
                    }
                    setTimeout(() => setSyncFeedback(null), 5000);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <CheckIcon size={14} />
                  <span>{isSavingCreds ? 'Saving & Testing...' : 'Save & Verify Connection'}</span>
                </button>

                <button
                  type="button"
                  disabled={isPushingData}
                  onClick={async () => {
                    setIsPushingData(true);
                    setPushDataFeedback(null);
                    const result = await syncLocalDataToSupabase();
                    setIsPushingData(false);
                    setPushDataFeedback(result.message);
                    setTimeout(() => setPushDataFeedback(null), 6000);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshIcon size={14} className={isPushingData ? 'animate-spin' : ''} />
                  <span>{isPushingData ? 'Pushing Data...' : 'Push Local Data to Cloud'}</span>
                </button>
              </div>

              {pushDataFeedback && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                  {pushDataFeedback}
                </div>
              )}

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">
                    Direct PostgreSQL URI
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const str = 'postgresql://postgres:[YOUR-PASSWORD]@db.zxlyxhmbzfwcsdlaryov.supabase.co:5432/postgres';
                      navigator.clipboard.writeText(str);
                      setCopiedConnString(true);
                      setTimeout(() => setCopiedConnString(false), 3000);
                    }}
                    className="text-[11px] text-amber-800 font-bold hover:underline flex items-center gap-1"
                  >
                    {copiedConnString ? (
                      <>
                        <CheckIcon size={12} />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <CopyIcon size={12} />
                        <span>Copy URI</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-[11px] font-mono text-stone-700 bg-white p-2.5 rounded-lg border border-stone-200 select-all break-all">
                  postgresql://postgres:[YOUR-PASSWORD]@db.zxlyxhmbzfwcsdlaryov.supabase.co:5432/postgres
                </div>
                <p className="text-[11px] text-stone-500">
                  Use this string for external PostgreSQL clients or server-side pooling connections.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Tables Created in PostgreSQL
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="font-bold text-stone-900">public.products</div>
                  <div className="text-[11px] text-stone-500">Cradle models, pricing, features</div>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="font-bold text-stone-900">public.orders</div>
                  <div className="text-[11px] text-stone-500">Customer checkout & status</div>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="font-bold text-stone-900">public.site_config</div>
                  <div className="text-[11px] text-stone-500">Delivery fees & store info</div>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="font-bold text-stone-900">public.reviews</div>
                  <div className="text-[11px] text-stone-500">Verified buyer ratings</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                    Step 2 of 2
                  </span>
                  <h4 className="text-sm font-bold text-stone-900 mt-0.5">
                    Run This SQL Script in Supabase
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Creates tables, sets up Row Level Security (RLS) policies, and seeds initial cradle models.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 3000);
                  }}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-colors"
                >
                  {copiedSql ? (
                    <>
                      <CheckIcon size={14} />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon size={14} />
                      <span>Copy Complete SQL Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="font-bold text-stone-900">1. Open Supabase</span>
                  <p className="text-[11px] text-stone-500 mt-0.5">Log into your project at supabase.com</p>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="font-bold text-stone-900">2. Open SQL Editor</span>
                  <p className="text-[11px] text-stone-500 mt-0.5">Click &quot;SQL Editor&quot; on the left menu</p>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="font-bold text-stone-900">3. Paste and Run</span>
                  <p className="text-[11px] text-stone-500 mt-0.5">Click &quot;New query&quot;, paste &amp; click Run</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute top-3 right-3 z-10">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 3000);
                    }}
                    className="px-2.5 py-1 bg-stone-800/90 hover:bg-stone-700 text-white text-[11px] rounded font-medium flex items-center gap-1.5 backdrop-blur-xs"
                  >
                    <CopyIcon size={12} />
                    <span>{copiedSql ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-stone-900 text-stone-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-[460px] leading-relaxed border border-stone-800">
                  <code>{SUPABASE_SQL_SCHEMA}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

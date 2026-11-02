import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { SettingsIcon } from './Icons';

// Shown at /dihanadmin when nobody is logged in. Once the login works, App swaps it for the dashboard.
export const AdminLoginPage: React.FC = () => {
  const { loginAdmin, setCurrentView, language } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await loginAdmin(email, password);
    setBusy(false);
    if (result.ok) {
      setPassword('');
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-100">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-stone-200">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#f27405] flex items-center justify-center">
            <SettingsIcon size={20} />
          </div>
          <div>
            <h1 className="text-base font-black text-stone-900">
              {language === 'bn' ? 'অ্যাডমিন পোর্টাল' : 'Admin Portal'}
            </h1>
            <p className="text-[11px] text-stone-500 font-medium">
              {language === 'bn' ? 'শুধু দোকানের মালিকের জন্য' : 'Shop owner only'}
            </p>
          </div>
        </div>

        <p className="text-xs text-stone-600 mb-4 leading-relaxed">
          {language === 'bn'
            ? 'পণ্য, অর্ডার, ডেলিভারি ফি এবং ওয়েবসাইট এডিট করতে ইমেইল ও পাসওয়ার্ড দিন।'
            : 'Log in to manage orders, products, delivery rates, and customize settings.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {language === 'bn' ? 'ইমেইল' : 'Email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              autoComplete="username"
              required
              autoFocus
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-[#f27405] focus:ring-1 focus:ring-[#f27405] bg-stone-50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              autoComplete="current-password"
              required
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-hidden focus:border-[#f27405] focus:ring-1 focus:ring-[#f27405] bg-stone-50"
            />
            {error && (
              <p className="text-xs text-rose-600 mt-1.5 font-bold">
                {language === 'bn'
                  ? 'লগইন হয়নি: ইমেইল বা পাসওয়ার্ড ভুল, অথবা এই অ্যাকাউন্ট অ্যাডমিন নয়।'
                  : `Login failed: ${error}`}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCurrentView('store')}
              className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 rounded-xl cursor-pointer"
            >
              {language === 'bn' ? 'স্টোরে ফিরে যান' : 'Back to Store'}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2.5 bg-[#f27405] hover:bg-[#d96602] disabled:opacity-60 text-white text-xs font-black rounded-xl shadow-md transition-colors cursor-pointer"
            >
              {busy ? '...' : language === 'bn' ? 'লগইন করুন' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

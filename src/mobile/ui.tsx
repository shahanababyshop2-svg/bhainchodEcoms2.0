import React, { useEffect } from 'react';
import { Language } from '../types';
import { toBengaliDigits } from '../utils/pricing';
import { MinusIcon, PlusIcon } from '../components/Icons';

// Shared pieces for the phone UI. Type scale used everywhere in src/mobile/:
//   body and product titles 16px, prices 20px, labels 14-15px, nothing under 13px,
//   inputs 16px (so iPhones do not zoom in), buttons at least 48px tall.

// pick the Bangla or English text
export const L = (lang: Language, bn: string, en: string) => (lang === 'bn' ? bn : en);

// whole numbers shown in text: Bangla digits when the site is in Bangla
export const num = (lang: Language, n: number) => (lang === 'bn' ? toBengaliDigits(n) : String(n));

// Stops the page behind a full-screen panel from scrolling. A counter lets two panels
// (for example menu + checkout) be open at once without unlocking too early.
let scrollLocks = 0;
let savedOverflow = '';
export function useLockBodyScroll(active = true): void {
  useEffect(() => {
    if (!active) return;
    if (scrollLocks === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    scrollLocks += 1;
    return () => {
      scrollLocks -= 1;
      if (scrollLocks === 0) document.body.style.overflow = savedOverflow;
    };
  }, [active]);
}

interface QtyStepperProps {
  value: number;
  onChange: (next: number) => void;
  lang: Language;
  // 1 stops at one (checkout); 0 lets it go to zero so the caller can remove the item (cart)
  min?: number;
  label?: string;
}

// minus / number / plus with 44px touch targets
export const QtyStepper: React.FC<QtyStepperProps> = ({ value, onChange, lang, min = 1, label = '' }) => (
  <div className="inline-flex items-center rounded-xl border border-stone-300 bg-white">
    <button
      type="button"
      onClick={() => onChange(Math.max(min, value - 1))}
      className="w-11 h-11 flex items-center justify-center text-stone-700 active:bg-stone-100 rounded-l-xl cursor-pointer"
      aria-label={`${L(lang, 'কমান', 'Decrease quantity')} ${label}`.trim()}
    >
      <MinusIcon size={18} />
    </button>
    <span className="min-w-9 text-center text-base font-bold text-stone-900 tabular-nums" aria-live="polite">
      {num(lang, value)}
    </span>
    <button
      type="button"
      onClick={() => onChange(value + 1)}
      className="w-11 h-11 flex items-center justify-center text-stone-700 active:bg-stone-100 rounded-r-xl cursor-pointer"
      aria-label={`${L(lang, 'বাড়ান', 'Increase quantity')} ${label}`.trim()}
    >
      <PlusIcon size={18} />
    </button>
  </div>
);

import React from 'react';
import { useStore } from '../context/StoreContext';
import { CartIcon, ChevronLeftIcon } from '../components/Icons';
import { L } from './ui';

interface MobilePageBarProps {
  title: string;
  onBack?: () => void;
}

// Slim top bar for inner pages (product, tracking, terms): back arrow, title, cart.
export const MobilePageBar: React.FC<MobilePageBarProps> = ({ title, onBack }) => {
  const { language, navigateToStore, cartTotals, setIsCartDrawerOpen } = useStore();
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-stone-200 shadow-xs h-14 flex items-center gap-1 px-2">
      <button
        type="button"
        onClick={onBack ?? navigateToStore}
        className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl text-stone-800 active:bg-orange-50 cursor-pointer"
        aria-label={L(language, 'পেছনে যান', 'Go back')}
      >
        <ChevronLeftIcon size={26} />
      </button>
      <h1 className="flex-1 min-w-0 text-[18px] font-bold text-stone-900 truncate">{title}</h1>
      <button
        type="button"
        onClick={() => setIsCartDrawerOpen(true)}
        className="relative w-12 h-12 shrink-0 flex items-center justify-center rounded-xl text-stone-800 active:bg-orange-50 cursor-pointer"
        aria-label={L(
          language,
          `শপিং ব্যাগ, ${cartTotals.itemCount}টি পণ্য`,
          `Shopping bag, ${cartTotals.itemCount} items`
        )}
      >
        <CartIcon size={26} />
        <span className="absolute top-1 right-0.5 min-w-5 h-5 px-1 rounded-full bg-[#f27405] text-white text-[13px] font-bold flex items-center justify-center tabular-nums border-2 border-white">
          {cartTotals.itemCount}
        </span>
      </button>
    </header>
  );
};

import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatPriceBDT } from '../utils/pricing';
import { CartIcon } from './Icons';

export const FloatingCartButton: React.FC = () => {
  const { cartTotals, setIsCartDrawerOpen, language, isCartDrawerOpen, isCheckoutModalOpen, currentView } = useStore();

  if (isCartDrawerOpen || isCheckoutModalOpen || currentView === 'cart') return null;

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none">
      <button
        type="button"
        onClick={() => setIsCartDrawerOpen(true)}
        className="flex flex-col shadow-xl hover:shadow-2xl transition-transform active:scale-95 cursor-pointer group"
        aria-label={`Open shopping cart: ${cartTotals.itemCount} items, total ${formatPriceBDT(cartTotals.total, language)}`}
      >
        <div className="bg-[#f27405] group-hover:bg-[#d96602] text-white px-2.5 py-2.5 rounded-tl-xl flex flex-col items-center justify-center min-w-[66px] transition-colors">
          <CartIcon size={20} className="text-white group-hover:scale-110 transition-transform" />
          <span className="text-[10px] sm:text-[11px] font-extrabold tracking-tight mt-0.5 whitespace-nowrap">
            {language === 'bn' ? `${cartTotals.itemCount} আইটেম` : `${cartTotals.itemCount} Items`}
          </span>
        </div>

        <div className="bg-white group-hover:bg-orange-50/80 text-[#f27405] font-black px-2 py-1.5 rounded-bl-xl border-l-2 border-b-2 border-[#f27405] text-[11px] sm:text-xs text-center min-w-[66px] tabular-nums transition-colors shadow-inner">
          {formatPriceBDT(cartTotals.total, language)}
        </div>
      </button>
    </div>
  );
};

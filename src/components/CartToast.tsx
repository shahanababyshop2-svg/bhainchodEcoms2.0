import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckIcon, ShoppingBagIcon } from './Icons';

export const CartToast: React.FC = () => {
  const { cartToast } = useStore();

  if (!cartToast) return null;

  return (
    <div className="fixed top-20 right-6 z-50 transition-all duration-300">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-stone-900 text-white shadow-2xl border border-stone-700 text-xs font-semibold">
        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <CheckIcon size={12} />
        </div>
        <span>{cartToast}</span>
        <ShoppingBagIcon size={16} className="text-amber-400 shrink-0 ml-1" />
      </div>
    </div>
  );
};

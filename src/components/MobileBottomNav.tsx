import React from 'react';
import { useStore } from '../context/StoreContext';
import { HomeIcon, GridIcon, CartIcon } from './Icons';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenMenu,
}) => {
  const { currentView, navigateToStore, setIsCartDrawerOpen, cartTotals, language } = useStore();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#f27405] text-white grid grid-cols-3 py-1.5 border-t border-amber-600/40 shadow-2xl md:hidden select-none"
      aria-label="Mobile Navigation"
    >
      <button
        type="button"
        onClick={navigateToStore}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
          currentView === 'store' ? 'text-white font-black' : 'text-orange-100 hover:text-white'
        }`}
        aria-label="Home page"
      >
        <HomeIcon size={20} className="mb-0.5" />
        <span className="text-[10px] font-bold tracking-tight">
          {language === 'bn' ? 'হোম' : 'HOME'}
        </span>
      </button>

      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-orange-100 hover:text-white transition-colors cursor-pointer"
        aria-label="Open categories menu"
      >
        <GridIcon size={20} className="mb-0.5" />
        <span className="text-[10px] font-bold tracking-tight">
          {language === 'bn' ? 'মেনু' : 'MENU'}
        </span>
      </button>

      <button
        type="button"
        onClick={() => setIsCartDrawerOpen(true)}
        className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-orange-100 hover:text-white transition-colors cursor-pointer"
        aria-label={`Shopping cart with ${cartTotals.itemCount} items`}
      >
        <div className="relative">
          <CartIcon size={20} className="mb-0.5" />
          {cartTotals.itemCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-stone-900 text-white text-[9px] font-black rounded-full min-w-4 h-4 px-1 flex items-center justify-center tabular-nums shadow-xs">
              {cartTotals.itemCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold tracking-tight">
          {language === 'bn' ? 'ব্যাগ' : 'CART'}
        </span>
      </button>
    </nav>
  );
};

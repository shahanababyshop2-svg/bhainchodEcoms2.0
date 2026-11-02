import React from 'react';
import { useStore } from '../context/StoreContext';
import { CartIcon, GridIcon, HomeIcon, TruckIcon } from '../components/Icons';
import { L } from './ui';

interface MobileBottomNavProps {
  menuOpen: boolean;
  onOpenMenu: () => void;
}

// Orange bar with four tabs: Home, Menu, Cart, Track Order. 13px labels, 64px tall.
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ menuOpen, onOpenMenu }) => {
  const {
    language,
    currentView,
    navigateToStore,
    navigateToTracking,
    setIsCartDrawerOpen,
    isCartDrawerOpen,
    cartTotals,
    setSearchQuery,
    setSelectedCategory,
  } = useStore();

  const tab = (active: boolean) =>
    `relative flex flex-col items-center justify-center gap-0.5 mx-1 my-1.5 rounded-2xl text-white cursor-pointer transition-colors ${
      active ? 'bg-white/25' : 'active:bg-white/15'
    }`;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-[#f27405] shadow-[0_-4px_16px_rgba(0,0,0,0.12)] select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label={L(language, 'মূল নেভিগেশন', 'Main navigation')}
    >
      <div className="grid grid-cols-4 h-16">
        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            navigateToStore();
          }}
          className={tab(currentView === 'store' && !menuOpen && !isCartDrawerOpen)}
          aria-current={currentView === 'store' ? 'page' : undefined}
        >
          <HomeIcon size={24} />
          <span className="text-[13px] leading-none font-bold">{L(language, 'হোম', 'Home')}</span>
        </button>

        <button type="button" onClick={onOpenMenu} className={tab(menuOpen)}>
          <GridIcon size={24} />
          <span className="text-[13px] leading-none font-bold">{L(language, 'মেনু', 'Menu')}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsCartDrawerOpen(true)}
          className={tab(isCartDrawerOpen)}
          aria-label={L(language, `কার্ট, ${cartTotals.itemCount}টি পণ্য`, `Cart, ${cartTotals.itemCount} items`)}
        >
          <span className="relative">
            <CartIcon size={24} />
            {cartTotals.itemCount > 0 && (
              <span className="absolute -top-2 -right-3 min-w-5 h-5 px-1 rounded-full bg-stone-900 text-white text-[13px] font-bold flex items-center justify-center tabular-nums leading-none">
                {cartTotals.itemCount}
              </span>
            )}
          </span>
          <span className="text-[13px] leading-none font-bold">{L(language, 'কার্ট', 'Cart')}</span>
        </button>

        <button
          type="button"
          onClick={() => navigateToTracking()}
          className={tab(currentView === 'track')}
          aria-current={currentView === 'track' ? 'page' : undefined}
        >
          <TruckIcon size={24} />
          <span className="text-[13px] leading-none font-bold">{L(language, 'ট্র্যাক', 'Track')}</span>
        </button>
      </div>
    </nav>
  );
};

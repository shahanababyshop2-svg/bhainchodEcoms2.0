import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  BabyCradleLogo,
  CartIcon,
  PhoneIcon,
  SearchIcon,
  SettingsIcon,
  CloseIcon,
  MenuIcon,
  TruckIcon,
} from './Icons';
import { formatPriceBDT } from '../utils/pricing';
import { ADMIN_PATH } from '../utils/adminRoute';

interface HeaderProps {
  onOpenMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  const {
    language,
    toggleLanguage,
    siteConfig,
    cartTotals,
    setIsCartDrawerOpen,
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    navigateToStore,
    navigateToCart,
    navigateToTracking,
  } = useStore();

  const categories = [
    { id: 'all', labelBn: 'সকল পণ্য', labelEn: 'All Products' },
    { id: 'dolna', labelBn: 'বেবি দোলনা ও ক্র্যাডল', labelEn: 'Baby Dolna & Cradles' },
    { id: 'safety', labelBn: 'সেফটি লক মডেল', labelEn: 'Safety Lock Swings' },
    { id: 'bedding', labelBn: 'বেবি বেডিং ও মশারি', labelEn: 'Bedding & Nets' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-stone-200 select-none">
      <div className="bg-[#f27405] text-white px-4 py-1 text-xs text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <span className="hidden sm:inline">
          {language === 'bn' ? siteConfig.announcementBn : siteConfig.announcementEn}
        </span>
        <span className="sm:hidden">
          {language === 'bn' ? 'ফ্রি ডেলিভারি ও ক্যাশ অন ডেলিভারি' : 'Free Delivery & Cash on Delivery'}
        </span>
        <span className="opacity-75" aria-hidden="true">|</span>
        <a
          href={`tel:${siteConfig.phone1.replace(/[^0-9]/g, '')}`}
          className="underline font-bold hover:text-orange-100"
        >
          {siteConfig.phone1}
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onOpenMenu}
          className="md:hidden p-2 -ml-1 text-stone-800 hover:text-[#f27405] hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
          aria-label="Open navigation menu drawer"
        >
          <MenuIcon size={24} />
        </button>

        <button
          type="button"
          onClick={navigateToStore}
          className="flex items-center gap-2 sm:gap-3 text-left focus:outline-hidden group cursor-pointer"
          aria-label="Shahana Baby Shop Home"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#f27405] text-white flex items-center justify-center shadow-xs group-hover:bg-[#d96602] transition-colors">
            <BabyCradleLogo size={22} />
          </div>
          <div>
            <div className="text-base sm:text-xl font-black tracking-tight text-stone-900 leading-none">
              Shahana Baby Shop
            </div>
            <div className="text-[10px] sm:text-xs text-[#f27405] font-bold tracking-wider mt-0.5">
              {language === 'bn' ? 'সোনামণির প্রিমিয়াম দোলনা' : 'Premium Baby Cradles'}
            </div>
          </div>
        </button>

        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <label htmlFor="desktop-search" className="sr-only">
            {language === 'bn' ? 'পণ্য খুঁজুন' : 'Search Products'}
          </label>
          <input
            id="desktop-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'দোলনার মডেল বা নাম দিয়ে খুঁজুন (যেমন: Gen 4, 501, 733)...'
                : 'Search baby cradles by model (Gen 4, 501, 733)...'
            }
            className="w-full bg-stone-100 hover:bg-stone-50 focus:bg-white text-stone-900 text-sm rounded-full pl-10 pr-4 py-2 border border-stone-200 focus:border-[#f27405] focus:ring-1 focus:ring-[#f27405] outline-hidden transition-all placeholder:text-stone-400"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
            <SearchIcon size={18} />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              aria-label="Clear search"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            className="md:hidden relative p-2 -mr-1 text-stone-800 hover:text-[#f27405] hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
            aria-label={`Shopping cart with ${cartTotals.itemCount} items`}
          >
            <CartIcon size={24} />
            <span className="absolute top-1 right-1 bg-[#f27405] text-white text-[9px] font-black rounded-full min-w-4 h-4 px-1 flex items-center justify-center tabular-nums shadow-xs">
              {cartTotals.itemCount}
            </span>
          </button>

          <a
            href={`tel:${siteConfig.phone1.replace(/[^0-9]/g, '')}`}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
          >
            <PhoneIcon size={15} className="text-[#f27405]" />
            <span>{siteConfig.phone1}</span>
          </a>

          <button
            type="button"
            onClick={toggleLanguage}
            className="hidden sm:block px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
            aria-label="Switch Language"
          >
            {language === 'bn' ? 'ENG' : 'বাংলা'}
          </button>

          {currentView === 'store' ? (
            <a
              href={ADMIN_PATH}
              onClick={(e) => {
                // normal click = go to the admin page; ctrl/cmd/middle click still opens a new tab
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                setCurrentView('admin');
              }}
              className="hidden sm:flex px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold items-center gap-1.5 transition-colors cursor-pointer"
              aria-label="Admin Panel"
            >
              <SettingsIcon size={15} className="text-stone-600" />
              <span className="hidden sm:inline">
                {language === 'bn' ? 'অ্যাডমিন' : 'Admin'}
              </span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentView('store')}
              className="hidden sm:block px-3 py-1.5 rounded-lg bg-[#f27405] text-white text-xs font-semibold hover:bg-[#d96602] transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'স্টোরে ফিরে যান' : 'Back to Store'}
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            className="hidden md:flex relative items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#f27405] hover:bg-[#d96602] text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            aria-label={`Shopping cart with ${cartTotals.itemCount} items`}
          >
            <CartIcon size={18} />
            <span className="font-bold">
              {language === 'bn' ? 'শপিং ব্যাগ' : 'Shopping Bag'}
            </span>
            <span className="bg-orange-950/40 text-orange-100 px-2 py-0.5 rounded-md tabular-nums font-black text-[11px]">
              {cartTotals.itemCount > 0
                ? formatPriceBDT(cartTotals.total, language)
                : language === 'bn' ? '০টি' : '0'}
            </span>
            {cartTotals.itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center tabular-nums shadow-xs">
                {cartTotals.itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="md:hidden px-3 pb-2.5">
        <div className="relative">
          <label htmlFor="mobile-search" className="sr-only">
            {language === 'bn' ? 'পণ্য খুঁজুন' : 'Search Products'}
          </label>
          <input
            id="mobile-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'দোলনার মডেল বা নাম খুঁজুন...'
                : 'Search cradles by model or name...'
            }
            className="w-full bg-stone-100 text-stone-900 text-xs sm:text-sm rounded-full pl-9 pr-4 py-2 border border-stone-200 outline-hidden focus:border-[#f27405] focus:bg-white"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
            <SearchIcon size={16} />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              aria-label="Clear search"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>
      </div>

      <nav className="bg-stone-100/80 border-t border-stone-200 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center gap-2 py-1.5">
          <button
            type="button"
            onClick={navigateToStore}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              currentView === 'store' && selectedCategory === 'all'
                ? 'bg-[#f27405] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            {language === 'bn' ? 'হোম পেজ' : 'Home'}
          </button>

          {categories.map((cat) => {
            const isActive = currentView === 'store' && selectedCategory === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  navigateToStore();
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#f27405] text-white shadow-xs font-bold'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200'
                }`}
              >
                {language === 'bn' ? cat.labelBn : cat.labelEn}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => navigateToTracking()}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ml-auto flex items-center gap-1.5 ${
              currentView === 'track'
                ? 'bg-[#f27405] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <TruckIcon size={13} />
            <span>{language === 'bn' ? 'অর্ডার ট্র্যাক' : 'Track Order'}</span>
          </button>

          <button
            type="button"
            onClick={navigateToCart}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              currentView === 'cart'
                ? 'bg-[#f27405] text-white shadow-xs'
                : 'bg-orange-100 text-orange-950 hover:bg-orange-200'
            }`}
          >
            <CartIcon size={13} />
            <span>{language === 'bn' ? 'কার্ট পেজ' : 'Cart Page'}</span>
            {cartTotals.itemCount > 0 && (
              <span className="bg-orange-950 text-orange-50 px-1.5 py-0.2 rounded-full text-[10px] tabular-nums font-black">
                {cartTotals.itemCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};

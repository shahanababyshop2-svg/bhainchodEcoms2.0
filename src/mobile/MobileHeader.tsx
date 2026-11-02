import React from 'react';
import { useStore } from '../context/StoreContext';
import { BabyCradleLogo, CartIcon, CloseIcon, MenuIcon, PhoneIcon, SearchIcon } from '../components/Icons';
import { telHref } from '../utils/mobileUi';
import { L } from './ui';

// The thin orange strip above the header. It scrolls away with the page.
export const MobileAnnouncement: React.FC = () => {
  const { language, siteConfig } = useStore();
  return (
    <div className="bg-[#f27405] text-white px-4 py-2 text-[14px] leading-snug font-bold text-center flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5">
      <span>{L(language, 'ফ্রি ডেলিভারি ও ক্যাশ অন ডেলিভারি', 'Free Delivery & Cash on Delivery')}</span>
      <a
        href={telHref(siteConfig.phone1)}
        className="inline-flex items-center gap-1.5 underline underline-offset-2 whitespace-nowrap py-1"
      >
        <PhoneIcon size={15} />
        <span className="tabular-nums">{siteConfig.phone1}</span>
      </a>
    </div>
  );
};

interface MobileHeaderProps {
  onOpenMenu: () => void;
}

// Pinned header: menu, logo + name, language chip, cart; and the search box right under it.
export const MobileHeader: React.FC<MobileHeaderProps> = ({ onOpenMenu }) => {
  const {
    language,
    toggleLanguage,
    cartTotals,
    setIsCartDrawerOpen,
    navigateToStore,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    currentView,
  } = useStore();

  const goHome = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    navigateToStore();
  };

  const scrollToProducts = () => {
    const el = document.getElementById('m-products');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-stone-200 shadow-xs">
      <div className="flex items-center gap-1 px-2 h-16">
        <button
          type="button"
          onClick={onOpenMenu}
          className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl text-stone-800 active:bg-orange-50 cursor-pointer"
          aria-label={L(language, 'মেনু খুলুন', 'Open menu')}
        >
          <MenuIcon size={26} />
        </button>

        <button
          type="button"
          onClick={goHome}
          className="flex-1 min-w-0 h-12 flex items-center gap-2.5 text-left cursor-pointer"
          aria-label="Shahana Baby Shop"
        >
          <span className="w-10 h-10 shrink-0 rounded-xl bg-[#f27405] text-white flex items-center justify-center shadow-xs">
            <BabyCradleLogo size={24} />
          </span>
          <span className="text-[17px] font-bold text-stone-900 leading-[1.1] tracking-tight">
            Shahana
            <br />
            Baby Shop
          </span>
        </button>

        <button
          type="button"
          onClick={toggleLanguage}
          className="h-10 min-w-12 px-3 shrink-0 rounded-full border border-stone-300 bg-white text-[15px] font-bold text-stone-800 active:bg-stone-100 cursor-pointer"
          aria-label={L(language, 'Switch to English', 'বাংলায় দেখুন')}
        >
          {language === 'bn' ? 'EN' : 'বাং'}
        </button>

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
      </div>

      <form
        className="px-3 pb-3"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          (document.activeElement as HTMLElement | null)?.blur();
          scrollToProducts();
        }}
      >
        <label htmlFor="m-search" className="sr-only">
          {L(language, 'পণ্য খুঁজুন', 'Search products')}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
            <SearchIcon size={20} />
          </span>
          <input
            id="m-search"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // typing from another page (tracking, terms) takes you to the results
              if (currentView !== 'store') navigateToStore();
            }}
            placeholder={L(language, 'দোলনার মডেল বা নাম খুঁজুন...', 'Search cradles by model or name...')}
            className="w-full h-12 rounded-2xl bg-stone-100 border border-stone-200 pl-12 pr-12 text-[16px] text-stone-900 placeholder:text-stone-500 outline-hidden focus:bg-white focus:border-[#f27405] focus:ring-2 focus:ring-orange-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-stone-500 rounded-full active:bg-stone-200 cursor-pointer"
              aria-label={L(language, 'সার্চ মুছুন', 'Clear search')}
            >
              <CloseIcon size={18} />
            </button>
          )}
        </div>
      </form>
    </header>
  );
};

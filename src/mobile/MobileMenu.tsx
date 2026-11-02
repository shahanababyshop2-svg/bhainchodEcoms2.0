import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  BabyCradleLogo,
  ChevronRightIcon,
  CloseIcon,
  FacebookIcon,
  PhoneIcon,
  ShieldCheckIcon,
  TagIcon,
  TruckIcon,
  WhatsAppIcon,
} from '../components/Icons';
import { telHref, whatsappHref } from '../utils/mobileUi';
import { getCategories } from './data';
import { L, useLockBodyScroll } from './ui';
import { useUiMode } from './uiMode';

interface MobileMenuProps {
  onClose: () => void;
}

// Side menu: categories, quick links, and the "Classic view" switch.
// (The language switch lives in the header.)
export const MobileMenu: React.FC<MobileMenuProps> = ({ onClose }) => {
  const {
    language,
    siteConfig,
    setSelectedCategory,
    setSearchQuery,
    navigateToStore,
    navigateToTerms,
    navigateToTracking,
  } = useStore();
  const { setMode } = useUiMode();
  useLockBodyScroll();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const categories = getCategories(siteConfig);

  const pickCategory = (id: string) => {
    setSearchQuery('');
    setSelectedCategory(id);
    navigateToStore();
    onClose();
  };

  const row =
    'w-full min-h-14 px-4 py-2 flex items-center justify-between gap-3 text-left text-[16px] font-bold text-stone-800 active:bg-stone-100 cursor-pointer';
  const sectionTitle = 'px-4 pt-4 pb-1 text-[13px] font-bold tracking-wider uppercase text-stone-500';

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={L(language, 'মেনু', 'Menu')}>
      <div className="absolute inset-0 bg-stone-900/60 sbs-fade-in" onClick={onClose} aria-hidden="true" />

      <div className="sbs-drawer-in absolute inset-y-0 left-0 w-[88%] max-w-sm bg-white shadow-2xl flex flex-col">
        <div className="px-4 h-16 shrink-0 bg-[#FFFDF5] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 shrink-0 rounded-xl bg-[#f27405] text-white flex items-center justify-center">
              <BabyCradleLogo size={24} />
            </span>
            <span className="min-w-0">
              <span className="block text-[17px] font-bold text-stone-900 leading-tight truncate">
                {L(language, 'শাহানা বেবি শপ', 'Shahana Baby Shop')}
              </span>
              <span className="block text-[13px] font-bold text-[#f27405] leading-tight truncate">
                {L(language, 'সোনামণির প্রিমিয়াম দোলনা', 'Premium Baby Cradles')}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-12 h-12 -mr-2 flex items-center justify-center rounded-xl text-stone-600 active:bg-stone-100 cursor-pointer"
            aria-label={L(language, 'মেনু বন্ধ করুন', 'Close menu')}
          >
            <CloseIcon size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className={sectionTitle}>{L(language, 'ক্যাটাগরি সমূহ', 'Categories')}</div>

          <button type="button" onClick={() => pickCategory('safety')} className={`${row} text-rose-700`}>
            <span className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <TagIcon size={20} />
              </span>
              {L(language, 'অফার জোন (স্পেশাল)', 'Offer Zone (Special)')}
            </span>
            <ChevronRightIcon size={20} className="text-stone-400" />
          </button>

          {categories.map((cat) => (
            <button key={cat.id} type="button" onClick={() => pickCategory(cat.id)} className={row}>
              <span className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 shrink-0 rounded-xl bg-orange-50 text-[#f27405] flex items-center justify-center">
                  <BabyCradleLogo size={22} />
                </span>
                <span className="truncate">{language === 'bn' ? cat.titleBn : cat.titleEn}</span>
              </span>
              <ChevronRightIcon size={20} className="text-stone-400 shrink-0" />
            </button>
          ))}

          <div className="mt-2 border-t border-stone-100" />
          <div className={sectionTitle}>{L(language, 'প্রয়োজনীয় লিংক', 'Quick Links')}</div>

          <a href={telHref(siteConfig.phone1)} className={row}>
            <span className="flex items-center gap-3">
              <PhoneIcon size={22} className="text-[#f27405]" />
              {L(language, 'হটলাইন কল করুন', 'Call Helpline')}
            </span>
            <span className="text-[14px] text-[#d96602] tabular-nums">{siteConfig.phone1}</span>
          </a>

          <a
            href={whatsappHref(siteConfig.whatsappNumber, siteConfig.whatsappPrefillText)}
            target="_blank"
            rel="noopener noreferrer"
            className={row}
          >
            <span className="flex items-center gap-3">
              <WhatsAppIcon size={22} className="text-emerald-600" />
              {L(language, 'হোয়াটসঅ্যাপে অর্ডার', 'WhatsApp Order')}
            </span>
            <ChevronRightIcon size={20} className="text-stone-400" />
          </a>

          <button
            type="button"
            onClick={() => {
              navigateToTracking();
              onClose();
            }}
            className={row}
          >
            <span className="flex items-center gap-3">
              <TruckIcon size={22} className="text-[#f27405]" />
              {L(language, 'অর্ডার ট্র্যাক করুন', 'Track Your Order')}
            </span>
            <ChevronRightIcon size={20} className="text-stone-400" />
          </button>

          <button
            type="button"
            onClick={() => {
              navigateToTerms();
              onClose();
            }}
            className={row}
          >
            <span className="flex items-center gap-3">
              <ShieldCheckIcon size={22} className="text-amber-700" />
              {L(language, 'শর্তাবলী (Terms & Conditions)', 'Terms & Conditions')}
            </span>
            <ChevronRightIcon size={20} className="text-stone-400" />
          </button>

          {siteConfig.facebookUrl && (
            <a href={siteConfig.facebookUrl} target="_blank" rel="noopener noreferrer" className={row}>
              <span className="flex items-center gap-3">
                <FacebookIcon size={22} className="text-blue-600" />
                {L(language, 'কাস্টমার রিভিউ গ্রুপ', 'Customer Reviews Group')}
              </span>
              <ChevronRightIcon size={20} className="text-stone-400" />
            </a>
          )}
        </div>

        <div
          className="shrink-0 border-t border-stone-200 bg-stone-50 p-4"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            onClick={() => setMode('classic')}
            className="w-full min-h-14 px-4 rounded-2xl border border-stone-300 bg-white active:bg-stone-100 flex items-center justify-between gap-3 text-left cursor-pointer"
          >
            <span>
              <span className="block text-[16px] font-bold text-stone-900">
                {L(language, 'ক্ল্যাসিক ভিউ', 'Classic view')}
              </span>
              <span className="block text-[14px] text-stone-600 leading-snug">
                {L(language, 'আগের মোবাইল ডিজাইনে ফিরে যান', 'Switch back to the old phone design')}
              </span>
            </span>
            <ChevronRightIcon size={20} className="text-stone-400 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};

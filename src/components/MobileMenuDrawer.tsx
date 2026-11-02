import React from 'react';
import { useStore } from '../context/StoreContext';
import { setUiMode } from '../mobile/uiMode';
import {
  CloseIcon,
  TagIcon,
  ChevronRightIcon,
  PhoneIcon,
  WhatsAppIcon,
  FacebookIcon,
  BabyCradleLogo,
  ShieldCheckIcon,
  TruckIcon,
} from './Icons';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    language,
    toggleLanguage,
    setSelectedCategory,
    navigateToStore,
    navigateToTerms,
    navigateToTracking,
    siteConfig,
  } = useStore();

  if (!isOpen) return null;

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    navigateToStore();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden md:hidden" aria-modal="true" role="dialog">
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out">
        <div className="p-4 bg-[#FFFDF5] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#f27405] text-white flex items-center justify-center shrink-0 shadow-xs">
              <BabyCradleLogo size={20} />
            </div>
            <div>
              <div className="text-sm font-black text-stone-900 leading-tight">
                {language === 'bn' ? 'শাহানা বেবি শপ' : 'Shahana Baby Shop'}
              </div>
              <div className="text-[10px] text-[#f27405] font-bold tracking-wide">
                {language === 'bn' ? 'সোনামণির প্রিমিয়াম দোলনা' : 'Premium Baby Cradles'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
          <div className="py-2">
            <div className="px-4 py-2 text-[11px] font-black tracking-wider uppercase text-stone-400">
              {language === 'bn' ? 'ক্যাটাগরি সমূহ' : 'Categories'}
            </div>

            <button
              type="button"
              onClick={() => handleCategorySelect('safety')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-orange-50/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <TagIcon size={16} />
                </div>
                <span className="text-sm font-bold text-rose-700">
                  {language === 'bn' ? 'অফার জোন (স্পেশাল)' : 'Offer Zone (Special)'}
                </span>
              </div>
              <ChevronRightIcon size={16} className="text-stone-400 group-hover:text-rose-700 transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => handleCategorySelect('all')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-stone-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#f27405] flex items-center justify-center">
                  <BabyCradleLogo size={18} />
                </div>
                <span className="text-sm font-bold text-stone-800">
                  {language === 'bn' ? 'সকল প্রোডাক্ট' : 'All Products'}
                </span>
              </div>
              <ChevronRightIcon size={16} className="text-stone-400 group-hover:text-[#f27405] transition-colors" />
            </button>
          </div>

          <div className="py-2">
            <div className="px-4 py-2 text-[11px] font-black tracking-wider uppercase text-stone-400">
              {language === 'bn' ? 'প্রয়োজনীয় লিংক' : 'Quick Links'}
            </div>

            <a
              href={`tel:${siteConfig.phone1.replace(/[^0-9]/g, '')}`}
              className="px-4 py-3 flex items-center justify-between hover:bg-stone-50 text-stone-700 text-sm font-medium transition-colors"
            >
              <div className="flex items-center gap-3">
                <PhoneIcon size={16} className="text-[#f27405]" />
                <span>{language === 'bn' ? 'হটলাইন কল করুন' : 'Call Helpline'}</span>
              </div>
              <span className="text-xs text-[#f27405] font-bold">{siteConfig.phone1}</span>
            </a>

            <a
              href={`https://wa.me/${siteConfig.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(siteConfig.whatsappPrefillText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 flex items-center justify-between hover:bg-stone-50 text-stone-700 text-sm font-medium transition-colors"
            >
              <div className="flex items-center gap-3">
                <WhatsAppIcon size={16} className="text-emerald-600" />
                <span>{language === 'bn' ? 'হোয়াটসঅ্যাপে অর্ডার' : 'WhatsApp Order'}</span>
              </div>
              <ChevronRightIcon size={16} className="text-stone-400" />
            </a>

            <div className="px-4 py-3 flex items-center gap-3 text-stone-700 text-sm font-medium">
              <TruckIcon size={16} className="text-[#f27405]" />
              <div>
                <div>{language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</div>
                <div className="text-xs text-stone-500">
                  {language === 'bn' ? 'সারা বাংলাদেশে ফ্রি হোম ডেলিভারি' : 'Free home delivery nationwide'}
                </div>
              </div>
            </div>

            <div className="px-4 py-3 flex items-center gap-3 text-stone-700 text-sm font-medium">
              <ShieldCheckIcon size={16} className="text-emerald-600" />
              <div>
                <div>{language === 'bn' ? '১০০% অরিজিনাল পণ্য' : '100% Original Products'}</div>
                <div className="text-xs text-stone-500">
                  {language === 'bn' ? 'পণ্য দেখে মূল্য পরিশোধ করুন' : 'Pay after verifying parcel'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                navigateToTracking();
                onClose();
              }}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-stone-50 text-stone-700 text-sm font-medium transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <TruckIcon size={16} className="text-[#f27405]" />
                <span>{language === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Your Order'}</span>
              </div>
              <ChevronRightIcon size={16} className="text-stone-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                navigateToTerms();
                onClose();
              }}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-stone-50 text-stone-700 text-sm font-medium transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <ShieldCheckIcon size={16} className="text-amber-700" />
                <span>{language === 'bn' ? 'শর্তাবলী (Terms & Conditions)' : 'Terms & Conditions'}</span>
              </div>
              <ChevronRightIcon size={16} className="text-stone-400" />
            </button>

            {siteConfig.facebookUrl && (
              <a
                href={siteConfig.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 flex items-center justify-between hover:bg-stone-50 text-stone-700 text-sm font-medium transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FacebookIcon size={16} className="text-blue-600" />
                  <span>{language === 'bn' ? 'কাস্টমার রিভিউ গ্রুপ' : 'Customer Reviews Group'}</span>
                </div>
                <ChevronRightIcon size={16} className="text-stone-400" />
              </a>
            )}
          </div>

          <div className="p-4 border-t border-stone-100">
            <button
              type="button"
              onClick={() => {
                setUiMode('new');
                onClose();
              }}
              className="w-full px-4 py-3 rounded-xl bg-[#f27405] hover:bg-[#d96602] text-white text-sm font-bold text-left transition-colors cursor-pointer"
            >
              <div>{language === 'bn' ? 'নতুন মোবাইল ভিউ ব্যবহার করুন' : 'Switch to the new phone view'}</div>
              <div className="text-xs font-normal text-orange-100">
                {language === 'bn' ? 'বড় লেখা ও সহজ নেভিগেশন' : 'Bigger text and easier navigation'}
              </div>
            </button>
          </div>

          <div className="p-4 bg-stone-50">
            <div className="text-xs font-bold text-stone-700 mb-2">
              {language === 'bn' ? 'ভাষা পরিবর্তন (Language)' : 'Select Language'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (language !== 'bn') toggleLanguage();
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  language === 'bn'
                    ? 'bg-[#f27405] text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                বাংলা (Bengali)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (language !== 'en') toggleLanguage();
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-[#f27405] text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

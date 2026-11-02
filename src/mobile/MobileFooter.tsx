import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  BabyCradleLogo,
  ChevronRightIcon,
  FacebookIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  TruckIcon,
  WhatsAppIcon,
} from '../components/Icons';
import { ADMIN_PATH } from '../utils/adminRoute';
import { telHref, whatsappHref } from '../utils/mobileUi';
import { L } from './ui';

// Footer for phones: big tap-to-call and WhatsApp buttons, then the links.
export const MobileFooter: React.FC = () => {
  const { language, siteConfig, setCurrentView, navigateToTerms, navigateToTracking } = useStore();

  const linkRow =
    'w-full h-14 px-4 flex items-center justify-between rounded-2xl bg-stone-800 active:bg-stone-700 text-[16px] font-bold text-white cursor-pointer text-left';

  return (
    <footer className="bg-stone-900 text-stone-300 px-4 pt-8 pb-8">
      <div className="flex items-center gap-3">
        <span className="w-12 h-12 rounded-xl bg-[#f27405] text-white flex items-center justify-center shrink-0">
          <BabyCradleLogo size={28} />
        </span>
        <div>
          <div className="text-[20px] font-bold text-white leading-tight">Shahana Baby Shop</div>
          <div className="text-[14px] text-orange-300 font-bold">
            {L(language, 'শাহানা বেবি শপ', 'Sonamoni Premium Store')}
          </div>
        </div>
      </div>

      <p className="mt-4 text-[15px] leading-relaxed text-stone-300">
        {L(
          language,
          'সোনামণির আরামদায়ক ও প্রিমিয়াম দোলনার সমাহার। সারা বাংলাদেশ ফ্রী হোম ডেলিভারি এবং পণ্য হাতে পেয়ে মূল্য পরিশোধ করতে পারবেন।',
          'Premium baby swings and cradles in Bangladesh. Enjoy free nationwide home delivery and pay with cash on delivery.'
        )}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <a
          href={telHref(siteConfig.phone1)}
          className="h-14 rounded-2xl bg-[#f27405] active:bg-[#d96602] text-white text-[16px] font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <PhoneIcon size={20} />
          <span>{L(language, 'কল করুন', 'Call Us')}</span>
        </a>
        <a
          href={whatsappHref(siteConfig.whatsappNumber, 'Hello Shahana Baby Shop, I have a question regarding baby dolna.')}
          target="_blank"
          rel="noopener noreferrer"
          className="h-14 rounded-2xl bg-[#25D366] active:bg-[#1fb257] text-white text-[16px] font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <WhatsAppIcon size={22} />
          <span>{L(language, 'হোয়াটসঅ্যাপ', 'WhatsApp')}</span>
        </a>
      </div>

      <div className="mt-6 space-y-3 text-[15px]">
        <a href={telHref(siteConfig.phone1)} className="flex items-center gap-3 min-h-11">
          <PhoneIcon size={20} className="text-orange-400 shrink-0" />
          <span>
            <span className="block text-[13px] text-stone-400">{L(language, 'হটলাইন ১', 'Hotline 1')}</span>
            <span className="font-bold text-white tabular-nums">{siteConfig.phone1}</span>
          </span>
        </a>
        {siteConfig.phone2 && (
          <a href={telHref(siteConfig.phone2)} className="flex items-center gap-3 min-h-11">
            <PhoneIcon size={20} className="text-orange-400 shrink-0" />
            <span>
              <span className="block text-[13px] text-stone-400">
                {L(language, 'পাইকারি ও তথ্য (কল)', 'Wholesale / Inquiries')}
              </span>
              <span className="font-bold text-white tabular-nums">{siteConfig.phone2}</span>
            </span>
          </a>
        )}
        <div className="flex items-start gap-3 min-h-11">
          <MapPinIcon size={20} className="text-orange-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{language === 'bn' ? siteConfig.storeAddressBn : siteConfig.storeAddressEn}</span>
        </div>
      </div>

      <ul className="mt-6 space-y-2 text-[15px]" aria-label={L(language, 'আমাদের অঙ্গীকার', 'Our promise')}>
        <li className="flex items-center gap-3">
          <TruckIcon size={18} className="text-orange-400 shrink-0" />
          <span>{L(language, 'সারা দেশে ফ্রি হোম ডেলিভারি', 'Free Delivery Everywhere in BD')}</span>
        </li>
        <li className="flex items-center gap-3">
          <ShieldCheckIcon size={18} className="text-orange-400 shrink-0" />
          <span>{L(language, '১০০% হেভি এমএস স্টিল কোয়ালিটি', '100% Genuine MS Steel Frame')}</span>
        </li>
      </ul>

      <div className="mt-6 space-y-3">
        <button type="button" onClick={() => navigateToTracking()} className={linkRow}>
          <span className="flex items-center gap-3">
            <TruckIcon size={20} className="text-orange-400" />
            {L(language, 'অর্ডার ট্র্যাক করুন', 'Track Your Order')}
          </span>
          <ChevronRightIcon size={18} className="text-stone-400" />
        </button>
        <button type="button" onClick={navigateToTerms} className={linkRow}>
          <span className="flex items-center gap-3">
            <ShieldCheckIcon size={20} className="text-orange-400" />
            {L(language, 'শর্তাবলী (Terms & Conditions)', 'Terms & Conditions')}
          </span>
          <ChevronRightIcon size={18} className="text-stone-400" />
        </button>
        {siteConfig.facebookUrl && (
          <a href={siteConfig.facebookUrl} target="_blank" rel="noopener noreferrer" className={linkRow}>
            <span className="flex items-center gap-3">
              <FacebookIcon size={20} className="text-blue-400" />
              {L(language, 'আমাদের ফেসবুক পেজ', 'Our Facebook Page')}
            </span>
            <ChevronRightIcon size={18} className="text-stone-400" />
          </a>
        )}
      </div>

      <div className="mt-8 pt-5 border-t border-stone-800 text-[14px] text-stone-400 space-y-2">
        <p>© 2026 Shahana Baby Shop. {L(language, 'সর্বস্বত্ব সংরক্ষিত।', 'All rights reserved.')}</p>
        <a
          href={ADMIN_PATH}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            setCurrentView('admin');
          }}
          className="inline-flex items-center min-h-11 underline text-stone-500"
        >
          {L(language, 'স্টোর অ্যাডমিন প্যানেল', 'Store Admin Dashboard')}
        </a>
      </div>
    </footer>
  );
};

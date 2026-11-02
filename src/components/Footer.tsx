import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  BabyCradleLogo,
  PhoneIcon,
  WhatsAppIcon,
  MapPinIcon,
  FacebookIcon,
  ShieldCheckIcon,
  TruckIcon,
  LockIcon,
} from './Icons';
import { ADMIN_PATH } from '../utils/adminRoute';

export const Footer: React.FC = () => {
  const { language, siteConfig, setCurrentView, setSelectedCategory, navigateToStore, navigateToTerms, navigateToTracking } = useStore();

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    navigateToStore();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanWhatsapp = siteConfig.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    'Hello Shahana Baby Shop, I have a question regarding baby dolna.'
  )}`;

  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-stone-800">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center">
                <BabyCradleLogo size={24} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">Shahana Baby Shop</h3>
                <p className="text-xs text-amber-500 font-medium">
                  {language === 'bn' ? 'শাহানা বেবি শপ' : 'Sonamoni Premium Store'}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              {language === 'bn'
                ? 'সোনামণির আরামদায়ক ও প্রিমিয়াম দোলনার সমাহার। সারা বাংলাদেশ ফ্রী হোম ডেলিভারি এবং পণ্য হাতে পেয়ে মূল্য পরিশোধ করতে পারবেন।'
                : 'Premium baby swings and cradles in Bangladesh. Enjoy free nationwide home delivery and pay with cash on delivery.'}
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a
                href={siteConfig.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center transition-colors"
                aria-label="Shahana Baby Shop Facebook Page"
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors"
                aria-label="Contact via WhatsApp"
              >
                <WhatsAppIcon size={18} />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {language === 'bn' ? 'ক্যাটাগরি সমূহ' : 'Categories'}
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('dolna')}
                  className="hover:text-amber-400 transition-colors"
                >
                  {language === 'bn' ? 'বেবি দোলনা (Baby Swing)' : 'Baby Swings'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('safety')}
                  className="hover:text-amber-400 transition-colors"
                >
                  {language === 'bn' ? '৫০১ সেফটি লক মডেল' : '501 Safety Lock Model'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('dolna')}
                  className="hover:text-amber-400 transition-colors"
                >
                  {language === 'bn' ? '৭৩৩ বেস্ট সেলার মডেল' : '733 Best Seller Model'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('bedding')}
                  className="hover:text-amber-400 transition-colors"
                >
                  {language === 'bn' ? 'বেবি বেডিং ও মশারি' : 'Bedding & Mosquito Nets'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="hover:text-amber-400 transition-colors"
                >
                  {language === 'bn' ? 'সকল পণ্য কালেকশন' : 'All Products Catalog'}
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {language === 'bn' ? 'যোগাযোগ ও হেল্পলাইন' : 'Helpline & Contact'}
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <PhoneIcon size={16} className="text-amber-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-stone-500">
                    {language === 'bn' ? 'হটলাইন ১' : 'Hotline 1'}
                  </div>
                  <a
                    href={`tel:${siteConfig.phone1.replace(/[^0-9]/g, '')}`}
                    className="font-bold text-white hover:text-amber-400"
                  >
                    {siteConfig.phone1}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PhoneIcon size={16} className="text-amber-500 shrink-0" />
                <div>
                  <div className="text-[10px] text-stone-500">
                    {language === 'bn' ? 'পাইকারি ও তথ্য (কল)' : 'Wholesale / Inquiries'}
                  </div>
                  <a
                    href={`tel:${siteConfig.phone2.replace(/[^0-9]/g, '')}`}
                    className="font-bold text-white hover:text-amber-400"
                  >
                    {siteConfig.phone2}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPinIcon size={16} className="text-amber-500 shrink-0" />
                <span>
                  {language === 'bn' ? siteConfig.storeAddressBn : siteConfig.storeAddressEn}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {language === 'bn' ? 'আমাদের অঙ্গীকার' : 'Our Promise'}
            </h4>
            <div className="space-y-2 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <TruckIcon size={15} className="text-amber-500" />
                <span>{language === 'bn' ? 'সারা দেশে ফ্রি হোম ডেলিভারি' : 'Free Delivery Everywhere in BD'}</span>
              </div>
              <div className="flex items-center gap-2">
                <LockIcon size={15} className="text-amber-500" />
                <span>{language === 'bn' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'Cash on Delivery (Safe Payment)'}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon size={15} className="text-amber-500" />
                <span>{language === 'bn' ? '১০০% হেভি এমএস স্টিল কোয়ালিটি' : '100% Genuine MS Steel Frame'}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col items-start gap-2">
              <button
                type="button"
                onClick={() => navigateToTracking()}
                className="text-xs text-amber-500 hover:text-amber-400 underline font-semibold"
              >
                {language === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Your Order'}
              </button>
              <button
                type="button"
                onClick={navigateToTerms}
                className="text-xs text-amber-500 hover:text-amber-400 underline font-semibold"
              >
                {language === 'bn' ? 'শর্তাবলী (Terms & Conditions)' : 'Terms & Conditions'}
              </button>
              <a
                href={ADMIN_PATH}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  setCurrentView('admin');
                }}
                className="text-xs text-stone-500 hover:text-amber-400 underline"
              >
                {language === 'bn' ? 'স্টোর অ্যাডমিন প্যানেল' : 'Store Admin Dashboard'}
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <p>
            © 2026 Shahana Baby Shop. {language === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
          </p>
          <p>
            {language === 'bn'
              ? 'বিশ্বস্ত ও নিরাপদ বেবি শপিং প্ল্যাটফর্ম'
              : 'Trusted & Secure Baby Shopping Platform'}
          </p>
        </div>
      </div>
    </footer>
  );
};

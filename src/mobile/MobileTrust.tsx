import React from 'react';
import { useStore } from '../context/StoreContext';
import { LockIcon, RefreshIcon, ShieldCheckIcon, TruckIcon } from '../components/Icons';
import { L } from './ui';

// The four trust points, under the products. Full text is kept (same wording as the
// original TrustFeatures), one card per row so each reads at full size.
export const MobileTrust: React.FC = () => {
  const { language } = useStore();

  const features = [
    {
      icon: ShieldCheckIcon,
      bn: ['১০০% হেভি এমএস স্টিল ফ্রেম', 'প্লাস্টিক নয়, খাঁটি এমএস স্টিল পাইপ দিয়ে তৈরি দীর্ঘস্থায়ী ফ্রেম।'],
      en: ['100% Heavy MS Steel Frame', 'Durable, rust-free & completely safe. Not cheap plastic.'],
    },
    {
      icon: LockIcon,
      bn: ['প্রিমিয়াম সেফটি লক সিস্টেম', 'প্রয়োজনে দোলনা এক জায়গায় লক করে রাখার বিশেষ সুবিধা।'],
      en: ['Patented Safety Lock System', 'Locks swing in fixed position to keep baby secure.'],
    },
    {
      icon: TruckIcon,
      bn: ['পণ্য কিনলে ডেলিভারি ফ্রি', 'ঢাকার ভেতরে বা বাইরে যেকোনো জেলায় ডেলিভারি চার্জ সম্পূর্ণ ফ্রি।'],
      en: ['If you buy the product, delivery is free', 'Zero delivery charges to any district in Bangladesh.'],
    },
    {
      icon: RefreshIcon,
      bn: ['পণ্য দেখে মূল্য পরিশোধ (COD)', 'পার্সেল খুলে দেখে সন্তুষ্ট হয়ে ডেলিভারিম্যানকে টাকা দিন।'],
      en: ['Cash on Delivery Guarantee', 'Inspect the parcel first, pay afterwards with confidence.'],
    },
  ];

  return (
    <section className="mt-6 bg-white border-y border-stone-200 py-6 px-3" aria-label={L(language, 'কেন আমাদের থেকে কিনবেন', 'Why buy from us')}>
      <h2 className="text-[20px] font-bold text-stone-900 text-center mb-4">
        {L(language, 'কেন শাহানা বেবি শপ?', 'Why Shahana Baby Shop?')}
      </h2>
      <ul className="flex flex-col gap-3">
        {features.map((f, i) => {
          const Icon = f.icon;
          const [title, desc] = language === 'bn' ? f.bn : f.en;
          return (
            <li key={i} className="flex items-start gap-3.5 rounded-2xl bg-orange-50/60 border border-orange-100 p-4">
              <span className="w-12 h-12 shrink-0 rounded-xl bg-white border border-orange-100 text-[#f27405] flex items-center justify-center">
                <Icon size={24} />
              </span>
              <div className="min-w-0">
                <h3 className="text-[16px] leading-snug font-bold text-stone-900">{title}</h3>
                <p className="mt-0.5 text-[15px] leading-relaxed text-stone-600">{desc}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

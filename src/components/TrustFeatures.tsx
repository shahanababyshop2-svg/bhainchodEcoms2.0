import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheckIcon, TruckIcon, LockIcon, RefreshIcon } from './Icons';

export const TrustFeatures: React.FC = () => {
  const { language } = useStore();

  const features = [
    {
      icon: ShieldCheckIcon,
      titleEn: '100% Heavy MS Steel Frame',
      titleBn: '১০০% হেভি এমএস স্টিল ফ্রেম',
      descEn: 'Durable, rust-free & completely safe. Not cheap plastic.',
      descBn: 'প্লাস্টিক নয়, খাঁটি এমএস স্টিল পাইপ দিয়ে তৈরি দীর্ঘস্থায়ী ফ্রেম।',
    },
    {
      icon: LockIcon,
      titleEn: 'Patented Safety Lock System',
      titleBn: 'প্রিমিয়াম সেফটি লক সিস্টেম',
      descEn: 'Locks swing in fixed position to keep baby secure.',
      descBn: 'প্রয়োজনে দোলনা এক জায়গায় লক করে রাখার বিশেষ সুবিধা।',
    },
    {
      icon: TruckIcon,
      titleEn: 'If you buy the product, delivery is free',
      titleBn: 'পণ্য কিনলে ডেলিভারি ফ্রি',
      descEn: 'Zero delivery charges to any district in Bangladesh.',
      descBn: 'ঢাকার ভেতরে বা বাইরে যেকোনো জেলায় ডেলিভারি চার্জ সম্পূর্ণ ফ্রি।',
    },
    {
      icon: RefreshIcon,
      titleEn: 'Cash on Delivery Guarantee',
      titleBn: 'পণ্য দেখে মূল্য পরিশোধ (COD)',
      descEn: 'Inspect the parcel first, pay afterwards with confidence.',
      descBn: 'পার্সেল খুলে দেখে সন্তুষ্ট হয়ে ডেলিভারিম্যানকে টাকা দিন।',
    },
  ];

  return (
    <section className="bg-white border-b border-stone-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 shrink-0 border border-amber-100">
                  <Icon size={22} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-stone-900">
                    {language === 'bn' ? feat.titleBn : feat.titleEn}
                  </h2>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                    {language === 'bn' ? feat.descBn : feat.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

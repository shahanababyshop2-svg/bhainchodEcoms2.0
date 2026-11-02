import React from 'react';
import { useStore } from '../context/StoreContext';
import { FacebookIcon, StarIcon, ShieldCheckIcon, UserIcon, ArrowRightIcon } from './Icons';

export const CustomerReviews: React.FC = () => {
  const { language, siteConfig } = useStore();

  const reviews = [
    {
      name: 'উম্মে কুলসুম (Umme Kulsum)',
      location: 'মিরপুর, ঢাকা',
      rating: 5,
      date: '৪ দিন আগে',
      commentBn: 'Shano Gen 6 দোলনাটি নেওয়ার পর আমার বাচ্চার ঘুম অনেক শান্ত হয়েছে। স্টিলের কোয়ালিটি অনেক হেভি এবং মশারিটা খুব ভালো। সাথে ফ্রি বেড সেট পেয়েছি।',
      commentEn: 'Bought the Shano Gen 6 cradle. The steel quality is truly heavy and mosquito net protects baby well. Free bed set was also great.',
      model: 'Shano Gen 6',
    },
    {
      name: 'আরিফুল ইসলাম (Ariful Islam)',
      location: 'পাঁচলাইশ, চট্টগ্রাম',
      rating: 5,
      date: '১ সপ্তাহ আগে',
      commentBn: 'প্রথমে ভেবেছিলাম প্লাস্টিক হবে কিনা, কিন্তু হাতে পেয়ে দেখলাম একদম নিখুঁত এমএস স্টিলের ফ্রেম। সেফটি লক চমৎকার কাজ করে। ১০০% রেকমেন্ড করি!',
      commentEn: 'Solid MS steel frame, not cheap plastic. The safety lock gives peace of mind. Arrived on time with cash on delivery.',
      model: 'Model 501 Safety Lock',
    },
    {
      name: 'সাবরিনা সুলতানা (Sabrina Sultana)',
      location: 'উপশহর, রাজশাহী',
      rating: 5,
      date: '২ সপ্তাহ আগে',
      commentBn: '৭৩৩ মডেলের দোলনাটি নিয়েছি। দেখতে যেমন সুন্দর, বিল্ড কোয়ালিটিও সেরকম মজবুত। ডেলিভারি ম্যানের সামনে খুলে দেখে মূল্য পরিশোধ করেছি।',
      commentEn: 'Ordered the 733 model. Elegant look, robust build, and paid COD after inspecting the package. Highly satisfied.',
      model: 'Model 733 Best Seller',
    },
  ];

  return (
    <section className="bg-stone-100/70 border-t border-b border-stone-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
              <ShieldCheckIcon size={16} />
              <span>{language === 'bn' ? 'বিশ্বস্ত গ্রাহকদের মতামত' : 'Customer Reviews & Social Proof'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              {language === 'bn' ? '৪,৮০০+ অভিভাবকের প্রথম পছন্দ' : 'Trusted by 4,800+ Parents'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
              {language === 'bn'
                ? 'আমাদের ফেসবুক পেজ ও রিভিউ গ্রুপে সম্মানিত কাস্টমারদের বাস্তব অভিজ্ঞতা ও মতামত।'
                : 'Real reviews and feedback from verified buyers across Bangladesh.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-3 pr-4 border-r border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <FacebookIcon size={22} />
              </div>
              <div>
                <div className="text-sm font-bold text-stone-900">4.8K+ Followers</div>
                <div className="text-[11px] text-stone-500 font-medium">100% Recommend</div>
              </div>
            </div>

            <a
              href={siteConfig.reviewGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 group"
            >
              <span>{language === 'bn' ? 'রিভিউ গ্রুপে যোগ দিন' : 'Join Review Group'}</span>
              <ArrowRightIcon size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-stone-200 shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <StarIcon key={i} size={14} filled={true} />
                  ))}
                  <span className="text-[11px] text-stone-500 font-medium ml-1">
                    {rev.model}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                  "{language === 'bn' ? rev.commentBn : rev.commentEn}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center">
                    <UserIcon size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-900">{rev.name}</h3>
                    <p className="text-[10px] text-stone-500">{rev.location}</p>
                  </div>
                </div>
                <span className="text-[10px] text-stone-400">{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

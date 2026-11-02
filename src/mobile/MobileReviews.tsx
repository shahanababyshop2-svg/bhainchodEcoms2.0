import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRightIcon, FacebookIcon, StarIcon, UserIcon } from '../components/Icons';
import { REVIEWS } from './data';
import { L } from './ui';

// Customer reviews as a swipe row of readable cards, with a big button to the review group.
export const MobileReviews: React.FC = () => {
  const { language, siteConfig } = useStore();

  return (
    <section className="py-8 bg-stone-100/70" aria-labelledby="m-reviews-title">
      <div className="px-4">
        <h2 id="m-reviews-title" className="text-[22px] leading-snug font-bold text-stone-900">
          {L(language, '৪,৮০০+ অভিভাবকের প্রথম পছন্দ', 'Trusted by 4,800+ Parents')}
        </h2>
        <p className="mt-1 text-[15px] leading-relaxed text-stone-600">
          {L(
            language,
            'আমাদের ফেসবুক পেজ ও রিভিউ গ্রুপে সম্মানিত কাস্টমারদের বাস্তব অভিজ্ঞতা ও মতামত।',
            'Real reviews and feedback from verified buyers across Bangladesh.'
          )}
        </p>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto snap-x snap-mandatory sbs-no-scrollbar px-4 pb-2">
        {REVIEWS.map((rev) => (
          <figure
            key={rev.name}
            className="snap-start shrink-0 w-[85%] rounded-3xl bg-white border border-stone-200 shadow-2xs p-5 flex flex-col"
          >
            <div className="flex items-center gap-1 text-amber-500" aria-label={L(language, '৫ তারকা', '5 stars')}>
              {[0, 1, 2, 3, 4].map((i) => (
                <StarIcon key={i} size={18} filled={true} />
              ))}
            </div>
            <div className="mt-1 text-[13px] font-bold text-stone-500">{rev.model}</div>
            <blockquote className="mt-3 text-[16px] leading-relaxed text-stone-800 flex-1">
              “{language === 'bn' ? rev.commentBn : rev.commentEn}”
            </blockquote>
            <figcaption className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-3">
              <span className="w-10 h-10 shrink-0 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center">
                <UserIcon size={20} />
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] leading-tight font-bold text-stone-900">{rev.name}</span>
                <span className="block text-[13px] text-stone-500">
                  {rev.location} · {rev.date}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="px-4 mt-4">
        <a
          href={siteConfig.reviewGroupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-14 rounded-2xl bg-white border border-blue-200 text-blue-800 active:bg-blue-50 text-[16px] font-bold flex items-center justify-center gap-3 cursor-pointer"
        >
          <FacebookIcon size={22} />
          <span>{L(language, 'রিভিউ গ্রুপে যোগ দিন', 'Join Review Group')}</span>
          <ArrowRightIcon size={18} />
        </a>
      </div>
    </section>
  );
};

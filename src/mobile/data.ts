import { FeaturedCategoryItem, SiteConfig } from '../types';

// Same defaults as the original FeaturedCategories component, so the phone UI shows the
// same categories until the admin saves their own in the UI Customizer.
export const DEFAULT_CATEGORIES: FeaturedCategoryItem[] = [
  { id: 'all', titleEn: 'All Cradles', titleBn: 'সকল দোলনা', badge: 'Popular', image: '/assets/products/shano-gen4-poster.png' },
  { id: 'dolna', titleEn: 'Baby Dolna', titleBn: 'বেবি দোলনা', badge: 'Best Seller', image: '/assets/products/steel-cradle-offer.png' },
  { id: 'safety', titleEn: 'Safety Lock', titleBn: 'সেফটি লক', badge: 'Special', image: '/assets/products/safety-swing-placeholder.png' },
  { id: 'bedding', titleEn: 'Bedding Sets', titleBn: 'বেড সেট ও নেট', badge: 'Cotton', image: '/assets/products/shano-gen4-poster.png' },
  { id: 'accessories', titleEn: 'Accessories', titleBn: 'এক্সেসরিজ', badge: 'Genuine', image: '/assets/products/steel-cradle-offer.png' },
];

export function getCategories(config: SiteConfig): FeaturedCategoryItem[] {
  return config.featuredCategories && config.featuredCategories.length > 0
    ? config.featuredCategories
    : DEFAULT_CATEGORIES;
}

// Same reviews as src/components/CustomerReviews.tsx (they are fixed text there too).
// If you change one list, change the other.
export const REVIEWS = [
  {
    name: 'উম্মে কুলসুম (Umme Kulsum)',
    location: 'মিরপুর, ঢাকা',
    date: '৪ দিন আগে',
    commentBn: 'Shano Gen 6 দোলনাটি নেওয়ার পর আমার বাচ্চার ঘুম অনেক শান্ত হয়েছে। স্টিলের কোয়ালিটি অনেক হেভি এবং মশারিটা খুব ভালো। সাথে ফ্রি বেড সেট পেয়েছি।',
    commentEn: 'Bought the Shano Gen 6 cradle. The steel quality is truly heavy and mosquito net protects baby well. Free bed set was also great.',
    model: 'Shano Gen 6',
  },
  {
    name: 'আরিফুল ইসলাম (Ariful Islam)',
    location: 'পাঁচলাইশ, চট্টগ্রাম',
    date: '১ সপ্তাহ আগে',
    commentBn: 'প্রথমে ভেবেছিলাম প্লাস্টিক হবে কিনা, কিন্তু হাতে পেয়ে দেখলাম একদম নিখুঁত এমএস স্টিলের ফ্রেম। সেফটি লক চমৎকার কাজ করে। ১০০% রেকমেন্ড করি!',
    commentEn: 'Solid MS steel frame, not cheap plastic. The safety lock gives peace of mind. Arrived on time with cash on delivery.',
    model: 'Model 501 Safety Lock',
  },
  {
    name: 'সাবরিনা সুলতানা (Sabrina Sultana)',
    location: 'উপশহর, রাজশাহী',
    date: '২ সপ্তাহ আগে',
    commentBn: '৭৩৩ মডেলের দোলনাটি নিয়েছি। দেখতে যেমন সুন্দর, বিল্ড কোয়ালিটিও সেরকম মজবুত। ডেলিভারি ম্যানের সামনে খুলে দেখে মূল্য পরিশোধ করেছি।',
    commentEn: 'Ordered the 733 model. Elegant look, robust build, and paid COD after inspecting the package. Highly satisfied.',
    model: 'Model 733 Best Seller',
  },
];

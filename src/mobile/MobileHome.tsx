import React from 'react';
import { useStore } from '../context/StoreContext';
import { filterProducts } from '../utils/pricing';
import { CloseIcon, FlameIcon, SearchIcon } from '../components/Icons';
import { MobileBanner } from './MobileBanner';
import { MobileCategoryGrid } from './MobileCategoryGrid';
import { MobileProductCard } from './MobileProductCard';
import { MobileTrust } from './MobileTrust';
import { MobileReviews } from './MobileReviews';
import { getCategories } from './data';
import { L, num } from './ui';

// Home page. Normally: banner, category tiles, big product cards, trust points, reviews.
// While searching or after picking a category it becomes a plain results list, so the
// customer lands straight on the products instead of scrolling past the banner.
export const MobileHome: React.FC = () => {
  const { products, searchQuery, selectedCategory, language, setSearchQuery, setSelectedCategory, siteConfig } = useStore();

  const filtered = filterProducts(products, searchQuery, selectedCategory);
  const query = searchQuery.trim();
  const filtering = query !== '' || selectedCategory !== 'all';
  const categories = getCategories(siteConfig);

  const reset = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  return (
    <>
      {!filtering && <MobileBanner />}
      {!filtering && <MobileCategoryGrid />}

      <section id="m-products" className="scroll-mt-36 px-3 pt-6 pb-2" aria-labelledby="m-products-title">
        {filtering ? (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto sbs-no-scrollbar -mx-3 px-3 pb-1" role="group" aria-label={L(language, 'ক্যাটাগরি', 'Categories')}>
              {categories.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    aria-pressed={active}
                    className={`h-11 shrink-0 px-4 rounded-full border text-[15px] font-bold whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-[#f27405] border-[#f27405] text-white'
                        : 'bg-white border-stone-300 text-stone-800 active:bg-stone-100'
                    }`}
                  >
                    {language === 'bn' ? cat.titleBn : cat.titleEn}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <h2 id="m-products-title" className="text-[18px] font-bold text-stone-900 min-w-0">
                {query ? (
                  <span className="inline-flex items-center gap-2 max-w-full">
                    <SearchIcon size={18} className="text-stone-500 shrink-0" />
                    <span className="truncate">“{query}”</span>
                  </span>
                ) : (
                  L(language, 'নির্বাচিত ক্যাটাগরি', 'Selected category')
                )}
                <span className="ml-2 text-[15px] font-normal text-stone-600">
                  {L(language, `${num(language, filtered.length)}টি পণ্য`, `${filtered.length} found`)}
                </span>
              </h2>
              <button
                type="button"
                onClick={reset}
                className="h-11 shrink-0 px-3 rounded-xl text-[15px] font-bold text-[#d96602] inline-flex items-center gap-1.5 active:bg-orange-50 cursor-pointer"
              >
                <CloseIcon size={16} />
                <span>{L(language, 'মুছুন', 'Clear')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-[14px] font-bold text-[#f27405] uppercase tracking-wide">
              <FlameIcon size={16} className="text-[#f27405]" />
              <span>{L(language, 'টপ সেলিং প্রোডাক্টস', 'Top Selling Products')}</span>
            </div>
            <h2 id="m-products-title" className="mt-1 text-[22px] leading-snug font-bold text-stone-900">
              {L(language, 'সোনামণির আরামদায়ক ও প্রিমিয়াম দোলনা', 'Premium Baby Cradles & Swings')}
            </h2>
            <p className="mt-1 text-[15px] leading-relaxed text-stone-600">
              {L(
                language,
                'সারা বাংলাদেশে হোম ডেলিভারি এবং পণ্য হাতে পেয়ে মূল্য পরিশোধ (ক্যাশ অন ডেলিভারি)',
                'Reliable quality, maximum comfort, and Cash on Delivery nationwide.'
              )}
            </p>
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 items-stretch">
            {filtered.map((product, i) => (
              <MobileProductCard key={product.id} product={product} priority={i < 2 && !filtering} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white border border-stone-200 p-8 text-center">
            <p className="text-[16px] text-stone-700 leading-relaxed">
              {L(language, 'আপনার সার্চ অনুযায়ী কোনো দোলনা পাওয়া যায়নি।', 'No products matched your search.')}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-4 h-12 px-6 rounded-2xl bg-[#f27405] active:bg-[#d96602] text-white text-[16px] font-bold cursor-pointer"
            >
              {L(language, 'সকল পণ্য দেখুন', 'View All Products')}
            </button>
          </div>
        )}
      </section>

      {!filtering && <MobileTrust />}
      {!filtering && <MobileReviews />}
    </>
  );
};

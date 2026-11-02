import React, { useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { optimizedImage } from '../utils/imageUrl';
import { ChevronLeftIcon, ChevronRightIcon, BabyCradleLogo, ShieldCheckIcon, TruckIcon, StarIcon } from './Icons';

export const FeaturedCategories: React.FC = () => {
  const { language, selectedCategory, setSelectedCategory, navigateToStore, siteConfig } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const defaultCategories = [
    {
      id: 'all',
      titleEn: 'All Cradles',
      titleBn: 'সকল দোলনা',
      badge: 'Popular',
      image: '/assets/products/shano-gen4-poster.png',
    },
    {
      id: 'dolna',
      titleEn: 'Baby Dolna',
      titleBn: 'বেবি দোলনা',
      badge: 'Best Seller',
      image: '/assets/products/steel-cradle-offer.png',
    },
    {
      id: 'safety',
      titleEn: 'Safety Lock',
      titleBn: 'সেফটি লক',
      badge: 'Special',
      image: '/assets/products/safety-swing-placeholder.png',
    },
    {
      id: 'bedding',
      titleEn: 'Bedding Sets',
      titleBn: 'বেড সেট ও নেট',
      badge: 'Cotton',
      image: '/assets/products/shano-gen4-poster.png',
    },
    {
      id: 'accessories',
      titleEn: 'Accessories',
      titleBn: 'এক্সেসরিজ',
      badge: 'Genuine',
      image: '/assets/products/steel-cradle-offer.png',
    },
  ];

  const categories = siteConfig.featuredCategories && siteConfig.featuredCategories.length > 0
    ? siteConfig.featuredCategories
    : defaultCategories;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -180, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 180, behavior: 'smooth' });
    }
  };

  const handleSelect = (id: string) => {
    setSelectedCategory(id);
    navigateToStore();
  };

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
          {language === 'bn' ? 'ফিচার্ড ক্যাটাগরি' : 'Featured Categories'}
        </h2>
      </div>

      <div className="relative group">
        <button
          type="button"
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 sm:-translate-x-3 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#f27405] text-white flex items-center justify-center shadow-lg hover:bg-[#d96602] active:scale-95 transition-all cursor-pointer"
          aria-label="Previous categories"
        >
          <ChevronLeftIcon size={18} />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-2 px-6 sm:px-8 scroll-smooth"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className={`flex flex-col items-center justify-center shrink-0 w-24 sm:w-32 p-3 rounded-2xl border transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'border-[#f27405] bg-orange-50/70 shadow-md ring-1 ring-[#f27405]'
                    : 'border-stone-200 bg-white hover:border-orange-200 hover:shadow-xs'
                }`}
              >
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl bg-stone-50 border border-stone-100 p-1 flex items-center justify-center overflow-hidden mb-2">
                  <img
                    src={optimizedImage(cat.image, 160)}
                    width={72}
                    height={72}
                    loading="lazy"
                    decoding="async"
                    alt={cat.titleEn}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <span className="text-xs sm:text-sm font-bold text-stone-800 line-clamp-1">
                  {language === 'bn' ? cat.titleBn : cat.titleEn}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-3 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#f27405] text-white flex items-center justify-center shadow-lg hover:bg-[#d96602] active:scale-95 transition-all cursor-pointer"
          aria-label="Next categories"
        >
          <ChevronRightIcon size={18} />
        </button>
      </div>
    </section>
  );
};

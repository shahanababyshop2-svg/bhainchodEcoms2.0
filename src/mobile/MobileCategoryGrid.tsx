import React from 'react';
import { useStore } from '../context/StoreContext';
import { optimizedImage } from '../utils/imageUrl';
import { getCategories } from './data';
import { L } from './ui';

// Category tiles in a 3-column grid, so every category is visible without swiping.
// An odd last row (5 tiles = 3 + 2) is centred.
export const MobileCategoryGrid: React.FC = () => {
  const { language, siteConfig, selectedCategory, setSelectedCategory } = useStore();
  const categories = getCategories(siteConfig);

  const pick = (id: string) => {
    setSelectedCategory(id);
    // "All" stays on the home page; a real category switches to its product list at the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="px-3 pt-6" aria-labelledby="m-cat-title">
      <h2 id="m-cat-title" className="text-center text-[20px] font-bold text-stone-900 mb-3">
        {L(language, 'ফিচার্ড ক্যাটাগরি', 'Featured Categories')}
      </h2>
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((cat) => {
          const selected = selectedCategory === cat.id;
          const name = language === 'bn' ? cat.titleBn : cat.titleEn;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => pick(cat.id)}
              aria-pressed={selected}
              className={`w-[calc((100%-1.5rem)/3)] rounded-2xl border bg-white p-2 flex flex-col items-center cursor-pointer active:scale-[0.97] transition-transform ${
                selected ? 'border-[#f27405] ring-2 ring-orange-200 bg-orange-50/60' : 'border-stone-200 shadow-2xs'
              }`}
            >
              <span className="w-full aspect-square rounded-xl bg-stone-50 flex items-center justify-center overflow-hidden">
                <img
                  src={optimizedImage(cat.image, 160)}
                  alt=""
                  width={110}
                  height={110}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-1"
                />
              </span>
              <span className="mt-2 min-h-[2.75rem] flex items-center text-[14px] leading-tight font-bold text-stone-800 text-center">
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

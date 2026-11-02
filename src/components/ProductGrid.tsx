import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { filterProducts } from '../utils/pricing';
import { CloseIcon, SearchIcon, FlameIcon } from './Icons';

export const ProductGrid: React.FC = () => {
  const { products, searchQuery, selectedCategory, language, setSearchQuery, setSelectedCategory } =
    useStore();

  const filtered = filterProducts(products, searchQuery, selectedCategory);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 sm:mb-8">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#f27405] uppercase tracking-wider">
            <FlameIcon size={14} className="text-[#f27405]" />
            <span>{language === 'bn' ? 'টপ সেলিং প্রোডাক্টস' : 'Top Selling Products'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
            {language === 'bn' ? 'সোনামণির আরামদায়ক ও প্রিমিয়াম দোলনা' : 'Premium Baby Cradles & Swings'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            {language === 'bn'
              ? 'সারা বাংলাদেশে হোম ডেলিভারি এবং পণ্য হাতে পেয়ে মূল্য পরিশোধ (ক্যাশ অন ডেলিভারি)'
              : 'Reliable quality, maximum comfort, and Cash on Delivery nationwide.'}
          </p>
        </div>

        {(searchQuery || selectedCategory !== 'all') && (
          <div className="flex items-center gap-2 flex-wrap">
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-900 font-medium">
                <SearchIcon size={12} />
                <span>&quot;{searchQuery}&quot;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-stone-900 ml-1"
                  aria-label="Clear search"
                >
                  <CloseIcon size={12} />
                </button>
              </span>
            )}

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-900 font-medium">
                <span>{selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="hover:text-stone-900 ml-1"
                  aria-label="Clear category filter"
                >
                  <CloseIcon size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
          <p className="text-stone-600 text-sm mb-4">
            {language === 'bn'
              ? 'আপনার সার্চ অনুযায়ী কোনো দোলনা পাওয়া যায়নি।'
              : 'No products matched your search criteria.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#f27405] text-white text-xs font-bold hover:bg-[#d96602] transition-colors"
          >
            {language === 'bn' ? 'সকল পণ্য দেখুন' : 'View All Products'}
          </button>
        </div>
      )}
    </section>
  );
};

import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPriceBDT, calculateDiscount, toBengaliDigits } from '../utils/pricing';
import { ShoppingBagIcon, FlameIcon, CheckIcon } from './Icons';
import { optimizedImage, optimizedSrcSet } from '../utils/imageUrl';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language, openCheckout, navigateToProduct, siteConfig } = useStore();
  const discountPercent = calculateDiscount(product.originalPrice, product.price);

  return (
    <div className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div
        onClick={() => navigateToProduct(product.id)}
        className="relative w-full aspect-square bg-white p-3 sm:p-4 flex items-center justify-center overflow-hidden border-b border-stone-100 cursor-pointer"
      >
        <img
          src={optimizedImage(product.image, 400)}
          srcSet={optimizedSrcSet(product.image, 400)}
          width={400}
          height={400}
          loading="lazy"
          decoding="async"
          alt={product.titleEn}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-2.5 right-2.5 bg-[#e53e3e] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
          <FlameIcon size={11} className="text-white" />
          <span>{language === 'bn' ? 'বেস্ট সেলিং' : 'Best Selling'}</span>
        </div>

        {discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
            {language === 'bn'
              ? `${toBengaliDigits(discountPercent)}% ছাড়`
              : `${discountPercent}% OFF`}
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="text-[10px] font-extrabold text-[#f27405] uppercase tracking-wider">
            {product.modelNo}
          </div>

          <h3
            onClick={() => navigateToProduct(product.id)}
            className="mt-0.5 text-xs sm:text-sm font-bold text-stone-900 hover:text-[#f27405] cursor-pointer line-clamp-2 transition-colors leading-tight"
          >
            {language === 'bn' ? product.titleBn : product.titleEn}
          </h3>

          <div className="mt-1 flex items-center gap-1 text-[11px] text-stone-500">
            <CheckIcon size={12} className="text-emerald-600 shrink-0" />
            <span className="truncate">
              {language === 'bn' ? 'ফ্রি বেড সেট ও মশারি' : 'Free Bedding & Net'}
            </span>
          </div>
        </div>

        <div>
          <div className="pt-1 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-black text-[#f27405] tabular-nums">
              {formatPriceBDT(product.price, language)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[11px] text-stone-400 line-through tabular-nums">
                {formatPriceBDT(product.originalPrice, language)}
              </span>
            )}
          </div>

          <div className="mt-2.5 space-y-1.5">
            <button
              type="button"
              onClick={() => openCheckout(product)}
              className="w-full py-1.5 px-2 bg-[#102a27] hover:bg-[#163b36] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95"
            >
              <ShoppingBagIcon size={13} />
              <span>{language === 'bn' ? 'সরাসরি অর্ডার' : 'Buy Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

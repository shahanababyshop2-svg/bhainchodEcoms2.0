import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPriceBDT } from '../utils/pricing';
import { optimizedImage, optimizedSrcSet } from '../utils/imageUrl';
import { ShoppingBagIcon } from '../components/Icons';
import { L } from './ui';

interface MobileProductCardProps {
  product: Product;
  // the first cards on the page load right away, the rest load as you scroll
  priority?: boolean;
}

// Half-width card (two per row): poster photo, name, price and one Order Now button.
// Tap the photo or the name to open the product page. Add to Cart and WhatsApp live on the product page.
export const MobileProductCard: React.FC<MobileProductCardProps> = ({ product, priority = false }) => {
  const { language, openCheckout, navigateToProduct } = useStore();
  const title = language === 'bn' ? product.titleBn : product.titleEn;
  const onSale = product.originalPrice > product.price;

  return (
    <article className="flex flex-col bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
      <button
        type="button"
        onClick={() => navigateToProduct(product.id)}
        className="block w-full aspect-4/5 bg-white cursor-pointer"
        aria-label={title}
      >
        <img
          src={optimizedImage(product.image, 400)}
          srcSet={optimizedSrcSet(product.image, 300)}
          sizes="(max-width: 767px) 47vw, 300px"
          width={400}
          height={500}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain p-1.5"
        />
      </button>

      <div className="flex flex-col flex-1 p-3 pt-1.5">
        <h3 className="min-h-[2.75em] text-[15px]">
          <button
            type="button"
            onClick={() => navigateToProduct(product.id)}
            className="text-left leading-snug font-bold text-stone-900 line-clamp-2 cursor-pointer"
          >
            {title}
          </button>
        </h3>

        <div className="mt-1.5 flex items-baseline gap-x-2 gap-y-0.5 flex-wrap">
          <span className="text-[18px] leading-none font-bold text-[#f27405] tabular-nums">
            {formatPriceBDT(product.price, language)}
          </span>
          {onSale && (
            <span className="text-[14px] leading-none text-stone-500 line-through tabular-nums">
              {formatPriceBDT(product.originalPrice, language)}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3">
          <button
            type="button"
            onClick={() => openCheckout(product)}
            className="w-full h-11 rounded-xl bg-[#f27405] active:bg-[#d96602] text-white text-[15px] font-bold inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <ShoppingBagIcon size={18} />
            <span>{L(language, 'অর্ডার করুন', 'Order Now')}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

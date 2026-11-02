import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatPriceBDT, calculateDiscount, toBengaliDigits } from '../utils/pricing';
import {
  CloseIcon,
  CheckIcon,
  ShoppingBagIcon,
  CartIcon,
  ShieldCheckIcon,
  TruckIcon,
  PhoneIcon,
} from './Icons';
import { optimizedImage } from '../utils/imageUrl';

export const ProductDetailsModal: React.FC = () => {
  const {
    selectedProductDetails,
    closeProductDetails,
    language,
    openCheckout,
    addToCart,
    siteConfig,
  } = useStore();

  if (!selectedProductDetails) return null;

  const product = selectedProductDetails;
  const discountPercent = calculateDiscount(product.originalPrice, product.price);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-4">
        <button
          type="button"
          onClick={closeProductDetails}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
          aria-label="Close product details"
        >
          <CloseIcon size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full aspect-square bg-stone-50 rounded-2xl p-4 border border-stone-200 flex items-center justify-center">
              <img
                src={optimizedImage(product.image, 800)} decoding="async"
                alt={product.titleEn}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
              {discountPercent > 0 && (
                <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {language === 'bn'
                    ? `${toBengaliDigits(discountPercent)}% ছাড়`
                    : `${discountPercent}% OFF`}
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-stone-500 font-medium">
              <ShieldCheckIcon size={16} className="text-amber-800" />
              <span>{product.material}</span>
            </div>
          </div>

          <div className="md:col-span-7 space-y-4">
            <div>
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                {product.modelNo}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1 leading-snug">
                {language === 'bn' ? product.titleBn : product.titleEn}
              </h2>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-amber-800 tabular-nums">
                {formatPriceBDT(product.price, language)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm sm:text-base text-stone-400 line-through tabular-nums">
                  {formatPriceBDT(product.originalPrice, language)}
                </span>
              )}
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                {language === 'bn' ? 'ফ্রি হোম ডেলিভারি' : 'Free Delivery'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {language === 'bn' ? product.descriptionBn : product.descriptionEn}
            </p>

            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                {language === 'bn' ? 'পণ্যের মূল বৈশিষ্ট্যসমূহ:' : 'Key Features & Inclusions:'}
              </h3>
              <div className="grid grid-cols-1 gap-1.5 text-xs text-stone-700">
                {(language === 'bn' ? product.featuresBn : product.featuresEn).map(
                  (feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <CheckIcon size={10} />
                      </div>
                      <span>{feature}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  closeProductDetails();
                  openCheckout(product);
                }}
                className="w-full py-3.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBagIcon size={18} />
                <span>{language === 'bn' ? 'সরাসরি অর্ডার করুন' : 'Order Now (COD)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  addToCart(product, 1);
                  closeProductDetails();
                }}
                className="w-full py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold text-sm rounded-xl border border-stone-200 transition-colors flex items-center justify-center gap-2"
              >
                <CartIcon size={18} />
                <span>{language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
              <div className="flex items-center gap-1.5">
                <TruckIcon size={14} className="text-amber-800" />
                <span>{language === 'bn' ? 'ক্যাশ অন ডেলিভারি প্রযোজ্য' : 'Cash on Delivery Available'}</span>
              </div>
              <a
                href={`tel:${siteConfig.phone1.replace(/[^0-9]/g, '')}`}
                className="font-semibold text-amber-800 hover:underline flex items-center gap-1"
              >
                <PhoneIcon size={12} />
                <span>{siteConfig.phone1}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

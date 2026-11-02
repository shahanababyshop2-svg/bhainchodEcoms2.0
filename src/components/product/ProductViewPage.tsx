import { optimizedImage } from '../../utils/imageUrl';
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatPriceBDT, calculateDiscount, toBengaliDigits } from '../../utils/pricing';
import {
  ShoppingBagIcon,
  CartIcon,
  ShieldCheckIcon,
  TruckIcon,
  CheckIcon,
  PhoneIcon,
  WhatsAppIcon,
  StarIcon,
  PlusIcon,
  MinusIcon,
  BabyCradleLogo,
} from '../Icons';

export const ProductViewPage: React.FC = () => {
  const {
    products,
    selectedProductId,
    navigateToStore,
    openCheckout,
    addToCart,
    language,
    siteConfig,
  } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'features' | 'delivery' | 'reviews'>('details');

  // Find the selected product, fallback to first product
  const product = products.find((p) => p.id === selectedProductId) || products[0];

  if (!product) return null;

  const productGallery = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  const discountPercent = calculateDiscount(product.originalPrice, product.price);

  const cleanWhatsapp = siteConfig.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Hello Shahana Baby Shop, I want to order ${product.modelNo} (${product.titleEn}) at ৳${product.price}.`
  )}`;

  const handleInstantBuy = () => {
    openCheckout(product);
  };

  const handleAddCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-10 pb-24 md:pb-12">
      <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-4 sm:mb-6 flex-wrap">
        <button
          type="button"
          onClick={navigateToStore}
          className="hover:text-[#f27405] transition-colors font-medium cursor-pointer"
        >
          {language === 'bn' ? 'হোম' : 'Home'}
        </button>
        <span aria-hidden="true">&gt;</span>
        <button
          type="button"
          onClick={navigateToStore}
          className="hover:text-[#f27405] transition-colors font-medium cursor-pointer"
        >
          {language === 'bn' ? 'প্রোডাক্টস' : 'Products'}
        </button>
        <span aria-hidden="true">&gt;</span>
        <span className="text-stone-900 font-bold truncate max-w-xs">
          {product.modelNo}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        <div className="lg:col-span-6 flex flex-col sm:flex-row gap-3">
          <div className="order-2 sm:order-1 flex sm:flex-col gap-2 shrink-0 overflow-x-auto sm:overflow-x-visible py-1">
            {productGallery.map((imgUrl, idx) => {
              const isSelected = selectedImageIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl p-1 bg-white overflow-hidden shadow-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-2 border-[#f27405] ring-2 ring-[#f27405]/20 opacity-100'
                      : 'border border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <img
                    src={optimizedImage(imgUrl, 160)}
                    width={80}
                    height={80}
                    loading="lazy"
                    decoding="async"
                    alt={`${product.titleEn} photo ${idx + 1}`}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </button>
              );
            })}
          </div>

          <div className="order-1 sm:order-2 flex-1 relative aspect-square w-full bg-white rounded-3xl border border-stone-200 p-6 flex items-center justify-center overflow-hidden shadow-xs group">
            <img
              src={optimizedImage(productGallery[selectedImageIndex] || product.image, 800)}
              fetchPriority="high"
              decoding="async"
              alt={product.titleEn}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
            />

            {productGallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImageIndex((prev) => (prev - 1 + productGallery.length) % productGallery.length)
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-800 flex items-center justify-center shadow-md border border-stone-200 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label="Previous image"
                >
                  &lt;
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImageIndex((prev) => (prev + 1) % productGallery.length)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-800 flex items-center justify-center shadow-md border border-stone-200 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label="Next image"
                >
                  &gt;
                </button>
              </>
            )}

            {discountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-rose-600 text-white text-xs sm:text-sm font-black px-3 py-1 rounded-full shadow-xs">
                {language === 'bn' ? `${toBengaliDigits(discountPercent)}% ছাড়` : `${discountPercent}% OFF`}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div>
            <div className="text-xs font-bold text-[#f27405] uppercase tracking-wider">
              {product.modelNo}
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-stone-900 mt-1 leading-tight">
              {language === 'bn' ? product.titleBn : product.titleEn}
            </h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black text-[#f27405] tabular-nums">
              {formatPriceBDT(product.price, language)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-sm sm:text-base text-stone-400 line-through tabular-nums">
                {formatPriceBDT(product.originalPrice, language)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 py-1">
            <span className="text-xs sm:text-sm font-bold text-stone-700">
              {language === 'bn' ? 'পরিমাণ:' : 'Quantity:'}
            </span>
            <div className="flex items-center border border-stone-300 rounded-xl bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-l-xl transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <MinusIcon size={14} />
              </button>
              <span className="w-10 text-center text-sm font-black text-stone-900 tabular-nums">
                {language === 'bn' ? toBengaliDigits(quantity) : quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-r-xl transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <PlusIcon size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleAddCart}
                className="py-3 px-3 rounded-xl bg-[#f27405] hover:bg-[#d96602] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                <CartIcon size={18} />
                <span>{language === 'bn' ? 'কার্ট-এ যোগ করুন' : 'ADD TO CART'}</span>
              </button>

              <button
                type="button"
                onClick={handleInstantBuy}
                className="py-3 px-3 rounded-xl bg-[#102a27] hover:bg-[#163b36] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                <ShoppingBagIcon size={18} />
                <span>{language === 'bn' ? 'সরাসরি অর্ডার' : 'BUY NOW'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <WhatsAppIcon size={16} />
                <span>{language === 'bn' ? 'হোয়াটসঅ্যাপে অর্ডার' : 'Order On WhatsApp'}</span>
              </a>

              <a
                href={`tel:${siteConfig.phone1.replace(/[^0-9]/g, '')}`}
                className="py-2.5 px-3 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <PhoneIcon size={16} />
                <span>{language === 'bn' ? 'কল করে অর্ডার' : 'Call For Order'}</span>
              </a>
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs font-semibold text-stone-700">
            <span className="text-stone-500">{language === 'bn' ? 'ব্র্যান্ড:' : 'Brand:'}</span>
            <div className="flex items-center gap-1.5 text-stone-900 font-bold">
              <BabyCradleLogo size={16} className="text-[#f27405]" />
              <span>Shahana Baby Shop</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="p-2.5 bg-orange-50/60 rounded-xl border border-orange-100 flex items-center gap-2">
              <TruckIcon size={18} className="text-[#f27405] shrink-0" />
              <div>
                <div className="font-bold text-stone-900">
                  {language === 'bn' ? 'ফ্রি হোম ডেলিভারি' : 'Free Home Delivery'}
                </div>
                <div className="text-[10px] text-stone-600">
                  {language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on delivery'}
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center gap-2">
              <ShieldCheckIcon size={18} className="text-emerald-700 shrink-0" />
              <div>
                <div className="font-bold text-stone-900">
                  {language === 'bn' ? '১০০% অরিজিনাল' : '100% Genuine'}
                </div>
                <div className="text-[10px] text-stone-600">
                  {language === 'bn' ? 'পণ্য দেখে টাকা দিন' : 'Pay after verifying'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 sm:mt-14 bg-white rounded-3xl border border-stone-200 p-5 sm:p-8 shadow-xs">
        <div className="border-b border-stone-200 flex items-center gap-4 sm:gap-8 overflow-x-auto scrollbar-none pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`text-sm sm:text-base font-bold pb-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-[#f27405] text-[#f27405]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            {language === 'bn' ? 'প্রোডাক্ট বিবরণী' : 'Product Details'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`text-sm sm:text-base font-bold pb-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'features'
                ? 'border-[#f27405] text-[#f27405]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            {language === 'bn' ? 'বৈশিষ্ট্য ও সুবিধা' : 'Features'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('delivery')}
            className={`text-sm sm:text-base font-bold pb-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'delivery'
                ? 'border-[#f27405] text-[#f27405]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            {language === 'bn' ? 'ডেলিভারি নিয়মাবলী' : 'Delivery & Terms'}
          </button>
        </div>

        <div className="pt-5 text-xs sm:text-sm text-stone-700 leading-relaxed">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <p>{language === 'bn' ? product.descriptionBn : product.descriptionEn}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="font-bold text-stone-900 block mb-0.5">
                    {language === 'bn' ? 'ফ্রেম ম্যাটেরিয়াল:' : 'Frame Material:'}
                  </span>
                  <span>{product.material || 'Heavy Duty MS Steel'}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="font-bold text-stone-900 block mb-0.5">
                    {language === 'bn' ? 'সার্ভিস ও ওয়ারেন্টি:' : 'Warranty & Service:'}
                  </span>
                  <span>{product.warranty || '1 Year Free Service'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-2.5">
              {(language === 'bn' ? product.featuresBn : product.featuresEn).map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckIcon size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-bold">
                <TruckIcon size={18} className="text-[#f27405]" />
                <span>
                  {language === 'bn'
                    ? 'হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি তথ্য'
                    : 'Home Delivery & COD Policy'}
                </span>
              </div>
              <p>
                {language === 'bn'
                  ? 'আমরা সমগ্র বাংলাদেশে বিশ্বস্ত কুরিয়ার ও নিজস্ব ডেলিভারি নেটওয়ার্কের মাধ্যমে হোম ডেলিভারি দিয়ে থাকি। পার্সেল হাতে পেয়ে বক্স খুলে চেক করে ডেলিভারিম্যানকে মূল্য পরিশোধ করতে পারবেন।'
                  : 'We deliver directly to your doorstep all over Bangladesh. You can inspect the package upon arrival and pay cash on delivery.'}
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-medium">
                {language === 'bn'
                  ? 'ডেলিভারি চার্জ: ঢাকা সিটিতে ৳৬০, ঢাকার বাইরে সমগ্র বাংলাদেশে ৳১২০।'
                  : 'Delivery Fee: Inside Dhaka ৳60, Outside Dhaka ৳120 across Bangladesh.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

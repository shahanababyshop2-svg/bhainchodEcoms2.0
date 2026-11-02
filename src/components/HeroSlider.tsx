import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { optimizedImage, optimizedSrcSet } from '../utils/imageUrl';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  WhatsAppIcon,
  ShoppingBagIcon,
  TruckIcon,
  CheckIcon,
} from './Icons';

export const HeroSlider: React.FC = () => {
  const { siteConfig, language, products, openCheckout, isConfigReady } = useStore();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slides = siteConfig.heroSlides || [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Wait for the real homepage content instead of showing placeholder text that then jumps.
  // The box keeps the same size, so nothing below it moves when the real hero appears.
  if (!isConfigReady) {
    return (
      <section
        aria-hidden="true"
        className="bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 border-b border-stone-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 min-h-[640px] sm:min-h-[720px] lg:min-h-[520px]">
          <div className="mx-auto lg:mx-0 h-8 w-3/4 max-w-md rounded-lg bg-stone-200/70 animate-pulse" />
          <div className="mt-6 mx-auto w-full max-w-md aspect-4/3 sm:aspect-square rounded-3xl bg-white/80 border border-amber-100" />
        </div>
      </section>
    );
  }

  if (slides.length === 0) return null;

  const currentSlide = slides[currentSlideIndex];
  const matchedProduct = products.find((p) => p.id === currentSlide.productId) || products[0];

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const cleanWhatsappNumber = siteConfig.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
    siteConfig.whatsappPrefillText || 'Hello Shahana Baby Shop'
  )}`;

  return (
    <section className="relative bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 border-b border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold tracking-wide uppercase">
              <TruckIcon size={14} className="text-amber-800" />
              <span>
                {language === 'bn' ? currentSlide.badgeBn : currentSlide.badgeEn}
              </span>
            </div>

            <h1 className="min-h-[3.75rem] sm:min-h-[5.5rem] lg:min-h-[7.5rem] text-2xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight text-balance">
              {language === 'bn' ? currentSlide.titleBn : currentSlide.titleEn}
            </h1>

            <p className="min-h-[4.5rem] sm:min-h-[3.5rem] text-sm sm:text-base text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {language === 'bn' ? currentSlide.subtitleBn : currentSlide.subtitleEn}
            </p>

            <div className="pt-1 pb-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span className="text-xl sm:text-2xl font-black text-amber-800 tabular-nums">
                {language === 'bn' ? currentSlide.priceTagBn : currentSlide.priceTagEn}
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-md">
                {language === 'bn' ? 'ফ্রি হোম ডেলিভারি' : 'Free Delivery'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => openCheckout(matchedProduct)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <ShoppingBagIcon size={18} />
                <span>
                  {language === 'bn' ? currentSlide.buttonTextBn : currentSlide.buttonTextEn}
                </span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2"
              >
                <WhatsAppIcon size={18} />
                <span>
                  {language === 'bn' ? 'হোয়াটসঅ্যাপে অর্ডার করুন' : 'WhatsApp Order'}
                </span>
              </a>
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-stone-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckIcon size={14} className="text-amber-700" />
                <span>{language === 'bn' ? '১০০% খাঁটি এমএস স্টিল ফ্রেম' : '100% Solid MS Steel Frame'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckIcon size={14} className="text-amber-700" />
                <span>{language === 'bn' ? 'ক্যাশ অন ডেলিভারি সুবিধা' : 'Cash on Delivery Anywhere in BD'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckIcon size={14} className="text-amber-700" />
                <span>{language === 'bn' ? 'পণ্য দেখে টাকা পরিশোধ' : 'Check Product Before Payment'}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-4/3 sm:aspect-square bg-white rounded-3xl p-4 shadow-md border border-amber-100 flex items-center justify-center overflow-hidden group">
              <img
                src={optimizedImage(currentSlide.image, 450)}
                srcSet={optimizedSrcSet(currentSlide.image, 450)}
                width={450}
                height={450}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                alt={currentSlide.titleEn}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-amber-700 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                {language === 'bn' ? 'অরিজিনাল প্রোডাক্ট' : 'Original Product'}
              </div>
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon size={16} />
            </button>
            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentSlideIndex ? 'w-6 bg-amber-700' : 'bg-stone-300'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="p-2 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

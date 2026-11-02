import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { optimizedImage, optimizedSrcSet } from '../utils/imageUrl';
import { slideIndexFromScroll } from '../utils/mobileUi';
import { HeroSlide } from '../types';
import { ShoppingBagIcon } from '../components/Icons';
import { L } from './ui';

// Swipeable banner. A slide with a wide "phone banner image" (set in Admin -> UI customizer)
// is shown as that picture. A slide without one is shown as a compact card built from the
// poster image plus the slide's title and price, so the banner is never empty.

const AUTO_MS = 5000;

export const MobileBanner: React.FC = () => {
  const { siteConfig, language, products, navigateToProduct, openCheckout, isConfigReady } = useStore();
  const slides = siteConfig.heroSlides || [];
  const trackRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [index, setIndex] = useState(0);
  // Slides can differ in height (a wide picture is shorter than a poster card), so each slide keeps
  // its own height and the carousel eases to the height of the slide being shown.
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [heights, setHeights] = useState<number[]>([]);

  useLayoutEffect(() => {
    const measure = () => setHeights(slideRefs.current.map((el) => (el ? el.offsetHeight : 0)));
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    slideRefs.current.forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [slides.length, isConfigReady, language]);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el || pausedRef.current) return;
      const next = (indexRef.current + 1) % slides.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    []
  );

  const pause = () => {
    pausedRef.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false;
    }, 6000);
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const i = slideIndexFromScroll(el.scrollLeft, el.clientWidth, slides.length);
    indexRef.current = i;
    setIndex(i);
  };

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    pause();
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  // Same size as the real banner, so nothing below it jumps when it appears.
  if (!isConfigReady) {
    return (
      <section aria-hidden="true" className="px-3 pt-3">
        <div className="h-[200px] rounded-3xl bg-stone-200/70 animate-pulse" />
      </section>
    );
  }
  if (slides.length === 0) return null;

  const productFor = (slide: HeroSlide) => products.find((p) => p.id === slide.productId) || products[0];

  return (
    <section className="px-3 pt-3" aria-roledescription="carousel" aria-label={L(language, 'অফার ব্যানার', 'Offer banner')}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        onTouchStart={pause}
        style={heights[index] ? { height: heights[index] } : undefined}
        className="flex items-start overflow-x-auto overflow-y-hidden snap-x snap-mandatory sbs-no-scrollbar rounded-3xl transition-[height] duration-300"
      >
        {slides.map((slide, i) => {
          const product = productFor(slide);
          const title = language === 'bn' ? slide.titleBn : slide.titleEn;
          const open = () => {
            if (product) navigateToProduct(product.id);
          };

          if (slide.mobileImage) {
            return (
              <div key={slide.id} ref={(el) => { slideRefs.current[i] = el; }} className="w-full shrink-0 snap-center" aria-hidden={i !== index}>
                <button
                  type="button"
                  onClick={open}
                  className="block w-full rounded-3xl overflow-hidden bg-stone-100 cursor-pointer"
                  aria-label={title}
                >
                  <img
                    src={optimizedImage(slide.mobileImage, 800)}
                    srcSet={optimizedSrcSet(slide.mobileImage, 800)}
                    sizes="100vw"
                    alt={title}
                    width={1200}
                    height={500}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="block w-full object-cover aspect-[12/5]"
                  />
                </button>
              </div>
            );
          }

          return (
            <div key={slide.id} ref={(el) => { slideRefs.current[i] = el; }} className="w-full shrink-0 snap-center" aria-hidden={i !== index}>
              <div className="min-h-[200px] rounded-3xl border border-orange-100 bg-linear-to-br from-amber-50 via-orange-50 to-orange-100 flex overflow-hidden">
                <div className="flex-1 min-w-0 p-4 flex flex-col items-start">
                  <span className="max-w-full rounded-full bg-white/85 text-orange-800 text-[13px] leading-5 font-bold px-3 py-1">
                    <span className="block truncate">{language === 'bn' ? slide.badgeBn : slide.badgeEn}</span>
                  </span>
                  <button type="button" onClick={open} className="mt-2 text-left cursor-pointer">
                    <h2 className="text-[19px] leading-snug font-bold text-stone-900 line-clamp-3">{title}</h2>
                  </button>
                  <div className="mt-1 text-[15px] leading-snug font-bold text-orange-700 line-clamp-2">
                    {language === 'bn' ? slide.priceTagBn : slide.priceTagEn}
                  </div>
                  <button
                    type="button"
                    onClick={() => product && openCheckout(product)}
                    className="mt-auto pt-0 h-11 px-4 rounded-xl bg-[#f27405] active:bg-[#d96602] text-white text-[15px] font-bold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <ShoppingBagIcon size={18} />
                    <span>{L(language, 'অর্ডার করুন', 'Order Now')}</span>
                  </button>
                </div>
                <button type="button" onClick={open} className="w-[40%] shrink-0 p-2 flex items-center cursor-pointer" aria-label={title}>
                  <img
                    src={optimizedImage(slide.image, 450)}
                    srcSet={optimizedSrcSet(slide.image, 450)}
                    sizes="40vw"
                    alt=""
                    loading={i === 0 ? 'eager' : 'lazy'}
                    fetchPriority={i === 0 ? 'high' : 'auto'}
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full max-h-[190px] object-contain rounded-2xl bg-white shadow-xs"
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <div className="flex items-center justify-center pt-1" role="tablist" aria-label={L(language, 'ব্যানার', 'Banner slides')}>
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              onClick={() => goTo(i)}
              className="h-8 px-1 flex items-center cursor-pointer"
              aria-label={`${L(language, 'স্লাইড', 'Slide')} ${i + 1}`}
            >
              <span
                className={`block h-2.5 rounded-full transition-all ${
                  i === index ? 'w-7 bg-[#f27405]' : 'w-2.5 bg-stone-300'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

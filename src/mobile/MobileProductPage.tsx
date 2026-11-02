import React, { useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { calculateDiscount, formatPriceBDT, toBengaliDigits } from '../utils/pricing';
import { optimizedImage } from '../utils/imageUrl';
import { slideIndexFromScroll, telHref, whatsappHref } from '../utils/mobileUi';
import { CartIcon, CheckIcon, PhoneIcon, ShieldCheckIcon, ShoppingBagIcon, TruckIcon, WhatsAppIcon } from '../components/Icons';
import { MobilePageBar } from './MobilePageBar';
import { L, num } from './ui';

type Tab = 'details' | 'features' | 'delivery';

// Product page: swipe gallery, price, delivery points, details tabs, and a bar pinned to the
// bottom with Call, WhatsApp and Order Now (the global bottom bar is hidden on this page).
export const MobileProductPage: React.FC = () => {
  const { products, selectedProductId, language, siteConfig, openCheckout, addToCart } = useStore();
  const [tab, setTab] = useState<Tab>('details');
  const [imgIndex, setImgIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  const product = products.find((p) => p.id === selectedProductId) || products[0];
  if (!product) return null;

  const gallery = product.images && product.images.length > 0 ? product.images : [product.image];
  const discount = calculateDiscount(product.originalPrice, product.price);
  const title = language === 'bn' ? product.titleBn : product.titleEn;
  const features = language === 'bn' ? product.featuresBn : product.featuresEn;
  const description = language === 'bn' ? product.descriptionBn : product.descriptionEn;

  const waUrl = whatsappHref(
    siteConfig.whatsappNumber,
    `Hello Shahana Baby Shop, I want to order ${product.modelNo} (${product.titleEn}) at ৳${product.price}.`
  );

  const onGalleryScroll = () => {
    const el = galleryRef.current;
    if (!el) return;
    setImgIndex(slideIndexFromScroll(el.scrollLeft, el.clientWidth, gallery.length));
  };

  const goToImage = (i: number) => {
    const el = galleryRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  const freeDelivery = siteConfig.isDeliveryFreeNationwide;
  const tabs: { id: Tab; bn: string; en: string }[] = [
    { id: 'details', bn: 'বিবরণ', en: 'Details' },
    { id: 'features', bn: 'বৈশিষ্ট্য', en: 'Features' },
    { id: 'delivery', bn: 'ডেলিভারি', en: 'Delivery' },
  ];

  return (
    <div className="pb-28 sbs-screen-up">
      <MobilePageBar title={product.modelNo} />

      <div className="relative bg-white">
        <div
          ref={galleryRef}
          onScroll={onGalleryScroll}
          className="flex overflow-x-auto snap-x snap-mandatory sbs-no-scrollbar"
        >
          {gallery.map((src, i) => (
            <div key={`${src}-${i}`} className="w-full shrink-0 snap-center aspect-4/5 flex items-center justify-center">
              <img
                src={optimizedImage(src, 800)}
                alt={`${product.titleEn} ${i + 1}`}
                width={800}
                height={1000}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain p-2"
              />
            </div>
          ))}
        </div>

        {discount > 0 && (
          <span className="absolute top-3 left-3 rounded-lg bg-rose-600 text-white text-[15px] font-bold px-3 py-1 shadow-xs">
            {language === 'bn' ? `${toBengaliDigits(discount)}% ছাড়` : `${discount}% OFF`}
          </span>
        )}

        {gallery.length > 1 && (
          <>
            <span className="absolute top-3 right-3 rounded-full bg-stone-900/70 text-white text-[14px] font-bold px-3 py-1 tabular-nums">
              {num(language, imgIndex + 1)}/{num(language, gallery.length)}
            </span>
            <div className="flex items-center justify-center pb-2">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToImage(i)}
                  className="h-8 px-1 flex items-center cursor-pointer"
                  aria-label={`${L(language, 'ছবি', 'Photo')} ${i + 1}`}
                  aria-current={i === imgIndex}
                >
                  <span
                    className={`block h-2.5 rounded-full transition-all ${
                      i === imgIndex ? 'w-7 bg-[#f27405]' : 'w-2.5 bg-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-4 pt-4 space-y-5">
        <div>
          <div className="text-[14px] font-bold text-[#f27405] uppercase tracking-wide">{product.modelNo}</div>
          <h2 className="mt-1 text-[22px] leading-snug font-bold text-stone-900">{title}</h2>
          <div className="mt-3 flex items-baseline gap-3 flex-wrap">
            <span className="text-[28px] leading-none font-bold text-[#f27405] tabular-nums">
              {formatPriceBDT(product.price, language)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[17px] text-stone-500 line-through tabular-nums">
                {formatPriceBDT(product.originalPrice, language)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-orange-50 border border-orange-100 p-3.5 flex items-center gap-3">
            <TruckIcon size={26} className="text-[#f27405] shrink-0" />
            <div>
              <div className="text-[15px] leading-tight font-bold text-stone-900">
                {L(language, 'ফ্রি হোম ডেলিভারি', 'Free Home Delivery')}
              </div>
              <div className="text-[13px] text-stone-600">{L(language, 'ক্যাশ অন ডেলিভারি', 'Cash on delivery')}</div>
            </div>
          </div>
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3.5 flex items-center gap-3">
            <ShieldCheckIcon size={26} className="text-emerald-700 shrink-0" />
            <div>
              <div className="text-[15px] leading-tight font-bold text-stone-900">
                {L(language, '১০০% অরিজিনাল', '100% Genuine')}
              </div>
              <div className="text-[13px] text-stone-600">{L(language, 'পণ্য দেখে টাকা দিন', 'Pay after verifying')}</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => addToCart(product, 1)}
          className="w-full h-13 rounded-2xl border-2 border-[#f27405] text-[#d96602] bg-white active:bg-orange-50 text-[16px] font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <CartIcon size={20} />
          <span>{L(language, 'কার্টে যোগ করুন', 'Add to Cart')}</span>
        </button>

        <section className="rounded-3xl bg-white border border-stone-200 overflow-hidden">
          <div className="grid grid-cols-3 border-b border-stone-200" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`h-13 text-[16px] font-bold border-b-[3px] cursor-pointer ${
                  tab === t.id ? 'border-[#f27405] text-[#d96602]' : 'border-transparent text-stone-600'
                }`}
              >
                {language === 'bn' ? t.bn : t.en}
              </button>
            ))}
          </div>

          <div className="p-4 text-[16px] leading-relaxed text-stone-700" role="tabpanel">
            {tab === 'details' && (
              <div className="space-y-4">
                <p>{description}</p>
                {(product.material || product.warranty) && (
                  <dl className="space-y-3">
                    {product.material && (
                      <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3.5">
                        <dt className="text-[14px] font-bold text-stone-500">{L(language, 'ফ্রেম ম্যাটেরিয়াল', 'Frame Material')}</dt>
                        <dd className="font-bold text-stone-900">{product.material}</dd>
                      </div>
                    )}
                    {product.warranty && (
                      <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3.5">
                        <dt className="text-[14px] font-bold text-stone-500">{L(language, 'সার্ভিস ও ওয়ারেন্টি', 'Warranty & Service')}</dt>
                        <dd className="font-bold text-stone-900">{product.warranty}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>
            )}

            {tab === 'features' && (
              <ul className="space-y-3">
                {features.length === 0 && <li>{L(language, 'কোনো তথ্য নেই।', 'No details listed.')}</li>}
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckIcon size={14} />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )}

            {tab === 'delivery' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold">
                  <TruckIcon size={22} className="text-[#f27405]" />
                  <span>{L(language, 'হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি', 'Home Delivery & COD Policy')}</span>
                </div>
                <p>
                  {L(
                    language,
                    'আমরা সমগ্র বাংলাদেশে বিশ্বস্ত কুরিয়ার ও নিজস্ব ডেলিভারি নেটওয়ার্কের মাধ্যমে হোম ডেলিভারি দিয়ে থাকি। পার্সেল হাতে পেয়ে বক্স খুলে চেক করে ডেলিভারিম্যানকে মূল্য পরিশোধ করতে পারবেন।',
                    'We deliver directly to your doorstep all over Bangladesh. You can inspect the package upon arrival and pay cash on delivery.'
                  )}
                </p>
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-amber-900 font-bold">
                  {freeDelivery
                    ? L(language, 'সারা বাংলাদেশে ডেলিভারি ফ্রি।', 'Delivery is free across Bangladesh.')
                    : L(
                        language,
                        `ডেলিভারি চার্জ: ঢাকা সিটিতে ${formatPriceBDT(siteConfig.deliveryFeeInsideDhaka, language)}, ঢাকার বাইরে সমগ্র বাংলাদেশে ${formatPriceBDT(siteConfig.deliveryFeeOutsideDhaka, language)}।`,
                        `Delivery Fee: Inside Dhaka ${formatPriceBDT(siteConfig.deliveryFeeInsideDhaka, language)}, Outside Dhaka ${formatPriceBDT(siteConfig.deliveryFeeOutsideDhaka, language)}.`
                      )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div
        className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-stone-200 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] px-3 pt-2 flex items-stretch gap-2"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
      >
        <a
          href={telHref(siteConfig.phone1)}
          className="w-[68px] h-14 shrink-0 rounded-2xl bg-[#1e3a8a] active:bg-[#172554] text-white flex flex-col items-center justify-center gap-0.5 cursor-pointer"
          aria-label={L(language, 'কল করুন', 'Call us')}
        >
          <PhoneIcon size={22} />
          <span className="text-[13px] leading-none font-bold">{L(language, 'কল', 'Call')}</span>
        </a>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-[68px] h-14 shrink-0 rounded-2xl bg-[#25D366] active:bg-[#1fb257] text-white flex flex-col items-center justify-center gap-0.5 cursor-pointer"
          aria-label={L(language, 'হোয়াটসঅ্যাপে অর্ডার', 'Order on WhatsApp')}
        >
          <WhatsAppIcon size={22} />
          <span className="text-[13px] leading-none font-bold">{L(language, 'চ্যাট', 'Chat')}</span>
        </a>
        <button
          type="button"
          onClick={() => openCheckout(product)}
          className="flex-1 min-w-0 h-14 rounded-2xl bg-[#f27405] active:bg-[#d96602] text-white text-[17px] font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShoppingBagIcon size={22} />
          <span className="truncate">{L(language, 'অর্ডার করুন', 'Order Now')}</span>
        </button>
      </div>
    </div>
  );
};

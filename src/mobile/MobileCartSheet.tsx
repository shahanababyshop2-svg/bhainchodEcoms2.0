import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPriceBDT } from '../utils/pricing';
import { optimizedImage } from '../utils/imageUrl';
import { CloseIcon, ShoppingBagIcon, TrashIcon, TruckIcon } from '../components/Icons';
import { L, QtyStepper, num, useLockBodyScroll } from './ui';

// The cart as a bottom sheet: slides up, big + / - buttons, and a Checkout button that is
// always visible. Drag the top handle down (or tap outside / the X) to close it.
export const MobileCartSheet: React.FC = () => {
  const {
    setIsCartDrawerOpen,
    cart,
    cartTotals,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    openCheckout,
    language,
    siteConfig,
  } = useStore();
  useLockBodyScroll();

  const close = () => setIsCartDrawerOpen(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setIsCartDrawerOpen]);

  // drag-down-to-close on the handle area
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    setDragY(Math.max(0, e.touches[0].clientY - startY.current));
  };
  const onTouchEnd = () => {
    if (dragY > 100) close();
    setDragY(0);
    startY.current = null;
  };

  const isFreeDelivery =
    siteConfig.isDeliveryFreeNationwide ||
    (siteConfig.freeDeliveryMinOrder > 0 && cartTotals.subtotal >= siteConfig.freeDeliveryMinOrder);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={L(language, 'শপিং ব্যাগ', 'Shopping bag')}>
      <div className="absolute inset-0 bg-black/55 sbs-fade-in" onClick={close} aria-hidden="true" />

      <div
        className="sbs-sheet-up absolute bottom-0 inset-x-0 max-h-[90dvh] bg-white rounded-t-3xl shadow-2xl flex flex-col"
        style={{ transform: dragY ? `translateY(${dragY}px)` : undefined, transition: dragY ? 'none' : undefined }}
      >
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="shrink-0 touch-none"
        >
          <div className="pt-2.5 flex justify-center" aria-hidden="true">
            <span className="w-11 h-1.5 rounded-full bg-stone-300" />
          </div>
          <div className="px-4 h-14 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[19px] font-bold text-stone-900">
              <ShoppingBagIcon size={22} className="text-[#f27405]" />
              <span>{L(language, 'শপিং ব্যাগ', 'Shopping Bag')}</span>
              <span className="text-[15px] font-normal text-stone-600">
                ({num(language, cartTotals.itemCount)} {L(language, 'টি পণ্য', 'items')})
              </span>
            </h2>
            <button
              type="button"
              onClick={close}
              className="w-12 h-12 -mr-2 flex items-center justify-center rounded-xl text-stone-600 active:bg-stone-100 cursor-pointer"
              aria-label={L(language, 'বন্ধ করুন', 'Close')}
            >
              <CloseIcon size={22} />
            </button>
          </div>
        </div>

        <div className="shrink-0 bg-amber-50 border-y border-amber-100 px-4 py-2.5 flex items-start gap-2.5 text-[14px] leading-snug text-amber-900 font-bold">
          <TruckIcon size={18} className="text-amber-800 shrink-0 mt-0.5" />
          <span>
            {isFreeDelivery
              ? L(language, 'আপনার অর্ডারে সারা বাংলাদেশে ফ্রি ডেলিভারি প্রযোজ্য!', 'Free delivery applied to your order nationwide!')
              : L(
                  language,
                  `ডেলিভারি চার্জ: ঢাকা ${formatPriceBDT(siteConfig.deliveryFeeInsideDhaka, language)} | ঢাকার বাইরে ${formatPriceBDT(siteConfig.deliveryFeeOutsideDhaka, language)}`,
                  `Delivery: Dhaka ${formatPriceBDT(siteConfig.deliveryFeeInsideDhaka, language)} | Outside Dhaka ${formatPriceBDT(siteConfig.deliveryFeeOutsideDhaka, language)}`
                )}
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3">
          {cart.length > 0 ? (
            <ul className="space-y-3">
              {cart.map((item) => {
                const name = language === 'bn' ? item.product.titleBn : item.product.titleEn;
                return (
                  <li key={item.product.id} className="rounded-2xl border border-stone-200 bg-stone-50/60 p-3">
                    <div className="flex gap-3">
                      <span className="w-20 h-20 shrink-0 rounded-xl bg-white border border-stone-200 flex items-center justify-center overflow-hidden">
                        <img
                          src={optimizedImage(item.product.image, 160)}
                          alt=""
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain p-1"
                        />
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] leading-snug font-bold text-stone-900 line-clamp-2">{name}</h3>
                        <div className="mt-1 text-[16px] font-bold text-[#d96602] tabular-nums">
                          {formatPriceBDT(item.product.price, language)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <QtyStepper
                        value={item.quantity}
                        min={0}
                        lang={language}
                        label={name}
                        onChange={(q) => updateCartQuantity(item.product.id, q)}
                      />
                      <span className="text-[17px] font-bold text-stone-900 tabular-nums">
                        {formatPriceBDT(item.product.price * item.quantity, language)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl text-stone-500 active:bg-rose-50 active:text-rose-600 cursor-pointer"
                        aria-label={`${L(language, 'সরান', 'Remove')} ${name}`}
                      >
                        <TrashIcon size={20} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-12 text-center">
              <span className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                <ShoppingBagIcon size={30} />
              </span>
              <p className="mt-4 text-[18px] font-bold text-stone-800">
                {L(language, 'আপনার ব্যাগ এখনও খালি', 'Your cart is empty')}
              </p>
              <p className="mt-1 text-[15px] text-stone-600">
                {L(language, 'পছন্দের বেবি দোলনাটি কার্টে যোগ করুন।', 'Add your favorite baby cradle to get started.')}
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-5 h-12 px-6 rounded-2xl bg-[#f27405] active:bg-[#d96602] text-white text-[16px] font-bold cursor-pointer"
              >
                {L(language, 'কেনাকাটা করুন', 'Start Shopping')}
              </button>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div
            className="shrink-0 border-t border-stone-200 bg-white px-4 pt-3"
            style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
          >
            <dl className="space-y-1 text-[15px]">
              <div className="flex justify-between text-stone-600">
                <dt>{L(language, 'সাবটোটাল', 'Subtotal')}</dt>
                <dd className="font-bold text-stone-900 tabular-nums">{formatPriceBDT(cartTotals.subtotal, language)}</dd>
              </div>
              <div className="flex justify-between text-stone-600">
                <dt>{L(language, 'ডেলিভারি চার্জ', 'Delivery Fee')}</dt>
                <dd className={`font-bold tabular-nums ${isFreeDelivery ? 'text-emerald-700' : 'text-stone-900'}`}>
                  {isFreeDelivery ? L(language, 'ফ্রি (৳০)', 'Free (৳0)') : formatPriceBDT(cartTotals.deliveryFee, language)}
                </dd>
              </div>
              {cartTotals.totalSavings > 0 && (
                <div className="flex justify-between text-emerald-800">
                  <dt>{L(language, 'মোট সাশ্রয়', 'Total Savings')}</dt>
                  <dd className="font-bold tabular-nums">{formatPriceBDT(cartTotals.totalSavings, language)}</dd>
                </div>
              )}
            </dl>

            <button
              type="button"
              onClick={() => openCheckout(null)}
              className="mt-3 w-full h-14 rounded-2xl bg-[#f27405] active:bg-[#d96602] text-white text-[17px] font-bold inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <ShoppingBagIcon size={22} />
              <span>
                {L(language, 'অর্ডার করুন', 'Checkout')} · {formatPriceBDT(cartTotals.total, language)}
              </span>
            </button>

            <button
              type="button"
              onClick={clearCart}
              className="mt-1 w-full h-11 text-[15px] font-bold text-stone-500 active:text-rose-600 cursor-pointer"
            >
              {L(language, 'কার্ট খালি করুন', 'Clear Cart')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

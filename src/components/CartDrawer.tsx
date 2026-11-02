import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatPriceBDT } from '../utils/pricing';
import { CloseIcon, PlusIcon, MinusIcon, TrashIcon, ShoppingBagIcon, TruckIcon } from './Icons';
import { optimizedImage } from '../utils/imageUrl';

export const CartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    cartTotals,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    openCheckout,
    navigateToCart,
    language,
    siteConfig,
  } = useStore();

  if (!isCartDrawerOpen) return null;

  const isFreeDelivery = siteConfig.isDeliveryFreeNationwide ||
    (siteConfig.freeDeliveryMinOrder > 0 && cartTotals.subtotal >= siteConfig.freeDeliveryMinOrder);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-2xs transition-opacity"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10">
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon size={20} className="text-amber-800" />
            <h3 className="text-base font-bold text-stone-900">
              {language === 'bn' ? 'শপিং ব্যাগ' : 'Shopping Bag'}
              <span className="text-xs text-stone-500 font-normal ml-2 tabular-nums">
                ({cartTotals.itemCount} {language === 'bn' ? 'টি পণ্য' : 'items'})
              </span>
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 cursor-pointer"
            aria-label="Close cart drawer"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-900 font-medium">
          <TruckIcon size={16} className="text-amber-800 shrink-0" />
          <span>
            {isFreeDelivery
              ? language === 'bn'
                ? 'আপনার অর্ডারে সারা বাংলাদেশে ফ্রি ডেলিভারি প্রযোজ্য!'
                : 'Free delivery applied to your order nationwide!'
              : language === 'bn'
              ? `ডেলিভারি চার্জ: ঢাকা ৳${siteConfig.deliveryFeeInsideDhaka} | ঢাকার বাইরে ৳${siteConfig.deliveryFeeOutsideDhaka}`
              : `Delivery: Dhaka ৳${siteConfig.deliveryFeeInsideDhaka} | Outside Dhaka ৳${siteConfig.deliveryFeeOutsideDhaka}`}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 bg-stone-50/50 hover:bg-stone-50 transition-colors"
              >
                <div className="w-16 h-16 rounded-lg bg-white border border-stone-200 p-1 shrink-0 flex items-center justify-center">
                  <img
                    src={optimizedImage(item.product.image, 160)} decoding="async"
                    alt={item.product.titleEn}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-stone-900 truncate">
                    {language === 'bn' ? item.product.titleBn : item.product.titleEn}
                  </h4>
                  <div className="text-xs font-bold text-amber-800 tabular-nums mt-0.5">
                    {formatPriceBDT(item.product.price, language)}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-white border border-stone-300 hover:bg-stone-100 flex items-center justify-center text-stone-700"
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon size={12} />
                    </button>
                    <span className="text-xs font-bold text-stone-900 min-w-5 text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-white border border-stone-300 hover:bg-stone-100 flex items-center justify-center text-stone-700"
                      aria-label="Increase quantity"
                    >
                      <PlusIcon size={12} />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-stone-900 tabular-nums">
                    {formatPriceBDT(item.product.price * item.quantity, language)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="mt-2 text-stone-400 hover:text-rose-600 p-1"
                    aria-label={`Remove ${item.product.titleEn} from cart`}
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
                <ShoppingBagIcon size={24} />
              </div>
              <p className="text-sm font-semibold text-stone-700">
                {language === 'bn' ? 'আপনার ব্যাগ এখনও খালি' : 'Your cart is empty'}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                {language === 'bn'
                  ? 'পছন্দের বেবি দোলনাটি কার্টে যোগ করুন।'
                  : 'Add your favorite baby cradle to get started.'}
              </p>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>{language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
                <span className="font-semibold text-stone-900 tabular-nums">
                  {formatPriceBDT(cartTotals.subtotal, language)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{language === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}</span>
                <span className={`font-bold ${isFreeDelivery ? 'text-emerald-700' : 'text-stone-900'}`}>
                  {isFreeDelivery
                    ? language === 'bn' ? 'ফ্রি (৳০)' : 'Free (৳0)'
                    : formatPriceBDT(cartTotals.deliveryFee, language)}
                </span>
              </div>
              {cartTotals.totalSavings > 0 && (
                <div className="flex justify-between text-emerald-800">
                  <span>{language === 'bn' ? 'মোট সাশ্রয়' : 'Total Savings'}</span>
                  <span className="font-bold tabular-nums">
                    {formatPriceBDT(cartTotals.totalSavings, language)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-black text-stone-900">
                <span>{language === 'bn' ? 'সর্বমোট' : 'Total Amount'}</span>
                <span className="text-base text-amber-800 tabular-nums">
                  {formatPriceBDT(cartTotals.total, language)}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => openCheckout(null)}
                className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBagIcon size={16} />
                <span>
                  {language === 'bn'
                    ? 'ক্যাশ অন ডেলিভারি অর্ডার সম্পন্ন করুন'
                    : 'Complete Cash on Delivery Order'}
                </span>
              </button>

              <button
                type="button"
                onClick={navigateToCart}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl border border-stone-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBagIcon size={14} />
                <span>
                  {language === 'bn' ? 'সম্পূর্ণ কার্ট পেজ দেখুন' : 'View Full Cart Page'}
                </span>
              </button>

              <button
                type="button"
                onClick={clearCart}
                className="w-full py-1.5 text-xs text-stone-500 hover:text-stone-700 font-medium cursor-pointer"
              >
                {language === 'bn' ? 'কার্ট খালি করুন' : 'Clear Cart'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

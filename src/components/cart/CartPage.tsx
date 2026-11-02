import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { formatPriceBDT, calculateDiscount } from '../../utils/pricing';
import {
  ShoppingBagIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  TruckIcon,
  ShieldCheckIcon,
  CheckIcon,
  ArrowRightIcon,
  PhoneIcon,
  CloseIcon,
} from '../Icons';
import { optimizedImage } from '../../utils/imageUrl';

export const CartPage: React.FC = () => {
  const {
    cart,
    cartTotals,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    openCheckout,
    navigateToProduct,
    navigateToStore,
    language,
    siteConfig,
    getDeliveryFee,
  } = useStore();

  const [deliveryArea, setDeliveryArea] = useState<'dhaka_inside' | 'dhaka_outside'>('dhaka_inside');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const currentDeliveryFee = getDeliveryFee(deliveryArea, cartTotals.subtotal);
  const insideDhakaFee = getDeliveryFee('dhaka_inside', cartTotals.subtotal);
  const outsideDhakaFee = getDeliveryFee('dhaka_outside', cartTotals.subtotal);

  const finalTotal = Math.max(0, cartTotals.subtotal + currentDeliveryFee - couponDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'BABY50' || clean === 'SHAHANA50') {
      setAppliedCoupon(clean);
      setCouponDiscount(50);
      setCouponError('');
    } else if (clean === 'EID100' || clean === 'WELCOME100') {
      setAppliedCoupon(clean);
      setCouponDiscount(100);
      setCouponError('');
    } else {
      setCouponError(
        language === 'bn'
          ? 'কুপনটি সঠিক নয়। BABY50 ট্রাই করতে পারেন।'
          : 'Invalid promo code. Try BABY50.'
      );
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponError('');
  };

  const handleProceedToCheckout = () => {
    openCheckout(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
        <button
          type="button"
          onClick={navigateToStore}
          className="hover:text-amber-800 transition-colors font-medium cursor-pointer"
        >
          {language === 'bn' ? 'হোম' : 'Home'}
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-stone-900 font-bold">
          {language === 'bn' ? 'শপিং ব্যাগ' : 'Shopping Cart'}
        </span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 flex items-center gap-3">
            <ShoppingBagIcon size={28} className="text-amber-800" />
            <span>{language === 'bn' ? 'আপনার শপিং ব্যাগ' : 'Your Shopping Bag'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {language === 'bn'
              ? 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি এবং দ্রুত হোম ডেলিভারি সুবিধা'
              : 'Cash on delivery and reliable home delivery nationwide'}
          </p>
        </div>

        {cart.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl">
            <span>{language === 'bn' ? 'মোট পণ্য:' : 'Total Items:'}</span>
            <span className="bg-amber-800 text-white px-2 py-0.5 rounded-md font-bold tabular-nums">
              {cartTotals.itemCount}
            </span>
          </div>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8 shadow-xs max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-800 mx-auto flex items-center justify-center mb-5 border border-amber-100">
            <ShoppingBagIcon size={36} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
            {language === 'bn' ? 'আপনার শপিং ব্যাগটি বর্তমানে সম্পূর্ণ খালি!' : 'Your Shopping Bag is Empty'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
            {language === 'bn'
              ? 'সোনামণির জন্য নিরাপদ ও প্রিমিয়াম এমএস স্টিল ফ্রেমের বেবি দোলনা কালেকশন দেখুন এবং ঘরে বসেই অর্ডার করুন।'
              : 'Browse our collection of MS steel baby cradles and order easily with nationwide cash on delivery.'}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={navigateToStore}
              className="w-full sm:w-auto px-6 py-3.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBagIcon size={16} />
              <span>{language === 'bn' ? 'দোলনা কালেকশন দেখুন' : 'Explore Baby Cradles'}</span>
            </button>
            <a
              href={`tel:${siteConfig.phone1.replace(/[^0-9]/g, '')}`}
              className="w-full sm:w-auto px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm rounded-xl border border-stone-200 transition-colors flex items-center justify-center gap-2"
            >
              <PhoneIcon size={16} className="text-amber-800" />
              <span>{language === 'bn' ? `কল করুন: ${siteConfig.phone1}` : `Call: ${siteConfig.phone1}`}</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs font-bold text-stone-700 uppercase tracking-wider">
                <span>{language === 'bn' ? 'পণ্যের বিবরণ' : 'Product Details'}</span>
                <span>{language === 'bn' ? 'মোট মূল্য' : 'Subtotal'}</span>
              </div>

              <div className="divide-y divide-stone-100">
                {cart.map((item) => {
                  const discountPercent = calculateDiscount(item.product.originalPrice, item.product.price);
                  return (
                    <div
                      key={item.product.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-stone-50/50 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => navigateToProduct(item.product.id)}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-stone-50 border border-stone-200 p-2 shrink-0 flex items-center justify-center group cursor-pointer"
                      >
                        <img
                          src={optimizedImage(item.product.image, 160)} decoding="async"
                          alt={item.product.titleEn}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </button>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                            {item.product.modelNo}
                          </span>
                          {discountPercent > 0 && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>

                        <h3
                          onClick={() => navigateToProduct(item.product.id)}
                          className="text-sm sm:text-base font-bold text-stone-900 hover:text-amber-800 cursor-pointer transition-colors leading-snug line-clamp-2"
                        >
                          {language === 'bn' ? item.product.titleBn : item.product.titleEn}
                        </h3>

                        <div className="text-xs text-stone-500">
                          {language === 'bn' ? 'ফ্রি বেড সেট ও মশারি সহ' : 'Includes Free Bedding & Mosquito Net'}
                        </div>

                        <div className="pt-1 flex items-baseline gap-2">
                          <span className="text-sm font-bold text-amber-800 tabular-nums">
                            {formatPriceBDT(item.product.price, language)}
                          </span>
                          {item.product.originalPrice > item.product.price && (
                            <span className="text-xs text-stone-400 line-through tabular-nums">
                              {formatPriceBDT(item.product.originalPrice, language)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                        <div className="text-right sm:order-2">
                          <div className="text-sm sm:text-base font-extrabold text-stone-900 tabular-nums">
                            {formatPriceBDT(item.product.price * item.quantity, language)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:order-1">
                          <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 p-0.5">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-white rounded-md transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <MinusIcon size={12} />
                            </button>
                            <span className="text-xs font-bold w-7 text-center tabular-nums text-stone-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-white rounded-md transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <PlusIcon size={12} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            aria-label={`Remove ${item.product.titleEn}`}
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={navigateToStore}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowRightIcon size={14} className="rotate-180" />
                  <span>{language === 'bn' ? 'আরও পণ্য যোগ করুন' : 'Continue Shopping'}</span>
                </button>

                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'সম্পূর্ণ ব্যাগ খালি করুন' : 'Clear Entire Bag'}
                </button>
              </div>
            </div>

            <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-amber-950 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon size={18} className="text-amber-800 shrink-0" />
                <span>{language === 'bn' ? '১০০% ক্যাশ অন ডেলিভারি' : 'Cash on Delivery Guaranteed'}</span>
              </div>
              <div className="flex items-center gap-2">
                <TruckIcon size={18} className="text-amber-800 shrink-0" />
                <span>{language === 'bn' ? 'পণ্য দেখে টাকা পরিশোধের সুযোগ' : 'Check Before Payment'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon size={18} className="text-amber-800 shrink-0" />
                <span>{language === 'bn' ? 'ফ্রি বেড সেট ও মশারি সহ' : 'Free Bedding Set Included'}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm space-y-5 sticky top-24">
              <h2 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-3">
                {language === 'bn' ? 'অর্ডারের বিবরণ ও মূল্য' : 'Order Summary'}
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>{language === 'bn' ? 'পণ্যগুলোর মোট মূল্য' : 'Items Subtotal'}</span>
                  <span className="font-bold text-stone-900 tabular-nums">
                    {formatPriceBDT(cartTotals.subtotal, language)}
                  </span>
                </div>

                {cartTotals.totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>{language === 'bn' ? 'মোট সাশ্রয়' : 'Product Savings'}</span>
                    <span className="font-bold tabular-nums">
                      -{formatPriceBDT(cartTotals.totalSavings, language)}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-stone-100">
                  <label className="block text-xs font-bold text-stone-800 mb-2">
                    {language === 'bn' ? 'ডেলিভারি এলাকা নির্বাচন করুন:' : 'Select Delivery Area:'}
                  </label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryArea('dhaka_inside')}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        deliveryArea === 'dhaka_inside'
                          ? 'border-amber-700 bg-amber-50/70 text-amber-950 font-bold ring-1 ring-amber-700/30'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">
                          {language === 'bn' ? 'ঢাকার ভিতরে' : 'Inside Dhaka'}
                        </div>
                        <div className="text-[11px] text-amber-900 font-bold mt-0.5">
                          {insideDhakaFee === 0
                            ? language === 'bn' ? 'ফ্রি ডেলিভারি (৳০)' : 'Free Delivery (৳0)'
                            : language === 'bn' ? `ডেলিভারি চার্জ: ${formatPriceBDT(insideDhakaFee, language)}` : `Fee: ${formatPriceBDT(insideDhakaFee, language)}`}
                        </div>
                      </div>
                      {deliveryArea === 'dhaka_inside' && (
                        <div className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center shrink-0">
                          <CheckIcon size={12} />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryArea('dhaka_outside')}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        deliveryArea === 'dhaka_outside'
                          ? 'border-amber-700 bg-amber-50/70 text-amber-950 font-bold ring-1 ring-amber-700/30'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">
                          {language === 'bn' ? 'ঢাকার বাইরে (সারা বাংলাদেশ)' : 'Outside Dhaka (All BD)'}
                        </div>
                        <div className="text-[11px] text-amber-900 font-bold mt-0.5">
                          {outsideDhakaFee === 0
                            ? language === 'bn' ? 'ফ্রি ডেলিভারি (৳০)' : 'Free Delivery (৳0)'
                            : language === 'bn' ? `ডেলিভারি চার্জ: ${formatPriceBDT(outsideDhakaFee, language)}` : `Fee: ${formatPriceBDT(outsideDhakaFee, language)}`}
                        </div>
                      </div>
                      {deliveryArea === 'dhaka_outside' && (
                        <div className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center shrink-0">
                          <CheckIcon size={12} />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-stone-600 pt-1">
                  <span>{language === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}</span>
                  <span className={`font-bold tabular-nums ${currentDeliveryFee === 0 ? 'text-emerald-700' : 'text-stone-900'}`}>
                    {currentDeliveryFee === 0
                      ? language === 'bn' ? 'ফ্রি (৳০)' : 'Free (৳0)'
                      : formatPriceBDT(currentDeliveryFee, language)}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>
                      {language === 'bn' ? `কুপন ছাড় (${appliedCoupon})` : `Promo Discount (${appliedCoupon})`}
                    </span>
                    <span className="tabular-nums">
                      -{formatPriceBDT(couponDiscount, language)}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-stone-100">
                {!appliedCoupon ? (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder={language === 'bn' ? 'কুপন কোড (যেমন: BABY50)' : 'Promo Code (e.g. BABY50)'}
                      className="flex-1 px-3 py-2 border border-stone-300 rounded-xl text-xs uppercase focus:outline-hidden focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      {language === 'bn' ? 'প্রয়োগ' : 'Apply'}
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold">
                    <span>{language === 'bn' ? `কুপন সক্রিয়: ${appliedCoupon} (-৳${couponDiscount})` : `Applied: ${appliedCoupon} (-৳${couponDiscount})`}</span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1 hover:text-emerald-950 cursor-pointer"
                      aria-label="Remove coupon"
                    >
                      <CloseIcon size={14} />
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{couponError}</p>
                )}
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-baseline justify-between">
                <div>
                  <div className="text-base font-extrabold text-stone-900">
                    {language === 'bn' ? 'সর্বমোট প্রদেয়' : 'Total Amount'}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {language === 'bn' ? 'ক্যাশ অন ডেলিভারিতে প্রদেয়' : 'Payable on Cash on Delivery'}
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-800 tabular-nums">
                  {formatPriceBDT(finalTotal, language)}
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-4 bg-amber-700 hover:bg-amber-800 text-white font-black text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ShoppingBagIcon size={20} />
                <span>
                  {language === 'bn' ? 'ক্যাশ অন ডেলিভারি অর্ডার সম্পন্ন করুন' : 'Proceed to Cash on Delivery'}
                </span>
              </button>

              <div className="text-center text-xs text-stone-500 space-y-1">
                <div>
                  {language === 'bn'
                    ? 'কোনো অগ্রিম পেমেন্ট নেই! পণ্য হাতে পেয়ে টাকা দিন।'
                    : 'No advance payment needed! Pay upon delivery.'}
                </div>
                <div className="font-semibold text-amber-800">
                  {language === 'bn' ? 'যেকোনো সহায়তায় কল করুন:' : 'Helpline:'}{' '}
                  <a href={`tel:${siteConfig.phone1.replace(/[^0-9]/g, '')}`} className="underline">
                    {siteConfig.phone1}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

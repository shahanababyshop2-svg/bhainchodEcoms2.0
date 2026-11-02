import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPriceBDT, validateBangladeshPhone } from '../utils/pricing';
import {
  CloseIcon,
  ShieldCheckIcon,
  TruckIcon,
  CheckIcon,
  ShoppingBagIcon,
  LockIcon,
} from './Icons';
import { optimizedImage } from '../utils/imageUrl';

export const QuickCheckoutModal: React.FC = () => {
  const {
    isCheckoutModalOpen,
    checkoutProduct,
    closeCheckout,
    cart,
    cartTotals,
    createOrder,
    language,
    getDeliveryFee,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCityDistrict, setCustomerCityDistrict] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'dhaka_inside' | 'dhaka_outside'>('dhaka_inside');
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
  }>({});

  if (!isCheckoutModalOpen) return null;

  // If a single product was clicked via "অর্ডার করুন", order that product directly.
  // Otherwise order whole cart.
  const isDirectProductBuy = !!checkoutProduct;

  const currentItems = isDirectProductBuy && checkoutProduct
    ? [{ product: checkoutProduct, quantity }]
    : cart;

  const subtotal = currentItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const deliveryFee = getDeliveryFee(deliveryArea, subtotal);
  const insideDhakaFee = getDeliveryFee('dhaka_inside', subtotal);
  const outsideDhakaFee = getDeliveryFee('dhaka_outside', subtotal);
  const grandTotal = subtotal + deliveryFee;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    if (!customerName.trim()) {
      newErrors.name = language === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your name.';
    }

    if (!customerPhone.trim()) {
      newErrors.phone = language === 'bn' ? 'মোবাইল নম্বর লিখুন।' : 'Please enter your phone number.';
    } else if (!validateBangladeshPhone(customerPhone)) {
      newErrors.phone =
        language === 'bn'
          ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX).'
          : 'Enter a valid 11-digit Bangladeshi mobile number (01XXXXXXXXX).';
    }

    if (!customerAddress.trim()) {
      newErrors.address =
        language === 'bn'
          ? 'সম্পূর্ণ ঠিকানা লিখুন (যেমন: থানা, জেলা, রোড নম্বর).'
          : 'Please enter your full delivery address with district.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      customerCityDistrict: customerCityDistrict.trim() || (deliveryArea === 'dhaka_inside' ? 'Dhaka' : 'Outside Dhaka'),
      deliveryArea,
      paymentMethod: 'cod',
      items: currentItems,
      subtotal,
      deliveryFee,
      total: grandTotal,
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/60 backdrop-blur-2xs">
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-2 sm:my-4">
          <div className="bg-amber-800 text-amber-50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBagIcon size={22} className="text-amber-200" />
              <div>
                <h2 className="text-base sm:text-lg font-bold leading-snug">
                  {language === 'bn' ? 'ক্যাশ অন ডেলিভারি দ্রুত অর্ডার' : 'Fast Cash on Delivery Checkout'}
                </h2>
                <p className="text-xs text-amber-200 mt-0.5 leading-snug">
                  {language === 'bn'
                    ? 'সারা দেশে ফ্রি হোম ডেলিভারি | পণ্য হাতে পেয়ে টাকা দিন'
                    : 'Free Home Delivery across Bangladesh | Pay after receiving'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeCheckout}
              className="p-1.5 rounded-full hover:bg-amber-700 text-amber-100 hover:text-white transition-colors"
              aria-label="Close checkout"
            >
              <CloseIcon size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-6">
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                {language === 'bn' ? 'অর্ডারকৃত পণ্য' : 'Order Items'}
              </h3>
              <div className="space-y-3">
                {currentItems.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white rounded-xl border border-stone-200 p-1 shrink-0 flex items-center justify-center">
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
                      <div className="text-xs text-amber-800 font-bold tabular-nums">
                        {formatPriceBDT(item.product.price, language)} x {item.quantity}
                      </div>
                    </div>
                    {isDirectProductBuy && (
                      <div className="flex items-center gap-2 border border-stone-300 rounded-lg p-1 bg-white">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-4 text-center tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    )}
                    <div className="text-right text-xs sm:text-sm font-bold text-stone-900 tabular-nums">
                      {formatPriceBDT(item.product.price * item.quantity, language)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                {language === 'bn' ? 'ডেলিভারি তথ্য পূরণ করুন' : 'Customer Delivery Details'}
              </h3>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  {language === 'bn' ? 'আপনার পূর্ণ নাম *' : 'Your Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder={language === 'bn' ? 'যেমন: মোহাম্মদ তানভীর' : 'e.g. Mohammad Tanvir'}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 outline-hidden transition-colors ${
                    errors.name
                      ? 'border-rose-500 bg-rose-50/30'
                      : 'border-stone-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  {language === 'bn' ? 'মোবাইল নম্বর (১১ ডিজিট) *' : 'Mobile Phone (11 digits) *'}
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (errors.phone) setErrors({ ...errors, phone: undefined });
                  }}
                  placeholder="01XXXXXXXXX"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 outline-hidden transition-colors ${
                    errors.phone
                      ? 'border-rose-500 bg-rose-50/30'
                      : 'border-stone-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700'
                  }`}
                />
                {errors.phone && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  {language === 'bn'
                    ? 'সম্পূর্ণ ডেলিভারি ঠিকানা (থানা, জেলা ও বিস্তারিত) *'
                    : 'Full Delivery Address (Thana, District, Road/House) *'}
                </label>
                <textarea
                  required
                  rows={2}
                  value={customerAddress}
                  onChange={(e) => {
                    setCustomerAddress(e.target.value);
                    if (errors.address) setErrors({ ...errors, address: undefined });
                  }}
                  placeholder={
                    language === 'bn'
                      ? 'যেমন: বাড়ি নং ১২, রোড নং ৫, ধানমন্ডি, ঢাকা'
                      : 'e.g. House 12, Road 5, Dhanmondi, Dhaka'
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 outline-hidden transition-colors ${
                    errors.address
                      ? 'border-rose-500 bg-rose-50/30'
                      : 'border-stone-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700'
                  }`}
                />
                {errors.address && (
                  <p className="text-xs text-rose-600 font-medium mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  {language === 'bn' ? 'ডেলিভারি এলাকা নির্বাচন করুন' : 'Select Delivery Area'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryArea('dhaka_inside')}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      deliveryArea === 'dhaka_inside'
                        ? 'border-amber-700 bg-amber-50/70 text-amber-950 font-bold ring-1 ring-amber-700/30'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="text-xs">
                      <div className="font-bold text-stone-900">{language === 'bn' ? 'ঢাকার ভিতরে' : 'Inside Dhaka'}</div>
                      <div className={`text-xs font-bold mt-1 ${insideDhakaFee === 0 ? 'text-emerald-700' : 'text-amber-900'}`}>
                        {insideDhakaFee === 0
                          ? language === 'bn' ? 'ফ্রি ডেলিভারি (৳০)' : 'Free Delivery (৳0)'
                          : language === 'bn' ? `ডেলিভারি চার্জ: ${formatPriceBDT(insideDhakaFee, language)}` : `Delivery Fee: ${formatPriceBDT(insideDhakaFee, language)}`}
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
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      deliveryArea === 'dhaka_outside'
                        ? 'border-amber-700 bg-amber-50/70 text-amber-950 font-bold ring-1 ring-amber-700/30'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="text-xs">
                      <div className="font-bold text-stone-900">{language === 'bn' ? 'ঢাকার বাইরে (সারা বাংলাদেশ)' : 'Outside Dhaka (All BD)'}</div>
                      <div className={`text-xs font-bold mt-1 ${outsideDhakaFee === 0 ? 'text-emerald-700' : 'text-amber-900'}`}>
                        {outsideDhakaFee === 0
                          ? language === 'bn' ? 'ফ্রি ডেলিভারি (৳০)' : 'Free Delivery (৳0)'
                          : language === 'bn' ? `ডেলিভারি চার্জ: ${formatPriceBDT(outsideDhakaFee, language)}` : `Delivery Fee: ${formatPriceBDT(outsideDhakaFee, language)}`}
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

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  {language === 'bn' ? 'মূল্য পরিশোধ পদ্ধতি' : 'Payment Method'}
                </label>
                <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center">
                      <CheckIcon size={12} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900">
                        {language === 'bn'
                          ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)'
                          : 'Cash on Delivery (COD)'}
                      </div>
                      <div className="text-[11px] text-stone-600">
                        {language === 'bn'
                          ? 'পণ্য হাতে পেয়ে চেক করে ডেলিভারিম্যানকে টাকা দিবেন।'
                          : 'Inspect the parcel upon arrival and pay cash to courier.'}
                      </div>
                    </div>
                  </div>
                  <ShieldCheckIcon size={20} className="text-amber-800" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  {language === 'bn' ? 'বিশেষ কোনো নির্দেশনা (ঐচ্ছিক)' : 'Order notes or instructions (optional)'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    language === 'bn'
                      ? 'যেমন: সকালে ডেলিভারি দিবেন বা আসার আগে ফোন দিবেন'
                      : 'e.g. Call before delivery'
                  }
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs text-stone-800 outline-hidden focus:border-amber-700"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>{language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
                <span className="font-semibold text-stone-900 tabular-nums">
                  {formatPriceBDT(subtotal, language)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{language === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Charge'}</span>
                <span className={`font-bold ${deliveryFee === 0 ? 'text-emerald-700' : 'text-stone-900'}`}>
                  {deliveryFee === 0
                    ? language === 'bn' ? 'ফ্রি হোম ডেলিভারি (৳০)' : 'Free Home Delivery (৳0)'
                    : formatPriceBDT(deliveryFee, language)}
                </span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between text-base font-black text-stone-900">
                <span>{language === 'bn' ? 'সর্বমোট প্রদেয় টাকা' : 'Total Payable'}</span>
                <span className="text-amber-800 tabular-nums">
                  {formatPriceBDT(grandTotal, language)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-base shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckIcon size={20} />
              <span>
                {language === 'bn'
                  ? `অর্ডার নিশ্চিত করুন - ${formatPriceBDT(grandTotal, language)}`
                  : `Confirm Order - ${formatPriceBDT(grandTotal, language)}`}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPriceBDT, validateBangladeshPhone } from '../utils/pricing';
import { optimizedImage } from '../utils/imageUrl';
import { CheckIcon, ChevronLeftIcon, LockIcon, ShieldCheckIcon } from '../components/Icons';
import { L, QtyStepper, num, useLockBodyScroll } from './ui';

type Errors = { name?: string; phone?: string; address?: string };

const fieldBase =
  'w-full rounded-2xl border bg-white px-4 text-[16px] text-stone-900 placeholder:text-stone-400 outline-hidden transition-colors';
const fieldOk = 'border-stone-300 focus:border-[#f27405] focus:ring-2 focus:ring-orange-200';
const fieldBad = 'border-rose-500 bg-rose-50/40 focus:ring-2 focus:ring-rose-200';

// The order form as a full screen with a Confirm button pinned to the bottom, so it is
// always in reach however long the form is. Same fields, rules and order creation as the
// original popup (QuickCheckoutModal).
export const MobileCheckout: React.FC = () => {
  const { checkoutProduct, closeCheckout, cart, createOrder, language, getDeliveryFee } = useStore();
  useLockBodyScroll();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'dhaka_inside' | 'dhaka_outside'>('dhaka_inside');
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<Errors>({});

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);

  // One product tapped on "Order Now" -> order just that. Otherwise order the whole cart.
  const isDirectBuy = !!checkoutProduct;
  const items = isDirectBuy && checkoutProduct ? [{ product: checkoutProduct, quantity }] : cart;
  const subtotal = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
  const deliveryFee = getDeliveryFee(deliveryArea, subtotal);
  const insideFee = getDeliveryFee('dhaka_inside', subtotal);
  const outsideFee = getDeliveryFee('dhaka_outside', subtotal);
  const grandTotal = subtotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};

    if (!customerName.trim()) {
      next.name = L(language, 'অনুগ্রহ করে আপনার নাম লিখুন।', 'Please enter your name.');
    }
    if (!customerPhone.trim()) {
      next.phone = L(language, 'মোবাইল নম্বর লিখুন।', 'Please enter your phone number.');
    } else if (!validateBangladeshPhone(customerPhone)) {
      next.phone = L(
        language,
        'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX).',
        'Enter a valid 11-digit Bangladeshi mobile number (01XXXXXXXXX).'
      );
    }
    if (!customerAddress.trim()) {
      next.address = L(
        language,
        'সম্পূর্ণ ঠিকানা লিখুন (যেমন: থানা, জেলা, রোড নম্বর).',
        'Please enter your full delivery address with district.'
      );
    }

    if (Object.keys(next).length > 0) {
      setErrors(next);
      // jump to the first field that needs fixing
      const first = next.name ? nameRef.current : next.phone ? phoneRef.current : addressRef.current;
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      first?.focus({ preventScroll: true });
      return;
    }

    createOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      customerCityDistrict: deliveryArea === 'dhaka_inside' ? 'Dhaka' : 'Outside Dhaka',
      deliveryArea,
      paymentMethod: 'cod',
      items,
      subtotal,
      deliveryFee,
      total: grandTotal,
      notes: notes.trim(),
    });
  };

  const label = 'block text-[15px] font-bold text-stone-800 mb-1.5';
  const errorText = 'mt-1.5 text-[14px] leading-snug font-bold text-rose-600';

  const areaOption = (id: 'dhaka_inside' | 'dhaka_outside', title: string, fee: number) => {
    const selected = deliveryArea === id;
    return (
      <button
        type="button"
        onClick={() => setDeliveryArea(id)}
        role="radio"
        aria-checked={selected}
        className={`w-full min-h-16 px-4 py-3 rounded-2xl border-2 flex items-center justify-between gap-3 text-left cursor-pointer ${
          selected ? 'border-[#f27405] bg-orange-50' : 'border-stone-200 bg-white active:bg-stone-50'
        }`}
      >
        <span>
          <span className="block text-[16px] font-bold text-stone-900">{title}</span>
          <span className={`block text-[14px] font-bold ${fee === 0 ? 'text-emerald-700' : 'text-[#d96602]'}`}>
            {fee === 0
              ? L(language, 'ফ্রি ডেলিভারি (৳০)', 'Free Delivery (৳0)')
              : `${L(language, 'ডেলিভারি চার্জ', 'Delivery Fee')}: ${formatPriceBDT(fee, language)}`}
          </span>
        </span>
        <span
          className={`w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center ${
            selected ? 'bg-[#f27405] border-[#f27405] text-white' : 'border-stone-300 text-transparent'
          }`}
          aria-hidden="true"
        >
          <CheckIcon size={16} />
        </span>
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-stone-50 flex flex-col sbs-screen-up"
      role="dialog"
      aria-modal="true"
      aria-label={L(language, 'অর্ডার করুন', 'Checkout')}
    >
      <header className="shrink-0 h-14 bg-white border-b border-stone-200 flex items-center gap-1 px-2">
        <button
          type="button"
          onClick={closeCheckout}
          className="w-12 h-12 flex items-center justify-center rounded-xl text-stone-800 active:bg-stone-100 cursor-pointer"
          aria-label={L(language, 'পেছনে যান', 'Go back')}
        >
          <ChevronLeftIcon size={26} />
        </button>
        <div className="min-w-0">
          <h1 className="text-[18px] leading-tight font-bold text-stone-900 truncate">
            {L(language, 'ক্যাশ অন ডেলিভারি অর্ডার', 'Cash on Delivery Order')}
          </h1>
          <p className="text-[13px] leading-tight text-stone-600 truncate">
            {L(language, 'পণ্য হাতে পেয়ে টাকা দিন', 'Pay after receiving the product')}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <form id="m-checkout-form" onSubmit={handleSubmit} noValidate className="px-4 py-4 space-y-6">
          <section aria-labelledby="m-co-items">
            <h2 id="m-co-items" className="text-[15px] font-bold text-stone-500 uppercase tracking-wide mb-2">
              {L(language, 'অর্ডারকৃত পণ্য', 'Order Items')}
            </h2>
            <div className="rounded-3xl bg-white border border-stone-200 divide-y divide-stone-100">
              {items.length === 0 && (
                <p className="p-4 text-[16px] text-stone-600">
                  {L(language, 'আপনার ব্যাগ খালি।', 'Your bag is empty.')}
                </p>
              )}
              {items.map((item) => {
                const name = language === 'bn' ? item.product.titleBn : item.product.titleEn;
                return (
                  <div key={item.product.id} className="p-3 flex items-center gap-3">
                    <span className="w-16 h-16 shrink-0 rounded-xl border border-stone-200 bg-white flex items-center justify-center overflow-hidden">
                      <img
                        src={optimizedImage(item.product.image, 160)}
                        alt=""
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain p-1"
                      />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] leading-snug font-bold text-stone-900 line-clamp-2">{name}</div>
                      <div className="mt-0.5 text-[15px] font-bold text-[#d96602] tabular-nums">
                        {formatPriceBDT(item.product.price, language)} × {num(language, item.quantity)}
                      </div>
                      {isDirectBuy && (
                        <div className="mt-2">
                          <QtyStepper value={quantity} onChange={setQuantity} lang={language} label={name} />
                        </div>
                      )}
                    </div>
                    <div className="text-[16px] font-bold text-stone-900 tabular-nums self-start pt-1">
                      {formatPriceBDT(item.product.price * item.quantity, language)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-4" aria-labelledby="m-co-details">
            <h2 id="m-co-details" className="text-[15px] font-bold text-stone-500 uppercase tracking-wide">
              {L(language, 'ডেলিভারি তথ্য', 'Delivery Details')}
            </h2>

            <div>
              <label htmlFor="m-co-name" className={label}>
                {L(language, 'আপনার পূর্ণ নাম *', 'Your Full Name *')}
              </label>
              <input
                id="m-co-name"
                ref={nameRef}
                type="text"
                autoComplete="name"
                enterKeyHint="next"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder={L(language, 'যেমন: মোহাম্মদ তানভীর', 'e.g. Mohammad Tanvir')}
                aria-invalid={!!errors.name}
                className={`${fieldBase} h-13 ${errors.name ? fieldBad : fieldOk}`}
              />
              {errors.name && <p className={errorText} role="alert">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="m-co-phone" className={label}>
                {L(language, 'মোবাইল নম্বর (১১ ডিজিট) *', 'Mobile Phone (11 digits) *')}
              </label>
              <input
                id="m-co-phone"
                ref={phoneRef}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                enterKeyHint="next"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: undefined });
                }}
                placeholder="01XXXXXXXXX"
                aria-invalid={!!errors.phone}
                className={`${fieldBase} h-13 tabular-nums ${errors.phone ? fieldBad : fieldOk}`}
              />
              {errors.phone && <p className={errorText} role="alert">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="m-co-address" className={label}>
                {L(language, 'সম্পূর্ণ ডেলিভারি ঠিকানা (থানা, জেলা ও বিস্তারিত) *', 'Full Delivery Address (Thana, District, Road/House) *')}
              </label>
              <textarea
                id="m-co-address"
                ref={addressRef}
                rows={3}
                autoComplete="street-address"
                value={customerAddress}
                onChange={(e) => {
                  setCustomerAddress(e.target.value);
                  if (errors.address) setErrors({ ...errors, address: undefined });
                }}
                placeholder={L(language, 'যেমন: বাড়ি নং ১২, রোড নং ৫, ধানমন্ডি, ঢাকা', 'e.g. House 12, Road 5, Dhanmondi, Dhaka')}
                aria-invalid={!!errors.address}
                className={`${fieldBase} py-3 leading-relaxed resize-none ${errors.address ? fieldBad : fieldOk}`}
              />
              {errors.address && <p className={errorText} role="alert">{errors.address}</p>}
            </div>

            <div>
              <span id="m-co-area" className={label}>
                {L(language, 'ডেলিভারি এলাকা নির্বাচন করুন', 'Select Delivery Area')}
              </span>
              <div role="radiogroup" aria-labelledby="m-co-area" className="space-y-2.5">
                {areaOption('dhaka_inside', L(language, 'ঢাকার ভিতরে', 'Inside Dhaka'), insideFee)}
                {areaOption('dhaka_outside', L(language, 'ঢাকার বাইরে (সারা বাংলাদেশ)', 'Outside Dhaka (All BD)'), outsideFee)}
              </div>
            </div>

            <div>
              <span className={label}>{L(language, 'মূল্য পরিশোধ পদ্ধতি', 'Payment Method')}</span>
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-4 flex items-center gap-3">
                <span className="w-7 h-7 shrink-0 rounded-full bg-[#f27405] text-white flex items-center justify-center">
                  <CheckIcon size={16} />
                </span>
                <div className="flex-1">
                  <div className="text-[16px] font-bold text-stone-900">
                    {L(language, 'ক্যাশ অন ডেলিভারি (COD)', 'Cash on Delivery (COD)')}
                  </div>
                  <div className="text-[14px] leading-snug text-stone-700">
                    {L(
                      language,
                      'পণ্য হাতে পেয়ে চেক করে ডেলিভারিম্যানকে টাকা দিবেন।',
                      'Inspect the parcel upon arrival and pay cash to courier.'
                    )}
                  </div>
                </div>
                <ShieldCheckIcon size={24} className="text-amber-800 shrink-0" />
              </div>
            </div>

            <div>
              <label htmlFor="m-co-notes" className={`${label} font-normal text-stone-600`}>
                {L(language, 'বিশেষ কোনো নির্দেশনা (ঐচ্ছিক)', 'Order notes or instructions (optional)')}
              </label>
              <input
                id="m-co-notes"
                type="text"
                enterKeyHint="done"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={L(language, 'যেমন: আসার আগে ফোন দিবেন', 'e.g. Call before delivery')}
                className={`${fieldBase} h-13 ${fieldOk}`}
              />
            </div>
          </section>

          <section className="rounded-3xl bg-white border border-stone-200 p-4 space-y-2 text-[16px]" aria-label={L(language, 'হিসাব', 'Summary')}>
            <div className="flex justify-between text-stone-600">
              <span>{L(language, 'সাবটোটাল', 'Subtotal')}</span>
              <span className="font-bold text-stone-900 tabular-nums">{formatPriceBDT(subtotal, language)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>{L(language, 'ডেলিভারি চার্জ', 'Delivery Charge')}</span>
              <span className={`font-bold tabular-nums ${deliveryFee === 0 ? 'text-emerald-700' : 'text-stone-900'}`}>
                {deliveryFee === 0 ? L(language, 'ফ্রি (৳০)', 'Free (৳0)') : formatPriceBDT(deliveryFee, language)}
              </span>
            </div>
            <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
              <span className="text-[17px] font-bold text-stone-900">{L(language, 'সর্বমোট প্রদেয়', 'Total Payable')}</span>
              <span className="text-[22px] font-bold text-[#d96602] tabular-nums">{formatPriceBDT(grandTotal, language)}</span>
            </div>
          </section>

          <p className="flex items-center justify-center gap-2 text-[14px] text-stone-500 pb-2">
            <LockIcon size={16} />
            <span>{L(language, 'আপনার তথ্য শুধু অর্ডারের জন্য ব্যবহার হবে।', 'Your details are used only for this order.')}</span>
          </p>
        </form>
      </div>

      <div
        className="shrink-0 bg-white border-t border-stone-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 pt-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <button
          type="submit"
          form="m-checkout-form"
          disabled={items.length === 0}
          className="w-full h-14 rounded-2xl bg-[#f27405] active:bg-[#d96602] disabled:opacity-50 text-white text-[17px] font-bold inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <CheckIcon size={22} />
          <span>
            {L(language, 'অর্ডার নিশ্চিত করুন', 'Confirm Order')} · {formatPriceBDT(grandTotal, language)}
          </span>
        </button>
      </div>
    </div>
  );
};

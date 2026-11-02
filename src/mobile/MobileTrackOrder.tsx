import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { lookupOrder } from '../lib/trackOrder';
import { Order, OrderStatus } from '../types';
import { formatPriceBDT } from '../utils/pricing';
import { getRememberedOrders, RememberedOrder } from '../utils/myOrders';
import { buildTrackingTimeline, isValidPhoneInput, parseOrderDate, FlowStatus } from '../utils/orderTracking';
import { optimizedImage } from '../utils/imageUrl';
import { telHref, whatsappHref } from '../utils/mobileUi';
import { CheckIcon, CloseIcon, PhoneIcon, RefreshIcon, SearchIcon, ShoppingBagIcon, TruckIcon, WhatsAppIcon } from '../components/Icons';
import { L, num } from './ui';

// Phone version of the order tracking page. Same lookup and timeline as TrackOrderPage
// (src/components/TrackOrderPage.tsx), with bigger text and bigger buttons.

const STEP_TEXT: Record<FlowStatus, { en: [string, string]; bn: [string, string] }> = {
  pending: { en: ['Order Placed', 'We have received your order'], bn: ['অর্ডার গ্রহণ করা হয়েছে', 'আমরা আপনার অর্ডার পেয়েছি'] },
  confirmed: { en: ['Order Confirmed', 'Confirmed by a phone call'], bn: ['অর্ডার কনফার্ম হয়েছে', 'ফোনে কল করে নিশ্চিত করা হয়েছে'] },
  shipped: { en: ['Shipped', 'Packed and on its way to you'], bn: ['পাঠানো হয়েছে', 'প্যাক করে আপনার ঠিকানার দিকে পাঠানো হয়েছে'] },
  delivered: { en: ['Delivered', 'Parcel handed over to you'], bn: ['ডেলিভারি সম্পন্ন', 'পণ্য আপনার হাতে পৌঁছে দেওয়া হয়েছে'] },
};

const STATUS_MESSAGE: Record<OrderStatus, { en: string; bn: string }> = {
  pending: { en: 'We have received your order. Our team will call you soon to confirm it.', bn: 'আমরা আপনার অর্ডার পেয়েছি। কনফার্ম করতে আমাদের প্রতিনিধি শীঘ্রই আপনাকে কল করবেন।' },
  confirmed: { en: 'Your order is confirmed and is being prepared for dispatch.', bn: 'আপনার অর্ডার কনফার্ম হয়েছে এবং পাঠানোর জন্য প্রস্তুত করা হচ্ছে।' },
  shipped: { en: 'Your parcel is on its way. Please keep your phone nearby, the delivery person may call you.', bn: 'আপনার পার্সেল পথে আছে। ফোন কাছে রাখুন, ডেলিভারি ম্যান কল করতে পারেন।' },
  delivered: { en: 'Your order was delivered. Thank you for shopping with us!', bn: 'আপনার অর্ডার ডেলিভারি হয়েছে। আমাদের সাথে কেনাকাটার জন্য ধন্যবাদ!' },
  cancelled: { en: 'This order was cancelled. If this is unexpected, please contact us.', bn: 'এই অর্ডারটি বাতিল করা হয়েছে। এটি অপ্রত্যাশিত হলে অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন।' },
};

const STATUS_LABEL: Record<OrderStatus, { en: string; bn: string }> = {
  pending: { en: 'Pending', bn: 'অপেক্ষমান' },
  confirmed: { en: 'Confirmed', bn: 'কনফার্মড' },
  shipped: { en: 'Shipped', bn: 'পাঠানো হয়েছে' },
  delivered: { en: 'Delivered', bn: 'ডেলিভারি সম্পন্ন' },
  cancelled: { en: 'Cancelled', bn: 'বাতিল' },
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-900 border-amber-200',
  confirmed: 'bg-sky-100 text-sky-900 border-sky-200',
  shipped: 'bg-indigo-100 text-indigo-900 border-indigo-200',
  delivered: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  cancelled: 'bg-rose-100 text-rose-900 border-rose-200',
};

const inputClass =
  'w-full h-13 rounded-2xl border border-stone-300 bg-white px-4 text-[16px] text-stone-900 placeholder:text-stone-400 outline-hidden focus:border-[#f27405] focus:ring-2 focus:ring-orange-200';

export const MobileTrackOrder: React.FC = () => {
  const { language, orders, siteConfig, navigateToTerms, trackingPrefill, setTrackingPrefill } = useStore();

  const [orderIdInput, setOrderIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [remembered, setRemembered] = useState<RememberedOrder[]>([]);
  const lastQuery = useRef<{ id: string; phone: string } | null>(null);

  const runSearch = async (idValue: string, phoneValue: string) => {
    setMessage(null);

    if (!idValue.trim()) {
      setOrder(null);
      setMessage(L(language, 'অর্ডার আইডি লিখুন (যেমন: SBS-1234)।', 'Please enter your Order ID (for example SBS-1234).'));
      return;
    }
    if (!isValidPhoneInput(phoneValue)) {
      setOrder(null);
      setMessage(L(language, 'অর্ডারের সময় দেওয়া মোবাইল নম্বরটি সঠিকভাবে লিখুন।', 'Please enter the mobile number you used when ordering.'));
      return;
    }

    setLoading(true);
    lastQuery.current = { id: idValue, phone: phoneValue };
    const result = await lookupOrder(idValue, phoneValue, orders);
    setLoading(false);

    if (result.kind === 'found') {
      setOrder(result.order);
    } else if (result.kind === 'not_found') {
      setOrder(null);
      setMessage(
        L(
          language,
          'এই অর্ডার আইডি ও মোবাইল নম্বরে কোনো অর্ডার পাওয়া যায়নি। দুটি তথ্য আবার মিলিয়ে দেখুন, অথবা আমাদের কল করুন।',
          'We could not find an order with this Order ID and phone number. Please check both and try again, or call us.'
        )
      );
    } else {
      setOrder(null);
      setMessage(
        L(
          language,
          'এই মুহূর্তে অর্ডারের তথ্য আনা যাচ্ছে না। ইন্টারনেট চেক করে আবার চেষ্টা করুন।',
          'We could not load your order right now. Please check your internet connection and try again.'
        )
      );
    }
  };

  // Opened from the "order placed" screen: fill the form and search straight away.
  useEffect(() => {
    setRemembered(getRememberedOrders());
    if (trackingPrefill) {
      setOrderIdInput(trackingPrefill.orderId);
      setPhoneInput(trackingPrefill.phone);
      const { orderId, phone } = trackingPrefill;
      setTrackingPrefill(null);
      runSearch(orderId, phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (at: string | null): string => {
    const d = parseOrderDate(at);
    if (!d) return '';
    return d.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const timeline = order ? buildTrackingTimeline(order) : null;

  return (
    <div className="px-4 py-5 space-y-5 sbs-screen-up">
      <header>
        <h2 className="flex items-center gap-2.5 text-[22px] leading-snug font-bold text-stone-900">
          <TruckIcon size={28} className="text-[#f27405] shrink-0" />
          <span>{L(language, 'আপনার অর্ডার ট্র্যাক করুন', 'Track Your Order')}</span>
        </h2>
        <p className="mt-1 text-[15px] leading-relaxed text-stone-600">
          {L(language, 'অর্ডার আইডি ও মোবাইল নম্বর দিয়ে অর্ডারের বর্তমান অবস্থা দেখুন', 'Enter your Order ID and phone number to see where your order is')}
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          (document.activeElement as HTMLElement | null)?.blur();
          runSearch(orderIdInput, phoneInput);
        }}
        noValidate
        className="rounded-3xl bg-white border border-stone-200 p-4 space-y-4"
      >
        <div>
          <label htmlFor="m-track-id" className="block text-[15px] font-bold text-stone-800 mb-1.5">
            {L(language, 'অর্ডার আইডি', 'Order ID')}
          </label>
          <input
            id="m-track-id"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            enterKeyHint="next"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            placeholder="SBS-1234"
            className={`${inputClass} font-mono uppercase`}
          />
        </div>
        <div>
          <label htmlFor="m-track-phone" className="block text-[15px] font-bold text-stone-800 mb-1.5">
            {L(language, 'মোবাইল নম্বর', 'Phone Number')}
          </label>
          <input
            id="m-track-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            enterKeyHint="search"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="01XXXXXXXXX"
            className={`${inputClass} tabular-nums`}
          />
        </div>

        <p className="text-[14px] leading-snug text-stone-500">
          {L(
            language,
            'অর্ডার আইডি অর্ডার সফল হওয়ার পর স্ক্রিনে এবং হোয়াটসঅ্যাপ মেসেজে দেখানো হয়।',
            'Your Order ID is shown on the order confirmation screen and in your WhatsApp message.'
          )}
        </p>

        {message && (
          <div role="alert" className="flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-[15px] leading-snug text-rose-800">
            <CloseIcon size={18} className="mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-[#f27405] active:bg-[#d96602] disabled:opacity-60 text-white text-[17px] font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? <RefreshIcon size={20} className="animate-spin" /> : <SearchIcon size={20} />}
          <span>{loading ? L(language, 'খোঁজা হচ্ছে...', 'Searching...') : L(language, 'ট্র্যাক করুন', 'Track Order')}</span>
        </button>
      </form>

      {remembered.length > 0 && !order && (
        <section>
          <h3 className="text-[14px] font-bold tracking-wide uppercase text-stone-500 mb-2">
            {L(language, 'এই ডিভাইসের সাম্প্রতিক অর্ডার', 'Recent orders on this device')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {remembered.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setOrderIdInput(r.id);
                  setPhoneInput(r.phone);
                  runSearch(r.id, r.phone);
                }}
                className="h-12 px-4 rounded-full border border-stone-300 bg-white active:bg-orange-50 text-[16px] font-mono font-bold text-stone-800 cursor-pointer"
              >
                #{r.id}
              </button>
            ))}
          </div>
        </section>
      )}

      {order && timeline && (
        <div className="space-y-5">
          <section className="rounded-3xl bg-white border border-stone-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[13px] font-bold uppercase tracking-wide text-stone-500">{L(language, 'অর্ডার আইডি', 'Order ID')}</div>
                <div className="font-mono font-bold text-[22px] text-stone-900">#{order.id}</div>
                <div className="text-[14px] text-stone-600">
                  {L(language, 'অর্ডারের সময়:', 'Placed on:')} {formatDate(order.createdAt)}
                </div>
              </div>
              <span className={`shrink-0 rounded-full border px-3 py-1 text-[14px] font-bold ${STATUS_BADGE[order.status]}`}>
                {STATUS_LABEL[order.status][language]}
              </span>
            </div>

            <p
              className={`mt-4 rounded-2xl p-3.5 text-[16px] leading-relaxed ${
                timeline.cancelled ? 'bg-rose-50 border border-rose-200 text-rose-900' : 'bg-amber-50 border border-amber-200 text-amber-950'
              }`}
            >
              {STATUS_MESSAGE[order.status][language]}
              {timeline.cancelled && timeline.cancelledAt && (
                <span className="block text-[14px] mt-1 opacity-80">
                  {L(language, 'বাতিলের সময়:', 'Cancelled on:')} {formatDate(timeline.cancelledAt)}
                </span>
              )}
            </p>

            <ol className="mt-6">
              {timeline.steps.map((step, i) => {
                const text = STEP_TEXT[step.status][language];
                const isLast = i === timeline.steps.length - 1;
                const done = step.state === 'done';
                const current = step.state === 'current';
                return (
                  <li key={step.status} className="relative flex gap-4 pb-7 last:pb-0">
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className={`absolute left-[19px] top-10 bottom-0 w-0.5 ${
                          done && timeline.steps[i + 1].state !== 'upcoming' ? 'bg-emerald-500' : 'bg-stone-200'
                        }`}
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className={`relative z-10 w-10 h-10 shrink-0 rounded-full flex items-center justify-center border-2 ${
                        done
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : current
                          ? 'bg-white border-[#f27405] text-[#f27405] ring-4 ring-orange-100'
                          : 'bg-white border-stone-300 text-stone-300'
                      }`}
                    >
                      {done ? <CheckIcon size={20} /> : step.status === 'shipped' || step.status === 'delivered' ? <TruckIcon size={19} /> : <ShoppingBagIcon size={19} />}
                    </span>
                    <div className="pt-0.5 min-w-0">
                      <div className={`text-[17px] leading-snug font-bold ${step.state === 'upcoming' ? 'text-stone-400' : 'text-stone-900'}`}>
                        {text[0]}
                        {current && <span className="ml-2 text-[13px] font-bold uppercase tracking-wide text-[#d96602]">{L(language, 'এখন', 'Now')}</span>}
                      </div>
                      <div className={`text-[15px] leading-snug ${step.state === 'upcoming' ? 'text-stone-400' : 'text-stone-600'}`}>{text[1]}</div>
                      {step.at && <div className="text-[14px] text-stone-500 mt-0.5">{formatDate(step.at)}</div>}
                    </div>
                  </li>
                );
              })}
            </ol>

            {!timeline.cancelled && order.status !== 'delivered' && (
              <div className="mt-5 pt-4 border-t border-stone-100 text-[15px] text-stone-600 space-y-1">
                <div>
                  {L(language, 'আনুমানিক ডেলিভারি সময়:', 'Estimated delivery time:')}{' '}
                  <strong className="text-stone-900">
                    {order.deliveryArea === 'dhaka_inside' ? L(language, '১–২ কার্যদিবস', '1–2 working days') : L(language, '২–৫ কার্যদিবস', '2–5 working days')}
                  </strong>
                </div>
                <button type="button" onClick={navigateToTerms} className="min-h-11 underline text-[#d96602] font-bold cursor-pointer text-left">
                  {L(language, 'ডেলিভারির শর্ত দেখুন', 'See delivery terms')}
                </button>
              </div>
            )}
          </section>

          <section className="rounded-3xl bg-white border border-stone-200 p-4 space-y-4">
            <h3 className="text-[18px] font-bold text-stone-900">{L(language, 'অর্ডারের বিবরণ', 'Order Details')}</h3>
            <ul className="divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <li key={`${item.product.id}-${idx}`} className="py-2.5 flex items-center gap-3">
                  <span className="w-12 h-12 shrink-0 rounded-lg border border-stone-200 bg-white flex items-center justify-center overflow-hidden">
                    <img src={optimizedImage(item.product.image, 160)} alt="" decoding="async" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                  </span>
                  <span className="flex-1 min-w-0 text-[15px] leading-snug text-stone-800 line-clamp-2">
                    {language === 'bn' ? item.product.titleBn : item.product.titleEn}
                  </span>
                  <span className="shrink-0 text-[15px] font-bold text-stone-700 tabular-nums">
                    {num(language, item.quantity)} × {formatPriceBDT(item.product.price, language)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl bg-stone-50 p-3.5 space-y-2 text-[16px]">
              <div className="flex justify-between text-stone-600">
                <span>{L(language, 'সাবটোটাল', 'Subtotal')}</span>
                <span className="tabular-nums">{formatPriceBDT(order.subtotal, language)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{L(language, 'ডেলিভারি চার্জ', 'Delivery Fee')}</span>
                <span className="tabular-nums">{order.deliveryFee > 0 ? formatPriceBDT(order.deliveryFee, language) : L(language, 'ফ্রি', 'Free')}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-stone-900">
                <span>{L(language, 'মোট (ক্যাশ অন ডেলিভারি)', 'Total (Cash on Delivery)')}</span>
                <span className="tabular-nums text-[#d96602]">{formatPriceBDT(order.total, language)}</span>
              </div>
            </div>

            <div className="text-[15px] leading-relaxed text-stone-600 space-y-1">
              <div><span className="font-bold text-stone-800">{L(language, 'নাম:', 'Name:')}</span> {order.customerName}</div>
              <div>
                <span className="font-bold text-stone-800">{L(language, 'ঠিকানা:', 'Address:')}</span> {order.customerAddress}
                {order.customerCityDistrict ? `, ${order.customerCityDistrict}` : ''}
              </div>
            </div>
          </section>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => lastQuery.current && runSearch(lastQuery.current.id, lastQuery.current.phone)}
              disabled={loading}
              className="w-full h-13 rounded-2xl border border-stone-300 bg-white active:bg-stone-100 disabled:opacity-60 text-stone-800 text-[16px] font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshIcon size={19} className={loading ? 'animate-spin' : ''} />
              <span>{L(language, 'স্ট্যাটাস রিফ্রেশ করুন', 'Refresh Status')}</span>
            </button>
            <a
              href={telHref(siteConfig.phone1)}
              className="w-full h-13 rounded-2xl border border-stone-300 bg-white active:bg-stone-100 text-stone-800 text-[16px] font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneIcon size={19} />
              <span>{L(language, 'কল করুন', 'Call Us')}: {siteConfig.phone1}</span>
            </a>
            <a
              href={whatsappHref(siteConfig.whatsappNumber, `Hello Shahana Baby Shop, I want an update on my order #${order.id}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-13 rounded-2xl bg-[#25D366] active:bg-[#1fb257] text-white text-[16px] font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <WhatsAppIcon size={21} />
              <span>{L(language, 'হোয়াটসঅ্যাপে জানুন', 'Ask on WhatsApp')}</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

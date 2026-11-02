import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { lookupOrder } from '../lib/trackOrder';
import { Order, OrderStatus } from '../types';
import { formatPriceBDT } from '../utils/pricing';
import { getRememberedOrders, RememberedOrder } from '../utils/myOrders';
import {
  buildTrackingTimeline,
  isValidPhoneInput,
  parseOrderDate,
  FlowStatus,
} from '../utils/orderTracking';
import {
  CheckIcon,
  PhoneIcon,
  RefreshIcon,
  SearchIcon,
  ShoppingBagIcon,
  TruckIcon,
  WhatsAppIcon,
  CloseIcon,
} from './Icons';
import { optimizedImage } from '../utils/imageUrl';

type Lang = 'bn' | 'en';
const L = (lang: Lang, bn: string, en: string) => (lang === 'bn' ? bn : en);

const STEP_TEXT: Record<FlowStatus, { en: [string, string]; bn: [string, string] }> = {
  pending: {
    en: ['Order Placed', 'We have received your order'],
    bn: ['অর্ডার গ্রহণ করা হয়েছে', 'আমরা আপনার অর্ডার পেয়েছি'],
  },
  confirmed: {
    en: ['Order Confirmed', 'Confirmed by a phone call'],
    bn: ['অর্ডার কনফার্ম হয়েছে', 'ফোনে কল করে নিশ্চিত করা হয়েছে'],
  },
  shipped: {
    en: ['Shipped', 'Packed and on its way to you'],
    bn: ['পাঠানো হয়েছে', 'প্যাক করে আপনার ঠিকানার দিকে পাঠানো হয়েছে'],
  },
  delivered: {
    en: ['Delivered', 'Parcel handed over to you'],
    bn: ['ডেলিভারি সম্পন্ন', 'পণ্য আপনার হাতে পৌঁছে দেওয়া হয়েছে'],
  },
};

const STATUS_MESSAGE: Record<OrderStatus, { en: string; bn: string }> = {
  pending: {
    en: 'We have received your order. Our team will call you soon to confirm it.',
    bn: 'আমরা আপনার অর্ডার পেয়েছি। কনফার্ম করতে আমাদের প্রতিনিধি শীঘ্রই আপনাকে কল করবেন।',
  },
  confirmed: {
    en: 'Your order is confirmed and is being prepared for dispatch.',
    bn: 'আপনার অর্ডার কনফার্ম হয়েছে এবং পাঠানোর জন্য প্রস্তুত করা হচ্ছে।',
  },
  shipped: {
    en: 'Your parcel is on its way. Please keep your phone nearby, the delivery person may call you.',
    bn: 'আপনার পার্সেল পথে আছে। ফোন কাছে রাখুন, ডেলিভারি ম্যান কল করতে পারেন।',
  },
  delivered: {
    en: 'Your order was delivered. Thank you for shopping with us!',
    bn: 'আপনার অর্ডার ডেলিভারি হয়েছে। আমাদের সাথে কেনাকাটার জন্য ধন্যবাদ!',
  },
  cancelled: {
    en: 'This order was cancelled. If this is unexpected, please contact us.',
    bn: 'এই অর্ডারটি বাতিল করা হয়েছে। এটি অপ্রত্যাশিত হলে অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন।',
  },
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
  'w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-200 transition';

export const TrackOrderPage: React.FC = () => {
  const {
    language,
    orders,
    siteConfig,
    navigateToStore,
    navigateToTerms,
    trackingPrefill,
    setTrackingPrefill,
  } = useStore();

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
      setMessage(
        L(language, 'অর্ডারের সময় দেওয়া মোবাইল নম্বরটি সঠিকভাবে লিখুন।', 'Please enter the mobile number you used when ordering.')
      );
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

  // Opened from the "order placed" popup: fill the form and search straight away.
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(orderIdInput, phoneInput);
  };

  const pickRemembered = (r: RememberedOrder) => {
    setOrderIdInput(r.id);
    setPhoneInput(r.phone);
    runSearch(r.id, r.phone);
  };

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
  const cleanWhatsapp = siteConfig.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
        <button
          type="button"
          onClick={navigateToStore}
          className="hover:text-amber-800 transition-colors font-medium cursor-pointer"
        >
          {L(language, 'হোম', 'Home')}
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-stone-900 font-bold">{L(language, 'অর্ডার ট্র্যাকিং', 'Track Order')}</span>
      </nav>

      <header className="mb-6 border-b border-stone-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 flex items-center gap-3">
          <TruckIcon size={28} className="text-amber-800" />
          <span>{L(language, 'আপনার অর্ডার ট্র্যাক করুন', 'Track Your Order')}</span>
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          {L(
            language,
            'অর্ডার আইডি ও মোবাইল নম্বর দিয়ে অর্ডারের বর্তমান অবস্থা দেখুন',
            'Enter your Order ID and phone number to see where your order is'
          )}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="track-order-id" className="block text-xs font-bold text-stone-700 mb-1.5">
              {L(language, 'অর্ডার আইডি', 'Order ID')}
            </label>
            <input
              id="track-order-id"
              type="text"
              inputMode="text"
              autoComplete="off"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="SBS-1234"
              className={`${inputClass} font-mono uppercase`}
            />
          </div>
          <div>
            <label htmlFor="track-phone" className="block text-xs font-bold text-stone-700 mb-1.5">
              {L(language, 'মোবাইল নম্বর', 'Phone Number')}
            </label>
            <input
              id="track-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="01XXXXXXXXX"
              className={inputClass}
            />
          </div>
        </div>

        <p className="text-[11px] text-stone-500">
          {L(
            language,
            'অর্ডার আইডি অর্ডার সফল হওয়ার পর স্ক্রিনে এবং হোয়াটসঅ্যাপ মেসেজে দেখানো হয়।',
            'Your Order ID is shown on the order confirmation screen and in your WhatsApp message.'
          )}
        </p>

        {message && (
          <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800">
            <CloseIcon size={16} className="mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#f27405] hover:bg-[#d96602] disabled:opacity-60 disabled:cursor-wait text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {loading ? (
            <RefreshIcon size={16} className="animate-spin" />
          ) : (
            <SearchIcon size={16} />
          )}
          <span>{loading ? L(language, 'খোঁজা হচ্ছে...', 'Searching...') : L(language, 'ট্র্যাক করুন', 'Track Order')}</span>
        </button>
      </form>

      {remembered.length > 0 && !order && (
        <div className="mt-4">
          <div className="text-[11px] font-black tracking-wider uppercase text-stone-400 mb-2">
            {L(language, 'এই ডিভাইসের সাম্প্রতিক অর্ডার', 'Recent orders on this device')}
          </div>
          <div className="flex flex-wrap gap-2">
            {remembered.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => pickRemembered(r)}
                className="px-3 py-1.5 rounded-full border border-stone-300 bg-white hover:bg-amber-50 hover:border-amber-400 text-xs font-mono font-bold text-stone-800 transition-colors cursor-pointer"
              >
                #{r.id}
              </button>
            ))}
          </div>
        </div>
      )}

      {order && timeline && (
        <div className="mt-8 space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-stone-400">
                  {L(language, 'অর্ডার আইডি', 'Order ID')}
                </div>
                <div className="font-mono font-black text-lg text-stone-900">#{order.id}</div>
                <div className="text-xs text-stone-500 mt-0.5">
                  {L(language, 'অর্ডারের সময়:', 'Placed on:')} {formatDate(order.createdAt)}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full border text-xs font-black ${STATUS_BADGE[order.status]}`}>
                {STATUS_LABEL[order.status][language]}
              </span>
            </div>

            <p
              className={`mt-4 p-3 rounded-xl text-sm leading-relaxed ${
                timeline.cancelled
                  ? 'bg-rose-50 border border-rose-200 text-rose-900'
                  : 'bg-amber-50 border border-amber-200 text-amber-950'
              }`}
            >
              {STATUS_MESSAGE[order.status][language]}
              {timeline.cancelled && timeline.cancelledAt && (
                <span className="block text-xs mt-1 opacity-80">
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
                  <li key={step.status} className="relative flex gap-4 pb-6 last:pb-0">
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${
                          done && timeline.steps[i + 1].state !== 'upcoming' ? 'bg-emerald-500' : 'bg-stone-200'
                        }`}
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className={`relative z-10 w-8 h-8 shrink-0 rounded-full flex items-center justify-center border-2 ${
                        done
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : current
                          ? 'bg-white border-amber-600 text-amber-700 ring-4 ring-amber-100'
                          : 'bg-white border-stone-300 text-stone-300'
                      }`}
                    >
                      {done ? (
                        <CheckIcon size={16} />
                      ) : step.status === 'shipped' || step.status === 'delivered' ? (
                        <TruckIcon size={15} />
                      ) : (
                        <ShoppingBagIcon size={15} />
                      )}
                    </span>
                    <div className="pt-0.5">
                      <div
                        className={`text-sm font-bold ${
                          step.state === 'upcoming' ? 'text-stone-400' : 'text-stone-900'
                        }`}
                      >
                        {text[0]}
                        {current && (
                          <span className="ml-2 text-[10px] font-black uppercase tracking-wide text-amber-700">
                            {L(language, 'এখন', 'Now')}
                          </span>
                        )}
                      </div>
                      <div className={`text-xs ${step.state === 'upcoming' ? 'text-stone-400' : 'text-stone-600'}`}>
                        {text[1]}
                      </div>
                      {step.at && <div className="text-[11px] text-stone-500 mt-0.5">{formatDate(step.at)}</div>}
                    </div>
                  </li>
                );
              })}
            </ol>

            {!timeline.cancelled && order.status !== 'delivered' && (
              <div className="mt-5 pt-4 border-t border-stone-100 text-xs text-stone-600 flex flex-wrap items-center justify-between gap-2">
                <span>
                  {L(language, 'আনুমানিক ডেলিভারি সময়:', 'Estimated delivery time:')}{' '}
                  <strong className="text-stone-900">
                    {order.deliveryArea === 'dhaka_inside'
                      ? L(language, '১–২ কার্যদিবস', '1–2 working days')
                      : L(language, '২–৫ কার্যদিবস', '2–5 working days')}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={navigateToTerms}
                  className="underline text-amber-800 hover:text-amber-900 font-semibold cursor-pointer"
                >
                  {L(language, 'ডেলিভারির শর্ত দেখুন', 'See delivery terms')}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4 text-sm">
            <h2 className="font-bold text-stone-900">{L(language, 'অর্ডারের বিবরণ', 'Order Details')}</h2>

            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={`${item.product.id}-${idx}`}
                  className="flex items-center justify-between gap-3 py-1.5 border-b border-stone-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={optimizedImage(item.product.image, 160)} decoding="async"
                      alt={item.product.titleEn}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-contain rounded border border-stone-200 bg-white shrink-0"
                    />
                    <span className="text-stone-800 line-clamp-2 text-xs sm:text-sm">
                      {language === 'bn' ? item.product.titleBn : item.product.titleEn}
                    </span>
                  </div>
                  <span className="font-medium text-stone-600 tabular-nums shrink-0 text-xs sm:text-sm">
                    {item.quantity} x {formatPriceBDT(item.product.price, language)}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-stone-50 rounded-xl p-3 space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>{L(language, 'সাবটোটাল', 'Subtotal')}</span>
                <span className="tabular-nums">{formatPriceBDT(order.subtotal, language)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{L(language, 'ডেলিভারি চার্জ', 'Delivery Fee')}</span>
                <span className="tabular-nums">
                  {order.deliveryFee > 0
                    ? formatPriceBDT(order.deliveryFee, language)
                    : L(language, 'ফ্রি', 'Free')}
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-stone-200 font-bold text-stone-900">
                <span>{L(language, 'মোট (ক্যাশ অন ডেলিভারি)', 'Total (Cash on Delivery)')}</span>
                <span className="tabular-nums text-amber-800">{formatPriceBDT(order.total, language)}</span>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-stone-600 space-y-1">
              <div>
                <span className="font-semibold text-stone-800">{L(language, 'নাম:', 'Name:')}</span> {order.customerName}
              </div>
              <div>
                <span className="font-semibold text-stone-800">{L(language, 'ঠিকানা:', 'Address:')}</span>{' '}
                {order.customerAddress}
                {order.customerCityDistrict ? `, ${order.customerCityDistrict}` : ''}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => lastQuery.current && runSearch(lastQuery.current.id, lastQuery.current.phone)}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 disabled:opacity-60 text-stone-800 text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshIcon size={16} className={loading ? 'animate-spin' : ''} />
              <span>{L(language, 'স্ট্যাটাস রিফ্রেশ করুন', 'Refresh Status')}</span>
            </button>
            <a
              href={`tel:${siteConfig.phone1.replace(/[^0-9]/g, '')}`}
              className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <PhoneIcon size={16} />
              <span>{L(language, 'কল করুন', 'Call Us')}: {siteConfig.phone1}</span>
            </a>
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                `Hello Shahana Baby Shop, I want an update on my order #${order.id}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <WhatsAppIcon size={16} />
              <span>{L(language, 'হোয়াটসঅ্যাপে জানুন', 'Ask on WhatsApp')}</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

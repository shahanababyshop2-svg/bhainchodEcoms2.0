import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatPriceBDT } from '../utils/pricing';
import { optimizedImage } from '../utils/imageUrl';
import { whatsappHref } from '../utils/mobileUi';
import { CheckIcon, TruckIcon, WhatsAppIcon } from '../components/Icons';
import { L, num, useLockBodyScroll } from './ui';

// "Order placed" screen: big order number, what was ordered, then WhatsApp / Track / Done.
export const MobileOrderSuccess: React.FC = () => {
  const { lastPlacedOrder, setLastPlacedOrder, language, siteConfig, navigateToTracking } = useStore();
  useLockBodyScroll();

  if (!lastPlacedOrder) return null;
  const order = lastPlacedOrder;

  const waUrl = whatsappHref(
    siteConfig.whatsappNumber,
    `Hello Shahana Baby Shop, I placed order #${order.id} for ${order.customerName}. Please confirm shipment.`
  );

  const row = 'flex justify-between gap-4 text-[15px]';

  return (
    <div className="fixed inset-0 z-[70] bg-stone-50 overflow-y-auto overscroll-contain sbs-screen-up" role="dialog" aria-modal="true" aria-label={L(language, 'অর্ডার সফল', 'Order placed')}>
      <div className="bg-emerald-700 text-white px-5 pt-10 pb-8 text-center">
        <span className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center">
          <CheckIcon size={34} className="text-white" />
        </span>
        <h1 className="mt-4 text-[24px] leading-snug font-bold">
          {L(language, 'অর্ডার সফল হয়েছে!', 'Order Placed Successfully!')}
        </h1>
        <p className="mt-1 text-[16px] leading-relaxed text-emerald-100">
          {L(language, 'আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।', 'Our support agent will call you shortly to confirm delivery.')}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-900/60 px-5 py-2 text-[16px] font-bold">
          <span>{L(language, 'অর্ডার আইডি:', 'Order ID:')}</span>
          <span className="font-mono text-[18px] text-amber-200 tracking-wide">#{order.id}</span>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
        <section className="rounded-3xl bg-white border border-stone-200 p-4 space-y-2.5">
          <div className={row}>
            <span className="text-stone-600">{L(language, 'নাম', 'Name')}</span>
            <span className="font-bold text-stone-900 text-right">{order.customerName}</span>
          </div>
          <div className={row}>
            <span className="text-stone-600">{L(language, 'মোবাইল', 'Phone')}</span>
            <span className="font-bold text-stone-900 tabular-nums">{order.customerPhone}</span>
          </div>
          <div className={row}>
            <span className="text-stone-600">{L(language, 'ঠিকানা', 'Address')}</span>
            <span className="font-bold text-stone-900 text-right">{order.customerAddress}</span>
          </div>
          <div className={row}>
            <span className="text-stone-600">{L(language, 'পেমেন্ট', 'Payment')}</span>
            <span className="font-bold text-[#d96602] text-right">{L(language, 'ক্যাশ অন ডেলিভারি', 'Cash on Delivery')}</span>
          </div>
          <div className={row}>
            <span className="text-stone-600">{L(language, 'ডেলিভারি চার্জ', 'Delivery Fee')}</span>
            <span className={`font-bold tabular-nums ${order.deliveryFee > 0 ? 'text-stone-900' : 'text-emerald-700'}`}>
              {order.deliveryFee > 0 ? formatPriceBDT(order.deliveryFee, language) : L(language, 'ফ্রি (৳০)', 'Free (৳0)')}
            </span>
          </div>
          <div className="pt-2.5 border-t border-stone-200 flex justify-between items-baseline">
            <span className="text-[17px] font-bold text-stone-900">{L(language, 'মোট মূল্য', 'Total Payable')}</span>
            <span className="text-[22px] font-bold text-[#d96602] tabular-nums">{formatPriceBDT(order.total, language)}</span>
          </div>
        </section>

        <section className="rounded-3xl bg-white border border-stone-200 p-4">
          <h2 className="text-[16px] font-bold text-stone-900 mb-2">{L(language, 'অর্ডারকৃত পণ্যসমূহ', 'Ordered Items')}</h2>
          <ul className="divide-y divide-stone-100">
            {order.items.map((item, i) => (
              <li key={i} className="py-2.5 flex items-center gap-3">
                <span className="w-12 h-12 shrink-0 rounded-lg border border-stone-200 bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src={optimizedImage(item.product.image, 160)}
                    alt=""
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
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
        </section>

        <div className="space-y-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-14 rounded-2xl bg-[#25D366] active:bg-[#1fb257] text-white text-[17px] font-bold flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <WhatsAppIcon size={22} />
            <span>{L(language, 'হোয়াটসঅ্যাপে অর্ডার তথ্য পাঠান', 'Send Order to WhatsApp')}</span>
          </a>
          <button
            type="button"
            onClick={() => {
              const { id, customerPhone } = order;
              setLastPlacedOrder(null);
              navigateToTracking({ orderId: id, phone: customerPhone });
            }}
            className="w-full h-14 rounded-2xl border-2 border-[#f27405] text-[#d96602] bg-white active:bg-orange-50 text-[17px] font-bold flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <TruckIcon size={22} />
            <span>{L(language, 'অর্ডার ট্র্যাক করুন', 'Track This Order')}</span>
          </button>
          <button
            type="button"
            onClick={() => setLastPlacedOrder(null)}
            className="w-full h-14 rounded-2xl bg-stone-900 active:bg-stone-800 text-white text-[17px] font-bold cursor-pointer"
          >
            {L(language, 'ঠিক আছে', 'Done')}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatPriceBDT } from '../utils/pricing';
import { whatsappHref } from '../utils/mobileUi';
import { CartIcon, ChatBubbleIcon } from '../components/Icons';
import { L, num } from './ui';

// true while the visitor is scrolling down, so the floating buttons can slide out of the way
// of the product photos and come back when they scroll up or stop.
function useScrollingDown(): boolean {
  const [down, setDown] = useState(false);
  const lastY = useRef(0);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY.current;
      if (Math.abs(dy) > 6) {
        setDown(dy > 0 && y > 120);
        lastY.current = y;
      }
      if (stopTimer.current) clearTimeout(stopTimer.current);
      stopTimer.current = setTimeout(() => setDown(false), 700);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (stopTimer.current) clearTimeout(stopTimer.current);
    };
  }, []);

  return down;
}

// The two floating buttons from the original design, made smaller for phones:
// the cart tab on the right edge and the round WhatsApp button above the bottom bar.
export const MobileFloatingButtons: React.FC = () => {
  const { language, cartTotals, setIsCartDrawerOpen, siteConfig } = useStore();
  const hide = useScrollingDown();

  return (
    <>
      <div
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-30 transition-transform duration-300 ${
          hide ? 'translate-x-full' : 'translate-x-0'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsCartDrawerOpen(true)}
          className="flex flex-col shadow-lg active:scale-95 transition-transform cursor-pointer"
          aria-label={L(
            language,
            `শপিং ব্যাগ খুলুন: ${cartTotals.itemCount}টি পণ্য, মোট ${formatPriceBDT(cartTotals.subtotal, language)}`,
            `Open shopping bag: ${cartTotals.itemCount} items, total ${formatPriceBDT(cartTotals.subtotal, language)}`
          )}
        >
          <span className="bg-[#f27405] text-white px-2.5 py-2 rounded-tl-2xl flex flex-col items-center min-w-[64px]">
            <CartIcon size={22} />
            <span className="mt-0.5 text-[13px] leading-tight font-bold whitespace-nowrap">
              {num(language, cartTotals.itemCount)} {L(language, 'আইটেম', 'Items')}
            </span>
          </span>
          <span className="bg-white text-[#d96602] px-2 py-1.5 rounded-bl-2xl border-l-2 border-b-2 border-[#f27405] text-[13px] leading-tight font-bold text-center tabular-nums">
            {formatPriceBDT(cartTotals.subtotal, language)}
          </span>
        </button>
      </div>

      <a
        href={whatsappHref(siteConfig.whatsappNumber, siteConfig.whatsappPrefillText)}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed right-4 z-30 w-14 h-14 rounded-full bg-[#f27405] text-white flex items-center justify-center shadow-xl border-2 border-white active:scale-95 transition-transform duration-300 cursor-pointer ${
          hide ? 'translate-x-24' : 'translate-x-0'
        }`}
        style={{ bottom: 'calc(64px + 16px + env(safe-area-inset-bottom))' }}
        aria-label={L(language, 'হোয়াটসঅ্যাপে চ্যাট করুন', 'Chat on WhatsApp')}
      >
        <ChatBubbleIcon size={28} className="text-white" />
      </a>
    </>
  );
};

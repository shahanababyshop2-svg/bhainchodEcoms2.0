import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MobileAnnouncement, MobileHeader } from './MobileHeader';
import { MobilePageBar } from './MobilePageBar';
import { MobileHome } from './MobileHome';
import { MobileFooter } from './MobileFooter';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileFloatingButtons } from './MobileFloatingButtons';
import { MobileMenu } from './MobileMenu';
import { L } from './ui';

// Screens that are only downloaded when first opened, like the original app does.
const MobileProductPage = lazy(() => import('./MobileProductPage').then((m) => ({ default: m.MobileProductPage })));
const MobileCartSheet = lazy(() => import('./MobileCartSheet').then((m) => ({ default: m.MobileCartSheet })));
const MobileCheckout = lazy(() => import('./MobileCheckout').then((m) => ({ default: m.MobileCheckout })));
const MobileOrderSuccess = lazy(() => import('./MobileOrderSuccess').then((m) => ({ default: m.MobileOrderSuccess })));
const MobileTrackOrder = lazy(() => import('./MobileTrackOrder').then((m) => ({ default: m.MobileTrackOrder })));
const TermsPage = lazy(() => import('../components/TermsPage').then((m) => ({ default: m.TermsPage })));

// The whole storefront for phones (screens under 768px). It shares the store with the original
// UI (products, cart, orders, language), so nothing is lost when a visitor switches between them.
// The admin page is not part of this: App.tsx shows it before choosing a UI.
export const MobileApp: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    isCheckoutModalOpen,
    lastPlacedOrder,
    language,
  } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);

  // The original UI has a separate cart page. On phones the cart is the bottom sheet instead.
  useEffect(() => {
    if (currentView === 'cart') {
      setCurrentView('store');
      setIsCartDrawerOpen(true);
    }
  }, [currentView, setCurrentView, setIsCartDrawerOpen]);

  const onProduct = currentView === 'product';
  const onStore = currentView === 'store';
  const showBottomNav = !onProduct;

  return (
    <div
      className="sbs-m min-h-dvh flex flex-col bg-stone-50 text-stone-900 text-[16px] selection:bg-orange-100"
      style={{ paddingBottom: showBottomNav ? 'calc(64px + env(safe-area-inset-bottom))' : undefined }}
    >
      {onStore && (
        <>
          <MobileAnnouncement />
          <MobileHeader onOpenMenu={() => setMenuOpen(true)} />
        </>
      )}
      {currentView === 'track' && <MobilePageBar title={L(language, 'অর্ডার ট্র্যাকিং', 'Track Order')} />}
      {currentView === 'terms' && <MobilePageBar title={L(language, 'শর্তাবলী', 'Terms & Conditions')} />}

      <main className="flex-1">
        <Suspense fallback={null}>
          {onProduct ? (
            <MobileProductPage />
          ) : currentView === 'track' ? (
            <MobileTrackOrder />
          ) : currentView === 'terms' ? (
            <div className="sbs-legacy-bump">
              <TermsPage />
            </div>
          ) : (
            <MobileHome />
          )}
        </Suspense>
      </main>

      {(onStore || currentView === 'terms') && <MobileFooter />}

      {showBottomNav && <MobileBottomNav menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} />}
      {onStore && !isCartDrawerOpen && !isCheckoutModalOpen && !menuOpen && <MobileFloatingButtons />}

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}

      <Suspense fallback={null}>
        {isCartDrawerOpen && <MobileCartSheet />}
        {isCheckoutModalOpen && <MobileCheckout />}
        {lastPlacedOrder && <MobileOrderSuccess />}
      </Suspense>
    </div>
  );
};

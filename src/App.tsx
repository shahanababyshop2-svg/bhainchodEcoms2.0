import React, { Suspense, lazy, useEffect, useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroSlider } from './components/HeroSlider';
import { FeaturedCategories } from './components/FeaturedCategories';
import { TrustFeatures } from './components/TrustFeatures';
import { ProductGrid } from './components/ProductGrid';
import { CustomerReviews } from './components/CustomerReviews';
import { Footer } from './components/Footer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { FloatingCartButton } from './components/FloatingCartButton';
import { CartToast } from './components/CartToast';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileMenuDrawer } from './components/MobileMenuDrawer';
import { MobileApp } from './mobile/MobileApp';
import { useUiMode } from './mobile/uiMode';

const CartDrawer = lazy(() => import('./components/CartDrawer').then((m) => ({ default: m.CartDrawer })));
const QuickCheckoutModal = lazy(() => import('./components/QuickCheckoutModal').then((m) => ({ default: m.QuickCheckoutModal })));
const ProductDetailsModal = lazy(() => import('./components/ProductDetailsModal').then((m) => ({ default: m.ProductDetailsModal })));
const OrderSuccessModal = lazy(() => import('./components/OrderSuccessModal').then((m) => ({ default: m.OrderSuccessModal })));
const AdminLoginPage = lazy(() => import('./components/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const CartPage = lazy(() => import('./components/cart/CartPage').then((m) => ({ default: m.CartPage })));
const ProductViewPage = lazy(() => import('./components/product/ProductViewPage').then((m) => ({ default: m.ProductViewPage })));
const TermsPage = lazy(() => import('./components/TermsPage').then((m) => ({ default: m.TermsPage })));
const TrackOrderPage = lazy(() => import('./components/TrackOrderPage').then((m) => ({ default: m.TrackOrderPage })));

const MainLayout: React.FC = () => {
  const {
    currentView,
    isCartDrawerOpen,
    isCheckoutModalOpen,
    selectedProductDetails,
    lastPlacedOrder,
    isAdminLoggedIn,
    isAuthChecked,
  } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Phones get the new phone UI (src/mobile/) unless the visitor chose "Classic view".
  // Tablets and desktops always get the original UI below.
  const { showMobileUi } = useUiMode();

  // The admin page should have its own title and stay out of Google
  useEffect(() => {
    if (currentView !== 'admin') return;
    const oldTitle = document.title;
    document.title = 'Admin | Shahana Baby Shop';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => {
      document.title = oldTitle;
      robots.remove();
    };
  }, [currentView]);

  // /dihanadmin: its own page, no storefront header/footer around it
  if (currentView === 'admin') {
    // wait until Supabase says if a saved login exists, so a refresh does not flash the login form
    if (!isAuthChecked) return <div className="min-h-screen bg-stone-100" />;
    return (
      <Suspense fallback={<div className="min-h-screen bg-stone-100" />}>
        {isAdminLoggedIn ? <AdminDashboard /> : <AdminLoginPage />}
      </Suspense>
    );
  }

  if (showMobileUi) {
    return <MobileApp />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-orange-100 selection:text-orange-900 pb-14 md:pb-0">
      <Header onOpenMenu={() => setIsMobileMenuOpen(true)} />
      <main className="flex-1">
        {currentView === 'product' ? (
          <Suspense fallback={null}><ProductViewPage /></Suspense>
        ) : currentView === 'cart' ? (
          <Suspense fallback={null}><CartPage /></Suspense>
        ) : currentView === 'terms' ? (
          <Suspense fallback={null}><TermsPage /></Suspense>
        ) : currentView === 'track' ? (
          <Suspense fallback={null}><TrackOrderPage /></Suspense>
        ) : (
          <>
            <HeroSlider />
            <FeaturedCategories />
            <TrustFeatures />
            <ProductGrid />
            <CustomerReviews />
          </>
        )}
      </main>
      <Footer />

      <MobileBottomNav onOpenMenu={() => setIsMobileMenuOpen(true)} />
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Popups are only downloaded the first time they are opened */}
      <Suspense fallback={null}>
        {isCartDrawerOpen && <CartDrawer />}
        {isCheckoutModalOpen && <QuickCheckoutModal />}
        {selectedProductDetails && <ProductDetailsModal />}
        {lastPlacedOrder && <OrderSuccessModal />}
      </Suspense>
      <WhatsAppFloatingButton />
      <FloatingCartButton />
      <CartToast />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}

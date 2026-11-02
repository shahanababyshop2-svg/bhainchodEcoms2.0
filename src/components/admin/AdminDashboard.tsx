import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBagIcon,
  SettingsIcon,
  TruckIcon,
  EyeIcon,
  BabyCradleLogo,
  DatabaseIcon,
} from '../Icons';
import { OrdersTab } from './OrdersTab';
import { ProductsTab } from './ProductsTab';
import { UiCustomizerTab } from './UiCustomizerTab';
import { AnalyticsTab } from './AnalyticsTab';
import { DatabaseTab } from './DatabaseTab';

type AdminTab = 'orders' | 'products' | 'ui_customizer' | 'analytics' | 'supabase';

export const AdminDashboard: React.FC = () => {
  const { products, orders, setCurrentView, logoutAdmin, isSupabaseConfigured } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-stone-100 pb-16">
      <nav className="bg-stone-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-700 flex items-center justify-center">
              <BabyCradleLogo size={22} className="text-white" />
            </div>
            <div>
              <div className="text-base font-extrabold leading-none">
                Shahana Baby Shop Admin
              </div>
              <div className="text-[11px] text-amber-400 font-medium mt-0.5">
                Product & Order Management Portal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentView('store')}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <EyeIcon size={14} />
              <span>View Live Store</span>
            </button>

            <button
              type="button"
              onClick={logoutAdmin}
              className="px-3 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-white text-xs font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 border-t border-stone-800 pt-2 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-amber-700 text-white'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <ShoppingBagIcon size={15} />
            <span>Orders ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-900 text-[10px] font-black flex items-center justify-center">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-amber-700 text-white'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <BabyCradleLogo size={15} />
            <span>Products Management ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ui_customizer')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'ui_customizer'
                ? 'bg-amber-700 text-white'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <SettingsIcon size={15} />
            <span>UI & Store Customizer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-amber-700 text-white'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <TruckIcon size={15} />
            <span>Store Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supabase')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'supabase'
                ? 'bg-amber-700 text-white'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            <DatabaseIcon size={15} />
            <span>Supabase SQL & Sync</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs stay mounted so unsaved form edits survive switching between them */}
        <div hidden={activeTab !== 'orders'}>
          <OrdersTab />
        </div>
        <div hidden={activeTab !== 'products'}>
          <ProductsTab />
        </div>
        <div hidden={activeTab !== 'ui_customizer'}>
          <UiCustomizerTab />
        </div>
        <div hidden={activeTab !== 'analytics'}>
          <AnalyticsTab />
        </div>
        <div hidden={activeTab !== 'supabase'}>
          <DatabaseTab />
        </div>
      </div>
    </div>
  );
};

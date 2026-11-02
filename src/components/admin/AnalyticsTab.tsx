import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';

export const AnalyticsTab: React.FC = () => {
  const {
    orders,
  } = useStore();

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Total Revenue
            </div>
            <div className="text-2xl font-black text-amber-800 mt-1 tabular-nums">
              ৳{totalRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">From all confirmed orders</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Total Orders
            </div>
            <div className="text-2xl font-black text-stone-900 mt-1 tabular-nums">
              {orders.length}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1">100% Cash on Delivery</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Pending Orders
            </div>
            <div className="text-2xl font-black text-amber-600 mt-1 tabular-nums">
              {pendingOrdersCount}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">Requires confirmation call</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Avg. Order Value
            </div>
            <div className="text-2xl font-black text-stone-900 mt-1 tabular-nums">
              ৳{avgOrderValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">Across all models</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
          <h4 className="text-sm font-bold text-stone-900">Recent Customer Activity</h4>
          <div className="space-y-2 text-xs">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="p-3 rounded-xl bg-stone-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900">{o.customerName}</span> ordered{' '}
                  <span className="font-semibold text-amber-800">
                    {o.items.map((i) => `${i.quantity}x ${i.product.modelNo}`).join(', ')}
                  </span>
                  <div className="text-[11px] text-stone-500">{o.customerCityDistrict} · {o.createdAt}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-stone-900 tabular-nums">৳{o.total}</div>
                  <span className="text-[10px] font-bold uppercase text-amber-800">{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

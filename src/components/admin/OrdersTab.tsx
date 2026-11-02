import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { formatPriceBDT } from '../../utils/pricing';
import { FraudCheck } from './FraudCheck';
import { CustomerProfileModal } from './CustomerProfileModal';
import {
  TrashIcon,
  CloseIcon,
  PhoneIcon,
  PrintIcon,
  SearchIcon,
  EyeIcon,
  UserIcon,
} from '../Icons';

export const OrdersTab: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    deleteOrder,
  } = useStore();

  const [orderActionFeedback, setOrderActionFeedback] = useState<string | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);
  // phone of the customer whose full profile is open (all their orders are matched by phone)
  const [customerProfilePhone, setCustomerProfilePhone] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    if (!matchesStatus) return false;
    if (!orderSearchQuery.trim()) return true;
    const q = orderSearchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.includes(q) ||
      order.customerCityDistrict.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Address', 'Area', 'Total BDT', 'Status'];
    const rows = orders.map((o) => [
      o.id,
      o.createdAt,
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.customerPhone,
      `"${o.customerAddress.replace(/"/g, '""')}"`,
      o.deliveryArea,
      o.total,
      o.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shahana_baby_shop_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="space-y-6">
        {orderActionFeedback && (
          <div className="p-3 bg-stone-900 text-white text-xs font-semibold rounded-xl flex items-center justify-between shadow-xs">
            <span>{orderActionFeedback}</span>
            <button
              type="button"
              onClick={() => setOrderActionFeedback(null)}
              className="text-stone-300 hover:text-white text-xs px-2 py-0.5 rounded"
              aria-label="Dismiss message"
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <input
                type="search"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Search by ID, name, phone..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900 outline-hidden focus:border-amber-700"
              />
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400">
                <SearchIcon size={14} />
              </div>
            </div>

            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-medium bg-white text-stone-800 outline-hidden focus:border-amber-700"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <PrintIcon size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total (BDT)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 font-mono">#{order.id}</div>
                        <div className="text-[11px] text-stone-400 mt-0.5">{order.createdAt}</div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-stone-900">{order.customerName}</span>
                          <button
                            type="button"
                            onClick={() => setCustomerProfilePhone(order.customerPhone)}
                            title="See all data and orders of this customer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-[11px] font-bold transition-colors"
                          >
                            <UserIcon size={11} />
                            <span>Customer data</span>
                          </button>
                        </div>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="text-amber-800 font-semibold hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <PhoneIcon size={11} />
                          <span>{order.customerPhone}</span>
                        </a>
                        <FraudCheck phone={order.customerPhone} />
                        <div className="text-stone-500 text-[11px] truncate mt-0.5" title={order.customerAddress}>
                          {order.customerAddress}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-stone-700">
                              <span className="font-bold text-amber-800">{it.quantity}x</span>
                              <span className="truncate max-w-[180px]" title={it.product.titleEn}>
                                {it.product.titleEn}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 tabular-nums">
                          {formatPriceBDT(order.total, 'en')}
                        </div>
                        <div className="text-[10px] font-medium text-stone-500">
                          {order.deliveryFee > 0 ? `COD (+Del ৳${order.deliveryFee})` : 'COD (Free Del)'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold outline-hidden border ${
                            order.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : order.status === 'confirmed'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : order.status === 'shipped'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : order.status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForView(order)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-md"
                            title="View details"
                            aria-label="View order details"
                          >
                            <EyeIcon size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteOrder(order.id);
                              setOrderActionFeedback(`Order ${order.id} deleted successfully.`);
                              setTimeout(() => setOrderActionFeedback(null), 3500);
                            }}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                            title="Delete order"
                            aria-label="Delete order"
                          >
                            <TrashIcon size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-stone-500">
                      No orders matching current filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedOrderForView && (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/60 backdrop-blur-2xs">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
              <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-mono">Order #{selectedOrderForView.id}</h3>
                  <p className="text-xs text-stone-400 mt-0.5">{selectedOrderForView.createdAt}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForView(null)}
                  className="p-1 text-stone-400 hover:text-white"
                  aria-label="Close modal"
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                  <div>
                    <span className="text-stone-500">Customer:</span>{' '}
                    <span className="font-bold text-stone-900">{selectedOrderForView.customerName}</span>{' '}
                    <button
                      type="button"
                      onClick={() => setCustomerProfilePhone(selectedOrderForView.customerPhone)}
                      className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 text-[11px] font-bold"
                    >
                      <UserIcon size={11} />
                      <span>All customer data</span>
                    </button>
                  </div>
                  <div>
                    <span className="text-stone-500">Phone:</span>{' '}
                    <a
                      href={`tel:${selectedOrderForView.customerPhone}`}
                      className="font-bold text-amber-800 underline"
                    >
                      {selectedOrderForView.customerPhone}
                    </a>
                  </div>
                  <div>
                    <span className="text-stone-500">Delivery Address:</span>{' '}
                    <span className="font-medium text-stone-800">{selectedOrderForView.customerAddress}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Zone:</span>{' '}
                    <span className="font-medium text-stone-800">
                      {selectedOrderForView.deliveryArea === 'dhaka_inside' ? 'Inside Dhaka' : 'Outside Dhaka'}
                    </span>
                  </div>
                  {selectedOrderForView.notes && (
                    <div>
                      <span className="text-stone-500">Customer Note:</span>{' '}
                      <span className="italic text-stone-700">{selectedOrderForView.notes}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-stone-800 mb-2">Customer Fraud Check:</h4>
                  <FraudCheck phone={selectedOrderForView.customerPhone} variant="full" />
                </div>

                <div>
                  <h4 className="font-bold text-stone-800 mb-2">Order Items:</h4>
                  <div className="space-y-2">
                    {selectedOrderForView.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-stone-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <img
                            src={it.product.image}
                            alt={it.product.titleEn}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-contain rounded bg-white p-1 border"
                          />
                          <div>
                            <div className="font-bold text-stone-900">{it.product.titleEn}</div>
                            <div className="text-[10px] text-stone-500">{it.product.modelNo}</div>
                          </div>
                        </div>
                        <span className="font-bold text-amber-800 tabular-nums">
                          {it.quantity} x ৳{it.product.price} = ৳{it.quantity * it.product.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t flex justify-between font-bold text-sm">
                  <span>Total Amount (COD):</span>
                  <span className="text-amber-800 tabular-nums">৳{selectedOrderForView.total}</span>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForView(null)}
                    className="px-4 py-2 bg-stone-900 text-white rounded-xl font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {customerProfilePhone && (
        <CustomerProfileModal
          phone={customerProfilePhone}
          orders={orders}
          onClose={() => setCustomerProfilePhone(null)}
        />
      )}
    </>
  );
};

import React, { useMemo } from 'react';
import { Order, OrderStatus } from '../../types';
import { buildCustomerProfile } from '../../utils/customerProfile';
import { formatPriceBDT } from '../../utils/pricing';
import { FraudCheck } from './FraudCheck';
import { CloseIcon, PhoneIcon, UserIcon, MapPinIcon } from '../Icons';

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-300',
  confirmed: 'bg-blue-50 text-blue-800 border-blue-300',
  shipped: 'bg-purple-50 text-purple-800 border-purple-300',
  delivered: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  cancelled: 'bg-rose-50 text-rose-800 border-rose-300',
};

interface Props {
  phone: string;
  orders: Order[];
  onClose: () => void;
}

export const CustomerProfileModal: React.FC<Props> = ({ phone, orders, onClose }) => {
  const profile = useMemo(() => buildCustomerProfile(orders, phone), [orders, phone]);

  const stats: [string, string, string?][] = [
    ['Orders', String(profile.totalOrders)],
    ['Delivered', String(profile.delivered)],
    ['Cancelled', `${profile.cancelled}${profile.totalOrders ? ` (${profile.cancelRate}%)` : ''}`],
    ['Total spent', formatPriceBDT(profile.totalSpent, 'en'), 'delivered orders only'],
  ];

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-black/60 backdrop-blur-2xs">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
          <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <UserIcon size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold">{profile.names[0] || 'Unknown customer'}</h3>
                <a href={`tel:${profile.phone}`} className="text-xs text-stone-300 hover:text-white inline-flex items-center gap-1">
                  <PhoneIcon size={11} />
                  {profile.phone}
                </a>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-1 text-stone-400 hover:text-white" aria-label="Close customer data">
              <CloseIcon size={18} />
            </button>
          </div>

          <div className="p-6 space-y-5 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              {stats.map(([label, value, hint]) => (
                <div key={label} className="bg-stone-50 border border-stone-200 rounded-xl py-3 px-2" title={hint}>
                  <div className="font-black text-stone-900 text-sm tabular-nums">{value}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-stone-500 flex flex-wrap gap-x-5 gap-y-1">
              <span>First order: <b className="text-stone-800">{profile.firstOrderAt ?? '-'}</b></span>
              <span>Latest order: <b className="text-stone-800">{profile.lastOrderAt ?? '-'}</b></span>
              {profile.inProgress > 0 && <span>In progress: <b className="text-stone-800">{profile.inProgress}</b></span>}
            </div>

            {profile.names.length > 1 && (
              <div>
                <h4 className="font-bold text-stone-800 mb-1.5">Names used</h4>
                <div className="flex flex-wrap gap-1.5">
                  {profile.names.map((n) => (
                    <span key={n} className="px-2 py-0.5 bg-stone-100 border border-stone-200 rounded-md text-stone-700 font-medium">{n}</span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-bold text-stone-800 mb-1.5">
                Delivery addresses{profile.addresses.length > 1 ? ` (${profile.addresses.length})` : ''}
              </h4>
              <div className="space-y-1.5">
                {profile.addresses.length > 0 ? (
                  profile.addresses.map((a) => (
                    <div key={a} className="flex items-start gap-1.5 text-stone-700">
                      <span className="mt-0.5 text-stone-400 shrink-0"><MapPinIcon size={12} /></span>
                      <span>{a}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-stone-500">No orders found for this phone number.</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-stone-800 mb-1.5">Delivery history (other couriers)</h4>
              <FraudCheck phone={profile.phone} variant="full" />
            </div>

            <div>
              <h4 className="font-bold text-stone-800 mb-1.5">All orders ({profile.totalOrders})</h4>
              <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 max-h-72 overflow-y-auto">
                {profile.orders.map((o) => (
                  <div key={o.id} className="p-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold font-mono text-stone-900">#{o.id}</span>
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold capitalize ${STATUS_BADGE[o.status]}`}>
                          {o.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">{o.createdAt}</div>
                      <div className="text-stone-600 mt-1">
                        {o.items.map((it) => `${it.quantity}x ${it.product.titleEn}`).join(', ') || 'No items'}
                      </div>
                      {o.notes && <div className="italic text-stone-500 mt-0.5">Note: {o.notes}</div>}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-stone-900 tabular-nums">{formatPriceBDT(o.total, 'en')}</div>
                      <div className="text-[10px] text-stone-500">{o.deliveryFee > 0 ? `+Del ৳${o.deliveryFee}` : 'Free Del'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-stone-900 text-white rounded-xl font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

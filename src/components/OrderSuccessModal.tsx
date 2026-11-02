import React from 'react';
import { useStore } from '../context/StoreContext';
import { formatPriceBDT } from '../utils/pricing';
import { CheckIcon, CloseIcon, PrintIcon, WhatsAppIcon, ShoppingBagIcon, TruckIcon } from './Icons';
import { optimizedImage } from '../utils/imageUrl';

export const OrderSuccessModal: React.FC = () => {
  const { lastPlacedOrder, setLastPlacedOrder, language, siteConfig, navigateToTracking } = useStore();

  if (!lastPlacedOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const cleanWhatsapp = siteConfig.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    `Hello Shahana Baby Shop, I placed order #${lastPlacedOrder.id} for ${lastPlacedOrder.customerName}. Please confirm shipment.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        <div className="bg-emerald-700 text-white p-6 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckIcon size={28} className="text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold">
            {language === 'bn' ? 'অর্ডার সফল হয়েছে!' : 'Order Placed Successfully!'}
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            {language === 'bn'
              ? 'আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।'
              : 'Our support agent will call you shortly to confirm delivery.'}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-800/80 px-4 py-1 rounded-full text-xs font-bold tracking-wider">
            <span>{language === 'bn' ? 'অর্ডার আইডি:' : 'Order ID:'}</span>
            <span className="font-mono font-black text-amber-200">#{lastPlacedOrder.id}</span>
          </div>
        </div>

        <div className="p-6 space-y-4 text-xs sm:text-sm">
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2">
            <div className="flex justify-between text-stone-600">
              <span>{language === 'bn' ? 'গ্রাহকের নাম:' : 'Customer Name:'}</span>
              <span className="font-semibold text-stone-900">{lastPlacedOrder.customerName}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>{language === 'bn' ? 'মোবাইল নম্বর:' : 'Phone:'}</span>
              <span className="font-semibold text-stone-900">{lastPlacedOrder.customerPhone}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>{language === 'bn' ? 'ঠিকানা:' : 'Address:'}</span>
              <span className="font-semibold text-stone-900 text-right max-w-xs">
                {lastPlacedOrder.customerAddress}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>{language === 'bn' ? 'পেমেন্ট পদ্ধতি:' : 'Payment:'}</span>
              <span className="font-bold text-amber-800">
                {language === 'bn' ? 'ক্যাশ অন ডেলিভারি (পণ্য পেয়ে মূল্য পরিশোধ)' : 'Cash on Delivery'}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>{language === 'bn' ? 'ডেলিভারি চার্জ:' : 'Delivery Fee:'}</span>
              <span className={`font-bold ${lastPlacedOrder.deliveryFee > 0 ? 'text-stone-900' : 'text-emerald-700'}`}>
                {lastPlacedOrder.deliveryFee > 0
                  ? formatPriceBDT(lastPlacedOrder.deliveryFee, language)
                  : (language === 'bn' ? 'ফ্রি (৳০)' : 'Free (৳0)')}
              </span>
            </div>
            <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-base text-stone-900">
              <span>{language === 'bn' ? 'মোট মূল্য:' : 'Total Payable:'}</span>
              <span className="text-amber-800 tabular-nums">
                {formatPriceBDT(lastPlacedOrder.total, language)}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-stone-800 mb-2">
              {language === 'bn' ? 'অর্ডারকৃত পণ্যসমূহ:' : 'Ordered Items:'}
            </h4>
            <div className="space-y-2">
              {lastPlacedOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1.5 border-b border-stone-100 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={optimizedImage(item.product.image, 160)} decoding="async"
                      alt={item.product.titleEn}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 object-contain rounded border border-stone-200"
                    />
                    <span className="text-stone-800 line-clamp-1">
                      {language === 'bn' ? item.product.titleBn : item.product.titleEn}
                    </span>
                  </div>
                  <span className="font-medium text-stone-600 tabular-nums shrink-0 ml-2">
                    {item.quantity} x {formatPriceBDT(item.product.price, language)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <WhatsAppIcon size={18} />
              <span>
                {language === 'bn' ? 'হোয়াটসঅ্যাপে অর্ডার তথ্য পাঠান' : 'Send Order to WhatsApp'}
              </span>
            </a>

            <button
              type="button"
              onClick={() => {
                const { id, customerPhone } = lastPlacedOrder;
                setLastPlacedOrder(null);
                navigateToTracking({ orderId: id, phone: customerPhone });
              }}
              className="w-full py-3 rounded-xl border-2 border-amber-700 text-amber-800 hover:bg-amber-50 font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <TruckIcon size={18} />
              <span>{language === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track This Order'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-800 font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <PrintIcon size={16} />
                <span>{language === 'bn' ? 'রসিদ প্রিন্ট' : 'Print Receipt'}</span>
              </button>

              <button
                type="button"
                onClick={() => setLastPlacedOrder(null)}
                className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold transition-colors"
              >
                {language === 'bn' ? 'ঠিক আছে' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden printable invoice representation */}
      <div id="printable-invoice" className="hidden">
        <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
            Shahana Baby Shop - Order Invoice
          </h1>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#666' }}>
            Hotline: {siteConfig.phone1} | Dhaka, Bangladesh
          </p>
          <hr />
          <p>
            <strong>Order ID:</strong> #{lastPlacedOrder.id}
          </p>
          <p>
            <strong>Date:</strong> {lastPlacedOrder.createdAt}
          </p>
          <p>
            <strong>Customer:</strong> {lastPlacedOrder.customerName} ({lastPlacedOrder.customerPhone})
          </p>
          <p>
            <strong>Delivery Address:</strong> {lastPlacedOrder.customerAddress}
          </p>
          <p>
            <strong>Payment Method:</strong> Cash on Delivery (COD)
          </p>
          <hr />
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '16px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333' }}>
                <th style={{ padding: '8px 0' }}>Item</th>
                <th style={{ padding: '8px 0' }}>Qty</th>
                <th style={{ padding: '8px 0', textAlign: 'right' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {lastPlacedOrder.items.map((it, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px 0' }}>{it.product.titleEn}</td>
                  <td style={{ padding: '8px 0' }}>{it.quantity}</td>
                  <td style={{ padding: '8px 0', textAlign: 'right' }}>৳{it.product.price * it.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <p><strong>Subtotal:</strong> ৳{lastPlacedOrder.subtotal}</p>
            <p><strong>Delivery Fee:</strong> ৳0 (Free Delivery)</p>
            <h3 style={{ fontSize: '18px', color: '#854d0e' }}>
              <strong>Total Payable: ৳{lastPlacedOrder.total}</strong>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, SiteConfig } from '../../types';
import { fileToBannerDataUrl } from '../../utils/bannerImage';
import {
  CheckIcon,
  TruckIcon,
} from '../Icons';

export const UiCustomizerTab: React.FC = () => {
  const {
    siteConfig,
    updateSiteConfig,
    resetSiteConfig,
  } = useStore();

  const [uiForm, setUiForm] = useState<SiteConfig>(siteConfig);
  const [uiSaveSuccess, setUiSaveSuccess] = useState(false);

  useEffect(() => {
    setUiForm(siteConfig);
  }, [siteConfig]);

  const handleSaveUiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteConfig(uiForm);
    setUiSaveSuccess(true);
    setTimeout(() => setUiSaveSuccess(false), 3000);
  };

  return (
    <>
      <form onSubmit={handleSaveUiConfig} className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Storefront Visual & Content Editor</h3>
            <p className="text-xs text-stone-500">
              Update announcement notices, helpline numbers, hero banners, and brand info.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetSiteConfig}
              className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 rounded-xl"
            >
              Reset Defaults
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckIcon size={14} />
              <span>Save & Apply Changes</span>
            </button>
          </div>
        </div>

        {uiSaveSuccess && (
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckIcon size={16} />
            <span>Changes saved successfully and live on the website!</span>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b pb-2">
            Top Announcement Bar
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Bengali Announcement Text
              </label>
              <input
                type="text"
                value={uiForm.announcementBn}
                onChange={(e) => setUiForm({ ...uiForm, announcementBn: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                English Announcement Text
              </label>
              <input
                type="text"
                value={uiForm.announcementEn}
                onChange={(e) => setUiForm({ ...uiForm, announcementEn: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <TruckIcon size={16} className="text-amber-800" />
                <span>Delivery & Shipping Pricing Settings</span>
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Set customer delivery fees for Inside Dhaka and Outside Dhaka or toggle Nationwide Free Delivery.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-xl transition-colors">
              <input
                type="checkbox"
                checked={uiForm.isDeliveryFreeNationwide}
                onChange={(e) =>
                  setUiForm({ ...uiForm, isDeliveryFreeNationwide: e.target.checked })
                }
                className="w-4 h-4 text-amber-700 rounded cursor-pointer"
              />
              <span className="text-xs font-bold text-stone-800">
                Free Delivery Nationwide (সারা দেশে ফ্রি হোম ডেলিভারি)
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Inside Dhaka Delivery Fee (৳)
              </label>
              <input
                type="number"
                min="0"
                disabled={uiForm.isDeliveryFreeNationwide}
                value={uiForm.deliveryFeeInsideDhaka}
                onChange={(e) =>
                  setUiForm({ ...uiForm, deliveryFeeInsideDhaka: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-stone-900 disabled:bg-stone-100 disabled:text-stone-400"
              />
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {[50, 60, 70, 80, 100].map((fee) => (
                  <button
                    key={fee}
                    type="button"
                    disabled={uiForm.isDeliveryFreeNationwide}
                    onClick={() => setUiForm({ ...uiForm, deliveryFeeInsideDhaka: fee })}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer ${
                      uiForm.deliveryFeeInsideDhaka === fee
                        ? 'bg-amber-800 text-white border-amber-800'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-200'
                    }`}
                  >
                    ৳{fee}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-stone-400 mt-1">Default: 60 Tk</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Outside Dhaka Delivery Fee (৳)
              </label>
              <input
                type="number"
                min="0"
                disabled={uiForm.isDeliveryFreeNationwide}
                value={uiForm.deliveryFeeOutsideDhaka}
                onChange={(e) =>
                  setUiForm({ ...uiForm, deliveryFeeOutsideDhaka: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-stone-900 disabled:bg-stone-100 disabled:text-stone-400"
              />
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {[100, 120, 130, 150].map((fee) => (
                  <button
                    key={fee}
                    type="button"
                    disabled={uiForm.isDeliveryFreeNationwide}
                    onClick={() => setUiForm({ ...uiForm, deliveryFeeOutsideDhaka: fee })}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded border cursor-pointer ${
                      uiForm.deliveryFeeOutsideDhaka === fee
                        ? 'bg-amber-800 text-white border-amber-800'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-200'
                    }`}
                  >
                    ৳{fee}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-stone-400 mt-1">Default: 120 Tk</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Free Delivery Minimum Order (৳, optional)
              </label>
              <input
                type="number"
                min="0"
                value={uiForm.freeDeliveryMinOrder}
                onChange={(e) =>
                  setUiForm({ ...uiForm, freeDeliveryMinOrder: Math.max(0, Number(e.target.value)) })
                }
                placeholder="0 (disabled)"
                className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-stone-900"
              />
              <p className="text-[10px] text-stone-400 mt-1">0 = no minimum threshold</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <CheckIcon size={14} />
              <span>Customer Storefront Preview:</span>
            </div>
            <div>
              {uiForm.isDeliveryFreeNationwide
                ? 'Customers see: ঢাকার ভিতরে ও বাইরে সারা বাংলাদেশে ফ্রি হোম ডেলিভারি (৳০).'
                : `Customers see: ঢাকার ভিতরে (৳${uiForm.deliveryFeeInsideDhaka}) এবং ঢাকার বাইরে (৳${uiForm.deliveryFeeOutsideDhaka}).${uiForm.freeDeliveryMinOrder > 0 ? ` (Orders above ৳${uiForm.freeDeliveryMinOrder} get free delivery).` : ''}`}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b pb-2">
            Helplines & WhatsApp
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Primary Phone Hotline
              </label>
              <input
                type="text"
                value={uiForm.phone1}
                onChange={(e) => setUiForm({ ...uiForm, phone1: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Secondary Wholesale Phone
              </label>
              <input
                type="text"
                value={uiForm.phone2}
                onChange={(e) => setUiForm({ ...uiForm, phone2: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                WhatsApp Number (with country code)
              </label>
              <input
                type="text"
                value={uiForm.whatsappNumber}
                onChange={(e) => setUiForm({ ...uiForm, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b pb-2">
            Hero Banner Slide Customizer
          </h4>
          {uiForm.heroSlides.map((slide, idx) => (
            <div key={slide.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-amber-900">Slide #{idx + 1}: {slide.titleEn}</div>
                <div className="w-12 h-12 rounded-lg bg-white border border-stone-200 p-1 flex items-center justify-center shrink-0">
                  <img src={slide.image} alt={slide.titleEn} className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                    Title (Bengali)
                  </label>
                  <input
                    type="text"
                    value={slide.titleBn}
                    onChange={(e) => {
                      const updated = [...uiForm.heroSlides];
                      updated[idx].titleBn = e.target.value;
                      setUiForm({ ...uiForm, heroSlides: updated });
                    }}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    value={slide.titleEn}
                    onChange={(e) => {
                      const updated = [...uiForm.heroSlides];
                      updated[idx].titleEn = e.target.value;
                      setUiForm({ ...uiForm, heroSlides: updated });
                    }}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                    Price Tag (Bengali)
                  </label>
                  <input
                    type="text"
                    value={slide.priceTagBn}
                    onChange={(e) => {
                      const updated = [...uiForm.heroSlides];
                      updated[idx].priceTagBn = e.target.value;
                      setUiForm({ ...uiForm, heroSlides: updated });
                    }}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                    Image Path / Upload
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={slide.image}
                      onChange={(e) => {
                        const updated = [...uiForm.heroSlides];
                        updated[idx].image = e.target.value;
                        setUiForm({ ...uiForm, heroSlides: updated });
                      }}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono"
                    />
                    <label className="px-2.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg text-xs font-bold text-stone-700 cursor-pointer shrink-0">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) {
                                const updated = [...uiForm.heroSlides];
                                updated[idx].image = evt.target.result as string;
                                setUiForm({ ...uiForm, heroSlides: updated });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-800">
                    Phone banner image (optional, wide picture)
                  </label>
                  <p className="text-[11px] text-stone-500">
                    Shown on phones as this slide&apos;s banner. Best size about 1200 x 500 px. If empty, phones show a
                    compact card made from the image and text above.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {slide.mobileImage && (
                    <div className="w-24 h-10 rounded-md bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                      <img src={slide.mobileImage} alt="Phone banner preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={slide.mobileImage || ''}
                    placeholder="Image path or link"
                    onChange={(e) => {
                      const updated = [...uiForm.heroSlides];
                      updated[idx] = { ...updated[idx], mobileImage: e.target.value };
                      setUiForm({ ...uiForm, heroSlides: updated });
                    }}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono"
                  />
                  <label className="px-2.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg text-xs font-bold text-stone-700 cursor-pointer shrink-0">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (!file) return;
                        try {
                          const dataUrl = await fileToBannerDataUrl(file);
                          setUiForm((prev) => {
                            const updated = [...prev.heroSlides];
                            updated[idx] = { ...updated[idx], mobileImage: dataUrl };
                            return { ...prev, heroSlides: updated };
                          });
                        } catch (err) {
                          alert(err instanceof Error ? err.message : 'Could not use that picture.');
                        }
                      }}
                    />
                  </label>
                  {slide.mobileImage && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...uiForm.heroSlides];
                        updated[idx] = { ...updated[idx], mobileImage: '' };
                        setUiForm({ ...uiForm, heroSlides: updated });
                      }}
                      className="px-2.5 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg text-xs font-bold text-rose-700 cursor-pointer shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-stone-500 font-bold">Quick Image Presets:</span>
                {[
                  { label: 'Pink Cradle', url: '/assets/products/safety-swing-placeholder.png' },
                  { label: 'Brown Swing', url: '/assets/products/shano-gen4-poster.png' },
                  { label: 'Steel Bed', url: '/assets/products/steel-cradle-offer.png' },
                ].map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => {
                      const updated = [...uiForm.heroSlides];
                      updated[idx].image = preset.url;
                      setUiForm({ ...uiForm, heroSlides: updated });
                    }}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-colors cursor-pointer ${
                      slide.image === preset.url
                        ? 'bg-amber-800 text-white border-amber-800'
                        : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b pb-2">
              Featured Categories Photo Customizer (ফিচার্ড ক্যাটাগরি ছবি কাস্টমাইজার)
            </h4>
            <p className="text-[11px] text-stone-500 mt-1">
              Upload or change display photos for each category on the home page category slider.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(uiForm.featuredCategories || [
              { id: 'all', titleEn: 'All Cradles', titleBn: 'সকল দোলনা', badge: 'Popular', image: '/assets/products/shano-gen4-poster.png' },
              { id: 'dolna', titleEn: 'Baby Dolna', titleBn: 'বেবি দোলনা', badge: 'Best Seller', image: '/assets/products/steel-cradle-offer.png' },
              { id: 'safety', titleEn: 'Safety Lock', titleBn: 'সেফটি লক', badge: 'Special', image: '/assets/products/safety-swing-placeholder.png' },
              { id: 'bedding', titleEn: 'Bedding Sets', titleBn: 'বেড সেট ও নেট', badge: 'Cotton', image: '/assets/products/shano-gen4-poster.png' },
              { id: 'accessories', titleEn: 'Accessories', titleBn: 'এক্সেসরিজ', badge: 'Genuine', image: '/assets/products/steel-cradle-offer.png' },
            ]).map((cat, idx) => (
              <div key={cat.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-stone-900">
                    {cat.titleBn} ({cat.titleEn})
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-white border border-stone-200 p-1 flex items-center justify-center shrink-0">
                    <img src={cat.image} alt={cat.titleEn} className="w-full h-full object-contain" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Image Path / Upload
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={cat.image}
                      onChange={(e) => {
                        const baseList = uiForm.featuredCategories || [
                          { id: 'all', titleEn: 'All Cradles', titleBn: 'সকল দোলনা', badge: 'Popular', image: '/assets/products/shano-gen4-poster.png' },
                          { id: 'dolna', titleEn: 'Baby Dolna', titleBn: 'বেবি দোলনা', badge: 'Best Seller', image: '/assets/products/steel-cradle-offer.png' },
                          { id: 'safety', titleEn: 'Safety Lock', titleBn: 'সেফটি লক', badge: 'Special', image: '/assets/products/safety-swing-placeholder.png' },
                          { id: 'bedding', titleEn: 'Bedding Sets', titleBn: 'বেড সেট ও নেট', badge: 'Cotton', image: '/assets/products/shano-gen4-poster.png' },
                          { id: 'accessories', titleEn: 'Accessories', titleBn: 'এক্সেসরিজ', badge: 'Genuine', image: '/assets/products/steel-cradle-offer.png' },
                        ];
                        const cats = [...baseList];
                        cats[idx] = { ...cats[idx], image: e.target.value };
                        setUiForm({ ...uiForm, featuredCategories: cats });
                      }}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono"
                    />
                    <label className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 rounded-lg text-xs font-bold text-stone-700 cursor-pointer shrink-0">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) {
                                const baseList = uiForm.featuredCategories || [
                                  { id: 'all', titleEn: 'All Cradles', titleBn: 'সকল দোলনা', badge: 'Popular', image: '/assets/products/shano-gen4-poster.png' },
                                  { id: 'dolna', titleEn: 'Baby Dolna', titleBn: 'বেবি দোলনা', badge: 'Best Seller', image: '/assets/products/steel-cradle-offer.png' },
                                  { id: 'safety', titleEn: 'Safety Lock', titleBn: 'সেফটি লক', badge: 'Special', image: '/assets/products/safety-swing-placeholder.png' },
                                  { id: 'bedding', titleEn: 'Bedding Sets', titleBn: 'বেড সেট ও নেট', badge: 'Cotton', image: '/assets/products/shano-gen4-poster.png' },
                                  { id: 'accessories', titleEn: 'Accessories', titleBn: 'এক্সেসরিজ', badge: 'Genuine', image: '/assets/products/steel-cradle-offer.png' },
                                ];
                                const cats = [...baseList];
                                cats[idx] = { ...cats[idx], image: evt.target.result as string };
                                setUiForm({ ...uiForm, featuredCategories: cats });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-stone-500 font-bold">Presets:</span>
                  {[
                    { label: 'Pink Cradle', url: '/assets/products/safety-swing-placeholder.png' },
                    { label: 'Brown Swing', url: '/assets/products/shano-gen4-poster.png' },
                    { label: 'Steel Bed', url: '/assets/products/steel-cradle-offer.png' },
                  ].map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => {
                        const baseList = uiForm.featuredCategories || [
                          { id: 'all', titleEn: 'All Cradles', titleBn: 'সকল দোলনা', badge: 'Popular', image: '/assets/products/shano-gen4-poster.png' },
                          { id: 'dolna', titleEn: 'Baby Dolna', titleBn: 'বেবি দোলনা', badge: 'Best Seller', image: '/assets/products/steel-cradle-offer.png' },
                          { id: 'safety', titleEn: 'Safety Lock', titleBn: 'সেফটি লক', badge: 'Special', image: '/assets/products/safety-swing-placeholder.png' },
                          { id: 'bedding', titleEn: 'Bedding Sets', titleBn: 'বেড সেট ও নেট', badge: 'Cotton', image: '/assets/products/shano-gen4-poster.png' },
                          { id: 'accessories', titleEn: 'Accessories', titleBn: 'এক্সেসরিজ', badge: 'Genuine', image: '/assets/products/steel-cradle-offer.png' },
                        ];
                        const cats = [...baseList];
                        cats[idx] = { ...cats[idx], image: preset.url };
                        setUiForm({ ...uiForm, featuredCategories: cats });
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-colors cursor-pointer ${
                        cat.image === preset.url
                          ? 'bg-amber-800 text-white border-amber-800'
                          : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <CheckIcon size={16} />
            <span>Save All Storefront Settings</span>
          </button>
        </div>
      </form>
    </>
  );
};

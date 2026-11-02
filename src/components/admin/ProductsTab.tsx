import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import {
  TrashIcon,
  EditIcon,
  PlusIcon,
  CloseIcon,
} from '../Icons';

export const ProductsTab: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
  } = useStore();

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    modelNo: '',
    titleEn: '',
    titleBn: '',
    price: 2200,
    originalPrice: 2700,
    category: 'dolna',
    image: '/assets/products/shano-gen4-poster.png',
    images: ['/assets/products/shano-gen4-poster.png'],
    descriptionEn: '',
    descriptionBn: '',
    featuresEn: ['100% MS Heavy Duty Steel Frame', 'Free Bedding Set Included', 'Cash on Delivery'],
    featuresBn: ['১০০% হেভি ডিউটি এমএস স্টিল ফ্রেম', 'ফ্রি বেড সেট ও মশারি', 'ক্যাশ অন ডেলিভারি'],
    inStock: true,
    isFeatured: true,
    material: 'Heavy Duty MS Steel',
    warranty: '1 Year Warranty',
  });

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      modelNo: 'Gen ' + (products.length + 5),
      titleEn: '',
      titleBn: '',
      price: 2400,
      originalPrice: 2900,
      category: 'dolna',
      image: '/assets/products/steel-cradle-offer.png',
      images: ['/assets/products/steel-cradle-offer.png', '/assets/products/safety-swing-placeholder.png'],
      descriptionEn: 'High quality MS steel baby swing cradle.',
      descriptionBn: 'উচ্চমানের এমএস স্টিলের তৈরি আকর্ষণীয় বেবি দোলনা।',
      featuresEn: ['Heavy Duty Steel', 'Free Bedding Set', 'Free Delivery'],
      featuresBn: ['হেভি ডিউটি স্টিল', 'ফ্রি বেড সেট', 'ফ্রি ডেলিভারি'],
      inStock: true,
      isFeatured: true,
      material: 'MS Steel Pipe',
      warranty: '1 Year Warranty',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    const currentImgs = prod.images && prod.images.length > 0 ? prod.images : [prod.image];
    setProductForm({
      modelNo: prod.modelNo,
      titleEn: prod.titleEn,
      titleBn: prod.titleBn,
      price: prod.price,
      originalPrice: prod.originalPrice,
      category: prod.category,
      image: currentImgs[0] || prod.image,
      images: currentImgs,
      descriptionEn: prod.descriptionEn,
      descriptionBn: prod.descriptionBn,
      featuresEn: [...prod.featuresEn],
      featuresBn: [...prod.featuresBn],
      inStock: prod.inStock,
      isFeatured: prod.isFeatured,
      material: prod.material,
      warranty: prod.warranty,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const gallery = productForm.images && productForm.images.length > 0
      ? productForm.images
      : [productForm.image];
    const mainImg = gallery[0] || productForm.image;

    // one feature per line; blank lines are dropped when saving
    const cleanLines = (lines: string[]) => lines.map((l) => l.trim()).filter(Boolean);

    const payload = {
      ...productForm,
      image: mainImg,
      images: gallery,
      featuresEn: cleanLines(productForm.featuresEn),
      featuresBn: cleanLines(productForm.featuresBn),
      material: productForm.material.trim(),
      warranty: productForm.warranty.trim(),
    };

    if (editingProductId) {
      updateProduct({
        ...payload,
        id: editingProductId,
      });
    } else {
      addProduct({
        ...payload,
        id: 'prod-' + Date.now(),
      });
    }
    setIsProductModalOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Baby Dolna & Cradles Catalog</h3>
            <p className="text-xs text-stone-500">
              Add, edit prices, update images, and manage product inventory.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetProducts}
              className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 rounded-xl"
            >
              Reset to Default Catalog
            </button>
            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <PlusIcon size={14} />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Model & Category</th>
                <th className="py-3 px-4">Sale Price (BDT)</th>
                <th className="py-3 px-4">Original Price</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.titleEn}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 object-contain bg-stone-50 p-1 rounded-lg border border-stone-200"
                      />
                      <div>
                        <div className="font-bold text-stone-900">{p.titleEn}</div>
                        <div className="text-[11px] text-stone-500">{p.titleBn}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-stone-800 font-mono">{p.modelNo}</span>
                    <div className="text-[11px] text-stone-400 capitalize">{p.category}</div>
                  </td>

                  <td className="py-3 px-4 font-bold text-amber-800 tabular-nums">
                    ৳{p.price}
                  </td>

                  <td className="py-3 px-4 text-stone-400 line-through tabular-nums">
                    ৳{p.originalPrice}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.inStock
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditProduct(p)}
                        className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-stone-100 rounded-lg"
                        title="Edit product"
                        aria-label="Edit product"
                      >
                        <EditIcon size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete product"
                        aria-label="Delete product"
                      >
                        <TrashIcon size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingProductId ? 'Edit Product' : 'Add New Baby Cradle / Dolna'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 text-stone-400 hover:text-white"
                aria-label="Close modal"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Model Code *</label>
                  <input
                    type="text"
                    required
                    value={productForm.modelNo}
                    onChange={(e) => setProductForm({ ...productForm, modelNo: e.target.value })}
                    placeholder="e.g. Shano Gen 6 / Model 501"
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
                  >
                    <option value="dolna">Baby Dolna & Cradles</option>
                    <option value="safety">Safety Lock Models</option>
                    <option value="bedding">Bedding & Mosquito Nets</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Title (English) *</label>
                <input
                  type="text"
                  required
                  value={productForm.titleEn}
                  onChange={(e) => setProductForm({ ...productForm, titleEn: e.target.value })}
                  placeholder="e.g. Shano Gen 6 Luxury Baby Cradle"
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Title (Bengali) *</label>
                <input
                  type="text"
                  required
                  value={productForm.titleBn}
                  onChange={(e) => setProductForm({ ...productForm, titleBn: e.target.value })}
                  placeholder="যেমন: শ্যানো জেন ৬ লাক্সারি বেবি দোলনা"
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Sale Price (BDT) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-xs font-bold text-amber-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Original Price (BDT)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-xs text-stone-900">
                      Product Photos / Gallery ({(productForm.images?.length || 1)} Photos)
                    </label>
                    <p className="text-[10px] text-stone-500">
                      Upload or paste multiple image URLs for this product. Storefront customers can view and switch all photos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const currentImages = productForm.images || [productForm.image];
                      setProductForm({
                        ...productForm,
                        images: [...currentImages, '/assets/products/safety-swing-placeholder.png'],
                      });
                    }}
                    className="px-2.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <PlusIcon size={14} />
                    <span>Add Photo</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(productForm.images && productForm.images.length > 0 ? productForm.images : [productForm.image]).map((imgUrl, imgIdx) => (
                    <div key={imgIdx} className="p-2.5 bg-white rounded-lg border border-stone-200 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-stone-100 border border-stone-200 p-1 shrink-0 flex items-center justify-center">
                        <img src={imgUrl} alt={`Product ${imgIdx + 1}`} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-stone-600">
                          <span>Photo #{imgIdx + 1} {imgIdx === 0 ? '(Main Display Photo)' : ''}</span>
                          {(productForm.images?.length || 1) > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const current = [...(productForm.images || [productForm.image])];
                                current.splice(imgIdx, 1);
                                setProductForm({
                                  ...productForm,
                                  image: current[0] || '/assets/products/shano-gen4-poster.png',
                                  images: current,
                                });
                              }}
                              className="text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            required={imgIdx === 0}
                            value={imgUrl}
                            onChange={(e) => {
                              const current = [...(productForm.images || [productForm.image])];
                              current[imgIdx] = e.target.value;
                              setProductForm({
                                ...productForm,
                                image: current[0],
                                images: current,
                              });
                            }}
                            className="w-full px-2 py-1 border rounded text-xs font-mono"
                          />
                          <label className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded border text-xs font-bold text-stone-700 cursor-pointer shrink-0">
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
                                      const current = [...(productForm.images || [productForm.image])];
                                      current[imgIdx] = evt.target.result as string;
                                      setProductForm({
                                        ...productForm,
                                        image: current[0],
                                        images: current,
                                      });
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
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-stone-500 font-bold">Quick Presets:</span>
                  {[
                    { label: 'Pink Cradle', url: '/assets/products/safety-swing-placeholder.png' },
                    { label: 'Brown Swing', url: '/assets/products/shano-gen4-poster.png' },
                    { label: 'Steel Bed', url: '/assets/products/steel-cradle-offer.png' },
                  ].map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => {
                        const current = [...(productForm.images || [productForm.image])];
                        if (!current.includes(preset.url)) {
                          current.push(preset.url);
                          setProductForm({
                            ...productForm,
                            image: current[0],
                            images: current,
                          });
                        }
                      }}
                      className="px-2 py-0.5 text-[10px] font-bold rounded border bg-white text-stone-700 hover:bg-stone-100 border-stone-200 cursor-pointer"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description (Bengali)</label>
                <textarea
                  rows={2}
                  value={productForm.descriptionBn}
                  onChange={(e) => setProductForm({ ...productForm, descriptionBn: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  value={productForm.descriptionEn}
                  onChange={(e) => setProductForm({ ...productForm, descriptionEn: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-3">
                <div>
                  <div className="font-bold text-stone-800">Product page &quot;Details&quot; boxes</div>
                  <p className="text-[11px] text-stone-500">
                    The two boxes under the Details tab on the product page. Leave one empty to hide that box.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Frame Material</label>
                    <input
                      type="text"
                      value={productForm.material}
                      onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                      placeholder="e.g. Solid MS Steel Structure"
                      className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Warranty &amp; Service</label>
                    <input
                      type="text"
                      value={productForm.warranty}
                      onChange={(e) => setProductForm({ ...productForm, warranty: e.target.value })}
                      placeholder="e.g. 1 Year Warranty"
                      className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-3">
                <div>
                  <div className="font-bold text-stone-800">Features list</div>
                  <p className="text-[11px] text-stone-500">
                    Shown under the Features tab and as tags on the product. Write one feature per line.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Features (Bengali)</label>
                    <textarea
                      rows={7}
                      value={productForm.featuresBn.join('\n')}
                      onChange={(e) => setProductForm({ ...productForm, featuresBn: e.target.value.split('\n') })}
                      className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Features (English)</label>
                    <textarea
                      rows={7}
                      value={productForm.featuresEn.join('\n')}
                      onChange={(e) => setProductForm({ ...productForm, featuresEn: e.target.value.split('\n') })}
                      className="w-full px-3 py-2 border rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.inStock}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                    className="w-4 h-4 text-amber-700 rounded"
                  />
                  <span className="font-bold text-stone-700">In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-amber-700 rounded"
                  />
                  <span className="font-bold text-stone-700">Featured on Homepage</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

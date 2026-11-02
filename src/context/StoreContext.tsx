import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Product, CartItem, Order, SiteConfig, Language, OrderStatus, FeaturedCategoryItem } from '../types';
import { calculateCartTotals, calculateDeliveryFee, generateOrderId } from '../utils/pricing';
import { cleanStatusHistory } from '../utils/orderTracking';
import { rememberOrder } from '../utils/myOrders';
import { supabase, isSupabaseConfigured, updateSupabaseCredentials } from '../lib/supabase';
import { upgradeImagePaths } from '../utils/imagePaths';
import { ADMIN_PATH, isAdminPath } from '../utils/adminRoute';

// I should kill this project with my self

interface ProductRow {
  id: string;
  model_no: string;
  title_en: string;
  title_bn: string;
  price: number | string;
  original_price: number | string;
  category: 'dolna' | 'bedding' | 'accessories' | 'safety';
  image: string;
  description_en: string | null;
  description_bn: string | null;
  features_en: string[] | null;
  features_bn: string[] | null;
  in_stock: boolean | null;
  is_featured: boolean | null;
  material: string | null;
  warranty: string | null;
}

interface OrderRow {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city_district: string;
  delivery_area: 'dhaka_inside' | 'dhaka_outside';
  payment_method: string;
  items: CartItem[];
  subtotal: number | string;
  delivery_fee: number | string;
  total: number | string;
  status: OrderStatus;
  notes: string | null;
  status_history?: unknown;
  updated_at?: string | null;
}

interface SiteConfigRow {
  id: number;
  announcement_en: string | null;
  announcement_bn: string | null;
  phone1: string | null;
  phone2: string | null;
  whatsapp_number: string | null;
  whatsapp_prefill_text: string | null;
  store_address_en: string | null;
  store_address_bn: string | null;
  facebook_url: string | null;
  review_group_url: string | null;
  hero_slides: any;
  is_delivery_free_nationwide: boolean | null;
  delivery_fee_inside_dhaka: number | string | null;
  delivery_fee_outside_dhaka: number | string | null;
  free_delivery_min_order: number | string | null;
}

// index.html starts the products/site_config requests before the app has loaded
// (src/boot/prefetch.js). The first refresh uses those results; later refreshes (admin
// "refresh" button, reconnecting) go through the normal Supabase client.
function takeBootData(name: 'products' | 'config'): Promise<any[] | null> {
  const boot = (window as any).__sbsBoot;
  const pending = boot?.[name];
  if (boot) boot[name] = undefined;
  return pending ? Promise.resolve(pending) : Promise.resolve(null);
}

function mapRowToProduct(row: ProductRow): Product {
  // images column ta schema.sql e ekhono nai, add na korle supabase e save hobe na (todo)
  // NUH I AM DUMB......... Ami ki kha code lekhta siii
  // jani na mother chod, as any diye kono moto cholche
  const imagesArray = Array.isArray((row as any).images) && (row as any).images.length > 0
    ? (row as any).images
    : [row.image];
  return upgradeImagePaths({
    id: row.id,
    modelNo: row.model_no,
    titleEn: row.title_en,
    titleBn: row.title_bn,
    price: Number(row.price),
    originalPrice: Number(row.original_price),
    category: row.category,
    image: row.image,
    images: imagesArray,
    descriptionEn: row.description_en || '',
    descriptionBn: row.description_bn || '',
    featuresEn: Array.isArray(row.features_en) ? row.features_en : [],
    featuresBn: Array.isArray(row.features_bn) ? row.features_bn : [],
    inStock: row.in_stock !== false,
    isFeatured: row.is_featured === true,
    material: row.material || '',
    warranty: row.warranty || '',
  });
}

function mapProductToRow(prod: Product): Record<string, any> {
  return {
    id: prod.id,
    model_no: prod.modelNo,
    title_en: prod.titleEn,
    title_bn: prod.titleBn,
    price: prod.price,
    original_price: prod.originalPrice,
    category: prod.category,
    image: prod.image,
    images: prod.images && prod.images.length > 0 ? prod.images : [prod.image],
    description_en: prod.descriptionEn,
    description_bn: prod.descriptionBn,
    features_en: prod.featuresEn,
    features_bn: prod.featuresBn,
    in_stock: prod.inStock,
    is_featured: prod.isFeatured,
    material: prod.material,
    warranty: prod.warranty,
  };
}

export function mapRowToOrder(row: OrderRow): Order {
  return upgradeImagePaths({
    id: row.id,
    createdAt: row.created_at ? row.created_at.replace('T', ' ').substring(0, 16) : new Date().toISOString().substring(0, 16),
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    customerCityDistrict: row.customer_city_district,
    deliveryArea: row.delivery_area as 'dhaka_inside' | 'dhaka_outside',
    paymentMethod: 'cod',
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    status: row.status as OrderStatus,
    notes: row.notes || '',
    statusHistory: cleanStatusHistory(row.status_history),
    updatedAt: row.updated_at || undefined,
  });
}

// NOTE: status_history is deliberately NOT sent. The database fills it in with a trigger, and
// sending a column that does not exist yet would make every order save fail on old databases.
function mapOrderToRow(order: Order): Record<string, any> {
  return {
    id: order.id,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    customer_address: order.customerAddress,
    customer_city_district: order.customerCityDistrict,
    delivery_area: order.deliveryArea,
    payment_method: order.paymentMethod,
    items: order.items,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    total: order.total,
    status: order.status,
    notes: order.notes || '',
  };
}

function mapRowToConfig(row: SiteConfigRow, fallback: SiteConfig): SiteConfig {
  return upgradeImagePaths({
    ...fallback,
    announcementEn: row.announcement_en || fallback.announcementEn,
    announcementBn: row.announcement_bn || fallback.announcementBn,
    phone1: row.phone1 || fallback.phone1,
    phone2: row.phone2 || fallback.phone2,
    whatsappNumber: row.whatsapp_number || fallback.whatsappNumber,
    whatsappPrefillText: row.whatsapp_prefill_text || fallback.whatsappPrefillText,
    storeAddressEn: row.store_address_en || fallback.storeAddressEn,
    storeAddressBn: row.store_address_bn || fallback.storeAddressBn,
    facebookUrl: row.facebook_url || fallback.facebookUrl,
    reviewGroupUrl: row.review_group_url || fallback.reviewGroupUrl,
    heroSlides: Array.isArray(row.hero_slides) && row.hero_slides.length > 0 ? row.hero_slides : fallback.heroSlides,
    // AMI TS LEKHTA GASII, JS LEKHLA KI HOTO?? past me answer me pls
    featuredCategories: Array.isArray((row as any).featured_categories) && (row as any).featured_categories.length > 0 ? (row as any).featured_categories : fallback.featuredCategories,
    isDeliveryFreeNationwide: row.is_delivery_free_nationwide === true,
    deliveryFeeInsideDhaka: row.delivery_fee_inside_dhaka !== null ? Number(row.delivery_fee_inside_dhaka) : fallback.deliveryFeeInsideDhaka,
    deliveryFeeOutsideDhaka: row.delivery_fee_outside_dhaka !== null ? Number(row.delivery_fee_outside_dhaka) : fallback.deliveryFeeOutsideDhaka,
    freeDeliveryMinOrder: row.free_delivery_min_order !== null ? Number(row.free_delivery_min_order) : fallback.freeDeliveryMinOrder,
  });
}

function mapConfigToRow(cfg: SiteConfig): Record<string, any> {
  return {
    id: 1,
    announcement_en: cfg.announcementEn,
    announcement_bn: cfg.announcementBn,
    phone1: cfg.phone1,
    phone2: cfg.phone2,
    whatsapp_number: cfg.whatsappNumber,
    whatsapp_prefill_text: cfg.whatsappPrefillText,
    store_address_en: cfg.storeAddressEn,
    store_address_bn: cfg.storeAddressBn,
    facebook_url: cfg.facebookUrl,
    review_group_url: cfg.reviewGroupUrl,
    hero_slides: cfg.heroSlides,
    featured_categories: cfg.featuredCategories || [],
    is_delivery_free_nationwide: cfg.isDeliveryFreeNationwide,
    delivery_fee_inside_dhaka: cfg.deliveryFeeInsideDhaka,
    delivery_fee_outside_dhaka: cfg.deliveryFeeOutsideDhaka,
    free_delivery_min_order: cfg.freeDeliveryMinOrder,
  };
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-gen-4',
    modelNo: 'Shano Gen 4',
    titleEn: 'Shano Gen 4 Premium Baby Dolna with Bedding Set',
    titleBn: 'শ্যানো জেন ৪ প্রিমিয়াম বেবি দোলনা (ফ্রি বেড সেট ও মশারি সহ)',
    price: 2190,
    originalPrice: 2690,
    category: 'dolna',
    image: '/assets/products/shano-gen4-poster.png',
    images: [
      '/assets/products/shano-gen4-poster.png',
      '/assets/products/safety-swing-placeholder.png',
      '/assets/products/steel-cradle-offer.png',
    ],
    descriptionEn: 'Reliable quality, maximum comfort, and an affordable price. The perfect cozy cradle for your baby\'s sweet dreams. Includes free bed set, mosquito net, and lockable wheels.',
    descriptionBn: 'আপনার সোনামণির জন্য সর্বোচ্চ আরামদায়ক ও মজবুত খাঁটি এমএস স্টিল ফ্রেমের বেবি দোলনা। সাথে পাচ্ছেন আকর্ষণীয় বেড সেট ও সুরক্ষাকারী মশারি সম্পূর্ণ বিনামূল্যে।',
    featuresEn: [
      '100% MS Heavy Duty Steel Frame',
      'Free Soft Cotton Bed Set Included',
      'Anti-Mosquito Net Canopy',
      'Smooth Silent Rocking Mechanism',
      'Caster Wheels with Quick Brakes',
      'Cash on Delivery with Free Home Delivery',
    ],
    featuresBn: [
      '১০০% হেভি ডিউটি এমএস স্টিল ফ্রেম',
      'ফ্রি সফট কটন বেড সেট ও বালিশ',
      'উচ্চ ঘনত্বের সুরক্ষাকারী মশারি',
      'মসৃণ ও সম্পূর্ণ শব্দহীন দোলনা সিস্টেম',
      'লক সুবিধাসহ মজবুত চাকা',
      'সারা বাংলাদেশে ফ্রি হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি',
    ],
    inStock: true,
    isFeatured: true,
    material: 'Heavy Duty MS Steel Pipe & Soft Cotton',
    warranty: '1 Year Warranty',
  },
  {
    id: 'prod-gen-6',
    modelNo: 'Shano Gen 6',
    titleEn: 'Shano Gen 6 Luxury Auto-Balance Baby Cradle',
    titleBn: 'শ্যানো জেন ৬ লাক্সারি অটো-ব্যালেন্স বেবি দোলনা',
    price: 2750,
    originalPrice: 3100,
    category: 'dolna',
    image: '/assets/products/steel-cradle-offer.png',
    images: [
      '/assets/products/steel-cradle-offer.png',
      '/assets/products/safety-swing-placeholder.png',
      '/assets/products/shano-gen4-poster.png',
    ],
    descriptionEn: 'Our flagship cradle designed with ultra-reinforced arch frame, double-layer safety netting, and silent gliding bearings. Offers supreme comfort for newborns up to 3 years.',
    descriptionBn: 'সোনামণির আরামদায়ক ঘুমের জন্য আমাদের সবচেয়ে জনপ্রিয় ফ্ল্যাগশিপ মডেল। মজবুত ফিনিশ ও ডাবল লেয়ার সেফটি মেটিং।',
    featuresEn: [
      'Reinforced Dual Arch MS Frame',
      'Patented Easy Balance Swing',
      'Dual Layer Breathable Mosquito Canopy',
      'Extra Deep Anti-Roll Bassinet',
      'Lockable 360 Degree Swivel Wheels',
    ],
    featuresBn: [
      'দ্বিগুণ মজবুত ডুয়াল আর্চ স্টিল ফ্রেম',
      'সহজ ব্যালেন্স সুইং প্রযুক্তি',      'দ্বিস্তর বিশিষ্ট বাতাস চলাচলকারী মশারি',
      'অতিরিক্ত গভীর বেসিনেট যা বাচ্চার পড়ে যাওয়া রোধ করে',
      '৩৬০ ডিগ্রি লক করা চাকা',
    ],
    inStock: true,
    isFeatured: true,
    material: 'MS Electroplated Steel Frame',
    warranty: '2 Years Free Service',
  },
  {
    id: 'prod-501',
    modelNo: 'Model 501',
    titleEn: 'Model 501 Baby Swing with Safety Lock',
    titleBn: '৫০১ মডেল প্রিমিয়াম সেফটি লক বেবি দোলনা',
    price: 2450,
    originalPrice: 2850,
    category: 'safety',
    image: '/assets/products/safety-swing-placeholder.png',
    images: [
      '/assets/products/safety-swing-placeholder.png',
      '/assets/products/steel-cradle-offer.png',
      '/assets/products/shano-gen4-poster.png',
    ],
    descriptionEn: 'Equipped with a premium safety lock to keep your baby 100% safe and secure. The swing locks into a stationary crib whenever needed.',
    descriptionBn: 'আমাদের ৫০১ মডেলের সাথে পাচ্ছেন প্রিমিয়াম কোয়ালিটির সেফটি লক (Safety Lock), যা আপনার সোনামণিকে রাখবে একদম নিরাপদ ও সুরক্ষিত।',
    featuresEn: [
      'One-Touch Fixed Position Safety Lock',
      'Foldable Compact Design',
      'Ultra Soft Washable Bedding',
      'Reinforced Side Railings',
      'Nationwide Free Delivery',
    ],
    featuresBn: [
      'ওয়ান-টাচ ফিক্সড পজিশন সেফটি লক',
      'সহজে ভাঁজযোগ্য কম্প্যাক্ট ডিজাইন',
      'ওয়াশেবল নরম বেডিং ও প্যাডিং',
      'মজবুত চারপাশের সেফটি রেলিং',
      'সারা বাংলাদেশে ফ্রি ডেলিভারি',
    ],
    inStock: true,
    isFeatured: true,
    material: 'MS Pipe Structure',
    warranty: '1 Year Warranty',
  },
  {
    id: 'prod-733',
    modelNo: 'Model 733',
    titleEn: 'Model 733 Best Seller Baby Dolna',
    titleBn: '৭ ৩৩ মডেল বেস্ট সেলার বেবি দোলনা',
    price: 2290,
    originalPrice: 2700,
    category: 'dolna',
    image: '/assets/products/shano-gen4-poster.png',
    images: [
      '/assets/products/shano-gen4-poster.png',
      '/assets/products/steel-cradle-offer.png',
      '/assets/products/safety-swing-placeholder.png',
    ],
    descriptionEn: 'One of our most popular and highest reviewed models across Bangladesh. Unrivaled stability and supreme softness for your little angel.',
    descriptionBn: 'আমাদের অন্যতম সেরা সেল হওয়া ৭৩৩ মডেলের দোলনাটি। দীর্ঘস্থায়ী স্থায়িত্ব এবং সর্বোচ্চ কোমলতা।',
    featuresEn: [
      'Most Loved Model with 500+ Reviews',
      'Heavy Load Capacity (Up to 25kg)',
      'Integrated Bedding + Netting Included',
      'Free Delivery & Pay on Delivery',
    ],
    featuresBn: [
      '৫০০+ পজিটিভ রিভিউ পাওয়া সেরা মডেল',
      '২৫ কেজি পর্যন্ত ওজন বহন ক্ষমতা',
      'বেড সেট ও মশারি একসাথে অন্তর্ভুক্ত',
      'হাতে পেয়ে টাকা পরিশোধের সুবিধা',
    ],
    inStock: true,
    isFeatured: true,
    material: 'Solid MS Steel Structure',
    warranty: '1 Year Warranty',
  },
  {
    id: 'prod-bedding-set',
    modelNo: 'Deluxe Bed Set',
    titleEn: 'Deluxe Baby Cradle Bedding & Mosquito Net Set',
    titleBn: 'ডিলাক্স বেবি দোলনা বেড সেট ও স্পেশাল মশারি',
    price: 790,
    originalPrice: 990,
    category: 'bedding',
    image: '/assets/products/shano-gen4-poster.png',
    images: [
      '/assets/products/shano-gen4-poster.png',
      '/assets/products/safety-swing-placeholder.png',
    ],
    descriptionEn: 'Soft hypoallergenic cotton mattress, matching bolster pillows, and universal fine mesh mosquito canopy suitable for all standard cradles.',
    descriptionBn: 'শিশুর কোমল ত্বকের জন্য সম্পূর্ণ আরামদায়ক নরম সুতি কাপড়ের গদি ও ফাইন মেশের মশারি।',
    featuresEn: [
      '100% Breathable Organic Cotton',
      'Hypoallergenic Pillow Included',
      'Zipper Net for Easy Access',
    ],
    featuresBn: [
      '১০০% নরম সুতি কাপড়',
      'অ্যালার্জি মুক্ত তুলতুলে বালিশ',
      'সহজে খোলা ও লাগানোর জিপার মশারি',
    ],
    inStock: true,
    isFeatured: false,
    material: 'Export Quality Cotton',
    warranty: 'Quality Guarantee',
  },
];

const INITIAL_ORDERS: Order[] = [];

const INITIAL_FEATURED_CATEGORIES: FeaturedCategoryItem[] = [
  {
    id: 'all',
    titleEn: 'All Cradles',
    titleBn: 'সকল দোলনা',
    badge: 'Popular',
    image: '/assets/products/shano-gen4-poster.png',
  },
  {
    id: 'dolna',
    titleEn: 'Baby Dolna',
    titleBn: 'বেবি দোলনা',
    badge: 'Best Seller',
    image: '/assets/products/steel-cradle-offer.png',
  },
  {
    id: 'safety',
    titleEn: 'Safety Lock',
    titleBn: 'সেফটি লক',
    badge: 'Special',
    image: '/assets/products/safety-swing-placeholder.png',
  },
  {
    id: 'bedding',
    titleEn: 'Bedding Sets',
    titleBn: 'বেড সেট ও নেট',
    badge: 'Cotton',
    image: '/assets/products/shano-gen4-poster.png',
  },
  {
    id: 'accessories',
    titleEn: 'Accessories',
    titleBn: 'এক্সেসরিজ',
    badge: 'Genuine',
    image: '/assets/products/steel-cradle-offer.png',
  },
];

const INITIAL_CONFIG: SiteConfig = {
  announcementEn: 'Free Home Delivery across Bangladesh & Cash on Delivery Available | Hotline: 01354-245072 / 01518986640',
  announcementBn: 'সারা বাংলাদেশে ফ্রি হোম ডেলিভারি এবং পণ্য হাতে পেয়ে মূল্য পরিশোধ (ক্যাশ অন ডেলিভারি) | হেল্পলাইন: 01354-245072 / 01518986640',
  phone1: '01354-245072',
  phone2: '01518986640',
  whatsappNumber: '8801354245072',
  whatsappPrefillText: 'Hello Shahana Baby Shop, I want to order a baby dolna.',
  storeAddressEn: 'Dhaka, Bangladesh (Nationwide Delivery)',
  storeAddressBn: 'ঢাকা, বাংলাদেশ (সারা দেশে ফ্রী হোম ডেলিভারি)',
  facebookUrl: 'https://www.facebook.com/share/g/19LvWhBNgn/',
  reviewGroupUrl: 'https://www.facebook.com/share/g/19LvWhBNgn/',
  featuredCategories: INITIAL_FEATURED_CATEGORIES,
  heroSlides: [
    {
      id: 'slide-1',
      badgeEn: 'Special Offer: Free Home Delivery',
      badgeBn: 'বিশেষ অফার: সারা দেশে ফ্রি হোম ডেলিভারি',
      titleEn: 'Shano Gen 6 Luxury Baby Cradle',
      titleBn: 'আপনার সোনামণির ঘুমের রাজত্বকে আরামদায়ক করুন',
      subtitleEn: 'Original MS Heavy Steel Frame, Safety Lock & Breathable Mosquito Canopy. Pay after receiving parcel.',
      subtitleBn: '১০০% হেভি ডিউটি এমএস স্টিল, সেফটি লক ও ফ্রি বেড সেট। পণ্য হাতে পেয়ে টাকা দিন।',
      priceTagEn: 'Only ৳2,750 (Regular ৳3,100)',
      priceTagBn: 'মাত্র ৳২,৭৫০ (রেগুলার ৳৩,১০০)',
      image: '/assets/products/steel-cradle-offer.png',
      buttonTextEn: 'Order Now (Cash on Delivery)',
      buttonTextBn: 'সরাসরি অর্ডার করুন (ক্যাশ অন ডেলিভারি)',
      productId: 'prod-gen-6',
    },
    {
      id: 'slide-2',
      badgeEn: 'Best Seller 2026',
      badgeBn: 'বেস্ট সেলার ২০২৬',
      titleEn: 'Shano Gen 4 Premium Baby Dolna',
      titleBn: 'শ্যানো জেন ৪ বেবি দোলনা - সাথে ফ্রি বেড সেট',
      subtitleEn: 'Reliable quality, maximum comfort, and an affordable price. Loved by 4,800+ mothers in Bangladesh.',
      subtitleBn: 'সোনামণির সুরক্ষায় ১০০% নিরাপদ খাঁটি এমএস স্টিল ফ্রেম। আকর্ষণীয় বেড সেট সম্পূর্ণ ফ্রি!',
      priceTagEn: 'Special ৳2,190 (Regular ৳2,690)',
      priceTagBn: 'স্পেশাল ৳২,১৯০ (রেগুলার ৳২,৬৯০)',
      image: '/assets/products/shano-gen4-poster.png',
      buttonTextEn: 'Order Shano Gen 4',
      buttonTextBn: 'শ্যানো জেন ৪ অর্ডার করুন',
      productId: 'prod-gen-4',
    },
  ],
  // banner e free delivery likha ase but ei flag false, wich one is right?? check kor
  isDeliveryFreeNationwide: false,
  deliveryFeeInsideDhaka: 60,
  deliveryFeeOutsideDhaka: 120,
  freeDeliveryMinOrder: 0,
};

interface StoreContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotals: ReturnType<typeof calculateCartTotals>;
  getDeliveryFee: (area: 'dhaka_inside' | 'dhaka_outside', subtotal: number) => number;
  cartToast: string | null;
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  siteConfig: SiteConfig;
  updateSiteConfig: (config: SiteConfig) => void;
  resetSiteConfig: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  checkoutProduct: Product | null;
  openCheckout: (product?: Product | null) => void;
  closeCheckout: () => void;
  selectedProductDetails: Product | null;
  openProductDetails: (product: Product) => void;
  closeProductDetails: () => void;
  selectedProductId: string | null;
  navigateToProduct: (productId: string) => void;
  navigateToCart: () => void;
  navigateToStore: () => void;
  navigateToTerms: () => void;
  navigateToTracking: (prefill?: { orderId: string; phone: string }) => void;
  trackingPrefill: { orderId: string; phone: string } | null;
  setTrackingPrefill: (p: { orderId: string; phone: string } | null) => void;
  lastPlacedOrder: Order | null;
  setLastPlacedOrder: (order: Order | null) => void;
  isAdminLoggedIn: boolean;
  // false until Supabase has said whether a saved admin login exists (the /dihanadmin page waits for it)
  isAuthChecked: boolean;
  loginAdmin: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logoutAdmin: () => void;
  currentView: 'store' | 'product' | 'cart' | 'terms' | 'track' | 'admin';
  setCurrentView: (view: 'store' | 'product' | 'cart' | 'terms' | 'track' | 'admin') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  isSupabaseConfigured: boolean;
  supabaseSyncStatus: 'connected' | 'offline_local' | 'syncing' | 'error';
  supabaseErrorMessage: string | null;
  isConfigReady: boolean;
  refreshFromSupabase: () => Promise<boolean>;
  updateSupabaseCredentialsState: (url: string, key: string) => Promise<boolean>;
  syncLocalDataToSupabase: () => Promise<{ success: boolean; message: string }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('sbs_lang') as Language) || 'bn';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('sbs_products');
      if (saved) return upgradeImagePaths(JSON.parse(saved));
    } catch {
      // storage blocked or saved JSON is broken -> use the defaults below
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('sbs_orders');
      if (saved) return upgradeImagePaths(JSON.parse(saved));
    } catch {
      // storage blocked or saved JSON is broken -> use the defaults below
    }
    return INITIAL_ORDERS;
  });

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem('sbs_config');
      if (saved) {
        const parsed = upgradeImagePaths(JSON.parse(saved));
        return {
          ...INITIAL_CONFIG,
          ...parsed,
          deliveryFeeInsideDhaka: parsed.deliveryFeeInsideDhaka !== undefined ? Number(parsed.deliveryFeeInsideDhaka) : 60,
          deliveryFeeOutsideDhaka: parsed.deliveryFeeOutsideDhaka !== undefined ? Number(parsed.deliveryFeeOutsideDhaka) : 120,
          isDeliveryFreeNationwide: parsed.isDeliveryFreeNationwide === true,
        };
      }
    } catch {
      // storage blocked or saved JSON is broken -> use the defaults below
    }
    return INITIAL_CONFIG;
  });

  // Cart starts empty; no products are added automatically
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sbs_cart_v2');
      if (saved) {
        const parsed = upgradeImagePaths(JSON.parse(saved));
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // storage blocked or saved JSON is broken -> use the defaults below
    }
    return [];
  });

  const [cartToast, setCartToast] = useState<string | null>(null);

  // Admin = a real Supabase Auth session (email + password). It is restored from the browser
  // by the effect below, so this starts as false until Supabase answers.
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  // bumped when the Supabase url/key is changed in the Database tab, so we re-listen on the new client
  const [authEpoch, setAuthEpoch] = useState(0);
  const [isAuthChecked, setIsAuthChecked] = useState(!isSupabaseConfigured);

  // The admin panel is its own page (/dihanadmin), so opening that address starts on it.
  const [currentView, setCurrentView] = useState<'store' | 'product' | 'cart' | 'terms' | 'track' | 'admin'>(() =>
    typeof window !== 'undefined' && isAdminPath(window.location.pathname) ? 'admin' : 'store'
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [trackingPrefill, setTrackingPrefill] = useState<{ orderId: string; phone: string } | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    localStorage.setItem('sbs_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('sbs_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sbs_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sbs_config', JSON.stringify(siteConfig));
  }, [siteConfig]);

  useEffect(() => {
    localStorage.setItem('sbs_cart_v2', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    // the old passcode login saved this flag in the browser; it must not grant anything any more
    try {
      localStorage.removeItem('sbs_admin_logged');
    } catch {
      // storage blocked, nothing to clean
    }
  }, []);

  // Keep the address bar in step with the view: /dihanadmin for the admin page, / when leaving it.
  // (If the admin session ends while the page is open, the page just shows the login form again.)
  useEffect(() => {
    const onAdminPath = isAdminPath(window.location.pathname);
    if (currentView === 'admin' && !onAdminPath) {
      window.history.pushState({}, '', ADMIN_PATH);
    } else if (currentView !== 'admin' && onAdminPath) {
      window.history.pushState({}, '', '/');
    }
  }, [currentView]);

  // Browser back / forward between the store and /dihanadmin
  useEffect(() => {
    const onPopState = () => {
      if (isAdminPath(window.location.pathname)) {
        setCurrentView('admin');
      } else {
        setCurrentView((v) => (v === 'admin' ? 'store' : v));
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setIsAdminLoggedIn(false);
      setIsAuthChecked(true);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(
      ({ data }) => {
        if (!active) return;
        setIsAdminLoggedIn(Boolean(data.session));
        setIsAuthChecked(true);
      },
      () => {
        if (active) setIsAuthChecked(true);
      }
    );
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setIsAdminLoggedIn(Boolean(session));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [authEpoch]);

  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<'connected' | 'offline_local' | 'syncing' | 'error'>(
    isSupabaseConfigured ? 'syncing' : 'offline_local'
  );
  const [supabaseErrorMessage, setSupabaseErrorMessage] = useState<string | null>(null);

  // True once we know what the real homepage content is: either this browser already has a
  // saved copy, or the site_config request has come back. The hero waits for this so it
  // doesn't flash placeholder text/images and then jump to the real ones (that was the CLS + LCP problem).
  const [isConfigReady, setIsConfigReady] = useState<boolean>(() => {
    try {
      return !isSupabaseConfigured || localStorage.getItem('sbs_config') !== null;
    } catch {
      return !isSupabaseConfigured;
    }
  });

  // Orders hold customer names/phones/addresses and are only needed by the admin panel,
  // so normal visitors no longer download them at all.
  const isAdminRef = useRef(isAdminLoggedIn);
  isAdminRef.current = isAdminLoggedIn;

  const refreshFromSupabase = useCallback(async (): Promise<boolean> => {
    if (!supabase || !isSupabaseConfigured) {
      setSupabaseSyncStatus('offline_local');
      setIsConfigReady(true);
      return false;
    }
    setSupabaseSyncStatus('syncing');
    setSupabaseErrorMessage(null);
    try {
      // All requests start at the same time (before: products -> orders -> site_config one
      // after another, ~3.6 s on slow 4G). Each result is applied as soon as it arrives.
      const productsTask = (async () => {
        let rows = await takeBootData('products');
        if (!rows) {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
          if (error) {
            console.warn('Supabase fetch products notice:', error.message);
            return;
          }
          rows = data;
        }
        if (rows && rows.length > 0) {
          setProducts(rows.map(mapRowToProduct));
        }
      })();

      const configTask = (async () => {
        let rows = await takeBootData('config');
        if (!rows) {
          const { data, error } = await supabase
            .from('site_config')
            .select('*')
            .eq('id', 1)
            .maybeSingle();
          if (error) {
            console.warn('Supabase fetch site_config notice:', error.message);
            setIsConfigReady(true);
            return;
          }
          rows = data ? [data] : [];
        }
        if (rows[0]) {
          setSiteConfig((prev) => mapRowToConfig(rows![0], prev));
        }
        setIsConfigReady(true);
      })();

      const ordersTask = isAdminRef.current
        ? supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
              if (error) {
                console.warn('Supabase fetch orders notice:', error.message);
              } else if (data && data.length > 0) {
                setOrders(data.map(mapRowToOrder));
              }
            })
        : Promise.resolve();

      await Promise.all([productsTask, configTask, ordersTask]);

      setSupabaseSyncStatus('connected');
      return true;
    } catch (err: any) {
      console.warn('Supabase sync notice (offline or unreachable):', err?.message || err);
      setSupabaseSyncStatus('offline_local');
      setSupabaseErrorMessage(err?.message || 'Database server unreachable; using local storage.');
      setIsConfigReady(true);
      return false;
    }
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) {
      refreshFromSupabase();
    }
  }, [refreshFromSupabase]);

  // When the admin logs in, load the orders (they are skipped for normal visitors).
  useEffect(() => {
    if (isAdminLoggedIn && isSupabaseConfigured) {
      refreshFromSupabase();
    }
  }, [isAdminLoggedIn, refreshFromSupabase]);

  const updateSupabaseCredentialsState = useCallback(
    async (url: string, key: string): Promise<boolean> => {
      const res = updateSupabaseCredentials(url, key);
      if (!res.success || !res.client) {
        setSupabaseSyncStatus('offline_local');
        return false;
      }
      setAuthEpoch((n) => n + 1);
      return await refreshFromSupabase();
    },
    [refreshFromSupabase]
  );

  const syncLocalDataToSupabase = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, message: 'Supabase is not configured.' };
    }
    setSupabaseSyncStatus('syncing');
    try {
      // one by one upsert, slow but products kom so whatever
      for (const prod of products) {
        await supabase.from('products').upsert(mapProductToRow(prod));
      }
      await supabase.from('site_config').upsert(mapConfigToRow(siteConfig));
      for (const ord of orders) {
        await supabase.from('orders').upsert(mapOrderToRow(ord));
      }
      await refreshFromSupabase();
      return {
        success: true,
        message: `Successfully pushed ${orders.length} orders and ${products.length} products to Supabase!`,
      };
    } catch (err: any) {
      console.warn('Sync to Supabase warning:', err);
      return { success: false, message: err?.message || 'Sync failed.' };
    }
  }, [products, siteConfig, orders, refreshFromSupabase]);

  const navigateToProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCart = () => {
    setCurrentView('cart');
    setIsCartDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToTracking = (prefill?: { orderId: string; phone: string }) => {
    setTrackingPrefill(prefill || null);
    setCurrentView('track');
    setSelectedProductId(null);
    setIsCartDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToTerms = () => {
    setCurrentView('terms');
    setSelectedProductId(null);
    setIsCartDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStore = () => {
    setCurrentView('store');
    setSelectedProductId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    if (supabase && isSupabaseConfigured) {
      (async () => {
        try {
          const { error } = await supabase
            .from('products')
            .insert(mapProductToRow(newProduct));
          if (error) {
            console.warn('Supabase addProduct notice:', error.message);
          }
        } catch (err: any) {
          console.warn('Supabase addProduct network notice:', err?.message || err);
        }
      })();
    }
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (supabase && isSupabaseConfigured) {
      (async () => {
        try {
          const { error } = await supabase
            .from('products')
            .upsert(mapProductToRow(updated));
          if (error) {
            console.warn('Supabase updateProduct notice:', error.message);
          }
        } catch (err: any) {
          console.warn('Supabase updateProduct network notice:', err?.message || err);
        }
      })();
    }
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (supabase && isSupabaseConfigured) {
      (async () => {
        try {
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
          if (error) {
            console.warn('Supabase deleteProduct notice:', error.message);
          }
        } catch (err: any) {
          console.warn('Supabase deleteProduct network notice:', err?.message || err);
        }
      })();
    }
  };

  const resetProducts = () => {
    setProducts(INITIAL_PRODUCTS);
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartDrawerOpen(true);
    setCartToast(
      language === 'bn'
        ? `"${product.titleBn}" শপিং ব্যাগে যুক্ত হয়েছে!`
        : `"${product.titleEn}" added to shopping bag!`
    );
    setTimeout(() => {
      setCartToast(null);
    }, 3500);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getDeliveryFee = (area: 'dhaka_inside' | 'dhaka_outside', subtotal: number): number => {
    return calculateDeliveryFee(area, subtotal, siteConfig);
  };

  const defaultDeliveryFee = siteConfig.isDeliveryFreeNationwide ? 0 : siteConfig.deliveryFeeInsideDhaka;
  const cartTotals = calculateCartTotals(cart, defaultDeliveryFee);

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Order => {
    const newOrder: Order = {
      ...orderData,
      id: generateOrderId(),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending',
      statusHistory: [{ status: 'pending', at: new Date().toISOString() }],
    };
    rememberOrder(newOrder.id, newOrder.customerPhone);
    setOrders((prev) => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    clearCart();
    setCheckoutProduct(null);
    setIsCheckoutModalOpen(false);

    if (supabase && isSupabaseConfigured) {
      (async () => {
        try {
          const { error } = await supabase
            .from('orders')
            .insert(mapOrderToRow(newOrder));
          if (error) {
            console.warn('Supabase createOrder notice:', error.message);
          }
        } catch (err: any) {
          console.warn('Supabase createOrder network notice:', err?.message || err);
        }
      })();
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId && order.status !== status
          ? {
              ...order,
              status,
              statusHistory: [...(order.statusHistory || []), { status, at: new Date().toISOString() }],
            }
          : order
      )
    );
    if (supabase && isSupabaseConfigured) {
      (async () => {
        try {
          const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);
          if (error) {
            console.warn('Supabase updateOrderStatus notice:', error.message);
          }
        } catch (err: any) {
          console.warn('Supabase updateOrderStatus network notice:', err?.message || err);
        }
      })();
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
    if (supabase && isSupabaseConfigured) {
      (async () => {
        try {
          const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);
          if (error) {
            console.warn('Supabase deleteOrder notice:', error.message);
          }
        } catch (err: any) {
          console.warn('Supabase deleteOrder network notice:', err?.message || err);
        }
      })();
    }
  };

  const updateSiteConfig = (config: SiteConfig) => {
    setSiteConfig(config);
    if (supabase && isSupabaseConfigured) {
      (async () => {
        try {
          const { error } = await supabase
            .from('site_config')
            .upsert(mapConfigToRow(config));
          if (error) {
            console.warn('Supabase updateSiteConfig notice:', error.message);
          }
        } catch (err: any) {
          console.warn('Supabase updateSiteConfig network notice:', err?.message || err);
        }
      })();
    }
  };

  const resetSiteConfig = () => {
    setSiteConfig(INITIAL_CONFIG);
  };

  const openCheckout = (product: Product | null = null) => {
    setCheckoutProduct(product);
    setIsCheckoutModalOpen(true);
    setIsCartDrawerOpen(false);
  };

  const closeCheckout = () => {
    setIsCheckoutModalOpen(false);
    setCheckoutProduct(null);
  };

  const openProductDetails = (product: Product) => {
    setSelectedProductDetails(product);
  };

  const closeProductDetails = () => {
    setSelectedProductDetails(null);
  };

  const loginAdmin = async (email: string, password: string): Promise<{ ok: boolean; message?: string }> => {
    if (!supabase || !isSupabaseConfigured) {
      return { ok: false, message: 'Supabase is not connected, so admin login is not available.' };
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        return { ok: false, message: error.message };
      }
      // Ask the database if this account is on the admin list. If the SQL for that has not been
      // run yet the call errors, and we let the login through (the database rules decide anyway).
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_shop_admin');
      if (!adminError && isAdmin === false) {
        await supabase.auth.signOut();
        return { ok: false, message: 'This account is not an admin of the shop.' };
      }
      setIsAdminLoggedIn(true);
      return { ok: true };
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Network error, try again.' };
    }
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setCurrentView('store');
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
  };

  return (
    <StoreContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        resetProducts,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotals,
        getDeliveryFee,
        cartToast,
        orders,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        siteConfig,
        updateSiteConfig,
        resetSiteConfig,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        checkoutProduct,
        openCheckout,
        closeCheckout,
        selectedProductDetails,
        openProductDetails,
        closeProductDetails,
        selectedProductId,
        navigateToProduct,
        navigateToCart,
        navigateToStore,
        navigateToTerms,
        navigateToTracking,
        trackingPrefill,
        setTrackingPrefill,
        lastPlacedOrder,
        setLastPlacedOrder,
        isAdminLoggedIn,
        isAuthChecked,
        loginAdmin,
        logoutAdmin,
        currentView,
        setCurrentView,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isSupabaseConfigured,
        supabaseSyncStatus,
        supabaseErrorMessage,
        isConfigReady,
        refreshFromSupabase,
        updateSupabaseCredentialsState,
        syncLocalDataToSupabase,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export type Language = 'bn' | 'en';

export interface Product {
  id: string;
  modelNo: string;
  titleEn: string;
  titleBn: string;
  price: number;
  originalPrice: number;
  category: 'dolna' | 'bedding' | 'accessories' | 'safety';
  image: string;
  images?: string[];
  descriptionEn: string;
  descriptionBn: string;
  featuresEn: string[];
  featuresBn: string[];
  inStock: boolean;
  isFeatured: boolean;
  material: string;
  warranty: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderStatusChange {
  status: OrderStatus;
  at: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCityDistrict: string;
  deliveryArea: 'dhaka_inside' | 'dhaka_outside';
  paymentMethod: 'cod';
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  notes?: string;
  // when each status was reached (filled in by the database, see supabase/schema.sql)
  statusHistory?: OrderStatusChange[];
  updatedAt?: string;
}

export interface HeroSlide {
  id: string;
  badgeEn: string;
  badgeBn: string;
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  priceTagEn: string;
  priceTagBn: string;
  image: string;
  buttonTextEn: string;
  buttonTextBn: string;
  productId: string;
  // Optional wide picture (about 1200x500) used as this slide's banner in the phone UI.
  // Slides without one are shown there as a compact card built from the poster image + text.
  mobileImage?: string;
}

export interface FeaturedCategoryItem {
  id: string;
  titleEn: string;
  titleBn: string;
  badge: string;
  image: string;
}

export interface SiteConfig {
  announcementEn: string;
  announcementBn: string;
  phone1: string;
  phone2: string;
  whatsappNumber: string;
  whatsappPrefillText: string;
  storeAddressEn: string;
  storeAddressBn: string;
  facebookUrl: string;
  reviewGroupUrl: string;
  heroSlides: HeroSlide[];
  featuredCategories?: FeaturedCategoryItem[];
  isDeliveryFreeNationwide: boolean;
  deliveryFeeInsideDhaka: number;
  deliveryFeeOutsideDhaka: number;
  freeDeliveryMinOrder: number;
}

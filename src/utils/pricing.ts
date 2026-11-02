import { CartItem, Language, Product } from '../types';

export const toBengaliDigits = (num: number | string): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
};

export const formatPriceBDT = (amount: number, lang: Language = 'bn'): string => {
  const formattedNumber = new Intl.NumberFormat('en-IN').format(amount);
  if (lang === 'bn') {
    return '৳' + toBengaliDigits(formattedNumber);
  }
  return '৳' + formattedNumber;
};

export const calculateDiscount = (original: number, sale: number): number => {
  if (original <= 0 || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
};

export const validateBangladeshPhone = (phone: string): boolean => {
  // space, dash r + shob muche felsi age
  const cleaned = phone.replace(/[\s-+]/g, '');
  // kaii ami korta gasiii, regex ta barbar vul hoy
  // Matches 013, 014, 015, 016, 017, 018, 019 followed by 8 digits, or 8801...
  const bdPhoneRegex = /^(?:8801|01)[3-9]\d{8}$/;
  return bdPhoneRegex.test(cleaned);
};

export const calculateDeliveryFee = (
  area: 'dhaka_inside' | 'dhaka_outside',
  subtotal: number,
  config: {
    isDeliveryFreeNationwide: boolean;
    deliveryFeeInsideDhaka: number;
    deliveryFeeOutsideDhaka: number;
    freeDeliveryMinOrder?: number;
  }
): number => {
  if (config.isDeliveryFreeNationwide) {
    return 0;
  }
  if (config.freeDeliveryMinOrder && config.freeDeliveryMinOrder > 0 && subtotal >= config.freeDeliveryMinOrder) {
    return 0;
  }
  return area === 'dhaka_inside' ? config.deliveryFeeInsideDhaka : config.deliveryFeeOutsideDhaka;
};

export const calculateCartTotals = (items: CartItem[], deliveryFee: number = 0) => {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const originalSubtotal = items.reduce(
    (sum, item) => sum + (item.product.originalPrice || item.product.price) * item.quantity,
    0
  );
  const totalSavings = Math.max(0, originalSubtotal - subtotal);
  const total = subtotal + deliveryFee;

  return {
    itemCount,
    subtotal,
    originalSubtotal,
    totalSavings,
    deliveryFee,
    total,
  };
};

export const generateOrderId = (): string => {
  // 4 digit random, colision hobe eventually jokhon order barbe. uuid ba db sequence better
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SBS-${randomSuffix}`;
};

export const filterProducts = (
  products: Product[],
  searchQuery: string,
  category: string
): Product[] => {
  // THIS CODE KILLING ME, 5 ta includes ekta function e
  const cleanQuery = searchQuery.trim().toLowerCase();
  return products.filter((product) => {
    const matchesCategory =
      category === 'all' || !category || product.category === category;

    if (!matchesCategory) return false;

    if (!cleanQuery) return true;

    const matchesNameEn = product.titleEn.toLowerCase().includes(cleanQuery);
    const matchesNameBn = product.titleBn.toLowerCase().includes(cleanQuery);
    const matchesModel = product.modelNo.toLowerCase().includes(cleanQuery);
    const matchesDesc = product.descriptionEn.toLowerCase().includes(cleanQuery) || product.descriptionBn.toLowerCase().includes(cleanQuery);

    return matchesNameEn || matchesNameBn || matchesModel || matchesDesc;
  });
};

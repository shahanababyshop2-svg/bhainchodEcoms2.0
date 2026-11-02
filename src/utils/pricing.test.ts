import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toBengaliDigits,
  formatPriceBDT,
  calculateDiscount,
  validateBangladeshPhone,
  calculateCartTotals,
  filterProducts,
  calculateDeliveryFee,
} from './pricing';
import { CartItem, Product } from '../types';

const makeProduct = (over: Partial<Product>): Product => ({
  id: 'x',
  modelNo: '',
  titleEn: '',
  titleBn: '',
  price: 1000,
  originalPrice: 1000,
  category: 'dolna',
  image: '',
  descriptionEn: '',
  descriptionBn: '',
  featuresEn: [],
  featuresBn: [],
  inStock: true,
  isFeatured: false,
  material: '',
  warranty: '',
  ...over,
});

test('bengali digits', () => {
  assert.equal(toBengaliDigits(2190), '২১৯০');
  assert.equal(toBengaliDigits('01354245072'), '০১৩৫৪২৪৫০৭২');
});

test('price formatting en/bn', () => {
  assert.equal(formatPriceBDT(2190, 'en'), '৳2,190');
  assert.equal(formatPriceBDT(2190, 'bn'), '৳২,১৯০');
});

test('discount percent', () => {
  assert.equal(calculateDiscount(2690, 2190), 19);
  assert.equal(calculateDiscount(2000, 2000), 0);
  assert.equal(calculateDiscount(1000, 1200), 0);
});

test('bd phone numbers', () => {
  assert.equal(validateBangladeshPhone('01354245072'), true);
  assert.equal(validateBangladeshPhone('+8801518986640'), true);
  assert.equal(validateBangladeshPhone('01712345678'), true);
  assert.equal(validateBangladeshPhone('01912-345678'), true);
  assert.equal(validateBangladeshPhone('123456'), false);
  assert.equal(validateBangladeshPhone('01234567890'), false); // 012 is not a valid BD prefix
  assert.equal(validateBangladeshPhone('017123456789'), false); // too long
});

test('cart totals with quantity 2', () => {
  const dummyProduct = makeProduct({ id: 'prod-1', price: 2190, originalPrice: 2690 });

  const items: CartItem[] = [{ product: dummyProduct, quantity: 2 }];
  const totals = calculateCartTotals(items, 0);

  assert.equal(totals.itemCount, 2);
  assert.equal(totals.subtotal, 4380);
  assert.equal(totals.originalSubtotal, 5380);
  assert.equal(totals.totalSavings, 1000);
  assert.equal(totals.total, 4380);
});

test('search + category filter', () => {
  const products = [
    makeProduct({ id: 'p1', modelNo: '501', titleEn: 'Model 501 Safety Lock Dolna', titleBn: '৫০১ মডেল সেফটি লক দোলনা', category: 'safety' }),
    makeProduct({ id: 'p2', modelNo: 'Gen-6', titleEn: 'Shano Gen 6 Luxury Baby Cradle', titleBn: 'শ্যানো জেন ৬ বেবি দোলনা' }),
  ];

  const byCat = filterProducts(products, '', 'safety');
  assert.equal(byCat.length, 1);
  assert.equal(byCat[0].id, 'p1');

  const byQuery = filterProducts(products, 'Gen 6', 'all');
  assert.equal(byQuery.length, 1);
  assert.equal(byQuery[0].id, 'p2');
});

test('delivery fee: free, custom, and min-order threshold', () => {
  const freeConfig = {
    isDeliveryFreeNationwide: true,
    deliveryFeeInsideDhaka: 70,
    deliveryFeeOutsideDhaka: 130,
    freeDeliveryMinOrder: 0,
  };
  assert.equal(calculateDeliveryFee('dhaka_inside', 2000, freeConfig), 0);
  assert.equal(calculateDeliveryFee('dhaka_outside', 2000, freeConfig), 0);

  const customConfig = {
    isDeliveryFreeNationwide: false,
    deliveryFeeInsideDhaka: 80,
    deliveryFeeOutsideDhaka: 150,
    freeDeliveryMinOrder: 0,
  };
  assert.equal(calculateDeliveryFee('dhaka_inside', 2000, customConfig), 80);
  assert.equal(calculateDeliveryFee('dhaka_outside', 2000, customConfig), 150);

  const thresholdConfig = {
    isDeliveryFreeNationwide: false,
    deliveryFeeInsideDhaka: 60,
    deliveryFeeOutsideDhaka: 120,
    freeDeliveryMinOrder: 2500,
  };
  assert.equal(calculateDeliveryFee('dhaka_inside', 2000, thresholdConfig), 60);
  assert.equal(calculateDeliveryFee('dhaka_inside', 2600, thresholdConfig), 0);
  assert.equal(calculateDeliveryFee('dhaka_outside', 2600, thresholdConfig), 0);
});

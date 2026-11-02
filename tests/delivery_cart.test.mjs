import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDeliveryFee, calculateCartTotals } from '../src/utils/pricing.ts';

const fees = { isDeliveryFreeNationwide: false, deliveryFeeInsideDhaka: 60, deliveryFeeOutsideDhaka: 120 };

test('empty cart still shows the delivery fee in total', () => {
  const t = calculateCartTotals([], 60);
  assert.equal(t.itemCount, 0);
  assert.equal(t.subtotal, 0);
  assert.equal(t.total, 60);
});

test('inside / outside dhaka use the fee set in admin', () => {
  assert.equal(calculateDeliveryFee('dhaka_inside', 2190, fees), 60);
  assert.equal(calculateDeliveryFee('dhaka_outside', 2190, fees), 120);

  const changed = { ...fees, deliveryFeeInsideDhaka: 80, deliveryFeeOutsideDhaka: 150 };
  assert.equal(calculateDeliveryFee('dhaka_inside', 1000, changed), 80);
  assert.equal(calculateDeliveryFee('dhaka_outside', 1000, changed), 150);
});

test('free delivery only when the toggle is on', () => {
  const free = { ...fees, isDeliveryFreeNationwide: true };
  assert.equal(calculateDeliveryFee('dhaka_inside', 2190, free), 0);
  assert.equal(calculateDeliveryFee('dhaka_outside', 2190, free), 0);
});

test('totals with two different products + delivery', () => {
  const items = [
    { product: { id: 'p1', price: 2190, originalPrice: 2690 }, quantity: 1 },
    { product: { id: 'p2', price: 790, originalPrice: 990 }, quantity: 2 },
  ];
  // 2190 + 790*2 = 3770, saved 500 + 200*2 = 900, plus 60 delivery = 3830
  const t = calculateCartTotals(items, 60);
  assert.equal(t.itemCount, 3);
  assert.equal(t.subtotal, 3770);
  assert.equal(t.totalSavings, 900);
  assert.equal(t.total, 3830);
});

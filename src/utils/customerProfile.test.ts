import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCustomerProfile, customerKey } from './customerProfile';
import type { Order } from '../types';

const order = (over: Partial<Order>): Order => ({
  id: 'SBS-0001',
  createdAt: '2026-01-01 10:00',
  customerName: 'Rahima',
  customerPhone: '01712345678',
  customerAddress: 'House 1, Road 2',
  customerCityDistrict: 'Dhaka',
  deliveryArea: 'dhaka_inside',
  paymentMethod: 'cod',
  items: [],
  subtotal: 1000,
  deliveryFee: 60,
  total: 1060,
  status: 'pending',
  ...over,
});

test('customerKey treats +880 / dashes / local format as the same phone', () => {
  assert.equal(customerKey('+880 1712-345678'), '01712345678');
  assert.equal(customerKey('8801712345678'), '01712345678');
  assert.equal(customerKey('01712345678'), '01712345678');
});

test('profile only includes that customer, newest order first', () => {
  const orders = [
    order({ id: 'A', createdAt: '2026-01-01 10:00', status: 'delivered', total: 1000 }),
    order({ id: 'B', createdAt: '2026-03-01 10:00', customerPhone: '+8801712345678', status: 'cancelled', total: 500 }),
    order({ id: 'C', createdAt: '2026-02-01 10:00', customerPhone: '01999999999', total: 700 }),
  ];
  const p = buildCustomerProfile(orders, '01712345678');
  assert.deepEqual(p.orders.map((o) => o.id), ['B', 'A']);
  assert.equal(p.totalOrders, 2);
  assert.equal(p.delivered, 1);
  assert.equal(p.cancelled, 1);
  assert.equal(p.cancelRate, 50);
  assert.equal(p.totalSpent, 1000);
  assert.equal(p.firstOrderAt, '2026-01-01 10:00');
  assert.equal(p.lastOrderAt, '2026-03-01 10:00');
});

test('collects different names and addresses once each', () => {
  const orders = [
    order({ id: 'A', createdAt: '2026-01-01 10:00', customerName: 'Rahima', customerAddress: 'House 1' }),
    order({ id: 'B', createdAt: '2026-02-01 10:00', customerName: 'Rahima Begum', customerAddress: 'House 9' }),
    order({ id: 'C', createdAt: '2026-03-01 10:00', customerName: 'rahima begum', customerAddress: 'house 9' }),
  ];
  const p = buildCustomerProfile(orders, '01712345678');
  assert.deepEqual(p.names, ['rahima begum', 'Rahima']);
  assert.equal(p.addresses.length, 2);
});

test('unknown phone gives an empty profile instead of crashing', () => {
  const p = buildCustomerProfile([order({})], '01800000000');
  assert.equal(p.totalOrders, 0);
  assert.equal(p.cancelRate, 0);
  assert.equal(p.lastOrderAt, null);
});

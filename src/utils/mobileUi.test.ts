import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PHONE_MAX_WIDTH,
  parseUiMode,
  shouldShowMobileUi,
  slideIndexFromScroll,
  pickFeatureChips,
  telHref,
  whatsappHref,
} from './mobileUi';

test('phone UI stops exactly where the tablet breakpoint (768px) starts', () => {
  assert.equal(PHONE_MAX_WIDTH, 767);
});

test('parseUiMode: only the word "classic" selects the old phone UI', () => {
  assert.equal(parseUiMode('classic'), 'classic');
  assert.equal(parseUiMode('new'), 'new');
  assert.equal(parseUiMode(''), 'new');
  assert.equal(parseUiMode(null), 'new');
  assert.equal(parseUiMode(undefined), 'new');
  assert.equal(parseUiMode('Classic '), 'new');
});

test('shouldShowMobileUi: new UI only on phones and only when not in classic view', () => {
  assert.equal(shouldShowMobileUi(true, 'new'), true);
  assert.equal(shouldShowMobileUi(true, 'classic'), false);
  assert.equal(shouldShowMobileUi(false, 'new'), false);
  assert.equal(shouldShowMobileUi(false, 'classic'), false);
});

test('slideIndexFromScroll: rounds to the nearest slide and stays in range', () => {
  assert.equal(slideIndexFromScroll(0, 360, 3), 0);
  assert.equal(slideIndexFromScroll(170, 360, 3), 0);
  assert.equal(slideIndexFromScroll(190, 360, 3), 1);
  assert.equal(slideIndexFromScroll(720, 360, 3), 2);
  assert.equal(slideIndexFromScroll(5000, 360, 3), 2);
  assert.equal(slideIndexFromScroll(-40, 360, 3), 0);
  assert.equal(slideIndexFromScroll(100, 0, 3), 0);
  assert.equal(slideIndexFromScroll(100, 360, 0), 0);
});

test('pickFeatureChips: trims, drops empties and repeats, keeps the first few', () => {
  assert.deepEqual(pickFeatureChips(['  A ', '', 'a', 'B', 'C', 'D']), ['A', 'B', 'C']);
  assert.deepEqual(pickFeatureChips(['One', 'Two'], 1), ['One']);
  assert.deepEqual(pickFeatureChips(undefined), []);
  assert.deepEqual(pickFeatureChips([]), []);
});

test('telHref and whatsappHref keep only the digits of the number', () => {
  assert.equal(telHref('01354-245072'), 'tel:01354245072');
  assert.equal(whatsappHref('+880 1354-245072', 'Hi there'), 'https://wa.me/8801354245072?text=Hi%20there');
});

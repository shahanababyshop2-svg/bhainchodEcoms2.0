import test from 'node:test';
import assert from 'node:assert/strict';
import { bannerTargetSize, BANNER_MAX_WIDTH } from './bannerImage';

test('bannerTargetSize: big pictures shrink to 1200 wide and keep their shape', () => {
  assert.deepEqual(bannerTargetSize(2400, 1000), { width: 1200, height: 500 });
  assert.deepEqual(bannerTargetSize(4000, 1667), { width: BANNER_MAX_WIDTH, height: 500 });
});

test('bannerTargetSize: pictures already small enough are left alone', () => {
  assert.deepEqual(bannerTargetSize(1200, 500), { width: 1200, height: 500 });
  assert.deepEqual(bannerTargetSize(800, 333), { width: 800, height: 333 });
});

test('bannerTargetSize: empty or broken sizes give 0x0', () => {
  assert.deepEqual(bannerTargetSize(0, 500), { width: 0, height: 0 });
  assert.deepEqual(bannerTargetSize(1200, -1), { width: 0, height: 0 });
});

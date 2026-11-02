import test from 'node:test';
import assert from 'node:assert/strict';
import { upgradeImagePaths } from './imagePaths.ts';

test('old image paths are rewritten to the new products folder', () => {
  assert.equal(
    upgradeImagePaths('/assets/image_folder/image_b32343d3.png'),
    '/assets/products/shano-gen4-poster.png'
  );
});

test('paths that are already new, or external urls, are left alone', () => {
  assert.equal(upgradeImagePaths('/assets/products/steel-cradle-offer.png'), '/assets/products/steel-cradle-offer.png');
  assert.equal(upgradeImagePaths('https://example.com/a.jpg'), 'https://example.com/a.jpg');
});

test('nested products / orders / config objects are rewritten in place', () => {
  const saved = {
    image: '/assets/image_folder/image_171a78dd.png',
    images: ['/assets/image_folder/image_6d16add2.png', 'https://example.com/b.jpg'],
    price: 2190,
    inStock: true,
    nothing: null,
  };
  assert.deepEqual(upgradeImagePaths(saved), {
    image: '/assets/products/steel-cradle-offer.png',
    images: ['/assets/products/safety-swing-placeholder.png', 'https://example.com/b.jpg'],
    price: 2190,
    inStock: true,
    nothing: null,
  });
});

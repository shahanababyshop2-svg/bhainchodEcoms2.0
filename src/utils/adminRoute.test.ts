import test from 'node:test';
import assert from 'node:assert/strict';
import { ADMIN_PATH, isAdminPath } from './adminRoute.ts';

test('the admin page path is recognised, with or without a trailing slash', () => {
  assert.equal(isAdminPath(ADMIN_PATH), true);
  assert.equal(isAdminPath(`${ADMIN_PATH}/`), true);
  assert.equal(isAdminPath('/DihanAdmin'), true);
});

test('normal store paths are not the admin page', () => {
  assert.equal(isAdminPath('/'), false);
  assert.equal(isAdminPath(''), false);
  assert.equal(isAdminPath('/admin'), false);
  assert.equal(isAdminPath(`${ADMIN_PATH}/extra`), false);
});

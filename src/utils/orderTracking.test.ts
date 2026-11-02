import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeOrderId,
  phonesMatch,
  isValidPhoneInput,
  parseOrderDate,
  buildTrackingTimeline,
} from './orderTracking.ts';

test('order ids are normalised however the customer types them', () => {
  assert.equal(normalizeOrderId('sbs-1234'), 'SBS-1234');
  assert.equal(normalizeOrderId('  #SBS-1234 '), 'SBS-1234');
  assert.equal(normalizeOrderId('SBS1234'), 'SBS-1234');
  assert.equal(normalizeOrderId('1234'), 'SBS-1234');
  assert.equal(normalizeOrderId('১২৩৪'), 'SBS-1234');
});

test('phone numbers match across +880 / 880 / 0 prefixes and dashes', () => {
  assert.equal(phonesMatch('01712345678', '+880 1712-345678'), true);
  assert.equal(phonesMatch('8801712345678', '01712345678'), true);
  assert.equal(phonesMatch('০১৭১২৩৪৫৬৭৮', '01712345678'), true);
  assert.equal(phonesMatch('01712345678', '01712345679'), false);
});

test('too-short phone input never matches and is rejected', () => {
  assert.equal(isValidPhoneInput('12345'), false);
  assert.equal(isValidPhoneInput('01712345678'), true);
  assert.equal(phonesMatch('12345', '12345'), false);
});

test('dates: short store format is read as UTC, long database format keeps its offset', () => {
  assert.equal(parseOrderDate('2026-10-30 08:15')?.toISOString(), '2026-10-30T08:15:00.000Z');
  assert.equal(
    parseOrderDate('2026-10-30T08:15:30.123456+00:00')?.toISOString(),
    '2026-10-30T08:15:30.123Z'
  );
  assert.equal(parseOrderDate('garbage'), null);
  assert.equal(parseOrderDate(''), null);
});

test('timeline: a new order has only the first step current', () => {
  const t = buildTrackingTimeline({ status: 'pending', createdAt: '2026-10-30 08:15' });
  assert.deepEqual(t.steps.map((s) => s.state), ['current', 'upcoming', 'upcoming', 'upcoming']);
  assert.equal(t.steps[0].at, '2026-10-30 08:15');
  assert.equal(t.cancelled, false);
});

test('timeline: shipped order uses history timestamps for finished steps', () => {
  const t = buildTrackingTimeline({
    status: 'shipped',
    createdAt: '2026-10-30 08:15',
    statusHistory: [
      { status: 'pending', at: '2026-10-30T08:15:00+00:00' },
      { status: 'confirmed', at: '2026-10-30T09:00:00+00:00' },
      { status: 'shipped', at: '2026-10-31T10:00:00+00:00' },
    ],
  });
  assert.deepEqual(t.steps.map((s) => s.state), ['done', 'done', 'current', 'upcoming']);
  assert.equal(t.steps[1].at, '2026-10-30T09:00:00+00:00');
  assert.equal(t.steps[3].at, null);
});

test('timeline: delivered order shows every step as done', () => {
  const t = buildTrackingTimeline({ status: 'delivered', createdAt: '2026-10-30 08:15' });
  assert.deepEqual(t.steps.map((s) => s.state), ['done', 'done', 'done', 'done']);
});

test('timeline: cancelled order keeps what was reached and flags the cancellation', () => {
  const t = buildTrackingTimeline({
    status: 'cancelled',
    createdAt: '2026-10-30 08:15',
    updatedAt: '2026-10-30T12:00:00+00:00',
    statusHistory: [
      { status: 'pending', at: '2026-10-30T08:15:00+00:00' },
      { status: 'confirmed', at: '2026-10-30T09:00:00+00:00' },
      { status: 'cancelled', at: '2026-10-30T12:00:00+00:00' },
    ],
  });
  assert.equal(t.cancelled, true);
  assert.deepEqual(t.steps.map((s) => s.state), ['done', 'done', 'upcoming', 'upcoming']);
  assert.equal(t.cancelledAt, '2026-10-30T12:00:00+00:00');
});

test('timeline: junk in statusHistory is ignored instead of crashing', () => {
  const t = buildTrackingTimeline({
    status: 'confirmed',
    createdAt: '2026-10-30 08:15',
    statusHistory: [null, { status: 'nope', at: 'x' }, 'str'] as any,
  });
  assert.deepEqual(t.steps.map((s) => s.state), ['done', 'current', 'upcoming', 'upcoming']);
});

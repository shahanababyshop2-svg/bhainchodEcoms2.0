import test from 'node:test';
import assert from 'node:assert/strict';
import { toLocalBdPhone, mapRiskLevel, parseFraudResponse } from './fraudCheck.ts';

test('phone numbers are turned into the 01XXXXXXXXX form BD Courier expects', () => {
  assert.equal(toLocalBdPhone('01712345678'), '01712345678');
  assert.equal(toLocalBdPhone('+880 1712-345678'), '01712345678');
  assert.equal(toLocalBdPhone('8801712345678'), '01712345678');
  assert.equal(toLocalBdPhone('১৭১২৩৪৫৬৭৮'), '01712345678');
  assert.equal(toLocalBdPhone('01212345678'), null); // 012 is not a mobile prefix
  assert.equal(toLocalBdPhone('0171234'), null);
  assert.equal(toLocalBdPhone(''), null);
});

test('risk_level strings map to the three badge colours', () => {
  assert.equal(mapRiskLevel('danger'), 'danger');
  assert.equal(mapRiskLevel('High Risk'), 'danger');
  assert.equal(mapRiskLevel('warning'), 'caution');
  assert.equal(mapRiskLevel('medium'), 'caution');
  assert.equal(mapRiskLevel('safe'), 'safe');
  assert.equal(mapRiskLevel('LOW'), 'safe');
  assert.equal(mapRiskLevel('something new'), 'unknown');
  assert.equal(mapRiskLevel(undefined), 'unknown');
});

test('a response with only risk_level still works', () => {
  const r = parseFraudResponse({ risk_level: 'danger' });
  assert.equal(r.risk, 'danger');
  assert.equal(r.riskLabel, 'danger');
  assert.equal(r.summary, null);
  assert.deepEqual(r.couriers, []);
});

test('risk_level and courier stats are found when nested under data', () => {
  const r = parseFraudResponse({
    status: 'success',
    data: {
      risk_level: 'warning',
      pathao: { success: 5, cancel: 2, total: 7, success_ratio: 71.43 },
      steadfast: { success: 3, cancel: 1, total: 4, success_ratio: 75 },
      summary: { total_parcel: 11, success_parcel: 8, cancelled_parcel: 3, success_ratio: 72.73 },
    },
  });
  assert.equal(r.risk, 'caution');
  assert.equal(r.couriers.length, 2);
  assert.equal(r.couriers[0].courier, 'pathao');
  assert.equal(r.couriers[0].total, 7);
  assert.equal(r.summary?.total, 11);
  assert.equal(r.summary?.success, 8);
  assert.equal(r.summary?.cancel, 3);
  assert.equal(r.summary?.successRatio, 72.73);
});

test('summary is built from the couriers when the response has none', () => {
  const r = parseFraudResponse({
    risk_level: 'safe',
    pathao: { success: 5, cancel: 0 },
    redx: { success: 5, cancel: 0 },
  });
  assert.equal(r.summary?.total, 10);
  assert.equal(r.summary?.successRatio, 100);
});

test('numbers sent as strings are understood', () => {
  const r = parseFraudResponse({ summary: { total: '10', success: '9', cancel: '1' } });
  assert.equal(r.summary?.total, 10);
  assert.equal(r.summary?.successRatio, 90);
});

test('nonsense input never throws', () => {
  for (const bad of [null, undefined, 'text', 42, [], [1, 2], {}, { data: null }, { data: { data: 'x' } }]) {
    const r = parseFraudResponse(bad);
    assert.equal(r.risk, 'unknown');
    assert.deepEqual(r.couriers, []);
  }
});

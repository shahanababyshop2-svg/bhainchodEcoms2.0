import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSupabaseUrl } from '../src/lib/supabaseUrl.ts';

const REF = 'yxmorudzbssrkgzhizjy';
const expected = `https://${REF}.supabase.co`;

// things people actually paste into the settings box
const pasted = {
  'dashboard url': `https://supabase.com/dashboard/project/${REF}`,
  'dashboard url with /editor on the end': `https://supabase.com/dashboard/project/${REF}/editor`,
  'just the project ref': REF,
  'already correct': expected,
  'correct but with trailing slashes': `${expected}///`,
};

for (const [label, input] of Object.entries(pasted)) {
  test(`supabase url: ${label}`, () => {
    assert.equal(normalizeSupabaseUrl(input), expected);
  });
}

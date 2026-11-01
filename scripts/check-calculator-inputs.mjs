import assert from 'node:assert/strict';
import { parseLocalizedNumber } from '../src/lib/calculator-utils.ts';
assert.equal(parseLocalizedNumber('1,5'), 1.5);
assert.equal(parseLocalizedNumber(' 1.5 '), 1.5);
assert.equal(parseLocalizedNumber('-2'), -2);
for (const invalid of ['1.2.3', '1-2', '', 'abc']) {
  assert.ok(Number.isNaN(parseLocalizedNumber(invalid)), `Malformed input must not produce a partial result: ${invalid}`);
}
console.log('Calculator input checks passed.');

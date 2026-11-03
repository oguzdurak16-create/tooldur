import assert from 'node:assert/strict';
import { calculateMilling } from '../src/lib/milling.ts';
const c = calculateMilling(10, 120, 4, 0.05);
assert.ok(Math.abs(c.rpm - 3819.718634205488) < 1e-8);
assert.ok(Math.abs(c.feed - 763.9437268410976) < 1e-8);
assert.equal(c.feedPerRevolution, 0.2);
for (const args of [[0,120,4,.05],[10,120,1.5,.05],[10,Infinity,4,.05],[10,120,4,0]]) assert.throws(() => calculateMilling(...args), RangeError);
console.log('Milling reference, units and invalid-input checks passed.');

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {life, gap, emptyStats, fmtSeconds} from './session.ts';
test('life maths: 3 h a day from 20 to 80', () => {
  const l = life(3);
  assert.equal(l.days, 46);
  assert.equal(l.years, 7.5);
  assert.equal(l.weeks, 390);
  assert.equal(l.totalWeeks, 3120);
});
test('yearly days match the approved table', () => {
  const days = [15, 30, 46, 61, 76, 91, 106, 122, 137];
  for (let h = 1; h <= 9; h++) assert.equal(life(h).days, days[h - 1]);
});
test('rejects bad hours', () => { for (const h of [0, 13, 1.5, NaN]) assert.throws(() => life(h), RangeError); });
test('gap and formatting', () => {
  assert.deepEqual(gap({...emptyStats(), actual: 58, guess: 20}), {seconds: 38, tooLow: true});
  assert.deepEqual(gap({...emptyStats(), actual: 40, guess: 90}), {seconds: 50, tooLow: false});
  assert.equal(fmtSeconds(20), '20 s'); assert.equal(fmtSeconds(64.4), '1 m 04 s');
});

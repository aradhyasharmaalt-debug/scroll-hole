import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildShots, scoreShots, SUPPORT, KIND, describe} from './frames.ts';

const looks = [
  {skin: '#a', shirt: 'teal', pants: 'navy', hair: 'h', shoe: 's'}, {skin: '#a', shirt: 'yellow', pants: 'green', hair: 'h', shoe: 's'},
  {skin: '#a', shirt: 'red', pants: 'black', hair: 'h', shoe: 's'}, {skin: '#a', shirt: 'pink', pants: 'tan', hair: 'h', shoe: 's'},
];
const seeded = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const seen = (scenes: number[]) => scenes.map((scene, n) => ({n, scene, ms: 1500}));
const deps = (s: number) => ({looks, realLook: (n: number) => looks[n % looks.length], rng: seeded(s)});

test('each question has one real frame and three different fakes', () => {
  for (let s = 1; s < 60; s++) {
    for (const q of buildShots(seen([0, 1, 2, 3, 4, 5, 6, 7]), deps(s))) {
      assert.equal(q.shots.length, 4);
      assert.equal(q.shots.filter(x => x.mod === null).length, 1);
      assert.equal(q.shots[q.answer].mod, null);
      assert.equal(new Set(q.shots.map(x => JSON.stringify(x.variant))).size, 4);
      for (const x of q.shots) if (x.mod) assert.ok(SUPPORT[q.scene].includes(x.mod), `${x.mod} not supported by scene ${q.scene}`);
    }
  }
});
test('only reels the visitor saw, one question per reel, at most five', () => {
  const qs = buildShots(seen([2, 2, 4, 4, 5, 5, 7, 8, 9, 10]), deps(4));
  assert.equal(qs.length, 5);
  assert.equal(new Set(qs.map(q => q.scene)).size, 5);
  for (const q of qs) assert.ok([2, 4, 5, 7, 8, 9, 10].includes(q.scene));
});
test('the three wrong answers are three different kinds of change', () => {
  for (let s = 1; s < 100; s++) for (const q of buildShots(seen([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), {...deps(s), count: 11})) {
    const kinds = q.shots.filter(x => x.mod).map(x => KIND[x.mod!]);
    assert.equal(new Set(kinds).size, 3, `scene ${q.scene}: ${kinds.join(',')}`);
  }
});
test('different clothes really are different: new shirt and trousers', () => {
  for (let s = 1; s < 80; s++) for (const q of buildShots(seen([1, 8, 7]), deps(s))) for (const x of q.shots) if (x.mod === 'outfit') {
    const real = looks[q.n % looks.length];
    assert.notEqual(x.variant.look!.shirt, real.shirt); assert.notEqual(x.variant.look!.pants, real.pants); assert.equal(x.variant.hat, true);
  }
});
test('repainted scenes really change color', () => {
  assert.equal(describe('paint', 5), 'The rickshaw is painted another color');
  assert.equal(describe('day', 4), 'The rain has stopped: bright blue sky');
});
test('every scene offers at least three kinds of change', () => {
  SUPPORT.forEach((mods, i) => assert.ok(new Set(mods.map(m => KIND[m])).size >= 3, `scene ${i}`));
});
test('one reel seen still gives one question; none gives none; scoring and wording', () => {
  assert.equal(buildShots(seen([3]), deps(2)).length, 1);
  assert.equal(buildShots([], deps(2)).length, 0);
  const qs = buildShots(seen([0, 1, 2]), deps(9));
  assert.equal(scoreShots(qs, qs.map(q => q.answer)), 3);
  assert.equal(scoreShots(qs, qs.map(() => null)), 0);
  assert.equal(describe('more', 1), 'An extra dog');
  assert.equal(describe('outfit', 1), 'Different clothes');
});

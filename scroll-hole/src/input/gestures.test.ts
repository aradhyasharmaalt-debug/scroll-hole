import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SwipeDetector, PinchDetector, pinchRatio, dwell, heightToValue, zoneOf, isPointing, OneEuro} from './gestures.ts';

function run(det: SwipeDetector, path: [number, number][], active = true) { // [t ms, y]
  let n = 0;
  for (const [t, y] of path) if (det.push({t, x: .5, y, active}, t)) n++;
  return n;
}
test('a fast upward flick is one swipe', () => {
  const d = new SwipeDetector();
  assert.equal(run(d, [[0, .7], [60, .65], [120, .55], [180, .45], [240, .4]]), 1);
});
test('the downward return stroke is not a swipe', () => {
  const d = new SwipeDetector();
  run(d, [[0, .7], [60, .6], [120, .5], [180, .4]]);
  assert.equal(run(d, [[240, .45], [300, .55], [360, .65], [420, .7]]), 0);
});
test('slow drift is ignored', () => {
  assert.equal(run(new SwipeDetector(), Array.from({length: 40}, (_, i) => [i * 50, .8 - i * .005] as [number, number])), 0);
});
test('a hand that is not pointing does not swipe', () => {
  assert.equal(run(new SwipeDetector(), [[0, .7], [100, .5], [200, .3]], false), 0);
});
test('hand can swipe again after settling', () => {
  const d = new SwipeDetector();
  run(d, [[0, .7], [100, .5], [200, .35]]);
  const settle: [number, number][] = Array.from({length: 12}, (_, i) => [300 + i * 50, .7]);
  assert.equal(run(d, [...settle, [900, .7], [960, .62], [1020, .52], [1080, .42]]), 1);
});
test('dwell fills and drains', () => {
  let p = 0; for (let i = 0; i < 10; i++) p = dwell(p, 100, 1000, true);
  assert.ok(Math.abs(p - 1) < 1e-9);
  assert.ok(Math.abs(dwell(.5, 100, 1000, false) - .3) < 1e-9);
});
test('height maps top=max and clamps', () => {
  assert.equal(heightToValue(.0, 1, 9), 9);
  assert.equal(heightToValue(1, 1, 9), 1);
  assert.equal(heightToValue(.5, 10, 120, 5), 65);
  assert.equal(zoneOf(.1), 0); assert.equal(zoneOf(.5), 1); assert.equal(zoneOf(.99), 2);
});
function hand(indexOut: boolean, others: boolean) {
  const l = Array.from({length: 21}, () => ({x: .5, y: .8, z: 0}));
  l[6] = {x: .5, y: .6, z: 0}; l[8] = {x: .5, y: indexOut ? .35 : .65, z: 0};
  for (const [tip, pip, x] of [[12, 10, .53], [16, 14, .56], [20, 18, .6]]) { l[pip] = {x, y: .62, z: 0}; l[tip] = {x, y: others ? .3 : .7, z: 0}; }
  return l;
}
test('pointing: index out, other fingers curled', () => {
  assert.equal(isPointing(hand(true, false)), true);
  assert.equal(isPointing(hand(true, true)), false);   // open hand
  assert.equal(isPointing(hand(false, false)), false); // fist
});
test('pinch is one click per pinch, and must open again', () => {
  const d = new PinchDetector(); let clicks = 0;
  for (const [t, r] of [[0, 1], [100, .9], [200, .2], [260, .15], [320, .2], [400, .35], [900, .2], [1000, .8], [1500, .2]] as [number, number][]) if (d.push(r, t)) clicks++;
  assert.equal(clicks, 2); // 200 ms click; 400 stays down (hysteresis); 900 is too soon after nothing opened; 1500 clicks after opening at 1000
});
test('pinch ratio uses palm size', () => {
  const l = Array.from({length: 21}, () => ({x: .5, y: .5, z: 0}));
  l[0] = {x: .5, y: .8, z: 0}; l[9] = {x: .5, y: .6, z: 0};   // palm = .2
  l[4] = {x: .5, y: .4, z: 0}; l[8] = {x: .56, y: .4, z: 0};  // gap = .06
  assert.ok(Math.abs(pinchRatio(l) - .3) < 1e-9);
});
test('one euro filter converges', () => {
  const f = new OneEuro(); let v = 0; for (let i = 0; i < 60; i++) v = f.filter(1, i * 16);
  assert.ok(v > .98);
});

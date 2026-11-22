/** Pure gesture logic: no DOM, no camera, fully testable. Coordinates are mirrored and normalised: x 0 = player's left, y 0 = top. */

export type Sample = {t: number; x: number; y: number; active: boolean};
type Pt = {x: number; y: number; z?: number};

export const SWIPE_DISTANCE = 0.17;   // fraction of frame height moved up
export const SWIPE_WINDOW_MS = 300;
export const STEADY_SPEED = 0.3;     // frame heights per second

/** Pointing = index finger extended while the middle, ring and little fingers are curled. */
export function isPointing(l: Pt[]): boolean {
  const d = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
  const indexOut = d(l[8], l[0]) > d(l[6], l[0]) * 1.1;
  let curled = 0;
  for (const [tip, pip] of [[12, 10], [16, 14], [20, 18]]) if (d(l[tip], l[0]) < d(l[pip], l[0]) * 1.08) curled++;
  return indexOut && curled >= 2;
}

/** Fingertip position: this is the cursor. */
export const fingertip = (l: Pt[]) => ({x: l[8].x, y: l[8].y});

/** Thumb tip to index tip, relative to palm size so it works at any distance from the camera. */
export function pinchRatio(l: Pt[]): number {
  const palm = Math.max(0.01, Math.hypot(l[0].x - l[9].x, l[0].y - l[9].y));
  return Math.hypot(l[4].x - l[8].x, l[4].y - l[8].y) / palm;
}

export const PINCH_DOWN = 0.3;   // thumb and index touching
export const PINCH_UP = 0.48;    // clearly apart again
export const CLICK_GAP_MS = 350; // one click per pinch, never a machine gun

/** Pinch = click. Fires once when the fingers meet; must open again before the next click. Hysteresis stops flicker. */
export class PinchDetector {
  private down = false;
  private last = -1e9;
  get pinching() { return this.down; }
  reset() { this.down = false; }
  push(ratio: number, t: number): boolean {
    if (!this.down && ratio < PINCH_DOWN && t - this.last > CLICK_GAP_MS) { this.down = true; this.last = t; return true; }
    if (this.down && ratio > PINCH_UP) this.down = false;
    return false;
  }
}

/** How long a "hold still" takes before the game moves on. Slow on purpose: nobody should skip by accident. */
export const HOLD_MS = 3500;

/** One Euro filter (Casiez et al. 2012): smooth when slow, responsive when fast. */
export class OneEuro {
  private x: number | null = null; private dx = 0; private t = 0;
  private minCutoff: number; private beta: number; private dCutoff: number;
  constructor(minCutoff = 1.2, beta = 8, dCutoff = 1) { this.minCutoff = minCutoff; this.beta = beta; this.dCutoff = dCutoff; }
  private alpha(cutoff: number, dt: number) { const tau = 1 / (2 * Math.PI * cutoff); return 1 / (1 + tau / dt); }
  reset() { this.x = null; }
  filter(v: number, t: number): number {
    if (this.x === null) { this.x = v; this.t = t; this.dx = 0; return v; }
    const dt = Math.max((t - this.t) / 1000, 1 / 240);
    this.t = t;
    const rate = (v - this.x) / dt;
    this.dx += this.alpha(this.dCutoff, dt) * (rate - this.dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    this.x += this.alpha(cutoff, dt) * (v - this.x);
    return this.x;
  }
}

/** Detects an upward flick of an open hand. One swipe per flick: the return stroke and the next raise never double-count. */
export class SwipeDetector {
  private history: Sample[] = [];
  private armed = true;
  private steadySince = 0;
  private lastSwipe = -1e9;
  private cooldownMs: number;
  constructor(cooldownMs = 450) { this.cooldownMs = cooldownMs; }
  reset() { this.history = []; this.armed = true; this.steadySince = 0; }
  push(s: Sample | null, t: number): boolean {
    if (!s) { this.history = []; this.armed = true; this.steadySince = 0; return false; }
    this.history.push(s);
    while (this.history.length && t - this.history[0].t > SWIPE_WINDOW_MS) this.history.shift();
    const first = this.history[0];
    const dt = Math.max((s.t - first.t) / 1000, 0.001);
    const rise = first.y - s.y;                       // positive = moved up
    const speed = Math.abs(s.y - first.y) / dt;
    if (!this.armed) {                                // re-arm once the hand has settled
      if (speed < STEADY_SPEED) { this.steadySince ||= t; if (t - this.steadySince > 120) this.armed = true; }
      else this.steadySince = 0;
      return false;
    }
    if (s.active && rise > SWIPE_DISTANCE && t - this.lastSwipe > this.cooldownMs) {
      this.armed = false; this.steadySince = 0; this.lastSwipe = t; this.history = [];
      return true;
    }
    return false;
  }
}

/** Accumulates 0..1 progress while `active`; drains faster than it fills. */
export function dwell(progress: number, dtMs: number, holdMs: number, active: boolean): number {
  return active ? Math.min(1, progress + dtMs / holdMs) : Math.max(0, progress - (dtMs / holdMs) * 2);
}

export function zoneOf(x: number, n = 3): number {
  return Math.min(n - 1, Math.max(0, Math.floor(x * n)));
}

/** Maps a hand height (0 top .. 1 bottom) to a value, top = max. Uses the middle 70% of the frame so extremes are reachable. */
export function heightToValue(y: number, min: number, max: number, step = 1): number {
  const k = Math.min(1, Math.max(0, (0.85 - y) / 0.7));
  return Math.round((min + k * (max - min)) / step) * step;
}

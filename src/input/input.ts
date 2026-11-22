import {useSyncExternalStore} from 'react';
import {FilesetResolver, HandLandmarker} from '@mediapipe/tasks-vision';
import {OneEuro, PinchDetector, SwipeDetector, STEADY_SPEED, fingertip, isPointing, pinchRatio} from './gestures';

/**
 * One input surface for every screen. The visitor's hand is primary; the mouse and keyboard are always live as a fallback,
 * so a booth can never get stuck. Screens read `useHand()` and subscribe to swipe / confirm events.
 */
export type Source = 'hand' | 'pointer' | 'none';
export type Hand = {present: boolean; x: number; y: number; pointing: boolean; pinching: boolean; steady: boolean; source: Source};
export type Camera = 'idle' | 'starting' | 'ready' | 'denied';
export type Mode = 'hand' | 'mouse';
type State = {hand: Hand; camera: Camera; tracking: 'off' | 'loading' | 'on' | 'failed'; mode: Mode};

const NONE: Hand = {present: false, x: .5, y: .5, pointing: false, pinching: false, steady: false, source: 'none'};
let state: State = {hand: NONE, camera: 'idle', tracking: 'off', mode: 'hand'};
const listeners = new Set<() => void>();
const swipes = new Set<() => void>();
const confirms = new Set<() => void>();
const likes = new Set<() => void>();
export type Pos = {x: number; y: number};
const clicks = new Set<(p: Pos) => void>();
const set = (patch: Partial<State>) => { state = {...state, ...patch}; listeners.forEach(l => l()); };

export const onSwipe = (cb: () => void) => { swipes.add(cb); return () => { swipes.delete(cb); }; };
export const onConfirm = (cb: () => void) => { confirms.add(cb); return () => { confirms.delete(cb); }; };
/** A click with the cursor position in 0..1 screen coordinates: a thumb-and-index pinch, or a mouse click. */
export const onClick = (cb: (p: Pos) => void) => { clicks.add(cb); return () => { clicks.delete(cb); }; };
/** The L key = like. */
export const onLike = (cb: () => void) => { likes.add(cb); return () => { likes.delete(cb); }; };
const emitSwipe = () => swipes.forEach(cb => cb());
const emitClick = (p: Pos) => { confirms.forEach(cb => cb()); clicks.forEach(cb => cb(p)); };
const emitConfirm = () => confirms.forEach(cb => cb());
const emitLike = () => likes.forEach(cb => cb());

export function useInput(): State {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => { listeners.delete(cb); }; }, () => state);
}

/* ------------------------------- mouse and keyboard fallback ------------------------------- */
const virtual = {x: .5, y: .5, movedAt: 0, lastMove: 0, speedY: 0, lastY: .5, lastT: 0};
let handHeld = false; // a real hand is currently in frame, so ignore the mouse
let stopKey = false;
export const isStopKeyHeld = () => stopKey;

function nudge(dx: number, dy: number) {
  virtual.x = Math.min(1, Math.max(0, virtual.x + dx)); virtual.y = Math.min(1, Math.max(0, virtual.y + dy));
  virtual.movedAt = performance.now();
}
if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', e => {
    virtual.x = e.clientX / window.innerWidth; virtual.y = e.clientY / window.innerHeight; virtual.movedAt = performance.now();
  });
  // Buttons handle their own clicks; only clicks on the scene itself count as a game click.
  window.addEventListener('pointerdown', e => { if ((e.target as Element | null)?.closest?.('button, a, input')) return; emitClick({x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight}); });
  // One physical scroll = one reel. A Mac trackpad keeps firing wheel events for a second or more (inertia), so after a swipe
  // we ignore the wheel until it has been quiet for 160 ms, and never swipe more often than every 450 ms.
  let lastWheel = 0, lastWheelSwipe = 0, armed = true;
  // Either direction counts (Mac "natural scrolling" flips the sign), a small movement is enough, and no mouse movement is needed.
  document.addEventListener('wheel', e => {
    const now = performance.now();
    if (now - lastWheel > 160) armed = true;
    lastWheel = now;
    const moved = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? Math.abs(e.deltaY) : 0;
    if (armed && moved >= 3 && now - lastWheelSwipe > 450) { armed = false; lastWheelSwipe = now; emitSwipe(); }
  }, {passive: true, capture: true});
  window.addEventListener('keydown', e => {
    if (e.repeat && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    if (e.key === ' ' || e.key === 'ArrowUp' && e.shiftKey) { e.preventDefault(); emitSwipe(); }
    else if (e.key === 'Enter') { emitConfirm(); }
    else if (e.key === 'l' || e.key === 'L') emitLike();
    else if (e.key === 's' || e.key === 'S') stopKey = true;
    else if (e.key === 'ArrowUp') { e.preventDefault(); nudge(0, -.06); emitSwipe(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); nudge(0, .06); }
    else if (e.key === 'ArrowLeft') { nudge(-.34, 0); }
    else if (e.key === 'ArrowRight') { nudge(.34, 0); }
  });
  window.addEventListener('keyup', e => { if (e.key === 's' || e.key === 'S') stopKey = false; });
}

/** Virtual hand from the mouse or arrow keys, used when no real hand is in frame. */
function pointerHand(now: number): Hand {
  const alive = now - virtual.movedAt < 5000;
  if (!alive) return NONE;
  const dt = Math.max((now - virtual.lastT) / 1000, .001);
  if (now - virtual.lastT > 60) { virtual.speedY = Math.abs(virtual.y - virtual.lastY) / dt; virtual.lastY = virtual.y; virtual.lastT = now; }
  return {present: true, x: virtual.x, y: virtual.y, pointing: true, pinching: false, steady: now - virtual.movedAt > 250, source: 'pointer'};
}

/* ------------------------------- camera and hand tracking ------------------------------- */
let landmarker: HandLandmarker | null = null;
let loading: Promise<void> | null = null;
let raf = 0;
let stream: MediaStream | null = null;
const fx = new OneEuro(), fy = new OneEuro();
const swipe = new SwipeDetector();
const pincher = new PinchDetector();
const trail: {t: number; x: number; y: number}[] = [];
let lastSeen = 0, lastVideoTime = -1, last: {x: number; y: number; t: number} | null = null, steadyFlag = false;

export async function startCamera(video: HTMLVideoElement) {
  if (stream) return;
  set({camera: 'starting', mode: 'hand'});
  try {
    stream = await navigator.mediaDevices.getUserMedia({video: {width: {ideal: 1280}, height: {ideal: 720}, facingMode: 'user'}, audio: false});
    video.srcObject = stream;
    await video.play();
    set({camera: 'ready'});
    stream.getVideoTracks()[0].onended = () => { stream = null; set({camera: 'denied', tracking: 'off'}); };
    void loadHands().then(() => loop(video));
  } catch {
    stream = null;
    set({camera: 'denied', tracking: 'off'});
  }
}

/** After the mirror moment the finger is retired: the camera goes off and the mouse takes over. */
export function enterMouseMode() {
  cancelAnimationFrame(raf);
  stream?.getTracks().forEach(t => t.stop());
  stream = null; handHeld = false;
  fx.reset(); fy.reset(); swipe.reset(); pincher.reset(); trail.length = 0; last = null;
  set({camera: 'idle', hand: NONE, mode: 'mouse'});
}

export function stopCamera() {
  cancelAnimationFrame(raf);
  stream?.getTracks().forEach(t => t.stop());
  stream = null; handHeld = false;
  set({camera: 'idle', hand: NONE});
}

async function loadHands() {
  if (landmarker) return;
  loading ??= (async () => {
    set({tracking: 'loading'});
    try {
      const vision = await FilesetResolver.forVisionTasks(import.meta.env.BASE_URL + 'wasm');
      const make = (delegate: 'GPU' | 'CPU') => HandLandmarker.createFromOptions(vision, {
        baseOptions: {modelAssetPath: import.meta.env.BASE_URL + 'models/hand_landmarker.task', delegate},
        runningMode: 'VIDEO', numHands: 2,
        minHandDetectionConfidence: .5, minHandPresenceConfidence: .5, minTrackingConfidence: .5,
      });
      try { landmarker = await make('GPU'); } catch { landmarker = await make('CPU'); }
      set({tracking: 'on'});
    } catch { set({tracking: 'failed'}); }
  })();
  await loading;
}

function loop(video: HTMLVideoElement) {
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    let hand: Hand | null = null;
    if (landmarker && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      try {
        const res = landmarker.detectForVideo(video, now);
        // The largest hand wins: the player stands closest, spectators behind them are smaller.
        let best = -1, bestArea = 0.012;
        res.landmarks.forEach((l, i) => {
          const xs = l.map(p => p.x), ys = l.map(p => p.y);
          const area = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
          if (area > bestArea) { best = i; bestArea = area; }
        });
        if (best >= 0) {
          const l = res.landmarks[best], c = fingertip(l);
          const x = fx.filter(1 - c.x, now), y = fy.filter(c.y, now);
          const pointing = isPointing(l);
          if (last) { const dt = Math.max((now - last.t) / 1000, .001); steadyFlag = Math.hypot(x - last.x, y - last.y) / dt < STEADY_SPEED; }
          last = {x, y, t: now}; lastSeen = now;
          trail.push({t: now, x, y}); while (trail.length && now - trail[0].t > 220) trail.shift();
          // Click where the cursor was just before the fingers met: closing a pinch nudges the fingertip.
          if (pincher.push(pinchRatio(l), now)) emitClick({x: trail[0].x, y: trail[0].y});
          hand = {present: true, x, y, pointing, pinching: pincher.pinching, steady: steadyFlag, source: 'hand'};
          if (!pincher.pinching && swipe.push({t: now, x, y, active: pointing}, now)) emitSwipe();
        }
      } catch { /* a dropped frame is fine */ }
    }
    if (!hand && now - lastSeen > 250) { fx.reset(); fy.reset(); swipe.push(null, now); pincher.reset(); trail.length = 0; last = null; }
    handHeld = !!hand || now - lastSeen < 250;
    if (hand) publish(hand);
    else if (!handHeld) publish(pointerHand(now));
  };
  raf = requestAnimationFrame(frame);
}

let lastPublish = 0;
function publish(h: Hand) {
  const now = performance.now();
  if (now - lastPublish < 33 && h.source === state.hand.source && h.present === state.hand.present && h.steady === state.hand.steady && h.pinching === state.hand.pinching) return;
  lastPublish = now; set({hand: h});
}

/** Keep the virtual hand alive even when the camera is denied. */
if (typeof window !== 'undefined') {
  setInterval(() => { if (!state.camera || state.camera !== 'ready') publish(pointerHand(performance.now())); }, 50);
}
export const hasRealHand = () => handHeld;

import {useEffect, useRef, useState} from 'react';
import {dwell} from '../input/gestures';

/** Progress 0..1 that fills while `active` and calls onDone once at 1. `grace` ignores the first ms after mount. */
export function useDwell(active: boolean, holdMs: number, onDone: () => void, grace = 0) {
  const [p, setP] = useState(0);
  const activeRef = useRef(active); activeRef.current = active;
  const doneRef = useRef(onDone); doneRef.current = onDone;
  useEffect(() => {
    let raf = 0, last = performance.now(); const start = last; let prog = 0, shown = 0, done = false;
    const tick = (now: number) => {
      const dt = now - last; last = now;
      if (now - start > grace) prog = dwell(prog, dt, holdMs, activeRef.current);
      if (Math.abs(prog - shown) > .01 || (prog === 0 && shown !== 0)) { shown = prog; setP(prog); }
      if (prog >= 1 && !done) { done = true; setP(1); doneRef.current(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [holdMs, grace]);
  return p;
}

/** Eased count from 0 to target. Returns the target immediately for reduced motion. */
export function useCountUp(target: number, ms = 1400, delay = 0) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(target); return; }
    let raf = 0; let t0 = 0;
    const timer = setTimeout(() => {
      const step = (now: number) => {
        t0 ||= now; const k = Math.min(1, (now - t0) / ms);
        setV(target * (1 - Math.pow(1 - k, 4)));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [target, ms, delay]);
  return v;
}

/** Run a callback once after ms. */
export function useAfter(ms: number, cb: () => void) {
  const ref = useRef(cb); ref.current = cb;
  useEffect(() => { const t = setTimeout(() => ref.current(), ms); return () => clearTimeout(t); }, [ms]);
}

import {useEffect, useRef} from 'react';
import type {Pose} from './handModel';

const OPEN: Pose = {index: [0.12, 0.2, 0.1], middle: [0.3, 0.4, 0.2], ring: [0.35, 0.45, 0.25], pinky: [0.4, 0.5, 0.25], thumb: {spread: 0.75, open: 0.15, curl: [0.1, 0.05, 0.05]}};
const PINCH: Pose = {index: [0.655, 1.215, 0.52], middle: [0.45, 0.6, 0.3], ring: [0.5, 0.65, 0.35], pinky: [0.55, 0.7, 0.35], thumb: {spread: 0.529, open: 0.604, curl: [0.871, 0.11, 0.2]}};
const POINT: Pose = {index: [0, 0, 0], middle: [1.45, 1.55, 1.0], ring: [1.5, 1.55, 1.0], pinky: [1.5, 1.5, 0.95], thumb: {spread: 0.35, open: 0.95, curl: [0.55, 0.7, 0.3]}};
const POINT_FLICK: Pose = {...POINT, index: [0.18, 0.3, 0.15]};

const mix = (a: Pose, b: Pose, k: number): Pose => {
  const m = (x: number[], y: number[]) => x.map((v, i) => v + (y[i] - v) * k) as [number, number, number];
  return {index: m(a.index, b.index), middle: m(a.middle, b.middle), ring: m(a.ring, b.ring), pinky: m(a.pinky, b.pinky),
    thumb: {spread: a.thumb.spread + (b.thumb.spread - a.thumb.spread) * k, open: a.thumb.open + (b.thumb.open - a.thumb.open) * k, curl: m(a.thumb.curl, b.thumb.curl)}};
};
const smooth = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };
const seg = (u: number, a: number, b: number) => smooth((u - a) / (b - a));

/** A real 3D hand, drawn with WebGL: kind "point" flicks the index finger up, kind "pinch" brings thumb and index together. */
export function Hand3D({kind}: {kind: 'point' | 'pinch'}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    let stop = false, raf = 0, cleanup = () => {};
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    void (async () => {
      try {
        const [THREE, {buildHand, applyPose}] = await Promise.all([import('three'), import('./handModel')]);
        if (stop) return;
        const renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true});
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        const scene = new THREE.Scene();
        const cam = new THREE.PerspectiveCamera(28, 3 / 4, 0.1, 60);
        const dist = kind === 'point' ? 14 : 12.5;
        cam.position.set(0, 0.6, dist); cam.lookAt(0, 0.6, 0);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x4a3a35, 1.1));
        const key = new THREE.DirectionalLight(0xfff1e6, 2.4); key.position.set(4, 5, 7); scene.add(key);
        const rim = new THREE.DirectionalLight(0xff3355, 1.1); rim.position.set(-5, 2, -4); scene.add(rim);
        const hand = buildHand();
        const holder = new THREE.Group(); holder.add(hand.root); scene.add(holder);
        const base = kind === 'point' ? {y: -0.4, ry: 0.3} : {y: -1.5, ry: 1.42};
        hand.root.rotation.y = base.ry;
        const size = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (w && h) { renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); } };
        size(); const ro = new ResizeObserver(size); ro.observe(canvas);
        const t0 = performance.now();
        const frame = (now: number) => {
          const s = still ? 1.2 : (now - t0) / 1000;
          if (kind === 'point') {
            const u = (s % 3.2) / 3.2;
            const up = seg(u, 0.38, 0.55) - seg(u, 0.75, 1.0);
            const flick = seg(u, 0.34, 0.45) - seg(u, 0.5, 0.6);
            holder.position.set(0.9, base.y + up * 1.4, 0);
            holder.rotation.z = 0.88;                                   // the whole arm is rolled about 50 degrees: finger up and to the left, forearm coming in from the lower right
            hand.bend.rotation.z = 0.12 + 0.16 * up + 0.1 * flick;      // a slight bend at the wrist, then a little flick
            applyPose(hand, mix(POINT, POINT_FLICK, flick));
          } else {
            const u = (s % 2.4) / 2.4;
            const close = seg(u, 0.25, 0.45) - seg(u, 0.65, 0.9);
            holder.position.y = base.y;
            applyPose(hand, mix(OPEN, PINCH, still ? 1 : close));
          }
          hand.root.rotation.y = base.ry + (still ? 0 : Math.sin(s * 0.9) * 0.16);
          renderer.render(scene, cam);
          if (!still) raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
        cleanup = () => { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); };
      } catch { /* no WebGL: the demo keeps its card and heart */ }
    })();
    return () => { stop = true; cleanup(); };
  }, [kind]);
  return <canvas ref={ref} className="demo-3d" aria-hidden="true"/>;
}

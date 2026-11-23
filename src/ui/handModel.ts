import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * A small articulated 3D hand (right hand, palm toward -Z, fingers along +Y), built from capsules and a rounded palm.
 * Joint angles are "curl" in radians: positive bends a finger toward the palm.
 */
export type Curl = [number, number, number];
export type Pose = {index: Curl; middle: Curl; ring: Curl; pinky: Curl; thumb: {spread: number; open: number; curl: Curl}};

const FINGERS = {
  index:  {x: -0.72, len: [0.98, 0.58, 0.46], r: 0.235},
  middle: {x: -0.24, len: [1.06, 0.64, 0.5], r: 0.245},
  ring:   {x: 0.24, len: [0.98, 0.6, 0.46], r: 0.23},
  pinky:  {x: 0.72, len: [0.78, 0.44, 0.38], r: 0.2},
} as const;
const THUMB = {len: [0.92, 0.7, 0.56], r: 0.285};
export type Name = keyof typeof FINGERS;

export type Hand = {root: THREE.Group; bend: THREE.Group; joints: Record<Name, THREE.Group[]> & {thumb: THREE.Group[]}; thumbBase: THREE.Group; tips: Record<Name | 'thumb', THREE.Object3D>};

export function buildHand(skin = '#c98f68', nail = '#e8b9a2'): Hand {
  const mat = new THREE.MeshStandardMaterial({color: skin, roughness: 0.62, metalness: 0});
  const nailMat = new THREE.MeshStandardMaterial({color: nail, roughness: 0.28, metalness: 0});
  const root = new THREE.Group();
  // The wrist bends at the base of the palm: `bend` pivots there, `inner` holds the hand shifted back into place.
  const bend = new THREE.Group(); bend.position.y = -1.0; root.add(bend);
  const inner = new THREE.Group(); inner.position.y = 1.0; bend.add(inner);

  const palm = new THREE.Mesh(new RoundedBoxGeometry(2.05, 2.0, 0.78, 5, 0.3), mat);
  inner.add(palm);
  // the fleshy pad at the thumb's base and the heel of the hand, so the palm is not a plain block
  const pad = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), mat);
  pad.scale.set(0.62, 0.95, 0.5); pad.position.set(-0.82, -0.3, -0.18); inner.add(pad);
  const heel = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), mat);
  heel.scale.set(0.75, 0.55, 0.45); heel.position.set(0.45, -0.75, -0.2); inner.add(heel);
  const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.9, 5.2, 28), mat);
  wrist.scale.z = 0.62; wrist.position.y = -3.3;
  root.add(wrist);

  const chain = (parent: THREE.Object3D, len: readonly number[], r: number, withNail = true) => {
    const joints: THREE.Group[] = [];
    let at = parent;
    len.forEach((L, i) => {
      const rr = r * (1 - i * 0.05);
      const j = new THREE.Group();
      if (i) j.position.y = len[i - 1];
      const seg = new THREE.Mesh(new THREE.CapsuleGeometry(rr, L, 8, 18), mat);
      seg.position.y = L / 2;
      j.add(seg);
      if (i) { const knuckle = new THREE.Mesh(new THREE.SphereGeometry(rr * 1.02, 18, 14), mat); j.add(knuckle); }
      if (withNail && i === len.length - 1) {
        const n = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), nailMat);
        n.scale.set(rr * 0.72, L * 0.34, rr * 0.34); n.position.set(0, L * 0.58, rr * 0.8);
        j.add(n);
      }
      at.add(j); joints.push(j); at = j;
    });
    const tip = new THREE.Object3D(); tip.position.y = len[len.length - 1]; at.add(tip);
    return {joints, tip};
  };

  const joints = {} as Hand['joints']; const tips = {} as Hand['tips'];
  (Object.keys(FINGERS) as Name[]).forEach(k => {
    const f = FINGERS[k];
    const base = new THREE.Group(); base.position.set(f.x, 0.98, 0); inner.add(base);
    const c = chain(base, f.len, f.r); joints[k] = c.joints; tips[k] = c.tip;
  });
  const thumbBase = new THREE.Group(); thumbBase.position.set(-1.0, -0.3, 0.02); inner.add(thumbBase);
  const tc = chain(thumbBase, THUMB.len, THUMB.r); joints.thumb = tc.joints; tips.thumb = tc.tip;
  return {root, bend, joints, thumbBase, tips};
}

export function applyPose(h: Hand, p: Pose) {
  (['index', 'middle', 'ring', 'pinky'] as Name[]).forEach(k => p[k].forEach((a, i) => { h.joints[k][i].rotation.x = -a; }));
  h.thumbBase.rotation.set(0, -p.thumb.open, p.thumb.spread, 'ZYX');
  p.thumb.curl.forEach((a, i) => { h.joints.thumb[i].rotation.x = -a; });
}

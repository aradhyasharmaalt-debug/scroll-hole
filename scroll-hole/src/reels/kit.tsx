import type {CSSProperties, ReactNode} from 'react';

/** One palette for every reel, so they read as one illustrator's work: warm street colours, one dark ink. */
export const C = {
  ink: '#2a1f2d', cream: '#f7ead2', sand: '#e6bf85', sandDark: '#cf9f62',
  marigold: '#ffc83d', saffron: '#f4a03a', terracotta: '#d5573b', brick: '#a8402f',
  teal: '#2a9d8f', deepTeal: '#17615a', indigo: '#3d4a8f', night: '#1d1b3a', sky: '#9fd8ec', skyPale: '#cfeaf3',
  leaf: '#6aa84f', darkLeaf: '#3f7a3a', pink: '#f08aa3', white: '#fffaf0', grey: '#8d95a3', rain: '#6b8ea8',
};

export type Look = {skin: string; shirt: string; pants: string; hair: string; shoe: string};
export const LOOKS: Look[] = [
  {skin: '#e3b183', shirt: C.teal, pants: C.indigo, hair: '#1f1a24', shoe: C.ink},
  {skin: '#b57a4a', shirt: C.marigold, pants: C.deepTeal, hair: '#1f1a24', shoe: C.white},
  {skin: '#8a5a35', shirt: C.terracotta, pants: C.ink, hair: '#14101a', shoe: C.cream},
  {skin: '#f1c9a0', shirt: C.pink, pants: C.indigo, hair: '#4a2f22', shoe: C.ink},
  {skin: '#c98e5a', shirt: C.indigo, pants: C.sandDark, hair: '#1f1a24', shoe: C.white},
  {skin: '#a2683c', shirt: C.leaf, pants: C.brick, hair: '#14101a', shoe: C.cream},
];

type PersonProps = {
  x: number; y: number; s?: number; flip?: boolean; look: Look;
  /** animation class for each limb, see reels.css: walk, swing, none */
  legs?: string; armL?: string; armR?: string; head?: string; body?: string;
  /** seconds per cycle, and swing amplitude */
  speed?: number; amp?: number;
  hair?: 'short' | 'bun' | 'cap'; cap?: string;
  handL?: ReactNode; handR?: ReactNode;
  armLRest?: number; armRRest?: number;
  /** override one leg's animation (legA = back leg, legB = front leg) */
  legA?: string; legB?: string;
  /** extra drawing in the person's own space (umbrella, etc.) */
  extra?: ReactNode;
};

const limbStyle = (speed: number, amp: number): CSSProperties => ({['--w' as string]: `${speed}s`, ['--amp' as string]: `${amp}deg`});

/** Flat-illustration person built from a few shapes. Hip is the origin; feet land at y = 40. */
export function Person({x, y, s = 1.5, flip, look, legs = '', armL = '', armR = '', head = '', body = '', speed = .7, amp = 28, hair = 'short', cap, handL, handR, armLRest = 0, armRRest = 0, legA, legB, extra}: PersonProps) {
  const arm = (side: -1 | 1, cls: string, rest: number, hand: ReactNode) =>
    <g transform={`translate(${side * 11} -38)`}><g className={`limb ${cls}`} style={{transform: cls ? undefined : `rotate(${rest}deg)`}}>
      <line y2="17" stroke={look.shirt} strokeWidth="9" strokeLinecap="round"/>
      <line y1="15" y2="32" stroke={look.skin} strokeWidth="7" strokeLinecap="round"/>
      {hand && <g transform="translate(0 32)">{hand}</g>}
    </g></g>;
  const leg = (side: -1 | 1, cls: string) =>
    <g transform={`translate(${side * 5.5} 0)`}><g className={`limb ${cls}`}>
      <line y2="36" stroke={look.pants} strokeWidth="10.5" strokeLinecap="round"/>
      <ellipse cx="3" cy="39.5" rx="8" ry="4" fill={look.shoe}/>
    </g></g>;
  return <g transform={`translate(${x} ${y - 40 * s}) scale(${flip ? -s : s} ${s})`} style={limbStyle(speed, amp)}>
    {arm(-1, armR, armRRest, handR)}
    {leg(-1, legA ?? (legs === 'walk' ? 'swingr' : legs))}{leg(1, legB ?? (legs === 'walk' ? 'swing' : legs))}
    <g className={body}>
      <rect x="-12.5" y="-44" width="25" height="45" rx="9" fill={look.shirt}/>
      <g transform="translate(0 -56)"><g className={`limb ${head}`}>
        <circle r="11.5" fill={look.skin}/>
        {hair === 'bun' && <circle cx="-7" cy="-11" r="5.5" fill={look.hair}/>}
        {hair === 'cap' ? <><path d="M-11.8 -1 A11.8 11.8 0 0 1 11.8 -1 Z" fill={cap ?? C.teal}/><rect x="2" y="-4" width="14" height="3.6" rx="1.8" fill={cap ?? C.teal}/></>
          : <path d="M-12 0 A12 12 0 0 1 12 0 Q6 -6 -2 -5 Q-8 -3 -12 0Z" fill={look.hair}/>}
        <circle cx="5.5" cy="1.5" r="1.5" fill={C.ink}/>
        <path d="M3 7.5 Q6 9.5 9 7.5" stroke={C.ink} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      </g></g>
    </g>
    {arm(1, armL, armLRest, handL)}
    {extra}
  </g>;
}

type DogProps = {x: number; y: number; s?: number; flip?: boolean; color?: string; patch?: string; speed?: number; trot?: boolean};
/** A small street dog. Paws land at y = 0. */
export function Dog({x, y, s = 1.3, flip, color = C.sandDark, patch = C.brick, speed = .38, trot = true}: DogProps) {
  const leg = (lx: number, cls: string) => <g transform={`translate(${lx} -22)`}><g className={`limb ${trot ? cls : ''}`}><line y2="19" stroke={color} strokeWidth="6" strokeLinecap="round"/><ellipse cx="1.5" cy="20" rx="4.5" ry="2.6" fill={C.ink}/></g></g>;
  return <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} style={{['--w' as string]: `${speed}s`, ['--amp' as string]: '30deg'}}>
    {leg(-16, 'swing')}{leg(11, 'swingr')}
    <g className={trot ? 'bob' : ''}>
      <g transform="translate(-27 -34)"><path className="wag" d="M0 0 Q-14 -10 -10 -24" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round"/></g>
      <ellipse cx="0" cy="-31" rx="27" ry="13" fill={color}/>
      <ellipse cx="-8" cy="-34" rx="11" ry="7" fill={patch}/>
      <g transform="translate(26 -42)">
        <ellipse cx="3" cy="0" rx="12" ry="10.5" fill={color}/>
        <ellipse cx="13" cy="3.5" rx="7.5" ry="5.2" fill={C.cream}/>
        <circle cx="19" cy="1.6" r="2.4" fill={C.ink}/>
        <circle cx="5.5" cy="-3" r="1.8" fill={C.ink}/>
        <path d="M-4 -6 Q-12 -4 -9 8 Q-1 6 0 -3Z" fill={patch}/>
      </g>
    </g>
    {leg(-10, 'swingr')}{leg(17, 'swing')}
  </g>;
}

export function Cloud({x, y, s = 1, className = ''}: {x: number; y: number; s?: number; className?: string}) {
  return <g className={className} transform={`translate(${x} ${y}) scale(${s})`}><g fill={C.white}><ellipse cx="0" cy="0" rx="30" ry="11"/><circle cx="-10" cy="-8" r="12"/><circle cx="9" cy="-11" r="15"/></g></g>;
}

/** A row of simple lit-window buildings for the skyline. */
export function Skyline({y: yy, fill, windows, items, className = ''}: {y: number | string; fill: string; windows: string; items: [number, number, number][]; className?: string}) {
  const y = Number(yy);
  return <g className={className}>{items.map(([x, w, h], i) => <g key={i}>
    <rect x={x} y={y - h} width={w} height={h + 400} fill={fill}/>
    {Array.from({length: Math.floor(h / 26)}, (_, r) => Array.from({length: Math.max(1, Math.floor(w / 22))}, (_, c) =>
      (r * 3 + c + i) % 3 === 0 ? <rect key={`${r}-${c}`} x={x + 7 + c * 22} y={y - h + 10 + r * 26} width="9" height="12" rx="1.5" fill={windows}/> : null))}
  </g>)}</g>;
}

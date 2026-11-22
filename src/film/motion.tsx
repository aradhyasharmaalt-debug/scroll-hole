import type {CSSProperties} from 'react';

/** The motion toolkit for the film. Everything is a pure function of time, so the picture can follow the voice exactly. */
export const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const outExpo = (x: number) => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
export const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const inCubic = (x: number) => x * x * x;
export const inOutCubic = (x: number) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Progress 0..1 of an animation that starts at t0 and lasts dur seconds. With reduced motion it simply switches on. */
export const prog = (t: number, t0: number, dur = 0.6, fn: (x: number) => number = outExpo) => reduced ? (t >= t0 ? 1 : 0) : fn(clamp((t - t0) / dur));
/** 1 while visible, easing to 0 over `dur` seconds after t1. */
export const fade = (t: number, t1: number, dur = 0.4) => 1 - prog(t, t1, dur, outCubic);

/** Kinetic text: each letter rises, straightens and focuses in turn, so words land on the spoken stress. */
export function KText({text, t, t0, per = 0.028, dur = 0.55, className = '', style}: {text: string; t: number; t0: number; per?: number; dur?: number; className?: string; style?: CSSProperties}) {
  let n = 0;
  return <span className={`kt ${className}`} style={style} aria-label={text}>
    {text.split(' ').map((w, wi) => <span key={wi}><span className="kt-w" aria-hidden="true">{[...w].map(ch => {
      const q = prog(t, t0 + (n++) * per, dur);
      return <span key={n} className="kt-c" style={{opacity: q, transform: reduced ? undefined : `translateY(${(1 - q) * 0.45}em) rotate(${(1 - q) * 3}deg)`, filter: q < 1 && !reduced ? `blur(${(1 - q) * 4}px)` : undefined}}>{ch}</span>;
    })}</span>{' '}</span>)}
  </span>;
}

/** A line drawn through text, left to right. */
export function Strike({children, t, t0, dur = 0.45}: {children: React.ReactNode; t: number; t0: number; dur?: number}) {
  return <span className="strike-wrap">{children}<i className="strike" style={{transform: `scaleX(${prog(t, t0, dur)})`}}/></span>;
}

/** A rectangle that draws its own outline, one side after another. `weight` is the line width as a CSS length. */
export function DrawBox({t, t0, dur = 0.9, weight = '1.1vh'}: {t: number; t0: number; dur?: number; weight?: string}) {
  const q = prog(t, t0, dur, outCubic) * 4;
  const s = (i: number) => clamp(q - i);
  const ink = {background: 'var(--ink)'};
  return <div className="drawbox" aria-hidden="true">
    <i style={{...ink, left: 0, top: 0, right: 0, height: weight, transformOrigin: 'left', transform: `scaleX(${s(0)})`}}/>
    <i style={{...ink, top: 0, right: 0, bottom: 0, width: weight, transformOrigin: 'top', transform: `scaleY(${s(1)})`}}/>
    <i style={{...ink, left: 0, right: 0, bottom: 0, height: weight, transformOrigin: 'right', transform: `scaleX(${s(2)})`}}/>
    <i style={{...ink, top: 0, left: 0, bottom: 0, width: weight, transformOrigin: 'bottom', transform: `scaleY(${s(3)})`}}/>
  </div>;
}

/** A tick that draws itself. */
export function CheckMark({t, t0, size = '9vh'}: {t: number; t0: number; size?: string}) {
  const q = prog(t, t0, 0.5, outCubic);
  return <svg className="check" viewBox="0 0 24 24" style={{width: size, height: size, transform: `scale(${1 + (1 - q) * 0.4})`, opacity: q > 0 ? 1 : 0}} aria-hidden="true">
    <path d="M3.5 12.5 9 18 20.5 5.5" fill="none" stroke="var(--signal)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - q}/>
  </svg>;
}

/** A number that counts up to its value. */
export const countUp = (t: number, t0: number, to: number, dur = 1.2) => Math.round(to * prog(t, t0, dur, outCubic));

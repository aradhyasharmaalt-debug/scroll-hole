import {memo, useEffect, useRef, useState, type ReactNode} from 'react';
import {Scene} from '../reels/scenes';
import {isMuted, sfx} from '../sound';
import {Finger} from '../ui/icons';
import {DURATION, SCENES, T, captionAt, flicks, sceneIndexAt} from './timeline';
import {Logo} from '../ui/Logo';
import {Pack} from './Pack';
import {DrawBox, KText, Strike, clamp, countUp, fade, inOutCubic, outCubic, outExpo, prog, reduced} from './motion';
import '../reels/reels.css';
import './film.css';

type Props = {reels: number; got: number; total: number; onDone: () => void};

/** The phone, with whichever reel is current. Memoised so the scene redraws only when the reel changes. */
const ReelPhone = memo(({k, size = 'big'}: {k: number; size?: 'big' | 'mid'}) =>
  <div className={`wl-phone ${size}`}><div className="wl-reel" key={k}><Scene n={k}/></div><div className="wl-shade"/></div>);

/** A pack-style warning label. It draws its own frame, then its band, then its words. */
function Warning({t, t0, band = 'WARNING', words, small = false}: {t: number; t0: number; band?: string; words: string; small?: boolean}) {
  const b = prog(t, t0 + 0.35, 0.6);
  return <div className={`wl-panel ${small ? 'small' : ''}`}>
    <DrawBox t={t} t0={t0} dur={0.9} weight={small ? '.5vh' : '1.1vh'}/>
    <div className="wl-band" style={{clipPath: `inset(0 ${(1 - b) * 100}% 0 0)`}}>{band}</div>
    <p className="wl-text"><KText text={words} t={t} t0={t0 + 0.7} per={0.03}/></p>
  </div>;
}

/** Shows its children from a to b, then lets them go quickly. */
const Between = ({t, a, b, children}: {t: number; a: number; b: number; children: ReactNode}) =>
  t >= a && t < b + 0.5 ? <div style={{opacity: t < b ? 1 : fade(t, b, 0.35), transform: t < b || reduced ? undefined : `translateY(${-prog(t, b, 0.35) * 2}vh)`}}>{children}</div> : null;

export function Film({reels, got, total, onDone}: Props) {
  const [t, setT] = useState(0);
  const done = useRef(false);
  const fired = useRef(new Set<string>());
  const lastFlick = useRef(0);
  const once = (key: string, fn: () => void) => { if (!fired.current.has(key)) { fired.current.add(key); fn(); } };

  useEffect(() => {
    // Review aid: /?film=1&t=60 starts the film at 60 s.
    const from = Number(new URLSearchParams(location.search).get('t')) || 0;
    const audio = new Audio(import.meta.env.BASE_URL + 'video/vo.m4a');
    audio.muted = isMuted();
    let started = false, raf = 0;
    const base = performance.now() - from * 1000;
    audio.addEventListener('loadedmetadata', () => { if (from) audio.currentTime = from; }, {once: true});
    audio.play().then(() => { started = true; }).catch(() => { /* blocked: the picture runs on its own clock, with captions */ });
    const tick = (now: number) => {
      const local = (now - base) / 1000;
      // Follow the voice when it is playing, so picture and sound never drift.
      const time = started && !audio.paused && audio.currentTime > 0 ? audio.currentTime : local;
      setT(time);
      if (time >= DURATION && !done.current) { done.current = true; onDone(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); audio.pause(); };
  }, [onDone]);

  const si = sceneIndexAt(t);
  const sc = SCENES[si];
  const rel = t - sc.start;

  // the wipe that carries the film from one scene to the next, fully covering the picture at the boundary
  const next = SCENES[si + 1];
  const here = SCENES[si];
  const wipeAt = next && t > next.start - 0.3 ? next.start : here.start > 0 && t < here.start + 0.3 ? here.start : -1;
  const wq = wipeAt < 0 || reduced ? -1 : prog(t, wipeAt - 0.3, 0.6, inOutCubic);

  // sound
  useEffect(() => { if (wq > 0.02 && wq < 0.98) once('wipe' + wipeAt, () => sfx.swipe()); });
  const racing = si === 2 || si === 3;
  const fCount = racing ? Math.floor(flicks(rel, si === 2 ? 6.5 : 9)) : 0;
  useEffect(() => { if (fCount !== lastFlick.current) { lastFlick.current = fCount; if (fCount > 0) sfx.tick(); } }, [fCount]);
  useEffect(() => { if (t >= T.f5) once('notif', () => sfx.notif()); if (t >= T.s4 + 0.4) once('hit', () => sfx.hit()); if (t >= T.t5) once('lock', () => sfx.lock()); });

  const phase = racing ? flicks(rel, si === 2 ? 6.5 : 9) % 1 : 0;
  const thumbY = phase < .38 ? 10 - 26 * outCubic(phase / .38) : -16 + 26 * ((phase - .38) / .62);   // vh: up fast, back down
  const skip = () => { if (!done.current) { done.current = true; onDone(); } };
  const veil = clamp(t / 0.5) * (1 - clamp((t - (DURATION - 1)) / 0.9));

  return <section className="wl" style={{opacity: veil}} aria-label="The warning label">
    {si === 0 && <Warn t={t}/>}
    {si === 1 && <Gap t={t}/>}
    {si === 2 && <Feed t={t} rel={rel} count={fCount} thumbY={thumbY} phase={phase}/>}
    {si === 3 && <Split t={t} rel={rel} count={fCount} thumbY={thumbY} reels={reels} got={got} total={total}/>}
    {si === 4 && <Still t={t}/>}

    {wq > 0 && wq < 1 && <div className="wl-wipe" style={{transform: `translateX(${(wq * 2 - 1) * 100}%)`}} aria-hidden="true"/>}
    <p className="wl-caption" role="status" aria-live="polite" key={captionAt(t)}>{captionAt(t)}</p>
    <button className="textbtn wl-skip" onClick={skip}>Skip</button>
  </section>;
}

/* ---------- 1. The warning: everyone has read it ---------- */
function Warn({t}: {t: number}) {
  const shift = prog(t, T.w4, 1.0, inOutCubic);
  const first = t < T.w2 + 0.1;
  return <div className="wl-stage">
    <Between t={t} a={0.3} b={T.w2 - 0.1}>
      <h2 className="wl-line"><KText text="YOU ALREADY KNOW THIS." t={t} t0={0.7} per={0.035}/></h2>
    </Between>
    {!first && <>
      <div className="wl-slide" style={{transform: `translateX(${-shift * 22}vw) scale(${1 - shift * 0.4})`}}>
        <Warning t={t} t0={T.w2 + 0.1} words="SCROLLING FOR HOURS IS BAD FOR YOU."/>
      </div>
      {shift > 0 && <Pack t={t} t0={T.w4 + 0.3}/>}
    </>}
  </div>;
}

/* ---------- 2. The gap: a thought is slow, a habit is fast ---------- */
function Gap({t}: {t: number}) {
  const cols = prog(t, T.g2 + 0.1, 0.9);
  const thought = 0.4 * clamp((t - T.g3) / (T.g4 - T.g3));
  const burst = t < T.g4 ? outCubic(((t - T.g3) / 0.42) % 1) * (t > T.g3 ? 1 : 0) : 1;
  const moved = prog(t, T.g4, 0.45);
  return <div className="wl-stage">
    <Between t={t} a={T.g1 - 0.1} b={T.g2 - 0.1}>
      <h2 className="wl-line big"><KText text="WHY DOESN'T KNOWING CHANGE ANYTHING?" t={t} t0={T.g1} per={0.022}/></h2>
    </Between>
    {t >= T.g2 && <div className="wl-gap">
      <div className="gp-col" style={{opacity: cols, transform: `translateX(${(1 - cols) * -8}vw)`}}>
        <h3 className="gp-h dim">KNOWING</h3>
        {t > T.g2 + 1.2 && <p className="gp-tag"><KText text="A THOUGHT" t={t} t0={T.g2 + 1.2}/></p>}
        <div className="gp-bar"><b style={{transform: `scaleX(${prog(t, T.g3, 0.01) ? thought : 0})`, background: 'var(--dim)'}}/></div>
        {t > T.g4 && <p className="gp-note" style={{opacity: moved}}>STILL THINKING</p>}
      </div>
      <svg className="gp-link" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
        <line x1="2" y1="5" x2="98" y2="5" stroke="var(--dim)" strokeWidth="3" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" pathLength="1" style={{strokeDasharray: '0.04 0.03', clipPath: `inset(0 ${(1 - prog(t, T.g2 + 0.5, 1.1)) * 52}% 0 0)`}}/>
      </svg>
      <div className="gp-col right" style={{opacity: cols, transform: `translateX(${(1 - cols) * 8}vw)`}}>
        <h3 className="gp-h">DOING</h3>
        {t > T.g2 + 2.4 && <p className="gp-tag"><KText text="A HABIT" t={t} t0={T.g2 + 2.4}/></p>}
        <div className="gp-bar hot"><b style={{transform: `scaleX(${t < T.g3 ? 0 : burst})`}}/></div>
        {t > T.g4 && <p className="gp-note hot" style={{opacity: moved, transform: `scale(${1 + (1 - moved) * 0.3})`}}>ALREADY MOVED</p>}
      </div>
    </div>}
  </div>;
}

/* ---------- 3. The feed: built to keep the habit going ---------- */
function Feed({t, rel, count, thumbY, phase}: {t: number; rel: number; count: number; thumbY: number; phase: number}) {
  const rise = prog(t, T.f1 - 0.1, 1.0);
  const slot = ['NOTHING', 'NOTHING', 'GREAT', 'NOTHING', 'GREAT', 'NOTHING', 'NOTHING', 'GREAT'][Math.floor(Math.max(0, t - T.f4) / 0.6) % 8];
  const mins = 10 + countUp(t, T.f6 + 0.7, 50, 2.6);
  const all: {at: number; key: string; node: ReactNode}[] = [
    {at: T.f2, key: 'clock', node: <KText text="NO CLOCK" t={t} t0={T.f2} />},
    {at: T.f2 + 2.1, key: 'page', node: <KText text="NO LAST PAGE" t={t} t0={T.f2 + 2.1} />},
    {at: T.f3, key: 'load', node: <><KText text="NEXT ONE LOADING" t={t} t0={T.f3} /><span className="ch-bar"><b style={{transform: `scaleX(${((t - T.f3) * 0.8) % 1})`}}/></span></>},
    {at: T.f4, key: 'slot', node: <span className={`ch-slot ${slot === 'GREAT' ? 'win' : ''}`}>{slot}</span>},
    {at: T.f4 + 4.4, key: 'which', node: <KText text="NEVER KNOWING WHICH" t={t} t0={T.f4 + 4.4} />},
    {at: T.f5, key: 'dia', node: <><span className="ch-dot"/><KText text="DIYA SENT YOU A REEL" t={t} t0={T.f5} /></>},
    {at: T.f6, key: 'time', node: <span>{mins >= 60 ? '1 HOUR' : `${mins} MIN`}</span>},
  ];
  const shown = all.filter(c => t >= c.at).slice(-4);
  return <div className="wl-stage feed">
    <div className="wl-left" style={{opacity: rise}}>
      <span className="display">REEL</span>
      <b className="display num" style={{transform: `scale(${1 + (1 - phase) * 0.06})`}}>{count}</b>
    </div>
    <div className="wl-mid" style={{transform: `translateY(${(1 - rise) * 40}vh)`, opacity: rise}}>
      <ReelPhone k={count}/>
      <div className="wl-thumb" style={{transform: `translateY(${thumbY}vh)`}}><Finger/></div>
    </div>
    <ul className="wl-chips">
      {shown.map((c, i) => {
        const r = shown.length - 1 - i;
        const q = prog(t, c.at, 0.6);
        return <li key={c.key} className={`chip ${c.key}`} style={{opacity: q * [1, .8, .55, .28][r], transform: `translateX(${(1 - q) * 6}vw)`}}>{c.node}</li>;
      })}
    </ul>
  </div>;
}

/* ---------- 4. The split: you know, and you do it anyway ---------- */
function Split({t, rel, count, thumbY, reels, got, total}: {t: number; rel: number; count: number; thumbY: number; reels: number; got: number; total: number}) {
  const dim = 1 - 0.7 * prog(t, T.s5, 0.8);
  const quiet = prog(t, T.s5, 0.8);
  return <div className="wl-stage split">
    <div className="sp-side left" style={{opacity: dim}}>
      <Warning t={t} t0={T.s1 + 0.2} words="SCROLLING FOR HOURS IS BAD FOR YOU." small/>
      {t > T.s2 && <h3 className="sp-cap"><KText text="YOU KNOW." t={t} t0={T.s2}/></h3>}
    </div>
    <div className="sp-div" aria-hidden="true" style={{transform: `scaleY(${prog(t, T.s1, 0.8)})`}}/>
    <div className="sp-side right" style={{opacity: dim}}>
      <div className="wl-mid" style={{position: 'relative'}}>
        <ReelPhone k={count} size="mid"/>
        <div className="wl-thumb small" style={{transform: `translateY(${thumbY * 0.6}vh)`}}><Finger/></div>
      </div>
      {t > T.s2 + 1.1 && <h3 className="sp-cap hot"><KText text="YOU DO IT ANYWAY." t={t} t0={T.s2 + 1.1}/></h3>}
    </div>
    <div className="sp-over">
      <Between t={t} a={T.s3 + 0.3} b={T.s4 - 0.2}>
        <p className="sp-not">NOT BECAUSE YOU'RE <span className="w"><Strike t={t} t0={T.s3 + 1.5}><KText text="WEAK" t={t} t0={T.s3 + 0.9}/></Strike></span>,
          <br/>NOT BECAUSE YOU <span className="w"><Strike t={t} t0={T.s3 + 2.9}><KText text="DON'T CARE" t={t} t0={T.s3 + 2.3}/></Strike></span></p>
      </Between>
      <Between t={t} a={T.s4} b={T.s5 - 0.2}>
        <p className="sp-ne"><KText text="KNOWING ≠ STOPPING" t={t} t0={T.s4 + 0.9} per={0.04}/></p>
      </Between>
      {t >= T.s5 && <div className="sp-yours" style={{opacity: quiet}}>
        <p><b className="display num">{reels > 0 ? countUp(t, T.s5 + 0.4, reels, 1.4) : 0}</b> {reels === 1 ? 'REEL' : 'REELS'} WATCHED</p>
        <p><b className="display num hot">{countUp(t, T.s5 + 2.2, got, 1.0)}</b> OF {total} REMEMBERED</p>
      </div>}
    </div>
  </div>;
}

/* ---------- 5. The still: the one moment before the thumb moves ---------- */
function Still({t}: {t: number}) {
  const pulse = ((t - T.t3) % 2.4) / 2.4;
  const ring = prog(t, T.t3, 0.8);
  return <div className="wl-stage still">
    <div className="st-text">
      <Between t={t} a={T.t1} b={T.t2 - 0.1}>
        <h2 className="wl-line"><Strike t={t} t0={T.t1 + 1.6}><KText text="KNOW MORE" t={t} t0={T.t1 + 0.2}/></Strike></h2>
      </Between>
      <Between t={t} a={T.t2} b={T.t4 - 0.1}>
        <h2 className="wl-line mid"><KText text="NOTICE THE MOMENT BEFORE YOUR THUMB MOVES" t={t} t0={T.t2 + 0.1} per={0.02}/></h2>
      </Between>
      <Between t={t} a={T.t4} b={T.t5 - 0.1}>
        <h2 className="wl-line"><KText text="KNOWING CAN STILL WIN" t={t} t0={T.t4 + 0.1} per={0.03}/></h2>
      </Between>
      {t >= T.t5 && <>
        <h2 className="wl-line final"><KText text="NOTICE THAT MOMENT." t={t} t0={T.t5 + 0.1} per={0.05} dur={0.9}/></h2>
        <div className="wl-brand" style={{opacity: prog(t, T.t5 + 1.6, 1.0)}}><Logo height={76}/></div>
      </>}
    </div>
    {t >= T.t3 && <div className="st-ring" style={{opacity: ring}} aria-hidden="true">
      {!reduced && <i style={{transform: `scale(${1 + pulse * 1.1})`, opacity: (1 - pulse) * 0.7}}/>}
      <u/>
      <div className="st-thumb" style={{transform: `translateY(${Math.sin((t - T.t3) * 1.3) * 0.8}vh)`}}><Finger/></div>
    </div>}
  </div>;
}

import {useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject} from 'react';
import {copy} from '../copy';
import {HOLD_MS} from '../input/gestures';
import {isStopKeyHeld, onClick, onLike, onSwipe, useInput} from '../input/input';
import {sfx} from '../sound';
import {emptyStats, type SessionStats} from '../session';
import {Comment, Finger, Heart, Avatar, Bell, Share} from '../ui/icons';
import {Scene, sceneFor} from '../reels/scenes';
import {INFO} from '../reels/content';
import '../reels/reels.css';

// ?scene=N pins every reel to one scene, for design review.
const FORCED = (() => { const v = new URLSearchParams(location.search).get('scene'); return v === null ? undefined : Number(v); })();
import {useDwell} from '../ui/hooks';

const STOP_HINT_S = 12, HARD_CAP_S = 90, FRAME_EVERY_MS = 600;

/** One short reel. Each is pure motion, no words. */
type Target = 'like' | 'comment' | 'share';
function Reel({n, state, liked, hover}: {n: number; state: 'enter' | 'leave' | 'still'; liked: boolean; hover: Target | null}) {
  return <div className={`reel v${n % 6} ${state === 'still' ? '' : state}`} aria-hidden="true">
    <Scene n={n} forced={FORCED}/>
    <div className={`rail ${liked ? 'liked' : ''}`}>
      <span className={`act ${hover === 'like' ? 'hover' : ''}`} data-target="like"><Heart/></span>
      <span className={`act ${hover === 'comment' ? 'hover' : ''}`} data-target="comment"><Comment/></span>
      <span className={`act ${hover === 'share' ? 'hover' : ''}`} data-target="share"><Share/></span>
    </div>
    <div className="byline"><Avatar/><div><b>@{INFO[sceneFor(n, FORCED)].handle}</b><span>{INFO[sceneFor(n, FORCED)].caption}</span></div></div>
  </div>;
}

type Burst = {id: number; kind: 'hit' | 'jackpot'};

export function Feed({video, onDone}: {video: RefObject<HTMLVideoElement | null>; onDone: (s: SessionStats, frames: string[]) => void}) {
  const {hand} = useInput();
  const [cur, setCur] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [likes, setLikes] = useState(0);
  const [pop, setPop] = useState(0);
  const [notif, setNotif] = useState(false);
  const [shake, setShake] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [likedReels, setLikedReels] = useState<number[]>([]);
  const [hearts, setHearts] = useState<number[]>([]);
  const [tip, setTip] = useState<'flick' | 'like' | null>('flick');
  const [hover, setHover] = useState<Target | null>(null);
  const [toast, setToast] = useState<{id: number; text: string} | null>(null);
  const [plane, setPlane] = useState(0);
  const curRef = useRef(0);
  const shownAt = useRef(performance.now());

  const stats = useRef(emptyStats());
  const frames = useRef<string[]>([]);
  const t0 = useRef(performance.now());
  const notifOpen = useRef(false);
  const nextNotifAt = useRef(7 + Math.random() * 3);
  const finished = useRef(false);
  const elapsedRef = useRef(0);

  const finish = useCallback(() => {
    if (finished.current) return; finished.current = true;
    stats.current.actual = (performance.now() - t0.current) / 1000;
    stats.current.seen.push({n: curRef.current, scene: sceneFor(curRef.current, FORCED), ms: performance.now() - shownAt.current});   // the reel on screen at the end
    onDone({...stats.current}, frames.current);
  }, [onDone]);

  const advance = useCallback(() => {
    if (finished.current) return;
    const s = stats.current;
    let opened = false;
    s.swipes++; sfx.swipe();
    const at = (performance.now() - t0.current) / 1000;
    s.events.push({t: at, kind: 'swipe'});
    if (notifOpen.current) { opened = true; s.notifs++; s.events.push({t: at, kind: 'notif'}); notifOpen.current = false; setNotif(false); }

    // Scrolling never likes anything. Likes come only from a pinch (or the heart), see `like` below.
    setTip(t => t === 'flick' ? 'like' : t);
    s.seen.push({n: curRef.current, scene: sceneFor(curRef.current, FORCED), ms: performance.now() - shownAt.current});
    shownAt.current = performance.now();
    setCur(c => { setPrev(c); curRef.current = c + 1; return c + 1; });
    setTimeout(() => setPrev(null), 340);
  }, []);

  useEffect(() => onSwipe(() => advance()), [advance]);

  // Cursor hover: which phone button is the fingertip over?
  const targetAt = useCallback((p: {x: number; y: number}): Target | null => {
    const px = p.x * window.innerWidth, py = p.y * window.innerHeight, pad = window.innerHeight * .012;
    let best: Target | null = null, bestD = Infinity;
    document.querySelectorAll<HTMLElement>('.phone .reel:not(.leave) [data-target]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (px < r.left - pad || px > r.right + pad || py < r.top - pad || py > r.bottom + pad) return;
      const d = Math.hypot(px - (r.left + r.right) / 2, py - (r.top + r.bottom) / 2);
      if (d < bestD) { bestD = d; best = el.dataset.target as Target; }
    });
    return best;
  }, []);
  useEffect(() => { setHover(hand.present ? targetAt({x: hand.x, y: hand.y}) : null); }, [hand.x, hand.y, hand.present, cur, targetAt]);

  const showToast = useCallback((text: string) => {
    const id = performance.now(); setToast({id, text});
    setTimeout(() => setToast(t => t && t.id === id ? null : t), 1700);
  }, []);

  const like = useCallback(() => {
    if (finished.current) return;
    const s = stats.current; s.hearts++; s.likes += 1; setLikes(s.likes); setPop(p => p + 1);
    s.events.push({t: (performance.now() - t0.current) / 1000, kind: 'like'});
    s.liked.push(curRef.current);
    setLikedReels(r => [...r.slice(-6), curRef.current]);
    const id = performance.now();
    setHearts(h => [...h.slice(-2), id]); setTimeout(() => setHearts(h => h.filter(x => x !== id)), 900);
    setBursts(b => [...b.slice(-3), {id, kind: 'hit'}]); setTimeout(() => setBursts(b => b.filter(x => x.id !== id)), 1700);
    setTip(t => t === 'like' ? null : t);
    sfx.like();
  }, []);
  const share = useCallback(() => { if (finished.current) return; stats.current.shares++; setPlane(p => p + 1); showToast(copy.feed.shared); sfx.lock(); }, [showToast]);
  const comment = useCallback(() => { if (finished.current) return; stats.current.comments++; showToast(copy.feed.commented); sfx.lock(); }, [showToast]);

  // A pinch (or mouse click) on a button does that thing. A pinch anywhere else on the reel is a like.
  useEffect(() => onClick(p => {
    const ph = document.querySelector('.phone')?.getBoundingClientRect();
    const px = p.x * window.innerWidth, py = p.y * window.innerHeight;
    if (!ph || px < ph.left || px > ph.right || py < ph.top || py > ph.bottom) return;
    const t = targetAt(p);
    if (t === 'share') share(); else if (t === 'comment') comment(); else like();
  }), [targetAt, like, share, comment]);
  useEffect(() => onLike(like), [like]);

  // Clock, notifications and the mirror-moment frame capture. Reels never advance on their own: they loop until you flick.
  useEffect(() => {
    let lastFrame = 0;
    const timer = setInterval(() => {
      const now = performance.now(), e = (now - t0.current) / 1000;
      elapsedRef.current = e; setElapsed(e);
      if (e >= HARD_CAP_S) { finish(); return; }
      if (e > nextNotifAt.current && !notifOpen.current) {
        notifOpen.current = true; setNotif(true); sfx.notif();
        setTimeout(() => { notifOpen.current = false; setNotif(false); }, 4000);
        nextNotifAt.current = e + 8 + Math.random() * 4;
      }
      const v = video.current;
      if (v && v.readyState >= 2 && now - lastFrame > FRAME_EVERY_MS && frames.current.length < 120) {
        lastFrame = now;
        const c = document.createElement('canvas'); c.width = 240; c.height = 180;
        c.getContext('2d')?.drawImage(v, 0, 0, 240, 180);
        frames.current.push(c.toDataURL('image/jpeg', .55));
      }
    }, 100);
    return () => clearInterval(timer);
  }, [finish, video]);

  // No clock, no goal: the only way out is to hold the finger still.
  const canStop = elapsed >= STOP_HINT_S;
  const holding = canStop && ((hand.present && hand.pointing && hand.steady) || isStopKeyHeld());
  const stop = useDwell(holding, HOLD_MS, finish);

  const burstDots = useMemo(() => Array.from({length: 8}, (_, i) => ({dx: `${Math.cos(i / 8 * 6.28) * 90 + (i % 2 ? 20 : -20)}px`, dy: `${-60 - (i * 23) % 120}px`})), []);

  return <section className="feed" aria-label="Scrolling">
    <div className={`phone ${shake ? 'shake' : ''}`}>
      {prev !== null && <Reel key={prev} n={prev} state="leave" liked={likedReels.includes(prev)} hover={null}/>}
      <Reel key={cur} n={cur} state={cur > 0 ? 'enter' : 'still'} liked={likedReels.includes(cur)} hover={hover}/>
      {hearts.map(id => <Heart key={id} className="bigheart"/>)}
      {plane > 0 && <Share key={`pl${plane}`} className="plane"/>}
      {toast && <div className="toast" key={toast.id} role="status">{toast.text}</div>}
      {tip && !notif && !toast && <div className="tip" key={tip} role="status"><Finger className={tip === 'flick' ? 'flick' : 'tap'}/><span className="display">{tip === 'flick' ? copy.feed.flick : copy.feed.pinch}</span></div>}
      {notif && <div className="notif" role="status"><Avatar/><span>{copy.feed.notif}</span><Bell size={22}/><i className="dot"/></div>}
      {bursts.map(b => b.kind === 'jackpot'
        ? <div key={b.id}><div className="flash"/><div className="confetti">{Array.from({length: 26}, (_, i) => <i key={i} style={{'--x': `${(i * 37) % 100}%`, '--c': (i * 53) % 360, '--d': `${(i % 9) * .06}s`} as CSSProperties}/>)}</div></div>
        : <div key={b.id} className="burst">{burstDots.map((d, i) => <Heart key={i} style={{'--dx': d.dx, '--dy': d.dy} as CSSProperties}/>)}</div>)}
    </div>

    <div className={`hud-likes ${pop ? 'pop' : ''}`} key={`l${pop}`}>
      <Heart/><span className="display t64 num">{likes.toLocaleString('en-US')}</span>
    </div>

    {canStop && <div className="stop" role="status">
      <div className="how"><Finger/><span>{copy.feed.stopHow}</span></div>
      <div className="bar"><i style={{width: `${stop * 100}%`}}/></div>
    </div>}
  </section>;
}

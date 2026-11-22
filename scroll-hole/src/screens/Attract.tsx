import type {CSSProperties} from 'react';
import {useEffect} from 'react';
import {copy} from '../copy';
import {onConfirm, onSwipe, useInput} from '../input/input';
import {useDwell} from '../ui/hooks';
import {Finger} from '../ui/icons';

/** Reels drift down the far edges only, so nothing crosses the words in the middle. */
const FALL = Array.from({length: 6}, (_, i) => ({h: (i * 61 + 10) % 360, x: [-42, 40, -36, 44, -46, 36][i], r: [-18, 14, -8, 22, -24, 10][i], d: i * .7}));

/** Idle screen: one line to read, one thing to do. A pointing finger (or space / click) begins. */
export function Attract({onStart}: {onStart: () => void}) {
  const {hand, camera} = useInput();
  useEffect(() => { const a = onSwipe(onStart), b = onConfirm(onStart); return () => { a(); b(); }; }, [onStart]);
  useDwell(hand.source === 'hand' && hand.pointing, 3000, onStart, 400);
  return <section className="center attract" aria-label="Scroll Hole">
    {FALL.map((f, i) => <i key={i} className="fall" aria-hidden="true" style={{'--h': f.h, '--x': f.x, '--r': `${f.r}deg`, '--d': `${f.d}s`} as CSSProperties}/>)}
    <div className="scrim" aria-hidden="true"/>
    <div className="hand" aria-hidden="true"><Finger/></div>
    <h1 className="display t64">{copy.attract.title}</h1>
    <p className="lede">{camera === 'denied' ? copy.attract.startKeys : copy.attract.start}</p>
    {camera === 'denied' && <p className="hint">{copy.attract.camOff}</p>}
  </section>;
}

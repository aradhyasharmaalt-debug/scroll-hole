import {useEffect, useState} from 'react';
import {copy} from '../copy';

/** The gut-punch: a sped-up replay of your own face while you scrolled. Frames live in memory only. */
export function Mirror({frames, onDone}: {frames: string[]; onDone: () => void}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (frames.length < 3) { onDone(); return; }
    const step = Math.max(50, Math.min(110, 5000 / frames.length));
    const t = setInterval(() => setI(n => (n + 1) % frames.length), step);
    const end = setTimeout(onDone, Math.min(5500, frames.length * step * 1.4 + 1200));
    return () => { clearInterval(t); clearTimeout(end); };
  }, [frames, onDone]);
  if (frames.length < 3) return null;
  return <section className="center mirror">
    <img src={frames[i]} alt="Your face while you scrolled, sped up"/>
    <h2 className="display t64">{copy.mirror.title}</h2>
  </section>;
}

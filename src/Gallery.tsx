import {describe, SUPPORT} from './frames';
import {LOOKS} from './reels/kit';
import {Scene, lookFor} from './reels/scenes';
import type {Mod, Variant} from './reels/variant';
import './styles/tokens.css';
import './styles/app.css';

/** Design review only (open /?gallery=0 to /?gallery=10): the real frame and every fake it can produce. */
export function Gallery({scene}: {scene: number}) {
  const n = 3, real = lookFor(n, scene);
  const alt = LOOKS.find(l => l.shirt !== real.shirt && l.pants !== real.pants)!;
  const make = (m: Mod): Variant => m === 'night' || m === 'sunset' || m === 'day' ? {sky: m} : m === 'prop' ? {prop: true} : m === 'paint' ? {paint: true} : m === 'more' ? {people: 'more'} : m === 'fewer' ? {people: 'fewer'}
    : {look: {...real, shirt: alt.shirt, pants: alt.pants}, hat: true};
  const variants: [string, Variant][] = [['The real one', {}], ...SUPPORT[scene].map(m => [describe(m, scene), make(m)] as [string, Variant])];
  return <main style={{position: 'relative', height: '100%', overflow: 'auto', padding: '2vh 2vw'}}>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: '1.6vh 1.4vw', justifyContent: 'center'}}>
      {variants.map(([label, v]) => <figure key={label} style={{display: 'grid', gap: '.5vh', justifyItems: 'center'}}>
        <div className="shot" style={{height: '30vh', cursor: 'default'}}><div className="shotframe"><Scene n={n} forced={scene} variant={v}/></div></div>
        <figcaption className="hint" style={{textTransform: 'none', maxWidth: '18vh', textAlign: 'center'}}>{label}</figcaption>
      </figure>)}
    </div>
  </main>;
}

import {useId, type ReactNode} from 'react';
import {C, Cloud, Dog, LOOKS, Person, Skyline, type Look} from './kit';
import type {Variant} from './variant';

type SceneProps = {look: Look; look2: Look; v: Variant};
/** The drawing surface. Variant flags switch tagged parts on or off: data-prop (big scenery) and data-sun. */
const Frame = ({children, label, v}: {children: ReactNode; label: string; v: Variant}) =>
  <svg className={`scene ${v.prop ? 'noprop' : ''} ${v.sky ? `sky-${v.sky}` : ''}`}
    viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>{children}</svg>;

/** A cap on or off the main person. `def` is whether they wear one in the real reel; the variant flips it. */
const capFor = (v: Variant, def: boolean, color: string) => (v.hat ? !def : def) ? {hair: 'cap' as const, cap: color} : {hair: 'short' as const};

const STARS: [number, number, number][] = [[40, 60, 2.2], [92, 130, 1.6], [150, 44, 2], [212, 100, 1.6], [326, 56, 2.2], [284, 150, 1.6], [64, 214, 1.6], [180, 190, 1.4], [330, 220, 1.6], [120, 276, 1.4]];
/**
 * A different time of day, drawn: night (dusk-blue wash, a moon, stars), sunset (an orange wash and a low orange sun) or bright
 * day (a blue wash, a white sun, clouds). It tints everything painted before it down to the horizon `hy`; put it just before the
 * people so they stay in front. `at` is where the sun is in the real reel.
 */
function SkyTint({v, at, hy, indoor, glows}: {v: Variant; at: [number, number]; hy: number; indoor?: boolean; glows?: [number, number][]}) {
  const id = useId().replace(/:/g, '');
  if (!v.sky) return null;
  const h = indoor ? 640 : hy;
  if (v.sky === 'sunset') return <g aria-hidden="true"><rect width="360" height={h} fill="#ff7a2e" opacity={indoor ? .4 : .45}/>{!indoor && <circle cx={at[0]} cy={hy - 150} r="52" fill="#ff5a1f" opacity=".95"/>}</g>;
  if (v.sky === 'day') return <g aria-hidden="true"><rect width="360" height={h} fill={indoor ? '#e8f5ff' : '#6fc8ff'} opacity={indoor ? .55 : .55}/>
    {!indoor && <><circle cx={at[0]} cy={Math.max(56, at[1] - 40)} r="26" fill="#fff8c8"/><Cloud x={70} y={100} s={1.1}/><Cloud x={250} y={170} s={.9}/></>}</g>;
  return <g aria-hidden="true">
    <rect width="360" height="640" fill="#101650" opacity=".64"/>
    {indoor
      ? (glows ?? []).map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="38" fill="#ffd36b" opacity=".22"/><circle cx={x} cy={y} r="10" fill="#fff0b0"/></g>)
      : <>{STARS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff6d6" opacity=".95"/>)}
        <mask id={`m${id}`}><rect width="360" height="640" fill="#fff"/><circle cx={at[0] + 10} cy={at[1] - 7 - 40} r="24" fill="#000"/></mask>
        <circle cx={at[0]} cy={at[1] - 40} r="26" fill="#f8efc4" mask={`url(#m${id})`}/></>}
  </g>;
}

const Tile = ({cls, children}: {cls: string; children: ReactNode}) => <g className={cls}><g>{children}</g><g transform="translate(360 0)">{children}</g></g>;

/* 1. Gully cricket at sunset */
function Cricket({look, look2, v}: SceneProps) {
  return <Frame v={v} label="Kids playing gully cricket">
    <rect width="360" height="640" fill="#f9d8a6"/><rect y="250" width="360" height="230" fill="#f3b66f"/>
    <circle data-sun cx="238" cy="262" r="54" fill="#ee8a4b"/>
    <Skyline y="452" fill="#c9794f" windows="#f9d8a6" items={[[0, 60, 120], [64, 48, 170], [116, 70, 100], [196, 54, 150], [256, 50, 112], [310, 56, 140]]}/>
    <rect y="460" width="360" height="180" fill={C.sand}/><rect y="460" width="360" height="7" fill={C.sandDark}/>
    <g data-prop><rect x="200" y="322" width="160" height="140" fill={C.brick}/>
    {[346, 370, 394, 418, 442].map(y => <line key={y} x1="200" x2="360" y1={y} y2={y} stroke="#c15f48" strokeWidth="3"/>)}
    {[322, 331, 340].map(x => <line key={x} x1={x} x2={x} y1="368" y2="460" stroke={C.cream} strokeWidth="5" strokeLinecap="round"/>)}
    <line x1="318" x2="344" y1="368" y2="368" stroke={C.cream} strokeWidth="4" strokeLinecap="round"/></g>
    <line x1="60" x2="300" y1="462" y2="462" stroke={C.cream} strokeWidth="3" strokeDasharray="10 8" opacity=".6"/>
    <SkyTint v={v} at={[238, 262]} hy={460}/>
    {v.people !== 'fewer' && <Person x={92} y={478} look={look} {...capFor(v, false, C.marigold)} legs="walk" speed={.5} amp={16} armR="swingr" armL="bowl"/>}
    {v.people === 'more' && <><Person x={160} y={470} s={1.25} look={LOOKS[3]} hair="cap" cap={C.marigold} head="nod" speed={2} amp={3}/><Person x={214} y={474} s={1.15} look={LOOKS[5]} hair="cap" cap={C.leaf} head="nod" speed={2.3} amp={3}/></>}
    <Person x={262} y={478} flip look={look2} hair="cap" cap={C.indigo} armL="bat" armR="bat" handL={<g><rect x="-3.5" y="0" width="7" height="42" rx="3" fill="#d9a35f"/><rect x="-2" y="-12" width="4" height="14" fill={C.ink}/></g>}/>
    <circle className="ball" r="7" fill={C.terracotta}/>
  </Frame>;
}

/* 2. Walking the dog down a street that scrolls past */
function DogWalk({look, v}: SceneProps) {
  const far = <Skyline y="430" fill="#b9cbd8" windows="#e9f4f8" items={[[0, 70, 150], [80, 60, 110], [150, 80, 170], [240, 56, 120], [300, 52, 140]]}/>;
  const mid = <g>{[40, 180, 300].map(x => <g key={x}><rect x={x - 3} y="360" width="6" height="110" rx="3" fill={C.brick}/><circle cx={x} cy="346" r="30" fill={C.darkLeaf}/><circle cx={x - 14} cy="358" r="20" fill={C.leaf}/></g>)}
    <rect x="108" y="338" width="5" height="132" fill={C.ink}/><rect x="96" y="332" width="30" height="8" rx="4" fill={C.ink}/></g>;
  return <Frame v={v} label="Person walking a dog">
    <rect width="360" height="640" fill={C.skyPale}/><circle data-detail data-sun cx="270" cy="150" r="34" fill="#ffe08a"/>
    <Cloud x={70} y={120} className="drift"/><Cloud x={220} y={210} s={.8} className="drift slow"/>
    <Tile cls="scroll-far">{far}</Tile><g data-prop><Tile cls="scroll-mid">{mid}</Tile></g>
    <rect y="470" width="360" height="170" fill="#d9d2c2"/><rect y="470" width="360" height="8" fill="#bdb4a0"/>
    <Tile cls="scroll-road"><g stroke="#bdb4a0" strokeWidth="3">{[0, 90, 180, 270].map(x => <line key={x} x1={x} x2={x + 40} y1="560" y2="560"/>)}</g></Tile>
    <SkyTint v={v} at={[270, 150]} hy={470}/>
    {v.people !== 'fewer' && <path d="M162 400 Q205 452 264 433" stroke={C.ink} strokeWidth="2.2" fill="none"/>}
    <Person x={118} y={480} look={look} {...capFor(v, false, C.terracotta)} legs="walk" speed={.62} armR="swingr" armLRest={-35}/>
    {v.people !== 'fewer' && <Dog x={238} y={482} flip={false} color={C.sandDark} patch={C.brick}/>}
    {v.people === 'more' && <Dog x={318} y={488} s={1.05} flip color={C.cream} patch={C.sandDark}/>}
  </Frame>;
}

/* 3. Kite on a rooftop */
function Kite({look, v}: SceneProps) {
  return <Frame v={v} label="Kid flying a kite from a rooftop">
    <rect width="360" height="640" fill="#8fd0e8"/><rect y="330" width="360" height="200" fill={C.skyPale}/>
    <circle data-sun cx="62" cy="120" r="30" fill="#ffe08a"/>
    <Cloud x={250} y={90} className="drift"/><Cloud x={130} y={300} s={.9} className="drift slow"/><Cloud x={300} y={380} s={.7} className="drift"/>
    <g className="bird"><path d="M0 0 q6 -7 12 0 q6 -7 12 0" stroke={C.ink} strokeWidth="2" fill="none" strokeLinecap="round"/></g>
    <g className="bird late"><path d="M0 0 q5 -6 10 0 q5 -6 10 0" stroke={C.ink} strokeWidth="2" fill="none" strokeLinecap="round"/></g>
    <g data-prop><g transform="translate(96 296)"><g className="sway">
      <path d="M0 0 Q70 -70 132 -196" stroke={C.ink} strokeWidth="1.6" fill="none"/>
      <g transform="translate(132 -196)"><g className="flutter">
        <path d="M0 -34 L22 -2 L0 36 L-22 -2Z" fill={C.marigold}/><path d="M0 -34 L22 -2 L0 6Z" fill={C.terracotta}/><path d="M0 -34 L-22 -2 L0 6Z" fill={C.pink}/>
        <line y1="-34" y2="36" stroke={C.ink} strokeWidth="1.2"/><line x1="-22" y1="-2" x2="22" y2="-2" stroke={C.ink} strokeWidth="1.2"/>
        <path className="tail" d="M0 36 q-10 14 0 26 q10 12 0 26 q-10 12 0 24" stroke={C.terracotta} strokeWidth="3" fill="none" strokeLinecap="round"/>
      </g></g>
    </g></g></g>
    <rect x="0" y="456" width="360" height="184" fill={C.terracotta}/><rect x="0" y="448" width="360" height="12" fill={C.brick}/>
    {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <rect key={i} x={i * 48 + 6} y="468" width="36" height="14" rx="2" fill={C.brick} opacity=".5"/>)}
    <g data-detail><rect x="236" y="372" width="64" height="78" rx="8" fill={C.deepTeal}/><rect x="228" y="366" width="80" height="12" rx="6" fill={C.teal}/></g>
    <SkyTint v={v} at={[62, 120]} hy={448}/>
    {v.people === 'more' && <Person x={188} y={456} s={1.25} look={LOOKS[3]} {...capFor(v, false, C.indigo)} hair="bun" head="nod" speed={2} amp={3}/>}
    <Person x={92} y={456} look={look} {...capFor(v, false, C.marigold)} armL="" armLRest={160} armR="swingr" amp={6} speed={1.6} head="nod"/>
  </Frame>;
}

/* 4. Chai stall */
function Chai({look, look2, v}: SceneProps) {
  return <Frame v={v} label="Chaiwala pouring tea">
    <rect width="360" height="640" fill={v.paint ? '#b7d3e6' : '#f3c9a6'}/><rect y="0" width="360" height="34" fill={v.paint ? '#6d8fb3' : '#c98462'}/>
    <g data-prop>{[26, 146, 266].map(x => <g key={x}><path d={`M${x} 214 v-72 a34 34 0 0 1 68 0 v72Z`} fill={C.deepTeal}/><path d={`M${x + 6} 214 v-70 a28 28 0 0 1 56 0 v70Z`} fill="#f9e4b4"/><line x1={x + 34} x2={x + 34} y1="112" y2="214" stroke={C.deepTeal} strokeWidth="3"/><rect x={x - 6} y="214" width="80" height="8" fill="#b9714f"/></g>)}</g>
    <g data-detail><path d="M0 68 Q90 112 180 78 T360 70" stroke={C.ink} strokeWidth="2" fill="none"/>
    {[[24, 86, C.marigold], [64, 98, C.pink], [104, 100, C.teal], [144, 92, C.terracotta], [184, 80, C.marigold], [224, 82, C.pink], [264, 84, C.teal], [304, 78, C.terracotta]].map(([x, y, c], i) => <path key={i} d={`M${x} ${y} l14 0 l-7 18Z`} fill={c as string} transform={`rotate(${i % 2 ? 5 : -5} ${x} ${y})`}/>)}</g>
    <rect y="470" width="360" height="170" fill={C.sandDark}/>
    <path d="M40 250 L320 250 L336 316 L24 316Z" fill={v.paint ? C.teal : C.terracotta}/>
    {[0, 1, 2, 3, 4, 5, 6].map(i => <path key={i} d={`M${24 + i * 44.6} 316 l22 0 l-6 -66 l-10 0 Z`} fill={i % 2 ? C.cream : C.terracotta} opacity={i % 2 ? .0 : 0}/>)}
    {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <path key={i} d={`M${24 + i * 39} 316 q19.5 20 39 0Z`} fill={i % 2 ? C.cream : C.marigold}/>)}
    <rect x="46" y="316" width="8" height="150" fill={C.ink}/><rect x="306" y="316" width="8" height="150" fill={C.ink}/>
    <Person x={168} y={470} look={look} {...capFor(v, false, C.ink)} armL="" armLRest={150} armR="" armRRest={14} head="nod" speed={2.2} amp={3}
      handL={<g transform="rotate(-150)"><g className="kettle"><ellipse cx="4" cy="-8" rx="17" ry="13" fill={C.grey}/><path d="M18 -10 L34 -2 L30 2 L16 -2Z" fill={C.grey}/><path d="M-12 -10 q4 -20 18 -6" stroke={C.ink} strokeWidth="3" fill="none"/></g></g>}/>
    <line className="stream" x1="192" x2="192" y1="318" y2="373" stroke="#c98a3b" strokeWidth="4" strokeLinecap="round"/>
    <rect x="70" y="378" width="224" height="94" rx="6" fill={v.paint ? C.brick : C.deepTeal}/><rect x="62" y="370" width="240" height="14" rx="7" fill={v.paint ? C.terracotta : C.teal}/>
    <rect x="182" y="354" width="22" height="18" rx="3" fill="#f4e3c1"/><rect x="183" y="364" width="20" height="8" fill="#c98a3b"/>
    <rect x="212" y="354" width="22" height="18" rx="3" fill="#f4e3c1"/><rect x="213" y="364" width="20" height="8" fill="#c98a3b"/>
    <path className="steam" d="M193 350 q-6 -10 0 -20 q6 -10 0 -20" stroke={C.white} strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path className="steam late" d="M223 350 q-6 -10 0 -20 q6 -10 0 -20" stroke={C.white} strokeWidth="3" fill="none" strokeLinecap="round"/>
    <ellipse cx="268" cy="364" rx="26" ry="8" fill={C.ink}/><path d="M244 364 q0 -26 24 -26 q24 0 24 26Z" fill={C.grey}/>
    <path className="steam" d="M268 334 q-7 -10 0 -20 q7 -10 0 -20" stroke={C.white} strokeWidth="3" fill="none" strokeLinecap="round"/>
    <SkyTint v={v} at={[0, 0]} hy={640} indoor glows={[[90, 100], [180, 104], [270, 96], [160, 300]]}/>
    {v.people !== 'fewer' && <Person x={40} y={548} s={1.4} look={look2} hair="bun" armR="" armL="" head="nod" speed={2.8} amp={2.5}/>}
    {v.people === 'more' && <><Person x={112} y={556} s={1.35} look={LOOKS[5]} armR="" armL="" head="nod" speed={2.4} amp={2.5}/><Person x={190} y={566} s={1.3} look={LOOKS[3]} hair="bun" armR="" armL="" head="nod" speed={2.1} amp={2.5}/></>}
  </Frame>;
}

/* 5. Rainy walk */
function Rain({look, v}: SceneProps) {
  const far = <Skyline y="440" fill="#3d6670" windows="#e9c46a" items={[[0, 64, 170], [70, 56, 120], [136, 70, 190], [214, 54, 130], [276, 70, 160]]}/>;
  const drops = Array.from({length: 26}, (_, i) => ({x: (i * 53) % 380, d: .7 + (i % 5) * .12, delay: -(i * .21) % 1.3, l: 14 + (i % 3) * 6}));
  return <Frame v={v} label="Person walking in the rain with an umbrella">
    <rect width="360" height="640" fill="#7fa3b5"/><rect y="300" width="360" height="200" fill="#9db8c4"/>
    <g data-prop><Tile cls="scroll-far">{far}</Tile></g>
    <rect y="470" width="360" height="170" fill="#4b5d68"/>
    <g data-detail><ellipse cx="90" cy="520" rx="46" ry="9" fill="#6b8ea8"/><ellipse cx="270" cy="545" rx="56" ry="10" fill="#6b8ea8"/></g>
    <ellipse className="ripple" cx="270" cy="545" rx="10" ry="3" fill="none" stroke={C.white} strokeWidth="1.5"/><ellipse className="ripple late" cx="90" cy="520" rx="10" ry="3" fill="none" stroke={C.white} strokeWidth="1.5"/>
    <SkyTint v={v} at={[270, 110]} hy={470}/>
    {v.people === 'more' && <Person x={300} y={530} s={1.1} look={LOOKS[2]} legs="walk" speed={.75} armR="swingr" amp={20} armLRest={130} extra={<g><line x1="-13.5" y1="-58" x2="-13.5" y2="-84" stroke={C.ink} strokeWidth="2.6"/><path d="M-58 -84 Q-13 -128 32 -84 Q16 -92 1 -84 Q-14 -92 -29 -84 Q-44 -92 -58 -84Z" fill={C.indigo}/></g>}/>}
    <Person x={176} y={500} look={look} {...capFor(v, false, C.marigold)} legs="walk" speed={.7} armR="swingr" amp={20} armLRest={130}
      extra={<g><line x1="-13.5" y1="-58" x2="-13.5" y2="-84" stroke={C.ink} strokeWidth="2.6"/><path d="M-58 -84 Q-13 -128 32 -84 Q16 -92 1 -84 Q-14 -92 -29 -84 Q-44 -92 -58 -84Z" fill={C.terracotta}/><path d="M-13 -84 L-13 -110" stroke="#b44a31" strokeWidth="2"/></g>}/>
    {drops.map((d, i) => <line key={i} className="drop" x1={d.x} y1="-30" x2={d.x - 6} y2={-30 + d.l} stroke="#e6f1f5" strokeWidth="2" strokeLinecap="round" style={{animationDuration: `${d.d}s`, animationDelay: `${d.delay}s`}}/>)}
  </Frame>;
}

/* 6. Auto-rickshaw */
function Rickshaw({look, v}: SceneProps) {
  const far = <Skyline y="440" fill="#c88a6a" windows="#f9d8a6" items={[[0, 70, 160], [76, 60, 110], [144, 84, 180], [236, 60, 130], [300, 56, 150]]}/>;
  const wheel = (cx: number) => <g transform={`translate(${cx} 498)`}><g className="spin"><circle r="26" fill={C.ink}/><circle r="12" fill={C.grey}/>{[0, 60, 120].map(a => <line key={a} x1="-12" x2="12" stroke={C.cream} strokeWidth="3" transform={`rotate(${a})`}/>)}</g></g>;
  return <Frame v={v} label="Auto-rickshaw driving through the city">
    <rect width="360" height="640" fill="#fbe0b0"/><circle data-detail data-sun cx="90" cy="200" r="44" fill="#f4a03a"/>
    <g data-prop><Tile cls="scroll-far">{far}</Tile></g>
    <rect y="500" width="360" height="140" fill="#4a4453"/><rect y="496" width="360" height="8" fill="#6a6474"/>
    <Tile cls="scroll-road"><g stroke={C.cream} strokeWidth="4" strokeLinecap="round">{[0, 120, 240].map(x => <line key={x} x1={x} x2={x + 56} y1="574" y2="574"/>)}</g></Tile>
    <SkyTint v={v} at={[90, 200]} hy={498}/>
    <g className="chug">
      <g transform="translate(70 330)">
        <path d="M0 40 L170 40 Q196 40 214 86 L226 134 L226 160 L0 160Z" fill={v.paint ? C.teal : C.marigold}/>
        <path d="M0 40 Q0 0 40 0 L150 0 Q176 0 188 40Z" fill={C.ink}/>
        <path d="M150 8 Q176 8 190 40 L152 40Z" fill="#bfe6ef"/>
        <rect x="10" y="44" width="136" height="50" rx="4" fill="#2a2433"/>
      </g>
      {v.people === 'more' && <Person x={104} y={470} s={.85} look={LOOKS[5]} hair="bun" head="nod" speed={1.8} amp={3}/>}
      <Person x={146} y={470} s={.92} look={look} head="nod" speed={1.3} amp={4} {...capFor(v, true, C.deepTeal)} armR="" armL="" armLRest={-30} armRRest={-30}/>
      <path d="M70 450 L296 450 L296 468 L70 468Z" fill={v.paint ? C.indigo : C.terracotta}/>
      <rect x="70" y="432" width="226" height="24" fill={v.paint ? C.cream : C.marigold}/>
      <circle cx="288" cy="470" r="8" fill="#fff6c4"/>
      {wheel(112)}{wheel(268)}
    </g>
    <circle className="dust" cx="50" cy="490" r="10" fill={C.cream} opacity=".6"/><circle className="dust late" cx="40" cy="496" r="7" fill={C.cream} opacity=".6"/>
  </Frame>;
}

/* 7. Rooftop dance at night */
function Dance({look, v}: SceneProps) {
  const stars = Array.from({length: 22}, (_, i) => ({x: (i * 97) % 350 + 6, y: (i * 61) % 300 + 14, d: (i % 5) * .5}));
  const note = (x: number, y: number, d: number, color: string) => <g className="note" style={{animationDelay: `${d}s`}} transform={`translate(${x} ${y})`}><g><ellipse cx="0" cy="0" rx="6" ry="4.5" fill={color} transform="rotate(-20)"/><line x1="5" y1="-1" x2="5" y2="-22" stroke={color} strokeWidth="2.4"/><path d="M5 -22 q8 2 8 10" stroke={color} strokeWidth="2.4" fill="none"/></g></g>;
  return <Frame v={v} label="Person dancing on a rooftop at night">
    <rect width="360" height="640" fill={C.night}/><rect y="260" width="360" height="220" fill="#2d2a58"/>
    {stars.map((s, i) => <circle key={i} className="star" cx={s.x} cy={s.y} r="1.6" fill={C.cream} style={{animationDelay: `${s.d}s`}}/>)}
    <g data-detail><circle cx="288" cy="96" r="30" fill="#f6e7b8"/><circle cx="300" cy="88" r="26" fill={C.night}/></g>
    <Skyline y="470" fill="#13122b" windows="#f4a03a" items={[[0, 54, 160], [58, 46, 110], [108, 66, 190], [200, 48, 130], [252, 60, 170], [316, 50, 120]]}/>
    <rect y="470" width="360" height="170" fill="#403a6e"/><rect y="466" width="360" height="8" fill="#5a5190"/>
    <path d="M0 330 Q90 372 180 340 T360 336" stroke={C.ink} strokeWidth="2" fill="none"/>
    {[[34, 345, C.marigold], [92, 361, C.pink], [150, 359, C.teal], [210, 347, C.marigold], [270, 338, C.pink], [330, 336, C.teal]].map(([x, y, col], i) => <circle key={i} className="bulb" cx={x as number} cy={y as number} r="6" fill={col as string} style={{animationDelay: `${i * .25}s`}}/>)}
    <SkyTint v={v} at={[288, 96]} hy={470}/>
    <g data-prop><rect x="34" y="394" width="54" height="76" rx="7" fill={C.ink}/><circle className="woofer" cx="61" cy="440" r="17" fill={C.grey}/><circle cx="61" cy="440" r="7" fill={C.ink}/><circle cx="61" cy="412" r="6" fill={C.grey}/></g>
    {note(110, 380, 0, C.marigold)}{note(240, 360, .9, C.pink)}{note(84, 350, 1.7, C.teal)}
    {v.people === 'more' && <g className="groove" style={{animationDelay: '-.2s'}}><Person x={266} y={478} s={1.35} look={{...LOOKS[4], shirt: C.cream, pants: C.indigo, shoe: C.pink}} hair="bun" armL="swingr" armR="swing" amp={55} speed={.45} head="nod" legs="" legA="hop" legB="hopr"/></g>}
    <g className="groove"><Person x={190} y={478} look={{...look, shirt: C.marigold, pants: C.cream, shoe: C.pink}} armL="swing" armR="swingr" amp={62} speed={.42} head="nod" legs="" legA="hopr" legB="hop"/></g>
  </Frame>;
}

/* 8. Football in the park */
function Football({look, look2, v}: SceneProps) {
  return <Frame v={v} label="Two kids passing a football">
    <rect width="360" height="640" fill="#bfe6ef"/><Cloud x={80} y={110} className="drift"/><Cloud x={260} y={190} s={.8} className="drift slow"/>
    <circle data-detail data-sun cx="300" cy="90" r="28" fill="#ffe08a"/>
    <g data-prop>{[30, 330].map(x => <g key={x}><rect x={x - 4} y="352" width="8" height="120" rx="4" fill={C.brick}/><circle cx={x} cy="338" r="40" fill={C.darkLeaf}/><circle cx={x - 20} cy="356" r="24" fill={C.leaf}/></g>)}</g>
    <rect y="462" width="360" height="180" fill={C.leaf}/>
    {[0, 1, 2, 3].map(i => <rect key={i} y={462 + i * 46} width="360" height="23" fill="#5f9a47"/>)}
    <rect y="460" width="360" height="6" fill={C.darkLeaf}/>
    <SkyTint v={v} at={[300, 90]} hy={462}/>
    <Person x={92} y={486} look={look} legB="kickA" legA="" armL="swing" armR="swingr" amp={14} speed={2.4} {...capFor(v, true, C.terracotta)}/>
    {v.people !== 'fewer' && <Person x={268} y={486} flip look={look2} legB="kickB" legA="" armL="swing" armR="swingr" amp={14} speed={2.4} hair="bun"/>}
    {v.people === 'more' && <><Person x={170} y={490} s={1.35} look={LOOKS[2]} hair="cap" cap={C.indigo} head="nod" speed={2} amp={3}/><Person x={214} y={496} s={1.2} look={LOOKS[4]} hair="bun" head="nod" speed={2.4} amp={3}/></>}
    <g className="football"><circle r="10" fill={C.white} stroke={C.ink} strokeWidth="2"/><path d="M0 -4 l4 3 -1.6 5 h-5 l-1.6 -5Z" fill={C.ink}/></g>
  </Frame>;
}

/* 9. Skipping rope in a courtyard */
function SkipRope({look, look2, v}: SceneProps) {
  const cloth = (x: number, c: string, d: number) => <g transform={`translate(${x} 206)`}><g className="cloth" style={{animationDelay: `${d}s`}}><rect x="-14" y="0" width="28" height="40" rx="3" fill={c}/><rect x="-14" y="0" width="28" height="8" fill={C.white} opacity=".5"/></g></g>;
  return <Frame v={v} label="Kids skipping rope">
    <rect width="360" height="640" fill="#bfe6ef"/><circle data-sun cx="290" cy="80" r="28" fill="#ffe08a"/><Cloud x={90} y={84} className="drift"/><Cloud x={220} y={120} s={.7} className="drift slow"/><rect y="150" width="360" height="322" fill="#eaa98c"/><rect y="150" width="360" height="12" fill="#c98462"/>
    <g data-prop>{[[34, 250], [270, 250]].map(([x, y]) => <g key={x}><rect x={x - 8} y={y} width="72" height="82" fill={C.deepTeal}/><rect x={x} y={y + 8} width="56" height="66" fill="#f9e4b4"/><line x1={x + 28} x2={x + 28} y1={y + 8} y2={y + 74} stroke={C.deepTeal} strokeWidth="3"/></g>)}
    <path d="M142 472 v-92 a38 38 0 0 1 76 0 v92Z" fill={C.indigo}/><path d="M150 472 v-90 a30 30 0 0 1 60 0 v90Z" fill="#2c3570"/><circle cx="198" cy="430" r="3" fill={C.marigold}/></g>
    <g data-detail><path d="M0 196 Q180 236 360 196" stroke={C.ink} strokeWidth="2" fill="none"/>
    {cloth(60, C.marigold, 0)}{cloth(112, C.pink, -.6)}{cloth(248, C.teal, -1.1)}{cloth(300, C.cream, -1.7)}</g>
    <rect y="470" width="360" height="170" fill="#d9c3a2"/><rect y="470" width="360" height="7" fill="#b99f78"/>
    <g stroke={C.cream} strokeWidth="3" fill="none" opacity=".7"><rect x="150" y="560" width="30" height="30"/><rect x="180" y="560" width="30" height="30"/><rect x="165" y="530" width="30" height="30"/></g>
    <SkyTint v={v} at={[290, 80]} hy={470}/>
    <Person x={62} y={478} look={look} {...capFor(v, false, C.indigo)} armLRest={-60} armRRest={-60} head="nod" speed={1.8} amp={4}/>
    <Person x={300} y={478} flip look={look2} hair="bun" armLRest={-60} armRRest={-60} head="nod" speed={2} amp={4}/>
    {v.people !== 'fewer' && <g className="jumper"><Person x={181} y={478} look={{...look, shirt: C.pink, pants: C.teal}} hair="bun" armL="swing" armR="swingr" amp={20} speed={.5} head="nod"/></g>}
    {v.people === 'more' && <><Person x={224} y={474} s={1.1} look={LOOKS[4]} hair="bun" head="nod" speed={2.2} amp={3}/><Person x={334} y={500} s={1.2} look={LOOKS[2]} head="nod" speed={2} amp={3}/></>}
    <path className="rope" d="M120 385 Q181 215 242 385" stroke={C.terracotta} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
  </Frame>;
}

/* 10. Pakora stall at blue hour */
function Pakora({look, v}: SceneProps) {
  const halo = (x: number, y: number, d: number) => <g key={x}><line x1={x} x2={x} y1="34" y2={y - 8} stroke={C.ink} strokeWidth="2"/><circle cx={x} cy={y} r="22" fill="#ffd36b" opacity=".22"/><circle className="glow" cx={x} cy={y} r="8" fill="#ffd36b" style={{animationDelay: `${d}s`}}/></g>;
  return <Frame v={v} label="Street vendor frying pakoras">
    <rect width="360" height="640" fill="#43498a"/><rect y="200" width="360" height="130" fill="#7a6fb0"/><rect y="320" width="360" height="160" fill="#f2a972"/>
    <Skyline y="470" fill="#2c2850" windows="#ffd36b" items={[[0, 62, 190], [66, 50, 130], [120, 70, 210], [196, 54, 150], [254, 66, 190], [324, 40, 120]]}/>
    <rect y="470" width="360" height="170" fill="#4a3f5e"/><rect y="466" width="360" height="8" fill="#5f5275"/>
    <g data-prop><path d="M24 78 L336 78 L350 140 L10 140Z" fill={v.paint ? C.indigo : C.brick}/>
    {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <path key={i} d={`M${10 + i * 42.5} 140 q21 18 42.5 0Z`} fill={i % 2 ? C.cream : C.marigold}/>)}</g>
    <g data-detail>{halo(70, 176, 0)}{halo(180, 184, .5)}{halo(290, 176, 1)}</g>
    <rect x="44" y="392" width="272" height="82" rx="6" fill={v.paint ? C.deepTeal : C.terracotta}/><rect x="36" y="384" width="288" height="14" rx="7" fill={v.paint ? C.cream : '#e6b873'}/>
    <rect x="62" y="354" width="22" height="30" rx="4" fill="#bfe6ef"/><rect x="90" y="360" width="22" height="24" rx="4" fill={C.pink}/><rect x="120" y="364" width="40" height="20" rx="3" fill={C.cream}/>
    {[198, 218, 238].map((x, i) => <path key={x} className="flame" d={`M${x} 410 q10 -26 0 -42 q22 16 14 42Z`} fill={i === 1 ? C.marigold : C.saffron} style={{animationDelay: `${i * .12}s`}}/>)}
    <path d="M182 366 Q236 440 290 366Z" fill={C.ink}/><ellipse cx="236" cy="366" rx="54" ry="9" fill="#d98a2b"/>
    {[[212, 0], [236, .25], [260, .5], [224, .75]].map(([x, d], i) => <g key={i} className="fry" style={{animationDelay: `${d}s`}}><circle cx={x as number} cy="362" r="9" fill="#c06a22"/><circle cx={(x as number) - 3} cy="360" r="2" fill="#8a4a18"/></g>)}
    {[216, 246].map((x, i) => <path key={x} className="steam" d={`M${x} 346 q-7 -10 0 -20 q7 -10 0 -20`} stroke={C.white} strokeWidth="3" fill="none" strokeLinecap="round" style={{animationDelay: `${-i * 1.1}s`}}/>)}
    <clipPath id="pk-cut"><rect x="0" y="0" width="360" height="392"/></clipPath>
    <SkyTint v={v} at={[0, 0]} hy={640} indoor glows={[[70, 176], [180, 184], [290, 176]]}/>
    {v.people === 'more' && <><Person x={298} y={558} s={1.35} look={LOOKS[1]} hair="bun" head="nod" speed={2.4} amp={2.5}/><Person x={226} y={566} s={1.3} look={LOOKS[4]} head="nod" speed={2.1} amp={2.5}/></>}
    <g clipPath="url(#pk-cut)"><Person x={138} y={470} look={look} {...capFor(v, true, C.ink)} armL="stir" armR="" armRRest={14} head="nod" speed={1.2} amp={3}
      handL={<g><line y2="30" stroke={C.ink} strokeWidth="3.5" strokeLinecap="round"/><circle cy="32" r="7" fill={C.grey}/></g>}/></g>
  </Frame>;
}

/* 11. Cycling past a cow */
function Cycle({look, v}: SceneProps) {
  const far = <Skyline y="440" fill="#cdd6a8" windows="#f2f7de" items={[[0, 70, 140], [78, 56, 100], [146, 80, 160], [236, 60, 120], [300, 52, 136]]}/>;
  const cow = <g data-prop transform="translate(262 482) scale(1.5)">
    <g className="swish"><path d="M44 -44 q10 6 8 30" stroke={C.cream} strokeWidth="5" fill="none" strokeLinecap="round"/><circle cx="52" cy="-12" r="4" fill={C.ink}/></g>
    {[-28, -14, 16, 30].map(x => <g key={x}><rect x={x - 4} y="-26" width="8" height="24" rx="3" fill="#efe6d2"/><rect x={x - 4} y="-5" width="8" height="5" rx="2" fill={C.ink}/></g>)}
    <ellipse cx="2" cy="-42" rx="44" ry="21" fill="#f6efe0"/><ellipse cx="-8" cy="-48" rx="14" ry="9" fill="#8a5a35"/><ellipse cx="22" cy="-38" rx="11" ry="8" fill="#8a5a35"/>
    <g transform="translate(-48 -48)"><path d="M0 -10 q-8 -8 -14 -6" stroke="#efe6d2" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <ellipse cx="-4" cy="2" rx="15" ry="13" fill="#f6efe0"/><ellipse cx="-14" cy="9" rx="9" ry="7" fill={C.pink}/><circle cx="-2" cy="-2" r="2" fill={C.ink}/><path d="M6 -10 q10 -4 14 4" stroke="#8a5a35" strokeWidth="5" fill="none" strokeLinecap="round"/></g>
  </g>;
  const mid = <g>{[[40, 'tree'], [262, 'cow']].map(([x, k]) => k === 'tree'
    ? <g key="t"><rect x={(x as number) - 4} y="372" width="8" height="106" rx="4" fill={C.brick}/><circle cx={x as number} cy="356" r="34" fill={C.darkLeaf}/><circle cx={(x as number) - 16} cy="370" r="22" fill={C.leaf}/></g>
    : <g key="c">{cow}</g>)}</g>;
  const wheel = (cx: number) => <g transform={`translate(${cx} -26)`}><g className="spin"><circle r="25" fill="none" stroke={C.ink} strokeWidth="4"/>{[0, 60, 120].map(a => <line key={a} x1="-25" x2="25" stroke={C.grey} strokeWidth="1.8" transform={`rotate(${a})`}/>)}</g></g>;
  return <Frame v={v} label="Kid cycling past a cow">
    <rect width="360" height="640" fill="#e6f2c9"/><circle data-detail data-sun cx="84" cy="150" r="36" fill="#ffd36b"/>
    <Cloud x={250} y={130} className="drift"/>
    <Tile cls="scroll-far">{far}</Tile><Tile cls="scroll-mid">{mid}</Tile>
    <rect y="478" width="360" height="162" fill="#9c9588"/><rect y="474" width="360" height="8" fill="#b8b2a4"/>
    <Tile cls="scroll-road"><g stroke="#d8d2c2" strokeWidth="4" strokeLinecap="round">{[0, 120, 240].map(x => <line key={x} x1={x} x2={x + 50} y1="566" y2="566"/>)}</g></Tile>
    <SkyTint v={v} at={[84, 150]} hy={478}/>
    <g transform="translate(125 480)">
      {wheel(-34)}{wheel(34)}
      <g stroke={C.terracotta} strokeWidth="4.5" strokeLinecap="round" fill="none"><path d="M0 -22 L-12 -58 M-12 -58 L-34 -26 M0 -22 L-34 -26 M0 -22 L24 -58 M24 -58 L34 -26 M-12 -58 L24 -58 M24 -58 L27 -70"/></g>
      <rect x="-20" y="-62" width="16" height="5" rx="2.5" fill={C.ink}/><line x1="22" x2="34" y1="-70" y2="-72" stroke={C.ink} strokeWidth="4" strokeLinecap="round"/>
      <g transform="translate(0 -22)"><g className="spin slowspin"><line y1="-10" y2="10" stroke={C.ink} strokeWidth="3.5" strokeLinecap="round"/></g></g>
    </g>
    <Person x={113} y={466} s={1.15} look={look} legs="walk" speed={.55} amp={30} armLRest={-45} armRRest={-45} head="nod" {...capFor(v, true, C.marigold)}/>
  </Frame>;
}

const SCENES = [Cricket, DogWalk, Kite, Chai, Rain, Rickshaw, Dance, Football, SkipRope, Pakora, Cycle];
export const SCENE_COUNT = SCENES.length;

/** Reels come in a shuffled deck so two of the same scene never play back to back. */
const deck: number[] = [];
function extend() {
  const d = Array.from({length: SCENES.length}, (_, i) => i);
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
  if (deck.length && d[0] === deck[deck.length - 1]) [d[0], d[1]] = [d[1], d[0]];
  deck.push(...d);
}
export function sceneFor(n: number, forced?: number): number { if (forced !== undefined) return forced % SCENES.length; while (deck.length <= n) extend(); return deck[n]; }

/** The look of the main person in reel n, so the quiz can ask about the same shirt the visitor saw. */
export const lookFor = (n: number, scene: number) => LOOKS[(n * 5 + scene) % LOOKS.length];

export function Scene({n, forced, variant}: {n: number; forced?: number; variant?: Variant}) {
  const i = sceneFor(n, forced), Comp = SCENES[i];
  const v = variant ?? {};
  const look = v.look ?? lookFor(n, i), look2 = LOOKS[(n * 5 + i + 2) % LOOKS.length];
  return <Comp look={look} look2={look2} v={v}/>;
}

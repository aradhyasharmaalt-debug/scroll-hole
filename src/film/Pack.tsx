import {prog, outCubic, outExpo, inOutCubic} from './motion';

/** A drawn cigarette pack with the classic death warning: skull, crossed bones, "SMOKING KILLS". All SVG, nothing borrowed. */
export function Pack({t, t0}: {t: number; t0: number}) {
  const rise = prog(t, t0, 1.0);
  const skull = prog(t, t0 + 1.0, 0.6, outExpo);
  const bones = prog(t, t0 + 1.4, 0.9, outCubic);
  const words = prog(t, t0 + 2.2, 0.5);
  const bone = (deg: number) => <g transform={`rotate(${deg} 120 208)`}>
    <line x1="72" y1="208" x2="168" y2="208" stroke="#f4f1ea" strokeWidth="10" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - bones}/>
    {[[72, 199], [72, 217], [168, 199], [168, 217]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="6.5" fill="#f4f1ea" style={{opacity: bones > 0.9 ? 1 : 0}}/>)}
  </g>;
  const turn = prog(t, t0, 1.6, inOutCubic);
  const yaw = -34 - (1 - turn) * 110 + (turn > 0.99 ? Math.sin((t - t0) * 0.9) * 7 : 0);
  return <div className="wl-pack" style={{opacity: rise}} aria-hidden="true">
    <div className="pk3" style={{transform: `translateY(${(1 - rise) * 9}vh) rotateX(-12deg) rotateY(${yaw}deg)`}}>
    <div className="pk-face pk-front">
    <svg viewBox="0 0 240 340">
      <rect x="6" y="6" width="228" height="328" rx="12" fill="#f4f1ea"/>
      <path d="M6 18a12 12 0 0 1 12-12h204a12 12 0 0 1 12 12v72H6z" fill="#ff3355"/>
      <rect x="6" y="88" width="228" height="4" fill="#000" opacity=".35"/>
      <rect x="30" y="34" width="110" height="9" fill="#fff" opacity=".9"/><rect x="30" y="52" width="70" height="6" fill="#fff" opacity=".6"/>
      <rect x="20" y="118" width="200" height="196" fill="#000"/>
      <rect x="26" y="124" width="188" height="184" fill="none" stroke="#f4f1ea" strokeWidth="2"/>
      <g style={{transformOrigin: '120px 208px'}}>{bone(32)}{bone(-32)}</g>
      <g style={{transformOrigin: '120px 190px', transform: `scale(${0.4 + 0.6 * skull})`, opacity: skull}}>
        <ellipse cx="120" cy="184" rx="31" ry="30" fill="#f4f1ea"/>
        <rect x="103" y="204" width="34" height="18" rx="4" fill="#f4f1ea"/>
        <circle cx="108" cy="186" r="8.5" fill="#000"/><circle cx="132" cy="186" r="8.5" fill="#000"/>
        <path d="M120 195l-4 9h8z" fill="#000"/>
        <path d="M112 213v9M120 213v9M128 213v9" stroke="#000" strokeWidth="2"/>
      </g>
      <text x="120" y="288" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="24" letterSpacing="1.5" fill="#f4f1ea" style={{opacity: words}}>SMOKING KILLS</text>
    </svg>
    </div>
    <div className="pk-face pk-back"/>
    <div className="pk-face pk-side pk-r"><i/></div>
    <div className="pk-face pk-side pk-l"><i/></div>
    <div className="pk-face pk-top"/>
    <div className="pk-face pk-bottom"/>
    </div>
    <div className="pk-shadow"/>
  </div>;
}

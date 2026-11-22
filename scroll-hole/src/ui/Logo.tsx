/** The Scroll Hole mark: a phone whose screen is a hole, with the scroll arrow falling into it. Drawn once, used everywhere. */
export const Mark = ({height = 48}: {height?: number}) =>
  <svg className="logomark" viewBox="0 0 48 64" height={height} width={height * 0.75} role="img" aria-label="Scroll Hole">
    <rect x="3" y="3" width="42" height="58" rx="11" fill="#0b0a0d" stroke="#f4f1ea" strokeWidth="3"/>
    <path d="M19 10h10" stroke="#f4f1ea" strokeWidth="2.6" strokeLinecap="round" opacity=".55"/>
    <ellipse cx="24" cy="35" rx="15" ry="10" fill="none" stroke="#f4f1ea" strokeWidth="2.2" opacity=".35"/>
    <ellipse cx="24" cy="39" rx="10.5" ry="7" fill="none" stroke="#ff3355" strokeWidth="2.4" opacity=".7"/>
    <ellipse cx="24" cy="43.5" rx="6" ry="4" fill="#ff3355"/>
    <path d="M24 16v14M18.5 25 24 30.5 29.5 25" fill="none" stroke="#f4f1ea" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;

/** Mark with its name. `quiet` drops the parent-project line. */
export const Logo = ({height = 48, quiet = false}: {height?: number; quiet?: boolean}) =>
  <span className="logo"><Mark height={height}/><span className="logo-words"><b>Scroll Hole</b>{!quiet && <small>Are you addicted?</small>}</span></span>;

import {Hand3D} from './Hand3D';

/** Two looping demos for the start screen: flick a pointing finger up to change reel; pinch thumb and index to like. A real 3D hand, with CSS for the card and heart. */
function Point() {
  return <div className="demo">
    <div className="demo-stage">
      <div className="demo-phone" aria-hidden="true"><i className="card a"/><i className="card b"/></div>
      <Hand3D kind="point"/>
      <svg className="demo-arrow" viewBox="0 0 24 40" aria-hidden="true"><path d="M12 36V6M5 13l7-7 7 7" fill="none" stroke="#ff3355" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
    <p className="demo-cap">Point up</p>
    <p className="demo-sub">next reel</p>
  </div>;
}

function Pinch() {
  return <div className="demo">
    <div className="demo-stage">
      <svg className="demo-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-8-4.8-8-10.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 8 2.5c0 5.8-8 10.6-8 10.6Z" fill="#ff3355"/></svg>
      <Hand3D kind="pinch"/>
    </div>
    <p className="demo-cap">Pinch</p>
    <p className="demo-sub">to like</p>
  </div>;
}

export const HowTo = () => <div className="howto" aria-label="How to play with your hand"><Point/><Pinch/></div>;

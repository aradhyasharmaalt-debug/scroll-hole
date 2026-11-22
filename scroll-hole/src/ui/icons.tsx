import type {ReactNode, SVGProps} from 'react';
/** One icon set: 24px grid, 2px stroke, round caps. */
type P = SVGProps<SVGSVGElement> & {size?: number};
const base = (size: number, rest: SVGProps<SVGSVGElement>) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...rest,
});
const make = (d: ReactNode) => ({size = 24, ...rest}: P) => <svg {...base(size, rest)}>{d}</svg>;

export const Heart = make(<path d="M12 20.5s-8-4.8-8-10.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 8 2.5c0 5.8-8 10.6-8 10.6Z"/>);
export const Comment = make(<path d="M4 5h16v11H9l-5 4V5Z"/>);
export const Share = make(<><path d="M21 4 3 11l7 3 3 7 8-17Z"/><path d="m10 14 11-10"/></>);
export const Bell = make(<><path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4l2-2Z"/><path d="M10 21a2 2 0 0 0 4 0"/></>);
export const Play = make(<path d="M7 4.5v15l12-7.5-12-7.5Z"/>);
export const Jackpot = make(<><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M9 5v14M15 5v14"/><circle cx="6" cy="12" r=".6"/><circle cx="12" cy="12" r=".6"/><circle cx="18" cy="12" r=".6"/></>);
export const Hand = make(<><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M11 10V4a1.5 1.5 0 0 1 3 0v6"/><path d="M14 10V5.5a1.5 1.5 0 0 1 3 0V13"/><path d="M17 9.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-1.2a6 6 0 0 1-4.6-2.2L3.6 15.4a1.6 1.6 0 0 1 2.4-2.1L8 15"/></>);
export const Finger = make(<><path d="M10 14V4.5a1.6 1.6 0 0 1 3.2 0V12"/><path d="M13.2 11.4a1.5 1.5 0 0 1 2.8-.2 1.5 1.5 0 0 1 2.6.6A1.5 1.5 0 0 1 20.5 13v3.4A5.8 5.8 0 0 1 14.7 22h-1.5a6 6 0 0 1-4.7-2.3L4.8 15a1.6 1.6 0 0 1 2.4-2.1L10 15.6"/></>);
export const ArrowUp = make(<><path d="M12 20V4"/><path d="m5 11 7-7 7 7"/></>);
export const Bed = make(<><path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.5"/></>);
export const AppX = make(<><rect x="4" y="4" width="16" height="16" rx="4"/><path d="m9 9 6 6M15 9l-6 6"/></>);
export const Moon = make(<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/>);
export const Check = make(<path d="m5 12.5 4.5 4.5L19 7"/>);
export const Phone = make(<><rect x="6.5" y="2.5" width="11" height="19" rx="2.6"/><path d="M10.5 5.5h3M10.5 18.5h3"/></>);
export const Book = make(<><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></>);
export const People = make(<><circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9.5" r="2.5"/><path d="M3 20c0-3.6 2.6-6 6-6s6 2.4 6 6"/><path d="M16 14.2c2.8 0 5 1.8 5 4.8"/></>);
export const Dumbbell = make(<><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></>);
export const Pen = make(<><path d="m4 20 1-5L16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 2Z"/><path d="m14 6 4 4"/></>);
export const Leaf = make(<><path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19c3-5 6-8 10-10"/></>);
export const Camera = make(<><path d="M4 8h3l2-3h6l2 3h3v11H4V8Z"/><circle cx="12" cy="13" r="3.5"/></>);

/** Small avatar used in fake notifications and reels. */
export function Avatar({size = 44}: {size?: number}) {
  return <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="22" fill="currentColor" opacity=".25"/><circle cx="22" cy="17" r="7" fill="currentColor"/><path d="M8 38a14 14 0 0 1 28 0" fill="currentColor"/></svg>;
}

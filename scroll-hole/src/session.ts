/** What happened in one visitor's session, plus the life maths behind the receipt. */
export type SessionStats = {
  actual: number;      // seconds actually spent scrolling
  guess: number;       // visitor's guess, seconds
  swipes: number;
  /** every reel the visitor was shown, in order, and how long it stayed on screen */
  seen: Seen[];
  /** the reel numbers they liked */
  liked: number[];
  notifs: number;      // notifications opened
  jackpots: number;
  likes: number;
  hearts: number;      // likes given by pinching
  shares: number;
  comments: number;
  /** what happened, second by second, so the voice can say it back: t = seconds into the scroll */
  events: SessionEvent[];
};

export type Seen = {n: number; scene: number; ms: number};
export type SessionEvent = {t: number; kind: 'notif' | 'jackpot' | 'like' | 'hit' | 'swipe'};

export const emptyStats = (): SessionStats => ({actual: 0, events: [], seen: [], liked: [], guess: 0, swipes: 0, notifs: 0, jackpots: 0, likes: 0, hearts: 0, shares: 0, comments: 0});

export const START_AGE = 20;
export const END_AGE = 80;
export const WEEKS_PER_YEAR = 52;

export type Life = {hours: number; days: number; years: number; weeks: number; totalWeeks: number; yearsLeft: number; yearSquares: number};

/** Estimate assuming the habit stays constant from START_AGE to END_AGE. */
export function life(hoursPerDay: number): Life {
  if (!Number.isInteger(hoursPerDay) || hoursPerDay < 1 || hoursPerDay > 12) throw new RangeError('Hours must be 1 to 12.');
  const yearsLeft = END_AGE - START_AGE;
  const years = hoursPerDay * yearsLeft / 24;
  return {
    hours: hoursPerDay,
    days: Math.round(hoursPerDay * 365 / 24),
    years,
    weeks: Math.round(years * WEEKS_PER_YEAR),
    totalWeeks: yearsLeft * WEEKS_PER_YEAR,
    yearsLeft,
    yearSquares: Math.round(hoursPerDay * 365 / 24),
  };
}

/** How far off the visitor's guess was, in whole seconds (always positive), and whether they guessed too low. */
export function gap(s: SessionStats) { const d = Math.round(s.actual - s.guess); return {seconds: Math.abs(d), tooLow: d > 0}; }

export const ACTIONS = [
  {id: 'bed', label: 'Charge your phone outside your bedroom'},
  {id: 'app', label: 'Delete one app for a week'},
  {id: 'gray', label: 'Turn on grayscale after 10 pm'},
] as const;
export type ActionId = typeof ACTIONS[number]['id'];

/** "58 seconds", "1 minute 12 seconds": the way it is said aloud. */
export function spoken(s: number) {
  const t = Math.round(s), m = Math.floor(t / 60), r = t % 60;
  if (m === 0) return `${t} seconds`;
  return `${m} ${m === 1 ? 'minute' : 'minutes'}${r ? ` ${r} ${r === 1 ? 'second' : 'seconds'}` : ''}`;
}

export function fmtSeconds(s: number) {
  const t = Math.round(s);
  return t < 60 ? `${t} s` : `${Math.floor(t / 60)} m ${String(t % 60).padStart(2, '0')} s`;
}

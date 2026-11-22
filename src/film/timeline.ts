export {DURATION, LINES, SCENES, T, END} from './script.gen';
import {LINES, SCENES} from './script.gen';

/** The spoken sentence at time t, for captions. Held briefly after it ends so it never flickers off between sentences. */
export function captionAt(t: number): string {
  for (const l of LINES) if (t >= l.t - 0.05 && t < l.end + 0.35) return l.text;
  return '';
}
export const sceneIndexAt = (t: number) => Math.max(0, SCENES.findIndex(s => t >= s.start && t < s.end));

/**
 * How many reels have gone by in the feed scene: two flicks a second at first, speeding up, then capped so the picture stays readable.
 * `s` is seconds since the scene began.
 */
export function flicks(s: number, cap = 6.5): number {
  if (s <= 0) return 0;
  const rate = (x: number) => Math.min(cap, 2 + 0.22 * x);
  const knee = (cap - 2) / 0.22;
  return s < knee ? 2 * s + 0.11 * s * s : 2 * knee + 0.11 * knee * knee + cap * (s - knee);
}

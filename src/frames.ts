import type {Mod, Variant} from './reels/variant';
import type {Seen} from './session';

/**
 * Spot the real frame: for reels the visitor actually scrolled past, four still frames of the SAME reel. One is real.
 * The other three each change one small thing (night instead of day, an extra player, a different shirt...).
 * Pure and seedable so it can be tested.
 */
type LookLike = {skin: string; shirt: string; pants: string; hair: string; shoe: string};
export type Shot = {variant: Variant; mod: Mod | null};     // mod null = the real one
export type ShotQuestion = {n: number; scene: number; shots: Shot[]; answer: number};
type Deps = {looks: LookLike[]; realLook: (n: number, scene: number) => LookLike; rng?: () => number; count?: number};

export const SHOT_COUNT = 5;

/** The four kinds of big change. A question's three wrong answers come from three DIFFERENT kinds, so they differ from each other. */
export type Kind = 'sky' | 'outfit' | 'crowd' | 'scenery';
export const KIND: Record<Mod, Kind> = {night: 'sky', sunset: 'sky', day: 'sky', outfit: 'outfit', paint: 'outfit', more: 'crowd', fewer: 'crowd', prop: 'scenery'};

/** Which changes each scene can show, by scene index (the order of SCENES in scenes.tsx). Every scene offers at least three kinds. */
export const SUPPORT: Mod[][] = [
  ['night', 'day', 'outfit', 'more', 'fewer', 'prop'],        // 0 cricket (sunset)
  ['night', 'sunset', 'outfit', 'more', 'fewer', 'prop'],     // 1 dog walk
  ['night', 'sunset', 'outfit', 'more', 'prop'],              // 2 kite
  ['night', 'sunset', 'paint', 'more', 'fewer', 'prop'],      // 3 chai (no sky: the lighting changes; the people are small, so the stall is repainted)
  ['day', 'outfit', 'more', 'prop'],                          // 4 rain (the rain stops and the sky turns bright)
  ['night', 'day', 'paint', 'more', 'prop'],                  // 5 rickshaw (the people are tiny, so the rickshaw is repainted)
  ['day', 'more', 'prop'],                                    // 6 rooftop dance (already night; outfit is fixed)
  ['night', 'sunset', 'outfit', 'more', 'fewer', 'prop'],     // 7 football
  ['night', 'sunset', 'outfit', 'more', 'fewer', 'prop'],     // 8 skipping
  ['day', 'sunset', 'paint', 'more', 'prop'],                 // 9 pakora stall (lighting and paint)
  ['night', 'sunset', 'outfit', 'prop'],                      // 10 cycling
];

const PROP: Record<number, string> = {0: 'the brick wall', 1: 'the trees', 2: 'the kite', 3: 'the arched windows', 4: 'the buildings', 5: 'the buildings', 6: 'the speaker', 7: 'the trees', 8: 'the door and windows', 9: 'the awning', 10: 'the cow'};
const MORE: Record<number, string> = {0: 'Two extra players', 1: 'An extra dog', 2: 'A second kid on the roof', 3: 'Two extra customers', 4: 'A second person walking', 5: 'A passenger in the back', 6: 'A second dancer', 7: 'Two extra kids', 8: 'Two extra kids', 9: 'Two customers waiting'};
const INDOOR = new Set([3, 9]);
const PAINT: Record<number, string> = {3: 'The stall and wall are painted different colors', 5: 'The rickshaw is painted another color', 9: 'The stall is painted different colors'};
const FEWER: Record<number, string> = {0: 'One player missing', 1: 'The dog is missing', 3: 'The customer is missing', 7: 'One kid missing', 8: 'The jumper is missing'};

/** What changed, said plainly, for the reveal. */
export function describe(mod: Mod | null, scene: number): string {
  switch (mod) {
    case null: return 'The real one';
    case 'night': return INDOOR.has(scene) ? 'Night: dark, with lamps glowing' : 'Night: a moon and stars';
    case 'sunset': return INDOOR.has(scene) ? 'Sunset: warm orange light' : 'Sunset: orange sky, low sun';
    case 'day': return scene === 4 ? 'The rain has stopped: bright blue sky' : INDOOR.has(scene) ? 'Bright daylight' : 'Bright daytime: blue sky';
    case 'outfit': return 'Different clothes';
    case 'paint': return PAINT[scene] ?? 'Painted different colors';
    case 'prop': return `Missing: ${PROP[scene] ?? 'the scenery'}`;
    case 'more': return MORE[scene] ?? 'More people';
    case 'fewer': return FEWER[scene] ?? 'One person missing';
  }
}

export function buildShots(seen: Seen[], d: Deps): ShotQuestion[] {
  const rng = d.rng ?? Math.random;
  const shuffle = <T,>(a: T[]): T[] => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  // One reel per scene, so five questions are five different reels.
  const firstOf = new Map<number, Seen>();
  for (const s of seen) if (!firstOf.has(s.scene)) firstOf.set(s.scene, s);
  const chosen = shuffle([...firstOf.values()]).slice(0, d.count ?? SHOT_COUNT);

  return chosen.map(s => {
    const real = d.realLook(s.n, s.scene);
    // Clothes that really differ: a new shirt AND new trousers, plus the cap flipped.
    const others = d.looks.filter(l => l.shirt !== real.shirt && l.pants !== real.pants);
    const otherLook = shuffle(others.length ? others : d.looks.filter(l => l.shirt !== real.shirt))[0];
    const variantFor = (mod: Mod): Variant => {
      switch (mod) {
        case 'night': case 'sunset': case 'day': return {sky: mod};
        case 'prop': return {prop: true};
        case 'paint': return {paint: true};
        case 'more': return {people: 'more'};
        case 'fewer': return {people: 'fewer'};
        case 'outfit': return {look: {...real, shirt: otherLook.shirt, pants: otherLook.pants}, hat: true};
      }
    };
    // Three different KINDS of change, one change from each, so no two wrong answers look alike.
    const byKind = new Map<Kind, Mod[]>();
    for (const m of SUPPORT[s.scene]) byKind.set(KIND[m], [...(byKind.get(KIND[m]) ?? []), m]);
    const mods = shuffle([...byKind.values()]).slice(0, 3).map(list => shuffle(list)[0]);
    const shots = shuffle<Shot>([{variant: {}, mod: null}, ...mods.map(m => ({variant: variantFor(m), mod: m}))]);
    return {n: s.n, scene: s.scene, shots, answer: shots.findIndex(x => x.mod === null)};
  });
}

export const scoreShots = (qs: ShotQuestion[], answers: (number | null)[]) => qs.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);

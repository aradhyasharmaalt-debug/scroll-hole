/**
 * One BIG, believable change to a scene, used to build the fake "screenshots" for the spot-the-real-frame quiz.
 * Every change is a real edit to the drawing and is easy to see at thumbnail size. Four categories, so the wrong answers
 * differ from each other as well as from the real one: the sky, the clothes, the crowd, the scenery.
 */
export type Mod = 'night' | 'sunset' | 'day' | 'outfit' | 'paint' | 'more' | 'fewer' | 'prop';
export type Sky = 'night' | 'sunset' | 'day';

export type Variant = {
  look?: {skin: string; shirt: string; pants: string; hair: string; shoe: string};   // the main person's clothes
  hat?: boolean;                   // the main person's cap is flipped: added if they had none, removed if they did
  sky?: Sky;                       // a different time of day, with its own sun or moon
  paint?: boolean;                 // the big painted surfaces (the stall, the wall, the rickshaw) are a different color
  prop?: boolean;                  // a big piece of scenery missing (the wall, the trees, the buildings, the kite, the cow...)
  people?: 'more' | 'fewer';       // more people (or dogs), or one fewer
};

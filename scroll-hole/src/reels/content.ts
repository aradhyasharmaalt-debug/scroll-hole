/**
 * What each reel says on screen, and what the pop quiz can ask about it afterwards.
 * Order matches SCENES in scenes.tsx. Every caption holds one number and every reel has a handle, like a real reel.
 */
export type SceneInfo = {
  title: string;                 // what it was about
  handle: string;                // who posted it
  caption: string;               // the line on screen
  fact: {ask: string; answer: string; wrong: [string, string, string]};
  /** the main person's shirt, if there is exactly one clear person: 'look' = from the visitor's reel look, or a fixed colour name */
  shirt: 'look' | 'yellow' | null;
};

export const INFO: SceneInfo[] = [
  {title: 'Kids playing cricket', handle: 'gully.boys', caption: '6 needed off the last ball. Watch this.',
    fact: {ask: 'In the cricket reel, how many runs were needed off the last ball?', answer: '6', wrong: ['2', '4', '8']}, shirt: null},
  {title: 'Walking a dog', handle: 'bruno.and.me', caption: 'Bruno walks 5 km every single morning.',
    fact: {ask: 'In the dog reel, how far does Bruno walk each morning?', answer: '5 km', wrong: ['2 km', '8 km', '10 km']}, shirt: 'look'},
  {title: 'Flying a kite', handle: 'roof.diaries', caption: 'Cut 7 kites before sunset.',
    fact: {ask: 'In the kite reel, how many kites were cut?', answer: '7', wrong: ['3', '5', '9']}, shirt: 'look'},
  {title: 'Making chai', handle: 'chai.tapri', caption: 'Better chai in 3 steps.',
    fact: {ask: 'In the chai reel, how many steps to better chai?', answer: '3', wrong: ['2', '4', '5']}, shirt: 'look'},
  {title: 'Walking in the rain', handle: 'monsoon.mood', caption: 'It has rained for 4 days straight.',
    fact: {ask: 'In the rain reel, for how many days had it rained?', answer: '4', wrong: ['2', '6', '9']}, shirt: 'look'},
  {title: 'Riding an auto-rickshaw', handle: 'auto.stories', caption: 'He drives 12 hours a day. Say thanks.',
    fact: {ask: 'In the auto reel, how many hours a day does he drive?', answer: '12', wrong: ['6', '8', '16']}, shirt: 'look'},
  {title: 'Dancing on a rooftop', handle: 'roof.nights', caption: 'Rooftop party at 9 pm.',
    fact: {ask: 'In the rooftop dance reel, what time was the party?', answer: '9 pm', wrong: ['7 pm', '8 pm', '11 pm']}, shirt: 'yellow'},
  {title: 'Playing football', handle: 'park.kicks', caption: '20 passes without a drop.',
    fact: {ask: 'In the football reel, how many passes without a drop?', answer: '20', wrong: ['10', '15', '30']}, shirt: null},
  {title: 'Skipping rope', handle: 'courtyard.club', caption: '30 skips. No mistakes.',
    fact: {ask: 'In the skipping reel, how many skips without a mistake?', answer: '30', wrong: ['15', '20', '50']}, shirt: null},
  {title: 'Frying pakoras', handle: 'street.eats', caption: 'Crispy pakoras in 90 seconds.',
    fact: {ask: 'In the pakora reel, how fast were they ready?', answer: '90 seconds', wrong: ['30 seconds', '3 minutes', '5 minutes']}, shirt: 'look'},
  {title: 'Cycling past a cow', handle: 'lane.rides', caption: 'A cow blocked the road for 10 minutes.',
    fact: {ask: 'In the cycling reel, how long did the cow block the road?', answer: '10 minutes', wrong: ['2 minutes', '5 minutes', '30 minutes']}, shirt: 'look'},
];

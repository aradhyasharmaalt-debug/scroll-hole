/**
 * Every word the visitor sees. Plain spoken English; say what happened, never blame the visitor.
 */
export const copy = {
  attract: {
    title: 'Scroll as long as you like.',
    start: 'Point a finger at the camera to begin.',
    startKeys: 'Press space to begin.',
    camOff: 'Camera is off. Keyboard works.',
  },
  feed: {
    flick: 'Flick up to scroll',
    pinch: 'Pinch to like',
    stopHow: 'Done? Hold still to stop.',
    notif: 'Diya sent you a reel',
    shared: 'Sent to Diya',
    commented: 'Comment posted',
  },
  mirror: {title: 'This is you.'},
  quiz: {
    introTitle: 'Spot the real frame.',
    introSub: (n: number) => `${n} ${n === 1 ? 'reel' : 'reels'}. 4 screenshots each. Only one is real.`,
    introLine: 'Which one did you just watch?',
    counter: (i: number, n: number) => `${i} of ${n}`,
    prompt: 'Which one did you just watch?',
    from: (title: string) => `From the reel: ${title}`,
    pickHint: 'Pick the real one',
    right: 'Right',
    wrong: 'Wrong',
    late: "Time's up",
    watchReal: 'This is the real reel',
    next: 'Next',
    finish: 'See my score',
    retained: 'Remembered',
    watched: (reels: number, time: string) => `${reels} ${reels === 1 ? 'reel' : 'reels'} in ${time}`,
    picked: (got: number, total: number) => `You spotted the real frame ${got} of ${total} ${total === 1 ? 'time' : 'times'}.`,
    low: 'Easy to watch. Hard to remember.',
    mid: 'Some stuck. Most did not.',
    high: 'You held on to a lot.',
    average: (pct: number, players: number) => `Other players remembered ${pct}%`,
    again: 'Continue',
  },
} as const;

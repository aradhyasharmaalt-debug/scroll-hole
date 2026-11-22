/** Tiny synth. Every sound is made in code, so the booth works offline. */
let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let muted = false;
export const setMuted = (m: boolean) => { muted = m; };
export const isMuted = () => muted;

function ac() { ctx ??= new AudioContext(); return ctx; }
export function unlock() { try { void ac().resume(); } catch { /* no audio */ } }
if (typeof window !== 'undefined') {
  for (const ev of ['pointerdown', 'keydown']) window.addEventListener(ev, unlock, {passive: true});
}

function tone(freq: number, to: number, dur: number, gain: number, type: OscillatorType = 'sine', at = 0) {
  if (muted) return;
  const a = ac(); if (a.state !== 'running') return;
  const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + at;
  o.type = type; o.connect(g); g.connect(a.destination);
  o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
  o.start(t); o.stop(t + dur + .02);
}

export const sfx = {
  swipe() {
    if (muted) return; const a = ac(); if (a.state !== 'running') return;
    if (!noise) { noise = a.createBuffer(1, a.sampleRate * .3, a.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime;
    s.buffer = noise; f.type = 'bandpass'; f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(3200, t + .2); f.Q.value = 1.2;
    g.gain.setValueAtTime(.09, t); g.gain.exponentialRampToValueAtTime(.001, t + .22);
    s.connect(f); f.connect(g); g.connect(a.destination); s.start(t); s.stop(t + .25);
  },
  hit(n = 0) { tone(660 + n * 90, 1180 + n * 120, .14, .07, 'triangle'); },
  jackpot() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f * 1.01, .22, .08, 'square', i * .07)); },
  notif() { tone(1320, 1320, .12, .07); tone(1760, 1760, .22, .07, 'sine', .1); },
  tick() { tone(900, 700, .05, .04); },
  print() { tone(220, 200, .04, .03, 'square'); },
  like() { tone(520, 1040, .1, .07, 'triangle'); tone(780, 1560, .14, .06, 'triangle', .08); },
  lock() { tone(440, 880, .12, .06, 'triangle'); },
};

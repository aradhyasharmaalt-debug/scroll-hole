import {useEffect, useMemo, useRef, useState} from 'react';
import {copy} from '../copy';
import {describe, scoreShots, type ShotQuestion} from '../frames';
import {INFO} from '../reels/content';
import {Scene} from '../reels/scenes';
import {fmtSeconds, type SessionStats} from '../session';
import {sfx} from '../sound';
import {useAfter} from '../ui/hooks';
import {Avatar} from '../ui/icons';

/** No timers on the questions: take as long as you like. Only a walk-away safety net resets the booth after 3 minutes of nobody touching it. */
const WALK_AWAY_MS = 180000;

/** A beat of warning, then the questions lock in. */
export function ShotIntro({count, onDone}: {count: number; onDone: () => void}) {
  useAfter(3000, onDone);
  return <section className="center">
    <h1 className="display t120 signal">{copy.quiz.introTitle}</h1>
    <p className="display t36">{copy.quiz.introSub(count)}</p>
    <p className="lede">{copy.quiz.introLine}</p>
  </section>;
}

/** The real reel, playing, with its handle and caption: shown after every answer. */
function LiveReel({q}: {q: ShotQuestion}) {
  const info = INFO[q.scene];
  return <div className="liveframe">
    <Scene n={q.n} forced={q.scene}/>
    <div className="reel-shade"/>
    <div className="byline"><Avatar/><div><b>@{info.handle}</b><span>{info.caption}</span></div></div>
  </div>;
}

/** Four screenshots of the same reel; one is real. Pick it, then watch the real one play on the right. */
export function ShotQuiz({questions, onDone, onAbandon}: {questions: ShotQuestion[]; onDone: (answers: (number | null)[]) => void; onAbandon: () => void}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const answers = useRef<(number | null)[]>([]);
  const q = questions[i];
  const last = i + 1 >= questions.length;

  const reveal = (a: number | null) => {
    if (revealed) return;
    answers.current[i] = a; setPicked(a); setRevealed(true);
    if (a !== null) (a === q.answer ? sfx.hit(2) : sfx.tick());
  };
  const next = () => {
    if (!revealed) return;
    if (last) { onDone(answers.current.slice(0, questions.length)); return; }
    setI(i + 1); setPicked(null); setRevealed(false);
  };
  // Walk-away safety net only: any click, move or key press starts the clock again.
  useEffect(() => {
    let t = setTimeout(onAbandon, WALK_AWAY_MS);
    const poke = () => { clearTimeout(t); t = setTimeout(onAbandon, WALK_AWAY_MS); };
    for (const e of ['pointerdown', 'pointermove', 'keydown']) window.addEventListener(e, poke);
    return () => { clearTimeout(t); for (const e of ['pointerdown', 'pointermove', 'keydown']) window.removeEventListener(e, poke); };
  }, [onAbandon]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Enter') next(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }); // eslint-disable-line react-hooks/exhaustive-deps

  const verdict = !revealed ? '' : picked === q.answer ? copy.quiz.right : copy.quiz.wrong;
  return <section className="shotq" key={i} onClick={e => { if (revealed && !(e.target as HTMLElement).closest('button')) next(); }}>
    <header className="shothead">
      <p className="hint">{copy.quiz.counter(i + 1, questions.length)} &middot; {copy.quiz.from(INFO[q.scene].title)}</p>
      <h2 className="display t36">{copy.quiz.prompt}</h2>
    </header>
    <div className="shotbody">
      <div className="shotgrid">
        {q.shots.map((s, k) => {
          const state = !revealed ? '' : k === q.answer ? 'real' : k === picked ? 'bad' : 'dim';
          return <div key={k} className="shotcell">
            <button className={`shot ${state}`} disabled={revealed} onClick={() => reveal(k)} aria-label={`Screenshot ${k + 1}`}>
              <div className="shotframe"><Scene n={q.n} forced={q.scene} variant={s.variant}/></div>
              {revealed && k === q.answer && <span className="badge-real">&#10003;</span>}
              {revealed && k === picked && k !== q.answer && <span className="badge-bad">&#10007;</span>}
              {revealed && <span className="shotlabel">{describe(s.mod, q.scene)}</span>}
            </button>
          </div>;
        })}
      </div>
      <div className="shotlive">
        {revealed
          ? <><p className={`display t36 verdict ${picked === q.answer ? 'good' : 'bad'}`}>{verdict}</p><LiveReel q={q}/><p className="hint">{copy.quiz.watchReal}</p></>
          : <div className="liveempty"><p className="display t36">{copy.quiz.pickHint}</p></div>}
      </div>
    </div>
    <div className="shotfoot">{revealed && <button className="cta" onClick={next}>{last ? copy.quiz.finish : copy.quiz.next}</button>}</div>
  </section>;
}

const KEY = 'scroll-hole-shots';
type Board = {players: number; pctSum: number};
const read = (): Board => { try { return JSON.parse(localStorage.getItem(KEY) ?? '') as Board; } catch { return {players: 0, pctSum: 0}; } };

/** The score. The booth average appears only after 10 players, and never includes the current player. */
export function ShotResult({stats, questions, answers, onNext}: {stats: SessionStats; questions: ShotQuestion[]; answers: (number | null)[]; onNext: () => void}) {
  const total = questions.length, got = scoreShots(questions, answers);
  const pct = total ? Math.round(got / total * 100) : 0;
  const board = useMemo(() => {
    const b = read();
    try { localStorage.setItem(KEY, JSON.stringify({players: b.players + 1, pctSum: b.pctSum + pct})); } catch { /* storage off */ }
    return b;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useAfter(60000, onNext);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Enter') onNext(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onNext]);
  const verdict = pct <= 34 ? copy.quiz.low : pct <= 67 ? copy.quiz.mid : copy.quiz.high;
  return <section className="center result">
    <div className="display t240 num"><span className="signal">{got}</span><span className="t120"> / {total}</span></div>
    <h1 className="display t64">{copy.quiz.retained}</h1>
    <div className="pips" aria-hidden="true">{questions.map((_, k) => <i key={k} className={answers[k] === questions[k].answer ? 'on' : ''}/>)}</div>
    <p className="lede">{copy.quiz.watched(stats.seen.length, fmtSeconds(stats.actual))} {copy.quiz.picked(got, total)}</p>
    <p className="display t36">{verdict}</p>
    {board.players >= 10 && <p className="hint">{copy.quiz.average(Math.round(board.pctSum / board.players), board.players)}</p>}
    <button className="cta" onClick={onNext}>{copy.quiz.again}</button>
  </section>;
}

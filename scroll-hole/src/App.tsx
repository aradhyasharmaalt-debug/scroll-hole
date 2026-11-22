import {Logo} from './ui/Logo';
import {useCallback, useEffect, useRef, useState} from 'react';
import {enterMouseMode, startCamera, useInput} from './input/input';
import {emptyStats, type SessionStats} from './session';
import {buildShots, scoreShots, type ShotQuestion} from './frames';
import {LOOKS} from './reels/kit';
import {lookFor} from './reels/scenes';
import {isMuted, setMuted, unlock} from './sound';
import {Attract} from './screens/Attract';
import {Feed} from './screens/Feed';
import {Mirror} from './screens/Mirror';
import {ShotIntro, ShotQuiz, ShotResult} from './screens/Shots';
import {Film} from './film/Film';
import {Hand} from './ui/icons';

type Beat = 'attract' | 'feed' | 'mirror' | 'quizIntro' | 'quiz' | 'result' | 'film';

export function App() {
  const video = useRef<HTMLVideoElement>(null);
  const {hand, camera} = useInput();
  const [beat, setBeat] = useState<Beat>('attract');
  const [stats, setStats] = useState<SessionStats>(emptyStats());
  const [frames, setFrames] = useState<string[]>([]);
  const [questions, setQuestions] = useState<ShotQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [muted, setMutedState] = useState(false);
  // Every session gets a fresh key so no screen keeps a previous visitor's state.
  const [session, setSession] = useState(0);

  useEffect(() => { if (video.current) void startCamera(video.current); }, []);

  const reset = useCallback(() => {
    setFrames([]); setStats(emptyStats()); setQuestions([]); setAnswers([]); setSession(s => s + 1); setBeat('attract');
    if (video.current) void startCamera(video.current);   // the next visitor starts with finger control again
  }, []);
  useEffect(() => { // Escape is the staff exit
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') reset(); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [reset]);

  const start = useCallback(() => { unlock(); setBeat('feed'); }, []);
  const feedDone = useCallback((s: SessionStats, f: string[]) => { setStats(s); setFrames(f); setBeat('mirror'); }, []);
  // After the mirror moment the finger is retired: camera off, frames discarded, the mouse takes over, and the quiz is built
  // from the reels this visitor actually scrolled past.
  const toQuiz = useCallback(() => {
    enterMouseMode(); if (video.current) video.current.srcObject = null; setFrames([]);
    setQuestions(buildShots(stats.seen, {looks: LOOKS, realLook: lookFor}));
    setBeat('quizIntro');
  }, [stats]);
  const startQuiz = useCallback(() => setBeat('quiz'), []);
  const toFilm = useCallback(() => setBeat('film'), []);
  const quizDone = useCallback((a: (number | null)[]) => { setAnswers(a); setBeat('result'); }, []);

  return <main className="stage" data-beat={beat}>
    <video ref={video} className="cam" muted playsInline aria-hidden="true"/>
    <div className="vignette"/>
    <div className="brand" aria-hidden={beat !== 'attract'}><Logo height={72}/></div>
    <button className="mute" onClick={() => { setMuted(!isMuted()); setMutedState(isMuted()); }} aria-pressed={muted}>{muted ? 'Sound off' : 'Sound on'}</button>

    {hand.source === 'hand' && beat !== 'mirror' && <div className={`cursor ${hand.pointing || hand.pinching ? '' : 'off'} ${hand.pinching ? 'pinch' : ''}`} style={{left: `${hand.x * 100}%`, top: `${hand.y * 100}%`}} aria-hidden="true"/>}

    {beat === 'attract' && <Attract key={`a${session}`} onStart={start}/>}
    {beat === 'feed' && <Feed key={`f${session}`} video={video} onDone={feedDone}/>}
    {beat === 'mirror' && <Mirror key={`m${session}`} frames={frames} onDone={toQuiz}/>}
    {beat === 'quizIntro' && <ShotIntro key={`qi${session}`} count={questions.length} onDone={startQuiz}/>}
    {beat === 'quiz' && <ShotQuiz key={`q${session}`} questions={questions} onDone={quizDone} onAbandon={reset}/>}
    {beat === 'result' && <ShotResult key={`r${session}`} stats={stats} questions={questions} answers={answers} onNext={toFilm}/>}
    {beat === 'film' && <Film key={`fi${session}`} reels={stats.seen.length} got={scoreShots(questions, answers)} total={questions.length} onDone={reset}/>}

    {beat === 'feed' && <div className={`badge ${hand.present ? 'on' : ''}`} role="status"><Hand/><span>{camera === 'denied' ? 'Mouse mode' : hand.source === 'hand' ? (hand.pointing ? 'Finger found' : 'Point one finger') : hand.present ? 'Mouse' : 'Point a finger'}</span></div>}
  </main>;
}

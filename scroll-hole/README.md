# Scroll Hole

An exhibition-booth game about reel addiction. Visitors point one finger at the camera and flick it up to scroll a feed of short illustrated reels, with no clock and no goal. When they stop, the game replays their own face while they scrolled ("This is you"). Then comes **the Memory Wipe**: a rapid pop quiz on the reels they just scrolled past, and a **Retained** score. Design notes: `DESIGN.md`, `PRODUCT.md`, `CONTENT.md`.

```sh
npm ci
npm run dev      # http://127.0.0.1:5173, allow the camera
npm test         # gesture, session and quiz checks
npm run build
```

## Controls
**Finger control covers only the start and the scroll.** After "This is you" the camera turns off (the face replay is discarded) and the mouse takes over. The next visitor starts with the finger again.

| | Finger (point with one finger, others curled) | Fallback (always on) |
|---|---|---|
| Begin | point at the camera, hold 3 s | Space or click |
| Scroll a reel | flick the fingertip up | Space, Arrow Up, mouse wheel |
| Like / comment / share | hover the button, pinch thumb and index together (a pinch on the reel = like) | click, or `L` to like |
| Stop (hint after 12 s; there is no clock) | hold the finger still 3.5 s | hold `S` |
| **Quiz (mouse only)** | | click an answer; Enter or the button for Next player |
| Staff reset | | Escape |

## The Memory Wipe: spot the real frame
After "This is you" the visitor gets up to five questions, one per reel they actually scrolled past. Each question shows **four screenshots of the same reel**. One is real. The other three each make a **big, easy-to-see change**, and the three changes are always of three DIFFERENT kinds, so no two wrong answers look alike: **the sky or lighting** (night with a moon and stars, or with lamps glowing; a sunset; bright daytime; in the rain reel the rain stops), **the look** (new clothes, or where the people are tiny, the stall or rickshaw painted another color), **the crowd** (one or two more people or dogs, or one fewer), or **the scenery** (a big piece missing: the wall, the trees, the buildings, the kite, the cow, the speaker). Every change is drawn into the picture itself, never a filter, flip or color shift. There is no timer: they take as long as they like, and nothing is answered for them (a safety net resets the booth only after 3 minutes of nobody touching it). Then the game marks right or wrong, labels what was changed on every screenshot, and **plays the real reel on the right** with its caption. At the end: "3 / 5 Retained", a row of squares, and one honest line. After 10 players the booth shows its own average (counted on this laptop only, never including the current player).

- Questions are built only from reels this visitor saw, so it is always fair. A visitor who scrolled only a few reels gets fewer questions.
- Wording: `src/copy.ts`. Fake generation: `src/frames.ts` (which changes each scene supports is the `SUPPORT` table, and `describe` has the labels). The edits themselves are drawn in `src/reels/scenes.tsx` (see `capFor`, `SkyTint` and the `data-prop` / `data-sun` tags).
- Review every scene's fakes at `/?gallery=0` to `/?gallery=10`.

Pinch thresholds and the hold time live in `src/input/gestures.ts` (`PINCH_DOWN`, `PINCH_UP`, `HOLD_MS`). A red ring follows the fingertip and shrinks while you pinch.

## The closing film: "The Warning Label"
After the Retained score, **Continue** plays a about 90-second motion-graphics film, then the booth resets. The idea: like the warning on a cigarette pack, people already know hours of scrolling are bad for them, and still scroll. The film is about that gap, not about telling them they are addicted.

Scenes (all drawn in code, black, white and one red): 1) a pack-style warning panel, word by word; 2) the same warning stamped again and again, faster, then a phone rises; 3) a thumb keeps flicking while the reel counter climbs; 4) the warning stands still beside racing reels, "Knowing is not stopping", with that visitor's own numbers; 5) everything stops: "Notice the moment you reach for it."

- Voice: the offline neural voice **Piper** (`en_GB-jenny_dioco-medium`), recorded sentence by sentence by `video/make-voice.py` into one continuous file, `public/video/vo.m4a`. The same script writes `src/film/script.gen.ts` with every sentence's real start time, so scenes, kinetic text and captions are cued to the voice. Setup (once): `python3 -m venv video/.venv && video/.venv/bin/pip install piper-tts certifi`, then download voices into `video/voices` with `SSL_CERT_FILE=$(video/.venv/bin/python -c 'import certifi;print(certifi.where())') video/.venv/bin/python -m piper.download_voices --download-dir video/voices en_GB-jenny_dioco-medium`. Change voice or pace with `VOICE=en_US-amy-medium PACE=1.05 python3 video/make-voice.py`. Review any moment with `/?film=1&t=60`.
- Captions are always shown; if sound is muted or blocked the film plays on a timer. **Skip** is always there.
- Script and timing: `src/film/timeline.ts`. Scenes: `src/film/Film.tsx`, `film.css`.
- Review it on its own at `/?film=1`.
- Honest limits: Karen is a built-in synthetic voice, so it sounds good but not human. A recorded voice or a cloud neural voice would sound better. The film is in the website, not an MP4 file.

## Reels
Reels are hand-built SVG scenes in `src/reels/` (a shared character and palette kit, eleven scenes, one stylesheet of loopable animations). Open `/?scene=0` to `/?scene=10` to pin every reel to one scene while reviewing.

## Archive
The talking-website, QR take-away and the earlier text-question quiz are kept in `archive/` (not compiled).

## Booth checklist
Light the player from the front, no bright window behind them. Pre-allow camera access for the site in Chrome. Benchmark GPU vs CPU on the booth laptop. Camera frames and the face replay stay in memory and are discarded on reset.

Hand tracking: Google MediaPipe Hand Landmarker (`public/models/hand_landmarker.task`, runtime in `public/wasm/`).

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Visitors aged 18–25 at a college exhibition booth. They walk up to a laptop with a webcam, play for about 1–2 minutes, and leave. Most are strangers, often standing, often with friends watching, with no patience for reading.

## Product Purpose
Scroll Hole (formerly Reel Rush) is an interactive game about reel and short-video addiction. It makes visitors feel how much of their life reels take. Success: a visitor leaves **shocked by their own result**: how little of what they just scrolled through they can remember.

## Positioning
Visitors already know their screen time is high and ignore that fact. Scroll Hole makes them *experience* the "just one more / just 5 minutes" loop in the game, then turns what they did into their own personal cost.

## Operating Context
- Exhibition booth: laptop + built-in or USB webcam only. No touchscreen, no physical printer, no phone pairing.
- Phone-object tracking (MediaPipe "cell phone") was tried and failed in real use; it must be replaced.
- One visitor after another; the experience must reset itself for the next visitor.
- Reviewed by a teacher, who rejected the previous version as text-heavy, boring, cognitively heavy and sloppy.

## Capabilities and Constraints
- Runs in the browser (React + Vite + TypeScript existing codebase); camera frames stay on device.
- The ending is the Memory Wipe: a pop quiz on the reels the visitor just scrolled past, then a Retained score. The earlier reel bill, plan builder, QR take-away and spoken data were dropped at the owner's request (kept in archive/).
- Daily screen time is self-reported (1–9 h). Life projections use stated assumptions (e.g. to age 80); show them as estimates, not facts.

## Brand Commitments
- Game name: **Scroll Hole**.
- Parent project: **"Are You Addicted?"** with the "a?" mark.
- Reel bill / time receipt concept stays.
- Locked receipt lines: "YOU DIDN'T SPEND MONEY. YOU SPENT TIME.", the QR code labelled "PLAY REEL RUSH" pointing to the live site (label to be renamed only if the owner agrees), and the disclaimer "Estimated using self-reported daily screen time. Equivalent 24-hour days, not time necessarily wasted."

## Evidence on Hand
- Nine approved daily-hour reflection/closing messages in `src/receipt/content.ts`.
- No measured study data in the project. Any statistic shown must come from a cited source; illustrative examples must be labelled as such.

## Product Principles
1. Show, don't tell: the visitor should *do* the habit before being told about it.
2. One idea per screen, in plain sentences. Clear beats short: never a label without a reason. If it needs a paragraph, it needs a picture instead.
3. Their numbers, not averages: personal data shocks, generic data bores.
4. The booth must work every time: interaction cannot depend on fragile tracking.
5. The receipt is the takeaway: visual first, readable in five seconds.

# Design: Scroll Hole, "The Hole"

Direction pinned by the owner's approval of REDESIGN_PLAN.md (no separate world workshop was run).

## World
A deep black void with a feed falling into it. It is a 2 a.m. phone screen turned into a room: hypnotic and loud during play, stark and quiet during the reveal. One signal colour against a lot of darkness. Reels themselves are the only multicolour element.

## Use scene
An exhibition booth, 1–1.5 m from a 13–16" laptop, friends watching from behind. Visitors glance. Use plain sentences, one idea per line, and say what each number measures. Short but cryptic fails; clear wins (see CONTENT.md).

## Tokens
- `--void #0b0a0d` ground · `--ink #f4f1ea` text · `--signal #ff3355` the one accent · `--dim #8f8c96` secondary · `--paper #f3efe6` receipt only.
- Type: **Anton** (condensed display, self-hosted) for numbers and the 7-word lines; **Azeret Mono** (self-hosted) for hints, data and the receipt.
- Six sizes only: 18 / 24 / 36 / 64 / 120 / 240 px (fluid, clamped to viewport height). Nothing under 18 px on the game screens.
- Motion: things *fall* during play and *rise* during the reveal. One easing, `cubic-bezier(.16,1,.3,1)`. Numbers count up. Reduced motion respected.
- Icons: authored SVG, 2 px stroke, rounded caps, one set (`src/ui/icons.tsx`). No emoji.

## Rules
- One number per screen, plus one picture that is that number.
- No eyebrows or kickers. The headline carries the screen.
- No cards as structure. No gradient text. No decorative blur.
- The receipt is black ink on paper only, so it survives a thermal printer.

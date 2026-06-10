# drift · snake

A cozy little snake game, built for relaxing play and content creation.

**Play it:** open `index.html`, or visit the hosted version (link coming once published).

## Features

- **Smooth, Google-Snake-style movement** — the snake glides between cells at 60fps with a rounded gradient body, directional eyes, and the occasional tongue flick.
- **Classic & zen moods** — classic has walls and self-collision; zen wraps around the edges and nothing can hurt you.
- **Timed bonus orange** — appears every few fruits and counts down from 5 seconds; eat it with N seconds left and you score N points.
- **Ghost racing** — every run is recorded. Replay the same seed and a translucent ghost of your best run slithers alongside you.
- **Challenge links** — share a URL after a run; anyone who opens it gets the same fruit layout and a "beat your score" goal.
- **5 palettes** — meadow (lofi pastel), midnight, classic, sakura, tide.
- **Wide & tall layouts** — tall is sized for 9:16 vertical recording (Shorts/TikTok/Reels).
- **Multiple-fruit mode**, three paces, three board sizes.
- **Generative lofi soundtrack** — chords, bass, and vinyl crackle synthesized live in WebAudio (no audio files), with separate music/SFX volume controls.

## Controls

| Input | Action |
| --- | --- |
| Arrow keys / WASD | steer |
| Space / Esc | pause |
| Enter | play again (on game over) |
| Swipe | steer (touch devices) |

## Tech

Dependency-free vanilla JavaScript and canvas. No build step — `index.html`, `style.css`, `game.js`, `audio.js` is the whole game. Runs are deterministic per seed (seeded PRNG, tick-based timing), which is what makes ghosts and challenge links possible.

A read-only state hook is exposed at `window.__drift.get()` for tooling and automation.

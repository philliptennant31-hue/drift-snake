# drift · snake

A cozy little snake game, built for relaxing play and content creation.

**Play it: [philliptennant31-hue.github.io/drift-snake](https://philliptennant31-hue.github.io/drift-snake/)** — or just open `index.html` locally.

## Features

- **Smooth, Google-Snake-style movement** — the snake glides between cells at 60fps with a curved, tapered, gradient body, a soft shadow, directional blinking eyes, and the occasional tongue flick.
- **Four moods** — *classic* (walls and self-collision), *zen* (wrap-around edges, nothing can hurt you), *rush* (every fruit is timed — points equal the seconds remaining), and *trial* (best score in 60 seconds).
- **Timed bonus fruit, one per palette** — orange in meadow, dragon fruit in sakura, kiwi in classic, starfruit in midnight, blueberry in tide. Each counts down from 5 seconds; eat it with N seconds left and you score N points.
- **Unlockables** — eat 20 of a palette's timed fruit to unlock its snake skin (sunset, dragon, retro, galaxy, deepsea). Earn hats through achievements: outrun your ghost, catch timed fruit at full value, clutch-catch with 1 second left, and lifetime fruit milestones.
- **A persistent garden** — every 10 fruit you've ever eaten plants a flower under the board. It never resets.
- **Ghost racing** — every run is recorded. Replay the same seed and a translucent ghost of your best run slithers alongside you.
- **Challenge links** — share a URL after a run; anyone who opens it gets the same fruit layout and a "beat your score" goal.
- **5 palettes** with ambient life — drifting leaves in meadow, petals in sakura, fireflies in midnight, bubbles in tide.
- **Wide & tall layouts** — tall is sized for 9:16 vertical recording (Shorts/TikTok/Reels). Press `h` for cinema mode (hides all UI).
- **A generative lofi soundtrack with a mood per palette** — warm maj7 pads in meadow, slow minor pads with heavy vinyl crackle in midnight, koto-ish plucks in sakura, marimba blips in classic, and an ocean swell in tide — plus an independent rain layer. All synthesized live in WebAudio (no audio files), with separate music/SFX volume controls.

## Controls

| Input | Action |
| --- | --- |
| Arrow keys / WASD | steer |
| Space / Esc | pause |
| Enter | play again (on game over) |
| H | cinema mode (hide UI) |
| Swipe | steer (touch devices) |

## Tech

Dependency-free vanilla JavaScript and canvas. No build step — `index.html`, `style.css`, `game.js`, `audio.js` is the whole game. Runs are deterministic per seed (seeded PRNG, tick-based timing), which is what makes ghosts and challenge links possible — and would make replay-verified leaderboards possible later.

A read-only state hook is exposed at `window.__drift.get()` for tooling and automation (set `window.__drift.noAutoPause = true` to disable pause-on-tab-hide during automated runs).

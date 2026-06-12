# Music curation spec

This is the standing brief for growing the soundtrack — used by the weekly
curation routine and by anyone adding tracks by hand. The procedure lives at
the bottom; the taste lives here at the top.

## Global rules

- **License bar:** CC BY, CC BY-SA, or CC0 only (redistribution must be
  permitted; BY-ND acceptable only if the file ships unmodified). Verify per
  track, not per artist. Current vetted sources: Purrple Cat via chosic.com
  (CC BY-SA 3.0), Kevin MacLeod via incompetech.com (CC BY 4.0).
  Do **not** pull from Lofi Girl label releases (Bandcamp/streaming versions
  are label-owned, not CC), Jamendo (commercial use needs a paid license),
  or anything tagged NC.
- **Curation bar:** nothing faster or busier than *Heart Of The Ocean*.
  Classic is the one upbeat exception (light chiptune).
- **Length:** prefer 2–4 minutes. Nothing under 90 seconds.
- **Pool target:** 6–10 tracks per world. Below 6 = wants more; at 10 = full,
  only swap-improvements.
- **Attribution:** every track gets a row in [README.md](README.md) and an
  entry in tracks.js (the in-game now-playing card is the attribution).

## World mood profiles

| world | wants (chosic tags / vibes) | avoid | notes |
| --- | --- | --- | --- |
| meadow | Calm, Spring, Slow, Dreamy, Hopeful, flowers/garden titles | Night, Winter, Sad | the lofi original; sunny and gentle |
| midnight | Night, Sleep, Dreamy, Ambient, moon/star titles | Morning, Uplifting (strong) | fireflies after dark; hushed |
| classic | light chiptune, retro, playful (Kevin MacLeod) | anything heavy or dark | the upbeat exception |
| sakura | Spring, Calm, Aesthetic, tea/blossom titles | heavy beats | falling petals; airy |
| tide | Calm, Dreamy, water/wave/ocean titles | harsh, busy | under the sea; flowing |
| autumn | Autumn, Nostalgia, Piano, warm/cozy titles | Spring | maple leaves; warm and settling |
| mono | sparse solo piano, classical (Satie-adjacent) | beats, vocals | quiet snowfall; near-silence |
| storm | Rain, Night, Calm, thunder/rain titles | bright, sunny | rain and far-off thunder |

New worlds: add a row here first; the pipeline picks it up from this table.

## Weekly procedure

1. `python tools/scout_tracks.py tracks.js` — lists catalog tracks by vetted
   artists that aren't in the library yet, with page URLs.
2. Shortlist by title against the mood profiles, then fetch the shortlisted
   chosic pages to check tags (the first `.mp3` URL on a track page is the
   track itself; tags are in `class="tag-name"` spans).
3. Download keepers into `music/` (curl with a browser user-agent — chosic
   403s generic fetchers). Verify each file decodes (browser `Audio`
   `loadedmetadata`, or any mp3 tool) — not just HTTP 200.
4. Add tracks.js entries (src/title/artist/link/license/worlds) and rows to
   README.md, then resolve platform links:
   `python tools/resolve_links.py tracks.js > links.json`
   `python tools/apply_links.py links.json tracks.js`
5. Bump `tracks.js?v=` in index.html.
6. Branch `music-drop/<date>`, commit, push, open a PR titled
   "Weekly music drop" listing each track as `world · title — artist (tags)`.
   The human listens and merges; taste stays human.

Storage note: at ~6 MB/track the repo can carry ~100 tracks comfortably on
GitHub Pages. Approaching that, move audio to Cloudflare R2 (free tier, no
egress fees) and point tracks.js srcs at it.

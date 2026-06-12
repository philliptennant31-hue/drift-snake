# Music credits

All tracks in this folder are used under their stated licenses, unmodified,
with attribution shown on the in-game now-playing card (which links to the
artist).

Curation bar: nothing faster or busier than *Heart Of The Ocean*.

| Track | World | Artist | License |
| --- | --- | --- | --- |
| Wildflowers | meadow | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Bloom | meadow | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Butterfly | meadow | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Crescent Moon | midnight | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Sonder | midnight | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Field Of Fireflies | midnight | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Pixelland | classic | [Kevin MacLeod](https://incompetech.com) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Bit Quest | classic | [Kevin MacLeod](https://incompetech.com) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Green Tea | sakura | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Ishikari Lore | sakura | [Kevin MacLeod](https://incompetech.com) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Spring Showers | sakura | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Heart Of The Ocean | tide | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Calm Waters | tide | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Where The Waves Take Us | tide | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Golden Hour | autumn | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Cozy Fireplace | autumn | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Equinox | autumn | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Gymnopédie No. 1 | mono | Erik Satie, perf. [Kevin MacLeod](https://incompetech.com) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Gymnopédie No. 2 | mono | Erik Satie, perf. [Kevin MacLeod](https://incompetech.com) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Gymnopédie No. 3 | mono | Erik Satie, perf. [Kevin MacLeod](https://incompetech.com) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Storm Clouds | storm | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Thunder Nap | storm | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Rainy Streets | storm | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Daydreams | anywhere | [Purrple Cat](https://soundcloud.com/purrplecat) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |

Tracks sourced via [chosic.com](https://www.chosic.com/free-music/lofi/).

## Adding a track

1. Confirm the license permits redistribution (CC BY / BY-SA / BY-ND / CC0,
   or the artist's written permission). Files must stay unmodified for ND.
2. Drop the audio file in this folder.
3. Add an entry to `tracks.js` (title, artist, link, license, worlds) and
   bump the `tracks.js?v=` number in index.html.
4. Resolve streaming links for the now-playing card's platform buttons:
   `python tools/resolve_links.py tracks.js > links.json` then
   `python tools/apply_links.py links.json tracks.js`. Tracks that aren't
   on streaming simply don't get buttons.
5. Add a row to this table.

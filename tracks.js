'use strict';

// Artist tracks for the "artists" music mode. Every entry is shown on the
// in-game now-playing card with the artist credited and linked — that card
// is the attribution the licenses ask for. `worlds` ties a track to specific
// worlds; tracks without it form the anywhere pool. To add a track: drop the
// file in music/, add an entry here, and add a row to music/README.md.
const TRACKS = [
  // meadow — sunny, warm
  {
    src: 'music/Morning Routine.mp3',
    title: 'Morning Routine', artist: 'Ghostrifter Official',
    link: 'https://soundcloud.com/ghostrifter-official', license: 'CC BY-SA 3.0',
    worlds: ['meadow'],
  },
  {
    src: 'music/Beloved.mp3',
    title: 'Beloved', artist: 'Roa',
    link: 'https://soundcloud.com/roa_music1031', license: 'CC BY 3.0',
    worlds: ['meadow'],
  },
  // midnight — dim and dreamy
  {
    src: 'music/Late at Night.mp3',
    title: 'Late at Night', artist: 'Sakura Girl',
    link: 'https://soundcloud.com/sakuragirl_official', license: 'CC BY 3.0',
    worlds: ['midnight'],
  },
  {
    src: 'music/Purple Dream.mp3',
    title: 'Purple Dream', artist: 'Ghostrifter Official',
    link: 'https://soundcloud.com/ghostrifter-official', license: 'CC BY-ND 3.0',
    worlds: ['midnight'],
  },
  // classic — chiptune
  {
    src: 'music/Pixelland.mp3',
    title: 'Pixelland', artist: 'Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
    worlds: ['classic'],
  },
  // sakura — wistful, eastern colour
  {
    src: 'music/Sonder.mp3',
    title: 'Sonder', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
    worlds: ['sakura'],
  },
  {
    src: 'music/Ishikari Lore.mp3',
    title: 'Ishikari Lore', artist: 'Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
    worlds: ['sakura'],
  },
  // tide — under the sea
  {
    src: 'music/Heart Of The Ocean.mp3',
    title: 'Heart Of The Ocean', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
    worlds: ['tide'],
  },
  // autumn — warm and wistful
  {
    src: 'music/Embrace.mp3',
    title: 'Embrace', artist: 'Roa',
    link: 'https://soundcloud.com/roa_music1031', license: 'CC BY 3.0',
    worlds: ['autumn'],
  },
  // mono — quiet snowfall
  {
    src: 'music/Echoes In Blue.mp3',
    title: 'Echoes In Blue', artist: 'Tokyo Music Walker',
    link: 'https://soundcloud.com/user-356546060', license: 'CC BY 3.0',
    worlds: ['mono'],
  },
  {
    src: 'music/Gymnopedie No 1.mp3',
    title: 'Gymnopédie No. 1', artist: 'Erik Satie, perf. Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
    worlds: ['mono'],
  },
  // anywhere
  {
    src: 'music/Magical Moments.mp3',
    title: 'Magical Moments', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
  },
  {
    src: 'music/Downtown Glow.mp3',
    title: 'Downtown Glow', artist: 'Ghostrifter Official & Devyzed',
    link: 'https://soundcloud.com/ghostrifter-official', license: 'CC BY-ND 3.0',
  },
];

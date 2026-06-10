'use strict';

// Artist tracks for the "artists" music mode. Every entry is shown on the
// in-game now-playing card with the artist credited and linked — that card
// is the CC-BY attribution. `worlds` ties a track to specific worlds; tracks
// without it form the anywhere pool. To add a track: drop the file in
// music/, add an entry here, and add a row to music/README.md.
const TRACKS = [
  {
    src: 'music/Carefree.mp3',
    title: 'Carefree', artist: 'Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
    worlds: ['meadow'],
  },
  {
    src: 'music/Friendly Day.mp3',
    title: 'Friendly Day', artist: 'Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
    worlds: ['meadow'],
  },
  {
    src: 'music/Fireflies and Stardust.mp3',
    title: 'Fireflies and Stardust', artist: 'Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
    worlds: ['midnight'],
  },
  {
    src: 'music/Dreamy Flashback.mp3',
    title: 'Dreamy Flashback', artist: 'Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
    worlds: ['midnight'],
  },
  {
    src: 'music/Pixelland.mp3',
    title: 'Pixelland', artist: 'Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
    worlds: ['classic'],
  },
  {
    src: 'music/Ishikari Lore.mp3',
    title: 'Ishikari Lore', artist: 'Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
    worlds: ['sakura'],
  },
  {
    src: 'music/Water Prelude.mp3',
    title: 'Water Prelude', artist: 'Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
    worlds: ['tide'],
  },
  {
    src: 'music/Autumn Day.mp3',
    title: 'Autumn Day', artist: 'Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
    worlds: ['autumn'],
  },
  {
    src: 'music/Gymnopedie No 1.mp3',
    title: 'Gymnopédie No. 1', artist: 'Erik Satie, perf. Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
    worlds: ['mono'],
  },
  {
    src: 'music/Lobby Time.mp3',
    title: 'Lobby Time', artist: 'Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
  },
];

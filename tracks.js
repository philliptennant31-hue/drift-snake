'use strict';

// Artist tracks for the "artists" music mode. Every entry is shown on the
// in-game now-playing card with the artist credited and linked — that card
// is the attribution the licenses ask for. `worlds` ties a track to specific
// worlds; tracks without it form the anywhere pool.
//
// Curation bar: nothing faster or busier than Heart Of The Ocean.
const TRACKS = [
  // meadow
  {
    src: 'music/Wildflowers.mp3',
    title: 'Wildflowers', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
    worlds: ['meadow'],
  },
  // midnight
  {
    src: 'music/Crescent Moon.mp3',
    title: 'Crescent Moon', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
    worlds: ['midnight'],
  },
  {
    src: 'music/Sonder.mp3',
    title: 'Sonder', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
    worlds: ['midnight'],
  },
  // classic — deliberately retro, the one upbeat exception
  {
    src: 'music/Pixelland.mp3',
    title: 'Pixelland', artist: 'Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
    worlds: ['classic'],
  },
  // sakura
  {
    src: 'music/Green Tea.mp3',
    title: 'Green Tea', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
    worlds: ['sakura'],
  },
  {
    src: 'music/Ishikari Lore.mp3',
    title: 'Ishikari Lore', artist: 'Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
    worlds: ['sakura'],
  },
  // tide — the benchmark
  {
    src: 'music/Heart Of The Ocean.mp3',
    title: 'Heart Of The Ocean', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
    worlds: ['tide'],
  },
  // autumn
  {
    src: 'music/Golden Hour.mp3',
    title: 'Golden Hour', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
    worlds: ['autumn'],
  },
  // mono
  {
    src: 'music/Gymnopedie No 1.mp3',
    title: 'Gymnopédie No. 1', artist: 'Erik Satie, perf. Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
    worlds: ['mono'],
  },
  // anywhere
  {
    src: 'music/Daydreams.mp3',
    title: 'Daydreams', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
  },
];

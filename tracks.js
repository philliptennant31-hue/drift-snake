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
  {
    src: 'music/Bloom.mp3',
    title: 'Bloom', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
    worlds: ['meadow'],
  },
  {
    src: 'music/Butterfly.mp3',
    title: 'Butterfly', artist: 'Purrple Cat',
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
  {
    src: 'music/Field Of Fireflies.mp3',
    title: 'Field Of Fireflies', artist: 'Purrple Cat',
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
  {
    src: 'music/Bit Quest.mp3',
    title: 'Bit Quest', artist: 'Kevin MacLeod',
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
  {
    src: 'music/Spring Showers.mp3',
    title: 'Spring Showers', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
    worlds: ['sakura'],
  },
  // tide — the benchmark
  {
    src: 'music/Heart Of The Ocean.mp3',
    title: 'Heart Of The Ocean', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
    worlds: ['tide'],
  },
  {
    src: 'music/Calm Waters.mp3',
    title: 'Calm Waters', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
    worlds: ['tide'],
  },
  {
    src: 'music/Where The Waves Take Us.mp3',
    title: 'Where The Waves Take Us', artist: 'Purrple Cat',
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
  {
    src: 'music/Cozy Fireplace.mp3',
    title: 'Cozy Fireplace', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
    worlds: ['autumn'],
  },
  {
    src: 'music/Equinox.mp3',
    title: 'Equinox', artist: 'Purrple Cat',
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
  {
    src: 'music/Gymnopedie No 2.mp3',
    title: 'Gymnopédie No. 2', artist: 'Erik Satie, perf. Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
    worlds: ['mono'],
  },
  {
    src: 'music/Gymnopedie No 3.mp3',
    title: 'Gymnopédie No. 3', artist: 'Erik Satie, perf. Kevin MacLeod',
    link: 'https://incompetech.com', license: 'CC BY 4.0',
    worlds: ['mono'],
  },
  // storm
  {
    src: 'music/Storm Clouds.mp3',
    title: 'Storm Clouds', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
    worlds: ['storm'],
  },
  {
    src: 'music/Thunder Nap.mp3',
    title: 'Thunder Nap', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
    worlds: ['storm'],
  },
  {
    src: 'music/Rainy Streets.mp3',
    title: 'Rainy Streets', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
    worlds: ['storm'],
  },
  // anywhere
  {
    src: 'music/Daydreams.mp3',
    title: 'Daydreams', artist: 'Purrple Cat',
    link: 'https://soundcloud.com/purrplecat', license: 'CC BY-SA 3.0',
  },
];

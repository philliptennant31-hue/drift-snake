'use strict';

// Sound engine: SFX bus + generative lofi music with a mood per palette,
// plus an independent rain layer. All WebAudio, no files.
const Sound = (() => {
  let ctx = null, master, sfxBus, musicBus, musicFade;
  let musicLp = null, crackleGain = null, waveGain = null, rainGain = null;
  let schedTimer = null, nextWindowAt = 0, windowIdx = 0;
  let vols = { sfx: 0.8, music: 0.5 };
  let muted = false, rainWanted = false;
  let moodKey = 'meadow';

  const midi = m => 440 * Math.pow(2, (m - 69) / 12);

  const MOODS = {
    meadow: {                                   // warm maj7 pad with birdsong
      style: 'pad', lp: 760, crackle: 0.10, wave: 0, gap: 6.5, dur: 7.2, nature: 'birds',
      chords: [[53, 57, 60, 64], [57, 60, 64, 67], [50, 53, 57, 60], [46, 50, 53, 57]],
      bass: [41, 45, 38, 34],
    },
    midnight: {                                 // slow low pads, crickets in the dark
      style: 'pad', lp: 600, crackle: 0.17, wave: 0, gap: 8.2, dur: 9.2, nature: 'crickets',
      chords: [[45, 52, 55, 59], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 55]],
      bass: [33, 29, 31, 28],
    },
    tide: {                                     // open chords over an ocean swell
      style: 'pad', lp: 820, crackle: 0.05, wave: 0.05, gap: 7, dur: 7.8, nature: 'water',
      chords: [[48, 55, 59, 62], [45, 52, 57, 60], [41, 48, 55, 57], [43, 50, 55, 59]],
      bass: [36, 33, 29, 31],
    },
    sakura: {                                   // hirajoshi-scale plucks, wind chimes
      style: 'pluck', lp: 1100, crackle: 0.08, wave: 0, gap: 6.4, dur: 6.8, nature: 'chime',
      chords: [[57, 59, 60, 64, 65, 69, 72], [64, 65, 69, 71, 72, 76, 77]],
      drone: [45, 57], bass: [33, 36], pluckType: 'triangle',
    },
    classic: {                                  // cheerful marimba blips
      style: 'pluck', lp: 1400, crackle: 0.04, wave: 0, gap: 5.5, dur: 5.8, nature: null,
      chords: [[60, 62, 64, 67, 69, 72], [57, 60, 62, 64, 67, 69]],
      drone: [48, 55], bass: [36, 33], pluckType: 'sine',
    },
    autumn: {                                   // warm low pads, wind in the leaves
      style: 'pad', lp: 680, crackle: 0.13, wave: 0, gap: 7.5, dur: 8.4, nature: 'wind',
      chords: [[51, 55, 58, 62], [48, 51, 55, 58], [44, 48, 51, 55], [46, 50, 53, 57]],
      bass: [39, 36, 32, 34],
    },
    mono: {                                     // sparse piano-like notes, lots of air
      style: 'pluck', lp: 1000, crackle: 0.14, wave: 0, gap: 7, dur: 7.4, nature: null,
      chords: [[57, 60, 64, 67, 72], [55, 59, 62, 67, 71]],
      drone: [45], bass: [33, 31], pluckType: 'sine',
    },
  };
  const mood = () => MOODS[moodKey] || MOODS.meadow;

  function ensure() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return true;
    }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { return false; }
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = vols.sfx * 0.9;
    sfxBus.connect(master);
    musicFade = ctx.createGain();
    musicFade.gain.value = 1;
    musicBus = ctx.createGain();
    musicBus.gain.value = vols.music * 0.6;
    musicFade.connect(musicBus).connect(master);
    if (rainWanted) startRainNode();
    return true;
  }

  function noiseBuffer(seconds, sparse) {
    const len = Math.floor(seconds * ctx.sampleRate);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      if (sparse) { if (Math.random() < 0.0012) data[i] = (Math.random() * 2 - 1) * 0.5; }
      else data[i] = Math.random() * 2 - 1;
    }
    return buf;
  }

  function loopNoise(buf) {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.start();
    return src;
  }

  // ----- music graph -----
  function buildMusicGraph() {
    if (musicLp) return;
    musicLp = ctx.createBiquadFilter();
    musicLp.type = 'lowpass';
    musicLp.frequency.value = mood().lp;
    musicLp.Q.value = 0.5;
    musicLp.connect(musicFade);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 150;
    lfo.connect(lfoGain).connect(musicLp.frequency);
    lfo.start();

    // vinyl crackle
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 3200;
    bp.Q.value = 0.4;
    crackleGain = ctx.createGain();
    crackleGain.gain.value = mood().crackle;
    loopNoise(noiseBuffer(3, true)).connect(bp);
    bp.connect(crackleGain).connect(musicFade);

    // ocean swell (gain 0 unless the mood wants it)
    const wlp = ctx.createBiquadFilter();
    wlp.type = 'lowpass';
    wlp.frequency.value = 420;
    waveGain = ctx.createGain();
    waveGain.gain.value = mood().wave;
    const wlfo = ctx.createOscillator();
    wlfo.frequency.value = 0.07;
    const wlfoGain = ctx.createGain();
    wlfoGain.gain.value = mood().wave * 0.7;
    wlfo.connect(wlfoGain).connect(waveGain.gain);
    wlfo.start();
    loopNoise(noiseBuffer(2, false)).connect(wlp);
    wlp.connect(waveGain).connect(musicFade);
  }

  function padNote(at, n, dur, peak, type, det) {
    const o = ctx.createOscillator();
    o.type = type || 'triangle';
    o.frequency.value = midi(n);
    o.detune.value = det || 0;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(peak, at + Math.min(1.5, dur * 0.25));
    env.gain.setValueAtTime(peak, at + dur - 1.8);
    env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(env).connect(musicLp);
    o.start(at);
    o.stop(at + dur + 0.1);
  }

  function pluckNote(at, n, type) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = midi(n);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.085, at);
    env.gain.exponentialRampToValueAtTime(0.0001, at + 0.9);
    o.connect(env).connect(musicLp);
    o.start(at);
    o.stop(at + 1);
  }

  function bassNote(at, n, dur) {
    const b = ctx.createOscillator();
    b.type = 'sine';
    b.frequency.value = midi(n);
    const be = ctx.createGain();
    be.gain.setValueAtTime(0.0001, at);
    be.gain.exponentialRampToValueAtTime(0.06, at + 0.8);
    be.gain.setValueAtTime(0.06, at + dur - 1.5);
    be.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    b.connect(be).connect(musicFade);
    b.start(at);
    b.stop(at + dur + 0.1);
  }

  // ----- nature layer: quiet scene sounds that ride the music volume -----
  // routed around the lowpass so chirps and chimes keep their sparkle
  function natureTone(at, f0, f1, dur, vol, type) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, at);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), at + dur);
    g.gain.setValueAtTime(vol, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g).connect(musicFade);
    o.start(at);
    o.stop(at + dur + 0.05);
  }

  let windBuf = null;
  const NATURE = {
    birds(at) {
      const base = 1900 + Math.random() * 700;
      const n = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const t = at + i * (0.12 + Math.random() * 0.06);
        natureTone(t, base * (1 + Math.random() * 0.15), base * (1.25 + Math.random() * 0.2), 0.09, 0.016);
      }
    },
    chime(at) {
      const notes = [81, 84, 86, 88, 91];
      let t = at;
      const n = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const f = midi(notes[Math.floor(Math.random() * notes.length)]);
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.011, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
        o.connect(g).connect(musicFade);
        o.start(t);
        o.stop(t + 2.5);
        t += 0.15 + Math.random() * 0.3;
      }
    },
    crickets(at) {
      for (let train = 0; train < 2; train++) {
        const t0 = at + train * 0.28;
        for (let i = 0; i < 3; i++) {
          natureTone(t0 + i * 0.045, 4300, 4200, 0.025, 0.011, 'triangle');
        }
      }
    },
    water(at) {
      natureTone(at, 340 + Math.random() * 120, 150, 0.5, 0.014);
      if (Math.random() < 0.5) natureTone(at + 0.4, 500, 260, 0.3, 0.008);
    },
    wind(at) {
      if (!windBuf) windBuf = noiseBuffer(3, false);
      const src = ctx.createBufferSource();
      src.buffer = windBuf;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 450;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.032, at + 1.6);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 4.2);
      src.connect(lp).connect(g).connect(musicFade);
      src.start(at);
      src.stop(at + 4.4);
    },
  };

  function natureEvents(at, m) {
    const play = NATURE[m.nature];
    if (!play) return;
    const count = 1 + (Math.random() < 0.4 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      play(at + 0.3 + Math.random() * (m.gap - 1.2));
    }
  }

  function playWindow(at, idx) {
    const m = mood();
    if (m.style === 'pad') {
      const notes = m.chords[idx % m.chords.length];
      for (const n of notes) {
        padNote(at, n, m.dur, 0.045, 'triangle');
        padNote(at, n, m.dur, 0.012, 'sawtooth', 7);
      }
      bassNote(at, m.bass[idx % m.bass.length], m.dur);
    } else {
      for (const n of m.drone) padNote(at, n, m.dur, 0.02, 'triangle');
      bassNote(at, m.bass[idx % m.bass.length], m.dur);
      const pool = m.chords[idx % m.chords.length];
      const count = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const when = at + 0.1 + Math.random() * (m.gap - 0.8);
        pluckNote(when, pool[Math.floor(Math.random() * pool.length)], m.pluckType);
      }
    }
    natureEvents(at, m);
  }

  function startMusic() {
    if (!ensure() || schedTimer) return;
    buildMusicGraph();
    musicFade.gain.cancelScheduledValues(ctx.currentTime);
    musicFade.gain.setValueAtTime(0.0001, ctx.currentTime);
    musicFade.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 2);
    nextWindowAt = ctx.currentTime + 0.15;
    schedTimer = setInterval(() => {
      while (nextWindowAt < ctx.currentTime + 2.5) {
        playWindow(nextWindowAt, windowIdx++);
        nextWindowAt += mood().gap;
      }
    }, 400);
  }

  function stopMusic() {
    if (!schedTimer) return;
    clearInterval(schedTimer);
    schedTimer = null;
    if (ctx) {
      musicFade.gain.cancelScheduledValues(ctx.currentTime);
      musicFade.gain.setValueAtTime(musicFade.gain.value, ctx.currentTime);
      musicFade.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    }
  }

  // ----- rain (independent of the music bus, so it works in pure-SFX setups) -----
  function startRainNode() {
    if (rainGain || !ctx) return;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1500;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.21;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 250;
    lfo.connect(lfoGain).connect(lp.frequency);
    lfo.start();
    rainGain = ctx.createGain();
    rainGain.gain.value = 0.0001;
    loopNoise(noiseBuffer(2.5, false)).connect(lp);
    lp.connect(rainGain).connect(master);
    rainGain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 2);
  }

  // ----- sfx -----
  function blip(f0, f1, dur, vol, type, at) {
    if (!ensure()) return;
    const t = (at || ctx.currentTime);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(sfxBus);
    o.start(t); o.stop(t + dur + 0.02);
  }

  const LADDER = [0, 2, 4, 7, 9, 12, 14, 16];

  return {
    ensure,
    initVolumes(sfx, music) { vols.sfx = sfx; vols.music = music; },
    setMuted(m) {
      muted = m;
      if (ctx) master.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.03);
    },
    setVolumes(sfx, music) {
      vols.sfx = sfx; vols.music = music;
      if (ctx) {
        sfxBus.gain.setTargetAtTime(sfx * 0.9, ctx.currentTime, 0.05);
        musicBus.gain.setTargetAtTime(music * 0.6, ctx.currentTime, 0.05);
      }
      if (music > 0) startMusic(); else stopMusic();
    },
    musicWanted: () => vols.music > 0,
    setMood(key) {
      moodKey = key;
      if (!ctx || !musicLp) return;
      const m = mood();
      musicLp.frequency.setTargetAtTime(m.lp, ctx.currentTime, 0.5);
      crackleGain.gain.setTargetAtTime(m.crackle, ctx.currentTime, 0.5);
      waveGain.gain.setTargetAtTime(m.wave, ctx.currentTime, 1.0);
    },
    setRain(on) {
      rainWanted = on;
      if (!ctx) return;
      if (on) {
        ensure();
        startRainNode();
        rainGain.gain.cancelScheduledValues(ctx.currentTime);
        rainGain.gain.setTargetAtTime(0.05, ctx.currentTime, 0.8);
      } else if (rainGain) {
        rainGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.5);
      }
    },
    startMusic, stopMusic,

    ui()    { blip(700, 740, 0.05, 0.05); },
    turn()  { blip(300, 340, 0.04, 0.02); },
    pop(n)  {
      const f = 520 * Math.pow(2, LADDER[n % LADDER.length] / 12);
      blip(f, f * 1.5, 0.14, 0.16);
      blip(f * 1.5, f * 2.2, 0.10, 0.07);
    },
    bonusSpawn() {
      if (!ensure()) return;
      blip(660, 680, 0.12, 0.07);
      blip(990, 1010, 0.14, 0.06, 'sine', ctx.currentTime + 0.10);
    },
    bonusTick() { blip(1500, 1480, 0.03, 0.035); },
    bonusEat(pts) {
      if (!ensure()) return;
      const base = 660;
      for (let i = 0; i < Math.min(2 + pts, 6); i++) {
        const f = base * Math.pow(2, [0, 4, 7, 12, 16, 19][i] / 12);
        blip(f, f * 1.2, 0.16, 0.10, 'sine', ctx.currentTime + i * 0.055);
      }
    },
    bonusGone() { blip(500, 240, 0.22, 0.045); },
    unlock() {
      if (!ensure()) return;
      for (let i = 0; i < 4; i++) {
        const f = 523 * Math.pow(2, [0, 4, 7, 12][i] / 12);
        blip(f, f * 1.1, 0.3, 0.09, 'triangle', ctx.currentTime + i * 0.12);
      }
    },
    timeUp() {
      if (!ensure()) return;
      blip(880, 870, 0.25, 0.08);
      blip(660, 650, 0.4, 0.08, 'sine', ctx.currentTime + 0.25);
    },
    die() { blip(280, 110, 0.5, 0.16); blip(180, 70, 0.65, 0.10, 'triangle'); },
    pause() { blip(420, 380, 0.12, 0.05); },
  };
})();

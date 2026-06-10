'use strict';

// Sound engine. SFX bus + generative music where every world has its own
// instrument, not just its own chords:
//   meadow   — warm pads + music-box sparkles + birdsong
//   midnight — slow breathing pads with real silence between, crickets
//   tide     — shimmering detuned sines over a loud ocean swell, water blips
//   sakura   — koto phrases on the hirajoshi scale, wind chimes
//   classic  — light chiptune: square-wave melody and bass pulses
//   autumn   — low amber pads, wind gusts
//   mono     — sparse felt piano under heavy vinyl crackle
// All synthesized live in WebAudio; world switches crossfade instantly.
const Sound = (() => {
  let ctx = null, master, sfxBus, musicBus, musicFade;
  let musicLp = null, crackleGain = null, waveGain = null, wlfoGain = null, rainGain = null;
  let busLp = null, busDry = null;            // per-mood buses, swapped on world change
  let schedTimer = null, nextWindowAt = 0, windowIdx = 0;
  let vols = { sfx: 0.8, music: 0.5 };
  let muted = false, rainWanted = false;
  let moodKey = 'meadow';

  const midi = m => 440 * Math.pow(2, (m - 69) / 12);

  const MOODS = {
    meadow: {
      style: 'pad', padType: 'triangle', saw: true, melody: 'celesta', attack: 1.5,
      lp: 760, crackle: 0.10, wave: 0, gap: 6.5, dur: 7.2, nature: 'birds',
      chords: [[53, 57, 60, 64], [57, 60, 64, 67], [50, 53, 57, 60], [46, 50, 53, 57]],
      bass: [41, 45, 38, 34],
    },
    midnight: {
      style: 'pad', padType: 'triangle', saw: false, melody: false, attack: 3.2,
      lp: 520, crackle: 0.18, wave: 0, gap: 10.5, dur: 7.6, nature: 'crickets',
      chords: [[45, 52, 55, 59], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 55]],
      bass: [33, 29, 31, 28],
    },
    tide: {
      style: 'pad', padType: 'sine', saw: false, melody: false, shimmer: true, attack: 2.2,
      lp: 920, crackle: 0.03, wave: 0.13, gap: 7, dur: 7.8, nature: 'water',
      chords: [[48, 55, 59, 62], [45, 52, 57, 60], [41, 48, 55, 57], [43, 50, 55, 59]],
      bass: [36, 33, 29, 31],
    },
    sakura: {
      style: 'pad', padType: 'triangle', saw: false, melody: 'koto', attack: 2.0,
      lp: 800, crackle: 0.06, wave: 0, gap: 7, dur: 7.6, nature: 'chime',
      chords: [[45, 52, 57, 64], [43, 50, 55, 62], [41, 48, 53, 60], [45, 52, 57, 62]],
      bass: [33, 31, 29, 33],
    },
    classic: {
      style: 'chip',
      lp: 2600, crackle: 0.02, wave: 0, gap: 5.6, dur: 5.6, nature: null,
      bass: [],
    },
    autumn: {
      style: 'pad', padType: 'triangle', saw: true, melody: false, attack: 2.0,
      lp: 680, crackle: 0.05, wave: 0, gap: 7.5, dur: 8.4, nature: 'wind',
      chords: [[51, 55, 58, 62], [48, 51, 55, 58], [44, 48, 51, 55], [46, 50, 53, 57]],
      bass: [39, 36, 32, 34],
    },
    mono: {
      style: 'piano',
      lp: 1100, crackle: 0.05, wave: 0, gap: 7.5, dur: 7.5, nature: null,
      bass: [],
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
    if (rainWanted) {
      startRainNode();
      startRainDrops();
      rainGain.gain.setTargetAtTime(1, ctx.currentTime, 0.7);
    }
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
  function swapBuses() {
    if (busLp) {
      const oldL = busLp, oldD = busDry;
      oldL.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.12);
      oldD.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.12);
      setTimeout(() => { try { oldL.disconnect(); oldD.disconnect(); } catch (e) {} }, 1500);
    }
    busLp = ctx.createGain();
    busLp.connect(musicLp);
    busDry = ctx.createGain();
    busDry.connect(musicFade);
  }

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
    lfoGain.gain.value = 130;
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
    wlfoGain = ctx.createGain();
    wlfoGain.gain.value = mood().wave * 0.7;
    wlfo.connect(wlfoGain).connect(waveGain.gain);
    wlfo.start();
    loopNoise(noiseBuffer(2, false)).connect(wlp);
    wlp.connect(waveGain).connect(musicFade);

    swapBuses();
  }

  // ----- instruments -----
  function padNote(at, n, m, peak, type, det) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = midi(n);
    o.detune.value = det || 0;
    if (m.shimmer) {
      const sl = ctx.createOscillator();
      sl.frequency.value = 0.12 + Math.random() * 0.1;
      const sg = ctx.createGain();
      sg.gain.value = 7;
      sl.connect(sg).connect(o.detune);
      sl.start(at);
      sl.stop(at + m.dur + 0.2);
    }
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(peak, at + Math.min(m.attack || 1.2, m.dur * 0.3));
    env.gain.setValueAtTime(peak, at + m.dur - 1.8);
    env.gain.exponentialRampToValueAtTime(0.0001, at + m.dur);
    o.connect(env).connect(busLp);
    o.start(at);
    o.stop(at + m.dur + 0.3);
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
    b.connect(be).connect(busDry);
    b.start(at);
    b.stop(at + dur + 0.1);
  }

  function celestaNote(at, n) {
    for (const [mult, vol, dec] of [[1, 0.02, 1.7], [4, 0.005, 0.8]]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = midi(n) * mult;
      g.gain.setValueAtTime(vol, at);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dec);
      o.connect(g).connect(busDry);
      o.start(at);
      o.stop(at + dec + 0.1);
    }
  }

  function kotoNote(at, n) {
    const f = midi(n);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(f * 1.012, at);     // slight settle, like a real string
    o.frequency.exponentialRampToValueAtTime(f, at + 0.08);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.06, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 1.8);
    o.connect(g).connect(busLp);
    o.start(at);
    o.stop(at + 1.9);
    const o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine';
    o2.frequency.value = f * 2;
    g2.gain.setValueAtTime(0.0001, at);
    g2.gain.exponentialRampToValueAtTime(0.016, at + 0.012);
    g2.gain.exponentialRampToValueAtTime(0.0001, at + 0.7);
    o2.connect(g2).connect(busLp);
    o2.start(at);
    o2.stop(at + 0.8);
  }

  function chipNote(at, n, vol, len) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = midi(n);
    g.gain.setValueAtTime(vol, at);
    g.gain.setValueAtTime(vol, at + len - 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    o.connect(g).connect(busLp);
    o.start(at);
    o.stop(at + len + 0.02);
  }

  function feltNote(at, n) {
    const f = midi(n);
    for (const [mult, vol, dec] of [[1, 0.055, 3.4], [2, 0.018, 1.6], [3, 0.006, 0.8]]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f * mult;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(vol, at + 0.045);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dec);
      o.connect(g).connect(busLp);
      o.start(at);
      o.stop(at + dec + 0.1);
    }
  }

  // ----- nature layer (rides the music volume, bypasses the lowpass) -----
  function natureTone(at, f0, f1, dur, vol, type) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, at);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), at + dur);
    g.gain.setValueAtTime(vol, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g).connect(busDry);
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
        g.gain.setValueAtTime(0.009, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
        o.connect(g).connect(busDry);
        o.start(t);
        o.stop(t + 2.5);
        t += 0.15 + Math.random() * 0.3;
      }
    },
    crickets(at) {
      for (let train = 0; train < 2; train++) {
        const t0 = at + train * 0.28;
        for (let i = 0; i < 3; i++) {
          natureTone(t0 + i * 0.045, 4300, 4200, 0.025, 0.012, 'triangle');
        }
      }
    },
    water(at) {
      natureTone(at, 340 + Math.random() * 120, 150, 0.5, 0.03);
      if (Math.random() < 0.6) natureTone(at + 0.4, 500, 260, 0.3, 0.018);
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
      src.connect(lp).connect(g).connect(busDry);
      src.start(at);
      src.stop(at + 4.4);
    },
  };

  function natureEvents(at, m) {
    const play = NATURE[m.nature];
    if (!play) return;
    const count = 1 + (Math.random() < 0.5 ? 1 : 0);
    for (let i = 0; i < count; i++) {
      play(at + 0.3 + Math.random() * (m.gap - 1.2));
    }
  }

  // ----- one window of music in the current mood -----
  const HIRAJOSHI = [57, 59, 60, 64, 65, 69, 71, 72, 76, 77];
  function playWindow(at, idx) {
    const m = mood();
    if (m.style === 'pad') {
      const notes = m.chords[idx % m.chords.length];
      for (const n of notes) {
        padNote(at, n, m, m.saw ? 0.045 : 0.05, m.padType);
        if (m.saw) padNote(at, n, m, 0.012, 'sawtooth', 7);
      }
      bassNote(at, m.bass[idx % m.bass.length], m.dur);
      if (m.melody === 'celesta' && Math.random() < 0.8) {
        const pool = m.chords[idx % m.chords.length];
        const n = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < n; i++) {
          celestaNote(at + 1 + Math.random() * (m.gap - 2), pool[Math.floor(Math.random() * pool.length)] + 12);
        }
      } else if (m.melody === 'koto' && Math.random() < 0.85) {
        // a sparse koto accent drifting down the hirajoshi scale over the pads
        let scaleIdx = 5 + Math.floor(Math.random() * 4);
        let t = at + 1 + Math.random() * 1.5;
        const notes = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < notes; i++) {
          kotoNote(t, HIRAJOSHI[Math.max(0, Math.min(HIRAJOSHI.length - 1, scaleIdx))]);
          scaleIdx -= 1 + Math.floor(Math.random() * 2);
          t += 0.6 + Math.random() * 0.9;
        }
      }
    } else if (m.style === 'chip') {
      const scale = [60, 62, 64, 67, 69, 72, 74];
      const step = 0.235;
      let scaleIdx = 2 + Math.floor(Math.random() * 3);
      const len = 16 + Math.floor(Math.random() * 2) * 4;
      for (let i = 0; i < len; i++) {
        const t = at + i * step;
        if (i % 4 === 0) chipNote(t, scale[scaleIdx % scale.length] - 24, 0.02, step * 0.7);
        if (Math.random() < 0.22) continue;   // rest
        scaleIdx = Math.max(0, Math.min(scale.length - 1,
          scaleIdx + (Math.random() < 0.5 ? 1 : -1) * (Math.random() < 0.2 ? 2 : 1)));
        chipNote(t, scale[scaleIdx], 0.011, step * 0.85);
      }
    } else if (m.style === 'piano') {
      // gentle arpeggio phrases, always consonant
      const seqs = [
        [57, 64, 69, 72, 69, 64],
        [60, 64, 67, 72, 67, 64],
        [57, 62, 64, 69, 64, 62],
        [55, 60, 64, 67, 64, 60],
      ];
      const seq = seqs[Math.floor(Math.random() * seqs.length)];
      const step = 0.55 + Math.random() * 0.2;
      const t0 = at + 0.3;
      seq.forEach((n, i) => feltNote(t0 + i * step, n));
      if (Math.random() < 0.5) feltNote(t0 + seq.length * step + 0.4, seq[0] - 12);
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
        // one bad note must never silence a world
        try { playWindow(nextWindowAt, windowIdx++); } catch (e) {}
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

  // ----- rain: real rain is mostly hiss — broadband noise shaped to the
  // high-mids, with soft unpitched patter underneath (no tonal pings) -----
  let rainTimer = null, rainBuf = null;
  function startRainNode() {
    if (rainGain || !ctx) return;
    rainGain = ctx.createGain();
    rainGain.gain.value = 0.0001;
    rainGain.connect(master);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 900;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 6000;
    const bed = ctx.createGain();
    bed.gain.value = 0.034;
    loopNoise(noiseBuffer(2.5, false)).connect(hp);
    hp.connect(lp).connect(bed).connect(rainGain);
    // fast faint shimmer so the hiss doesn't sound frozen
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 9;
    const lg = ctx.createGain();
    lg.gain.value = 0.007;
    lfo.connect(lg).connect(bed.gain);
    lfo.start();
    rainBuf = noiseBuffer(0.05, false);
  }
  function dropTick(at) {
    const src = ctx.createBufferSource();
    src.buffer = rainBuf;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1600 + Math.random() * 2000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.005 + Math.random() * 0.015, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.018 + Math.random() * 0.03);
    src.connect(lp).connect(g).connect(rainGain);
    src.start(at);
  }
  function startRainDrops() {
    if (rainTimer) return;
    let nextDrop = ctx.currentTime + 0.05;
    rainTimer = setInterval(() => {
      while (nextDrop < ctx.currentTime + 0.6) {
        try { dropTick(nextDrop); } catch (e) {}
        nextDrop += 0.03 + Math.random() * 0.08;
      }
    }, 200);
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
    o.start(t);
    o.stop(t + dur + 0.02);
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
      const t = ctx.currentTime;
      musicLp.frequency.setTargetAtTime(m.lp, t, 0.3);
      crackleGain.gain.setTargetAtTime(m.crackle, t, 0.4);
      waveGain.gain.setTargetAtTime(m.wave, t, 0.6);
      wlfoGain.gain.setTargetAtTime(m.wave * 0.7, t, 0.6);
      if (schedTimer) {
        // hard switch: silence the old world's voices, start the new one now
        swapBuses();
        windowIdx = 0;
        nextWindowAt = t + 0.25;
      }
    },
    setRain(on) {
      rainWanted = on;
      if (!ctx) return;
      if (on) {
        ensure();
        startRainNode();
        startRainDrops();
        rainGain.gain.cancelScheduledValues(ctx.currentTime);
        rainGain.gain.setTargetAtTime(1, ctx.currentTime, 0.7);
      } else {
        if (rainGain) rainGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4);
        if (rainTimer) { clearInterval(rainTimer); rainTimer = null; }
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

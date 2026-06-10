'use strict';

// Sound engine: SFX bus + generative lofi music bus, all WebAudio, no files.
const Sound = (() => {
  let ctx = null, master, sfxBus, musicBus, musicFade;
  let musicLp = null, crackle = null;
  let schedTimer = null, nextChordAt = 0, chordIdx = 0;
  let vols = { sfx: 0.8, music: 0.5 };
  let muted = false;

  const midi = m => 440 * Math.pow(2, (m - 69) / 12);
  const CHORDS = [
    [53, 57, 60, 64],   // Fmaj7
    [57, 60, 64, 67],   // Am7
    [50, 53, 57, 60],   // Dm7
    [46, 50, 53, 57],   // Bbmaj7
  ];
  const BASS = [41, 45, 38, 34];
  const CHORD_GAP = 6.5, CHORD_DUR = 7.2;

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
    return true;
  }

  // ----- music -----
  function buildMusicGraph() {
    if (musicLp) return;
    musicLp = ctx.createBiquadFilter();
    musicLp.type = 'lowpass';
    musicLp.frequency.value = 760;
    musicLp.Q.value = 0.5;
    musicLp.connect(musicFade);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 170;
    lfo.connect(lfoGain).connect(musicLp.frequency);
    lfo.start();

    // vinyl crackle: sparse impulses through a bandpass
    const len = 3 * ctx.sampleRate;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      if (Math.random() < 0.0012) data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    crackle = ctx.createBufferSource();
    crackle.buffer = buf;
    crackle.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 3200;
    bp.Q.value = 0.4;
    const cg = ctx.createGain();
    cg.gain.value = 0.10;
    crackle.connect(bp).connect(cg).connect(musicFade);
    crackle.start();
  }

  function playChord(at, notes, bassNote) {
    for (const n of notes) {
      for (const [type, det, g] of [['triangle', 0, 0.045], ['sawtooth', 7, 0.012]]) {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = midi(n);
        o.detune.value = det;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, at);
        env.gain.exponentialRampToValueAtTime(g, at + 1.5);
        env.gain.setValueAtTime(g, at + CHORD_DUR - 1.8);
        env.gain.exponentialRampToValueAtTime(0.0001, at + CHORD_DUR);
        o.connect(env).connect(musicLp);
        o.start(at);
        o.stop(at + CHORD_DUR + 0.1);
      }
    }
    const b = ctx.createOscillator();
    b.type = 'sine';
    b.frequency.value = midi(bassNote);
    const be = ctx.createGain();
    be.gain.setValueAtTime(0.0001, at);
    be.gain.exponentialRampToValueAtTime(0.06, at + 0.8);
    be.gain.setValueAtTime(0.06, at + CHORD_DUR - 1.5);
    be.gain.exponentialRampToValueAtTime(0.0001, at + CHORD_DUR);
    b.connect(be).connect(musicFade);
    b.start(at);
    b.stop(at + CHORD_DUR + 0.1);
  }

  function startMusic() {
    if (!ensure() || schedTimer) return;
    buildMusicGraph();
    musicFade.gain.cancelScheduledValues(ctx.currentTime);
    musicFade.gain.setValueAtTime(0.0001, ctx.currentTime);
    musicFade.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 2);
    nextChordAt = ctx.currentTime + 0.15;
    schedTimer = setInterval(() => {
      while (nextChordAt < ctx.currentTime + 2.5) {
        playChord(nextChordAt, CHORDS[chordIdx], BASS[chordIdx]);
        chordIdx = (chordIdx + 1) % CHORDS.length;
        nextChordAt += CHORD_GAP;
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
    // set volumes without creating the AudioContext (safe before first gesture)
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
    die() { blip(280, 110, 0.5, 0.16); blip(180, 70, 0.65, 0.10, 'triangle'); },
    pause() { blip(420, 380, 0.12, 0.05); },
  };
})();

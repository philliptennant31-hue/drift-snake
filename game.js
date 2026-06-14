'use strict';
(() => {

  // ---------- constants ----------
  const SPEEDS = { slow: 200, normal: 135, fast: 95 };          // ms per cell
  const SIZES = {
    wide: { small: [11, 9], normal: [17, 13], large: [21, 15] },
    tall: { small: [9, 12], normal: [11, 19], large: [13, 23] },
  };
  const FRUIT_TARGET = { single: 1, plenty: 3 };
  const DIRS = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
  const START_LEN = 4;
  const BONUS_MS = 5000;
  const BONUS_GAP_MIN = 4, BONUS_GAP_SPAN = 4;   // bonus appears every 4-7 fruits
  const TRIAL_MS = 60000;
  const MODES = ['classic', 'zen', 'rush', 'trial'];

  const THEMES = {
    meadow: {
      bg: '#f4efe7', bgDeep: '#ece5d8', boardA: '#dcead8', boardB: '#d2e3cd',
      fruit: '#ef9486', fruitHi: '#f7c1b8', leaf: '#88b884', stem: '#a98f6b',
      bonusRing: '#e8a35c',
      ink: '#6f665b', inkSoft: '#a99e8f', card: '#fffdf8',
      eyeW: '#ffffff', eyeP: '#4d4a63', tongue: '#e58a9b', dead: '#b9b2a6',
      ghost: 'rgba(111,102,91,.28)', overlay: 'rgba(244,239,231,.82)',
      uiSnakeA: '#8fa3e0', uiSnakeB: '#b3a7e6',
    },
    midnight: {
      bg: '#211f2b', bgDeep: '#181621', boardA: '#2a2837', boardB: '#252333',
      fruit: '#ef9486', fruitHi: '#f7c1b8', leaf: '#88b884', stem: '#b89f7c',
      bonusRing: '#e8a35c',
      ink: '#d9d3c8', inkSoft: '#8d879c', card: '#2e2c3a',
      eyeW: '#ffffff', eyeP: '#2b2939', tongue: '#e58a9b', dead: '#5a5766',
      ghost: 'rgba(230,225,240,.25)', overlay: 'rgba(26,24,34,.82)',
      uiSnakeA: '#8fa3e0', uiSnakeB: '#c3a7e6',
    },
    classic: {
      bg: '#f3f6ef', bgDeep: '#e4ebdc', boardA: '#aad751', boardB: '#a2d149',
      fruit: '#e7471d', fruitHi: '#f5856b', leaf: '#3faa49', stem: '#7a5230',
      bonusRing: '#e89a23',
      ink: '#3c4043', inkSoft: '#7d8288', card: '#ffffff',
      eyeW: '#ffffff', eyeP: '#3a3a3a', tongue: '#d96d7c', dead: '#9aa0a6',
      ghost: 'rgba(40,44,47,.28)', overlay: 'rgba(243,246,239,.85)',
      uiSnakeA: '#4775ea', uiSnakeB: '#6f9bff',
    },
    sakura: {
      bg: '#fbf1f3', bgDeep: '#f1dfe6', boardA: '#f4dde4', boardB: '#eed2dc',
      fruit: '#f2a06b', fruitHi: '#f8c9a8', leaf: '#94b87e', stem: '#a98f6b',
      bonusRing: '#d886a8',
      ink: '#7a5f68', inkSoft: '#b393a0', card: '#fffafb',
      eyeW: '#ffffff', eyeP: '#544049', tongue: '#e58a9b', dead: '#c2b3b9',
      ghost: 'rgba(122,95,104,.26)', overlay: 'rgba(251,241,243,.84)',
      uiSnakeA: '#d98aa8', uiSnakeB: '#b78bc9',
    },
    tide: {
      bg: '#eef4f4', bgDeep: '#dcebe9', boardA: '#d6e9e6', boardB: '#c9e0dd',
      fruit: '#ef9486', fruitHi: '#f7c1b8', leaf: '#88b884', stem: '#a98f6b',
      bonusRing: '#5b8fb0',
      ink: '#4f6868', inkSoft: '#8aa6a3', card: '#fcfefe',
      eyeW: '#ffffff', eyeP: '#37504e', tongue: '#e58a9b', dead: '#a8b8b5',
      ghost: 'rgba(79,104,104,.26)', overlay: 'rgba(238,244,244,.84)',
      uiSnakeA: '#5fa8a0', uiSnakeB: '#8ec3b0',
    },
    autumn: {
      bg: '#f6ede1', bgDeep: '#ecdfc9', boardA: '#e9d8ba', boardB: '#e1ceab',
      fruit: '#d9583b', fruitHi: '#eda07f', leaf: '#a8893f', stem: '#7a5230',
      bonusRing: '#c97b3a',
      ink: '#6b5a48', inkSoft: '#a8927a', card: '#fdf8f0',
      eyeW: '#ffffff', eyeP: '#4f4236', tongue: '#d98a7c', dead: '#b5a892',
      ghost: 'rgba(107,90,72,.26)', overlay: 'rgba(246,237,225,.84)',
      uiSnakeA: '#c97b4a', uiSnakeB: '#a8694f',
    },
    mono: {
      bg: '#f2f1ee', bgDeep: '#e4e2dd', boardA: '#e7e5e0', boardB: '#dedbd5',
      fruit: '#8a8782', fruitHi: '#bcb9b3', leaf: '#9a978f', stem: '#7a776f',
      bonusRing: '#6e6b66',
      ink: '#4a4845', inkSoft: '#94918a', card: '#fbfaf8',
      eyeW: '#ffffff', eyeP: '#33312e', tongue: '#b0867e', dead: '#b6b3ac',
      ghost: 'rgba(74,72,69,.22)', overlay: 'rgba(242,241,238,.85)',
      uiSnakeA: '#5a5854', uiSnakeB: '#8a8782',
    },
    storm: {
      bg: '#434a5a', bgDeep: '#3a4150', boardA: '#515c70', boardB: '#4b5568',
      fruit: '#ef9486', fruitHi: '#f7c1b8', leaf: '#88b884', stem: '#b89f7c',
      bonusRing: '#e9c46a',
      ink: '#dde3ee', inkSoft: '#98a2b8', card: '#4a5366',
      eyeW: '#ffffff', eyeP: '#323a4c', tongue: '#e58a9b', dead: '#6c7588',
      ghost: 'rgba(220,228,244,.25)', overlay: 'rgba(58,65,80,.82)',
      uiSnakeA: '#7e9bd8', uiSnakeB: '#a8c3e8',
    },
  };

  // each palette has its own timed fruit
  const FRUIT_KIND = { meadow: 'orange', sakura: 'dragonfruit', classic: 'kiwi', midnight: 'starfruit', tide: 'blueberry', autumn: 'persimmon', mono: 'plum', storm: 'lemon' };
  const FRUIT_NAME = { orange: 'oranges', dragonfruit: 'dragon fruit', kiwi: 'kiwis', starfruit: 'starfruit', blueberry: 'blueberries', persimmon: 'persimmons', plum: 'plums', lemon: 'lemons' };

  // ---------- skins & hats ----------
  const SKINS = {
    drift:   { a: '#8fa3e0', b: '#b3a7e6', head: '#7b90d6' },
    sunset:  { a: '#f2a36b', b: '#ef8f86', head: '#e08a52', unlock: { timed: 'meadow', n: 30 },   hint: 'eat 30 timed oranges in the meadow world' },
    dragon:  { a: '#e87fa8', b: '#c86fc9', head: '#d96a97', unlock: { timed: 'sakura', n: 30 },   hint: 'eat 30 timed dragon fruit in the sakura world' },
    retro:   { a: '#58b368', b: '#9ed36a', head: '#46a356', unlock: { timed: 'classic', n: 30 },  hint: 'eat 30 timed kiwis in the classic world' },
    galaxy:  { a: '#5c6bc0', b: '#9575cd', head: '#4a58a8', unlock: { timed: 'midnight', n: 30 }, hint: 'eat 30 timed starfruit in the midnight world' },
    deepsea: { a: '#26818e', b: '#4ab3a8', head: '#1f6f7b', unlock: { timed: 'tide', n: 30 },     hint: 'eat 30 timed blueberries in the tide world' },
    ember:   { a: '#d97742', b: '#a8524a', head: '#c2632f', unlock: { timed: 'autumn', n: 30 },   hint: 'eat 30 timed persimmons in the autumn world' },
    ink:     { a: '#3d3b38', b: '#6e6b66', head: '#2e2c2a', unlock: { timed: 'mono', n: 30 },     hint: 'eat 30 timed plums in the mono world' },
    tempest: { a: '#6e7f9e', b: '#9fb0c8', head: '#5d6e8e', unlock: { timed: 'storm', n: 30 },    hint: 'eat 30 timed lemons in the storm world' },
    honey:   { a: '#e2b13c', b: '#f0d27a', head: '#d49f28', unlock: { stat: 'golden', n: 10 },    hint: 'find 10 golden apples, any world' },
    picnic:  { a: '#d94c3a', b: '#f7e8d8', head: '#c84432', pattern: 'gingham', unlock: { stat: 'boardFill', n: 1 }, hint: 'fill the entire board, any mode' },
  };
  const HATS = {
    none:     { label: 'none' },
    sprout:   { label: 'sprout',   unlock: { stat: 'fruitTotal', n: 250 },  hint: 'eat 250 fruit, lifetime' },
    crown:    { label: 'crown',    unlock: { stat: 'ghostWins', n: 3 },     hint: 'beat a ghost of your own best run 3 times' },
    flower:   { label: 'flower',   unlock: { stat: 'fruitTotal', n: 1000 }, hint: 'eat 1000 fruit, lifetime' },
    chef:     { label: 'chef',     unlock: { stat: 'perfect', n: 25 },      hint: 'catch 25 timed fruit at the full 5 points' },
    bow:      { label: 'bow',      unlock: { stat: 'dailyStreak', n: 7 },   hint: 'play the daily 7 days in a row' },
    mushroom: { label: 'mushroom', unlock: { stat: 'fruitTotal', n: 3000 }, hint: 'eat 3000 fruit, lifetime' },
    halo:     { label: 'halo',     unlock: { stat: 'clutch', n: 100 },      hint: 'catch 100 timed fruit with 1 second left' },
    sunhat:   { label: 'sun hat',  unlock: { stat: 'runHigh', n: 30 },      hint: 'score 30 in a single classic run' },
  };
  // trails are purely visual — soft somethings left where the tail has been
  const TRAILS = {
    none:     { label: 'none' },
    petals:   { label: 'petals',   unlock: { stat: 'fruitTotal', n: 500 },  hint: 'eat 500 fruit, lifetime' },
    bubbles:  { label: 'bubbles',  unlock: { timed: 'tide', n: 60 },        hint: 'eat 60 timed blueberries in the tide world' },
    glow:     { label: 'glow',     unlock: { timed: 'midnight', n: 60 },    hint: 'eat 60 timed starfruit in the midnight world' },
    snowdust: { label: 'snowdust', unlock: { timed: 'mono', n: 60 },        hint: 'eat 60 timed plums in the mono world' },
    sparkle:  { label: 'sparkle',  unlock: { stat: 'golden', n: 20 },       hint: 'find 20 golden apples, any world' },
    rainbow:  { label: 'rainbow',  unlock: { stat: 'ghostWins', n: 10 },    hint: 'beat a ghost of your own best run 10 times' },
  };
  // the plain fruit, redressed — golden apples stay golden apples
  const FRUIT_SKINS = {
    apple:   { label: 'apple' },
    peach:   { label: 'peach',   unlock: { stat: 'fruitTotal', n: 150 },  hint: 'eat 150 fruit, lifetime' },
    boba:    { label: 'boba',    unlock: { stat: 'clutch', n: 25 },       hint: 'catch 25 timed fruit with 1 second left' },
    onigiri: { label: 'onigiri', unlock: { stat: 'perfect', n: 10 },      hint: 'catch 10 timed fruit at the full 5 points' },
    lantern: { label: 'lantern', unlock: { stat: 'dailyStreak', n: 3 },   hint: 'play the daily 3 days in a row' },
  };
  const BURSTS = {
    pop:      { label: 'pop' },
    confetti: { label: 'confetti', unlock: { stat: 'fruitTotal', n: 100 }, hint: 'eat 100 fruit, lifetime' },
    blossom:  { label: 'blossom',  unlock: { stat: 'perfect', n: 5 },      hint: 'catch 5 timed fruit at the full 5 points' },
    stardust: { label: 'stardust', unlock: { stat: 'golden', n: 3 },       hint: 'find 3 golden apples, any world' },
    hearts:   { label: 'hearts',   unlock: { stat: 'clutch', n: 10 },      hint: 'catch 10 timed fruit with 1 second left' },
  };
  const EYE_STYLES = {
    round:   { label: 'round' },
    sleepy:  { label: 'sleepy',  unlock: { stat: 'fruitTotal', n: 50 },  hint: 'eat 50 fruit, lifetime' },
    sparkle: { label: 'sparkle', unlock: { stat: 'perfect', n: 3 },      hint: 'catch 3 timed fruit at the full 5 points' },
    happy:   { label: 'happy',   unlock: { stat: 'dailyPlays', n: 3 },   hint: 'play 3 daily challenges' },
  };
  // one registry so unlock checks, pills, tooltips and saves stay generic
  const COSMETICS = {
    trail: { table: TRAILS,      def: 'none',  word: 'trail',      pills: 'trailPills' },
    fruit: { table: FRUIT_SKINS, def: 'apple', word: 'fruit look', pills: 'fruitPills' },
    burst: { table: BURSTS,      def: 'pop',   word: 'eat effect', pills: 'burstPills' },
    eyes:  { table: EYE_STYLES,  def: 'round', word: 'eye style',  pills: 'eyePills' },
  };
  // earned, not worn: these appear in the garden the moment they unlock
  const DECOR = {
    bench:        { label: 'bench',         unlock: { stat: 'ghostWins', n: 5 },     hint: 'beat a ghost of your own best run 5 times' },
    windchime:    { label: 'wind chime',    unlock: { stat: 'perfect', n: 15 },      hint: 'catch 15 timed fruit at the full 5 points' },
    stonelantern: { label: 'stone lantern', unlock: { stat: 'clutch', n: 30 },       hint: 'catch 30 timed fruit with 1 second left' },
    koipond:      { label: 'koi pond',      unlock: { stat: 'golden', n: 15 },       hint: 'find 15 golden apples, any world' },
    birdhouse:    { label: 'birdhouse',     unlock: { stat: 'fruitTotal', n: 2000 }, hint: 'eat 2000 fruit, lifetime' },
    fountain:     { label: 'fountain',      unlock: { stat: 'boardFill', n: 1 },     hint: 'fill the entire board, any mode' },
  };
  function unlockProgress(u) {
    const cur = u.timed ? (prog.timed[u.timed] || 0) : (prog[u.stat] || 0);
    return `${Math.min(cur, u.n)}/${u.n}`;
  }

  // ---------- settings ----------
  const DEFAULTS = {
    mode: 'classic', pace: 'normal', size: 'normal', layout: 'wide',
    theme: 'meadow', fruits: 'single', ambience: 'on', musicMode: 'artists',
    sfxVol: 0.8, musicVol: 0.5,
  };
  let settings = { ...DEFAULTS };
  try { Object.assign(settings, JSON.parse(localStorage.getItem('drift-settings') || '{}')); } catch (e) {}
  const saveSettings = () => localStorage.setItem('drift-settings', JSON.stringify(settings));

  // rain belongs to the storm world alone — it follows you there and
  // stops when you leave, no setting to remember
  const rainOn = () => settings.theme === 'storm';

  // ---------- progression ----------
  const PROG_DEFAULT = {
    fruitTotal: 0,
    timed: { meadow: 0, sakura: 0, classic: 0, midnight: 0, tide: 0, autumn: 0, mono: 0, storm: 0 },
    clutch: 0, perfect: 0, ghostWins: 0, golden: 0,
    boardFill: 0, runHigh: 0,
    dailyStreak: 0, dailyLast: 0, dailyPlays: 0,
    bloomLog: '',   // one char per garden bloom, recording the world it grew in
    skins: ['drift'], hats: [], skin: 'drift', hat: 'none',
    cos: { trail: 'none', fruit: 'apple', burst: 'pop', eyes: 'round' },
    cosOwned: { trail: [], fruit: [], burst: [], eyes: [] },
    deco: [],
  };
  let prog = {
    ...PROG_DEFAULT, timed: { ...PROG_DEFAULT.timed }, skins: ['drift'], hats: [],
    cos: { ...PROG_DEFAULT.cos }, cosOwned: { trail: [], fruit: [], burst: [], eyes: [] }, deco: [],
  };
  try {
    const s = JSON.parse(localStorage.getItem('drift-progress') || 'null');
    if (s) {
      Object.assign(prog, s);
      prog.timed = { ...PROG_DEFAULT.timed, ...(s.timed || {}) };
      prog.skins = Array.isArray(s.skins) && s.skins.length ? s.skins : ['drift'];
      prog.hats = Array.isArray(s.hats) ? s.hats : [];
      prog.cos = { ...PROG_DEFAULT.cos, ...(s.cos || {}) };
      prog.cosOwned = {};
      for (const c in COSMETICS) {
        prog.cosOwned[c] = Array.isArray(s.cosOwned && s.cosOwned[c]) ? s.cosOwned[c] : [];
      }
      prog.deco = Array.isArray(s.deco) ? s.deco : [];
    }
  } catch (e) {}
  if (!prog.skins.includes('drift')) prog.skins.unshift('drift');
  if (!prog.skins.includes(prog.skin)) prog.skin = 'drift';
  if (prog.hat !== 'none' && !prog.hats.includes(prog.hat)) prog.hat = 'none';
  for (const c in COSMETICS) {
    const { table, def } = COSMETICS[c];
    const k = prog.cos[c];
    if (!table[k] || (k !== def && !prog.cosOwned[c].includes(k))) prog.cos[c] = def;
  }
  // progress saves are deferred: a synchronous localStorage write on every
  // fruit caused frame spikes mid-run (felt as input delay)
  let progDirty = false;
  const saveProg = () => { progDirty = true; };
  function flushProg() {
    if (!progDirty) return;
    localStorage.setItem('drift-progress', JSON.stringify(prog));
    progDirty = false;
  }
  window.addEventListener('pagehide', flushProg);

  function unlockMet(u) {
    if (!u) return true;
    if (u.timed) return (prog.timed[u.timed] || 0) >= u.n;
    return (prog[u.stat] || 0) >= u.n;
  }
  function checkUnlocks() {
    let changed = false;
    for (const k in SKINS) {
      if (!prog.skins.includes(k) && unlockMet(SKINS[k].unlock)) {
        prog.skins.push(k);
        toast('new snake unlocked · ' + k);
        Sound.unlock();
        changed = true;
      }
    }
    for (const k in HATS) {
      if (k !== 'none' && !prog.hats.includes(k) && unlockMet(HATS[k].unlock)) {
        prog.hats.push(k);
        toast('new hat unlocked · ' + k);
        Sound.unlock();
        changed = true;
      }
    }
    for (const c in COSMETICS) {
      const { table, word } = COSMETICS[c];
      for (const k in table) {
        if (table[k].unlock && !prog.cosOwned[c].includes(k) && unlockMet(table[k].unlock)) {
          prog.cosOwned[c].push(k);
          toast(`new ${word} unlocked · ${table[k].label}`);
          Sound.unlock();
          changed = true;
        }
      }
    }
    for (const k in DECOR) {
      if (!prog.deco.includes(k) && unlockMet(DECOR[k].unlock)) {
        prog.deco.push(k);
        toast('your garden grew · ' + DECOR[k].label);
        Sound.unlock();
        changed = true;
      }
    }
    if (changed) { saveProg(); flushProg(); refreshWardrobe(); }
  }

  let PAL = THEMES[settings.theme] || THEMES.meadow;
  function applyTheme() {
    PAL = THEMES[settings.theme] || THEMES.meadow;
    const r = document.documentElement.style;
    r.setProperty('--bg', PAL.bg);
    r.setProperty('--bg-deep', PAL.bgDeep);
    r.setProperty('--board-a', PAL.boardA);
    r.setProperty('--snake-a', PAL.uiSnakeA);
    r.setProperty('--snake-b', PAL.uiSnakeB);
    r.setProperty('--fruit', PAL.fruit);
    r.setProperty('--fruit-leaf', PAL.leaf);
    r.setProperty('--ink', PAL.ink);
    r.setProperty('--ink-soft', PAL.inkSoft);
    r.setProperty('--card', PAL.card);
    r.setProperty('--overlay-bg', PAL.overlay);
    const tc = document.querySelector('meta[name="theme-color"]');
    if (tc) tc.setAttribute('content', PAL.bg);
    Sound.setMood(settings.theme);
  }

  // ---------- daily challenge ----------
  // same seed for everyone, everywhere, derived from the UTC date
  const DAILY_EPOCH = Date.UTC(2026, 5, 10);
  const DAILY_CFG = { mode: 'classic', pace: 'normal', size: 'normal', layout: 'wide', fruits: 'single' };
  const dailyIndex = () => Math.floor((Date.now() - DAILY_EPOCH) / 86400000) + 1;
  const dailySeed = n => (Math.imul(n, 2654435761) + 97531) >>> 0;
  let daily = null;            // {n} while a daily run is active
  let stashedSettings = null;  // user's own settings, restored after a daily

  // ---------- run state ----------
  let cols = 17, rows = 13, cell = 32, stepMs = 135, ttlTicks = 37, trialTicks = 444;
  let runStats = { fruit: 0, timed: 0, golden: 0 };
  let player = null;
  let ghost = null;           // {sim, moves, idx, score, diedAt}
  let recMoves = [];
  let runSeed = 0;
  let challenge = null;       // {seed, goal}
  let state = 'menu';         // menu | ready | playing | paused | dying | gameover
  let endCause = 'death';     // death | time
  let dirQueue = [];
  let lastTickSnap = null;
  let acc = 0, lastTime = 0, dieAt = 0;
  let particles = [], popups = [], eatRipple = null;
  let ambient = [], ambTimer = 0;
  let cameo = null, cameoSeen = false;   // each world's 100-point secret
  let lastBonusSecs = null;
  let muted = localStorage.getItem('drift-muted') === '1';

  // ---------- dom ----------
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const oc = document.createElement('canvas');   // offscreen, for shadow compositing
  const occ = oc.getContext('2d');
  const $ = id => document.getElementById(id);
  const overlays = { menu: $('menu'), ready: $('ready'), paused: $('paused'), gameover: $('gameover') };
  function showOverlay(name) {
    for (const k in overlays) overlays[k].classList.toggle('show', k === name);
    const tip = document.querySelector('.tip');
    if (tip) tip.classList.remove('show');
  }

  // ---------- toasts ----------
  let toastQ = [], toastBusy = false;
  function toast(msg) { toastQ.push(msg); pumpToast(); }
  function pumpToast() {
    if (toastBusy || !toastQ.length) return;
    toastBusy = true;
    const el = $('toast');
    el.textContent = toastQ.shift();
    el.classList.add('show');
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => { toastBusy = false; pumpToast(); }, 350);
    }, 2400);
  }

  // ---------- rng & sim ----------
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  // same generator with the state held on the sim, so a sim can be snapshotted
  // and rewound (late-turn forgiveness) without breaking determinism
  function rnd(sim) {
    sim.rngState |= 0;
    sim.rngState = sim.rngState + 0x6D2B79F5 | 0;
    const a = sim.rngState;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  const cloneSim = s => ({
    rngState: s.rngState,
    snake: s.snake.map(c => ({ x: c.x, y: c.y })),
    dir: { ...s.dir },
    prevTail: s.prevTail ? { ...s.prevTail } : null,
    fruits: s.fruits.map(f => ({ ...f })),
    bonus: s.bonus ? { ...s.bonus } : null,
    bonusIn: s.bonusIn, score: s.score, alive: s.alive, ticks: s.ticks,
  });
  const randomSeed = () => (Math.random() * 4294967296) >>> 0;
  const seedStr = s => s.toString(36);
  const gapRoll = sim => BONUS_GAP_MIN + Math.floor(rnd(sim) * BONUS_GAP_SPAN);

  function freeCell(sim) {
    const taken = new Set(sim.snake.map(c => c.x + ',' + c.y));
    for (const f of sim.fruits) taken.add(f.x + ',' + f.y);
    if (sim.bonus) taken.add(sim.bonus.x + ',' + sim.bonus.y);
    const free = [];
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++)
        if (!taken.has(x + ',' + y)) free.push({ x, y });
    if (!free.length) return null;
    return free[Math.floor(rnd(sim) * free.length)];
  }

  function newFruit(sim) {
    const c = freeCell(sim);
    if (!c) return null;
    if (settings.mode === 'rush') return { x: c.x, y: c.y, ticksLeft: ttlTicks };
    const f = { x: c.x, y: c.y };
    if (rnd(sim) < 0.04) f.golden = true;   // rare golden apple, worth 3
    return f;
  }

  function makeSim(seed) {
    const sim = {
      rngState: seed | 0,
      snake: [], dir: { x: 1, y: 0 }, prevTail: null,
      fruits: [], bonus: null, bonusIn: 0,
      score: 0, alive: true, ticks: 0,
    };
    const cy = Math.floor(rows / 2), cx = Math.floor(cols / 4);
    for (let i = 0; i < START_LEN; i++) sim.snake.push({ x: cx - i, y: cy });
    const n = FRUIT_TARGET[settings.fruits] || 1;
    for (let i = 0; i < n; i++) {
      const f = newFruit(sim);
      if (f) sim.fruits.push(f);
    }
    sim.bonusIn = gapRoll(sim);
    return sim;
  }

  const timedPts = ticksLeft => Math.max(1, Math.min(5, Math.ceil(ticksLeft * stepMs / 1000)));

  // One deterministic step shared by the player and the ghost replay.
  function simStep(sim, ndir) {
    const ev = {};
    if (ndir && !(ndir.x === -sim.dir.x && ndir.y === -sim.dir.y)) sim.dir = ndir;
    const head = sim.snake[0];
    let nx = head.x + sim.dir.x, ny = head.y + sim.dir.y;

    if (settings.mode === 'zen') {
      nx = (nx + cols) % cols;
      ny = (ny + rows) % rows;
    } else if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) {
      sim.alive = false;
      ev.died = true;
      return ev;
    }

    const fi = sim.fruits.findIndex(f => f.x === nx && f.y === ny);
    const hitBonus = sim.bonus && sim.bonus.x === nx && sim.bonus.y === ny;
    const willGrow = fi >= 0 || hitBonus;

    if (settings.mode !== 'zen') {
      const checkLen = willGrow ? sim.snake.length : sim.snake.length - 1;
      for (let i = 0; i < checkLen; i++)
        if (sim.snake[i].x === nx && sim.snake[i].y === ny) {
          sim.alive = false;
          ev.died = true;
          return ev;
        }
    }

    sim.snake.unshift({ x: nx, y: ny });
    sim.prevTail = willGrow ? null : sim.snake.pop();
    // the summit: the snake occupies every cell of the board
    if (willGrow && sim.snake.length >= cols * rows) ev.filled = true;

    if (fi >= 0) {
      const f = sim.fruits.splice(fi, 1)[0];
      if (settings.mode === 'rush') {
        const pts = timedPts(f.ticksLeft);
        sim.score += pts;
        ev.bonus = { x: nx, y: ny, pts };
      } else {
        const pts = f.golden ? 3 : 1;
        sim.score += pts;
        ev.ate = { x: nx, y: ny, golden: !!f.golden, pts };
      }
      const nf = newFruit(sim);
      if (nf) sim.fruits.push(nf);
      if (settings.mode !== 'rush') {
        sim.bonusIn--;
        if (sim.bonusIn <= 0 && !sim.bonus) {
          const b = freeCell(sim);
          if (b) {
            sim.bonus = { x: b.x, y: b.y, ticksLeft: ttlTicks };
            ev.bonusSpawned = true;
          }
          sim.bonusIn = gapRoll(sim);
        }
      }
    }

    if (hitBonus) {
      const pts = timedPts(sim.bonus.ticksLeft);
      sim.score += pts;
      ev.bonus = { x: nx, y: ny, pts };
      sim.bonus = null;
    } else if (sim.bonus) {
      sim.bonus.ticksLeft--;
      if (sim.bonus.ticksLeft <= 0) {
        ev.bonusExpired = { x: sim.bonus.x, y: sim.bonus.y };
        sim.bonus = null;
      }
    }

    if (settings.mode === 'rush') {
      const expired = [];
      for (let i = sim.fruits.length - 1; i >= 0; i--) {
        const f = sim.fruits[i];
        f.ticksLeft--;
        if (f.ticksLeft <= 0) {
          expired.push({ x: f.x, y: f.y });
          sim.fruits.splice(i, 1);
        }
      }
      for (let i = 0; i < expired.length; i++) {
        const nf = newFruit(sim);
        if (nf) sim.fruits.push(nf);
      }
      if (expired.length) ev.expired = expired;
    }

    sim.ticks++;
    if (settings.mode === 'trial' && sim.ticks >= trialTicks) ev.timeUp = true;
    return ev;
  }

  // ---------- persistence ----------
  const cfgKey = () => [settings.mode, settings.pace, settings.size, settings.layout, settings.fruits].join(':');
  const bestKey = () => 'drift-best:' + cfgKey();
  const getBest = () => +(localStorage.getItem(bestKey()) || 0);
  const runKey = seed => 'drift-run:' + cfgKey() + ':' + seedStr(seed);

  function loadRun(seed) {
    try { return JSON.parse(localStorage.getItem(runKey(seed)) || 'null'); } catch (e) { return null; }
  }
  function saveRun(seed, score, moves) {
    const key = runKey(seed);
    localStorage.setItem(key, JSON.stringify({ s: score, m: moves }));
    let idx = [];
    try { idx = JSON.parse(localStorage.getItem('drift-runs-index') || '[]'); } catch (e) {}
    idx = idx.filter(k => k !== key);
    idx.push(key);
    while (idx.length > 12) localStorage.removeItem(idx.shift());
    localStorage.setItem('drift-runs-index', JSON.stringify(idx));
  }

  // ---------- layout ----------
  function configureBoard() {
    [cols, rows] = SIZES[settings.layout][settings.size];
    stepMs = SPEEDS[settings.pace];
    ttlTicks = Math.round(BONUS_MS / stepMs);
    trialTicks = Math.round(TRIAL_MS / stepMs);
    fitCanvas();
  }
  function fitCanvas() {
    const tall = settings.layout === 'tall';
    const maxW = Math.min(window.innerWidth * 0.94, tall ? 430 : 660);
    const maxH = window.innerHeight * (tall ? 0.72 : 0.62);
    cell = Math.max(14, Math.floor(Math.min(maxW / cols, maxH / rows)));
    const w = cols * cell, h = rows * cell;
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    oc.width = canvas.width;
    oc.height = canvas.height;
    drawGarden();
  }

  // ---------- hud ----------
  function updateScoreUI() {
    $('score').textContent = player ? player.score : 0;
    const zen = settings.mode === 'zen';
    $('bestChip').classList.toggle('hidden', zen);
    if (!zen) $('best').textContent = getBest();
    $('timeChip').classList.toggle('hidden', settings.mode !== 'trial');
    if (settings.mode === 'trial' && !player) $('timeLeft').textContent = Math.round(TRIAL_MS / 1000);
    $('goalChip').classList.toggle('hidden', !(challenge && challenge.goal));
    if (challenge && challenge.goal) $('goal').textContent = challenge.goal;
  }

  // ---------- run lifecycle ----------
  function startRun(seed) {
    Sound.ensure();
    Sound.setRain(rainOn());
    ensureMusic();
    configureBoard();
    runSeed = seed;
    player = makeSim(seed);
    recMoves = [];
    dirQueue = [];
    ghost = null;
    if (settings.mode !== 'zen') {
      const saved = loadRun(seed);
      if (saved && saved.m) ghost = { sim: makeSim(seed), moves: saved.m, idx: 0, score: saved.s, diedAt: 0 };
    }
    particles = []; popups = []; eatRipple = null; lastBonusSecs = null;
    trailDots = []; lastTrailCell = '';
    cameo = null; cameoSeen = false;
    runStats = { fruit: 0, timed: 0, golden: 0 };
    lastTickSnap = null;
    acc = 0;
    endCause = 'death';
    state = 'ready';
    updateScoreUI();
    showOverlay('ready');
  }

  function startDaily() {
    if (!stashedSettings) stashedSettings = { ...settings };
    Object.assign(settings, DAILY_CFG);
    daily = { n: dailyIndex() };
    startRun(dailySeed(daily.n));
  }

  const WORLD_CODE = { meadow: 'm', sakura: 's', classic: 'c', midnight: 'n', tide: 't', autumn: 'a', mono: 'o', storm: 'r' };
  function countFruit() {
    prog.fruitTotal++;
    if (prog.fruitTotal % 10 === 0) prog.bloomLog = (prog.bloomLog || '') + (WORLD_CODE[settings.theme] || 'm');
  }

  function onTimedCatch(pts) {
    prog.timed[settings.theme] = (prog.timed[settings.theme] || 0) + 1;
    countFruit();
    runStats.fruit++;
    runStats.timed++;
    if (pts >= 5) prog.perfect++;
    if (pts <= 1) prog.clutch++;
    saveProg();
    drawGarden();
    checkUnlocks();
  }

  function tick(now) {
    // snapshot before stepping so a just-missed turn can be applied
    // retroactively (late-turn forgiveness)
    lastTickSnap = {
      player: cloneSim(player),
      ghost: ghost && ghost.sim.alive && ghost.idx < ghost.moves.length
        ? { sim: cloneSim(ghost.sim), idx: ghost.idx } : null,
      clean: true,
    };
    const ndir = dirQueue.length ? dirQueue.shift() : null;
    const ev = simStep(player, ndir);
    recMoves.push(DIRS.findIndex(d => d.x === player.dir.x && d.y === player.dir.y));
    if (ev.ate || ev.bonus || ev.bonusSpawned || ev.bonusExpired || ev.expired || ev.died || ev.timeUp) {
      lastTickSnap.clean = false;
    }
    applyTickEvents(ev, now);
    maybeCameo(now);
    if (ev.filled) return handleFill();
    if (ev.died) return endRun('death');
    if (ev.timeUp) return endRun('time');

    if (ghost && ghost.sim.alive && ghost.idx < ghost.moves.length) {
      simStep(ghost.sim, DIRS[+ghost.moves[ghost.idx++]]);
      if (!ghost.sim.alive || ghost.idx >= ghost.moves.length) ghost.diedAt = now;
    }
  }

  function applyTickEvents(ev, now) {
    if (ev.ate) {
      countFruit();
      runStats.fruit++;
      if (ev.ate.golden) {
        prog.golden++;
        runStats.golden++;
        popups.push({ x: (ev.ate.x + 0.5) * cell, y: ev.ate.y * cell, text: '+3', t0: now });
        Sound.bonusEat(2);
      } else {
        Sound.pop(player.score);
      }
      saveProg();
      drawGarden();
      checkUnlocks();
      updateScoreUI();
      eatRipple = { x: ev.ate.x, y: ev.ate.y, t0: now };
      burst(ev.ate.x, ev.ate.y, ev.ate.golden ? ['#e2b13c', '#f0d27a'] : [PAL.fruit, PAL.leaf], prog.cos.burst);
    }
    if (ev.bonusSpawned) Sound.bonusSpawn();
    if (ev.bonusExpired) {
      Sound.bonusGone();
      burst(ev.bonusExpired.x, ev.bonusExpired.y, [PAL.inkSoft]);
    }
    if (ev.expired) {
      Sound.bonusGone();
      for (const e of ev.expired) burst(e.x, e.y, [PAL.inkSoft]);
    }
    if (ev.bonus) {
      updateScoreUI();
      Sound.bonusEat(ev.bonus.pts);
      burst(ev.bonus.x, ev.bonus.y, [PAL.bonusRing, PAL.fruitHi], prog.cos.burst);
      popups.push({ x: (ev.bonus.x + 0.5) * cell, y: ev.bonus.y * cell, text: '+' + ev.bonus.pts, t0: now });
      onTimedCatch(ev.bonus.pts);
    }
  }

  // a turn pressed just after a tick still applies to the cell the snake is
  // visually in, as long as the missed tick was eventless and the retro move
  // doesn't kill the player
  function tryRetroTurn(d, now) {
    if (!lastTickSnap || !lastTickSnap.clean) return;
    if (acc >= stepMs * 0.45) return;
    const pd = lastTickSnap.player.dir;
    if ((d.x === -pd.x && d.y === -pd.y) || (d.x === player.dir.x && d.y === player.dir.y)) return;
    const trial = cloneSim(lastTickSnap.player);
    const ev = simStep(trial, d);
    if (ev.died) return;
    player = trial;
    recMoves[recMoves.length - 1] = DIRS.findIndex(x => x.x === player.dir.x && x.y === player.dir.y);
    if (lastTickSnap.ghost && ghost) {
      ghost.sim = lastTickSnap.ghost.sim;
      ghost.idx = lastTickSnap.ghost.idx;
      if (ghost.sim.alive && ghost.idx < ghost.moves.length) {
        simStep(ghost.sim, DIRS[+ghost.moves[ghost.idx++]]);
        if (!ghost.sim.alive || ghost.idx >= ghost.moves.length) ghost.diedAt = now;
      }
    }
    dirQueue.length = 0;
    lastTickSnap = null;
    applyTickEvents(ev, now);
    if (ev.filled) return handleFill();
    if (ev.timeUp) endRun('time');
  }

  // every cell of the board is snake: the quiet summit of the whole game
  function handleFill() {
    prog.boardFill = (prog.boardFill || 0) + 1;
    saveProg();
    checkUnlocks();
    for (let i = 0; i < 14; i++) {
      burst(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows),
        [PAL.fruit, PAL.bonusRing, PAL.uiSnakeA], 'confetti');
    }
    endRun('complete');
  }

  function endRun(cause) {
    endCause = cause;
    state = 'dying';
    dieAt = performance.now();
    flushProg();
    if (cause === 'death') Sound.die();
    else if (cause === 'complete') Sound.complete();
    else Sound.timeUp();

    if (settings.mode === 'classic' && player.score > (prog.runHigh || 0)) {
      prog.runHigh = player.score;
      saveProg();
      checkUnlocks();
    }

    const prevBest = getBest();
    if (player.score > prevBest) localStorage.setItem(bestKey(), player.score);
    const saved = loadRun(runSeed);
    if (!saved || player.score > saved.s) saveRun(runSeed, player.score, recMoves.join(''));
    if (ghost && player.score > ghost.score) {
      prog.ghostWins++;
      saveProg();
      checkUnlocks();
    }
    if (daily) {
      const dk = 'drift-daily:' + daily.n;
      if (player.score > +(localStorage.getItem(dk) || 0)) localStorage.setItem(dk, player.score);
      if (prog.dailyLast !== daily.n) {
        prog.dailyStreak = prog.dailyLast === daily.n - 1 ? prog.dailyStreak + 1 : 1;
        prog.dailyLast = daily.n;
        prog.dailyPlays++;
        saveProg();
        checkUnlocks();
      }
    }
    updateScoreUI();

    setTimeout(() => {
      state = 'gameover';
      const beatGoal = challenge && challenge.goal && player.score > challenge.goal;
      const beatGhost = ghost && player.score > ghost.score;
      $('goTitle').textContent =
        cause === 'complete' ? 'world complete!' :
        beatGoal ? 'challenge beaten!' :
        beatGhost ? 'ghost outrun!' :
        player.score > prevBest && player.score > 0 ? 'new best!' :
        cause === 'time' ? 'time!' : 'oh well';
      $('goScore').textContent = player.score;
      $('goBest').textContent =
        (daily ? `daily #${daily.n} · ` : '') + 'best ' + getBest() + ' · seed ' + seedStr(runSeed);
      const ch = !!challenge;
      $('againBtn').textContent = ch ? 'try again' : daily ? 'once more' : 'new run';
      $('raceBtn').classList.toggle('hidden', ch);
      $('menuBtn').textContent = ch ? 'leave challenge' : 'back to menu';
      $('copyBtn').textContent = 'copy result';
      showOverlay('gameover');
    }, 700);
  }

  // expiry fizzles always use the plain pop; eats use the player's chosen effect
  const BURST_COLORS = {
    confetti: ['#ef9486', '#8fa3e0', '#f2b76d', '#88b884', '#b3a7e6'],
    blossom: ['#f293b9', '#f7c8d8', '#e8aec4'],
    stardust: ['#f4d35e', '#fdf3c0', '#ffffff'],
    hearts: ['#e8849d', '#f2a8bb'],
  };
  function burst(cx, cy, colors, fx) {
    const px = (cx + 0.5) * cell, py = (cy + 0.5) * cell;
    const kind = fx || 'pop';
    const n = kind === 'hearts' ? 7 : kind === 'pop' ? 10 : 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
      const sp = cell * (0.06 + Math.random() * 0.07);
      const p = {
        x: px, y: py,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - cell * 0.03,
        r: cell * (0.05 + Math.random() * 0.07),
        life: 1, shape: kind,
        spin: Math.random() * 6.28, vspin: (Math.random() - 0.5) * 0.35,
        color: (BURST_COLORS[kind] || colors)[Math.floor(Math.random() * (BURST_COLORS[kind] || colors).length)],
      };
      if (kind === 'blossom') p.vy *= 0.6;
      if (kind === 'hearts') { p.vy = -Math.abs(p.vy) * 0.8; p.vx *= 0.6; }
      particles.push(p);
    }
  }

  // ---------- input ----------
  const KEY_DIRS = {
    ArrowUp: DIRS[3], ArrowDown: DIRS[1], ArrowLeft: DIRS[2], ArrowRight: DIRS[0],
    w: DIRS[3], s: DIRS[1], a: DIRS[2], d: DIRS[0],
  };

  function queueDir(d) {
    const last = dirQueue.length ? dirQueue[dirQueue.length - 1] : player.dir;
    if (d.x === last.x && d.y === last.y) return;
    if (d.x === -last.x && d.y === -last.y) return;
    if (dirQueue.length < 2) {
      dirQueue.push(d);
      Sound.turn();
    } else {
      // buffer is full: the newest press replaces the waiting one, so the
      // player's latest intent never sits behind stale input
      const prev = dirQueue[0];
      if (!(d.x === prev.x && d.y === prev.y) && !(d.x === -prev.x && d.y === -prev.y)) {
        dirQueue[1] = d;
        Sound.turn();
      }
    }
  }

  function tryStart(d) {
    if (d.x === -player.dir.x && d.y === -player.dir.y) return;
    queueDir(d);
    state = 'playing';
    lastTime = 0;
    showOverlay(null);
  }

  function steer(d) {
    const hadQueue = dirQueue.length > 0;
    queueDir(d);
    if (!hadQueue && dirQueue.length === 1) tryRetroTurn(dirQueue[0], performance.now());
  }

  document.addEventListener('keydown', e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (state === 'garden') {
      if (k === 'h') { document.body.classList.toggle('cinema'); return; }
      if (k === 'Escape' || k === ' ' || k === 'Enter') {
        e.preventDefault();
        exitGarden();
      }
      return;
    }
    const d = KEY_DIRS[k];
    if (d) {
      e.preventDefault();
      if (state === 'ready') tryStart(d);
      else if (state === 'playing') steer(d);
      return;
    }
    if (k === ' ' || k === 'Escape') {
      e.preventDefault();
      if (state === 'playing') { state = 'paused'; flushProg(); Sound.pause(); showOverlay('paused'); }
      else if (state === 'paused') { state = 'playing'; lastTime = 0; showOverlay(null); }
    }
    if (k === 'h') document.body.classList.toggle('cinema');
    if (k === 'Enter' && state === 'gameover') $('againBtn').click();
  });

  const stage = document.querySelector('.stage');
  let touchStart = null, touchMoved = false;
  stage.addEventListener('touchstart', e => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    touchMoved = false;
  }, { passive: true });
  stage.addEventListener('touchmove', e => {
    if (!touchStart) return;
    const dx = e.touches[0].clientX - touchStart.x;
    const dy = e.touches[0].clientY - touchStart.y;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    const d = Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
    touchStart = null;
    touchMoved = true;
    if (state === 'ready') tryStart(d);
    else if (state === 'playing') steer(d);
  }, { passive: true });
  stage.addEventListener('touchend', e => {
    // a tap (no swipe) on the bare board pauses
    if (!touchMoved && e.target === canvas && state === 'playing') {
      state = 'paused';
      Sound.pause();
      showOverlay('paused');
    }
    touchStart = null;
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (window.__drift && window.__drift.noAutoPause) return;
    if (document.hidden && state === 'playing') { state = 'paused'; showOverlay('paused'); }
  });

  // ---------- menu wiring ----------
  document.querySelectorAll('.pills[data-group]').forEach(box => {
    const g = box.dataset.group;
    const sync = () => box.querySelectorAll('.pill').forEach(p =>
      p.classList.toggle('active', p.dataset.v === settings[g]));
    box.addEventListener('click', e => {
      const b = e.target.closest('.pill');
      if (!b) return;
      settings[g] = b.dataset.v;
      saveSettings();
      sync();
      Sound.ui();
      if (g === 'theme') {
        applyTheme();
        resetAmbient();   // no leftover fish in the autumn woods
        Sound.setRain(rainOn());
        artistWorldChanged();
      }
      if (g === 'musicMode') {
        if (settings.musicMode === 'artists' && !tracksAvailable()) {
          toast('no artist tracks installed yet');
          settings.musicMode = 'generated';
          saveSettings();
          sync();
        }
        Sound.ensure();
        ensureMusic();
      }
      configureBoard();
      updateScoreUI();
      drawWardrobePreview();
    });
    sync();
  });

  // ---------- artist music player ----------
  // real tracks with the artist credited on a now-playing card; the card
  // links to the artist, which is also the CC-BY attribution. Two Audio
  // decks crossfade between tracks, and a per-world shuffle bag plays
  // every track in the pool before any of them repeats.
  let decks = null, deck = 0, trackIdx = -1, fadeTimer = null;
  let bag = [], bagWorld = '';
  const FADE_END = 2.5, FADE_SWITCH = 1.2; // seconds
  const tracksAvailable = () => typeof TRACKS !== 'undefined' && TRACKS.length > 0;
  const artistVol = () => Math.min(1, settings.musicVol);
  // tracks without a worlds list are the anywhere pool, blended into
  // every world's bag at natural weight
  const suitsWorld = (t, w) => t.worlds ? t.worlds.includes(w) : true;

  function refillBag() {
    const w = settings.theme;
    let pool = TRACKS.map((t, i) => i).filter(i => suitsWorld(TRACKS[i], w));
    if (!pool.length) pool = TRACKS.map((t, i) => i);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    // a fresh bag never opens with the track that just played
    if (pool.length > 1 && pool[0] === trackIdx) [pool[0], pool[1]] = [pool[1], pool[0]];
    bag = pool;
    bagWorld = w;
  }
  function pickArtistTrack() {
    if (bagWorld !== settings.theme || !bag.length) refillBag();
    return bag.shift();
  }
  function updateNowPlaying(t) {
    $('npText').textContent = `${t.title} — ${t.artist}`;
    $('npArtist').href = t.link;
    $('npArtist').dataset.tip = `${t.license} · click for the artist`;
    for (const [id, url] of [['npSpotify', t.spotify], ['npApple', t.apple]]) {
      $(id).classList.toggle('hidden', !url);
      if (url) $(id).href = url;
    }
  }
  function crossfade(from, to, secs) {
    clearInterval(fadeTimer);
    const t0 = performance.now();
    fadeTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / (secs * 1000));
      to.volume = artistVol() * k;
      from.volume = artistVol() * (1 - k);
      if (k >= 1) { clearInterval(fadeTimer); fadeTimer = null; from.pause(); }
    }, 50);
  }
  // a track that fails or stalls must never end the music for good: decks
  // skip bad loads on 'error', and a watchdog catches silent stalls. The
  // counter stops the skip-chain once it has failed through the whole pool
  // (e.g. offline with nothing cached); any successful playback resets it.
  let deckErrors = 0, watchdog = null;
  // rolling heartbeat: every 10s, the active deck must have made progress;
  // a frozen one gets skipped. Hidden tabs aren't judged — browsers throttle
  // and suspend media there, and that's not the track's fault.
  function armWatchdog() {
    clearTimeout(watchdog);
    const a0 = decks[deck], p0 = a0.currentTime;
    watchdog = setTimeout(() => {
      if (a0 !== decks[deck] || $('nowPlaying').classList.contains('hidden')) return;
      if (document.hidden || a0.currentTime > p0) { armWatchdog(); return; }
      if (++deckErrors <= TRACKS.length) advance(0);
    }, 10000);
  }
  // move to the next track in the bag, crossfading if we're audible
  function advance(fade) {
    trackIdx = pickArtistTrack();
    const cur = decks[deck], next = decks[1 - deck];
    deck = 1 - deck;
    const t = TRACKS[trackIdx];
    next.src = t.src;
    next.muted = muted;
    updateNowPlaying(t);
    armWatchdog();
    if (!fade || cur.paused || muted) {
      clearInterval(fadeTimer); fadeTimer = null;
      cur.pause();
      next.volume = artistVol();
      next.play().catch(() => {});
      return;
    }
    next.volume = 0;
    next.play().catch(() => {});
    crossfade(cur, next, fade);
  }
  function ensureDecks() {
    if (decks) return;
    decks = [new Audio(), new Audio()];
    for (const a of decks) {
      a.addEventListener('timeupdate', () => {
        if (a !== decks[deck] || fadeTimer || a.paused) return;
        if (a.duration && a.duration - a.currentTime < FADE_END) advance(FADE_END);
      });
      // missed the fade window (backgrounded tab) — hard cut instead
      a.addEventListener('ended', () => {
        if (a === decks[deck] && !fadeTimer) advance(0);
      });
      a.addEventListener('playing', () => { deckErrors = 0; });
      a.addEventListener('error', () => {
        if (a === decks[deck] && ++deckErrors <= TRACKS.length) advance(0);
      });
      // buffering mid-track: give it the watchdog window to recover
      a.addEventListener('waiting', () => {
        if (a === decks[deck]) armWatchdog();
      });
    }
  }
  function startArtistMusic() {
    if (!tracksAvailable()) return false;
    ensureDecks();
    if (trackIdx < 0) {
      trackIdx = pickArtistTrack();
      decks[deck].src = TRACKS[trackIdx].src;
      updateNowPlaying(TRACKS[trackIdx]);
    }
    if (!fadeTimer) decks[deck].volume = artistVol();
    decks[0].muted = decks[1].muted = muted;
    decks[deck].play().catch(() => {});
    armWatchdog();
    Sound.stopMusic();
    $('nowPlaying').classList.remove('hidden');
    return true;
  }
  function stopArtistMusic() {
    clearInterval(fadeTimer); fadeTimer = null;
    clearTimeout(watchdog); watchdog = null;
    if (decks) { decks[0].pause(); decks[1].pause(); }
    $('nowPlaying').classList.add('hidden');
  }
  function artistWorldChanged() {
    if (settings.musicMode !== 'artists' || trackIdx < 0 || !decks) return;
    const w = settings.theme;
    const t = TRACKS[trackIdx];
    // a world click should land on that world's own sound: anywhere tracks
    // yield here too, persisting only when the world has nothing else
    if (t.worlds && t.worlds.includes(w)) return;
    if (!TRACKS.some((x, i) => i !== trackIdx && suitsWorld(x, w))) return;
    if (decks[deck].paused) {
      trackIdx = pickArtistTrack();
      decks[deck].src = TRACKS[trackIdx].src;
      updateNowPlaying(TRACKS[trackIdx]);
    } else {
      advance(FADE_SWITCH);
    }
  }
  function ensureMusic() {
    if (settings.musicMode === 'artists' && startArtistMusic()) return;
    stopArtistMusic();
    if (Sound.musicWanted()) Sound.startMusic();
  }

  // try-on preview: the snake in the style tab wears whatever you hover,
  // locked or not, so you can see a hat before earning it
  let lastPreview = '';
  function drawWardrobePreview(skinKey, hatKey, cat, item) {
    const cv = $('wardrobePreview');
    if (!cv) return;
    const skinName = skinKey || prog.skin;
    const hatName = hatKey !== undefined ? hatKey : prog.hat;
    // hovered cosmetic overrides its own category; everything else shows your picks
    const pick = c => (cat === c && item !== undefined) ? item : prog.cos[c];
    const trailK = pick('trail'), fruitK = pick('fruit'), burstK = pick('burst'), eyesK = pick('eyes');
    const now = performance.now();
    const key = [skinName, hatName, trailK, fruitK, burstK, eyesK, settings.theme, cat === 'burst' ? 'b' : ''].join('|');
    if (key === lastPreview) return;
    lastPreview = key;
    const sk = SKINS[skinName] || SKINS.drift;
    const dpr = window.devicePixelRatio || 1;
    const w = 150, h = 64, s = 46;
    cv.style.width = w + 'px';
    cv.style.height = h + 'px';
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    // with a trail the snake gets a visible tail so the wake reads as a wake
    if (trailK !== 'none') {
      for (let i = 0; i < 4; i++) {
        drawTrailDot(g, trailK, 7 + i * 12, h * 0.62 + (i % 2 ? 5 : -4), (4 - i) / 5.5, 0.13 + i * 0.21, now);
      }
    }
    const grad = g.createLinearGradient(w * 0.65, 0, 0, 0);
    grad.addColorStop(0, sk.a);
    grad.addColorStop(1, sk.b);
    g.strokeStyle = sk.pattern === 'gingham' ? ginghamPaint(g, 7) : grad;
    g.lineCap = 'round';
    g.lineWidth = s * 0.74;
    g.beginPath();
    g.moveTo(trailK !== 'none' ? w * 0.36 : -12, h * 0.64);
    g.quadraticCurveTo(w * 0.45, h * 0.64, w * 0.60, h * 0.62);
    g.stroke();
    const hx = w * 0.62, hy = h * 0.62;
    g.fillStyle = sk.head;
    g.beginPath();
    g.arc(hx, hy, s * 0.40, 0, Math.PI * 2);
    g.fill();
    drawFace(g, hx, hy, 1, 0, s, false, false, eyesK);
    if (hatName && hatName !== 'none') drawHat(g, hatName, hx, hy, s);
    // ahead of the snake: the chosen fruit — or its pop, while hovering effects
    const fx2 = w * 0.9, fy2 = h * 0.45, fr = 8.5;
    if (cat === 'burst') {
      const cols2 = BURST_COLORS[burstK] || [PAL.fruit, PAL.leaf];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.4;
        const px2 = fx2 + Math.cos(a) * fr * 1.5, py2 = fy2 + Math.sin(a) * fr * 1.5;
        const rr = fr * 0.42;
        g.fillStyle = cols2[i % cols2.length];
        if (burstK === 'confetti') {
          g.save(); g.translate(px2, py2); g.rotate(i * 1.1);
          g.fillRect(-rr * 0.9, -rr * 0.5, rr * 1.8, rr);
          g.restore();
        } else if (burstK === 'blossom') {
          g.save(); g.translate(px2, py2); g.rotate(i * 1.1);
          petalPath(g, rr * 1.2); g.fill();
          g.restore();
        } else if (burstK === 'stardust') {
          star4(g, px2, py2, rr * 1.5, rr * 0.55); g.fill();
        } else if (burstK === 'hearts') {
          heartPath(g, px2, py2, rr * 1.1); g.fill();
        } else {
          g.beginPath(); g.arc(px2, py2, rr, 0, Math.PI * 2); g.fill();
        }
      }
    } else {
      drawFruitIcon(g, fruitK, fx2, fy2, fr, now);
    }
  }

  // instant tooltips: any element with data-tip shows a styled bubble on hover
  const tipEl = document.createElement('div');
  tipEl.className = 'tip';
  document.querySelector('.stage').appendChild(tipEl);
  document.addEventListener('mouseover', e => {
    const t = e.target.closest ? e.target.closest('[data-tip]') : null;
    if (t && t.dataset.tip) {
      const sr = document.querySelector('.stage').getBoundingClientRect();
      const r = t.getBoundingClientRect();
      tipEl.textContent = t.dataset.tip;
      tipEl.style.left = (r.left - sr.left + r.width / 2) + 'px';
      tipEl.style.top = (r.top - sr.top) + 'px';
      tipEl.classList.add('show');
    } else {
      tipEl.classList.remove('show');
    }
    const wp = e.target.closest ? e.target.closest('[data-skin],[data-hat],[data-cat]') : null;
    if (wp) drawWardrobePreview(wp.dataset.skin, wp.dataset.hat, wp.dataset.cat, wp.dataset.item);
    else drawWardrobePreview();
  });

  // wardrobe (skins & hats live in progression, not settings)
  function refreshWardrobe() {
    document.querySelectorAll('#skinPills .pill').forEach(p => {
      const k = p.dataset.skin;
      const locked = !prog.skins.includes(k);
      p.classList.toggle('locked', locked);
      p.classList.toggle('active', !locked && prog.skin === k);
      p.dataset.tip = locked
        ? `${k} · ${SKINS[k].hint} · ${unlockProgress(SKINS[k].unlock)}`
        : `${k}${prog.skin === k ? ' · wearing' : ''}`;
    });
    document.querySelectorAll('#hatPills .pill').forEach(p => {
      const k = p.dataset.hat;
      const locked = k !== 'none' && !prog.hats.includes(k);
      p.classList.toggle('locked', locked);
      p.classList.toggle('active', !locked && prog.hat === k);
      p.dataset.tip = locked
        ? `${HATS[k].label} · ${HATS[k].hint} · ${unlockProgress(HATS[k].unlock)}`
        : k === 'none' ? 'no hat' : `${HATS[k].label}${prog.hat === k ? ' · wearing' : ''}`;
    });
    for (const c in COSMETICS) {
      const { table, pills } = COSMETICS[c];
      document.querySelectorAll(`#${pills} .pill`).forEach(p => {
        const k = p.dataset.item;
        const t = table[k];
        const locked = !!t.unlock && !prog.cosOwned[c].includes(k);
        p.classList.toggle('locked', locked);
        p.classList.toggle('active', !locked && prog.cos[c] === k);
        p.dataset.tip = locked
          ? `${t.label} · ${t.hint} · ${unlockProgress(t.unlock)}`
          : `${t.label}${prog.cos[c] === k ? ' · picked' : ''}`;
      });
    }
    drawWardrobePreview();
  }
  // the new categories build their pills from the tables, one row each
  for (const c in COSMETICS) {
    const { table, pills } = COSMETICS[c];
    const box = $(pills);
    for (const k in table) {
      const b = document.createElement('button');
      b.className = 'pill';
      b.dataset.cat = c;
      b.dataset.item = k;
      b.textContent = table[k].label;
      box.appendChild(b);
    }
    box.addEventListener('click', e => {
      const b = e.target.closest('.pill');
      if (!b) return;
      const k = b.dataset.item;
      const t = table[k];
      if (t.unlock && !prog.cosOwned[c].includes(k)) {
        toast(`${t.hint} · ${unlockProgress(t.unlock)}`);
        return;
      }
      prog.cos[c] = k;
      saveProg();
      refreshWardrobe();
      Sound.ui();
    });
  }
  $('skinPills').addEventListener('click', e => {
    const b = e.target.closest('.pill');
    if (!b) return;
    const k = b.dataset.skin;
    if (!prog.skins.includes(k)) {
      toast(`${SKINS[k].hint} · ${unlockProgress(SKINS[k].unlock)}`);
      return;
    }
    prog.skin = k;
    saveProg();
    refreshWardrobe();
    Sound.ui();
  });
  $('hatPills').addEventListener('click', e => {
    const b = e.target.closest('.pill');
    if (!b) return;
    const k = b.dataset.hat;
    if (k !== 'none' && !prog.hats.includes(k)) {
      toast(`${HATS[k].hint} · ${unlockProgress(HATS[k].unlock)}`);
      return;
    }
    prog.hat = k;
    saveProg();
    refreshWardrobe();
    Sound.ui();
  });

  // the wardrobe shows one category at a time, picked by the little tab row
  const WARDROBE_CATS = { snake: 'skinPills', hat: 'hatPills', trail: 'trailPills', fruit: 'fruitPills', munch: 'burstPills', eyes: 'eyePills' };
  function showWardrobeCat(cat) {
    document.querySelectorAll('#wardrobeTabs .pill').forEach(p =>
      p.classList.toggle('active', p.dataset.wcat === cat));
    for (const c in WARDROBE_CATS) $(WARDROBE_CATS[c]).classList.toggle('hidden', c !== cat);
  }
  $('wardrobeTabs').addEventListener('click', e => {
    const b = e.target.closest('.pill');
    if (!b) return;
    showWardrobeCat(b.dataset.wcat);
    Sound.ui();
  });
  showWardrobeCat('snake');

  for (const [id, key] of [['musicVol', 'musicVol'], ['sfxVol', 'sfxVol']]) {
    const el = $(id);
    el.value = Math.round(settings[key] * 100);
    el.addEventListener('input', () => {
      settings[key] = el.value / 100;
      saveSettings();
      Sound.ensure();
      Sound.setVolumes(settings.sfxVol, settings.musicVol);
      if (settings.musicMode === 'artists' && tracksAvailable()) {
        Sound.stopMusic();
        if (decks && !fadeTimer) decks[deck].volume = artistVol();
        if (settings.musicVol > 0) startArtistMusic();
      }
    });
  }

  $('playBtn').addEventListener('click', () => startRun(challenge ? challenge.seed : randomSeed()));
  $('dailyBtn').addEventListener('click', () => startDaily());
  $('gardenBack').addEventListener('click', exitGarden);
  $('gardenWrap').addEventListener('click', enterGarden);
  $('againBtn').addEventListener('click', () => {
    if (daily) startRun(dailySeed(daily.n));
    else startRun(challenge ? challenge.seed : randomSeed());
  });
  $('raceBtn').addEventListener('click', () => startRun(runSeed));
  function backToMenu() {
    if (challenge) {
      challenge = null;
      history.replaceState(null, '', location.pathname);
      $('challengeNote').classList.add('hidden');
    }
    if (stashedSettings) {
      settings = stashedSettings;
      stashedSettings = null;
      applyTheme();
    }
    daily = null;
    player = null; ghost = null;
    state = 'menu';
    flushProg();
    configureBoard();
    updateScoreUI();
    refreshWardrobe();
    updateDailyBtn();
    showOverlay('menu');
  }
  $('menuBtn').addEventListener('click', backToMenu);
  $('resumeBtn').addEventListener('click', () => { state = 'playing'; lastTime = 0; showOverlay(null); });
  $('pauseMenuBtn').addEventListener('click', backToMenu);

  function shareURL() {
    const u = new URL(location.origin + location.pathname);
    u.searchParams.set('m', settings.mode);
    u.searchParams.set('p', settings.pace);
    u.searchParams.set('s', settings.size);
    u.searchParams.set('l', settings.layout);
    u.searchParams.set('f', settings.fruits);
    u.searchParams.set('seed', seedStr(runSeed));
    u.searchParams.set('goal', player.score);
    return u.toString();
  }

  function resultText() {
    const lines = [];
    lines.push(daily ? `drift · daily #${daily.n} 🌱` : `drift · ${settings.mode}`);
    const bits = [`score ${player.score}`, `🍎 ${runStats.fruit}`];
    if (runStats.timed) bits.push(`⏱ ${runStats.timed}`);
    if (runStats.golden) bits.push(`✨ ${runStats.golden}`);
    if (daily && prog.dailyStreak > 1) bits.push(`🔥 ${prog.dailyStreak} days`);
    lines.push(bits.join(' · '));
    lines.push(`beat me → ${shareURL()}`);
    return lines.join('\n');
  }

  $('copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(resultText()).then(() => {
      $('copyBtn').textContent = 'copied ✓';
    }).catch(() => {});
  });

  $('cardBtn').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = drawCard();
    a.download = `drift-${daily ? 'daily-' + daily.n : seedStr(runSeed)}.png`;
    a.click();
  });

  function updateDailyBtn() {
    const n = dailyIndex();
    const dayBest = +(localStorage.getItem('drift-daily:' + n) || 0);
    $('dailyBtn').textContent = prog.dailyLast === n ? `daily #${n} · ✓ ${dayBest}` : `daily #${n}`;
  }

  // pastel share-card image (1200x630, social-preview sized)
  function drawCard() {
    const W = 1200, H = 630;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = PAL.bg;
    x.fillRect(0, 0, W, H);
    x.fillStyle = PAL.boardA;
    x.beginPath();
    if (x.roundRect) x.roundRect(60, 60, W - 120, H - 120, 40); else x.rect(60, 60, W - 120, H - 120);
    x.fill();

    x.textAlign = 'center';
    x.fillStyle = PAL.inkSoft;
    x.font = '700 44px Quicksand, sans-serif';
    x.fillText('drift · snake', W / 2, 160);
    x.fillStyle = PAL.ink;
    x.font = '700 150px Quicksand, sans-serif';
    x.fillText(player ? player.score : 0, W / 2, 330);
    x.fillStyle = PAL.inkSoft;
    x.font = '700 36px Quicksand, sans-serif';
    const sub = daily ? `daily #${daily.n}` : `${settings.mode} · seed ${seedStr(runSeed)}`;
    x.fillText(sub, W / 2, 390);
    const bits = [`${runStats.fruit} fruit`];
    if (runStats.timed) bits.push(`${runStats.timed} timed`);
    if (runStats.golden) bits.push(`${runStats.golden} golden`);
    if (daily && prog.dailyStreak > 1) bits.push(`${prog.dailyStreak}-day streak`);
    x.fillText(bits.join(' · '), W / 2, 440);

    const rng = mulberry32(((player ? player.score : 0) + 7) * 31);
    for (let i = 0; i < 22; i++) {
      const fx = 140 + i * ((W - 280) / 21) + rng() * 10;
      const stemH = 26 + rng() * 22;
      x.strokeStyle = '#7da379';
      x.lineWidth = 3;
      x.beginPath();
      x.moveTo(fx, H - 90);
      x.quadraticCurveTo(fx + (rng() - 0.5) * 10, H - 90 - stemH * 0.6, fx, H - 90 - stemH);
      x.stroke();
      x.fillStyle = FLOWER_COLORS[Math.floor(rng() * FLOWER_COLORS.length)];
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2 + rng();
        x.beginPath();
        x.arc(fx + Math.cos(a) * 7, H - 90 - stemH + Math.sin(a) * 7, 5.5, 0, Math.PI * 2);
        x.fill();
      }
      x.fillStyle = '#f8e9a1';
      x.beginPath();
      x.arc(fx, H - 90 - stemH, 4, 0, Math.PI * 2);
      x.fill();
    }
    return c.toDataURL('image/png');
  }

  // ---------- stats panel ----------
  function bar(cur, max) {
    const pct = Math.min(100, Math.round((cur / max) * 100));
    return `<div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div><span class="bar-num">${Math.min(cur, max)}/${max}</span>`;
  }
  function renderStats() {
    const totals = [
      ['fruit', prog.fruitTotal], ['blooms', Math.floor(prog.fruitTotal / 10)],
      ['golden', prog.golden], ['perfect', prog.perfect], ['clutch', prog.clutch],
      ['ghost wins', prog.ghostWins], ['daily streak', prog.dailyStreak],
    ];
    let h = '<div class="stat-chips">' +
      totals.map(([k, v]) => `<div class="stat-chip"><b>${v}</b><span>${k}</span></div>`).join('') +
      '</div>';

    h += '<div class="label" style="margin-top:10px">snakes</div><div class="stat-list">';
    for (const k in SKINS) {
      const u = SKINS[k].unlock;
      if (!u) continue;
      const done = prog.skins.includes(k);
      const cur = u.timed ? (prog.timed[u.timed] || 0) : (prog[u.stat] || 0);
      h += `<div class="stat-row${done ? ' done' : ''}">` +
        `<i class="swatch" style="background:linear-gradient(135deg,${SKINS[k].a},${SKINS[k].b})"></i>` +
        `<span class="stat-name">${k}</span>` +
        (done ? '<span class="check">✓</span>' : bar(cur, u.n)) + '</div>';
    }
    h += '</div><div class="label" style="margin-top:10px">hats</div><div class="stat-list">';
    for (const k in HATS) {
      const u = HATS[k].unlock;
      if (!u) continue;
      const done = prog.hats.includes(k);
      const cur = prog[u.stat] || 0;
      h += `<div class="stat-row${done ? ' done' : ''}">` +
        `<span class="stat-name">${HATS[k].label}</span>` +
        (done ? '<span class="check">✓</span>' : bar(cur, u.n)) + '</div>';
    }
    h += '</div>';
    for (const c in COSMETICS) {
      const { table, word } = COSMETICS[c];
      h += `<div class="label" style="margin-top:10px">${word}s</div><div class="stat-list">`;
      for (const k in table) {
        const u = table[k].unlock;
        if (!u) continue;
        const done = prog.cosOwned[c].includes(k);
        const cur = u.timed ? (prog.timed[u.timed] || 0) : (prog[u.stat] || 0);
        h += `<div class="stat-row${done ? ' done' : ''}">` +
          `<span class="stat-name">${table[k].label}</span>` +
          (done ? '<span class="check">✓</span>' : bar(cur, u.n)) + '</div>';
      }
      h += '</div>';
    }
    h += '<div class="label" style="margin-top:10px">garden</div><div class="stat-list">';
    for (const k in DECOR) {
      const u = DECOR[k].unlock;
      const done = prog.deco.includes(k);
      const cur = u.timed ? (prog.timed[u.timed] || 0) : (prog[u.stat] || 0);
      h += `<div class="stat-row${done ? ' done' : ''}">` +
        `<span class="stat-name">${DECOR[k].label}</span>` +
        (done ? '<span class="check">✓</span>' : bar(cur, u.n)) + '</div>';
    }
    h += '</div><div class="label" style="margin-top:10px">bests · current setup</div><div class="stat-chips">';
    for (const m of ['classic', 'rush', 'trial']) {
      const key = 'drift-best:' + [m, settings.pace, settings.size, settings.layout, settings.fruits].join(':');
      h += `<div class="stat-chip"><b>${localStorage.getItem(key) || 0}</b><span>${m}</span></div>`;
    }
    h += '</div>';
    $('tab-stats').innerHTML = h;
  }

  // ---------- menu tabs ----------
  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === t));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('hidden', p.id !== 'tab-' + t.dataset.tab));
      if (t.dataset.tab === 'stats') renderStats();
      Sound.ui();
    });
  });

  $('muteBtn').addEventListener('click', () => {
    muted = !muted;
    localStorage.setItem('drift-muted', muted ? '1' : '0');
    Sound.ensure();
    Sound.setMuted(muted);
    if (decks) decks[0].muted = decks[1].muted = muted;
    $('soundOn').style.display = muted ? 'none' : 'block';
    $('soundOff').style.display = muted ? 'block' : 'none';
  });
  if (muted) {
    Sound.setMuted(true);
    $('soundOn').style.display = 'none';
    $('soundOff').style.display = 'block';
  }

  window.addEventListener('resize', fitCanvas);

  // ---------- challenge links ----------
  (function parseURL() {
    const q = new URLSearchParams(location.search);
    if (!q.get('seed')) return;
    const valid = {
      m: MODES, p: Object.keys(SPEEDS),
      s: ['small', 'normal', 'large'], l: ['wide', 'tall'], f: Object.keys(FRUIT_TARGET),
    };
    for (const [param, key] of [['m', 'mode'], ['p', 'pace'], ['s', 'size'], ['l', 'layout'], ['f', 'fruits']]) {
      const v = q.get(param);
      if (v && valid[param].includes(v)) settings[key] = v;
    }
    const seed = parseInt(q.get('seed'), 36) >>> 0;
    const goal = +q.get('goal') || null;
    challenge = { seed, goal };
    const note = $('challengeNote');
    note.textContent = goal ? `challenge · beat ${goal}` : 'challenge loaded';
    note.classList.remove('hidden');
  })();

  // ---------- render helpers ----------
  const lerp = (a, b, t) => a + (b - a) * t;
  const center = c => ({ x: (c.x + 0.5) * cell, y: (c.y + 0.5) * cell });

  function gridDelta(a, b) {
    let dx = b.x - a.x, dy = b.y - a.y;
    if (dx > 1) dx = -1; else if (dx < -1) dx = 1;
    if (dy > 1) dy = -1; else if (dy < -1) dy = 1;
    return { x: dx, y: dy };
  }

  function drawBoard() {
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        ctx.fillStyle = (x + y) % 2 ? PAL.boardB : PAL.boardA;
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
  }

  // a fluffy flat-bottomed rain cloud. Each layer is a single fill over a
  // union of lobes, so the translucent color stays even with no overlap
  // seams: grey body, lit crown along the top, rain-heavy shaded belly.
  // v1..v3 vary the lobe sizes so no two clouds share a silhouette.
  function drawCloud(g, x, y, s, alpha, v1, v2, v3) {
    const lobes = [
      [-0.78, 0.02, 0.30 * v1],
      [-0.42, -0.14, 0.45 * v2],
      [0.00, -0.24, 0.55 * v3],
      [0.40, -0.12, 0.44 * v1],
      [0.76, 0.04, 0.29 * v2],
    ];
    g.beginPath();
    for (const [ox, oy, lr] of lobes) g.arc(x + ox * s, y + oy * s, lr * s, 0, Math.PI * 2);
    g.rect(x - 0.78 * s, y - 0.02 * s, 1.54 * s, 0.22 * s);
    g.fillStyle = `rgba(201,211,231,${alpha})`;
    g.fill();
    g.beginPath();
    for (const [ox, oy, lr] of lobes) g.arc(x + (ox - 0.05) * s, y + (oy - 0.08) * s, lr * 0.62 * s, 0, Math.PI * 2);
    g.fillStyle = `rgba(233,240,252,${alpha * 0.45})`;
    g.fill();
    g.beginPath();
    g.ellipse(x, y + 0.18 * s, 0.82 * s, 0.14 * s, 0, 0, Math.PI * 2);
    g.fillStyle = `rgba(116,128,154,${alpha * 0.6})`;
    g.fill();
  }

  // static scene dressing per palette: stars after dark, seaweed on the seabed
  function drawScene(now) {
    if (settings.ambience !== 'on') return;
    if (settings.theme === 'midnight') {
      const rng = mulberry32(99);
      const n = Math.floor(cols * rows / 7);
      ctx.fillStyle = '#cdd3ec';
      for (let i = 0; i < n; i++) {
        const x = rng() * cols * cell, y = rng() * rows * cell;
        const r = cell * (0.025 + rng() * 0.022);
        const tw = 0.22 + 0.4 * Math.sin(now / (500 + rng() * 600) + i * 1.7);
        ctx.globalAlpha = Math.max(0.04, tw);
        ctx.fillRect(x, y, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
    } else if (settings.theme === 'tide') {
      // coral clusters along the seabed: branching fingers, gentle and still
      const rng = mulberry32(77);
      const H = rows * cell;
      const clusters = Math.max(4, Math.floor(cols / 3));
      const CORALS = ['rgba(214,118,124,.42)', 'rgba(226,160,110,.40)', 'rgba(94,150,142,.42)', 'rgba(186,130,170,.38)'];
      for (let i = 0; i < clusters; i++) {
        const cx = rng() * cols * cell;
        const color = CORALS[Math.floor(rng() * CORALS.length)];
        ctx.fillStyle = color;
        const fingers = 3 + Math.floor(rng() * 3);
        const breathe = Math.sin(now / (1700 + rng() * 600) + i) * 1.5;
        for (let f = 0; f < fingers; f++) {
          const fx = cx + (f - (fingers - 1) / 2) * cell * 0.17 + breathe * (f % 2 ? 1 : -1) * 0.4;
          const fh = cell * (0.30 + rng() * 0.55) * (1 - Math.abs(f - (fingers - 1) / 2) * 0.18);
          const r0 = cell * (0.085 + rng() * 0.03);
          for (let y = 0; y <= fh; y += r0 * 0.9) {
            const r = r0 * (1 - (y / fh) * 0.45);
            ctx.beginPath();
            ctx.arc(fx + Math.sin(y / cell * 2 + i) * cell * 0.03, H - y, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        // a small pebble beside each cluster
        ctx.fillStyle = 'rgba(120,140,138,.30)';
        ctx.beginPath();
        ctx.ellipse(cx + cell * (0.4 + rng() * 0.3), H - cell * 0.05, cell * 0.12, cell * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (settings.theme === 'storm') {
      const W = cols * cell, H = rows * cell;
      // cloud banks in two depths, drifting on the same wind as the rain
      const rng = mulberry32(55);
      for (let i = 0; i < 6; i++) {
        const far = i < 3;
        const s = cell * (far ? 1.05 + rng() * 0.5 : 1.6 + rng() * 0.9);
        const sp = (far ? 0.0016 : 0.0034) + rng() * 0.0012;
        const span = W + s * 3.2;
        const x = W + s * 1.6 - ((now * sp + rng() * 6000) % span);
        const y = cell * (far ? 0.45 : 0.8) + rng() * cell * 0.55;
        drawCloud(ctx, x, y, s, far ? 0.10 : 0.17,
          0.85 + rng() * 0.3, 0.85 + rng() * 0.3, 0.85 + rng() * 0.3);
      }
      // far-off lightning: a soft glow behind the clouds, never a hard flash
      const period = 9000;
      const cyc = Math.floor(now / period);
      const fr = mulberry32(cyc * 9176 + 3);
      const at = fr() * (period - 900);
      const tf = now - cyc * period - at;
      if (fr() < 0.55 && tf > 0 && tf < 460) {
        const k = tf / 460;
        const pulse = Math.sin(k * Math.PI) * (0.72 + 0.28 * Math.sin(k * Math.PI * 3));
        ctx.fillStyle = `rgba(222,230,250,${0.085 * pulse})`;
        ctx.fillRect(0, 0, W, H);
      }
    }
  }

  // ---------- fruit drawing ----------
  function fruitShadow(cx, cy, r) {
    ctx.fillStyle = 'rgba(0,0,0,.10)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + cell * 0.30, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawApple(fx, fy, now, golden) {
    const c = center({ x: fx, y: fy });
    const bob = Math.sin(now / 320 + fx * 1.7 + fy) * cell * 0.045;
    const r = cell * 0.31;
    const y = c.y + bob;
    fruitShadow(c.x, c.y, r);
    if (golden) {
      // a golden apple is its own reward, never redressed
      ctx.fillStyle = '#e2b13c';
      ctx.beginPath();
      ctx.arc(c.x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f6e3a8';
      ctx.beginPath();
      ctx.arc(c.x - r * 0.32, y - r * 0.32, r * 0.30, 0, Math.PI * 2);
      ctx.fill();
      const tw = 0.5 + 0.5 * Math.sin(now / 220 + fx);
      ctx.fillStyle = `rgba(255,250,220,${0.4 + tw * 0.6})`;
      starPath(c.x + r * 0.9, y - r * 1.1, r * (0.22 + tw * 0.12), r * 0.07, 4);
      ctx.fill();
      appleStemLeaf(ctx, c.x, y, r);
      return;
    }
    drawFruitIcon(ctx, prog.cos.fruit || 'apple', c.x, y, r, now);
  }

  function appleStemLeaf(g, x, y, r) {
    g.strokeStyle = PAL.stem;
    g.lineWidth = Math.max(1.5, cell * 0.045);
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(x, y - r * 0.9);
    g.quadraticCurveTo(x + r * 0.15, y - r * 1.25, x + r * 0.1, y - r * 1.45);
    g.stroke();
    g.fillStyle = PAL.leaf;
    g.beginPath();
    g.ellipse(x + r * 0.45, y - r * 1.25, r * 0.42, r * 0.2, -0.5, 0, Math.PI * 2);
    g.fill();
  }

  // the plain fruit in its chosen outfit — shared by the board and the wardrobe preview
  function drawFruitIcon(g, kind, x, y, r, now) {
    if (kind === 'peach') {
      g.fillStyle = '#f4a98c';
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ef8f86';
      g.beginPath(); g.arc(x + r * 0.35, y + r * 0.25, r * 0.55, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#fbd0b9';
      g.beginPath(); g.arc(x - r * 0.34, y - r * 0.34, r * 0.28, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(200,110,80,.55)';
      g.lineWidth = Math.max(1, cell * 0.035);
      g.beginPath();
      g.moveTo(x + r * 0.05, y - r * 0.95);
      g.quadraticCurveTo(x - r * 0.35, y - r * 0.2, x + r * 0.05, y + r * 0.92);
      g.stroke();
      appleStemLeaf(g, x, y, r);
    } else if (kind === 'boba') {
      const w = r * 0.78, top = y - r * 0.85, bot = y + r * 0.95;
      // straw first, poking out behind the lid
      g.strokeStyle = '#e8849d';
      g.lineWidth = Math.max(2, r * 0.22);
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x + r * 0.18, top + r * 0.25);
      g.lineTo(x + r * 0.45, top - r * 0.55);
      g.stroke();
      g.fillStyle = '#ecd9bd';
      g.beginPath();
      g.moveTo(x - w, top);
      g.lineTo(x + w, top);
      g.lineTo(x + w * 0.78, bot);
      g.quadraticCurveTo(x, bot + r * 0.18, x - w * 0.78, bot);
      g.closePath();
      g.fill();
      g.fillStyle = '#5a4632';
      for (const [ox, oy] of [[-0.38, 0.62], [0, 0.72], [0.36, 0.6], [-0.18, 0.4], [0.2, 0.38]]) {
        g.beginPath();
        g.arc(x + ox * r, y + oy * r, r * 0.14, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = 'rgba(255,255,255,.45)';
      g.fillRect(x - w * 0.62, top + r * 0.25, r * 0.2, r * 1.1);
      g.strokeStyle = '#d9c3a3';
      g.lineWidth = Math.max(1, cell * 0.03);
      g.beginPath();
      g.moveTo(x - w * 1.06, top);
      g.lineTo(x + w * 1.06, top);
      g.stroke();
    } else if (kind === 'onigiri') {
      g.fillStyle = '#fdfdf6';
      g.beginPath();
      g.moveTo(x, y - r * 1.0);
      g.quadraticCurveTo(x + r * 1.05, y - r * 0.9, x + r * 0.92, y + r * 0.35);
      g.quadraticCurveTo(x + r * 0.8, y + r * 0.85, x, y + r * 0.85);
      g.quadraticCurveTo(x - r * 0.8, y + r * 0.85, x - r * 0.92, y + r * 0.35);
      g.quadraticCurveTo(x - r * 1.05, y - r * 0.9, x, y - r * 1.0);
      g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(0,0,0,.08)';
      g.lineWidth = Math.max(1, cell * 0.03);
      g.beginPath();
      g.arc(x + r * 0.3, y + r * 0.1, r * 0.45, -0.6, 1.2);
      g.stroke();
      g.fillStyle = '#3d4a3a';
      g.fillRect(x - r * 0.32, y + r * 0.18, r * 0.64, r * 0.6);
    } else if (kind === 'lantern') {
      const pulse = 0.5 + 0.5 * Math.sin(now / 480 + x * 0.13);
      g.fillStyle = `rgba(247,200,120,${0.12 + pulse * 0.12})`;
      g.beginPath(); g.arc(x, y, r * 1.55, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#7a5230';
      g.fillRect(x - r * 0.28, y - r * 1.12, r * 0.56, r * 0.22);
      g.fillRect(x - r * 0.22, y + r * 0.92, r * 0.44, r * 0.18);
      g.fillStyle = '#f2a96b';
      g.beginPath(); g.ellipse(x, y, r * 0.82, r * 0.98, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = `rgba(253,243,192,${0.45 + pulse * 0.4})`;
      g.beginPath(); g.ellipse(x, y, r * 0.4, r * 0.55, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(160,90,40,.35)';
      g.lineWidth = Math.max(1, cell * 0.03);
      for (const k of [-0.5, 0, 0.5]) {
        g.beginPath();
        g.ellipse(x, y, r * 0.82 * Math.sqrt(1 - k * k * 0.7), r * 0.98, 0, 0, Math.PI * 2);
        g.stroke();
      }
    } else {
      g.fillStyle = PAL.fruit;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = PAL.fruitHi;
      g.beginPath();
      g.arc(x - r * 0.32, y - r * 0.32, r * 0.30, 0, Math.PI * 2);
      g.fill();
      appleStemLeaf(g, x, y, r);
    }
  }

  function starPath(cx, cy, ro, ri, n) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? ri : ro;
      const a = -Math.PI / 2 + (i * Math.PI) / n;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.closePath();
  }

  function drawTimedFruit(kind, fx, fy, now, frac, secs, pulse) {
    const c = center({ x: fx, y: fy });
    const k = pulse ? 1 + Math.sin(now / 70) * 0.08 : 1;
    const r = cell * 0.33 * k;
    fruitShadow(c.x, c.y, r);

    if (kind === 'orange') {
      ctx.fillStyle = '#f2a64b';
      ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f8cd8e';
      ctx.beginPath(); ctx.arc(c.x - r * 0.3, c.y - r * 0.3, r * 0.28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#88b884';
      ctx.beginPath(); ctx.ellipse(c.x + r * 0.35, c.y - r * 1.05, r * 0.38, r * 0.18, -0.5, 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'dragonfruit') {
      ctx.fillStyle = '#e8508d';
      ctx.beginPath(); ctx.ellipse(c.x, c.y, r * 0.85, r, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f6a8c8';
      ctx.beginPath(); ctx.arc(c.x - r * 0.25, c.y - r * 0.3, r * 0.25, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7fb069';
      for (const [ax, ay, rot] of [[-0.6, -0.55, -2.2], [0.6, -0.55, 2.2], [-0.7, 0.4, -3.6], [0.7, 0.4, 3.6]]) {
        ctx.save();
        ctx.translate(c.x + ax * r, c.y + ay * r);
        ctx.rotate(rot);
        ctx.beginPath(); ctx.ellipse(0, 0, r * 0.28, r * 0.11, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    } else if (kind === 'kiwi') {
      ctx.fillStyle = '#7a5230';
      ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9bc53d';
      ctx.beginPath(); ctx.arc(c.x, c.y, r * 0.9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e9f5d3';
      ctx.beginPath(); ctx.arc(c.x, c.y, r * 0.38, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3a2d1d';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(c.x + Math.cos(a) * r * 0.58, c.y + Math.sin(a) * r * 0.58, r * 0.06, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (kind === 'starfruit') {
      ctx.fillStyle = 'rgba(244,211,94,.25)';
      starPath(c.x, c.y, r * 1.35, r * 0.6, 5);
      ctx.fill();
      ctx.fillStyle = '#f4d35e';
      starPath(c.x, c.y, r * 1.05, r * 0.48, 5);
      ctx.fill();
      ctx.fillStyle = '#f9e6a0';
      ctx.beginPath(); ctx.arc(c.x, c.y, r * 0.22, 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'persimmon') {
      ctx.fillStyle = '#e8763a';
      ctx.beginPath(); ctx.ellipse(c.x, c.y + r * 0.08, r, r * 0.85, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f3a06b';
      ctx.beginPath(); ctx.arc(c.x - r * 0.3, c.y - r * 0.2, r * 0.26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7c9a55';
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        ctx.save();
        ctx.translate(c.x, c.y - r * 0.62);
        ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(r * 0.22, 0, r * 0.26, r * 0.12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    } else if (kind === 'plum') {
      ctx.fillStyle = '#7d6b9e';
      ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#665687';
      ctx.lineWidth = Math.max(1, cell * 0.035);
      ctx.beginPath();
      ctx.moveTo(c.x, c.y - r * 0.85);
      ctx.quadraticCurveTo(c.x - r * 0.35, c.y, c.x - r * 0.15, c.y + r * 0.8);
      ctx.stroke();
      ctx.fillStyle = '#a99cc4';
      ctx.beginPath(); ctx.arc(c.x + r * 0.3, c.y - r * 0.3, r * 0.24, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = PAL.stem;
      ctx.lineWidth = Math.max(1.5, cell * 0.045);
      ctx.beginPath();
      ctx.moveTo(c.x, c.y - r * 0.9);
      ctx.lineTo(c.x + r * 0.12, c.y - r * 1.25);
      ctx.stroke();
    } else if (kind === 'lemon') {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(-0.35);
      ctx.fillStyle = '#f4d35e';
      ctx.beginPath(); ctx.ellipse(0, 0, r * 1.02, r * 0.74, 0, 0, Math.PI * 2); ctx.fill();
      // little nubs on the tips
      ctx.beginPath(); ctx.arc(-r * 0.98, 0, r * 0.14, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.98, 0, r * 0.14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f9eba6';
      ctx.beginPath(); ctx.arc(-r * 0.25, -r * 0.22, r * 0.24, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#88b884';
      ctx.beginPath(); ctx.ellipse(c.x + r * 0.55, c.y - r * 0.85, r * 0.34, r * 0.16, -0.6, 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'blueberry') {
      ctx.fillStyle = '#5c6bc0';
      ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#aab6e8';
      ctx.beginPath(); ctx.arc(c.x - r * 0.3, c.y - r * 0.3, r * 0.26, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3d4a8f';
      ctx.lineWidth = Math.max(1, cell * 0.03);
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y - r * 0.62);
        ctx.lineTo(c.x + Math.cos(a) * r * 0.16, c.y - r * 0.62 + Math.sin(a) * r * 0.16 * 0.5);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = PAL.bonusRing;
    ctx.lineWidth = Math.max(2, cell * 0.07);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(c.x, c.y, cell * 0.46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, frac));
    ctx.stroke();

    ctx.fillStyle = PAL.ink;
    ctx.font = `700 ${Math.round(cell * 0.42)}px Quicksand, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(secs, c.x, c.y - cell * 0.55);
  }

  // ---------- trails ----------
  // soft somethings left where the tail has been — one puff per vacated cell,
  // purely visual (Math.random only, never the seeded run rng)
  let trailDots = [], lastTrailCell = '';
  function petalPath(g, s) {
    g.beginPath();
    g.moveTo(0, -s * 1.35);
    g.quadraticCurveTo(s, -s * 0.35, 0, s);
    g.quadraticCurveTo(-s, -s * 0.35, 0, -s * 1.35);
  }
  function star4(g, x, y, ro, ri) {
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 ? ri : ro;
      const a = -Math.PI / 2 + (i * Math.PI) / 4;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (i) g.lineTo(px, py); else g.moveTo(px, py);
    }
    g.closePath();
  }
  function heartPath(g, x, y, s) {
    g.beginPath();
    g.moveTo(x, y + s * 0.9);
    g.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.6, y - s * 1.1, x, y - s * 0.35);
    g.bezierCurveTo(x + s * 0.6, y - s * 1.1, x + s * 1.4, y - s * 0.1, x, y + s * 0.9);
    g.closePath();
  }
  function emitTrail(now) {
    if (!player || prog.cos.trail === 'none' || state !== 'playing') return;
    const pt = player.prevTail || player.snake[player.snake.length - 1];
    const key = pt.x + ',' + pt.y;
    if (key === lastTrailCell) return;
    lastTrailCell = key;
    const c = center(pt);
    const n = prog.cos.trail === 'glow' || prog.cos.trail === 'sparkle' ? 1 : 2;
    for (let i = 0; i < n; i++) {
      trailDots.push({
        x: c.x + (Math.random() - 0.5) * cell * 0.5,
        y: c.y + (Math.random() - 0.5) * cell * 0.5,
        born: now, seed: Math.random(), kind: prog.cos.trail,
      });
    }
    if (trailDots.length > 140) trailDots.splice(0, trailDots.length - 140);
  }
  // t runs 0→1 over a dot's life; drawable into any context (board + preview)
  function drawTrailDot(g, kind, x, y, t, seed, now) {
    const a = 1 - t;
    if (kind === 'petals') {
      g.save();
      g.translate(x + Math.sin(now / 700 + seed * 6) * cell * 0.08, y + t * cell * 0.4);
      g.rotate(seed * 6 + now / 900);
      g.globalAlpha = 0.75 * a;
      g.fillStyle = '#f293b9';
      petalPath(g, cell * (0.07 + seed * 0.04));
      g.fill();
      g.restore();
    } else if (kind === 'bubbles') {
      g.globalAlpha = 0.6 * a;
      g.strokeStyle = 'rgba(255,255,255,.9)';
      g.lineWidth = Math.max(1, cell * 0.03);
      const r = cell * (0.05 + seed * 0.06);
      const by = y - t * cell * 0.55;
      g.beginPath(); g.arc(x, by, r, 0, Math.PI * 2); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.8)';
      g.beginPath(); g.arc(x - r * 0.35, by - r * 0.35, r * 0.22, 0, Math.PI * 2); g.fill();
    } else if (kind === 'glow') {
      const tw = 0.6 + 0.4 * Math.sin(now / 300 + seed * 9);
      g.globalAlpha = 0.45 * a * tw;
      g.fillStyle = '#f4d35e';
      g.beginPath(); g.arc(x, y, cell * 0.10, 0, Math.PI * 2); g.fill();
      g.globalAlpha = Math.min(1, a * tw * 1.5);
      g.fillStyle = '#fdf3c0';
      g.beginPath(); g.arc(x, y, cell * 0.045, 0, Math.PI * 2); g.fill();
    } else if (kind === 'snowdust') {
      g.globalAlpha = 0.8 * a;
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(x + Math.sin(now / 900 + seed * 7) * cell * 0.06, y + t * cell * 0.3,
        cell * (0.03 + seed * 0.03), 0, Math.PI * 2);
      g.fill();
    } else if (kind === 'sparkle') {
      const tw = 0.5 + 0.5 * Math.sin(now / 170 + seed * 12);
      g.globalAlpha = a * (0.35 + 0.65 * tw);
      g.fillStyle = seed < 0.5 ? '#f4d35e' : '#fdf3c0';
      const r = cell * (0.07 + seed * 0.05);
      star4(g, x, y, r, r * 0.38);
      g.fill();
    } else if (kind === 'rainbow') {
      g.globalAlpha = 0.65 * a;
      g.fillStyle = `hsl(${Math.round((seed * 360 + now * 0.04) % 360)}, 70%, 72%)`;
      g.beginPath();
      g.arc(x, y, cell * (0.06 + seed * 0.04), 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  }
  function drawTrail(now) {
    const LIFE = 1300;
    for (let i = trailDots.length - 1; i >= 0; i--) {
      const d = trailDots[i];
      const t = (now - d.born) / LIFE;
      if (t >= 1) { trailDots.splice(i, 1); continue; }
      drawTrailDot(ctx, d.kind, d.x, d.y, t, d.seed, now);
    }
    ctx.globalAlpha = 1;
  }

  // ---------- picnic gingham ----------
  // a checked picnic-blanket weave: cream ground, soft red warp and weft,
  // the crossings going naturally darker where they overlap. The tile is
  // cached per check size; the pattern itself is cheap to mint per frame.
  let ginghamTile = null, ginghamU = 0;
  function ginghamPaint(g, u) {
    u = Math.max(3, Math.round(u));
    if (!ginghamTile || ginghamU !== u) {
      ginghamTile = document.createElement('canvas');
      ginghamTile.width = ginghamTile.height = u * 2;
      const t = ginghamTile.getContext('2d');
      t.fillStyle = '#f7e8d8';
      t.fillRect(0, 0, u * 2, u * 2);
      t.fillStyle = 'rgba(217,76,58,.45)';
      t.fillRect(0, 0, u, u * 2);
      t.fillRect(0, 0, u * 2, u);
      ginghamU = u;
    }
    return g.createPattern(ginghamTile, 'repeat');
  }

  // ---------- snake drawing ----------
  function snakePath(sim, t) {
    const s = sim.snake;
    const pts = [];
    const heads = [];
    const a = s[1], b = s[0];
    const d = gridDelta(a, b);
    const ca = center(a);
    const wrapHead = (a.x + d.x !== b.x) || (a.y + d.y !== b.y);
    if (wrapHead) {
      // head's image on the entering side: body trails off-board behind it
      const cb = center(b);
      pts.push({ x: cb.x - d.x * cell * (1 - t), y: cb.y - d.y * cell * (1 - t) });
      heads.push(pts[0]);
    }
    const vh = { x: ca.x + d.x * cell * t, y: ca.y + d.y * cell * t, tip: true };
    pts.push(vh);
    heads.unshift(vh);
    for (let i = 1; i < s.length; i++) pts.push(center(s[i]));
    if (sim.prevTail) {
      const td = gridDelta(sim.prevTail, s[s.length - 1]);
      const ct = center(sim.prevTail);
      pts.push({ x: ct.x + td.x * cell * t, y: ct.y + td.y * cell * t });
    }
    pts[pts.length - 1].tip = true;
    return { pts, heads, facing: d };
  }

  // split a polyline at wrap jumps, extending the off-board side so the body
  // appears to flow through the edge; tips (head/tail ends) are never extended
  // past themselves, and a lone tip renders as a dot
  function splitWrapped(pts) {
    const segs = [];
    let cur = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], q = pts[i];
      if (Math.abs(q.x - p.x) > cell * 1.5 || Math.abs(q.y - p.y) > cell * 1.5) {
        const wx = Math.abs(q.x - p.x) > cell * 1.5 ? -Math.sign(q.x - p.x) : 0;
        const wy = Math.abs(q.y - p.y) > cell * 1.5 ? -Math.sign(q.y - p.y) : 0;
        if (!p.tip) cur.push({ x: p.x + wx * cell, y: p.y + wy * cell });
        segs.push(cur);
        cur = q.tip ? [q] : [{ x: q.x - wx * cell, y: q.y - wy * cell }, q];
      } else {
        cur.push(q);
      }
    }
    segs.push(cur);
    return segs;
  }

  // stroke a polyline as a smooth curve through midpoints (corners rounded)
  function strokeSmooth(p, width) {
    if (!p.length) return;
    ctx.lineWidth = width;
    if (p.length === 1) {
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.arc(p[0].x, p[0].y, width / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(p[0].x, p[0].y);
    for (let i = 1; i < p.length - 1; i++) {
      const mx = (p[i].x + p[i + 1].x) / 2, my = (p[i].y + p[i + 1].y) / 2;
      ctx.quadraticCurveTo(p[i].x, p[i].y, mx, my);
    }
    ctx.lineTo(p[p.length - 1].x, p[p.length - 1].y);
    ctx.stroke();
  }

  // the face, drawn into any context at any scale (board + wardrobe preview)
  function drawFace(g, hx, hy, fx, fy, s, dead, blink, style) {
    style = style || 'round';
    const px = -fy, py = fx;
    // blush cheeks, slightly behind the eyes
    if (!dead) {
      g.fillStyle = 'rgba(240,130,130,.30)';
      for (const side of [-1, 1]) {
        g.beginPath();
        g.arc(hx - fx * s * 0.06 + px * s * 0.27 * side, hy - fy * s * 0.06 + py * s * 0.27 * side, s * 0.075, 0, Math.PI * 2);
        g.fill();
      }
    }
    const eo = s * 0.165, ef = s * 0.10, er = s * 0.13;
    for (const side of [-1, 1]) {
      const ex = hx + fx * ef + px * eo * side;
      const ey = hy + fy * ef + py * eo * side;
      if (!dead && style === 'happy') {
        // always-closed upturned arcs: a snake having a lovely time
        g.strokeStyle = PAL.eyeP;
        g.lineWidth = Math.max(1.4, s * 0.045);
        g.lineCap = 'round';
        g.beginPath();
        g.arc(ex, ey + er * 0.35, er * 0.72, Math.PI * 1.12, Math.PI * 1.88);
        g.stroke();
        continue;
      }
      if (!dead && style === 'sleepy') {
        // heavy lids: only the lower half of each eye shows
        g.fillStyle = PAL.eyeW;
        g.beginPath();
        g.arc(ex, ey, er, 0, Math.PI);
        g.closePath();
        g.fill();
        if (!blink) {
          const pr = er * 0.42;
          g.fillStyle = PAL.eyeP;
          g.beginPath();
          g.arc(ex + fx * er * 0.25, ey + er * 0.32, pr, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = 'rgba(255,255,255,.9)';
          g.beginPath();
          g.arc(ex + fx * er * 0.25 - pr * 0.3, ey + er * 0.32 - pr * 0.3, pr * 0.3, 0, Math.PI * 2);
          g.fill();
        }
        g.strokeStyle = PAL.eyeP;
        g.lineWidth = Math.max(1.2, s * 0.035);
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(ex - er, ey);
        g.quadraticCurveTo(ex, ey + er * 0.12, ex + er, ey);
        g.stroke();
        continue;
      }
      g.fillStyle = PAL.eyeW;
      g.beginPath();
      g.arc(ex, ey, er, 0, Math.PI * 2);
      g.fill();
      if (dead) {
        g.strokeStyle = PAL.eyeP;
        g.lineWidth = Math.max(1.2, s * 0.035);
        const k = er * 0.5;
        g.beginPath();
        g.moveTo(ex - k, ey - k); g.lineTo(ex + k, ey + k);
        g.moveTo(ex + k, ey - k); g.lineTo(ex - k, ey + k);
        g.stroke();
      } else if (blink) {
        g.strokeStyle = PAL.eyeP;
        g.lineWidth = Math.max(1.2, s * 0.04);
        g.beginPath();
        g.moveTo(ex - er * 0.6, ey);
        g.lineTo(ex + er * 0.6, ey);
        g.stroke();
      } else {
        const pr = er * (style === 'sparkle' ? 0.62 : 0.55);
        const cx = ex + fx * er * 0.32, cy = ey + fy * er * 0.32;
        g.fillStyle = PAL.eyeP;
        g.beginPath();
        g.arc(cx, cy, pr, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = 'rgba(255,255,255,.9)';
        if (style === 'sparkle') {
          star4(g, cx - pr * 0.25, cy - pr * 0.25, pr * 0.55, pr * 0.2);
          g.fill();
          g.beginPath();
          g.arc(cx + pr * 0.4, cy + pr * 0.4, pr * 0.18, 0, Math.PI * 2);
          g.fill();
        } else {
          g.beginPath();
          g.arc(cx - pr * 0.35, cy - pr * 0.35, pr * 0.32, 0, Math.PI * 2);
          g.fill();
        }
      }
    }
  }

  function drawHat(g, kind, hx, hy, s) {
    const ctx = g;
    ctx.save();
    // seat the hat on the head — larger and lower, worn rather than floating
    ctx.translate(hx, hy);
    ctx.scale(1.3, 1.3);
    ctx.translate(-hx, -hy + s * 0.055);
    ctx.lineCap = 'round';
    if (kind === 'sprout') {
      ctx.strokeStyle = '#6da06b';
      ctx.lineWidth = Math.max(1.5, s * 0.05);
      ctx.beginPath();
      ctx.moveTo(hx, hy - s * 0.30);
      ctx.quadraticCurveTo(hx + s * 0.04, hy - s * 0.45, hx, hy - s * 0.55);
      ctx.stroke();
      ctx.fillStyle = '#88b884';
      ctx.beginPath(); ctx.ellipse(hx - s * 0.09, hy - s * 0.56, s * 0.10, s * 0.05, -0.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(hx + s * 0.09, hy - s * 0.60, s * 0.10, s * 0.05, 0.6, 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'crown') {
      ctx.fillStyle = '#e9c46a';
      ctx.beginPath();
      ctx.moveTo(hx - s * 0.22, hy - s * 0.38);
      ctx.lineTo(hx - s * 0.22, hy - s * 0.58);
      ctx.lineTo(hx - s * 0.11, hy - s * 0.46);
      ctx.lineTo(hx, hy - s * 0.62);
      ctx.lineTo(hx + s * 0.11, hy - s * 0.46);
      ctx.lineTo(hx + s * 0.22, hy - s * 0.58);
      ctx.lineTo(hx + s * 0.22, hy - s * 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e76f51';
      ctx.beginPath(); ctx.arc(hx, hy - s * 0.44, s * 0.035, 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'flower') {
      ctx.fillStyle = '#f7d4e0';
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(hx + Math.cos(a) * s * 0.10, hy - s * 0.50 + Math.sin(a) * s * 0.10, s * 0.075, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#f2b76d';
      ctx.beginPath(); ctx.arc(hx, hy - s * 0.50, s * 0.06, 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'chef') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(hx - s * 0.16, hy - s * 0.50, s * 0.32, s * 0.12);
      for (const ox of [-0.12, 0, 0.12]) {
        ctx.beginPath();
        ctx.arc(hx + ox * s, hy - s * 0.55, s * 0.11, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (kind === 'bow') {
      ctx.fillStyle = '#e8849d';
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(hx, hy - s * 0.46);
        ctx.lineTo(hx + side * s * 0.23, hy - s * 0.60);
        ctx.lineTo(hx + side * s * 0.23, hy - s * 0.33);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = '#d96a88';
      ctx.beginPath();
      ctx.arc(hx, hy - s * 0.46, s * 0.065, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'mushroom') {
      ctx.fillStyle = '#f3ead9';
      ctx.fillRect(hx - s * 0.07, hy - s * 0.44, s * 0.14, s * 0.10);
      ctx.fillStyle = '#d95d54';
      ctx.beginPath();
      ctx.arc(hx, hy - s * 0.44, s * 0.24, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fdf5ec';
      for (const [ox, oy] of [[-0.12, -0.52], [0.04, -0.62], [0.15, -0.50]]) {
        ctx.beginPath();
        ctx.arc(hx + ox * s, hy + oy * s, s * 0.04, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (kind === 'halo') {
      ctx.strokeStyle = '#e9c46a';
      ctx.lineWidth = Math.max(2, s * 0.06);
      ctx.beginPath();
      ctx.ellipse(hx, hy - s * 0.66, s * 0.20, s * 0.07, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (kind === 'sunhat') {
      // wide straw brim, soft dome, a ribbon for the garden
      ctx.fillStyle = '#e8c97a';
      ctx.beginPath();
      ctx.ellipse(hx, hy - s * 0.40, s * 0.34, s * 0.11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hx, hy - s * 0.42, s * 0.18, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#e8849d';
      ctx.lineWidth = Math.max(1.5, s * 0.05);
      ctx.beginPath();
      ctx.moveTo(hx - s * 0.17, hy - s * 0.45);
      ctx.quadraticCurveTo(hx, hy - s * 0.38, hx + s * 0.17, hy - s * 0.45);
      ctx.stroke();
    }
    ctx.restore();
  }

  // dense point samples along the midpoint-quadratic smooth curve of a segment
  function sampleSmooth(seg) {
    if (seg.length === 1) return [{ x: seg[0].x, y: seg[0].y }];
    const out = [{ x: seg[0].x, y: seg[0].y }];
    let cur = seg[0];
    for (let i = 1; i < seg.length - 1; i++) {
      const m = { x: (seg[i].x + seg[i + 1].x) / 2, y: (seg[i].y + seg[i + 1].y) / 2 };
      for (let s = 1; s <= 6; s++) {
        const t = s / 6;
        out.push({
          x: (1 - t) * (1 - t) * cur.x + 2 * (1 - t) * t * seg[i].x + t * t * m.x,
          y: (1 - t) * (1 - t) * cur.y + 2 * (1 - t) * t * seg[i].y + t * t * m.y,
        });
      }
      cur = m;
    }
    out.push({ x: seg[seg.length - 1].x, y: seg[seg.length - 1].y });
    return out;
  }

  // full-width polylines for the body plus circle stamps whose radius shrinks
  // continuously with distance from the tail tip — no per-tick width jumps
  function snakeGeometry(segs, W) {
    const taperLen = cell * 2.2;
    const maxR = W / 2, minR = W * 0.16;
    const sampled = segs.map(sampleSmooth);
    let carry = 0;
    for (let si = sampled.length - 1; si >= 0; si--) {
      const s = sampled[si];
      for (let i = s.length - 1; i >= 0; i--) {
        s[i].d = i === s.length - 1
          ? carry
          : s[i + 1].d + Math.hypot(s[i].x - s[i + 1].x, s[i].y - s[i + 1].y);
      }
      carry = s[0].d;   // the wrap gap adds no body length
    }
    const rad = d => minR + (maxR - minR) * Math.min(1, d / taperLen);
    const body = [], stamps = [];
    for (const s of sampled) {
      let line = [];
      for (let i = 0; i < s.length; i++) {
        const p = s[i];
        if (p.d >= taperLen) {
          line.push(p);
          continue;
        }
        if (i > 0 && s[i - 1].d >= taperLen) {
          const a = s[i - 1];
          const t = (a.d - taperLen) / (a.d - p.d);
          const cut = { x: a.x + (p.x - a.x) * t, y: a.y + (p.y - a.y) * t };
          line.push(cut);
          stamps.push({ x: cut.x, y: cut.y, r: maxR });
        }
        if (line.length) { body.push(line); line = []; }
        stamps.push({ x: p.x, y: p.y, r: rad(p.d) });
        if (i < s.length - 1 && s[i + 1].d < taperLen) {
          const q = s[i + 1];
          const steps = Math.floor(Math.hypot(q.x - p.x, q.y - p.y) / 3);
          for (let k = 1; k < steps; k++) {
            const t = k / steps;
            stamps.push({
              x: p.x + (q.x - p.x) * t,
              y: p.y + (q.y - p.y) * t,
              r: rad(p.d + (q.d - p.d) * t),
            });
          }
        }
      }
      if (line.length > 1) body.push(line);
    }
    return { body, stamps };
  }

  function renderRibbon(g, geom, W) {
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.lineWidth = W;
    for (const line of geom.body) {
      g.beginPath();
      g.moveTo(line[0].x, line[0].y);
      for (let i = 1; i < line.length; i++) g.lineTo(line[i].x, line[i].y);
      g.stroke();
    }
    for (const st of geom.stamps) {
      g.beginPath();
      g.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      g.fill();
    }
  }

  function drawSnakeBody(sim, t, now, isGhost) {
    const { pts, heads, facing } = snakePath(sim, t);
    const segs = splitWrapped(pts);
    const dead = endCause === 'death' &&
      (!sim.alive || ((state === 'dying' || state === 'gameover') && !isGhost));
    const W = cell * (isGhost ? 0.58 : 0.74);
    const skin = SKINS[prog.skin] || SKINS.drift;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isGhost) {
      ctx.strokeStyle = PAL.ghost;
      for (const seg of segs) strokeSmooth(seg, W);
    } else {
      const geom = snakeGeometry(segs, W);

      // soft shadow: opaque on the offscreen, composited once at low alpha so
      // overlapping stamps can't darken
      const dpr = window.devicePixelRatio || 1;
      occ.setTransform(dpr, 0, 0, dpr, 0, 0);
      occ.clearRect(0, 0, cols * cell, rows * cell);
      occ.strokeStyle = occ.fillStyle = '#000';
      renderRibbon(occ, geom, W);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 0.10;
      ctx.drawImage(oc, 0, cell * 0.10 * dpr);
      ctx.restore();

      let paint;
      if (dead) {
        paint = PAL.dead;
      } else if (skin.pattern === 'gingham') {
        paint = ginghamPaint(ctx, cell * 0.3);
      } else {
        const hp = pts[0], tp = pts[pts.length - 1];
        paint = ctx.createLinearGradient(hp.x, hp.y, tp.x, tp.y);
        paint.addColorStop(0, skin.a);
        paint.addColorStop(1, skin.b);
      }
      ctx.strokeStyle = ctx.fillStyle = paint;
      renderRibbon(ctx, geom, W);

      if (!dead) {
        ctx.strokeStyle = 'rgba(255,255,255,.20)';
        ctx.lineWidth = W * 0.28;
        for (const line of geom.body) {
          if (line.length < 2) continue;
          ctx.beginPath();
          ctx.moveTo(line[0].x, line[0].y);
          for (let i = 1; i < line.length; i++) ctx.lineTo(line[i].x, line[i].y);
          ctx.stroke();
        }
      }
    }

    // pick whichever head image is on the board for the face
    const onBoard = p => p.x >= -cell * 0.2 && p.x <= cols * cell + cell * 0.2 &&
                         p.y >= -cell * 0.2 && p.y <= rows * cell + cell * 0.2;
    const head = heads.find(onBoard) || heads[0];

    if (isGhost) {
      ctx.fillStyle = PAL.ghost;
      ctx.beginPath();
      ctx.arc(head.x, head.y, cell * 0.32, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.fillStyle = dead ? PAL.dead : skin.head;
    ctx.beginPath();
    ctx.arc(head.x, head.y, cell * 0.40, 0, Math.PI * 2);
    ctx.fill();

    const d = facing;
    const flen = Math.hypot(d.x, d.y) || 1;
    const fx = d.x / flen, fy = d.y / flen;
    const px = -fy, py = fx;

    const tongueT = (now / 2600) % 1;
    if (!dead && tongueT > 0.82) {
      const out = (tongueT - 0.82) / 0.18;
      const ext = Math.sin(out * Math.PI) * cell * 0.34;
      ctx.strokeStyle = PAL.tongue;
      ctx.lineWidth = Math.max(1.5, cell * 0.07);
      ctx.lineCap = 'round';
      const tx = head.x + fx * cell * 0.38, ty = head.y + fy * cell * 0.38;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + fx * ext + px * ext * 0.25, ty + fy * ext + py * ext * 0.25);
      ctx.moveTo(tx + fx * ext * 0.55, ty + fy * ext * 0.55);
      ctx.lineTo(tx + fx * ext - px * ext * 0.25, ty + fy * ext - py * ext * 0.25);
      ctx.stroke();
    }

    const blink = !dead && ((now + 1300) % 4100) < 120;
    drawFace(ctx, head.x, head.y, fx, fy, cell, dead, blink, prog.cos.eyes);
    if (!dead && prog.hat !== 'none') drawHat(ctx, prog.hat, head.x, head.y, cell);
  }

  // ---------- ambient particles ----------
  const AMB_RATE = { meadow: 1000, sakura: 650, classic: 1100, midnight: 1000, tide: 600, autumn: 850, mono: 550, storm: 110 };
  function spawnAmbient(now) {
    const W = cols * cell, H = rows * cell;
    const theme = settings.theme;
    if (theme === 'meadow') {
      if (!ambient.some(a => a.kind === 'bee') && Math.random() < 0.12) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        ambient.push({
          kind: 'bee', dir,
          x: dir > 0 ? -cell : W + cell,
          y: H * (0.15 + Math.random() * 0.6),
          phase: Math.random() * 6.28,
        });
        return;
      }
      const flies = ambient.filter(a => a.kind === 'butterfly').length;
      if (flies < 4 && Math.random() < 0.35) {
        ambient.push({
          kind: 'butterfly', x: Math.random() < 0.5 ? -cell * 0.4 : W + cell * 0.4,
          y: H * (0.15 + Math.random() * 0.7), phase: Math.random() * 6.28, born: now,
          color: ['#ffffff', '#ffd98e', '#d9c9ff', '#ffb3c0', '#bde3ff', '#ffa66b'][Math.floor(Math.random() * 6)],
        });
        return;
      }
      if (ambient.length >= 16) return;
      ambient.push({ kind: 'leaf', x: Math.random() * W, y: -cell * 0.4, phase: Math.random() * 6.28 });
    } else if (theme === 'sakura') {
      if (ambient.length >= 30) return;
      const flurry = Math.random() < 0.3 ? 6 + Math.floor(Math.random() * 4) : 2;
      for (let i = 0; i < flurry; i++) {
        ambient.push({
          kind: 'petal', x: Math.random() * W,
          y: -cell * (0.4 + Math.random() * 2.5), phase: Math.random() * 6.28,
        });
      }
    } else if (theme === 'classic') {
      // chunky pixel butterflies, like sprites that escaped an older game
      if (ambient.filter(a => a.kind === 'pixelfly').length >= 3) return;
      const dir = Math.random() < 0.5 ? 1 : -1;
      ambient.push({
        kind: 'pixelfly', dir,
        x: dir > 0 ? -cell : W + cell,
        y: H * (0.1 + Math.random() * 0.8),
        phase: Math.random() * 6.28, born: now,
        color: ['#4775ea', '#e7471d', '#ffd23f'][Math.floor(Math.random() * 3)],
      });
    } else if (theme === 'autumn') {
      if (ambient.length >= 16) return;
      const color = ['#d98a4a', '#c2632f', '#b8923f'][Math.floor(Math.random() * 3)];
      ambient.push({ kind: 'leaf', maple: true, color, x: Math.random() * W, y: -cell * 0.4, phase: Math.random() * 6.28 });
    } else if (theme === 'mono') {
      if (ambient.length >= 26) return;
      ambient.push({
        kind: 'snow', x: Math.random() * W, y: -cell * 0.3,
        phase: Math.random() * 6.28,
        r: cell * (0.035 + Math.random() * 0.05),
        sp: 0.55 + Math.random() * 0.7,
      });
    } else if (theme === 'midnight') {
      if (ambient.filter(a => a.kind === 'firefly').length >= 10) return;
      ambient.push({
        kind: 'firefly', x: Math.random() * W, y: Math.random() * H,
        phase: Math.random() * 6.28, born: now,
        size: 0.7 + Math.random() * 0.7, sp: 0.6 + Math.random() * 0.9,
      });
    } else if (theme === 'tide') {
      if (!ambient.some(a => a.kind === 'jelly') && Math.random() < 0.07) {
        ambient.push({
          kind: 'jelly', x: W * (0.1 + Math.random() * 0.8), y: H + cell * 0.6,
          phase: Math.random() * 6.28,
        });
        return;
      }
      if (!ambient.some(a => a.kind === 'crab') && Math.random() < 0.05) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        ambient.push({
          kind: 'crab', dir,
          x: dir > 0 ? -cell : W + cell,
          y: H - cell * 0.22, phase: Math.random() * 6.28,
        });
        return;
      }
      const fish = ambient.filter(a => a.kind === 'fish').length;
      if (fish < 7 && Math.random() < 0.4) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        ambient.push({
          kind: 'fish', dir,
          x: dir > 0 ? -cell : W + cell,
          y: H * (0.1 + Math.random() * 0.72),
          phase: Math.random() * 6.28,
          size: 0.6 + Math.random() * 0.6,
          sp: 0.25 + Math.random() * 0.3,
          shape: ['round', 'long', 'angel'][Math.floor(Math.random() * 3)],
        });
        return;
      }
      if (ambient.length >= 24) return;
      ambient.push({ kind: 'bubble', x: Math.random() * W, y: H + cell * 0.3, phase: Math.random() * 6.28, r: cell * (0.05 + Math.random() * 0.08) });
    } else if (theme === 'storm') {
      if (ambient.length >= 34) return;
      for (let i = 0; i < 2; i++) {
        ambient.push({
          kind: 'drop', x: Math.random() * (W + cell), y: -cell * (0.3 + Math.random() * 2),
          sp: 0.8 + Math.random() * 0.5, len: cell * (0.22 + Math.random() * 0.16),
        });
      }
    }
  }

  // a world switch starts its scene fresh and already alive
  function resetAmbient(now) {
    ambient = [];
    ambTimer = 0;
    const H = rows * cell, W = cols * cell;
    for (let i = 0; i < 10; i++) spawnAmbient(now || performance.now());
    for (const a of ambient) {
      if (a.kind === 'leaf' || a.kind === 'petal' || a.kind === 'snow' || a.kind === 'drop') a.y = Math.random() * H;
      if (a.kind === 'bubble') a.y = Math.random() * H;
      if (a.kind === 'fish') a.x = Math.random() * W;
    }
  }

  function drawMapleLeaf(g, s) {
    // the flag-style maple: top spike, trident sides, wide lateral points,
    // narrowing to a stem — fewer, cleaner points
    const P = [
      [0, -1], [0.10, -0.58], [0.45, -0.70], [0.30, -0.30], [0.92, -0.36],
      [0.48, -0.06], [0.70, 0.30], [0.18, 0.20], [0.06, 0.42],
      [-0.06, 0.42], [-0.18, 0.20], [-0.70, 0.30], [-0.48, -0.06],
      [-0.92, -0.36], [-0.30, -0.30], [-0.45, -0.70], [-0.10, -0.58],
    ];
    g.beginPath();
    g.moveTo(P[0][0] * s, P[0][1] * s);
    for (let i = 1; i < P.length; i++) g.lineTo(P[i][0] * s, P[i][1] * s);
    g.closePath();
    g.fill();
    g.lineWidth = Math.max(1, s * 0.12);
    g.strokeStyle = g.fillStyle;
    g.beginPath();
    g.moveTo(0, s * 0.42);
    g.lineTo(0, s * 0.85);
    g.stroke();
  }

  function drawAmbient(now, dt) {
    if (settings.ambience !== 'on') { ambient = []; return; }
    const rate = AMB_RATE[settings.theme];
    if (rate) {
      ambTimer += dt;
      if (ambTimer > rate) { ambTimer = 0; spawnAmbient(now); }
    }
    const W = cols * cell, H = rows * cell;
    for (let i = ambient.length - 1; i >= 0; i--) {
      const a = ambient[i];
      if (a.kind === 'leaf') {
        a.y += dt * cell * (a.maple ? 0.00045 : 0.0009);
        const x = a.x + Math.sin(now / 1100 + a.phase) * cell * 0.5;
        if (a.y > H + cell * 0.5) { ambient.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(x, a.y);
        ctx.rotate(Math.sin(now / (a.maple ? 1700 : 800) + a.phase) * 0.8 + (a.maple ? a.phase : 0));
        ctx.globalAlpha = 0.78;
        ctx.fillStyle = a.color || '#9cbf8e';
        if (a.maple) {
          drawMapleLeaf(ctx, cell * 0.18);
        } else {
          ctx.beginPath();
          ctx.ellipse(0, 0, cell * 0.14, cell * 0.07, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      } else if (a.kind === 'petal') {
        a.y += dt * cell * 0.0008;
        const x = a.x + Math.sin(now / 1000 + a.phase) * cell * 0.55;
        if (a.y > H + cell * 0.5) { ambient.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(x, a.y);
        ctx.rotate(Math.sin(now / 700 + a.phase) * 1.1 + a.phase);
        ctx.globalAlpha = 0.95;
        const s = cell * 0.15;
        ctx.fillStyle = '#f293b9';
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.35);
        ctx.quadraticCurveTo(s * 1.05, -s * 0.35, 0, s);
        ctx.quadraticCurveTo(-s * 1.05, -s * 0.35, 0, -s * 1.35);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.15, s * 0.30, s * 0.48, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (a.kind === 'snow') {
        a.y += dt * cell * 0.00055 * a.sp;
        const x = a.x + Math.sin(now / 1400 + a.phase) * cell * 0.35;
        if (a.y > H + cell * 0.3) { ambient.splice(i, 1); continue; }
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (a.kind === 'pixelfly') {
        a.x += a.dir * dt * cell * 0.0006;
        const y = a.y + Math.sin(now / 500 + a.phase) * cell * 0.35;
        if ((a.dir > 0 && a.x > W + cell) || (a.dir < 0 && a.x < -cell)) { ambient.splice(i, 1); continue; }
        // quantized to a chunky pixel grid, wings flap by frame
        const px = Math.round(a.x / 3) * 3, py = Math.round(y / 3) * 3;
        const u = Math.max(2, Math.round(cell * 0.075));
        const open = Math.floor(now / 160 + a.phase) % 2 === 0;
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = a.color;
        if (open) {
          ctx.fillRect(px - u * 2, py - u, u, u * 2);
          ctx.fillRect(px + u, py - u, u, u * 2);
        } else {
          ctx.fillRect(px - u * 1.4, py - u * 1.6, u, u * 1.4);
          ctx.fillRect(px + u * 0.4, py - u * 1.6, u, u * 1.4);
        }
        ctx.fillStyle = '#3c4043';
        ctx.fillRect(px - u / 2, py - u * 1.2, u, u * 2.4);
      } else if (a.kind === 'bee') {
        a.x += a.dir * dt * cell * 0.0013;
        const y = a.y + Math.sin(now / 280 + a.phase) * cell * 0.22 + Math.sin(now / 900 + a.phase) * cell * 0.4;
        if ((a.dir > 0 && a.x > W + cell) || (a.dir < 0 && a.x < -cell)) { ambient.splice(i, 1); continue; }
        ctx.globalAlpha = 0.95;
        const s = cell * 0.09;
        const flap = Math.abs(Math.sin(now / 60 + a.phase));
        ctx.fillStyle = 'rgba(255,255,255,.75)';
        ctx.beginPath();
        ctx.ellipse(a.x - a.dir * s * 0.2, y - s * (0.9 + flap * 0.5), s * 0.7, s * 0.45, -0.5 * a.dir, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f2c84b';
        ctx.beginPath();
        ctx.ellipse(a.x, y, s * 1.15, s * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#6b4f2e';
        ctx.lineWidth = Math.max(1.2, s * 0.32);
        for (const ox of [-0.35, 0.25]) {
          ctx.beginPath();
          ctx.moveTo(a.x + ox * s, y - s * 0.7);
          ctx.lineTo(a.x + ox * s, y + s * 0.7);
          ctx.stroke();
        }
      } else if (a.kind === 'firefly') {
        if (now - a.born > 30000) { ambient.splice(i, 1); continue; }
        const sz = a.size || 1, sp = a.sp || 1;
        // two slow drift frequencies layered for an organic, unhurried wander
        a.x += (Math.cos(now / 1500 * sp + a.phase) * 0.16 + Math.cos(now / 480 + a.phase * 3) * 0.06) * sp;
        a.y += (Math.sin(now / 1250 * sp + a.phase * 1.7) * 0.16 + Math.sin(now / 410 + a.phase * 2.2) * 0.05) * sp;
        // glow dims but never fully vanishes, on a slow breath-like cycle
        const glow = 0.42 + 0.28 * Math.sin(now / (700 + sz * 250) + a.phase);
        const fade = Math.min(1, (now - a.born) / 3600, (30000 - (now - a.born)) / 3600);
        ctx.globalAlpha = Math.max(0, glow * fade);
        ctx.fillStyle = '#f4d35e';
        ctx.beginPath(); ctx.arc(a.x, a.y, cell * 0.11 * sz, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = Math.min(1, Math.max(0, glow * fade * 2.2));
        ctx.fillStyle = '#fdf3c0';
        ctx.beginPath(); ctx.arc(a.x, a.y, cell * 0.05 * sz, 0, Math.PI * 2); ctx.fill();
      } else if (a.kind === 'butterfly') {
        if (now - a.born > 18000) { ambient.splice(i, 1); continue; }
        a.x += Math.cos(now / 1500 + a.phase) * 0.32 + (a.phase % 2 < 1 ? 0.15 : -0.15);
        a.y += Math.sin(now / 700 + a.phase * 2) * 0.3;
        const fade = Math.min(1, (now - a.born) / 800, (18000 - (now - a.born)) / 800);
        const flap = Math.abs(Math.sin(now / 130 + a.phase));
        ctx.globalAlpha = 0.95 * fade;
        ctx.fillStyle = a.color;
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(a.x + s * cell * 0.10 * (0.3 + flap * 0.7), a.y,
            cell * 0.12 * (0.3 + flap * 0.7), cell * 0.15, s * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(90,80,70,.8)';
        ctx.beginPath();
        ctx.ellipse(a.x, a.y, cell * 0.024, cell * 0.095, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (a.kind === 'fish') {
        const sz = a.size;
        a.x += a.dir * a.sp * dt * cell * 0.0011;
        const y = a.y + Math.sin(now / 900 + a.phase) * cell * 0.3;
        if ((a.dir > 0 && a.x > W + cell) || (a.dir < 0 && a.x < -cell)) { ambient.splice(i, 1); continue; }
        ctx.globalAlpha = 0.30;
        ctx.fillStyle = '#3a6470';
        if (a.shape === 'round') {
          ctx.beginPath();
          ctx.arc(a.x, y, cell * 0.16 * sz, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(a.x - a.dir * cell * 0.13 * sz, y);
          ctx.lineTo(a.x - a.dir * cell * 0.30 * sz, y - cell * 0.11 * sz);
          ctx.lineTo(a.x - a.dir * cell * 0.30 * sz, y + cell * 0.11 * sz);
          ctx.closePath();
          ctx.fill();
        } else if (a.shape === 'angel') {
          ctx.beginPath();
          ctx.ellipse(a.x, y, cell * 0.16 * sz, cell * 0.22 * sz, 0, 0, Math.PI * 2);
          ctx.fill();
          for (const fs of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(a.x, y + fs * cell * 0.16 * sz);
            ctx.lineTo(a.x - a.dir * cell * 0.14 * sz, y + fs * cell * 0.34 * sz);
            ctx.lineTo(a.x + a.dir * cell * 0.06 * sz, y + fs * cell * 0.2 * sz);
            ctx.closePath();
            ctx.fill();
          }
          ctx.beginPath();
          ctx.moveTo(a.x - a.dir * cell * 0.14 * sz, y);
          ctx.lineTo(a.x - a.dir * cell * 0.3 * sz, y - cell * 0.1 * sz);
          ctx.lineTo(a.x - a.dir * cell * 0.3 * sz, y + cell * 0.1 * sz);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.ellipse(a.x, y, cell * 0.30 * sz, cell * 0.10 * sz, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(a.x - a.dir * cell * 0.26 * sz, y);
          ctx.lineTo(a.x - a.dir * cell * 0.44 * sz, y - cell * 0.11 * sz);
          ctx.lineTo(a.x - a.dir * cell * 0.44 * sz, y + cell * 0.11 * sz);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(20,40,46,.6)';
        ctx.beginPath();
        ctx.arc(a.x + a.dir * cell * 0.10 * sz, y - cell * 0.03 * sz, cell * 0.025 * sz, 0, Math.PI * 2);
        ctx.fill();
      } else if (a.kind === 'jelly') {
        a.y -= dt * cell * 0.00028;
        const x = a.x + Math.sin(now / 1300 + a.phase) * cell * 0.4;
        if (a.y < -cell) { ambient.splice(i, 1); continue; }
        const pulse = 1 + Math.sin(now / 650 + a.phase) * 0.1;
        const r = cell * 0.22 * pulse;
        ctx.globalAlpha = 0.30;
        ctx.fillStyle = '#e8a8c0';
        ctx.beginPath();
        ctx.arc(x, a.y, r, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#e8a8c0';
        ctx.lineWidth = Math.max(1, cell * 0.03);
        for (let tn = -1; tn <= 1; tn++) {
          ctx.beginPath();
          ctx.moveTo(x + tn * r * 0.5, a.y);
          ctx.quadraticCurveTo(
            x + tn * r * 0.5 + Math.sin(now / 400 + a.phase + tn) * cell * 0.08,
            a.y + cell * 0.2,
            x + tn * r * 0.5 + Math.sin(now / 500 + a.phase + tn * 2) * cell * 0.12,
            a.y + cell * 0.38);
          ctx.stroke();
        }
      } else if (a.kind === 'crab') {
        a.x += a.dir * dt * cell * 0.00045;
        if ((a.dir > 0 && a.x > W + cell) || (a.dir < 0 && a.x < -cell)) { ambient.splice(i, 1); continue; }
        const y = a.y + Math.sin(now / 140 + a.phase) * 1.2;
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = '#b85c50';
        ctx.lineWidth = Math.max(1, cell * 0.035);
        for (const s of [-1, 1]) {
          for (let leg = 0; leg < 3; leg++) {
            const lx = a.x + s * cell * (0.10 + leg * 0.06);
            const lift = Math.sin(now / 140 + a.phase + leg * 2 + (s > 0 ? 0 : 3)) * cell * 0.04;
            ctx.beginPath();
            ctx.moveTo(a.x + s * cell * 0.08, y);
            ctx.lineTo(lx + s * cell * 0.06, y + cell * 0.12 - lift);
            ctx.stroke();
          }
        }
        ctx.fillStyle = '#c4655a';
        ctx.beginPath();
        ctx.ellipse(a.x, y, cell * 0.16, cell * 0.11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(a.x + a.dir * cell * 0.19, y - cell * 0.04, cell * 0.055, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2e2420';
        ctx.beginPath();
        ctx.arc(a.x - cell * 0.05, y - cell * 0.10, cell * 0.022, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(a.x + cell * 0.05, y - cell * 0.10, cell * 0.022, 0, Math.PI * 2);
        ctx.fill();
      } else if (a.kind === 'bubble') {
        a.y -= dt * cell * 0.0007;
        const x = a.x + Math.sin(now / 600 + a.phase) * cell * 0.15;
        if (a.y < -cell * 0.3) { ambient.splice(i, 1); continue; }
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, a.y, a.r, 0, Math.PI * 2); ctx.stroke();
      } else if (a.kind === 'drop') {
        a.y += dt * cell * 0.012 * a.sp;
        a.x -= dt * cell * 0.0019 * a.sp;   // a touch of wind
        if (a.y > H - cell * 0.1) {
          // some drops land with a tiny ring where they fell
          if (Math.random() < 0.45) ambient.push({ kind: 'plink', x: a.x, y: H - cell * 0.06, born: now });
          ambient.splice(i, 1); continue;
        }
        ctx.globalAlpha = 0.38;
        ctx.strokeStyle = '#c9d4e6';
        ctx.lineCap = 'round';
        ctx.lineWidth = Math.max(1, cell * 0.035);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x - a.len * 0.16, a.y + a.len);
        ctx.stroke();
      } else if (a.kind === 'plink') {
        const t = (now - a.born) / 380;
        if (t >= 1) { ambient.splice(i, 1); continue; }
        ctx.globalAlpha = 0.30 * (1 - t);
        ctx.strokeStyle = '#c9d4e6';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(a.x, a.y, cell * 0.16 * t + 1, cell * 0.05 * t + 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  // ---------- 100-point cameos ----------
  // every world keeps one quiet secret: reach 100 points in a single run and
  // something wanders through. Once per run, purely visual.
  const CAMEO_MS = 12000;
  const CAMEO_SCORE = 100;
  const easeOut = k => 1 - (1 - k) * (1 - k);
  function maybeCameo(now) {
    if (cameoSeen || !player || player.score < CAMEO_SCORE) return;
    cameoSeen = true;
    cameo = { kind: settings.theme, t0: now };
    Sound.cameo();
  }
  function drawCameo(now) {
    if (!cameo) return;
    const t = (now - cameo.t0) / CAMEO_MS;
    if (t >= 1) { cameo = null; return; }
    const fade = Math.min(1, t * 8, (1 - t) * 8);
    const fn = CAMEOS[cameo.kind];
    if (fn) fn(now, t, cols * cell, rows * cell, fade);
  }
  const CAMEOS = {
    // a hot-air balloon drifts over the meadow
    meadow(now, t, W, H, fade) {
      const x = -cell * 1.5 + t * (W + cell * 3);
      const y = H * 0.20 + Math.sin(now / 1400) * cell * 0.18;
      const r = cell * 0.5;
      ctx.globalAlpha = 0.92 * fade;
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 1.12, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#f7e8d8';
      ctx.fillRect(x - r, y - r * 1.2, r * 2, r * 2.4);
      ctx.fillStyle = '#ef9486';
      for (let i = -1; i <= 1; i++) {
        ctx.fillRect(x + i * r * 0.66 - r * 0.165, y - r * 1.2, r * 0.33, r * 2.4);
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(120,100,70,.8)';
      ctx.lineWidth = Math.max(1, cell * 0.03);
      for (const sd of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(x + sd * r * 0.5, y + r * 0.9);
        ctx.lineTo(x + sd * r * 0.2, y + r * 1.55);
        ctx.stroke();
      }
      ctx.fillStyle = '#9a7350';
      ctx.fillRect(x - r * 0.24, y + r * 1.5, r * 0.48, r * 0.36);
      ctx.globalAlpha = 1;
    },
    // a fox trots through, pausing to watch the petals
    sakura(now, t, W, H, fade) {
      const p = t < 0.38 ? (t / 0.38) * 0.46 : t < 0.62 ? 0.46 : 0.46 + ((t - 0.62) / 0.38) * 0.54;
      const moving = t < 0.38 || t > 0.62;
      const x = -cell + p * (W + cell * 2);
      const y = H - cell * 0.42 - (moving ? Math.abs(Math.sin(now / 140)) * cell * 0.04 : 0);
      const s = cell * 0.5;
      ctx.globalAlpha = 0.95 * fade;
      ctx.save();
      ctx.translate(x - s * 0.95, y - s * 0.25);
      ctx.rotate(-0.45 + Math.sin(now / 400) * 0.1);
      ctx.fillStyle = '#e08a52';
      ctx.beginPath(); ctx.ellipse(0, 0, s * 0.55, s * 0.2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fdf5ec';
      ctx.beginPath(); ctx.ellipse(-s * 0.4, 0, s * 0.18, s * 0.14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#e08a52';
      ctx.beginPath(); ctx.ellipse(x, y, s * 0.62, s * 0.34, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#c97540';
      ctx.lineWidth = Math.max(1.5, s * 0.1);
      ctx.lineCap = 'round';
      for (const lx of [-0.35, -0.15, 0.2, 0.4]) {
        const lift = moving ? Math.max(0, Math.sin(now / 110 + lx * 9)) * s * 0.1 : 0;
        ctx.beginPath();
        ctx.moveTo(x + lx * s, y + s * 0.2);
        ctx.lineTo(x + lx * s, y + s * 0.52 - lift);
        ctx.stroke();
      }
      const tilt = moving ? 0 : s * 0.12;
      const hx = x + s * 0.62, hy = y - s * 0.38 - tilt;
      ctx.fillStyle = '#e08a52';
      ctx.beginPath(); ctx.arc(hx, hy, s * 0.30, 0, Math.PI * 2); ctx.fill();
      for (const sd of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(hx + sd * s * 0.08, hy - s * 0.2);
        ctx.lineTo(hx + sd * s * 0.26, hy - s * 0.52);
        ctx.lineTo(hx + sd * s * 0.3, hy - s * 0.14);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = '#fdf5ec';
      ctx.beginPath();
      ctx.ellipse(hx + s * 0.18, hy + s * 0.08 - tilt * 0.5, s * 0.16, s * 0.11, moving ? 0.15 : -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a2d1d';
      ctx.beginPath(); ctx.arc(hx + s * 0.3, hy + s * 0.04 - tilt, s * 0.045, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(hx + s * 0.05, hy - s * 0.04, s * 0.05, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    },
    // a chunky pixel ufo putters across, lights blinking
    classic(now, t, W, H, fade) {
      const x = Math.round((-cell + t * (W + cell * 2)) / 3) * 3;
      const y = Math.round((H * 0.22 + Math.sin(now / 420) * cell * 0.3) / 3) * 3;
      const u = Math.max(2, Math.round(cell * 0.09));
      ctx.globalAlpha = 0.95 * fade;
      ctx.fillStyle = '#9be8ff';
      ctx.fillRect(x - u * 1.5, y - u * 2.4, u * 3, u * 1.4);
      ctx.fillStyle = '#3c4043';
      ctx.fillRect(x - u * 3.5, y - u, u * 7, u);
      ctx.fillRect(x - u * 2.5, y, u * 5, u);
      const on = Math.floor(now / 180) % 3;
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i === on ? '#ffd23f' : '#e7471d';
        ctx.fillRect(x - u * 2 + i * u * 2 - u / 2, y - u, u, u);
      }
      ctx.globalAlpha = 1;
    },
    // a full moon swells out of the dark, and a kid on a bicycle crosses it
    midnight(now, t, W, H, fade) {
      const mx = W * 0.5, my = H * 0.30, mr = cell * 1.7;
      ctx.globalAlpha = 0.9 * fade;
      ctx.fillStyle = '#f1ecd7';
      ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(214,206,178,.5)';
      for (const [ox, oy, cr] of [[-0.35, -0.2, 0.16], [0.25, 0.1, 0.11], [-0.05, 0.38, 0.09]]) {
        ctx.beginPath(); ctx.arc(mx + ox * mr, my + oy * mr, cr * mr, 0, Math.PI * 2); ctx.fill();
      }
      const bx = W + cell - t * (W + cell * 2);
      const by = my + mr * 0.15 - Math.sin(t * Math.PI) * cell * 0.5;
      const s = cell * 0.42;
      ctx.strokeStyle = ctx.fillStyle = '#0e0c16';
      ctx.lineWidth = Math.max(1.5, s * 0.1);
      ctx.lineCap = 'round';
      for (const wx of [-0.55, 0.55]) {
        ctx.beginPath(); ctx.arc(bx + wx * s, by, s * 0.34, 0, Math.PI * 2); ctx.stroke();
        for (let k = 0; k < 3; k++) {
          const a = now / 150 + k * Math.PI / 1.5;
          ctx.beginPath();
          ctx.moveTo(bx + wx * s - Math.cos(a) * s * 0.3, by - Math.sin(a) * s * 0.3);
          ctx.lineTo(bx + wx * s + Math.cos(a) * s * 0.3, by + Math.sin(a) * s * 0.3);
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.moveTo(bx - s * 0.55, by);
      ctx.lineTo(bx - s * 0.1, by - s * 0.5);
      ctx.lineTo(bx + s * 0.42, by - s * 0.45);
      ctx.lineTo(bx + s * 0.55, by);
      ctx.moveTo(bx - s * 0.1, by - s * 0.5);
      ctx.lineTo(bx + s * 0.1, by);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx - s * 0.12, by - s * 0.5);
      ctx.quadraticCurveTo(bx - s * 0.5, by - s * 1.0, bx - s * 0.32, by - s * 1.15);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(bx - s * 0.34, by - s * 1.32, s * 0.16, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    },
    // a whale glides past, far behind everything
    tide(now, t, W, H, fade) {
      const x = W + cell * 2 - t * (W + cell * 5);
      const y = H * 0.42 + Math.sin(now / 2100) * cell * 0.22;
      const s = cell * 1.05;
      ctx.globalAlpha = 0.20 * fade;
      ctx.fillStyle = '#28505c';
      ctx.beginPath();
      ctx.ellipse(x, y, s * 1.5, s * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
      const wag = Math.sin(now / 650) * s * 0.18;
      ctx.beginPath();
      ctx.moveTo(x + s * 1.35, y);
      ctx.quadraticCurveTo(x + s * 1.9, y + wag * 0.3, x + s * 2.1, y + wag - s * 0.35);
      ctx.lineTo(x + s * 1.95, y + wag);
      ctx.lineTo(x + s * 2.1, y + wag + s * 0.35);
      ctx.quadraticCurveTo(x + s * 1.9, y + wag * 0.3, x + s * 1.35, y);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + s * 0.1, y + s * 0.45, s * 0.35, s * 0.16, 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1c3a44';
      ctx.beginPath(); ctx.arc(x - s * 1.05, y - s * 0.1, s * 0.06, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#bfe0ec';
      ctx.lineWidth = 1.5;
      for (let k = 0; k < 3; k++) {
        const ph = ((now / 1600) + k * 0.33) % 1;
        ctx.globalAlpha = 0.25 * fade * (1 - ph);
        ctx.beginPath();
        ctx.arc(x - s * 0.9 + Math.sin(ph * 6 + k) * s * 0.08, y - s * 0.7 - ph * s, s * (0.05 + k * 0.02), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
    // a hedgehog shuffles through the fallen leaves
    autumn(now, t, W, H, fade) {
      const x = -cell + t * (W + cell * 2);
      const y = H - cell * 0.35 - Math.abs(Math.sin(now / 170)) * cell * 0.025;
      const s = cell * 0.42;
      ctx.globalAlpha = 0.95 * fade;
      ctx.fillStyle = '#7a5230';
      for (let k = 0; k < 7; k++) {
        const a = Math.PI * (0.15 + 0.7 * (k / 6));
        const bx = x - Math.cos(a) * s * 0.3, by = y - Math.sin(a) * s * 0.25;
        ctx.beginPath();
        ctx.moveTo(bx + Math.sin(a) * s * 0.18, by + Math.cos(a) * s * 0.18);
        ctx.lineTo(bx - Math.cos(a) * s * 0.62, by - Math.sin(a) * s * 0.62);
        ctx.lineTo(bx - Math.sin(a) * s * 0.18, by - Math.cos(a) * s * 0.18);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = '#9a7350';
      ctx.beginPath();
      ctx.ellipse(x, y, s * 0.72, s * 0.46, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c9a37a';
      ctx.beginPath();
      ctx.moveTo(x + s * 0.45, y - s * 0.34);
      ctx.quadraticCurveTo(x + s * 1.1, y + s * 0.1, x + s * 0.45, y + s * 0.42);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3a2d1d';
      ctx.beginPath(); ctx.arc(x + s * 0.98, y + s * 0.06, s * 0.06, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + s * 0.52, y - s * 0.1, s * 0.05, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#6b4a32';
      ctx.lineWidth = Math.max(1.2, s * 0.08);
      ctx.lineCap = 'round';
      for (const lx of [-0.3, 0, 0.3]) {
        const lift = Math.max(0, Math.sin(now / 130 + lx * 8)) * s * 0.06;
        ctx.beginPath();
        ctx.moveTo(x + lx * s, y + s * 0.36);
        ctx.lineTo(x + lx * s, y + s * 0.5 - lift);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
    // a cardinal lands in the snow — the only color this world will ever show
    mono(now, t, W, H, fade) {
      const px = W * 0.72, py = H - cell * 0.55;
      let x, y, flap = false;
      if (t < 0.22) {
        const k = easeOut(t / 0.22);
        x = -cell + (px + cell) * k;
        y = H * 0.25 + (py - H * 0.25) * k;
        flap = true;
      } else if (t < 0.78) {
        x = px; y = py;
      } else {
        const k = (t - 0.78) / 0.22;
        x = px + (W * 0.4 + cell) * k * k;
        y = py - (py - H * 0.15) * k;
        flap = true;
      }
      const s = cell * 0.34;
      ctx.globalAlpha = 0.95 * fade;
      ctx.fillStyle = '#c43d3d';
      const tilt = flap ? 0.35 : (Math.sin(now / 1100) > 0.93 ? 0.5 : 0.15);
      ctx.save();
      ctx.translate(x - s * 0.55, y + s * 0.1);
      ctx.rotate(tilt);
      ctx.fillRect(-s * 0.7, -s * 0.12, s * 0.7, s * 0.24);
      ctx.restore();
      ctx.beginPath();
      ctx.ellipse(x, y, s * 0.62, s * 0.45, -0.15, 0, Math.PI * 2);
      ctx.fill();
      if (flap) {
        const w = Math.abs(Math.sin(now / 90));
        ctx.beginPath();
        ctx.ellipse(x - s * 0.05, y - s * 0.25, s * 0.4, s * (0.1 + w * 0.35), -0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      const hx = x + s * 0.45, hy = y - s * 0.42;
      ctx.beginPath(); ctx.arc(hx, hy, s * 0.30, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(hx - s * 0.1, hy - s * 0.22);
      ctx.lineTo(hx + s * 0.05, hy - s * 0.55);
      ctx.lineTo(hx + s * 0.2, hy - s * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#42302c';
      ctx.beginPath(); ctx.ellipse(hx + s * 0.16, hy + s * 0.05, s * 0.16, s * 0.1, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e8a23c';
      ctx.beginPath();
      ctx.moveTo(hx + s * 0.26, hy - s * 0.02);
      ctx.lineTo(hx + s * 0.46, hy + s * 0.04);
      ctx.lineTo(hx + s * 0.26, hy + s * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(hx + s * 0.08, hy - s * 0.05, s * 0.05, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    },
    // a little paper boat out in the rain, riding the same wind
    storm(now, t, W, H, fade) {
      const x = W + cell - t * (W + cell * 3);
      const y = H - cell * 0.30 + Math.sin(now / 750) * cell * 0.06;
      const s = cell * 0.5;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(now / 950) * 0.09);
      ctx.globalAlpha = 0.95 * fade;
      ctx.fillStyle = '#eef2f8';
      ctx.beginPath();
      ctx.moveTo(-s * 0.85, -s * 0.1);
      ctx.lineTo(s * 0.85, -s * 0.1);
      ctx.lineTo(s * 0.45, s * 0.32);
      ctx.lineTo(-s * 0.45, s * 0.32);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.95);
      ctx.lineTo(s * 0.42, -s * 0.12);
      ctx.lineTo(-s * 0.42, -s * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(150,165,190,.5)';
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.95);
      ctx.lineTo(s * 0.42, -s * 0.12);
      ctx.lineTo(0, -s * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 0.3 * fade;
      ctx.strokeStyle = '#c9d4e6';
      ctx.lineWidth = 1;
      for (let k = 0; k < 2; k++) {
        const ph = ((now / 800) + k * 0.5) % 1;
        ctx.beginPath();
        ctx.ellipse(x + s * (0.6 + ph * 0.8), y + s * 0.35, s * 0.3 * ph + 1, s * 0.08 * ph + 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  };

  // ---------- effects ----------
  function drawEffects(now, dt) {
    if (eatRipple) {
      const t = (now - eatRipple.t0) / 380;
      if (t >= 1) eatRipple = null;
      else {
        const rc = center(eatRipple);
        ctx.strokeStyle = PAL.fruit;
        ctx.globalAlpha = 0.5 * (1 - t);
        ctx.lineWidth = cell * 0.06 * (1 - t) + 1;
        ctx.beginPath();
        ctx.arc(rc.x, rc.y, cell * (0.3 + t * 0.6), 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt / 600;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      p.x += p.vx; p.y += p.vy;
      // hearts drift upward and hang; everything else falls
      p.vy += p.shape === 'hearts' ? -cell * 0.0006 : cell * 0.004;
      if (p.spin != null) p.spin += p.vspin;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      const r = p.r * p.life;
      if (!p.shape || p.shape === 'pop') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'confetti') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        ctx.fillRect(-r * 0.9, -r * 0.5, r * 1.8, r);
        ctx.restore();
      } else if (p.shape === 'blossom') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.spin);
        petalPath(ctx, r * 1.2);
        ctx.fill();
        ctx.restore();
      } else if (p.shape === 'stardust') {
        star4(ctx, p.x, p.y, r * 1.5, r * 0.55);
        ctx.fill();
      } else if (p.shape === 'hearts') {
        heartPath(ctx, p.x, p.y, r * 1.1);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    for (let i = popups.length - 1; i >= 0; i--) {
      const p = popups[i];
      const t = (now - p.t0) / 800;
      if (t >= 1) { popups.splice(i, 1); continue; }
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = PAL.ink;
      ctx.font = `700 ${Math.round(cell * 0.5)}px Quicksand, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(p.text, p.x, p.y - t * cell * 0.9);
    }
    ctx.globalAlpha = 1;
  }

  // ---------- garden ----------
  const FLOWER_COLORS = ['#ef9486', '#e8aec4', '#f2b76d', '#b3a7e6', '#8fa3e0', '#f3b8cb'];
  // each world grows its own flowers
  const WORLD_FLOWERS = {
    m: ['#ef9486', '#f2b76d', '#b3a7e6', '#8fa3e0'],
    s: ['#f3b8cb', '#e8aec4', '#f7d4e0'],
    c: ['#e7471d', '#ffd23f', '#3faa49'],
    n: ['#9fa8da', '#cdd3ec', '#b39ddb'],
    t: ['#5fa8a0', '#8ec3b0', '#7986cb'],
    a: ['#d98a4a', '#c2632f', '#e9c46a'],
    o: ['#cfccc6', '#9a978f', '#f4f2ed'],
    r: ['#7e9bd8', '#9fb0c8', '#f4d35e'],
  };
  let lastGarden = '';
  function drawGarden() {
    const wrap = $('gardenWrap');
    if (!wrap) return;
    const blooms = Math.floor(prog.fruitTotal / 10);
    const w = cols * cell, h = 40;
    // redraw only when a bloom is added or the board resizes — a full canvas
    // redraw on every fruit caused frame spikes mid-run
    const sig = blooms + ':' + w;
    if (sig === lastGarden) return;
    lastGarden = sig;
    // the strip is always there, even before the first flower, so the page
    // never reflows mid-run when a bloom arrives
    const g = $('garden');
    const gx = g.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    g.style.width = w + 'px';
    g.style.height = h + 'px';
    g.width = Math.round(w * dpr);
    g.height = Math.round(h * dpr);
    gx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const rng = mulberry32(424242);
    gx.strokeStyle = 'rgba(140,170,130,.5)';
    gx.lineWidth = 1.4;
    gx.lineCap = 'round';
    for (let i = 0; i < w / 9; i++) {
      const x = rng() * w, bh = 4 + rng() * 7;
      gx.beginPath();
      gx.moveTo(x, h);
      gx.quadraticCurveTo(x + (rng() - 0.5) * 4, h - bh / 2, x + (rng() - 0.5) * 6, h - bh);
      gx.stroke();
    }
    const fw = 24;
    const n = Math.min(blooms, Math.floor((w - 16) / fw));
    const log = prog.bloomLog || '';
    const legacy = blooms - log.length;   // blooms earned before worlds were recorded
    for (let i = 0; i < n; i++) {
      const r = mulberry32(1000 + i * 7919);
      const x = 12 + i * fw + r() * 8;
      const stemH = 13 + r() * 12;
      const set = i >= legacy ? (WORLD_FLOWERS[log[i - legacy]] || FLOWER_COLORS) : FLOWER_COLORS;
      const color = set[Math.floor(r() * set.length)];
      gx.strokeStyle = '#7da379';
      gx.lineWidth = 1.6;
      gx.beginPath();
      gx.moveTo(x, h);
      gx.quadraticCurveTo(x + (r() - 0.5) * 5, h - stemH * 0.6, x, h - stemH);
      gx.stroke();
      gx.fillStyle = color;
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2 + r();
        gx.beginPath();
        gx.arc(x + Math.cos(a) * 3.4, h - stemH + Math.sin(a) * 3.4, 2.6, 0, Math.PI * 2);
        gx.fill();
      }
      gx.fillStyle = '#f8e9a1';
      gx.beginPath();
      gx.arc(x, h - stemH, 2, 0, Math.PI * 2);
      gx.fill();
    }
    $('gardenLabel').textContent = blooms
      ? `garden · ${blooms} bloom${blooms === 1 ? '' : 's'}`
      : 'garden · your first flower grows at 10 fruit';
  }

  // ---------- the garden, as a place you can visit ----------
  function enterGarden() {
    if (state !== 'menu' && state !== 'gameover') return;
    player = null; ghost = null; daily = null;
    state = 'garden';
    showOverlay(null);
    $('gardenBack').classList.remove('hidden');
    Sound.ui();
  }
  function exitGarden() {
    state = 'menu';
    $('gardenBack').classList.add('hidden');
    updateScoreUI();
    showOverlay('menu');
    Sound.ui();
  }

  function drawSleepingSnake(now, cx, cy, inkColor) {
    const skin = SKINS[prog.skin] || SKINS.drift;
    const breathe = 1 + Math.sin(now / 1900) * 0.03;
    const R = cell * 1.5;
    const BW = cell * 0.58;
    ctx.save();
    // breathe by scaling about the coil's base so it stays grounded
    const baseY = cy + R * 0.45;
    ctx.translate(cx, baseY);
    ctx.scale(breathe, breathe);
    ctx.translate(-cx, -baseY);

    // pressed grass and a tight shadow hugging the coil
    ctx.fillStyle = 'rgba(70,110,60,.18)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + R * 0.40, R * 1.4, R * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.10)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + R * 0.44, R * 1.15, R * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    let grad = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
    grad.addColorStop(0, skin.b);
    grad.addColorStop(1, skin.a);
    if (skin.pattern === 'gingham') grad = ginghamPaint(ctx, cell * 0.3);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // tail tip resting on the ground, poking out from under the bottom loop
    ctx.fillStyle = grad;
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      ctx.beginPath();
      ctx.arc(cx + R * (0.75 + t * 0.55), cy + R * (0.40 + t * 0.05),
        (BW / 2) * (0.58 - t * 0.42), 0, Math.PI * 2);
      ctx.fill();
    }

    // stacked loops, bottom to top, with clear seams between them
    const loops = [
      { rx: R, ry: R * 0.42, oy: 0 },
      { rx: R * 0.76, ry: R * 0.34, oy: -R * 0.42 },
      { rx: R * 0.48, ry: R * 0.26, oy: -R * 0.76 },
    ];
    for (let li = 0; li < loops.length; li++) {
      const L = loops[li];
      if (li > 0) {
        ctx.strokeStyle = 'rgba(0,0,0,.14)';
        ctx.lineWidth = BW * 1.18;
        ctx.beginPath();
        ctx.ellipse(cx, cy + L.oy + BW * 0.20, L.rx, L.ry, 0, Math.PI * 0.1, Math.PI * 0.9);
        ctx.stroke();
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = BW;
      ctx.beginPath();
      ctx.ellipse(cx, cy + L.oy, L.rx, L.ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // neck curling from the top loop to the head resting on it
    const top = loops[2];
    const hx = cx + top.rx * 0.7;
    const hy = cy + top.oy - top.ry * 1.1;
    ctx.strokeStyle = grad;
    ctx.lineWidth = BW;
    ctx.beginPath();
    ctx.moveTo(cx - top.rx * 0.5, cy + top.oy - top.ry * 0.6);
    ctx.quadraticCurveTo(cx, cy + top.oy - top.ry * 1.6, hx, hy);
    ctx.stroke();
    ctx.fillStyle = skin.head;
    ctx.beginPath();
    ctx.arc(hx, hy, BW * 0.72, 0, Math.PI * 2);
    ctx.fill();
    const fs = BW * 1.45;
    ctx.fillStyle = 'rgba(240,130,130,.30)';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(hx - fs * 0.06, hy + fs * 0.27 * side, fs * 0.075, 0, Math.PI * 2);
      ctx.fill();
    }
    // peacefully closed eyes: soft downward arcs
    ctx.strokeStyle = '#4d4a63';
    ctx.lineWidth = Math.max(1.6, fs * 0.045);
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      const ex = hx + fs * 0.10;
      const ey = hy + fs * 0.165 * side;
      ctx.beginPath();
      ctx.arc(ex, ey - fs * 0.05, fs * 0.11, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
    if (prog.hat !== 'none') drawHat(ctx, prog.hat, hx, hy, fs);
    ctx.textAlign = 'center';
    for (let k = 0; k < 3; k++) {
      const ph = ((now / 1400) + k * 0.33) % 1;
      ctx.globalAlpha = Math.max(0, (1 - ph) * 0.75);
      ctx.fillStyle = inkColor;
      ctx.font = `700 ${Math.round(cell * (0.26 + k * 0.07 + ph * 0.14))}px Quicksand, sans-serif`;
      ctx.fillText('z', hx + cell * (0.6 + ph * 0.6 + k * 0.25), hy - cell * (0.55 + ph * 0.9 + k * 0.3));
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // the garden takes after whichever world you have grown the most flowers in
  const GARDEN_LOOKS = {
    m: { skyA: '#cfe3f2', skyB: '#f4ecd8', groundA: '#cde4bd', groundB: '#b7d6a6',
         canopy: ['#88b884', '#7da379', '#94bd8b'], grass: 'rgba(110,150,100,.4)',
         ink: '#6f665b', soft: '#a99e8f', critters: 'meadow', precip: null, night: false },
    s: { skyA: '#f3d4e2', skyB: '#fdf0e4', groundA: '#d8e6c0', groundB: '#c3d9ab',
         canopy: ['#f0b6cc', '#e8a4bf', '#f5c7d8'], grass: 'rgba(110,150,100,.4)',
         ink: '#7a5f68', soft: '#b393a0', critters: 'meadow', precip: 'petal', night: false },
    n: { skyA: '#22203a', skyB: '#3c3858', groundA: '#41504a', groundB: '#313e38',
         canopy: ['#4a6455', '#3e5949', '#54705f'], grass: 'rgba(180,205,190,.25)',
         ink: '#e6e1d4', soft: '#a9a2b8', critters: 'firefly', precip: null, night: true },
    c: { skyA: '#d9f0fb', skyB: '#eef8e8', groundA: '#aad751', groundB: '#a2d149',
         canopy: ['#3faa49', '#5cb860', '#7cc97e'], grass: 'rgba(80,130,60,.4)',
         ink: '#3c4043', soft: '#7d8288', critters: 'pixelfly', precip: null, night: false },
    t: { skyA: '#bfe0ec', skyB: '#e6f3ec', groundA: '#e8dcb6', groundB: '#dccc9d',
         canopy: ['#5fa8a0', '#76b5a6', '#8ec3b0'], grass: 'rgba(140,160,120,.4)',
         ink: '#4f6868', soft: '#8aa6a3', critters: 'meadow', precip: null, night: false },
    a: { skyA: '#f2d9b8', skyB: '#f9ecd2', groundA: '#ddc99b', groundB: '#ccb480',
         canopy: ['#d98a4a', '#c2632f', '#e0a45e'], grass: 'rgba(150,120,70,.4)',
         ink: '#6b5a48', soft: '#a8927a', critters: 'meadow', precip: 'maple', night: false },
    o: { skyA: '#d9d9d5', skyB: '#edebe5', groundA: '#e9e8e2', groundB: '#dbd9d1',
         canopy: ['#9aa89a', '#8a9a8c', '#a8b5a8'], grass: 'rgba(130,130,125,.35)',
         ink: '#4a4845', soft: '#94918a', critters: null, precip: 'snow', night: false },
    r: { skyA: '#5d6878', skyB: '#8c97a8', groundA: '#8fa98a', groundB: '#7d9779',
         canopy: ['#5f8069', '#6f8f7a', '#52735d'], grass: 'rgba(85,115,95,.45)',
         ink: '#e6e9f0', soft: '#b6bfce', critters: null, precip: 'rain', night: false, cloudy: true },
  };
  function gardenWorld() {
    const counts = {};
    for (const ch of (prog.bloomLog || '')) counts[ch] = (counts[ch] || 0) + 1;
    let best = 'm', n = 0;
    for (const ch in counts) if (counts[ch] > n) { n = counts[ch]; best = ch; }
    return best;
  }

  // earned decorations take root the moment they unlock — quiet rewards that
  // make the garden feel more and more lived-in
  function drawGardenDecor(now, W, H, horizon, look) {
    const u = cell;
    if (prog.deco.includes('birdhouse')) {
      const bx = W * 0.075, base = horizon + (H - horizon) * 0.14;
      ctx.fillStyle = '#8a6a4a';
      ctx.fillRect(bx - u * 0.035, base - u * 1.55, u * 0.07, u * 1.55);
      ctx.fillStyle = '#b08555';
      ctx.fillRect(bx - u * 0.27, base - u * 2.05, u * 0.54, u * 0.55);
      ctx.fillStyle = '#7a5230';
      ctx.beginPath();
      ctx.moveTo(bx - u * 0.34, base - u * 2.05);
      ctx.lineTo(bx, base - u * 2.38);
      ctx.lineTo(bx + u * 0.34, base - u * 2.05);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#3a2d1d';
      ctx.beginPath();
      ctx.arc(bx, base - u * 1.82, u * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
    if (prog.deco.includes('windchime')) {
      const wx = W * 0.91, base = horizon + (H - horizon) * 0.20;
      ctx.strokeStyle = '#8a6a4a';
      ctx.lineWidth = u * 0.07;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(wx, base);
      ctx.lineTo(wx, base - u * 1.7);
      ctx.lineTo(wx - u * 0.55, base - u * 1.7);
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const sway = Math.sin(now / (850 + i * 140) + i * 2.1) * u * 0.05;
        const tx = wx - u * (0.18 + i * 0.17);
        const len = u * (0.42 - i * 0.07);
        ctx.strokeStyle = 'rgba(120,100,80,.7)';
        ctx.lineWidth = Math.max(1, u * 0.022);
        ctx.beginPath();
        ctx.moveTo(tx, base - u * 1.7);
        ctx.lineTo(tx + sway, base - u * 1.45);
        ctx.stroke();
        ctx.strokeStyle = '#d8d2c2';
        ctx.lineWidth = u * 0.07;
        ctx.beginPath();
        ctx.moveTo(tx + sway, base - u * 1.45);
        ctx.lineTo(tx + sway * 1.4, base - u * 1.45 + len);
        ctx.stroke();
      }
    }
    if (prog.deco.includes('stonelantern')) {
      const sx = W * 0.295, sy = horizon + (H - horizon) * 0.30;
      if (look.night) {
        const pulse = 0.75 + 0.25 * Math.sin(now / 700);
        ctx.fillStyle = `rgba(247,210,130,${0.16 * pulse})`;
        ctx.beginPath();
        ctx.arc(sx, sy - u * 0.62, u * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#9b968c';
      ctx.fillRect(sx - u * 0.09, sy - u * 0.42, u * 0.18, u * 0.42);
      ctx.fillRect(sx - u * 0.26, sy - u * 0.06, u * 0.52, u * 0.08);
      ctx.fillStyle = '#aaa59b';
      ctx.fillRect(sx - u * 0.21, sy - u * 0.78, u * 0.42, u * 0.36);
      ctx.fillStyle = look.night ? '#f7d282' : '#e8e2d2';
      ctx.fillRect(sx - u * 0.10, sy - u * 0.70, u * 0.20, u * 0.20);
      ctx.fillStyle = '#8e897f';
      ctx.beginPath();
      ctx.moveTo(sx - u * 0.32, sy - u * 0.78);
      ctx.quadraticCurveTo(sx, sy - u * 1.08, sx + u * 0.32, sy - u * 0.78);
      ctx.closePath();
      ctx.fill();
    }
    if (prog.deco.includes('bench')) {
      const bx = W * 0.17, by = horizon + (H - horizon) * 0.46;
      ctx.fillStyle = '#8a6544';
      ctx.fillRect(bx - u * 0.55, by - u * 0.30, u * 0.09, u * 0.30);
      ctx.fillRect(bx + u * 0.46, by - u * 0.30, u * 0.09, u * 0.30);
      ctx.fillStyle = '#9a7350';
      ctx.fillRect(bx - u * 0.66, by - u * 0.38, u * 1.32, u * 0.10);
      for (let i = 0; i < 2; i++) {
        ctx.fillRect(bx - u * 0.62, by - u * (0.62 + i * 0.14), u * 1.24, u * 0.07);
      }
      ctx.fillStyle = '#8a6544';
      ctx.fillRect(bx - u * 0.58, by - u * 0.76, u * 0.07, u * 0.46);
      ctx.fillRect(bx + u * 0.51, by - u * 0.76, u * 0.07, u * 0.46);
    }
    if (prog.deco.includes('fountain')) {
      // earned by filling the board — stone basin, always softly running
      const fx = W * 0.63, fy = horizon + (H - horizon) * 0.26;
      ctx.fillStyle = '#9b968c';
      ctx.beginPath();
      ctx.ellipse(fx, fy, u * 0.72, u * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = look.night ? '#3e5468' : '#9cc7d8';
      ctx.beginPath();
      ctx.ellipse(fx, fy - u * 0.04, u * 0.58, u * 0.17, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#aaa59b';
      ctx.fillRect(fx - u * 0.06, fy - u * 0.52, u * 0.12, u * 0.46);
      ctx.beginPath();
      ctx.ellipse(fx, fy - u * 0.54, u * 0.26, u * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = look.night ? 'rgba(190,220,240,.5)' : 'rgba(170,212,230,.8)';
      ctx.lineWidth = Math.max(1, u * 0.035);
      ctx.lineCap = 'round';
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(fx, fy - u * 0.60);
        ctx.quadraticCurveTo(fx + side * u * 0.24, fy - u * 0.85, fx + side * u * 0.36, fy - u * 0.08);
        ctx.stroke();
      }
      ctx.fillStyle = look.night ? '#bcd8ec' : '#cfe6f0';
      for (let k = 0; k < 4; k++) {
        const ph = ((now / 950) + k * 0.25) % 1;
        const side = k % 2 ? 1 : -1;
        ctx.globalAlpha = 0.85 * (1 - ph);
        ctx.beginPath();
        ctx.arc(fx + side * u * (0.08 + ph * 0.3),
          fy - u * 0.60 - Math.sin(ph * Math.PI) * u * 0.28 + ph * ph * u * 0.5,
          u * 0.035, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  // the pond sits in the foreground, so it's drawn over the flowers behind it
  function drawKoiPond(now, W, H, horizon, look) {
    if (!prog.deco.includes('koipond')) return;
    const u = cell;
    const px = W * 0.76, py = horizon + (H - horizon) * 0.68;
    const rx = u * 1.45, ry = u * 0.6;
    ctx.fillStyle = 'rgba(90,80,60,.30)';
    ctx.beginPath();
    ctx.ellipse(px, py, rx * 1.08, ry * 1.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = look.night ? '#3e5468' : '#86b8cc';
    ctx.beginPath();
    ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = look.night ? 'rgba(220,230,245,.12)' : 'rgba(255,255,255,.25)';
    ctx.beginPath();
    ctx.ellipse(px - rx * 0.25, py - ry * 0.25, rx * 0.45, ry * 0.4, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // two koi circling each other, nose to tail
    for (let i = 0; i < 2; i++) {
      const a = now / 2400 + i * Math.PI;
      const kx = px + Math.cos(a) * rx * 0.55;
      const ky = py + Math.sin(a) * ry * 0.55;
      const heading = Math.atan2(Math.cos(a) * ry * 0.55, -Math.sin(a) * rx * 0.55);
      ctx.save();
      ctx.translate(kx, ky);
      ctx.rotate(heading);
      ctx.fillStyle = i ? '#f2f0e8' : '#e8824a';
      ctx.beginPath();
      ctx.ellipse(0, 0, u * 0.18, u * 0.075, 0, 0, Math.PI * 2);
      ctx.fill();
      const wag = Math.sin(now / 180 + i * 3) * u * 0.05;
      ctx.beginPath();
      ctx.moveTo(-u * 0.14, 0);
      ctx.lineTo(-u * 0.27, wag - u * 0.05);
      ctx.lineTo(-u * 0.27, wag + u * 0.05);
      ctx.closePath();
      ctx.fill();
      if (!i) {
        ctx.fillStyle = '#f2f0e8';
        ctx.beginPath();
        ctx.ellipse(u * 0.04, 0, u * 0.05, u * 0.045, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    // a lily pad at the edge
    ctx.fillStyle = look.night ? '#4a6455' : '#7da379';
    ctx.beginPath();
    ctx.ellipse(px + rx * 0.62, py - ry * 0.5, u * 0.2, u * 0.11, 0.2, 0.25, Math.PI * 2);
    ctx.fill();
  }

  function drawGardenScene(now) {
    const W = cols * cell, H = rows * cell;
    const horizon = H * 0.34;
    const look = GARDEN_LOOKS[gardenWorld()] || GARDEN_LOOKS.m;
    let g = ctx.createLinearGradient(0, 0, 0, horizon);
    g.addColorStop(0, look.skyA);
    g.addColorStop(1, look.skyB);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, horizon + 1);
    if (look.night) {
      const sr = mulberry32(404);
      ctx.fillStyle = '#e8e9f5';
      for (let i = 0; i < 40; i++) {
        const x = sr() * W, y = sr() * horizon * 0.9;
        ctx.globalAlpha = 0.3 + 0.5 * Math.sin(now / (500 + sr() * 600) + i);
        ctx.fillRect(x, y, 2, 2);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#f1ecd7';
      ctx.beginPath();
      ctx.arc(W * 0.82, horizon * 0.42, cell * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = look.skyA;
      ctx.beginPath();
      ctx.arc(W * 0.82 + cell * 0.2, horizon * 0.42 - cell * 0.12, cell * 0.38, 0, Math.PI * 2);
      ctx.fill();
    } else if (look.cloudy) {
      // rain clouds where the sun would be
      const cr = mulberry32(606);
      for (let i = 0; i < 3; i++) {
        const s = cell * (0.9 + cr() * 0.7);
        const span = W + s * 3.2;
        const x = W + s * 1.6 - ((now * (0.002 + cr() * 0.0012) + cr() * 9000) % span);
        const y = horizon * (0.25 + cr() * 0.35);
        drawCloud(ctx, x, y, s, 0.45, 0.85 + cr() * 0.3, 0.85 + cr() * 0.3, 0.85 + cr() * 0.3);
      }
    } else {
      ctx.fillStyle = 'rgba(247,227,176,.35)';
      ctx.beginPath();
      ctx.arc(W * 0.82, horizon * 0.45, cell * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(247,227,176,.95)';
      ctx.beginPath();
      ctx.arc(W * 0.82, horizon * 0.45, cell * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    g = ctx.createLinearGradient(0, horizon, 0, H);
    g.addColorStop(0, look.groundA);
    g.addColorStop(1, look.groundB);
    ctx.fillStyle = g;
    ctx.fillRect(0, horizon, W, H - horizon);

    const blooms = Math.floor(prog.fruitTotal / 10);

    // a tree takes root every 100 blooms
    const trees = Math.min(6, Math.floor(blooms / 100));
    for (let ti = 0; ti < trees; ti++) {
      const r = mulberry32(555 + ti * 131);
      const tx = W * (0.08 + 0.84 * ((ti + r() * 0.6) / 6));
      const th = cell * (1.2 + r() * 0.5);
      ctx.fillStyle = '#9a7350';
      ctx.fillRect(tx - cell * 0.06, horizon - th * 0.5, cell * 0.12, th * 0.55);
      ctx.fillStyle = look.canopy[ti % 3];
      for (const [ox, oy, rr] of [[0, 0.78, 0.45], [-0.32, 0.6, 0.32], [0.32, 0.62, 0.34]]) {
        ctx.beginPath();
        ctx.arc(tx + ox * th, horizon - th * oy, th * rr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const gr = mulberry32(909);
    ctx.strokeStyle = look.grass;
    ctx.lineWidth = Math.max(1, cell * 0.03);
    ctx.lineCap = 'round';
    for (let i = 0; i < W / 12; i++) {
      const x = gr() * W, y = horizon + gr() * (H - horizon);
      const bh = cell * (0.1 + gr() * 0.16) * (0.6 + (y - horizon) / (H - horizon));
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.sin(now / 1500 + i) * 2, y - bh * 0.6, x + (gr() - 0.5) * 4, y - bh);
      ctx.stroke();
    }

    drawGardenDecor(now, W, H, horizon, look);

    // every flower you have ever grown, nearest drawn last
    const log = prog.bloomLog || '';
    const legacy = blooms - log.length;
    const drawn = Math.min(blooms, 300);
    const flowers = [];
    for (let i = 0; i < drawn; i++) {
      const r = mulberry32(2000 + i * 7919);
      const set = i >= legacy ? (WORLD_FLOWERS[log[i - legacy]] || FLOWER_COLORS) : FLOWER_COLORS;
      flowers.push({
        x: W * (0.03 + r() * 0.94),
        y: horizon + cell * 0.35 + r() * (H - horizon - cell * 1.0),
        color: set[Math.floor(r() * set.length)],
        seed: r(),
      });
    }
    flowers.sort((a, b) => a.y - b.y);
    for (const f of flowers) {
      const depth = 0.65 + 0.6 * (f.y - horizon) / (H - horizon);
      const sc = cell * 0.052 * depth;
      const stemH = sc * (4.5 + f.seed * 2.5);
      ctx.strokeStyle = '#7da379';
      ctx.lineWidth = Math.max(1, sc * 0.55);
      ctx.beginPath();
      ctx.moveTo(f.x, f.y);
      ctx.quadraticCurveTo(f.x + Math.sin(now / 1800 + f.x) * 1.5, f.y - stemH * 0.6, f.x, f.y - stemH);
      ctx.stroke();
      ctx.fillStyle = f.color;
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2 + f.seed * 6;
        ctx.beginPath();
        ctx.arc(f.x + Math.cos(a) * sc * 1.25, f.y - stemH + Math.sin(a) * sc * 1.25, sc, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#f8e9a1';
      ctx.beginPath();
      ctx.arc(f.x, f.y - stemH, sc * 0.75, 0, Math.PI * 2);
      ctx.fill();
    }

    drawSleepingSnake(now, W * 0.5, H * 0.66, look.ink);
    drawKoiPond(now, W, H, horizon, look);

    // company, depending on what kind of garden this has become
    if (look.critters === 'meadow') {
      for (let k = 0; k < 3; k++) {
        const bx = W * (0.5 + 0.36 * Math.sin(now / (3600 + k * 700) + k * 2.1));
        const by = horizon * 0.6 + (H * 0.7 - horizon * 0.6) * (0.5 + 0.42 * Math.sin(now / (2900 + k * 500) + k * 1.3));
        const flap = Math.abs(Math.sin(now / 130 + k * 2));
        if (k === 2) {
          const s = cell * 0.08;
          ctx.fillStyle = 'rgba(255,255,255,.75)';
          ctx.beginPath();
          ctx.ellipse(bx - s * 0.2, by - s * (0.9 + flap * 0.5), s * 0.7, s * 0.45, -0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f2c84b';
          ctx.beginPath();
          ctx.ellipse(bx, by, s * 1.15, s * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#6b4f2e';
          ctx.lineWidth = Math.max(1.2, s * 0.32);
          ctx.beginPath();
          ctx.moveTo(bx - s * 0.3, by - s * 0.7);
          ctx.lineTo(bx - s * 0.3, by + s * 0.7);
          ctx.stroke();
        } else {
          ctx.fillStyle = ['#ffffff', '#ffb3c0'][k];
          for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.ellipse(bx + s * cell * 0.08 * (0.3 + flap * 0.7), by,
              cell * 0.10 * (0.3 + flap * 0.7), cell * 0.12, s * 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = 'rgba(90,80,70,.8)';
          ctx.beginPath();
          ctx.ellipse(bx, by, cell * 0.02, cell * 0.08, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (look.critters === 'firefly') {
      for (let k = 0; k < 5; k++) {
        const bx = W * (0.5 + 0.4 * Math.sin(now / (4200 + k * 600) + k * 2.3));
        const by = horizon * 0.5 + (H * 0.8 - horizon * 0.5) * (0.5 + 0.4 * Math.sin(now / (3300 + k * 450) + k * 1.7));
        const glow = 0.4 + 0.3 * Math.sin(now / (800 + k * 150) + k);
        ctx.globalAlpha = glow;
        ctx.fillStyle = '#f4d35e';
        ctx.beginPath(); ctx.arc(bx, by, cell * 0.09, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = Math.min(1, glow * 2);
        ctx.fillStyle = '#fdf3c0';
        ctx.beginPath(); ctx.arc(bx, by, cell * 0.04, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    } else if (look.critters === 'pixelfly') {
      for (let k = 0; k < 2; k++) {
        const bx = Math.round((W * (0.5 + 0.38 * Math.sin(now / (3500 + k * 800) + k * 2))) / 3) * 3;
        const by = Math.round((horizon * 0.6 + (H * 0.7 - horizon * 0.6) * (0.5 + 0.4 * Math.sin(now / 2800 + k * 1.4))) / 3) * 3;
        const u = Math.max(2, Math.round(cell * 0.07));
        const open = Math.floor(now / 160 + k) % 2 === 0;
        ctx.fillStyle = ['#4775ea', '#ffd23f'][k];
        if (open) {
          ctx.fillRect(bx - u * 2, by - u, u, u * 2);
          ctx.fillRect(bx + u, by - u, u, u * 2);
        } else {
          ctx.fillRect(bx - u * 1.4, by - u * 1.6, u, u * 1.4);
          ctx.fillRect(bx + u * 0.4, by - u * 1.6, u, u * 1.4);
        }
        ctx.fillStyle = '#3c4043';
        ctx.fillRect(bx - u / 2, by - u * 1.2, u, u * 2.4);
      }
    }

    // weather drifting through, when the garden's world calls for it
    if (look.precip === 'rain') {
      // rain falls faster and straighter than anything that drifts
      for (let k = 0; k < 22; k++) {
        const fall = ((now * (0.085 + (k % 5) * 0.012) + k * 977) % (H + cell)) - cell * 0.5;
        const px = ((k * 197) % 100) / 100 * W;
        ctx.globalAlpha = 0.32;
        ctx.strokeStyle = '#cfd9e8';
        ctx.lineCap = 'round';
        ctx.lineWidth = Math.max(1, cell * 0.03);
        ctx.beginPath();
        ctx.moveTo(px, fall);
        ctx.lineTo(px - cell * 0.05, fall + cell * 0.3);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    } else if (look.precip) {
      for (let k = 0; k < 10; k++) {
        const fall = ((now * (0.018 + (k % 4) * 0.004) + k * 977) % (H + cell)) - cell * 0.5;
        const px = ((k * 197) % 100) / 100 * W + Math.sin(now / 1200 + k) * cell * 0.4;
        ctx.save();
        ctx.translate(px, fall);
        if (look.precip === 'petal') {
          ctx.rotate(Math.sin(now / 800 + k) + k);
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = '#f293b9';
          const s = cell * 0.11;
          ctx.beginPath();
          ctx.moveTo(0, -s * 1.35);
          ctx.quadraticCurveTo(s, -s * 0.35, 0, s);
          ctx.quadraticCurveTo(-s, -s * 0.35, 0, -s * 1.35);
          ctx.fill();
        } else if (look.precip === 'maple') {
          ctx.rotate(Math.sin(now / 1500 + k) + k);
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = ['#d98a4a', '#c2632f', '#b8923f'][k % 3];
          drawMapleLeaf(ctx, cell * 0.14);
        } else if (look.precip === 'snow') {
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, cell * (0.035 + (k % 3) * 0.015), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        ctx.globalAlpha = 1;
      }
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = look.ink;
    ctx.font = `700 ${Math.round(cell * 0.55)}px Quicksand, sans-serif`;
    ctx.fillText('your garden', W / 2, cell * 0.95);
    ctx.fillStyle = look.soft;
    ctx.font = `700 ${Math.round(cell * 0.3)}px Quicksand, sans-serif`;
    ctx.fillText(
      blooms === 0
        ? 'eat 10 fruit to plant your first flower'
        : `${blooms} bloom${blooms === 1 ? '' : 's'} · ${prog.fruitTotal} fruit` +
          (trees ? ` · ${trees} tree${trees === 1 ? '' : 's'}` : ''),
      W / 2, cell * 1.5);
  }

  // ---------- main loop ----------
  function frame(now) {
    requestAnimationFrame(frame);
    if (!lastTime) { lastTime = now; return; }
    const dt = Math.min(now - lastTime, 100);
    lastTime = now;

    if (state === 'garden') {
      ctx.clearRect(0, 0, cols * cell, rows * cell);
      drawGardenScene(now);
      return;
    }

    if (state === 'playing') {
      acc += dt;
      // at most one tick per frame: after a frame hiccup the snake must never
      // travel two squares before the player sees one (excess time is dropped)
      if (acc >= stepMs) {
        acc = Math.min(acc - stepMs, stepMs * 0.9);
        tick(now);
      }
    }

    if (settings.mode === 'trial' && player && state !== 'menu') {
      const remain = Math.max(0, trialTicks * stepMs - (player.ticks * stepMs + (state === 'playing' ? acc : 0)));
      $('timeLeft').textContent = Math.ceil(remain / 1000);
    }

    const t = state === 'playing' ? Math.min(acc / stepMs, 1) : 1;
    ctx.clearRect(0, 0, cols * cell, rows * cell);
    drawBoard();
    drawScene(now);
    drawCameo(now);
    drawAmbient(now, dt);

    if (player) {
      const kind = FRUIT_KIND[settings.theme] || 'orange';
      for (const f of player.fruits) {
        if (f.ticksLeft != null) {
          const secs = Math.max(1, Math.ceil(f.ticksLeft * stepMs / 1000));
          drawTimedFruit(kind, f.x, f.y, now, f.ticksLeft / ttlTicks, secs, secs <= 1);
        } else {
          drawApple(f.x, f.y, now, f.golden);
        }
      }
      if (player.bonus) {
        const b = player.bonus;
        const secs = Math.max(1, Math.ceil(b.ticksLeft * stepMs / 1000));
        if (state === 'playing') {
          if (lastBonusSecs !== null && secs < lastBonusSecs && secs <= 3) Sound.bonusTick();
          lastBonusSecs = secs;
        }
        drawTimedFruit(kind, b.x, b.y, now, b.ticksLeft / ttlTicks, secs, secs <= 1);
      } else {
        lastBonusSecs = null;
      }
      emitTrail(now);
      drawTrail(now);
      if (ghost) {
        const fade = ghost.diedAt ? Math.max(0, 1 - (now - ghost.diedAt) / 900) : 1;
        if (fade > 0) {
          ctx.globalAlpha = fade;
          drawSnakeBody(ghost.sim, ghost.sim.alive ? t : 1, now, true);
          ctx.globalAlpha = 1;
        }
      }
      drawSnakeBody(player, state === 'ready' ? 0 : t, now, false);
      drawEffects(now, dt);
      if (state === 'dying' && endCause === 'death') {
        const k = Math.min((now - dieAt) / 700, 1);
        ctx.fillStyle = `rgba(239,148,134,${0.10 * Math.sin(k * Math.PI)})`;
        ctx.fillRect(0, 0, cols * cell, rows * cell);
      }
    }
  }

  // read-only state hook for tooling/automation (replays, drivers)
  window.__drift = {
    get: () => ({
      state, score: player ? player.score : 0, best: getBest(),
      cols, rows, mode: settings.mode, theme: settings.theme, seed: seedStr(runSeed),
      dir: player ? { ...player.dir } : null,
      fruit: player && player.fruits[0] ? { ...player.fruits[0] } : null,
      fruits: player ? player.fruits.map(f => ({ ...f })) : [],
      bonus: player && player.bonus ? { ...player.bonus } : null,
      snake: player ? player.snake.map(c => ({ ...c })) : [],
      ticks: player ? player.ticks : 0, trialTicks,
      ghost: !!ghost, ghostAlive: !!(ghost && ghost.sim.alive),
      ghostHead: ghost && ghost.sim.snake[0] ? { ...ghost.sim.snake[0] } : null,
      ghostScore: ghost ? ghost.sim.score : null,
      challenge: challenge ? { ...challenge } : null,
      prog: JSON.parse(JSON.stringify(prog)),
    }),
  };

  // ---------- boot ----------
  Sound.initVolumes(settings.sfxVol, settings.musicVol);
  Sound.setRain(rainOn());
  applyTheme();
  configureBoard();
  updateScoreUI();
  refreshWardrobe();
  updateDailyBtn();
  resetAmbient();
  drawGarden();
  // autoplay rules silence audio until the page is touched: the first
  // click or keypress anywhere brings the world's sound back
  const kickAudio = () => {
    document.removeEventListener('pointerdown', kickAudio);
    document.removeEventListener('keydown', kickAudio);
    Sound.ensure();
    Sound.setVolumes(settings.sfxVol, settings.musicVol);
    Sound.setRain(rainOn());
    ensureMusic();
  };
  document.addEventListener('pointerdown', kickAudio);
  document.addEventListener('keydown', kickAudio);
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  // ask the browser to keep our saves: localStorage is otherwise evictable
  // under storage pressure — notably iOS Safari clears it after ~7 days away,
  // which would silently wipe a returning player's progress and garden. No
  // account, no server: the save lives on the device, just more durably.
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persisted()
      .then(p => { if (!p) return navigator.storage.persist(); })
      .catch(() => {});
  }
  requestAnimationFrame(frame);
})();

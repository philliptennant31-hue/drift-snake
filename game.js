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
  };

  // each palette has its own timed fruit
  const FRUIT_KIND = { meadow: 'orange', sakura: 'dragonfruit', classic: 'kiwi', midnight: 'starfruit', tide: 'blueberry', autumn: 'persimmon', mono: 'plum' };
  const FRUIT_NAME = { orange: 'oranges', dragonfruit: 'dragon fruit', kiwi: 'kiwis', starfruit: 'starfruit', blueberry: 'blueberries', persimmon: 'persimmons', plum: 'plums' };

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
    honey:   { a: '#e2b13c', b: '#f0d27a', head: '#d49f28', unlock: { stat: 'golden', n: 10 },    hint: 'find 10 golden apples, any world' },
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
  };
  function unlockProgress(u) {
    const cur = u.timed ? (prog.timed[u.timed] || 0) : (prog[u.stat] || 0);
    return `${Math.min(cur, u.n)}/${u.n}`;
  }

  // ---------- settings ----------
  const DEFAULTS = {
    mode: 'classic', pace: 'normal', size: 'normal', layout: 'wide',
    theme: 'meadow', fruits: 'single', ambience: 'on',
    sfxVol: 0.8, musicVol: 0.5,
  };
  let settings = { ...DEFAULTS };
  try { Object.assign(settings, JSON.parse(localStorage.getItem('drift-settings') || '{}')); } catch (e) {}
  const saveSettings = () => localStorage.setItem('drift-settings', JSON.stringify(settings));

  // rain belongs to each world's atmosphere: remembered per world,
  // on by default only where it fits
  function getRain(world) {
    const o = settings.rainW || {};
    if (o[world]) return o[world];
    return world === 'midnight' ? 'on' : 'off';
  }
  function setRainSetting(world, v) {
    settings.rainW = settings.rainW || {};
    settings.rainW[world] = v;
    saveSettings();
  }

  // ---------- progression ----------
  const PROG_DEFAULT = {
    fruitTotal: 0,
    timed: { meadow: 0, sakura: 0, classic: 0, midnight: 0, tide: 0, autumn: 0, mono: 0 },
    clutch: 0, perfect: 0, ghostWins: 0, golden: 0,
    dailyStreak: 0, dailyLast: 0, dailyPlays: 0,
    bloomLog: '',   // one char per garden bloom, recording the world it grew in
    skins: ['drift'], hats: [], skin: 'drift', hat: 'none',
  };
  let prog = { ...PROG_DEFAULT, timed: { ...PROG_DEFAULT.timed }, skins: ['drift'], hats: [] };
  try {
    const s = JSON.parse(localStorage.getItem('drift-progress') || 'null');
    if (s) {
      Object.assign(prog, s);
      prog.timed = { ...PROG_DEFAULT.timed, ...(s.timed || {}) };
      prog.skins = Array.isArray(s.skins) && s.skins.length ? s.skins : ['drift'];
      prog.hats = Array.isArray(s.hats) ? s.hats : [];
    }
  } catch (e) {}
  if (!prog.skins.includes('drift')) prog.skins.unshift('drift');
  if (!prog.skins.includes(prog.skin)) prog.skin = 'drift';
  if (prog.hat !== 'none' && !prog.hats.includes(prog.hat)) prog.hat = 'none';
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
  let acc = 0, lastTime = 0, dieAt = 0;
  let particles = [], popups = [], eatRipple = null;
  let ambient = [], ambTimer = 0;
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
  const randomSeed = () => (Math.random() * 4294967296) >>> 0;
  const seedStr = s => s.toString(36);
  const gapRoll = rng => BONUS_GAP_MIN + Math.floor(rng() * BONUS_GAP_SPAN);

  function freeCell(sim) {
    const taken = new Set(sim.snake.map(c => c.x + ',' + c.y));
    for (const f of sim.fruits) taken.add(f.x + ',' + f.y);
    if (sim.bonus) taken.add(sim.bonus.x + ',' + sim.bonus.y);
    const free = [];
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++)
        if (!taken.has(x + ',' + y)) free.push({ x, y });
    if (!free.length) return null;
    return free[Math.floor(sim.rng() * free.length)];
  }

  function newFruit(sim) {
    const c = freeCell(sim);
    if (!c) return null;
    if (settings.mode === 'rush') return { x: c.x, y: c.y, ticksLeft: ttlTicks };
    const f = { x: c.x, y: c.y };
    if (sim.rng() < 0.04) f.golden = true;   // rare golden apple, worth 3
    return f;
  }

  function makeSim(seed) {
    const sim = {
      rng: mulberry32(seed),
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
    sim.bonusIn = gapRoll(sim.rng);
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
          sim.bonusIn = gapRoll(sim.rng);
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
    Sound.setRain(getRain(settings.theme) === 'on');
    if (Sound.musicWanted()) Sound.startMusic();
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
    runStats = { fruit: 0, timed: 0, golden: 0 };
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

  const WORLD_CODE = { meadow: 'm', sakura: 's', classic: 'c', midnight: 'n', tide: 't', autumn: 'a', mono: 'o' };
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
    const ndir = dirQueue.length ? dirQueue.shift() : null;
    const ev = simStep(player, ndir);
    recMoves.push(DIRS.findIndex(d => d.x === player.dir.x && d.y === player.dir.y));

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
      burst(ev.ate.x, ev.ate.y, ev.ate.golden ? ['#e2b13c', '#f0d27a'] : [PAL.fruit, PAL.leaf]);
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
      burst(ev.bonus.x, ev.bonus.y, [PAL.bonusRing, PAL.fruitHi]);
      popups.push({ x: (ev.bonus.x + 0.5) * cell, y: ev.bonus.y * cell, text: '+' + ev.bonus.pts, t0: now });
      onTimedCatch(ev.bonus.pts);
    }
    if (ev.died) return endRun('death');
    if (ev.timeUp) return endRun('time');

    if (ghost && ghost.sim.alive && ghost.idx < ghost.moves.length) {
      simStep(ghost.sim, DIRS[+ghost.moves[ghost.idx++]]);
      if (!ghost.sim.alive || ghost.idx >= ghost.moves.length) ghost.diedAt = now;
    }
  }

  function endRun(cause) {
    endCause = cause;
    state = 'dying';
    dieAt = performance.now();
    flushProg();
    if (cause === 'death') Sound.die(); else Sound.timeUp();

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

  function burst(cx, cy, colors) {
    const px = (cx + 0.5) * cell, py = (cy + 0.5) * cell;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + Math.random() * 0.5;
      const sp = cell * (0.06 + Math.random() * 0.07);
      particles.push({
        x: px, y: py,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - cell * 0.03,
        r: cell * (0.05 + Math.random() * 0.07),
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
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

  document.addEventListener('keydown', e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const d = KEY_DIRS[k];
    if (d) {
      e.preventDefault();
      if (state === 'ready') tryStart(d);
      else if (state === 'playing') queueDir(d);
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
    else if (state === 'playing') queueDir(d);
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
        Sound.setRain(getRain(settings.theme) === 'on');
        syncRainPills();
      }
      configureBoard();
      updateScoreUI();
      drawWardrobePreview();
    });
    sync();
  });

  function syncRainPills() {
    document.querySelectorAll('#rainPills .pill').forEach(p =>
      p.classList.toggle('active', p.dataset.v === getRain(settings.theme)));
  }
  $('rainPills').addEventListener('click', e => {
    const b = e.target.closest('.pill');
    if (!b) return;
    setRainSetting(settings.theme, b.dataset.v);
    syncRainPills();
    Sound.ensure();
    Sound.setRain(getRain(settings.theme) === 'on');
    Sound.ui();
  });

  // try-on preview: the snake in the style tab wears whatever you hover,
  // locked or not, so you can see a hat before earning it
  let lastPreview = '';
  function drawWardrobePreview(skinKey, hatKey) {
    const cv = $('wardrobePreview');
    if (!cv) return;
    const skinName = skinKey || prog.skin;
    const hatName = hatKey !== undefined ? hatKey : prog.hat;
    const key = skinName + '|' + hatName + '|' + settings.theme;
    if (key === lastPreview) return;
    lastPreview = key;
    const sk = SKINS[skinName] || SKINS.drift;
    const dpr = window.devicePixelRatio || 1;
    const w = 150, h = 78, s = 54;
    cv.style.width = w + 'px';
    cv.style.height = h + 'px';
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const grad = g.createLinearGradient(w * 0.65, 0, 0, 0);
    grad.addColorStop(0, sk.a);
    grad.addColorStop(1, sk.b);
    g.strokeStyle = grad;
    g.lineCap = 'round';
    g.lineWidth = s * 0.74;
    g.beginPath();
    g.moveTo(-12, h * 0.64);
    g.quadraticCurveTo(w * 0.3, h * 0.64, w * 0.60, h * 0.62);
    g.stroke();
    const hx = w * 0.62, hy = h * 0.62;
    g.fillStyle = sk.head;
    g.beginPath();
    g.arc(hx, hy, s * 0.40, 0, Math.PI * 2);
    g.fill();
    drawFace(g, hx, hy, 1, 0, s, false, false);
    if (hatName && hatName !== 'none') drawHat(g, hatName, hx, hy, s);
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
    const wp = e.target.closest ? e.target.closest('[data-skin],[data-hat]') : null;
    if (wp) drawWardrobePreview(wp.dataset.skin, wp.dataset.hat);
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
    drawWardrobePreview();
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

  for (const [id, key] of [['musicVol', 'musicVol'], ['sfxVol', 'sfxVol']]) {
    const el = $(id);
    el.value = Math.round(settings[key] * 100);
    el.addEventListener('input', () => {
      settings[key] = el.value / 100;
      saveSettings();
      Sound.ensure();
      Sound.setVolumes(settings.sfxVol, settings.musicVol);
    });
  }

  $('playBtn').addEventListener('click', () => startRun(challenge ? challenge.seed : randomSeed()));
  $('dailyBtn').addEventListener('click', () => startDaily());
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
    ctx.fillStyle = golden ? '#e2b13c' : PAL.fruit;
    ctx.beginPath();
    ctx.arc(c.x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = golden ? '#f6e3a8' : PAL.fruitHi;
    ctx.beginPath();
    ctx.arc(c.x - r * 0.32, y - r * 0.32, r * 0.30, 0, Math.PI * 2);
    ctx.fill();
    if (golden) {
      const tw = 0.5 + 0.5 * Math.sin(now / 220 + fx);
      ctx.fillStyle = `rgba(255,250,220,${0.4 + tw * 0.6})`;
      starPath(c.x + r * 0.9, y - r * 1.1, r * (0.22 + tw * 0.12), r * 0.07, 4);
      ctx.fill();
    }
    ctx.strokeStyle = PAL.stem;
    ctx.lineWidth = Math.max(1.5, cell * 0.045);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(c.x, y - r * 0.9);
    ctx.quadraticCurveTo(c.x + r * 0.15, y - r * 1.25, c.x + r * 0.1, y - r * 1.45);
    ctx.stroke();
    ctx.fillStyle = PAL.leaf;
    ctx.beginPath();
    ctx.ellipse(c.x + r * 0.45, y - r * 1.25, r * 0.42, r * 0.2, -0.5, 0, Math.PI * 2);
    ctx.fill();
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
  function drawFace(g, hx, hy, fx, fy, s, dead, blink) {
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
        const pr = er * 0.55;
        const cx = ex + fx * er * 0.32, cy = ey + fy * er * 0.32;
        g.fillStyle = PAL.eyeP;
        g.beginPath();
        g.arc(cx, cy, pr, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = 'rgba(255,255,255,.9)';
        g.beginPath();
        g.arc(cx - pr * 0.35, cy - pr * 0.35, pr * 0.32, 0, Math.PI * 2);
        g.fill();
      }
    }
  }

  function drawHat(g, kind, hx, hy, s) {
    const ctx = g;
    ctx.save();
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
    drawFace(ctx, head.x, head.y, fx, fy, cell, dead, blink);
    if (!dead && prog.hat !== 'none') drawHat(ctx, prog.hat, head.x, head.y, cell);
  }

  // ---------- ambient particles ----------
  const AMB_RATE = { meadow: 1000, sakura: 650, classic: 1100, midnight: 1000, tide: 600, autumn: 850, mono: 550 };
  function spawnAmbient(now) {
    const W = cols * cell, H = rows * cell;
    const theme = settings.theme;
    if (theme === 'meadow') {
      const flies = ambient.filter(a => a.kind === 'butterfly').length;
      if (flies < 4 && Math.random() < 0.35) {
        ambient.push({
          kind: 'butterfly', x: Math.random() < 0.5 ? -cell * 0.4 : W + cell * 0.4,
          y: H * (0.15 + Math.random() * 0.7), phase: Math.random() * 6.28, born: now,
          color: ['#ffffff', '#ffd98e', '#d9c9ff'][Math.floor(Math.random() * 3)],
        });
        return;
      }
      if (ambient.length >= 16) return;
      ambient.push({ kind: 'leaf', x: Math.random() * W, y: -cell * 0.4, phase: Math.random() * 6.28 });
    } else if (theme === 'sakura') {
      if (ambient.length >= 24) return;
      const flurry = Math.random() < 0.22 ? 5 + Math.floor(Math.random() * 4) : 1;
      for (let i = 0; i < flurry; i++) {
        ambient.push({
          kind: 'petal', x: Math.random() * W,
          y: -cell * (0.4 + Math.random() * 2.5), phase: Math.random() * 6.28,
        });
      }
    } else if (theme === 'classic') {
      // little screen-glint sparkles, like an old handheld catching the light
      if (ambient.length >= 8) return;
      ambient.push({
        kind: 'sparkle', x: Math.random() * W, y: Math.random() * H,
        born: now, dur: 1400 + Math.random() * 900, phase: Math.random() * 6.28,
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
    }
  }

  // a world switch starts its scene fresh and already alive
  function resetAmbient(now) {
    ambient = [];
    ambTimer = 0;
    const H = rows * cell, W = cols * cell;
    for (let i = 0; i < 10; i++) spawnAmbient(now || performance.now());
    for (const a of ambient) {
      if (a.kind === 'leaf' || a.kind === 'petal' || a.kind === 'snow') a.y = Math.random() * H;
      if (a.kind === 'bubble') a.y = Math.random() * H;
      if (a.kind === 'fish') a.x = Math.random() * W;
    }
  }

  function drawMapleLeaf(g, s) {
    const P = [
      [0, -1], [0.18, -0.5], [0.75, -0.55], [0.32, -0.05], [0.65, 0.25],
      [0.12, 0.18], [0, 0.35], [-0.12, 0.18], [-0.65, 0.25], [-0.32, -0.05],
      [-0.75, -0.55], [-0.18, -0.5],
    ];
    g.beginPath();
    g.moveTo(P[0][0] * s, P[0][1] * s);
    for (let i = 1; i < P.length; i++) g.lineTo(P[i][0] * s, P[i][1] * s);
    g.closePath();
    g.fill();
    g.lineWidth = Math.max(1, s * 0.12);
    g.strokeStyle = g.fillStyle;
    g.beginPath();
    g.moveTo(0, s * 0.35);
    g.lineTo(0, s * 0.7);
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
        a.y += dt * cell * 0.0009;
        const x = a.x + Math.sin(now / 1100 + a.phase) * cell * 0.5;
        if (a.y > H + cell * 0.5) { ambient.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(x, a.y);
        ctx.rotate(Math.sin(now / 800 + a.phase) * 0.8 + (a.maple ? a.phase : 0));
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = a.color || '#9cbf8e';
        if (a.maple) {
          drawMapleLeaf(ctx, cell * 0.17);
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
        ctx.globalAlpha = 0.85;
        const s = cell * 0.105;
        ctx.fillStyle = '#f6bfd2';
        ctx.beginPath();
        ctx.moveTo(0, -s * 1.35);
        ctx.quadraticCurveTo(s * 1.05, -s * 0.35, 0, s);
        ctx.quadraticCurveTo(-s * 1.05, -s * 0.35, 0, -s * 1.35);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.5)';
        ctx.beginPath();
        ctx.ellipse(0, -s * 0.15, s * 0.32, s * 0.5, 0, 0, Math.PI * 2);
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
      } else if (a.kind === 'sparkle') {
        const t = (now - a.born) / a.dur;
        if (t >= 1) { ambient.splice(i, 1); continue; }
        const al = Math.sin(t * Math.PI);
        const s = cell * 0.11 * (0.6 + 0.4 * al);
        ctx.globalAlpha = al * 0.8;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1.4, cell * 0.045);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(a.x - s, a.y); ctx.lineTo(a.x + s, a.y);
        ctx.moveTo(a.x, a.y - s); ctx.lineTo(a.x, a.y + s);
        ctx.stroke();
      } else if (a.kind === 'firefly') {
        if (now - a.born > 14000) { ambient.splice(i, 1); continue; }
        const sz = a.size || 1, sp = a.sp || 1;
        // two slow drift frequencies layered for an organic, unhurried wander
        a.x += (Math.cos(now / 1500 * sp + a.phase) * 0.16 + Math.cos(now / 480 + a.phase * 3) * 0.06) * sp;
        a.y += (Math.sin(now / 1250 * sp + a.phase * 1.7) * 0.16 + Math.sin(now / 410 + a.phase * 2.2) * 0.05) * sp;
        const glow = 0.30 + 0.40 * Math.sin(now / (260 + sz * 90) + a.phase);
        const fade = Math.min(1, (now - a.born) / 1200, (14000 - (now - a.born)) / 1200);
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
      }
      ctx.globalAlpha = 1;
    }
  }

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
      p.vy += cell * 0.004;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
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
    wrap.classList.toggle('hidden', blooms === 0);
    if (!blooms) return;
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
    $('gardenLabel').textContent = `garden · ${blooms} bloom${blooms === 1 ? '' : 's'}`;
  }

  // ---------- main loop ----------
  function frame(now) {
    requestAnimationFrame(frame);
    if (!lastTime) { lastTime = now; return; }
    const dt = Math.min(now - lastTime, 100);
    lastTime = now;

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
  Sound.setRain(getRain(settings.theme) === 'on');
  applyTheme();
  configureBoard();
  updateScoreUI();
  refreshWardrobe();
  updateDailyBtn();
  syncRainPills();
  resetAmbient();
  drawGarden();
  // autoplay rules silence audio until the page is touched: the first
  // click or keypress anywhere brings the world's sound back
  const kickAudio = () => {
    document.removeEventListener('pointerdown', kickAudio);
    document.removeEventListener('keydown', kickAudio);
    Sound.ensure();
    Sound.setVolumes(settings.sfxVol, settings.musicVol);
    Sound.setRain(getRain(settings.theme) === 'on');
  };
  document.addEventListener('pointerdown', kickAudio);
  document.addEventListener('keydown', kickAudio);
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  requestAnimationFrame(frame);
})();

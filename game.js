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
  };

  // each palette has its own timed fruit
  const FRUIT_KIND = { meadow: 'orange', sakura: 'dragonfruit', classic: 'kiwi', midnight: 'starfruit', tide: 'blueberry' };
  const FRUIT_NAME = { orange: 'oranges', dragonfruit: 'dragon fruit', kiwi: 'kiwis', starfruit: 'starfruit', blueberry: 'blueberries' };

  // ---------- skins & hats ----------
  const SKINS = {
    drift:   { a: '#8fa3e0', b: '#b3a7e6', head: '#7b90d6' },
    sunset:  { a: '#f2a36b', b: '#ef8f86', head: '#e08a52', unlock: { timed: 'meadow', n: 20 },   hint: 'eat 20 oranges in meadow' },
    dragon:  { a: '#e87fa8', b: '#c86fc9', head: '#d96a97', unlock: { timed: 'sakura', n: 20 },   hint: 'eat 20 dragon fruit in sakura' },
    retro:   { a: '#58b368', b: '#9ed36a', head: '#46a356', unlock: { timed: 'classic', n: 20 },  hint: 'eat 20 kiwis in classic' },
    galaxy:  { a: '#5c6bc0', b: '#9575cd', head: '#4a58a8', unlock: { timed: 'midnight', n: 20 }, hint: 'eat 20 starfruit in midnight' },
    deepsea: { a: '#26818e', b: '#4ab3a8', head: '#1f6f7b', unlock: { timed: 'tide', n: 20 },     hint: 'eat 20 blueberries in tide' },
  };
  const HATS = {
    none:   { label: 'none' },
    sprout: { label: 'sprout', unlock: { stat: 'fruitTotal', n: 100 }, hint: 'eat 100 fruit (lifetime)' },
    crown:  { label: 'crown',  unlock: { stat: 'ghostWins', n: 1 },    hint: 'outrun your ghost' },
    flower: { label: 'flower', unlock: { stat: 'fruitTotal', n: 500 }, hint: 'eat 500 fruit (lifetime)' },
    chef:   { label: 'chef',   unlock: { stat: 'perfect', n: 10 },     hint: 'catch 10 timed fruit at full value' },
    halo:   { label: 'halo',   unlock: { stat: 'clutch', n: 100 },     hint: 'catch 100 timed fruit with 1s left' },
  };

  // ---------- settings ----------
  const DEFAULTS = {
    mode: 'classic', pace: 'normal', size: 'normal', layout: 'wide',
    theme: 'meadow', fruits: 'single', ambience: 'on', rain: 'off',
    sfxVol: 0.8, musicVol: 0.5,
  };
  let settings = { ...DEFAULTS };
  try { Object.assign(settings, JSON.parse(localStorage.getItem('drift-settings') || '{}')); } catch (e) {}
  const saveSettings = () => localStorage.setItem('drift-settings', JSON.stringify(settings));

  // ---------- progression ----------
  const PROG_DEFAULT = {
    fruitTotal: 0,
    timed: { meadow: 0, sakura: 0, classic: 0, midnight: 0, tide: 0 },
    clutch: 0, perfect: 0, ghostWins: 0,
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
  const saveProg = () => localStorage.setItem('drift-progress', JSON.stringify(prog));

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
    if (changed) { saveProg(); refreshWardrobe(); }
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
    Sound.setMood(settings.theme);
  }

  // ---------- run state ----------
  let cols = 17, rows = 13, cell = 32, stepMs = 135, ttlTicks = 37, trialTicks = 444;
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
  const $ = id => document.getElementById(id);
  const overlays = { menu: $('menu'), ready: $('ready'), paused: $('paused'), gameover: $('gameover') };
  function showOverlay(name) {
    for (const k in overlays) overlays[k].classList.toggle('show', k === name);
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
    return settings.mode === 'rush' ? { x: c.x, y: c.y, ticksLeft: ttlTicks } : { x: c.x, y: c.y };
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
        sim.score++;
        ev.ate = { x: nx, y: ny };
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
    Sound.setRain(settings.rain === 'on');
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
    acc = 0;
    endCause = 'death';
    state = 'ready';
    updateScoreUI();
    showOverlay('ready');
  }

  function onTimedCatch(pts) {
    prog.timed[settings.theme] = (prog.timed[settings.theme] || 0) + 1;
    prog.fruitTotal++;
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
      prog.fruitTotal++;
      saveProg();
      drawGarden();
      checkUnlocks();
      updateScoreUI();
      Sound.pop(player.score);
      eatRipple = { x: ev.ate.x, y: ev.ate.y, t0: now };
      burst(ev.ate.x, ev.ate.y, [PAL.fruit, PAL.leaf]);
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
      $('goBest').textContent = 'best ' + getBest() + ' · seed ' + seedStr(runSeed);
      const ch = !!challenge;
      $('againBtn').textContent = ch ? 'try again' : 'new run';
      $('raceBtn').classList.toggle('hidden', ch);
      $('menuBtn').textContent = ch ? 'leave challenge' : 'back to menu';
      $('shareBtn').textContent = 'share challenge';
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
      if (state === 'playing') { state = 'paused'; Sound.pause(); showOverlay('paused'); }
      else if (state === 'paused') { state = 'playing'; lastTime = 0; showOverlay(null); }
    }
    if (k === 'h') document.body.classList.toggle('cinema');
    if (k === 'Enter' && state === 'gameover') $('againBtn').click();
  });

  let touchStart = null;
  canvas.addEventListener('touchstart', e => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  canvas.addEventListener('touchmove', e => {
    if (!touchStart) return;
    const dx = e.touches[0].clientX - touchStart.x;
    const dy = e.touches[0].clientY - touchStart.y;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    const d = Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
    touchStart = null;
    if (state === 'ready') tryStart(d);
    else if (state === 'playing') queueDir(d);
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
      if (g === 'theme') applyTheme();
      if (g === 'rain') Sound.setRain(settings.rain === 'on');
      configureBoard();
      updateScoreUI();
    });
    sync();
  });

  // wardrobe (skins & hats live in progression, not settings)
  function refreshWardrobe() {
    document.querySelectorAll('#skinPills .pill').forEach(p => {
      const k = p.dataset.skin;
      const locked = !prog.skins.includes(k);
      p.classList.toggle('locked', locked);
      p.classList.toggle('active', !locked && prog.skin === k);
      p.title = locked ? '🔒 ' + (SKINS[k].hint || '') : k;
    });
    document.querySelectorAll('#hatPills .pill').forEach(p => {
      const k = p.dataset.hat;
      const locked = k !== 'none' && !prog.hats.includes(k);
      p.classList.toggle('locked', locked);
      p.classList.toggle('active', !locked && prog.hat === k);
      p.title = locked ? '🔒 ' + (HATS[k].hint || '') : HATS[k].label;
    });
  }
  $('skinPills').addEventListener('click', e => {
    const b = e.target.closest('.pill');
    if (!b) return;
    const k = b.dataset.skin;
    if (!prog.skins.includes(k)) { toast('locked · ' + SKINS[k].hint); return; }
    prog.skin = k;
    saveProg();
    refreshWardrobe();
    Sound.ui();
  });
  $('hatPills').addEventListener('click', e => {
    const b = e.target.closest('.pill');
    if (!b) return;
    const k = b.dataset.hat;
    if (k !== 'none' && !prog.hats.includes(k)) { toast('locked · ' + HATS[k].hint); return; }
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
  $('againBtn').addEventListener('click', () => startRun(challenge ? challenge.seed : randomSeed()));
  $('raceBtn').addEventListener('click', () => startRun(runSeed));
  function backToMenu() {
    if (challenge) {
      challenge = null;
      history.replaceState(null, '', location.pathname);
      $('challengeNote').classList.add('hidden');
    }
    player = null; ghost = null;
    state = 'menu';
    configureBoard();
    updateScoreUI();
    refreshWardrobe();
    showOverlay('menu');
  }
  $('menuBtn').addEventListener('click', backToMenu);
  $('resumeBtn').addEventListener('click', () => { state = 'playing'; lastTime = 0; showOverlay(null); });
  $('pauseMenuBtn').addEventListener('click', backToMenu);

  $('shareBtn').addEventListener('click', () => {
    const u = new URL(location.origin + location.pathname);
    u.searchParams.set('m', settings.mode);
    u.searchParams.set('p', settings.pace);
    u.searchParams.set('s', settings.size);
    u.searchParams.set('l', settings.layout);
    u.searchParams.set('f', settings.fruits);
    u.searchParams.set('seed', seedStr(runSeed));
    u.searchParams.set('goal', player.score);
    navigator.clipboard.writeText(u.toString()).then(() => {
      $('shareBtn').textContent = 'copied ✓';
    }).catch(() => {
      $('shareBtn').textContent = u.toString();
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

  // ---------- fruit drawing ----------
  function fruitShadow(cx, cy, r) {
    ctx.fillStyle = 'rgba(0,0,0,.10)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + cell * 0.30, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawApple(fx, fy, now) {
    const c = center({ x: fx, y: fy });
    const bob = Math.sin(now / 320 + fx * 1.7 + fy) * cell * 0.045;
    const r = cell * 0.31;
    const y = c.y + bob;
    fruitShadow(c.x, c.y, r);
    ctx.fillStyle = PAL.fruit;
    ctx.beginPath();
    ctx.arc(c.x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PAL.fruitHi;
    ctx.beginPath();
    ctx.arc(c.x - r * 0.32, y - r * 0.32, r * 0.30, 0, Math.PI * 2);
    ctx.fill();
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

  function drawHat(kind, hx, hy) {
    const s = cell;
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
    } else if (kind === 'halo') {
      ctx.strokeStyle = '#e9c46a';
      ctx.lineWidth = Math.max(2, s * 0.06);
      ctx.beginPath();
      ctx.ellipse(hx, hy - s * 0.66, s * 0.20, s * 0.07, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
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

    // soft shadow under the body
    if (!isGhost) {
      ctx.save();
      ctx.translate(0, cell * 0.10);
      ctx.strokeStyle = 'rgba(0,0,0,.10)';
      for (const seg of segs) strokeSmooth(seg, W);
      ctx.restore();
    }

    if (isGhost) {
      ctx.strokeStyle = PAL.ghost;
    } else if (dead) {
      ctx.strokeStyle = PAL.dead;
    } else {
      const hp = pts[0], tp = pts[pts.length - 1];
      const g = ctx.createLinearGradient(hp.x, hp.y, tp.x, tp.y);
      g.addColorStop(0, skin.a);
      g.addColorStop(1, skin.b);
      ctx.strokeStyle = g;
    }

    const lastSeg = segs[segs.length - 1];
    for (const seg of segs) {
      if (!isGhost && seg === lastSeg && seg.length >= 4) {
        // taper the tail over its final two links
        const body = seg.slice(0, seg.length - 2);
        strokeSmooth(body, W);
        const n = seg.length;
        ctx.beginPath();
        ctx.lineWidth = W * 0.60;
        ctx.moveTo(seg[n - 3].x, seg[n - 3].y);
        ctx.lineTo(seg[n - 2].x, seg[n - 2].y);
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = W * 0.42;
        ctx.moveTo(seg[n - 2].x, seg[n - 2].y);
        ctx.lineTo(seg[n - 1].x, seg[n - 1].y);
        ctx.stroke();
      } else {
        strokeSmooth(seg, W);
      }
    }

    // belly stripe
    if (!isGhost && !dead) {
      ctx.strokeStyle = 'rgba(255,255,255,.20)';
      for (const seg of segs) {
        const body = seg === lastSeg && seg.length >= 4 ? seg.slice(0, seg.length - 2) : seg;
        if (body.length > 1) strokeSmooth(body, W * 0.28);
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
    const eo = cell * 0.17, ef = cell * 0.10, er = cell * 0.115;
    for (const s of [-1, 1]) {
      const ex = head.x + fx * ef + px * eo * s;
      const ey = head.y + fy * ef + py * eo * s;
      ctx.fillStyle = PAL.eyeW;
      ctx.beginPath();
      ctx.arc(ex, ey, er, 0, Math.PI * 2);
      ctx.fill();
      if (dead) {
        ctx.strokeStyle = PAL.eyeP;
        ctx.lineWidth = Math.max(1.2, cell * 0.035);
        const k = er * 0.5;
        ctx.beginPath();
        ctx.moveTo(ex - k, ey - k); ctx.lineTo(ex + k, ey + k);
        ctx.moveTo(ex + k, ey - k); ctx.lineTo(ex - k, ey + k);
        ctx.stroke();
      } else if (blink) {
        ctx.strokeStyle = PAL.eyeP;
        ctx.lineWidth = Math.max(1.2, cell * 0.04);
        ctx.beginPath();
        ctx.moveTo(ex - er * 0.6, ey);
        ctx.lineTo(ex + er * 0.6, ey);
        ctx.stroke();
      } else {
        ctx.fillStyle = PAL.eyeP;
        ctx.beginPath();
        ctx.arc(ex + fx * er * 0.35, ey + fy * er * 0.35, er * 0.52, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (!dead && prog.hat !== 'none') drawHat(prog.hat, head.x, head.y);
  }

  // ---------- ambient particles ----------
  const AMB_RATE = { meadow: 1600, sakura: 950, midnight: 1700, tide: 1100 };
  function spawnAmbient(now) {
    const W = cols * cell, H = rows * cell;
    const theme = settings.theme;
    if (theme === 'meadow' || theme === 'sakura') {
      if (ambient.length >= 12) return;
      ambient.push({ kind: theme === 'sakura' ? 'petal' : 'leaf', x: Math.random() * W, y: -cell * 0.4, phase: Math.random() * 6.28 });
    } else if (theme === 'midnight') {
      if (ambient.filter(a => a.kind === 'firefly').length >= 6) return;
      ambient.push({ kind: 'firefly', x: Math.random() * W, y: Math.random() * H, phase: Math.random() * 6.28, born: now });
    } else if (theme === 'tide') {
      if (ambient.length >= 10) return;
      ambient.push({ kind: 'bubble', x: Math.random() * W, y: H + cell * 0.3, phase: Math.random() * 6.28, r: cell * (0.05 + Math.random() * 0.08) });
    }
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
      if (a.kind === 'leaf' || a.kind === 'petal') {
        a.y += dt * cell * 0.0009;
        const x = a.x + Math.sin(now / 1100 + a.phase) * cell * 0.5;
        if (a.y > H + cell * 0.5) { ambient.splice(i, 1); continue; }
        ctx.save();
        ctx.translate(x, a.y);
        ctx.rotate(Math.sin(now / 800 + a.phase) * 0.8);
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = a.kind === 'petal' ? '#f3b8cb' : '#9cbf8e';
        ctx.beginPath();
        ctx.ellipse(0, 0, cell * 0.14, cell * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (a.kind === 'firefly') {
        if (now - a.born > 9000) { ambient.splice(i, 1); continue; }
        a.x += Math.cos(now / 800 + a.phase) * 0.25;
        a.y += Math.sin(now / 700 + a.phase * 1.7) * 0.25;
        const glow = 0.35 + 0.35 * Math.sin(now / 300 + a.phase);
        const fade = Math.min(1, (now - a.born) / 1000, (9000 - (now - a.born)) / 1000);
        ctx.globalAlpha = glow * fade;
        ctx.fillStyle = '#f4d35e';
        ctx.beginPath(); ctx.arc(a.x, a.y, cell * 0.10, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = Math.min(1, glow * fade * 2);
        ctx.fillStyle = '#f8e9a1';
        ctx.beginPath(); ctx.arc(a.x, a.y, cell * 0.045, 0, Math.PI * 2); ctx.fill();
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
  function drawGarden() {
    const wrap = $('gardenWrap');
    if (!wrap) return;
    const blooms = Math.floor(prog.fruitTotal / 10);
    wrap.classList.toggle('hidden', blooms === 0);
    if (!blooms) return;
    const g = $('garden');
    const gx = g.getContext('2d');
    const w = cols * cell, h = 40;
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
    for (let i = 0; i < n; i++) {
      const r = mulberry32(1000 + i * 7919);
      const x = 12 + i * fw + r() * 8;
      const stemH = 13 + r() * 12;
      const color = FLOWER_COLORS[Math.floor(r() * FLOWER_COLORS.length)];
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
      while (acc >= stepMs && state === 'playing') {
        acc -= stepMs;
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
    drawAmbient(now, dt);

    if (player) {
      const kind = FRUIT_KIND[settings.theme] || 'orange';
      for (const f of player.fruits) {
        if (f.ticksLeft != null) {
          const secs = Math.max(1, Math.ceil(f.ticksLeft * stepMs / 1000));
          drawTimedFruit(kind, f.x, f.y, now, f.ticksLeft / ttlTicks, secs, secs <= 1);
        } else {
          drawApple(f.x, f.y, now);
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
  Sound.setRain(settings.rain === 'on');
  applyTheme();
  configureBoard();
  updateScoreUI();
  refreshWardrobe();
  drawGarden();
  requestAnimationFrame(frame);
})();

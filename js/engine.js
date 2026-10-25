/* The Long Lie-In — game engine (pure logic; no DOM). Runs in the browser and in Node (tests/bot).
   Needs world.js (LLI_WORLD) and rooms.js (LLI_ROOMS). Logical play area 256x192. */
(function (root) {
'use strict';
const LW = 256, LH = 192, HW = 6, NH = 42, STEP = 10, WALK = 64, GRAV = 640, JUMP_V = 263, MAXFALL = 420, DT = 1 / 120;
const ARM_T = 0.4, ENTRY_SAFE = 1.0, COYOTE = 0.1, STEER = 0.4, FLOAT_T = 1.2;
const SAVE_KEY = 'lli-save-v2';
const VARIANT_FLAG = { hwb: 'hwb_full', can: 'can_full', torch: 'torch_charged', wcan: 'wcan_full' };
const FOOD_ART = ['cocoa', 'custard', 'crumpet', 'tart', 'pudding', 'milk'];

function create(Wd, Rm) {
  Wd = Wd || root.LLI_WORLD; Rm = Rm || root.LLI_ROOMS;
  const ITEMS = {}; Wd.items.forEach(i => ITEMS[i.id] = i);
  const ACTS = {}; Wd.actions.forEach(a => ACTS[a.id] = a);
  const G = { st: null, events: [], nav: false, invincible: false, W: Wd, R: Rm, ITEMS, ACTS, consts: { LW, LH, HW, NH, STEP, WALK, GRAV, JUMP_V, DT, ARM_T, ENTRY_SAFE } };
  const ev = e => { if (!G.quiet) G.events.push(e); };
  const say = (text, dur = 2.2, kind = 'msg') => { const st = G.st; st.toast = { text, t: dur, kind }; ev({ toast: text }); };
  const sfx = name => ev({ sfx: name });

  /* ---------- state ---------- */
  function fresh() {
    const items = {};
    for (const it of Wd.items) {
      const rid = Object.keys(Rm).find(r => Rm[r].items && Rm[r].items[it.id]);
      if (rid) { const [x, y] = Rm[rid].items[it.id]; items[it.id] = { room: rid, x, y }; } else items[it.id] = { room: null };
    }
    const s = Wd.start, R0 = Rm[s.room];
    return { v: 2, mode: 'play', room: s.room, n: mkN(R0.start[0], R0.start[1], 1), energy: 1, lives: Wd.rules.lives_start,
      pockets: [null, null], items, flags: {}, rides: 0, found: {}, foodIdx: 0, steps: 0, arcadeDone: false,
      t: 0, inv: 0, arm: null, float: null, trans: null, toast: null, rt: 0, en: [], visitPopped: false,
      cuckoo: { i: 0, t: 0, pop: null }, tick: 0, touching: {}, deathAt: null, won: false, arcade: null, block: {} };
  }
  function mkN(x, y, face) { return { x, y, vx: 0, vy: 0, ground: true, face: face || 1, coyote: 0, walkT: 0, still: 0, air: 0, steer: 0 }; }
  G.newGame = function () { G.st = fresh(); enterRoom(G.st.room, false); G.st.steps = 0; return G.st; };
  G.load = function (obj) {
    if (!obj || obj.v !== 2) return false;
    const base = fresh(); G.st = Object.assign(base, obj); G.st.float = null; G.st.trans = null; G.st.touching = {}; G.st.block = {};
    if (G.st.mode === 'arcade') { G.st.mode = 'play'; G.st.arcade = null; }
    resetEnemies(); return true;
  };
  G.serialize = function () { const s = Object.assign({}, G.st); delete s.en; delete s.touching; delete s.trans; delete s.block; return JSON.parse(JSON.stringify(s)); };
  G.canSave = () => G.st && !G.st.float && G.st.mode !== 'title';

  /* ---------- helpers ---------- */
  const has = id => G.st.pockets.includes(id);
  const flag = f => !!G.st.flags[f];
  G.has = has; G.flag = flag;
  function condOK(c) {
    if (!c) return true;
    if (c.flags && !c.flags.every(flag)) return false;
    if (c.not && c.not.some(flag)) return false;
    if (c.carry && !c.carry.every(has)) return false;
    if (c.found && !c.found.every(id => G.st.found[id])) return false;
    return true;
  }
  function actOK(a) {
    if (a.carry && !a.carry.every(has)) return false;
    if (a.flags_all && !a.flags_all.every(flag)) return false;
    if (a.flags_none && a.flags_none.some(flag)) return false;
    return true;
  }
  G.room = () => Rm[G.st.room];
  G.itemState = id => { const f = VARIANT_FLAG[id]; if (!f) return null; const it = ITEMS[id]; const v = it.variants; return flag(f) ? v[1] : v[0]; };
  G.itemHint = id => { const it = ITEMS[id]; const s = G.itemState(id); return (it.hint_by_state && s) ? it.hint_by_state[s] : it.hint; };
  G.foodArt = FOOD_ART;
  G.percent = () => Math.round(Object.keys(G.st.found).length * 100 / Wd.counted.length);

  function platforms() {
    const R = G.room(), out = [];
    for (const p of R.plats) {
      if (p.req && !condOK(p.req)) continue;
      if (p.mover === 'chair') { const c = chairX(); out.push(Object.assign({}, p, { x1: c - p.w / 2, x2: c + p.w / 2 })); continue; }
      out.push(p);
    }
    return out;
  }
  G.platforms = platforms;
  function chairX() { const R = G.room(), m = R.chair; if (!m) return 0; if (flag('rug_stopped')) return m.home; const ph = (G.st.rt * m.speed) % (2 * (m.max - m.min)); return m.max - (ph < m.max - m.min ? ph : 2 * (m.max - m.min) - ph); }
  G.chairX = chairX;
  function walls() { const R = G.room(); return (R.walls || []).filter(w => !w.req || condOK(w.req)); }
  G.walls = walls;
  function supportY(x, feet, cur) {
    let best = null;
    for (const p of platforms()) {
      if (x < p.x1 || x > p.x2) continue;
      if (p.y < feet - STEP - 0.01 || p.y > feet + STEP + 0.01) continue;
      if (p.y < feet - 0.5 && cur && (p.group || 'f') !== (cur.group || 'f')) continue; // no stepping up into another group
      if (best === null || p.y < best.y) best = p;
    }
    return best;
  }
  function platAt(x, y) { return platforms().find(p => x >= p.x1 && x <= p.x2 && Math.abs(p.y - y) < 0.6) || null; }
  G.platAt = platAt;
  function blocked(x, feet) {
    for (const w of walls()) if (x + HW > w.x1 && x - HW < w.x2 && feet > w.y1 + 0.5 && feet - NH < w.y2) return true;
    return false;
  }
  function railClamp(oldX, x, feet) {
    for (const p of platforms()) if (p.rail && feet <= p.y + 0.5 && oldX >= p.x1 - 0.01 && oldX <= p.x2 + 0.01) return Math.max(p.x1, Math.min(p.x2, x));
    return x;
  }

  /* ---------- rooms ---------- */
  function resetEnemies() {
    const R = G.room(); G.st.en = (R.enemies || []).map((e, k) => ({ k, x: e.x != null ? e.x : (e.start === 'far' ? e.x2 : (e.x1 != null ? e.x1 : 128)), y: e.y || 100, dir: e.start === 'far' ? -1 : 1, pause: e.start === 'far' ? (e.pause || 0) : 0, t: -(e.delay || 0), ph: 0, a: 0 }));
  }
  function arrivalFor(dest, src, via) {
    const D = Rm[dest];
    if (via && via.arrive) return via.arrive;
    if (via && via.kind === 'edge') {
      const opp = via.side === 'left' ? 'right' : 'left';
      const back = (D.edges[opp] || []).find(e => e.to === src) || (D.edges[opp] || [])[0];
      const y = back ? back.y : 176; return [opp === 'left' ? HW + 1 : LW - HW - 1, y];
    }
    const sp = (D.spots || []).find(s => s.to === src && !s.local) || (D.spots || []).find(s => s.from === src);
    if (sp) return [sp.ax != null ? sp.ax : (sp.x1 + sp.x2) / 2, sp.y];
    return D.respawn;
  }
  function enterRoom(id, counted = true, pos, face) {
    const st = G.st; const prev = st.room; st.room = id; st.rt = 0; st.chairPrev = null; st.arm = null; st.visitPopped = false; st.touching = {}; st.block = {}; st.dropped = {};
    st.cuckoo.pop = null;
    const R = Rm[id];
    const p = pos || R.start || R.respawn;
    st.n = mkN(p[0], p[1], face || st.n.face); st.n.ground = true;
    resetEnemies();
    st.esafe = ENTRY_SAFE; noArmHere();
    if (counted) {
      st.steps++; st.energy = Math.max(0, st.energy - Wd.rules.drain_per_screen);
      ev({ room: id, from: prev });
    }
    // carry-in effects and automatic actions
    for (const aid of (R.onEnter || [])) { const a = ACTS[aid]; if (a && actOK(a)) doAction(a); }
    if (st.energy <= 0.0001) loseLife();
  }
  G.arrivalFor = arrivalFor;
  function noArmHere() { const s = spotAt(); G.st.noArm = s ? s.id : null; }
  G.noArmHere = noArmHere;
  G.enterRoom = enterRoom;
  function go(dest, via) {
    const src = G.st.room, pos = arrivalFor(dest, src, via);
    const face = via && via.kind === 'edge' ? (via.side === 'left' ? -1 : 1) : G.st.n.face;
    enterRoom(dest, true, pos, face);
  }
  G.respawnPoint = function () {
    const R = G.room(), n = G.st.n;
    for (const s of (R.subRespawn || [])) if (n.x >= s.x1 && n.x <= s.x2 && n.y <= s.ymax) return s.at;
    return R.respawn;
  };

  /* ---------- life ---------- */
  function hit(cost = Wd.rules.hit_cost) {
    const st = G.st;
    if (st.inv > 0 || st.esafe > 0 || st.float || G.nav || G.invincible || st.mode !== 'play') return false;
    st.energy = Math.max(0, st.energy - cost); st.inv = Wd.rules.safe_time; st.arm = null; sfx('hit'); say('OUCH!', 0.9, 'hit');
    if (st.energy <= 0.0001) loseLife();
    return true;
  }
  G.hit = hit;
  function loseLife() {
    const st = G.st; const at = G.respawnPoint();
    st.lives -= 1; sfx('die');
    if (st.lives <= 0) { st.lives = 0; st.mode = 'gameover'; st.deathAt = { room: st.room, at }; ev({ gameover: true }); return; }
    respawn(at); say('OOPS! ' + st.lives + (st.lives === 1 ? ' LIFE LEFT' : ' LIVES LEFT'), 2);
  }
  function respawn(at) { const st = G.st; st.n = mkN(at[0], at[1], st.n.face); st.energy = 1; st.inv = Wd.rules.safe_time; st.arm = null; resetEnemies(); }
  G.continueGame = function () {
    const st = G.st; if (st.mode !== 'gameover') return;
    st.mode = 'play'; st.lives = Wd.rules.lives_start; const d = st.deathAt || { room: st.room, at: G.room().respawn };
    if (d.room !== st.room) enterRoom(d.room, false, d.at); respawn(d.at); st.deathAt = null; ev({ save: true });
  };

  /* ---------- items ---------- */
  function score(id) { const st = G.st; if (Wd.counted.includes(id) && !st.found[id]) { st.found[id] = 1; ev({ found: id }); } }
  function giveTo(id, slot) { const st = G.st; st.pockets[slot] = id; st.items[id] = { held: true }; score(id); }
  function tryPickups() {
    const st = G.st, n = st.n;
    for (const id in st.items) {
      const it = st.items[id]; if (it.room !== st.room || it.held || (st.dropped && st.dropped[id])) continue;
      const touch = Math.abs(it.x - n.x) < HW + 6 && it.y >= n.y - NH - 4 && it.y <= n.y + 3;
      if (!touch) { if (st.block[id]) delete st.block[id]; continue; }
      if (st.block[id]) continue;
      const I = ITEMS[id];
      if (I.pickup_requires && !condOK(I.pickup_requires)) { st.block[id] = 1; say((Rm[st.room].refuse || {})[id] || "CAN'T REACH IT", 2.4); sfx('nope'); continue; }
      const slot = st.pockets.indexOf(null);
      if (slot < 0) { st.block[id] = 1; say('POCKETS FULL', 1.6); sfx('nope'); continue; }
      if (it.y < n.y - 14) st.reach = 0.35; giveTo(id, slot); (I.pickup_sets || []).forEach(f => st.flags[f] = true);
      say(I.name.toUpperCase() + '|' + G.itemHint(id), 3.4, 'item'); sfx('pickup'); ev({ save: true });
    }
    // food
    const F = Wd.food[st.foodIdx % Wd.food.length];
    if (F && F.at === st.room) {
      const [fx, fy] = Rm[st.room].food;
      if (Math.abs(fx - n.x) < HW + 6 && fy >= n.y - NH - 4 && fy <= n.y + 3) {
        st.energy = 1; st.foodIdx = (st.foodIdx + 1) % Wd.food.length; say('YUM! ' + F.name.toUpperCase(), 1.8); sfx('eat'); ev({ save: true });
      }
    }
  }
  G.drop = function (slot) {
    const st = G.st; if (st.mode !== 'play' || st.float || st.trans) return false;
    const id = st.pockets[slot]; if (!id) return false;
    if (!st.n.ground) { say('LAND FIRST', 1); sfx('nope'); return false; }
    const R = G.room(); if (R.noDrop) { say("CAN'T DROP THAT HERE", 1.2); return false; }
    const p = platAt(st.n.x, st.n.y); let y = st.n.y;
    if (p && p.mover) { const below = platforms().filter(q => !q.mover && st.n.x >= q.x1 && st.n.x <= q.x2 && q.y > p.y).sort((a, b) => a.y - b.y)[0]; y = below ? below.y : 176; }
    st.pockets[slot] = null; st.items[id] = { room: st.room, x: st.n.x, y }; st.block[id] = 1; (st.dropped || (st.dropped = {}))[id] = 1; sfx('drop'); ev({ save: true });
    return true;
  };

  /* ---------- actions ---------- */
  function doAction(a, slotHint) {
    const st = G.st; let slot = -1;
    (a.set || []).forEach(f => st.flags[f] = true);
    (a.unset || []).forEach(f => delete st.flags[f]);
    (a.consume || []).forEach(id => { const k = st.pockets.indexOf(id); if (k >= 0) { st.pockets[k] = null; slot = k; } st.items[id] = { room: null, gone: true }; });
    if (a.place) for (const id in a.place) { const k = st.pockets.indexOf(id); if (k >= 0) st.pockets[k] = null; const at = Rm[a.place[id]].placeAt[id]; st.items[id] = { room: a.place[id], x: at[0], y: at[1] }; st.block[id] = 1; }
    (a.give || []).forEach(id => { const k = slot >= 0 ? slot : st.pockets.indexOf(null); if (k >= 0) giveTo(id, k); });
    if (a.set_rides) st.rides = a.set_rides;
    if (a.add_life) st.lives += a.add_life;
    const msg = (Rm[a.at] && Rm[a.at].msgs || {})[a.id]; if (msg) say(msg, 2.6);
    sfx(a.id === 'WIN' ? 'win' : 'magic'); ev({ action: a.id, save: true });
    if (a.win) { st.mode = 'win'; st.won = true; ev({ win: true }); }
  }
  G.doAction = doAction;
  function things() {
    const st = G.st, n = st.n, R = G.room();
    for (const th of (R.things || [])) {
      const inside = n.x + HW > th.x1 && n.x - HW < th.x2 && n.y > th.y1 && n.y - NH < th.y2;
      if (!inside) { delete st.touching[th.id]; continue; }
      if (st.touching[th.id]) continue; st.touching[th.id] = 1;
      let done = false;
      for (const aid of th.acts || []) { const a = ACTS[aid]; if (a && actOK(a)) { doAction(a); done = true; break; } }
      if (!done && th.msg) { let m = th.msg; if (th.msgIf) for (const c of th.msgIf) if (condOK(c.when)) { m = c.msg; break; } if (m) say(m, 2); }
    }
  }

  /* ---------- use spots ---------- */
  function spotAt() {
    const st = G.st, n = st.n, R = G.room();
    if (!n.ground) return null;
    return (R.spots || []).find(s => n.x >= s.x1 && n.x <= s.x2 && Math.abs(n.y - s.y) < 0.6) || null;
  }
  G.spotAt = spotAt;
  function spotReady(s) {
    const st = G.st;
    if (s.req && !condOK(s.req)) return false;
    if (s.ride && !(flag('power_on') && st.rides > 0)) return false;
    if (s.act) { const a = ACTS[s.act]; if (a && !actOK(a)) return false; }
    const c = st.cuckoo.pop; if (c && c.door === s.id && c.t < 2 - 0.5 && !has('teacosy')) return false;
    return true;
  }
  G.spotReady = spotReady;
  function spotRefusal(s) { const st = G.st; if (s.ride && !flag('power_on')) return 'NO POWER'; if (s.ride && st.rides <= 0) return 'NO RIDES LEFT'; return s.lockMsg || null; }
  function useSpot(s) {
    const st = G.st; st.arm = null; sfx('use');
    if (s.ride) { st.rides--; ev({ rides: st.rides }); }
    if (s.kind === 'ladder') { st.n = mkN(s.dest[0], s.dest[1], st.n.face); st.inv = Math.max(st.inv, 0.3); noArmHere(); ev({ save: true }); return; }
    if (s.act === 'balloon') { ev({ save: true, now: true }); const a = ACTS.balloon; (a.consume || []).forEach(id => { const k = st.pockets.indexOf(id); if (k >= 0) st.pockets[k] = null; st.items[id] = { room: null, gone: true }; });
      st.float = { t: 0, from: [st.n.x, st.n.y], to: G.room().floatTo }; sfx('snip'); say('SNIP!', 1); return; }
    if (s.act === 'enter_arcade') { st.mode = 'arcade'; st.arcade = newArcade(); ev({ arcade: true }); return; }
    if (s.act) { const a = ACTS[s.act]; doAction(a); if (a.move_to) { st.trans = { t: 0, dur: 0.9, kind: s.kind, to: a.move_to, via: s }; } return; }
    st.trans = { t: 0, dur: 0.25, kind: s.kind, to: s.to, via: s };
  }

  /* ---------- enemies & hazards ---------- */
  const rnd = k => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  function nBox() { const n = G.st.n; return { x1: n.x - HW + 2, x2: n.x + HW - 2, y1: n.y - NH + 4, y2: n.y }; }
  const overlap = (a, b) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
  G.enemyBox = function (E, e) { const w = E.w || 14, h = E.h || 14; return { x1: e.x - w / 2, x2: e.x + w / 2, y1: e.y - h, y2: e.y }; };
  function updEnemy(E, e, dt) {
    const st = G.st, n = st.n; e.t += dt;
    if (e.t < 0) { e.warn = false; e.active = false; e.x = -999; return; }
    switch (E.type) {
      case 'patrol': case 'moth': {
        if (e.pause > 0) { e.pause -= dt; break; }
        e.x += e.dir * E.speed * dt;
        if (e.x > E.x2) { e.x = E.x2; e.dir = -1; e.pause = E.pause || 0; } if (e.x < E.x1) { e.x = E.x1; e.dir = 1; e.pause = E.pause || 0; }
        e.y = E.y;
        if (E.type === 'moth') { const c = e.t % 4; e.warn = c > 3.0 && c < 3.5; e.y = E.y + (c > 3.5 ? Math.sin((c - 3.5) / 0.5 * Math.PI) * E.dip : 0) + Math.sin(e.t * 6) * 2; }
        if (E.bob) e.y = E.y - Math.abs(Math.sin(e.t * Math.PI / E.bob)) * (E.amp || 0);
        break; }
      case 'fly8': { const a = e.t * 2 * Math.PI / E.period; e.x = E.cx + Math.sin(a) * E.rx; e.y = E.cy + Math.sin(2 * a) * E.ry; e.dir = Math.cos(a) >= 0 ? 1 : -1; break; }
      case 'dart': { const c = e.t % E.period, cyc = Math.floor(e.t / E.period); e.dir = (cyc % 2) ? -1 : 1; e.warn = c < 0.7; e.y = E.y;
        e.active = c >= 0.7; e.x = e.active ? (e.dir > 0 ? -20 + (c - 0.7) * E.speed : LW + 20 - (c - 0.7) * E.speed) : -999; break; }
      case 'drop': { const c = e.t % E.period, cyc = Math.floor(e.t / E.period); e.x = E.x1 + rnd(cyc + E.x1) * (E.x2 - E.x1);
        if (E.track && cyc !== e.cyc) { e.cyc = cyc; e.tx = Math.max(E.x1, Math.min(E.x2, n.x)); } if (E.track) e.x = e.tx != null ? e.tx : e.x;
        e.warn = c < 0.7; const fy = E.y0 + Math.max(0, c - 0.7) * (c - 0.7) * 380; e.y = Math.min(fy, E.floor || 176); e.active = c >= 0.7 && fy < (E.floor || 176) + 2; break; }
      case 'popup': { const c = e.t % E.period; e.x = E.x; const up = c > E.period - E.up; e.warn = c > E.period - E.up - 0.5 && !up; e.active = up; e.y = E.y; e.rise = up ? Math.min(1, (c - (E.period - E.up)) / 0.15) : 0; break; }
      case 'bounce2': { // wall-to-wall bouncing lump
        e.x += e.dir * E.speed * dt; if (e.x > E.x2) { e.x = E.x2; e.dir = -1; } if (e.x < E.x1) { e.x = E.x1; e.dir = 1; }
        e.y = E.y - Math.abs(Math.sin(e.t * Math.PI / E.period)) * E.amp; break; }
      case 'bedsheet': {
        const under = n.x > E.x1 - 6 && n.x < E.x2 + 6 && n.ground && Math.abs(n.vx) < 0.01;
        e.still = under ? (e.still || 0) + dt : 0;
        if (e.swoop > 0) { e.swoop -= dt; const k = e.swoop; e.y = k > 0.9 ? E.y : E.y + Math.sin(Math.min(1, (0.9 - k) / 0.9) * Math.PI) * E.dip; e.warn = k > 0.9; if (e.swoop <= 0) e.y = E.y; break; }
        if (e.still > 1.5) { e.swoop = 1.4; e.still = 0; e.tx = n.x; }
        e.x += e.dir * E.speed * dt; if (e.x > E.x2) { e.x = E.x2; e.dir = -1; } if (e.x < E.x1) { e.x = E.x1; e.dir = 1; }
        e.y = E.y + Math.sin(e.t * 2) * 2; break; }
      case 'swoop': { const c = e.t % E.period; const k = c / E.period; e.dir = 1; e.x = -20 + k * (LW + 40); e.y = E.y + Math.sin(k * Math.PI) * E.dip; e.warn = c < 0.4; break; }
      case 'snap': e.x = E.x; e.y = E.y; e.asleep = flag(E.until); e.snap = !e.asleep && Math.abs(n.x - E.x) < E.range && n.y >= E.y - 30; break;
      case 'fire': e.x = E.x; e.y = E.y; e.out = flag(E.until); break;
      case 'books': e.x = E.x1; break;
      case 'saucers': e.gone = flag(E.until); e.x = E.x; e.y = E.y + Math.sin(e.t * 2) * 6; break;
      case 'snore': { e.open = flag(E.until); const c = e.t % 2.4; e.puff = !e.open && c > 1.4 && c < 2.2; e.warn = !e.open && c > 1.0 && c <= 1.4; e.x = E.x; e.y = E.y; break; }
      case 'vane': { const c = e.t % 3; e.wind = c > 1.7 && c < 2.2; e.gust = c >= 2.2; e.x = E.x; e.y = E.y; break; }
      case 'rug': e.rolling = !flag(E.until); break;
    }
  }
  function enemyHits(E, e, dt) {
    const st = G.st, n = st.n, nb = nBox();
    switch (E.type) {
      case 'patrol': case 'moth': case 'fly8': case 'bounce2': case 'swoop': case 'bedsheet':
        return overlap(nb, G.enemyBox(E, e));
      case 'dart': case 'drop': case 'popup': return e.active && overlap(nb, G.enemyBox(E, e));
      case 'snap': return e.snap && n.x > E.x - E.range && n.x < E.x + E.range && n.y > E.y - 30 && n.y <= E.y + 2;
      case 'fire': return !e.out && n.ground && n.x > E.x1 && n.x < E.x2 && Math.abs(n.y - E.y) < 1;
      case 'books': if (!n.ground || Math.abs(n.y - E.y) > 1 || n.x < E.x1 || n.x > E.x2) { e.t = 0; return false; }
        if (has('umbrella')) { if (e.t > 1.2) { e.t = 0; ev({ sfx: 'boing' }); e.bounce = 0.4; } return false; }
        if (e.t > 1.2) { e.t = 0; return true; } return false;
      case 'saucers': return !e.gone && n.x + HW > E.x1 - 2;
      case 'snore': if (e.puff && n.x > E.x1 && n.x < E.x2 + HW + 2) { if (!G.nav) n.x -= 70 * dt; st.arm = null; } return false;
      case 'vane': if (e.gust && n.x < E.shelter && !G.nav) { n.x -= 60 * dt; if (n.x < HW) n.x = HW; st.arm = null; } return false;
      case 'rug': if (e.rolling && n.ground && Math.abs(n.y - 176) < 0.6 && n.x > E.x1 && !G.nav) { const nx = n.x - E.push * dt; if (!blocked(nx, n.y)) n.x = Math.max(E.x1 - 0.5, nx); st.arm = null; } return false;
    }
    return false;
  }
  function updCuckoo(dt) {
    const st = G.st, C = st.cuckoo, pairs = Wd.cuckoo;
    if (C.pop) {
      C.pop.t -= dt; const R = G.room(), sp = R.spots.find(s => s.id === C.pop.door);
      if (sp && C.pop.t < 1.5 && !has('teacosy') && !G.nav) {
        const n = st.n; if (n.ground && n.x >= sp.x1 - 4 && n.x <= sp.x2 + 4 && Math.abs(n.y - sp.y) < 1 && !C.pop.knocked) {
          C.pop.knocked = true; const d = n.x < (sp.x1 + sp.x2) / 2 ? -1 : 1; let nx = n.x + d * 12; if (blocked(nx, n.y) || nx < HW || nx > LW - HW) nx = n.x - d * 12; n.x = Math.max(HW, Math.min(LW - HW, nx)); st.arm = null; sfx('cuckoo'); say('CUCKOO!', 0.9);
        }
      }
      if (C.pop.t <= 0) { C.pop = null; C.t = 0; C.i = (C.i + 1) % pairs.length; }
      return;
    }
    C.t += dt;
    if (C.t > 10) { C.t = 0; C.i = (C.i + 1) % pairs.length; }
    const pair = pairs[C.i]; if (!pair || G.nav) return;
    if (pair.includes(st.room) && !st.visitPopped && st.rt > 1.5 && C.t > 1) {
      const other = pair[0] === st.room ? pair[1] : pair[0];
      const sp = G.room().spots.find(s => s.to === other && (s.kind === 'back' || s.kind === 'front'));
      if (sp) { C.pop = { door: sp.id, t: 2.0, peek: has('teacosy') }; st.visitPopped = true; sfx('cuckoo'); }
    }
  }

  /* ---------- main step ---------- */
  G.step = function (inp) {
    const st = G.st, dt = DT; if (!st) return;
    inp = inp || {};
    if (st.toast) { st.toast.t -= dt; if (st.toast.t <= 0) st.toast = null; }
    if (st.mode === 'arcade') { stepArcade(inp, dt); return; }
    if (st.mode !== 'play') return;
    st.t += dt; st.rt += dt; st.tick++;
    if (st.inv > 0) st.inv = Math.max(0, st.inv - dt);
    if (st.esafe > 0) st.esafe = Math.max(0, st.esafe - dt);
    if (st.reach > 0) st.reach = Math.max(0, st.reach - dt);
    // transitions (doors, rides, rocket)
    if (st.trans) { st.trans.t += dt; if (st.trans.t >= st.trans.dur) { const tr = st.trans; st.trans = null; go(tr.to, tr.via); } return; }
    if (st.float) { stepFloat(dt); return; }
    const n = st.n, dir = inp.dir || 0;
    const R = G.room();
    if (R.chair && st.chairPrev == null) st.chairPrev = chairX();
    // use spot / jump
    const sp = spotAt();
    if (inp.jump) {
      if (n.ground && !dir && st.arm && st.arm.armed && sp && st.arm.id === sp.id && spotReady(sp)) { useSpot(sp); return; }
      if (n.ground || n.coyote > 0) {
        if (n.ground && !dir && sp && !st.arm?.armed) { const m = spotReady(sp) ? null : spotRefusal(sp); if (m && sp.still) say(m, 1.2); }
        n.vy = -JUMP_V; n.vx = dir * WALK; n.ground = false; n.coyote = 0; n.air = 0; if (dir) n.face = dir; sfx('jump'); st.arm = null;
      }
    }
    const ox = n.x;
    if (n.ground) {
      n.vx = dir * WALK; if (dir) n.face = dir;
      let nx = n.x + n.vx * dt; const cur = platAt(n.x, n.y);
      // mover carry
      if (cur && cur.mover && st.chairPrev != null) nx += chairX() - st.chairPrev;
      nx = railClamp(n.x, nx, n.y);
      if (!blocked(nx, n.y)) {
        const s = supportY(nx, n.y, cur);
        n.x = nx;
        if (s) n.y = s.y; else { n.ground = false; n.vy = 0; n.vx = 0; n.coyote = COYOTE; n.air = 0; }
      }
      n.walkT = dir ? n.walkT + dt : 0;
    } else {
      n.coyote = Math.max(0, n.coyote - dt); n.air += dt;
      if (dir) n.face = dir;
      let vx = n.vx + dir * STEER * WALK; vx = Math.max(-WALK, Math.min(WALK, vx));
      const oy = n.y; n.vy = Math.min(MAXFALL, n.vy + GRAV * dt);
      let nx = n.x + vx * dt; nx = railClamp(n.x, nx, oy);
      if (!blocked(nx, n.y)) n.x = nx; else n.vx = 0;
      let ny = n.y + n.vy * dt;
      if (n.vy > 0) {
        let land = null;
        for (const p of platforms()) if (n.x >= p.x1 && n.x <= p.x2 && oy <= p.y + 0.01 && ny >= p.y && (!land || p.y < land.y)) land = p;
        if (land) { ny = land.y; n.ground = true; n.vy = 0; n.vx = 0; sfx('land'); }
      }
      n.y = ny;
    }
    if (R.chair) st.chairPrev = chairX();
    // edges
    const exitEdge = side => (R.edges[side] || []).find(e => Math.abs(e.y - n.y) < 14);
    if (n.x < HW) { const e = exitEdge('left'); if (e && dir < 0 && (!e.req || condOK(e.req))) { go(e.to, Object.assign({ kind: 'edge', side: 'left' }, e)); return; } if (e && e.req && !condOK(e.req) && e.lockMsg && !st.touching.edgeL) { st.touching.edgeL = 1; say(e.lockMsg, 1.6); } n.x = HW; }
    else if (n.x > LW - HW) { const e = exitEdge('right'); if (e && dir > 0 && (!e.req || condOK(e.req))) { go(e.to, Object.assign({ kind: 'edge', side: 'right' }, e)); return; } if (e && e.req && !condOK(e.req) && e.lockMsg && !st.touching.edgeR) { st.touching.edgeR = 1; say(e.lockMsg, 1.6); } n.x = LW - HW; }
    else { delete st.touching.edgeL; delete st.touching.edgeR; }
    if (n.y > LH + 8) { const pit = (R.pits || []).find(p => n.x >= p.x1 - HW && n.x <= p.x2 + HW); if (pit) { go(pit.to, { kind: 'pit', arrive: pit.arrive }); if (pit.msg) say(pit.msg, 1.5); return; } n.y = 176; n.ground = true; }
    // arming
    const sp2 = spotAt();
    const still = n.ground && !dir && Math.abs(n.x - ox) < 0.001;
    if (st.noArm && (!sp2 || sp2.id !== st.noArm)) st.noArm = null;
    if (sp2 && still && st.noArm === sp2.id) { st.arm = null; }
    else if (sp2 && still) {
      if (!st.arm || st.arm.id !== sp2.id) st.arm = { id: sp2.id, t: 0, armed: false };
      if (spotReady(sp2)) { st.arm.t += dt; if (!st.arm.armed && st.arm.t >= ARM_T) { st.arm.armed = true; sfx('arm'); } }
      else { st.arm.t = 0; st.arm.armed = false; if (!st.arm.told) { st.arm.told = 1; st.arm.lt = 0; } st.arm.lt = (st.arm.lt || 0) + dt; if (st.arm.lt > ARM_T && st.arm.told === 1) { st.arm.told = 2; const m = spotRefusal(sp2); if (m) say(m, 1.4); } }
    } else if (!still) st.arm = null;
    // enemies
    for (const e of st.en) { const E = R.enemies[e.k]; updEnemy(E, e, dt); if (enemyHits(E, e, dt)) hit(); }
    updCuckoo(dt);
    if (st.mode !== 'play') return;
    tryPickups(); things();
  };
  function stepFloat(dt) {
    const st = G.st, f = st.float; f.t += dt; const k = Math.min(1, f.t / FLOAT_T), e = k * k * (3 - 2 * k);
    st.n.x = f.from[0] + (f.to[0] - f.from[0]) * e; st.n.y = f.from[1] + (f.to[1] - f.from[1]) * e - Math.sin(k * Math.PI) * 12; st.n.ground = false;
    for (const en of st.en) updEnemy(G.room().enemies[en.k], en, dt);
    if (f.t >= FLOAT_T) { st.n = mkN(f.to[0], f.to[1], st.n.face); st.float = null; const a = ACTS.ladder_unrolls; if (a && actOK(a)) doAction(a); ev({ save: true, floatDone: true }); }
  }

  /* ---------- arcade (counting sheep) ---------- */
  const AR = { fence: 150, need: 10, lives: 3, speed0: 70 };
  G.AR = AR;
  function newArcade() { return { t: 0, sheep: [], next: 1.2, count: 0, miss: 0, spawned: 0, over: 0, result: null }; }
  function stepArcade(inp, dt) {
    const A = G.st.arcade; A.t += dt;
    if (A.result) { A.over -= dt; if (A.over <= 0 || (inp.jump && A.over < 1.6)) endArcade(); return; }
    A.next -= dt;
    if (A.next <= 0 && A.spawned < AR.need + AR.lives + 4) { A.sheep.push({ x: -16, jt: -1, done: false, ok: false, sp: AR.speed0 + A.count * 5 }); A.spawned++; A.next = Math.max(0.75, 1.5 - A.count * 0.06) + rnd(A.spawned) * 0.5; }
    if (inp.jump) { const s = A.sheep.find(s => s.jt < 0 && !s.done); if (s) { s.jt = 0; sfx('jump'); } }
    for (const s of A.sheep) {
      s.x += s.sp * dt;
      if (s.jt >= 0) { s.jt += dt; if (s.jt > 0.5) s.jt = -2; }
      if (!s.done && s.x >= AR.fence - 4) {
        const airborne = s.jt >= 0;
        if (airborne) { s.done = true; s.ok = true; A.count++; sfx('pickup'); }
        else { s.done = true; s.ok = false; s.bonk = 0.6; A.miss++; sfx('nope'); }
      }
      if (s.bonk) s.bonk = Math.max(0, s.bonk - dt);
    }
    A.sheep = A.sheep.filter(s => s.x < 280);
    if (A.count >= AR.need) { A.result = 'win'; A.over = 3.5; if (!G.st.arcadeDone) { G.st.arcadeDone = true; G.st.flags.arcade_done = true; G.st.lives += 1; A.bonus = true; sfx('win'); } }
    else if (A.miss >= AR.lives) { A.result = 'lose'; A.over = 2.5; sfx('die'); }
  }
  function endArcade() { const st = G.st; st.mode = 'play'; st.arcade = null; const R = G.room(); const sp = R.spots.find(s => s.act === 'enter_arcade'); st.n = mkN((sp.x1 + sp.x2) / 2, sp.y, 1); st.arm = null; st.esafe = ENTRY_SAFE; noArmHere(); ev({ arcadeEnd: true, save: true }); }
  G.endArcade = endArcade;
  G.hint = function () { return null; };
  G.SAVE_KEY = SAVE_KEY;
  return G;
}
root.LLI_ENGINE = { create, consts: { LW, LH, HW, NH, STEP, WALK, GRAV, JUMP_V, DT, ARM_T, SAVE_KEY } };
if (typeof module !== 'undefined') module.exports = root.LLI_ENGINE;
})(typeof window !== 'undefined' ? window : globalThis);

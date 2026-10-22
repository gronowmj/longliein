/* The Long Lie-In — playable test room (the v3 hall). Controls + jumping only.
   Logical play area 256x192; art is drawn as vectors (room space 512x384) at device resolution. */
(function () {
'use strict';
const V = window.LLI_V3, HALL = window.LLI_V3_HALL, S = HALL.SPECTRUM;
const FONT = '"Bungee", system-ui, sans-serif';
const LW = 256, LH = 192, RU = 2;                 // logical size, room units per logical unit
const SAVE_KEY = 'lli-testroom-v1', MUTE_KEY = 'lli-muted';

// ---------- world ----------
const PLAT = HALL.HALL_PLATFORMS.map(p => ({ x1: p.x1 / RU, x2: p.x2 / RU, y: p.y / RU, name: p.name, solid: /stair|landing/.test(p.name) }));
const HW = 6, NH = 42, WALL_HW = 5, STEP = 10;     // Norris half-width, height, step-up height
const WALK = 64, GRAV = 640, JUMP_V = 263;          // units/s, units/s^2 (apex ~54 units, arc ~52 units long)
const DT = 1 / 120;
const MOTH = { x1: 34, x2: 170, y: 106, speed: 30, hw: 9, top: 16, bot: 2 };
const ITEM_HW = 7, ITEM_H = 14;

function freshState() {
  return {
    v: 1, t: 0,
    n: { x: 40, y: 176, vx: 0, vy: 0, ground: true, face: 1, jumping: false, airT: 0, walkT: 0, idleT: 0, landT: 0, fallFrom: 176 },
    energy: 1, lives: 3, solved: 0, inv: 0, flash: 0,
    pockets: [null, null],
    items: [{ key: 'cocoa', x: 103, y: 136, held: false, block: false }, { key: 'umbrella', x: 158, y: 89, held: false, block: false }],
    moth: { x: 120, dir: -1 },
    paused: null
  };
}
let st = freshState();
let toast = { text: '', t: 0 };
function say(text, t = 1.4) { toast = { text, t }; }

// ---------- audio (WebAudio, unlocked on first touch) ----------
let ac = null, master = null, muted = localStorage.getItem(MUTE_KEY) === '1';
function unlockAudio() {
  try {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ac = new AC(); master = ac.createGain(); master.gain.value = 0.6; master.connect(ac.destination);
      const b = ac.createBuffer(1, 1, 22050), s = ac.createBufferSource(); s.buffer = b; s.connect(ac.destination); s.start(0);
    }
    if (ac.state !== 'running') ac.resume();
  } catch (e) { /* audio is optional */ }
}
function live() { return ac && master && !muted && ac.state === 'running'; }
function tone(type, f0, f1, dur, vol, delay = 0) {
  if (!live()) return;
  const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.03);
}
function noise(dur, vol) {
  if (!live()) return;
  const n = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = b; g.gain.value = vol; s.connect(g); g.connect(master); s.start();
}
const SFX = {
  jump() { tone('square', 280, 760, 0.16, 0.09); },
  land() { tone('triangle', 190, 55, 0.1, 0.3); },
  pickup() { tone('square', 660, 660, 0.06, 0.08); tone('square', 990, 990, 0.09, 0.08, 0.07); },
  drop() { tone('square', 700, 330, 0.12, 0.07); },
  hit() { noise(0.18, 0.25); tone('sawtooth', 420, 70, 0.3, 0.12); },
  click() { tone('square', 520, 520, 0.03, 0.05); }
};

// ---------- canvas + layout ----------
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
const safeEl = document.getElementById('safe');
let L = null, hallCache = null;
function px(v) { return parseFloat(v) || 0; }
function layout() {
  const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 3);
  const cs = getComputedStyle(safeEl);
  const ins = { t: px(cs.paddingTop), r: px(cs.paddingRight), b: px(cs.paddingBottom), l: px(cs.paddingLeft) };
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  const ux = ins.l, uy = ins.t, uw = W - ins.l - ins.r, uh = H - ins.t - ins.b, gap = 6, minPanel = 92;
  let ph = uh, pw = ph * 4 / 3;
  if (uw - pw - 2 * gap < 2 * minPanel) { pw = Math.max(160, uw - 2 * gap - 2 * minPanel); ph = pw * 3 / 4; }
  const play = { x: Math.round(ux + (uw - pw) / 2), y: Math.round(uy + (uh - ph) / 2), w: Math.round(pw), h: Math.round(ph) };
  const side = (uw - play.w) / 2 - gap;
  const k = Math.min(side / 120, uh / 384);
  const left = { x: ux + (side - 120 * k) / 2, y: uy + (uh - 384 * k) / 2, k };
  const right = { x: play.x + play.w + gap + (side - 120 * k) / 2, y: left.y, k };
  L = { W, H, dpr, ins, play, left, right, side, gap };
  // touch regions (CSS px). Movement/jump regions are generous: whole lower panel area out to the screen edge.
  const D = (p, r) => ({ x: p.x + r[0] * p.k, y: p.y + r[1] * p.k, w: r[2] * p.k, h: r[3] * p.k });
  L.vis = {
    left: D(left, [2, 252, 56, 128]), right: D(left, [62, 252, 56, 128]),
    p0: D(right, [8, 28, 104, 72]), p1: D(right, [8, 104, 104, 72]),
    pause: D(right, [4, 194, 54, 48]), mute: D(right, [62, 194, 54, 48]), jump: D(right, [2, 252, 116, 128])
  };
  const lowY = left.y + 240 * left.k, midL = left.x + 60 * left.k;
  L.hit = {
    left: { x: 0, y: lowY, w: midL, h: H - lowY },
    right: { x: midL, y: lowY, w: play.x - midL, h: H - lowY },
    jump: { x: play.x + play.w, y: right.y + 248 * right.k, w: W - play.x - play.w, h: H - (right.y + 248 * right.k) },
    pause: grow(L.vis.pause, 3), mute: grow(L.vis.mute, 3), p0: grow(L.vis.p0, 2), p1: grow(L.vis.p1, 2)
  };
  // cache the room background at device resolution
  hallCache = document.createElement('canvas');
  hallCache.width = Math.round(play.w * dpr); hallCache.height = Math.round(play.h * dpr);
  const hc = hallCache.getContext('2d'); HALL.drawHall(hc, 0, 0, hallCache.width / 512);
}
function grow(r, d) { return { x: r.x - d, y: r.y - d, w: r.w + 2 * d, h: r.h + 2 * d }; }
function inR(r, x, y) { return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h; }
function portrait() { return L && L.H > L.W; }

// ---------- input: pointer events (multi-touch) + keyboard ----------
const pointers = new Map();
const keys = new Set();
let jumpBuf = 0;
function regionAt(x, y) { for (const k of ['jump', 'left', 'right', 'pause', 'mute', 'p0', 'p1']) if (inR(L.hit[k], x, y)) return k; return null; }
function press(region) {
  if (st.paused) { if (region === 'mute') toggleMute(); else resume(); return; }
  if (region === 'jump') jumpBuf = 0.15;
  else if (region === 'pause') pause('user');
  else if (region === 'mute') toggleMute();
  else if (region === 'p0' || region === 'p1') dropPocket(region === 'p0' ? 0 : 1);
}
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); unlockAudio();
  try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (!portrait()) press(regionAt(e.clientX, e.clientY));
});
cv.addEventListener('pointermove', e => { const p = pointers.get(e.pointerId); if (p) { p.x = e.clientX; p.y = e.clientY; } });
const lift = e => { pointers.delete(e.pointerId); };
cv.addEventListener('pointerup', e => { lift(e); unlockAudio(); });
cv.addEventListener('pointercancel', lift);
cv.addEventListener('lostpointercapture', lift);
// stop iOS gestures: double-tap zoom, pinch, rubber-band, callouts, selection
const stop = e => { if (e.cancelable) e.preventDefault(); };
for (const ev of ['touchstart', 'touchmove', 'touchend']) document.addEventListener(ev, stop, { passive: false });
for (const ev of ['gesturestart', 'gesturechange', 'gestureend', 'dblclick', 'contextmenu', 'selectstart']) document.addEventListener(ev, stop, { passive: false });
document.addEventListener('touchend', unlockAudio, { passive: true });
const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'jump', ArrowUp: 'jump', KeyW: 'jump' };
window.addEventListener('keydown', e => {
  unlockAudio();
  const k = KEYMAP[e.code];
  if (k) { e.preventDefault(); if (!e.repeat) { keys.add(k); if (k === 'jump') press('jump'); } return; }
  if (e.repeat) return;
  if (e.code === 'KeyP' || e.code === 'Escape') { st.paused ? resume() : pause('user'); }
  else if (e.code === 'KeyM') toggleMute();
  else if (e.code === 'Digit1') press('p0');
  else if (e.code === 'Digit2') press('p1');
});
window.addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) keys.delete(k); });
window.addEventListener('blur', () => { keys.clear(); pointers.clear(); });
function held(name) {
  if (keys.has(name)) return true;
  for (const p of pointers.values()) if (inR(L.hit[name], p.x, p.y)) return true;
  return false;
}

// ---------- pause / save / resume ----------
function pause(why) { if (st.paused) return; st.paused = why; pointers.clear(); keys.clear(); jumpBuf = 0; if (why === 'user') SFX.click(); save(); }
function resume() { st.paused = null; SFX.click(); save(); }
function toggleMute() { muted = !muted; localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); if (!muted) { unlockAudio(); SFX.click(); } }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(st)); } catch (e) { /* storage full or blocked */ } }
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (s && s.v === 1 && s.n && s.items) {
      st = Object.assign(freshState(), s);
      // iOS closed the app while it was auto-paused: carry on silently from the same moment.
      if (st.paused !== 'user') st.paused = null;
    }
  } catch (e) { st = freshState(); }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { pause('auto'); save(); } });
window.addEventListener('pagehide', () => { pause('auto'); save(); });
window.addEventListener('beforeunload', save);

// ---------- physics ----------
function platformsAt(x) { return PLAT.filter(p => x >= p.x1 && x <= p.x2); }
function supportY(x, feet) {           // highest walkable top within one step of the feet
  let best = null;
  for (const p of platformsAt(x)) if (p.y >= feet - STEP && p.y <= feet + STEP && (best === null || p.y < best)) best = p.y;
  return best;
}
function blocked(x, feet, air) {        // solid stair/landing columns act as walls below their tops
  for (const p of PLAT) {
    if (!p.solid) continue;
    if (x + WALL_HW > p.x1 && x - WALL_HW < p.x2 && feet > p.y + (air ? 0.5 : STEP)) return true;
  }
  return false;
}
function step(dt) {
  const n = st.n;
  st.t += dt; jumpBuf = Math.max(0, jumpBuf - dt);
  st.inv = Math.max(0, st.inv - dt); st.flash = Math.max(0, st.flash - dt); n.landT = Math.max(0, n.landT - dt);
  const dir = (held('right') ? 1 : 0) - (held('left') ? 1 : 0);
  if (n.ground) {
    if (jumpBuf > 0) {                  // fixed arc, direction committed at take-off
      jumpBuf = 0; n.ground = false; n.jumping = true; n.airT = 0; n.vy = -JUMP_V; n.vx = dir * WALK; n.fallFrom = n.y;
      if (dir) n.face = dir; SFX.jump();
    } else { n.vx = dir * WALK; if (dir) n.face = dir; }
  }
  // horizontal
  if (n.vx) {
    let nx = Math.max(HW, Math.min(LW - HW, n.x + n.vx * dt));
    if (blocked(nx, n.y, !n.ground)) { nx = n.x; if (!n.ground) n.vx = 0; }
    n.x = nx;
  }
  if (n.ground) {
    if (n.vx) { n.walkT += dt; n.idleT = 0; } else { n.walkT = 0; n.idleT += dt; }
    const sy = supportY(n.x, n.y);
    if (sy === null) { n.ground = false; n.jumping = false; n.vx = 0; n.vy = 0; n.airT = 0; n.fallFrom = n.y; }   // walked off: drop straight down
    else n.y = sy;
  } else {
    n.airT += dt; n.idleT = 0;
    const prev = n.y; n.vy = Math.min(n.vy + GRAV * dt, 420); let ny = n.y + n.vy * dt;
    if (n.vy > 0) {
      let land = null;
      for (const p of platformsAt(n.x)) if (prev <= p.y + 0.01 && ny >= p.y && (land === null || p.y < land)) land = p.y;
      if (land !== null) {
        ny = land; n.ground = true; n.vy = 0; n.vx = 0; n.jumping = false; n.landT = 0.09;   // no fall damage
        SFX.land();
      }
    }
    n.y = ny;
  }
  // moth patrol
  const m = st.moth; m.x += m.dir * MOTH.speed * dt;
  if (m.x > MOTH.x2) { m.x = MOTH.x2; m.dir = -1; } if (m.x < MOTH.x1) { m.x = MOTH.x1; m.dir = 1; }
  const my = mothY();
  if (st.inv <= 0 && n.x + HW > m.x - MOTH.hw && n.x - HW < m.x + MOTH.hw && n.y - NH < my - MOTH.bot && n.y > my - MOTH.top) {
    st.energy = Math.max(0, st.energy - 0.2); st.inv = 1.5; st.flash = 0.3; SFX.hit(); say('OUCH!', 0.8);
    if (st.energy <= 0.001) {
      st.lives -= 1; st.energy = 1;
      if (st.lives <= 0) { st.lives = 3; say('TEST ROOM: LIVES RESET', 2); } else say('LIFE LOST', 1.5);
    }
  }
  // pickups: walk into an item while a pocket is free
  for (const it of st.items) {
    if (it.held) continue;
    const touch = n.x + HW > it.x - ITEM_HW && n.x - HW < it.x + ITEM_HW && n.y - NH < it.y && n.y > it.y - ITEM_H;
    if (!touch) { it.block = false; continue; }
    if (it.block) continue;
    const slot = st.pockets.indexOf(null);
    if (slot < 0) { if (toast.t <= 0) say('POCKETS FULL', 1.2); it.block = true; continue; }
    st.pockets[slot] = it.key; it.held = true; SFX.pickup(); say(V.OBJECT_NAMES[it.key].toUpperCase(), 1);
  }
  toast.t = Math.max(0, toast.t - dt);
}
function mothY() { return MOTH.y + Math.sin(st.t * 3) * 5; }
function dropPocket(i) {
  const key = st.pockets[i]; if (!key) return;
  const n = st.n;
  if (!n.ground) { say('LAND FIRST', 1); return; }
  const it = st.items.find(o => o.key === key);
  it.held = false; it.x = Math.max(ITEM_HW, Math.min(LW - ITEM_HW, n.x)); it.y = n.y; it.block = true;
  st.pockets[i] = null; SFX.drop();
}

// ---------- drawing ----------
function pose() {
  const n = st.n;
  if (!n.ground) return n.jumping && n.airT < 0.08 ? 'jump1' : (n.vy < 0 ? 'jump2' : 'jump3');
  if (n.landT > 0) return 'jump1';
  if (n.vx) return 'walk' + (1 + Math.floor(n.walkT * 8) % 4);
  const t = n.idleT;
  if (t > 5 && (t - 5) % 9 < 1.8) return 'yawn';
  return (t % 3.3) > 3.12 ? 'blink' : 'idle';
}
function label(txt, x, y, size, col, align = 'center') {
  ctx.font = `${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(txt, x, y);
}
function frame(x, y, w, h, col, lw) { ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw); }
function tri(pts, col) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }
function button(r, kind, down) {
  const col = { left: S.b, right: S.b, jump: S.r, pause: S.m, mute: S.m }[kind], hi = { left: S.B, right: S.B, jump: S.R, pause: S.M, mute: S.M }[kind];
  const d = down ? 4 : 0, k = 1;
  ctx.fillStyle = col; ctx.fillRect(r.x, r.y + 5, r.w, r.h - 5);
  ctx.fillStyle = down ? S.W : hi; ctx.fillRect(r.x, r.y + d, r.w, r.h - 5);
  frame(r.x, r.y + d, r.w, r.h - 5, S.K, 1.5);
  const cx = r.x + r.w / 2, cy = r.y + d + (r.h - 5) / 2, u = (kind === 'jump' ? Math.min(r.w / 116, r.h / 128) * 1.15 : Math.min(r.w, r.h) / 56), ink = down ? col : S.W;
  if (kind === 'left' || kind === 'right') {
    const s = kind === 'left' ? -1 : 1; tri([[cx + s * 13 * u, cy], [cx - s * 10 * u, cy - 17 * u], [cx - s * 10 * u, cy + 17 * u]], ink);
  } else if (kind === 'jump') {
    tri([[cx, cy - 30 * u], [cx + 18 * u, cy - 10 * u], [cx - 18 * u, cy - 10 * u]], down ? col : S.Y);
    label('JUMP', cx, cy + 16 * u, Math.round(22 * u), down ? col : S.Y);
  } else if (kind === 'pause') {
    ctx.fillStyle = ink; ctx.fillRect(cx - 9 * u, cy - 10 * u, 6 * u, 20 * u); ctx.fillRect(cx + 3 * u, cy - 10 * u, 6 * u, 20 * u);
  } else if (kind === 'mute') {
    tri([[cx - 12 * u, cy - 5 * u], [cx - 6 * u, cy - 5 * u], [cx + 1 * u, cy - 12 * u], [cx + 1 * u, cy + 12 * u], [cx - 6 * u, cy + 5 * u], [cx - 12 * u, cy + 5 * u]], ink);
    ctx.lineWidth = 2.4 * u; ctx.strokeStyle = ink; ctx.lineCap = 'butt';
    if (muted) { ctx.beginPath(); ctx.moveTo(cx + 5 * u, cy - 6 * u); ctx.lineTo(cx + 13 * u, cy + 6 * u); ctx.moveTo(cx + 13 * u, cy - 6 * u); ctx.lineTo(cx + 5 * u, cy + 6 * u); ctx.stroke(); }
    else { for (const rr of [6, 11]) { ctx.beginPath(); ctx.arc(cx + 1 * u, cy, rr * u, -0.8, 0.8); ctx.stroke(); } }
  }
}
function panels() {
  const A = L.left, k = A.k, Lx = v => A.x + v * k, Ly = v => A.y + v * k;
  ctx.fillStyle = S.K;
  frame(Lx(0), Ly(0), 120 * k, 240 * k, S.b, 2); frame(Lx(4), Ly(4), 112 * k, 232 * k, S.b, 1);
  label('ENERGY', Lx(60), Ly(18), Math.round(14 * k), S.M);
  V.drawCandle(ctx, Lx(60), Ly(126), 0.42 * k, st.energy, st.t * 7);
  label('LIVES', Lx(60), Ly(144), Math.round(14 * k), S.C);
  for (let i = st.lives - 1; i >= 0; i--) V.drawNorrisHead(ctx, Lx(60 + (i - (st.lives - 1) / 2) * 30), Ly(176), 0.38 * k);
  label('SOLVED', Lx(60), Ly(198), Math.round(14 * k), S.Y);
  label(st.solved + '%', Lx(60), Ly(222), Math.round(21 * k), S.W);
  button(L.vis.left, 'left', held('left') && !st.paused); button(L.vis.right, 'right', held('right') && !st.paused);
  const B = L.right, Rx = v => B.x + v * B.k, Ry = v => B.y + v * B.k;
  frame(Rx(0), Ry(0), 120 * B.k, 184 * B.k, S.b, 2); frame(Rx(4), Ry(4), 112 * B.k, 176 * B.k, S.b, 1);
  label('POCKETS', Rx(60), Ry(18), Math.round(14 * B.k), S.M);
  [L.vis.p0, L.vis.p1].forEach((r, i) => {
    ctx.fillStyle = S.K; ctx.fillRect(r.x, r.y, r.w, r.h); frame(r.x, r.y, r.w, r.h, S.m, 1.5);
    const key = st.pockets[i];
    if (!key) { label('EMPTY', r.x + r.w / 2, r.y + r.h / 2, Math.round(11 * B.k), S.b); return; }
    V.drawObject(ctx, key, r.x + r.w / 2, r.y + r.h - 22 * B.k, 0.5 * B.k);
    label(V.OBJECT_NAMES[key].toUpperCase(), r.x + r.w / 2, r.y + r.h - 11 * B.k, Math.round(11 * B.k), S.W);
  });
  button(L.vis.pause, 'pause', false); button(L.vis.mute, 'mute', false);
  button(L.vis.jump, 'jump', held('jump') && !st.paused);
}
function render() {
  const { dpr, play: P } = L;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = S.K; ctx.fillRect(0, 0, L.W, L.H);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(hallCache, P.x, P.y, P.w, P.h);
  ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip();
  ctx.translate(P.x, P.y); ctx.scale(P.w / 512, P.w / 512);
  for (const it of st.items) if (!it.held) V.drawObject(ctx, it.key, it.x * RU, it.y * RU, 0.32);
  V.drawMoth(ctx, Math.floor(st.t * 8) % 2, st.moth.x * RU, mothY() * RU, 0.5, st.moth.dir);
  const n = st.n;
  if (!(st.inv > 0 && Math.floor(st.inv * 12) % 2 === 0)) V.drawNorris(ctx, pose(), n.x * RU, n.y * RU + 2, 0.6, n.face);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.translate(P.x, P.y);
  if (st.flash > 0) { ctx.globalAlpha = Math.min(1, st.flash / 0.3) * 0.35; ctx.fillStyle = S.R; ctx.fillRect(0, 0, P.w, P.h); ctx.globalAlpha = 1; }
  const u = P.w / 512;
  if (toast.t > 0 && !st.paused) {
    ctx.globalAlpha = Math.min(1, toast.t * 3); ctx.font = `${Math.round(20 * u)}px ${FONT}`;
    const tw = ctx.measureText(toast.text).width + 24 * u; ctx.fillStyle = S.K; ctx.fillRect(P.w / 2 - tw / 2, 150 * u, tw, 34 * u);
    frame(P.w / 2 - tw / 2, 150 * u, tw, 34 * u, S.Y, 1.5); label(toast.text, P.w / 2, 168 * u, Math.round(20 * u), S.Y); ctx.globalAlpha = 1; }
  if (st.paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, P.w, P.h);
    label('PAUSED', P.w / 2, P.h * 0.42, Math.round(48 * u), S.M);
    label('TAP TO PLAY', P.w / 2, P.h * 0.58, Math.round(22 * u), S.C);
  }
  ctx.restore();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  panels();
}

// ---------- loop ----------
let last = 0, acc = 0, saveT = 0;
function frameLoop(ts) {
  const dt = Math.min(0.1, last ? (ts - last) / 1000 : 0); last = ts;
  if (!portrait() && !st.paused && document.visibilityState === 'visible') {
    acc += dt;
    while (acc >= DT) { step(DT); acc -= DT; }
    saveT += dt; if (saveT > 2) { saveT = 0; save(); }
  } else acc = 0;
  render();
  requestAnimationFrame(frameLoop);
}
window.addEventListener('resize', () => { layout(); });
window.addEventListener('orientationchange', () => setTimeout(layout, 120));
load();
const start = () => { layout(); requestAnimationFrame(frameLoop); };
const fontReady = document.fonts && document.fonts.load ? document.fonts.load('16px "Bungee"') : Promise.resolve();
Promise.race([fontReady, new Promise(r => setTimeout(r, 1500))]).then(start, start);

// read-only hook for automated tests
window.LLI_TEST = { get state() { return JSON.parse(JSON.stringify(st)); }, get layout() { return L; }, PLAT, place(x, y) { Object.assign(st.n, { x, y, ground: true, vx: 0, vy: 0 }); } };
})();

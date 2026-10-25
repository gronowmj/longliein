/* The Long Lie-In — browser front end: layout, touch/keyboard input, HUD, sound, screens, saving.
   Game rules live in engine.js; drawing lives in art.js. Logical play area 256x192 (room space 512x384). */
(function () {
'use strict';
const V = window.LLI_V3, HALL = window.LLI_V3_HALL, S = HALL.SPECTRUM, ART = window.LLI_ART, ENG = window.LLI_ENGINE;
const FONT = '"Bungee", system-ui, sans-serif';
const G = ENG.create(window.LLI_WORLD, window.LLI_ROOMS);
const DT = ENG.consts.DT, SAVE_KEY = G.SAVE_KEY, MUTE_KEY = 'lli-muted';
let ui = 'title', uiT = 0, idleT = 0, confirmNew = 0, paused = null, winAt = 0, introT = 0, lowT = 0, wasLow = false, lowShown = false;
const INTRO = 1.6, LOW = 0.1, GAMEOVER_GUARD = 1.5;
let hasSave = false;

/* ---------- audio ---------- */
let ac = null, master = null, muted = localStorage.getItem(MUTE_KEY) === '1';
function unlockAudio() {
  try {
    if (!ac) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ac = new AC(); master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination);
      const b = ac.createBuffer(1, 1, 22050), s = ac.createBufferSource(); s.buffer = b; s.connect(ac.destination); s.start(0); }
    if (ac.state !== 'running') ac.resume();
  } catch (e) { /* optional */ }
}
const live = () => ac && master && !muted && ac.state === 'running';
function tone(type, f0, f1, dur, vol, delay = 0) { if (!live()) return; const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.03); }
function noise(dur, vol) { if (!live()) return; const n = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = b; g.gain.value = vol; s.connect(g); g.connect(master); s.start(); }
const SFX = {
  jump() { tone('square', 280, 760, 0.14, 0.07); }, land() { tone('triangle', 190, 55, 0.09, 0.25); },
  pickup() { tone('square', 660, 660, 0.06, 0.07); tone('square', 990, 990, 0.09, 0.07, 0.07); }, drop() { tone('square', 700, 330, 0.12, 0.06); },
  hit() { noise(0.18, 0.22); tone('sawtooth', 420, 70, 0.3, 0.1); }, die() { for (let i = 0; i < 5; i++) tone('square', 500 - i * 80, 420 - i * 80, 0.12, 0.07, i * 0.12); },
  eat() { for (let i = 0; i < 3; i++) tone('square', 300 + i * 120, 300 + i * 120, 0.05, 0.07, i * 0.07); }, magic() { for (let i = 0; i < 6; i++) tone('square', 523 * Math.pow(1.122, i), 523 * Math.pow(1.122, i), 0.06, 0.06, i * 0.05); },
  win() { SFX.magic(); }, nope() { tone('square', 160, 120, 0.15, 0.08); }, arm() { tone('sine', 880, 1320, 0.12, 0.06); }, use() { tone('triangle', 330, 990, 0.18, 0.12); },
  cuckoo() { tone('sine', 784, 784, 0.16, 0.12); tone('sine', 622, 622, 0.22, 0.12, 0.2); }, boing() { tone('triangle', 200, 600, 0.2, 0.15); }, snip() { noise(0.05, 0.2); tone('square', 1200, 1800, 0.05, 0.05); },
  click() { tone('square', 520, 520, 0.03, 0.04); }, low() { tone('square', 880, 880, 0.06, 0.06); tone('square', 660, 660, 0.08, 0.06, 0.1); }
};
// beeper tunes (original): [midi note or 0 for rest, length in eighths]
const TUNES = {
  title: { bpm: 96, notes: [[67, 2], [64, 1], [65, 1], [67, 2], [72, 2], [71, 2], [69, 1], [67, 1], [65, 4], [64, 2], [62, 1], [64, 1], [65, 2], [69, 2], [67, 2], [65, 1], [64, 1], [62, 4],
    [60, 2], [64, 1], [67, 1], [72, 3], [71, 1], [69, 2], [67, 2], [65, 2], [62, 2], [64, 2], [65, 1], [62, 1], [60, 6], [0, 2]] },
  win: { bpm: 150, notes: [[72, 1], [72, 1], [67, 1], [69, 1], [72, 2], [76, 2], [74, 1], [72, 1], [69, 1], [67, 1], [69, 4], [65, 1], [67, 1], [69, 1], [72, 1], [74, 2], [72, 1], [74, 1],
    [76, 2], [79, 2], [77, 1], [76, 1], [74, 1], [72, 1], [72, 4], [0, 2]] }
};
let music = null; // { name, i, next }
function playMusic(name) { if (music && music.name === name) return; music = { name, i: 0, next: 0 }; }
function stopMusic() { music = null; }
function tickMusic() {
  if (!music || !live()) return; const T = TUNES[music.name], e = 60 / T.bpm / 2;
  if (music.next < ac.currentTime) music.next = ac.currentTime + 0.05;
  while (music.next < ac.currentTime + 0.25) { const [m, l] = T.notes[music.i]; if (m) { const f = 440 * Math.pow(2, (m - 69) / 12), t = music.next - ac.currentTime;
      tone('square', f, f, l * e * 0.85, 0.045, t); if (music.name === 'win') tone('square', f / 2, f / 2, e * 0.4, 0.03, t); }
    music.next += l * e; music.i = (music.i + 1) % T.notes.length; }
}

/* ---------- layout ---------- */
const cv = document.getElementById('game'), ctx = cv.getContext('2d'), safeEl = document.getElementById('safe');
let L = null;
const px = v => parseFloat(v) || 0;
function grow(r, d) { return { x: r.x - d, y: r.y - d, w: r.w + 2 * d, h: r.h + 2 * d }; }
function inR(r, x, y) { return r && x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h; }
const SNAP_KEEP = 0.94;
function layout() {
  const W = window.innerWidth, H = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 3), cs = getComputedStyle(safeEl);
  const ins = { t: px(cs.paddingTop), r: px(cs.paddingRight), b: px(cs.paddingBottom), l: px(cs.paddingLeft) };
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  const ux = ins.l, uy = ins.t, uw = W - ins.l - ins.r, uh = H - ins.t - ins.b, gap = 6, minPanel = 92;
  let ph = uh, pw = ph * 4 / 3; if (uw - pw - 2 * gap < 2 * minPanel) { pw = Math.max(160, uw - 2 * gap - 2 * minPanel); ph = pw * 3 / 4; }
  // p5: snap so each room unit (512x384 grid) is a whole number of device pixels where possible
  // N1: ...but only when that keeps at least SNAP_KEEP of the space; otherwise keep the smooth scale (correct size beats crispness)
  { const kk = Math.floor(ph * dpr / 384), sh = kk * 384 / dpr; if (kk >= 1 && sh >= ph * SNAP_KEEP) { ph = sh; pw = ph * 4 / 3; } }
  const play = { x: Math.round(ux + (uw - pw) / 2), y: Math.round(uy + (uh - ph) / 2), w: pw, h: ph };
  const side = (uw - play.w) / 2 - gap, k = Math.min(side / 120, uh / 384);
  const left = { x: ux + (side - 120 * k) / 2, y: uy + (uh - 384 * k) / 2, k }, right = { x: play.x + play.w + gap + (side - 120 * k) / 2, y: left.y, k };
  L = { W, H, dpr, ins, play, left, right, side, gap };
  const D = (p, r) => ({ x: p.x + r[0] * p.k, y: p.y + r[1] * p.k, w: r[2] * p.k, h: r[3] * p.k });
  L.vis = { left: D(left, [2, 252, 56, 128]), right: D(left, [62, 252, 56, 128]), p0: D(right, [8, 28, 104, 72]), p1: D(right, [8, 104, 104, 72]),
    pause: D(right, [4, 194, 54, 48]), mute: D(right, [62, 194, 54, 48]), jump: D(right, [2, 252, 116, 128]) };
  const lowY = left.y + 240 * left.k, midL = left.x + 60 * left.k;
  L.hit = { left: { x: 0, y: lowY, w: midL, h: H - lowY }, right: { x: midL, y: lowY, w: play.x - midL, h: H - lowY },
    jump: { x: play.x + play.w, y: right.y + 248 * right.k, w: W - play.x - play.w, h: H - (right.y + 248 * right.k) },
    pause: grow(L.vis.pause, 3), mute: grow(L.vis.mute, 3), p0: grow(L.vis.p0, 2), p1: grow(L.vis.p1, 2), play };
  // screen buttons inside the play area (CSS px)
  const P = play, u = P.w / 512, B = (x, y, w, h) => ({ x: P.x + x * u, y: P.y + y * u, w: w * u, h: h * u });
  L.btn = { cont: B(136, 222, 240, 50), fresh: B(136, 290, 240, 40), title: B(10, 30, 112, 34) };
  ART.clearCache();
}
const portrait = () => L && L.H > L.W;

/* ---------- input ---------- */
const pointers = new Map(), keys = new Set(); let jumpBuf = 0, kbSeen = false;
function regionAt(x, y) { for (const k of ['jump', 'left', 'right', 'pause', 'mute', 'p0', 'p1']) if (inR(L.hit[k], x, y)) return k; return inR(L.hit.play, x, y) ? 'play' : null; }
function press(region, x, y) {
  if (region === 'mute') { toggleMute(); return; }
  if (ui === 'title') { titleTap(x, y); return; }
  if (ui === 'win') { if (uiT > 3) { ui = 'title'; uiT = 0; refreshHasSave(); SFX.click(); } return; }
  const st = G.st;
  if (paused) { if (inR(L.btn.title, x, y)) { paused = null; save(); toTitle(); return; }
    if (region === 'play' || region === 'pause') resume(); return; }
  if (st.mode === 'gameover') { if (region === 'play' && uiT > GAMEOVER_GUARD && inR(grow(L.btn.cont, 6), x, y)) { G.continueGame(); flushEvents(); save(); SFX.click(); } return; }
  if (introT > 0) { if (region === 'play' || region === 'jump') introT = Math.min(introT, 0.01); return; }
  if (region === 'jump' || (region === 'play' && st.mode === 'arcade')) jumpBuf = 0.15;
  else if (region === 'pause') pause('user');
  else if (region === 'p0' || region === 'p1') { if (G.drop(region === 'p0' ? 0 : 1)) idleT = 0; flushEvents(); }
}
function titleTap(x, y) {
  unlockAudio();
  if (uiT < 0.4) return;
  if (hasSave && inR(L.btn.cont, x, y)) { if (loadSave()) { startPlay(); } return; }
  if (hasSave && !inR(L.btn.fresh, x, y)) return;
  if (hasSave && confirmNew <= 0) { confirmNew = 3; SFX.click(); return; }
  G.newGame(); G.events.length = 0; startPlay(); introT = INTRO; saveSeq = storedSeq(); save();
}
function startPlay() { ui = 'game'; uiT = 0; paused = null; introT = 0; wasLow = false; lowShown = false; confirmNew = 0; stopMusic(); idleT = 0; SFX.click(); }
function toTitle() { ui = 'title'; uiT = 0; refreshHasSave(); playMusic('title'); }
cv.addEventListener('pointerdown', e => { e.preventDefault(); unlockAudio(); try { cv.setPointerCapture(e.pointerId); } catch (err) { /* */ }
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (!portrait()) press(regionAt(e.clientX, e.clientY), e.clientX, e.clientY); });
cv.addEventListener('pointermove', e => { const p = pointers.get(e.pointerId); if (p) { p.x = e.clientX; p.y = e.clientY; } });
const lift = e => pointers.delete(e.pointerId);
cv.addEventListener('pointerup', e => { lift(e); unlockAudio(); }); cv.addEventListener('pointercancel', lift); cv.addEventListener('lostpointercapture', lift);
const stop = e => { if (e.cancelable) e.preventDefault(); };
for (const ev of ['touchstart', 'touchmove', 'touchend']) document.addEventListener(ev, stop, { passive: false });
for (const ev of ['gesturestart', 'gesturechange', 'gestureend', 'dblclick', 'contextmenu', 'selectstart']) document.addEventListener(ev, stop, { passive: false });
const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'jump', ArrowUp: 'jump', KeyW: 'jump' };
window.addEventListener('keydown', e => { unlockAudio(); const k = KEYMAP[e.code];
  const mid = L ? [L.btn.cont.x + L.btn.cont.w / 2, L.btn.cont.y + L.btn.cont.h / 2] : [0, 0];
  kbSeen = true;
  if (k && paused && ui === 'game' && k === 'jump') { e.preventDefault(); if (!e.repeat) resume(); return; } // P1: Space/Up resumes a pause (without jumping)
  if (k) { e.preventDefault(); if (!e.repeat) { keys.add(k); if (k === 'jump') press(ui === 'title' ? 'play' : 'jump', L.btn.cont.x + 2, L.btn.cont.y + 2); } return; }
  if (e.repeat) return;
  if (e.code === 'KeyP' || e.code === 'Escape') { if (ui === 'game') paused ? resume() : pause('user'); }
  else if (e.code === 'KeyM') toggleMute(); else if (e.code === 'Digit1') press('p0'); else if (e.code === 'Digit2') press('p1');
  else if (e.code === 'Enter') press('play', mid[0], mid[1]); });
window.addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) keys.delete(k); });
window.addEventListener('blur', () => { keys.clear(); pointers.clear(); });
function held(name) { if (keys.has(name)) return true; for (const p of pointers.values()) if (inR(L.hit[name], p.x, p.y)) return true; return false; }

/* ---------- pause / save / resume ---------- */
function pause(why) { if (paused || ui !== 'game') return; paused = why; pointers.clear(); keys.clear(); jumpBuf = 0; if (why === 'user') SFX.click(); save(); }
function resume() { paused = null; SFX.click(); save(); }
function toggleMute() { muted = !muted; localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); if (!muted) { unlockAudio(); SFX.click(); } }
// N4: every save carries a counter. A copy of the game (another tab / the home-screen app) never overwrites a newer save
// written by a different copy: it adopts that save instead and waits on the pause card.
let saveSeq = 0;
const storedSeq = () => { const s = readSave(); return s ? (s.seq || 0) : 0; };
function adoptNewer() { const s = readSave(); if (!s || s.won) return false; if (!G.load(s)) return false; G.events.length = 0; saveSeq = s.seq || 0;
  if (ui === 'game') { paused = paused || 'auto'; pointers.clear(); keys.clear(); jumpBuf = 0; introT = 0; } return true; }
function save(force) {
  if (!G.st || ui === 'win') return;
  if (!G.canSave() && !force) return;
  try { const cur = storedSeq(); if (cur > saveSeq) { if (ui === 'game') adoptNewer(); else refreshHasSave(); return; }
    const s = G.serialize(); s.ui = ui === 'game' ? 'game' : 'title'; s.userPaused = paused === 'user'; s.seq = saveSeq = cur + 1; localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) { /* storage blocked */ }
}
window.addEventListener('storage', e => { if (e.key !== SAVE_KEY) return; const s = readSave();
  if (ui === 'game' && s && !s.won && (s.seq || 0) > saveSeq) adoptNewer(); else if (ui === 'title') refreshHasSave(); });
function readSave() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return s && s.v === 2 && s.n ? s : null; } catch (e) { return null; } }
function refreshHasSave() { const s = readSave(); hasSave = !!(s && !s.won); }
function loadSave() { const s = readSave(); if (!s || s.won) return false; const ok = G.load(s); G.events.length = 0; if (ok) saveSeq = s.seq || 0; return ok; }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { keys.clear(); pointers.clear(); jumpBuf = 0; if (ui === 'game' && !paused) pause('auto'); else save(); } else { last = 0; acc = 0; } });
window.addEventListener('pagehide', () => save());
window.addEventListener('beforeunload', () => save());

/* ---------- events from the engine ---------- */
let lastToast = null;
function flushEvents() {
  for (const e of G.events) {
    if (e.sfx && SFX[e.sfx]) SFX[e.sfx]();
    if (e.room) { idleT = 0; save(); }
    if (e.win) { ui = 'win'; uiT = 0; winAt = performance.now(); playMusic('win'); try { localStorage.removeItem(SAVE_KEY); } catch (er) { /* */ } }
    if (e.gameover) { uiT = 0; save(true); }
    if (e.save && !e.win) save();
  }
  G.events.length = 0;
}

/* ---------- step ---------- */
function step() {
  const st = G.st; if (!st) return;
  const dir = (held('right') ? 1 : 0) - (held('left') ? 1 : 0);
  const wasGround = st.n.ground, mode = st.mode;
  const inp = { dir, jump: jumpBuf > 0 };
  G.step(inp);
  if (inp.jump && (wasGround || mode === 'arcade' || st.trans)) jumpBuf = 0;
  jumpBuf = Math.max(0, jumpBuf - DT);
  if (st.mode === 'play' && st.n.ground && !dir) idleT += DT; else idleT = 0;
  flushEvents();
  lowWarn();
}

// m6: candle warning below 10%: a beep every 1.5 s, a one-off toast, and the candle blinks in the panel
function lowWarn() {
  const st = G.st; const low = st.mode === 'play' && st.energy < LOW && !st.float;
  if (low) { lowT -= DT; if (lowT <= 0) { lowT = 1.5; SFX.low(); }
    if (!lowShown && !st.toast) { st.toast = { text: 'CANDLE LOW!|FIND SOMETHING TO EAT', t: 2.6, kind: 'warn' }; lowShown = true; } }
  else { lowT = 0; lowShown = false; }
  wasLow = low;
}

/* ---------- drawing ---------- */
function label(t, x, y, size, col, align = 'center') { ctx.font = `${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(t, x, y); }
function frame(x, y, w, h, col, lw) { ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw); }
function tri(pts, col) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); }
function button(r, kind, down) {
  const col = { left: S.b, right: S.b, jump: S.r, pause: S.m, mute: S.m }[kind], hi = { left: S.B, right: S.B, jump: S.R, pause: S.M, mute: S.M }[kind], d = down ? 4 : 0;
  ctx.fillStyle = col; ctx.fillRect(r.x, r.y + 5, r.w, r.h - 5); ctx.fillStyle = down ? S.W : hi; ctx.fillRect(r.x, r.y + d, r.w, r.h - 5); frame(r.x, r.y + d, r.w, r.h - 5, S.K, 1.5);
  const cx = r.x + r.w / 2, cy = r.y + d + (r.h - 5) / 2, u = (kind === 'jump' ? Math.min(r.w / 116, r.h / 128) * 1.15 : Math.min(r.w, r.h) / 56), ink = down ? col : S.W;
  if (kind === 'left' || kind === 'right') { const s = kind === 'left' ? -1 : 1; tri([[cx + s * 13 * u, cy], [cx - s * 10 * u, cy - 17 * u], [cx - s * 10 * u, cy + 17 * u]], ink); }
  else if (kind === 'jump') { tri([[cx, cy - 30 * u], [cx + 18 * u, cy - 10 * u], [cx - 18 * u, cy - 10 * u]], down ? col : S.Y); label('JUMP', cx, cy + 16 * u, Math.round(22 * u), down ? col : S.Y); }
  else if (kind === 'pause') { ctx.fillStyle = ink; if (paused) tri([[cx - 8 * u, cy - 11 * u], [cx + 11 * u, cy], [cx - 8 * u, cy + 11 * u]], ink); else { ctx.fillRect(cx - 9 * u, cy - 10 * u, 6 * u, 20 * u); ctx.fillRect(cx + 3 * u, cy - 10 * u, 6 * u, 20 * u); } }
  else if (kind === 'mute') { tri([[cx - 12 * u, cy - 5 * u], [cx - 6 * u, cy - 5 * u], [cx + 1 * u, cy - 12 * u], [cx + 1 * u, cy + 12 * u], [cx - 6 * u, cy + 5 * u], [cx - 12 * u, cy + 5 * u]], ink);
    ctx.lineWidth = 2.4 * u; ctx.strokeStyle = ink; ctx.lineCap = 'butt';
    if (muted) { ctx.beginPath(); ctx.moveTo(cx + 5 * u, cy - 6 * u); ctx.lineTo(cx + 13 * u, cy + 6 * u); ctx.moveTo(cx + 13 * u, cy - 6 * u); ctx.lineTo(cx + 5 * u, cy + 6 * u); ctx.stroke(); }
    else for (const rr of [6, 11]) { ctx.beginPath(); ctx.arc(cx + 1 * u, cy, rr * u, -0.8, 0.8); ctx.stroke(); } }
}
function panels() {
  const st = G.st, A = L.left, k = A.k, Lx = v => A.x + v * k, Ly = v => A.y + v * k, game = (ui === 'game' || ui === 'win') && st;
  frame(Lx(0), Ly(0), 120 * k, 240 * k, S.b, 2); frame(Lx(4), Ly(4), 112 * k, 232 * k, S.b, 1);
  label('ENERGY', Lx(60), Ly(18), Math.round(14 * k), S.M);
  const lowNow = game && ui === 'game' && st.energy < LOW && st.mode === 'play';
  if (lowNow && Math.floor(performance.now() / 250) % 2 === 0) { ctx.fillStyle = 'rgba(255,40,40,0.35)'; ctx.fillRect(Lx(10), Ly(30), 100 * k, 104 * k); frame(Lx(10), Ly(30), 100 * k, 104 * k, S.R, 2); }
  V.drawCandle(ctx, Lx(60), Ly(126), 0.42 * k, game ? st.energy : 1, performance.now() / 1000 * 7);
  label('LIVES', Lx(60), Ly(144), Math.round(14 * k), S.C);
  const lives = game ? st.lives : 3, gap = lives > 3 ? 24 : 30;
  for (let i = lives - 1; i >= 0; i--) V.drawNorrisHead(ctx, Lx(60 + (i - (lives - 1) / 2) * gap), Ly(176), (lives > 3 ? 0.32 : 0.38) * k);
  label('SOLVED', Lx(60), Ly(198), Math.round(14 * k), S.Y); label((game ? G.percent() : 0) + '%', Lx(60), Ly(222), Math.round(21 * k), S.W);
  button(L.vis.left, 'left', held('left') && !paused && ui === 'game'); button(L.vis.right, 'right', held('right') && !paused && ui === 'game');
  const B = L.right, Rx = v => B.x + v * B.k, Ry = v => B.y + v * B.k;
  frame(Rx(0), Ry(0), 120 * B.k, 184 * B.k, S.b, 2); frame(Rx(4), Ry(4), 112 * B.k, 176 * B.k, S.b, 1);
  label('POCKETS', Rx(60), Ry(18), Math.round(14 * B.k), S.M);
  [L.vis.p0, L.vis.p1].forEach((r, i) => {
    ctx.fillStyle = S.K; ctx.fillRect(r.x, r.y, r.w, r.h); frame(r.x, r.y, r.w, r.h, S.m, 1.5);
    const id = game ? st.pockets[i] : null;
    if (!id) { label('EMPTY', r.x + r.w / 2, r.y + r.h / 2, Math.round(11 * B.k), S.b); return; }
    ART.drawItemArt(ctx, id, r.x + r.w / 2, r.y + r.h - 22 * B.k, 0.44 * B.k, G.itemState(id), 0);
    const nm = (G.ITEMS[id].name || id).toUpperCase(); let sz = 11; ctx.font = `${Math.round(sz * B.k)}px ${FONT}`; while (sz > 7 && ctx.measureText(nm).width > r.w - 6) { sz--; ctx.font = `${Math.round(sz * B.k)}px ${FONT}`; }
    label(nm, r.x + r.w / 2, r.y + r.h - 11 * B.k, Math.round(sz * B.k), S.W);
  });
  button(L.vis.pause, 'pause', false); button(L.vis.mute, 'mute', false); button(L.vis.jump, 'jump', held('jump') && !paused && ui === 'game');
}
function boxText(t, cx, cy, size, col, u, border) {
  ctx.font = `${Math.round(size * u)}px ${FONT}`; const w = ctx.measureText(t).width + 24 * u, h = size * 1.7 * u;
  ctx.fillStyle = S.K; ctx.fillRect(cx - w / 2, cy - h / 2, w, h); frame(cx - w / 2, cy - h / 2, w, h, border || col, 1.5); label(t, cx, cy, Math.round(size * u), col);
}
function bigButton(r, text, col, sub) { ctx.fillStyle = S.K; ctx.fillRect(r.x, r.y, r.w, r.h); frame(r.x, r.y, r.w, r.h, col, 2.5); label(text, r.x + r.w / 2, r.y + r.h / 2, Math.round(r.h * 0.42), col); }
function render() {
  const { dpr, play: P } = L, u = P.w / 512, now = performance.now() / 1000;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = S.K; ctx.fillRect(0, 0, L.W, L.H);
  ctx.save(); ctx.beginPath(); ctx.rect(P.x, P.y, P.w, P.h); ctx.clip(); ctx.translate(P.x, P.y); ctx.scale(u, u);
  const st = G.st;
  if (ui === 'title') ART.drawTitle(ctx, now);
  else if (ui === 'win') ART.drawWin(ctx, now);
  else if (st.mode === 'arcade') ART.drawArcade(ctx, G);
  else if (introT > 0.5) ART.drawTitle(ctx, now, true);
  else if (introT > 0) { // short hop out of bed onto the floor
    const n = st.n, keep = Object.assign({}, n), k = 1 - introT / 0.5;
    Object.assign(n, { x: 134 + (keep.x - 134) * k, y: 140 + (keep.y - 140) * k - Math.sin(k * Math.PI) * 18, ground: false, vy: k < 0.5 ? -1 : 1, air: 1, face: -1 });
    ART.drawScene(ctx, G, { pw: Math.round(P.w * dpr), idleT }); Object.assign(n, keep);
  }
  else ART.drawScene(ctx, G, { pw: Math.round(P.w * dpr), idleT });
  ctx.restore();
  ctx.save(); ctx.translate(P.x, P.y);
  if (ui === 'game' && st.mode !== 'arcade') {
    const R = G.room(); ctx.globalAlpha = 0.85; label(R.name, P.w / 2, 11 * u + 3, Math.round(15 * u), S.W); ctx.globalAlpha = 1;
    if (st.inv > 1.2) { ctx.globalAlpha = (st.inv - 1.2) / 0.3 * 0.35; ctx.fillStyle = S.R; ctx.fillRect(0, 0, P.w, P.h); ctx.globalAlpha = 1; }
    const T = st.toast;
    if (T && !paused && st.mode === 'play' && introT <= 0) { ctx.globalAlpha = Math.min(1, T.t * 3); const lines = T.text.split('|');
      const y0 = T.kind === 'hit' ? 70 : 150; lines.forEach((ln, i) => boxText(ln, P.w / 2, (y0 + i * 32) * u, i ? 13 : 20, i ? S.C : S.Y, u, S.Y)); ctx.globalAlpha = 1; }
    if (st.mode === 'gameover') { ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, P.w, P.h); label('GAME OVER', P.w / 2, P.h * 0.38, Math.round(46 * u), S.R);
      label('YOUR PROGRESS IS KEPT', P.w / 2, P.h * 0.52, Math.round(15 * u), S.W); if (uiT > GAMEOVER_GUARD) { ctx.restore(); bigButton(L.btn.cont, 'CONTINUE', S.G); ctx.save(); ctx.translate(P.x, P.y); } }
    if (paused) { ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, P.w, P.h); label('PAUSED', P.w / 2, P.h * 0.36, Math.round(48 * u), S.M); label('TAP TO PLAY', P.w / 2, P.h * 0.54, Math.round(22 * u), S.C); if (kbSeen) label('OR PRESS SPACE / ENTER', P.w / 2, P.h * 0.63, Math.round(13 * u), S.W);
      ctx.restore(); bigButton(L.btn.title, 'TITLE', S.Y); ctx.save(); ctx.translate(P.x, P.y); }
  }
  if (ui === 'title') {
    ctx.restore();
    if (hasSave) { bigButton(L.btn.cont, 'CONTINUE', S.G); bigButton(L.btn.fresh, confirmNew > 0 ? 'TAP AGAIN: START OVER' : 'NEW GAME', confirmNew > 0 ? S.R : S.C); }
    else if (Math.floor(now * 2) % 2 === 0) label('TAP TO START', P.x + P.w / 2, P.y + 250 * u, Math.round(24 * u), S.C);
    label('A TALE OF ONE MORE SNOOZE', P.x + P.w / 2, P.y + 362 * u, Math.round(11 * u), S.W);
    ctx.save();
  }
  if (ui === 'win') {
    const s = G.st; ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, P.w, 150 * u);
    label('GOOD MORNING, NORRIS!', P.w / 2, 34 * u, Math.round(24 * u), S.Y); label('THE ROOSTER CROWS AT LAST', P.w / 2, 66 * u, Math.round(13 * u), S.W);
    label('STEPS ' + s.steps + '    SOLVED ' + G.percent() + '%', P.w / 2, 100 * u, Math.round(15 * u), S.C);
    if (s.arcadeDone) label('SHEEP COUNTED: ALL OF THEM', P.w / 2, 126 * u, Math.round(10 * u), S.M);
    if (uiT > 3) label('TAP FOR TITLE', P.w / 2, 356 * u, Math.round(18 * u), S.C);
  }
  ctx.restore();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); panels();
}

/* ---------- loop ---------- */
let last = 0, acc = 0, saveT = 0;
function frameLoop(ts) {
  const dt = Math.min(0.1, last ? (ts - last) / 1000 : 0); last = ts;
  if (portrait() && ui === 'game' && !paused) pause('auto');
  if (!portrait() && document.visibilityState === 'visible') {
    uiT += dt; if (confirmNew > 0) confirmNew -= dt;
    if (ui === 'game' && !paused && G.st && introT > 0) { const was = introT; introT = Math.max(0, introT - dt); if (was > 0.5 && introT <= 0.5) SFX.jump(); if (introT <= 0) SFX.land(); acc = 0; }
    else if (ui === 'game' && !paused && G.st) { acc += dt; let n = 0; while (acc >= DT && n++ < 24) { step(); acc -= DT; } if (n >= 24) acc = 0; saveT += dt; if (saveT > 2) { saveT = 0; save(); } }
    else acc = 0;
  } else acc = 0;
  tickMusic(); render(); requestAnimationFrame(frameLoop);
}
window.addEventListener('resize', layout); window.addEventListener('orientationchange', () => setTimeout(layout, 120));
// boot: silent resume when the game was left mid-play; otherwise the title
(function boot() {
  const s = readSave(); refreshHasSave();
  if (s && !s.won && s.ui === 'game' && loadSave()) { ui = 'game'; paused = s.userPaused ? 'user' : 'auto'; }
  else { ui = 'title'; playMusic('title'); }
})();
const start = () => { layout(); requestAnimationFrame(frameLoop); };
const fontReady = document.fonts && document.fonts.load ? document.fonts.load('16px "Bungee"') : Promise.resolve();
Promise.race([fontReady, new Promise(r => setTimeout(r, 1500))]).then(start, start);

// hook for automated tests (not used by the game itself)
window.LLI_TEST = {
  G, get state() { return G.st ? JSON.parse(JSON.stringify(G.serialize())) : null; }, get live() { return G.st; }, get layout() { return L; },
  get ui() { return ui; }, get paused() { return paused; }, get intro() { return introT; }, get music() { return music && music.name; },
  newGame() { G.newGame(); G.events.length = 0; startPlay(); saveSeq = storedSeq(); save(); }, save() { save(); }, flush: flushEvents, resume() { if (paused) resume(); },
  place(x, y) { Object.assign(G.st.n, { x, y, ground: true, vx: 0, vy: 0 }); G.st.arm = null; },
  give(id) { const k = G.st.pockets.indexOf(null); if (k < 0) return false; G.st.pockets[k] = id; G.st.items[id] = { held: true }; return true; },
  room(id, x, y) { G.enterRoom(id, false, [x, y]); G.events.length = 0; }
};
})();

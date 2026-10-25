/* The Long Lie-In — v3-style art for every room, item, nightmare and prop. Original artwork, Canvas 2D.
   Room space is 512x384 (2x the logical play area). Needs v3.js and hall.js first. */
(function (root) {
'use strict';
const V = root.LLI_V3, HALL = root.LLI_V3_HALL, S = HALL.SPECTRUM, H = V.helpers;
const K = S.K;
const rect = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
function ln(c, x1, y1, x2, y2, w = 1.2, col = K) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineWidth = w; c.strokeStyle = col; c.lineCap = 'butt'; c.stroke(); }
function shape(c, pts, col, edge) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) c.lineTo(p[0], p[1]); c.closePath(); if (col) { c.fillStyle = col; c.fill(); } if (edge) { c.lineWidth = edge; c.strokeStyle = K; c.lineJoin = 'miter'; c.stroke(); } }
function disc(c, x, y, r, col, edge) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); if (col) { c.fillStyle = col; c.fill(); } if (edge) { c.lineWidth = edge; c.strokeStyle = K; c.stroke(); } }
function oval(c, x, y, rx, ry, col, edge, rot = 0) { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); if (col) { c.fillStyle = col; c.fill(); } if (edge) { c.lineWidth = edge; c.strokeStyle = K; c.stroke(); } }
function box(c, x, y, w, h, col, edge = 1.2) { rect(c, x, y, w, h, col); if (edge) { c.lineWidth = edge; c.strokeStyle = K; c.strokeRect(x, y, w, h); } }
function bricks(c, x, y, w, h, col, bh = 8, bw = 18, lc = K) {
  rect(c, x, y, w, h, col); c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  for (let r = 0, yy = y; yy < y + h; r++, yy += bh) { ln(c, x, yy, x + w, yy, 1.4, lc); for (let xx = x - (r % 2) * bw / 2; xx < x + w; xx += bw) ln(c, xx, yy, xx, yy + bh, 1.4, lc); }
  c.restore();
}
function turned(c, x, y1, y2, w, col) {
  const h = y2 - y1, k = t => y1 + h * t;
  rect(c, x - w * 0.5, k(0), w, h * 0.1, col); rect(c, x - w * 0.22, k(0.1), w * 0.44, h * 0.14, col);
  oval(c, x, k(0.36), w * 0.42, h * 0.14, col); rect(c, x - w * 0.18, k(0.48), w * 0.36, h * 0.16, col);
  oval(c, x, k(0.7), w * 0.5, h * 0.12, col); rect(c, x - w * 0.22, k(0.8), w * 0.44, h * 0.1, col); rect(c, x - w * 0.5, k(0.9), w, h * 0.1, col);
}
function star(c, x, y, r, col = S.W) { rect(c, x - r * 0.2, y - r, r * 0.4, r * 2, col); rect(c, x - r, y - r * 0.2, r * 2, r * 0.4, col); }
function txt(c, s, x, y, size, col, align = 'center') { c.font = `${size}px "Bungee", system-ui, sans-serif`; c.textAlign = align; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, x, y); }

/* ---------- palettes: top band, wallpaper, wainscot, floor ---------- */
const PAL = {
  mast: { band: S.m, bandK: 'bricks', paper: S.b, paperK: 'diamonds', wains: S.b, wainsK: 'panels', rail: S.C, floor: S.Y, floor2: S.r, door: S.R },
  land: { band: S.r, bandK: 'bricks', paper: S.r, paperK: 'dots', wains: S.g, wainsK: 'planks', rail: S.Y, floor: S.C, floor2: S.b, door: S.G },
  hall: { band: S.r, bandK: 'bricks', wains: S.r, wainsK: 'planks', rail: S.Y, floor: S.C, floor2: S.b, door: S.M },
  parl: { band: S.y, bandK: 'bricks', paper: S.m, paperK: 'stripes', wains: S.m, wainsK: 'panels', rail: S.Y, floor: S.G, floor2: S.g, door: S.Y },
  dine: { band: S.g, bandK: 'bricks', paper: S.g, paperK: 'diamonds', wains: S.r, wainsK: 'panels', rail: S.C, floor: S.Y, floor2: S.y, door: S.R },
  kitc: { band: S.c, bandK: 'tiles', paper: S.c, paperK: 'tiles', wains: S.W, wainsK: 'tiles', rail: S.R, floor: S.R, floor2: S.r, door: S.C },
  garg: { band: S.w, bandK: 'bricks', paper: null, wains: S.w, wainsK: 'bricks', rail: S.Y, floor: S.w, floor2: S.b, door: S.G },
  clok: { band: S.b, bandK: 'bricks', paper: S.b, paperK: 'stripes', wains: S.y, wainsK: 'planks', rail: S.W, floor: S.M, floor2: S.m, door: S.C },
  stud: { band: S.r, bandK: 'bricks', paper: S.g, paperK: 'dots', wains: S.y, wainsK: 'panels', rail: S.R, floor: S.Y, floor2: S.r, door: S.M },
  scul: { band: S.w, bandK: 'tiles', paper: S.c, paperK: 'tiles', wains: S.c, wainsK: 'tiles', rail: S.B, floor: S.W, floor2: S.b, door: S.Y },
  cons: { band: S.G, bandK: 'glass', paper: null, wains: S.W, wainsK: 'bricks', rail: S.G, floor: S.R, floor2: S.r, door: S.W },
  spar: { band: S.c, bandK: 'bricks', paper: S.c, paperK: 'diamonds', wains: S.m, wainsK: 'planks', rail: S.W, floor: S.Y, floor2: S.y, door: S.Y },
  twin: { band: S.y, bandK: 'bricks', paper: S.y, paperK: 'stars', wains: S.b, wainsK: 'panels', rail: S.M, floor: S.C, floor2: S.c, door: S.M },
  libr: { band: S.g, bandK: 'bricks', paper: S.g, paperK: 'stripes', wains: S.r, wainsK: 'panels', rail: S.Y, floor: S.Y, floor2: S.r, door: S.R },
  nurs: { band: S.M, bandK: 'bricks', paper: null, wains: S.C, wainsK: 'planks', rail: S.Y, floor: S.Y, floor2: S.y, door: S.G },
  sewi: { band: S.m, bandK: 'bricks', paper: S.m, paperK: 'dots', wains: S.y, wainsK: 'planks', rail: S.C, floor: S.G, floor2: S.g, door: S.Y },
  bath: { band: S.c, bandK: 'tiles', paper: S.c, paperK: 'tiles', wains: S.C, wainsK: 'tiles', rail: S.W, floor: S.W, floor2: S.c, door: S.M },
  atti: { band: S.y, bandK: 'beams', paper: null, wains: S.y, wainsK: 'none', rail: S.y, floor: S.y, floor2: S.r, door: S.y },
  toys: { band: S.y, bandK: 'beams', paper: null, wains: S.y, wainsK: 'none', rail: S.y, floor: S.y, floor2: S.r, door: S.G },
  chim: { band: S.y, bandK: 'beams', paper: null, wains: S.y, wainsK: 'none', rail: S.y, floor: S.y, floor2: S.r, door: S.y },
  tank: { band: S.y, bandK: 'beams', paper: null, wains: S.y, wainsK: 'none', rail: S.y, floor: S.y, floor2: S.r, door: S.C },
  roof: { outside: 'roof' }, cloud: { outside: 'cloud' },
  wine: { band: S.b, bandK: 'stone', paper: null, wains: S.b, wainsK: 'stone', rail: S.b, floor: S.w, floor2: S.b, door: S.y, cellar: true },
  boil: { band: S.r, bandK: 'stone', paper: null, wains: S.r, wainsK: 'stone', rail: S.r, floor: S.w, floor2: S.r, door: S.y, cellar: true },
  coal: { band: S.b, bandK: 'stone', paper: null, wains: S.b, wainsK: 'stone', rail: S.b, floor: S.w, floor2: S.b, door: S.y, cellar: true },
  arca: { outside: 'cloud' }
};

function interior(c, P, R) {
  rect(c, 0, 0, 512, 384, K);
  // wallpaper motif (sparse, on black)
  if (P.paper) {
    c.save(); c.globalAlpha = 0.9;
    for (let y = 46, r = 0; y < 232; y += 26, r++) for (let x = (r % 2) * 18 + 10; x < 512; x += 36) {
      if (P.paperK === 'dots') disc(c, x, y, 2, P.paper);
      else if (P.paperK === 'diamonds') shape(c, [[x, y - 5], [x + 4, y], [x, y + 5], [x - 4, y]], P.paper);
      else if (P.paperK === 'stars') star(c, x, y, 3, P.paper);
      else if (P.paperK === 'tiles') { /* drawn below */ }
    }
    if (P.paperK === 'stripes') for (let x = 8; x < 512; x += 28) rect(c, x, 30, 3, 206, P.paper);
    if (P.paperK === 'tiles') { for (let y = 40; y < 236; y += 22) ln(c, 0, y, 512, y, 1.4, P.paper); for (let x = 0; x < 512; x += 22) ln(c, x, 30, x, 236, 1.4, P.paper); }
    c.restore();
  }
  // top band
  if (P.bandK === 'bricks') { bricks(c, 0, 0, 512, 22, P.band, 7.3, 20); rect(c, 0, 22, 512, 3, S.Y); }
  else if (P.bandK === 'tiles') { rect(c, 0, 0, 512, 24, P.band); for (let x = 0; x < 512; x += 16) ln(c, x, 0, x, 24, 1.2); ln(c, 0, 12, 512, 12, 1.2); rect(c, 0, 22, 512, 3, P.rail); }
  else if (P.bandK === 'stone') { bricks(c, 0, 0, 512, 236, P.band === S.r ? '#5a0000' : '#00006a', 22, 44, P.band); }
  else if (P.bandK === 'glass') { /* conservatory handled by decor */ }
  else if (P.bandK === 'beams') { // attic: sloping roof beams
    shape(c, [[0, 0], [512, 0], [512, 20], [0, 20]], S.y); for (let x = 30; x < 512; x += 80) { shape(c, [[x, 20], [x + 14, 20], [x + 30, 236], [x + 16, 236]], '#5a3a00'); ln(c, x, 20, x + 16, 236, 1.2, S.y); }
    ln(c, 0, 20, 512, 20, 1.6, S.Y);
  }
  // wainscot + rail
  if (P.wainsK && P.wainsK !== 'none') {
    if (P.wainsK === 'stone') { /* stone continues */ }
    else if (P.wainsK === 'bricks') bricks(c, 0, 240, 512, 112, P.wains, 9, 22);
    else {
      rect(c, 0, 240, 512, 112, P.wains);
      if (P.wainsK === 'planks') for (let x = 4; x < 512; x += 9) ln(c, x, 242, x, 352, 1.4);
      if (P.wainsK === 'panels') for (let x = 10; x < 512; x += 64) { c.lineWidth = 1.4; c.strokeStyle = K; c.strokeRect(x, 256, 50, 84); }
      if (P.wainsK === 'tiles') { for (let y = 240; y < 352; y += 16) ln(c, 0, y, 512, y, 1.2); for (let x = 0; x < 512; x += 16) ln(c, x, 240, x, 352, 1.2); }
    }
    if (P.wainsK !== 'stone') { rect(c, 0, 236, 512, 6, P.rail); ln(c, 0, 242, 512, 242, 1.4); }
  }
  // floor
  rect(c, 0, 352, 512, 9, P.floor); ln(c, 0, 361, 512, 361, 1.6);
  rect(c, 0, 361.5, 512, 23, P.floor2);
  for (let r = 0; r < 2; r++) for (let x = (r ? 40 : 0); x < 512; x += 80) ln(c, x, 362 + r * 11, x, 373 + r * 11, 1.4);
  ln(c, 0, 373, 512, 373, 1.4);
}
function nightSky(c, dream) {
  if (dream) {
    const g = c.createLinearGradient(0, 0, 0, 384); g.addColorStop(0, '#2a0050'); g.addColorStop(1, '#b0007a'); c.fillStyle = g; c.fillRect(0, 0, 512, 384);
    for (let i = 0; i < 40; i++) star(c, (i * 97) % 512, (i * 53) % 220 + 6, 1.5 + (i % 3), i % 4 ? S.W : S.Y);
    for (const [x, y, w] of [[60, 60, 70], [300, 40, 90], [430, 110, 60], [180, 130, 50]]) { c.globalAlpha = 0.35; cloudPuff(c, x, y, w, S.W); c.globalAlpha = 1; }
  } else {
    rect(c, 0, 0, 512, 384, '#000030');
    for (let i = 0; i < 46; i++) star(c, (i * 89 + 13) % 512, (i * 37) % 240 + 6, 1 + (i % 3) * 0.7);
    disc(c, 420, 70, 26, S.Y); disc(c, 432, 62, 22, '#000030');
    // distant rooftops
    shape(c, [[0, 300], [40, 270], [80, 300], [120, 280], [160, 300], [210, 260], [260, 300], [512, 300], [512, 384], [0, 384]], S.b);
    for (const [x, y] of [[50, 285], [200, 280], [236, 290], [120, 292]]) rect(c, x, y, 6, 7, S.Y);
  }
}
function cloudPuff(c, x, y, w, col, edge) {
  const k = w / 60;
  for (const [dx, dy, r] of [[-20, 6, 14], [0, 0, 18], [20, 5, 14], [-8, 10, 12], [10, 11, 12]]) oval(c, x + dx * k, y + dy * k, r * k * 1.2, r * k, col, edge);
}

/* ---------- furniture "looks" for platforms (top surface at p.y) ---------- */
const LOOK = {};
const X = v => v * 2;
LOOK.floor = () => {};
LOOK.none = () => {};
LOOK.chest = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x + 2, y + 6, w - 4, 352 - y - 10, S.r); for (let k = 0; k < 3; k++) { const yy = y + 10 + k * 22; box(c, x + 6, yy, w - 12, 18, S.R); disc(c, x + w / 2, yy + 9, 2.4, S.Y, 1); } rect(c, x, y, w, 7, S.Y); ln(c, x, y + 7, x + w, y + 7); rect(c, x + 6, 348, 6, 4, S.r); rect(c, x + w - 12, 348, 6, 4, S.r); };
LOOK.bedside = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); rect(c, x, y, w, 6, S.Y); ln(c, x, y + 6, x + w, y + 6); box(c, x + 3, y + 6, w - 6, 24, S.r); disc(c, x + w / 2, y + 18, 2, S.Y, 1); rect(c, x + 4, y + 30, 4, 352 - y - 30, S.y); rect(c, x + w - 8, y + 30, 4, 352 - y - 30, S.y); };
LOOK.bigbed = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y);
  box(c, x - 6, y - 70, 14, 352 - y + 70, S.Y); disc(c, x + 1, y - 74, 7, S.Y, 1.2); box(c, x + w - 8, y - 30, 14, 352 - y + 30, S.Y); disc(c, x + w - 1, y - 34, 7, S.Y, 1.2);
  box(c, x + 8, y + 2, w - 16, 26, S.W); // mattress
  shape(c, [[x + 30, y], [x + w - 8, y], [x + w - 8, y + 44], [x + 26, y + 44]], S.B, 1.2); for (let k = x + 40; k < x + w - 8; k += 18) ln(c, k, y + 2, k - 4, y + 44, 1.2, S.b);
  oval(c, x + 26, y - 4, 18, 9, S.W, 1.2); rect(c, x + 8, y + 44, w - 16, 352 - y - 44, K); ln(c, x + 8, 340, x + w - 8, 340, 3, S.y); };
LOOK.bed = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y);
  box(c, x - 4, y - 40, 10, 352 - y + 40, S.W); box(c, x + w - 6, y - 18, 10, 352 - y + 18, S.W);
  box(c, x + 6, y, w - 12, 18, S.W); shape(c, [[x + 24, y], [x + w - 6, y], [x + w - 6, y + 34], [x + 20, y + 34]], S.M, 1.2);
  for (let k = x + 30; k < x + w - 6; k += 14) ln(c, k, y + 2, k, y + 34, 1, S.m); oval(c, x + 16, y - 3, 11, 6, S.W, 1.2); };
LOOK.seat = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 10, S.M); for (let k = x + 8; k < x + w; k += 16) disc(c, k, y + 5, 1.6, S.Y); box(c, x + 2, y + 10, w - 4, 352 - y - 10, S.b); for (let k = x + 10; k < x + w - 4; k += 20) { c.lineWidth = 1.2; c.strokeStyle = K; c.strokeRect(k, y + 18, 12, 352 - y - 26); } };
LOOK.piano = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 352 - y, K, 0); box(c, x, y, w, 8, S.m); box(c, x + 2, y + 8, w - 4, 40, S.M); rect(c, x + 6, y + 50, w - 12, 12, S.W); for (let k = x + 9; k < x + w - 6; k += 7) rect(c, k, y + 50, 3, 7, K); box(c, x + 4, y + 62, 10, 352 - y - 62, S.m); box(c, x + w - 14, y + 62, 10, 352 - y - 62, S.m); for (const k of [x + 30, x + w - 40]) { rect(c, k, 340, 10, 4, S.Y); } c.save(); c.globalAlpha = 0.9; txt(c, '♪', x + w / 2, y + 26, 18, S.Y); c.restore(); };
LOOK.mantel = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x - 4, y, w + 8, 9, S.W); for (const bx of [x + 10, x + w - 10]) shape(c, [[bx - 6, y + 9], [bx + 6, y + 9], [bx, y + 22]], S.w); };
LOOK.table = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); for (const lx of [x + 10, x + w - 10]) turned(c, lx, y + 16, 352, 10, S.Y); rect(c, x + 4, y + 8, w - 8, 12, S.r); ln(c, x + 4, y + 20, x + w - 4, y + 20); box(c, x, y, w, 8, S.Y); };
LOOK.chair = (c, p, R, st) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y);
  box(c, x + w - 8, y - 40, 6, 40, S.y); box(c, x, y, w, 6, S.Y); rect(c, x + 3, y + 6, 4, 352 - y - 6, S.y); rect(c, x + w - 7, y + 6, 4, 352 - y - 6, S.y);
  if (p.mover) { box(c, x + 2, y - 44, w - 4, 10, S.R); disc(c, x + 7, 348, 4, S.W, 1.2); disc(c, x + w - 7, 348, 4, S.W, 1.2); box(c, x + 2, y - 2, w - 4, 6, S.R); } };
LOOK.sideboard = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 8, S.Y); box(c, x + 4, y + 8, w - 8, 80, S.r); box(c, x + 22, y + 14, w - 44, 18, S.R); disc(c, x + w / 2, y + 23, 3, S.Y, 1); box(c, x + 10, y + 40, (w - 28) / 2, 40, S.R); box(c, x + w / 2 + 4, y + 40, (w - 28) / 2, 40, S.R); rect(c, x + 6, y + 88, 6, 352 - y - 88, S.y); rect(c, x + w - 12, y + 88, 6, 352 - y - 88, S.y); };
LOOK.dresser = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x - 4, y, w + 8, 8, S.C); box(c, x, y + 8, w, 352 - y - 8, S.c); box(c, x + 6, y + 16, w / 2 - 9, 30, S.C); box(c, x + w / 2 + 3, y + 16, w / 2 - 9, 30, S.C); box(c, x + 6, y + 54, w - 12, 352 - y - 62, S.C); disc(c, x + w / 2, y + 80, 3, S.Y, 1);
  box(c, x, 184, w, 72, K, 1.2); rect(c, x - 2, 182, 4, 72, S.c); rect(c, x + w - 2, 182, 4, 72, S.c); for (let k = 0; k < 4; k++) oval(c, x + 12 + k * 18, 238, 7, 14, [S.W, S.Y, S.W, S.C][k], 1.2); };
LOOK.shelf = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); rect(c, x, y, w, 6, S.C); ln(c, x, y + 6, x + w, y + 6); for (const bx of [x + 10, x + w - 10]) shape(c, [[bx - 4, y + 6], [bx + 4, y + 6], [bx, y + 18]], S.c); };
LOOK.range = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 352 - y, K); box(c, x, y, w, 8, S.w); box(c, x + 6, y + 14, w - 12, 26, S.R); disc(c, x + w / 2, y + 27, 6, S.Y, 1); box(c, x + 6, y + 44, w - 12, 352 - y - 50, S.w); rect(c, x + 10, y + 50, w - 20, 4, S.Y); box(c, x + w / 2 - 6, 30, 12, y - 30, S.w); };
LOOK.bench = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 9, S.y); for (const lx of [x + 6, x + w - 14]) box(c, lx, y + 9, 8, 352 - y - 9, S.y); rect(c, x + 10, 320, w - 20, 5, S.y); box(c, x + 20, y - 10, 16, 10, S.R); disc(c, x + w - 30, y - 6, 6, S.w, 1); };
LOOK.rack = (c, p, R) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); if (R && PAL[R.pal] && PAL[R.pal].cellar) return LOOK.winerack(c, p); box(c, x, y, w, 6, S.w); for (const bx of [x + 8, x + w - 8]) shape(c, [[bx - 4, y + 6], [bx + 4, y + 6], [bx, y + 16]], S.w); for (let k = x + 8; k < x + w - 8; k += 14) { ln(c, k, y - 24, k, y, 2, S.w); disc(c, k, y - 26, 3, S.R); } };
LOOK.winerack = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 6, S.y); for (let k = x + 8; k < x + w - 4; k += 14) { disc(c, k, y + 18, 6, S.g, 1); disc(c, k, y + 18, 2, S.G); } rect(c, x, y, 5, 352 - y, S.y); rect(c, x + w - 5, y, 5, 352 - y, S.y); };
LOOK.bookledge = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x - 2, y, w + 4, 8, S.y); box(c, x, y + 8, w, 352 - y - 8, S.r); for (let s = 0; s < 4; s++) { const yy = y + 12 + s * 30; ln(c, x, yy + 26, x + w, yy + 26, 2); for (let k = x + 4; k < x + w - 6; k += 7) rect(c, k, yy + (k % 3) * 2, 6, 26 - (k % 3) * 2, [S.G, S.Y, S.C, S.M, S.W][(k + s) % 5]); } };
LOOK.desk = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 8, S.g); box(c, x + 4, y + 8, 30, 352 - y - 8, S.y); box(c, x + w - 34, y + 8, 30, 352 - y - 8, S.y); for (let k = 0; k < 3; k++) { disc(c, x + 19, y + 22 + k * 20, 2, S.Y, 1); disc(c, x + w - 19, y + 22 + k * 20, 2, S.Y, 1); } rect(c, x + 40, y + 8, w - 80, 14, S.y); ln(c, x + 40, y + 22, x + w - 40, y + 22); oval(c, x + 24, y - 14, 10, 4, S.Y, 1); rect(c, x + 22, y - 14, 4, 14, S.Y); };
LOOK.globe = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 6, S.y); rect(c, x + w / 2 - 3, y + 6, 6, 352 - y - 12, S.y); box(c, x + 4, 346, w - 8, 6, S.y); disc(c, x + w / 2, y - 18, 16, S.B, 1.2); shape(c, [[x + w / 2 - 8, y - 28], [x + w / 2 + 4, y - 24], [x + w / 2 - 2, y - 12], [x + w / 2 - 10, y - 16]], S.G); c.beginPath(); c.arc(x + w / 2, y - 18, 20, -2.3, 0.9); c.lineWidth = 2.4; c.strokeStyle = S.Y; c.stroke(); };
LOOK.sink = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 30, S.W); rect(c, x + 8, y + 4, w - 16, 14, S.c); ln(c, x + 8, y + 18, x + w - 8, y + 18); for (const lx of [x + 6, x + w - 16]) bricks(c, lx, y + 30, 10, 352 - y - 30, S.w, 10, 10); rect(c, x + w / 2 - 2, y - 24, 4, 24, S.w); rect(c, x + w / 2 - 2, y - 24, 14, 4, S.w); };
LOOK.mangle = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 6, S.y); for (const ry of [y + 12, y + 28]) { box(c, x + 4, ry - 5, w - 8, 10, S.W); } rect(c, x + 6, y + 6, 4, 352 - y - 6, S.b); rect(c, x + w - 10, y + 6, 4, 352 - y - 6, S.b); disc(c, x + w + 6, y + 18, 12, null, 0); c.beginPath(); c.arc(x + w + 4, y + 20, 12, 0, Math.PI * 2); c.lineWidth = 3; c.strokeStyle = S.b; c.stroke(); ln(c, x + w + 4, y + 20, x + w + 14, y + 8, 3, S.b); disc(c, x + w + 14, y + 8, 3, S.Y); };
LOOK.plantstand = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 6, S.W); rect(c, x + w / 2 - 3, y + 6, 6, 352 - y - 6, S.W); box(c, x + 4, 346, w - 8, 6, S.W); shape(c, [[x + 8, y], [x + w - 8, y], [x + w - 12, y - 16], [x + 12, y - 16]], S.r, 1.2); for (const [dx, dy] of [[-10, -30], [0, -40], [10, -30], [-4, -24], [6, -26]]) oval(c, x + w / 2 + dx, y + dy, 6, 10, S.G, 1, dx * 0.05); };
LOOK.wicker = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); shape(c, [[x - 4, y - 50], [x + 6, y - 54], [x + 10, y], [x, y]], S.Y, 1.2); box(c, x, y, w, 8, S.Y); for (let k = x; k < x + w; k += 6) ln(c, k, y, k, y + 8, 1, S.y); shape(c, [[x + 2, y + 8], [x + w - 2, y + 8], [x + w - 6, 352], [x + 6, 352]], S.y, 1.2); for (let k = y + 14; k < 352; k += 8) ln(c, x + 6, k, x + w - 6, k, 1, S.Y); };
LOOK.pottingbench = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 9, S.y); for (const lx of [x + 6, x + w - 14]) box(c, lx, y + 9, 8, 352 - y - 9, S.y); rect(c, x + 10, 320, w - 20, 6, S.y); for (const px of [x + 22, x + 44]) { shape(c, [[px - 8, 320], [px + 8, 320], [px + 6, 306], [px - 6, 306]], S.r, 1); } };
LOOK.washstand = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 8, S.W); box(c, x + 3, y + 8, w - 6, 40, S.y); disc(c, x + w / 2, y + 28, 2, S.Y, 1); rect(c, x + 4, y + 48, 4, 352 - y - 48, S.y); rect(c, x + w - 8, y + 48, 4, 352 - y - 48, S.y); };
LOOK.frameledge = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); rect(c, x, y, w, 6, S.Y); ln(c, x, y + 6, x + w, y + 6); for (const bx of [x + 8, x + w - 8]) shape(c, [[bx - 4, y + 6], [bx + 4, y + 6], [bx, y + 16]], S.y); };
LOOK.gallery = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 10, S.y); for (let k = x + 6; k < x + w; k += 12) turned(c, k, y - 30, y, 6, S.Y); rect(c, x, y - 34, w, 5, S.y); rect(c, x + 6, y + 10, 8, 352 - y - 10, S.y); for (let k = 0; k < 3; k++) { const yy = y + 30 + k * 34; ln(c, x + 40, yy, x + w, yy, 3, S.y); for (let b = x + 44; b < x + w - 6; b += 7) rect(c, b, yy - 22 + (b % 3) * 2, 6, 22 - (b % 3) * 2, [S.R, S.C, S.Y, S.G, S.M][(b + k) % 5]); } };
LOOK.cot = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); rect(c, x, y, w, 6, S.W); ln(c, x, y + 6, x + w, y + 6); for (let k = x + 4; k < x + w; k += 9) rect(c, k, y + 6, 3, 52, S.W); box(c, x, y + 58, w, 16, S.C); rect(c, x, y + 74, 6, 352 - y - 74, S.W); rect(c, x + w - 6, y + 74, 6, 352 - y - 74, S.W); };
LOOK.toychest = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 352 - y, S.R); box(c, x - 2, y, w + 4, 8, S.Y); for (const [lx, l, col] of [[x + 10, 'A', S.C], [x + 30, 'B', S.G], [x + 50, 'C', S.Y]]) if (lx < x + w - 8) { box(c, lx - 8, y + 18, 16, 16, col); txt(c, l, lx, y + 27, 12, K); } };
LOOK.horse = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y);
  c.beginPath(); c.moveTo(x - 6, 344); c.quadraticCurveTo(x + w / 2, 362, x + w + 6, 344); c.lineWidth = 7; c.strokeStyle = K; c.stroke(); c.lineWidth = 4; c.strokeStyle = S.R; c.stroke();
  for (const lx of [x + 10, x + w - 14]) box(c, lx, y + 10, 6, 340 - y - 10, S.W); box(c, x + 4, y, w - 8, 14, S.W); rect(c, x + 26, y - 2, 30, 6, S.R);
  shape(c, [[x + w - 10, y + 4], [x + w + 8, y - 30], [x + w + 22, y - 22], [x + w + 8, y + 6]], S.W, 1.2); disc(c, x + w + 12, y - 22, 2, K); for (let k = 0; k < 4; k++) rect(c, x + w - 4 + k * 4, y - 26 + k * 7, 4, 6, S.R);
  shape(c, [[x + 4, y + 4], [x - 12, y + 26], [x - 4, y + 26], [x + 8, y + 8]], S.R, 1); };
LOOK.sewingtable = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 8, S.y); box(c, x + 4, y + 8, w - 8, 18, S.r); for (const lx of [x + 6, x + w - 12]) rect(c, lx, y + 26, 6, 352 - y - 26, K); for (const lx of [x + 6, x + w - 12]) { c.lineWidth = 2; c.strokeStyle = S.w; c.strokeRect(lx, y + 26, 6, 352 - y - 26); } box(c, x + 30, 322, w - 60, 10, S.w);
  // sewing machine
  box(c, x + w - 48, y - 30, 12, 30, K, 0); shape(c, [[x + w - 50, y], [x + w - 50, y - 32], [x + w - 10, y - 32], [x + w - 10, y - 22], [x + w - 38, y - 22], [x + w - 38, y]], K, 0); c.lineWidth = 1; c.strokeStyle = S.Y; c.stroke(); txt(c, 'S', x + w - 30, y - 27, 7, S.Y); };
LOOK.bath = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w - 6, y + 36); c.quadraticCurveTo(x + w / 2, y + 56, x + 6, y + 36); c.closePath(); c.fillStyle = S.W; c.fill(); c.lineWidth = 1.2; c.strokeStyle = K; c.stroke(); rect(c, x - 2, y - 2, w + 4, 6, S.W); ln(c, x, y + 4, x + w, y + 4); for (const fx of [x + 14, x + w - 14]) { shape(c, [[fx - 6, y + 46], [fx + 6, y + 46], [fx + 8, 352], [fx - 8, 352]], S.Y, 1); } };
LOOK.basin = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); shape(c, [[x, y], [x + w, y], [x + w - 6, y + 18], [x + 6, y + 18]], S.W, 1.2); rect(c, x + w / 2 - 6, y + 18, 12, 352 - y - 18, S.W); ln(c, x + w / 2 - 6, y + 18, x + w / 2 - 6, 352); ln(c, x + w / 2 + 6, y + 18, x + w / 2 + 6, 352); rect(c, x + w / 2 - 2, y - 14, 4, 14, S.w); };
LOOK.cabinet = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 6, S.W); box(c, x + 4, y - 60, w - 8, 60, S.W); box(c, x + 10, y - 54, w - 20, 48, S.C); disc(c, x + w - 16, y - 30, 2, K); for (const bx of [x + 10, x + w - 10]) shape(c, [[bx - 4, y + 6], [bx + 4, y + 6], [bx, y + 16]], S.w); };
LOOK.trunk = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 352 - y, S.r); rect(c, x, y, w, 8, S.R); ln(c, x, y + 8, x + w, y + 8); for (const bx of [x + 10, x + w - 14]) rect(c, bx, y, 4, 352 - y, S.y); box(c, x + w / 2 - 5, y + 10, 10, 10, S.Y); };
LOOK.rafter = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 10, '#7a4a00'); for (let k = x + 20; k < x + w; k += 40) ln(c, k, y + 2, k + 12, y + 8, 1, S.y); for (const lx of [x + 6, x + w - 14]) box(c, lx, 20, 8, y - 20, '#7a4a00'); };
LOOK.drum = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 352 - y, S.R); for (const ry of [y + 10, y + 34]) rect(c, x, ry, w, 4, S.r); oval(c, x + w / 2, y, w / 2, 4, S.r, 1.2); txt(c, 'OIL', x + w / 2, y + 22, 10, S.Y); };
LOOK.dollshouse = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); shape(c, [[x - 4, y + 4], [x + w / 2, y - 26], [x + w + 4, y + 4]], S.R, 1.2); box(c, x + 4, y + 4, w - 8, 352 - y - 4, S.Y); for (const [wx, wy] of [[x + 14, y + 16], [x + w - 30, y + 16], [x + 14, y + 50], [x + w - 30, y + 50]]) box(c, wx, wy, 16, 14, S.C); box(c, x + w / 2 - 8, 318, 16, 34, S.R); };
LOOK.brick = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y), col = [S.R, S.G, S.B, S.Y][Math.round(p.y) % 4]; box(c, x, y, w, 44, col); txt(c, ['A', 'B', 'C', 'Z'][Math.round(p.y) % 4], x + w / 2, y + 22, 18, S.W); };
LOOK.toyshelf = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 8, S.y); for (let k = x + 12; k < x + w - 12; k += 44) shape(c, [[k - 5, y + 8], [k + 5, y + 8], [k, y + 22]], S.y); rect(c, x - 2, y - 14, 3, 14, S.y); for (let k = x + 4; k < x + w; k += 10) disc(c, k, y - 2, 1.4, S.Y); };
LOOK.hearth = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x - 8, y, w + 16, 352 - y, S.w); };
LOOK.pipeledge = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 10, S.c); oval(c, x, y + 5, 4, 7, S.C, 1); oval(c, x + w, y + 5, 4, 7, S.C, 1); for (const lx of [x + 8, x + w - 12]) rect(c, lx, y + 10, 4, 352 - y - 10, S.c); };
LOOK.tank = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 352 - y, S.b); for (let k = y + 16; k < 352; k += 24) ln(c, x, k, x + w, k, 2, S.B); for (let k = x + 8; k < x + w; k += 22) for (let r = y + 8; r < 352; r += 24) disc(c, k, r, 1.6, S.C); rect(c, x - 4, y - 4, w + 8, 6, S.B); txt(c, 'WATER', x + w / 2, y + 40, 12, S.C); };
LOOK.ridge = (c, p) => { const y = X(p.y); rect(c, 0, y, 512, 384 - y, S.r); for (let r = 0; r < 6; r++) for (let x = (r % 2) * 14; x < 512; x += 28) { c.beginPath(); c.arc(x + 14, y + 10 + r * 14, 14, 0, Math.PI); c.lineWidth = 1.4; c.strokeStyle = K; c.stroke(); } rect(c, 0, y - 4, 512, 6, S.R); ln(c, 0, y + 2, 512, y + 2, 1.4); };
LOOK.bigpot = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x - 4, y, w + 8, 8, S.R); shape(c, [[x, y + 8], [x + w, y + 8], [x + w - 4, 328], [x + 4, 328]], S.r, 1.2); oval(c, x + w / 2, y + 2, w / 2 - 4, 3, K); };
LOOK.pot = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x - 2, y, w + 4, 6, S.R); shape(c, [[x, y + 6], [x + w, y + 6], [x + w - 3, 328], [x + 3, 328]], S.r, 1.2); };
LOOK.pad = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 8, S.w); for (let k = x; k < x + w; k += 12) shape(c, [[k, y], [k + 6, y], [k + 12, y + 8], [k + 6, y + 8]], S.Y); };
LOOK.cloud = (c, p) => { const y = X(p.y); rect(c, 0, y + 10, 512, 384 - y, S.W); for (let x = -10; x < 530; x += 34) oval(c, x, y + 12, 22, 14, S.W); c.save(); c.globalAlpha = 0.25; for (let x = 6; x < 512; x += 48) oval(c, x, y + 28, 16, 4, S.C); c.restore(); };
LOOK.mooring = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 340 - y + 10, S.y); for (let k = x + 4; k < x + w; k += 10) ln(c, k, y, k, 350, 1.2); for (const bx of [x + 6, x + w - 10]) box(c, bx, y - 10, 6, 10, S.y); };
LOOK.cloudbank = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); cloudPuff(c, x + w / 2, y + 12, w * 0.9, S.W, 1.2); rect(c, x + 4, y, w - 8, 6, S.W); };
LOOK.vaultstep = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 340 - y + 12, S.C); ln(c, x, y + 6, x + w, y + 6); };
LOOK.barrel = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); c.beginPath(); c.moveTo(x + 4, y); c.quadraticCurveTo(x - 6, (y + 352) / 2, x + 4, 352); c.lineTo(x + w - 4, 352); c.quadraticCurveTo(x + w + 6, (y + 352) / 2, x + w - 4, y); c.closePath(); c.fillStyle = S.y; c.fill(); c.lineWidth = 1.2; c.strokeStyle = K; c.stroke(); for (const ry of [y + 10, 352 - 12]) rect(c, x, ry, w, 4, S.w); oval(c, x + w / 2, y, w / 2 - 4, 4, S.r, 1); };
LOOK.boiler = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 352 - y, S.R); rect(c, x, y, w, 8, S.r); disc(c, x + w / 2, y + 40, 14, S.W, 1.2); ln(c, x + w / 2, y + 40, x + w / 2 + 8, y + 34, 2); box(c, x + 16, y + 80, w - 32, 40, K); c.save(); c.globalAlpha = 0.9; for (let k = 0; k < 3; k++) shape(c, [[x + 24 + k * 16, y + 118], [x + 30 + k * 16, y + 96], [x + 36 + k * 16, y + 118]], S.Y); c.restore(); box(c, x + w / 2 - 8, 26, 16, y - 26, S.w); };
LOOK.step = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); box(c, x, y, w, 352 - y, S.w); rect(c, x, y, w, 3, S.W); };
LOOK.coal = (c, p) => { const x = X(p.x1), w = X(p.x2 - p.x1), y = X(p.y); shape(c, [[x - 6, 352], [x, y], [x + w, y], [x + w + 6, 352]], '#202020'); for (let k = x; k < x + w; k += 9) disc(c, k + 3, y + 3 + (k % 4), 4, '#404040'); ln(c, x, y, x + w, y, 1.4, S.w); };
LOOK.chimney = () => {};

/* ---------- decor ---------- */
const DEC = {};
DEC.window = (c, d) => { const x = X(d.x), y = X(d.y), w = X(d.w), h = X(d.h); rect(c, x, y, w, h, S.W); rect(c, x + 6, y + 6, w - 12, h - 12, '#000030'); disc(c, x + w * 0.7, y + h * 0.3, Math.min(w, h) * 0.12, S.Y); for (let i = 0; i < 4; i++) star(c, x + 12 + (i * 23) % (w - 20), y + 14 + (i * 17) % (h - 26), 2.4); rect(c, x + w / 2 - 2, y + 6, 4, h - 12, S.W); rect(c, x + 6, y + h / 2 - 2, w - 12, 4, S.W); rect(c, x - 6, y + h - 2, w + 12, 6, S.W); };
DEC.picture = (c, d) => { const x = X(d.x), y = X(d.y), w = X(d.w), h = X(d.h); box(c, x, y, w, h, S.Y); rect(c, x + 5, y + 5, w - 10, h - 10, S[d.col] || S.C); shape(c, [[x + 5, y + h - 5], [x + w * 0.4, y + h * 0.45], [x + w * 0.6, y + h * 0.65], [x + w * 0.75, y + h * 0.5], [x + w - 5, y + h - 5]], S.g); ln(c, x + w / 2, y, x + w / 2, y - 10, 1.2, S.Y); };
DEC.lamp = (c, d) => { const x = X(d.x), y = X(d.y); shape(c, [[x - 12, y - 10], [x + 12, y - 10], [x + 7, y - 30], [x - 7, y - 30]], S.Y, 1.2); rect(c, x - 2, y - 10, 4, 12, S.y); };
DEC.stairwell = (c, d) => { const x1 = X(d.x1), x2 = X(d.x2); rect(c, x1, 300, x2 - x1, 84, K); for (let k = 0; k < 4; k++) rect(c, x1 + 4 + k * 16, 352 + k * 8, 16, 4, S.r); ln(c, x1 - 6, 300, x2 + 6, 300, 6, S.R); for (let k = x1; k <= x2; k += 12) turned(c, k, 300, 352, 6, S.Y); rect(c, x1 - 8, 296, 8, 60, S.Y); rect(c, x2, 296, 8, 60, S.Y); };
DEC.fireplace = (c, d) => { const x1 = X(d.x1), x2 = X(d.x2); box(c, x1, 214, x2 - x1, 138, S.W); rect(c, x1 + 14, 240, x2 - x1 - 28, 112, K); for (let k = 0; k < 3; k++) shape(c, [[x1 + 28 + k * 14, 352], [x1 + 34 + k * 14, 320 - k * 4], [x1 + 40 + k * 14, 352]], k % 2 ? S.Y : S.R); };
DEC.pans = (c, d) => { const x = X(d.x), y = X(d.y); rect(c, x - 10, y, 120, 4, S.w); for (let k = 0; k < 4; k++) { disc(c, x + k * 28, y + 24, 10, [S.R, S.C, S.Y, S.R][k], 1.2); ln(c, x + k * 28, y + 14, x + k * 28, y + 4, 2, S.w); } };
DEC.garagedoor = (c, d) => { const x1 = X(d.x1), x2 = X(d.x2); rect(c, x1, 150, x2 - x1, 202, S.g); for (let k = 156; k < 352; k += 16) ln(c, x1, k, x2, k, 1.4); };
DEC.tools = (c, d) => { const x = X(d.x), y = X(d.y); box(c, x, y, 110, 70, S.y); for (let k = 0; k < 5; k++) { ln(c, x + 14 + k * 20, y + 10, x + 14 + k * 20, y + 54, 3, [S.R, S.C, S.W, S.Y, S.G][k]); } };
DEC.pegs = (c, d) => { const x1 = X(d.x1), x2 = X(d.x2), y = X(d.y); rect(c, x1, y, x2 - x1, 6, S.y); for (let k = x1 + 10; k < x2; k += 24) disc(c, k, y + 10, 3, S.Y, 1); };
DEC.curtain = (c, d) => { const x0 = d.side === 'left' ? 200 : 312; for (const [xx, s] of [[x0, 1]]) { shape(c, [[xx, 50], [xx + 18 * s, 50], [xx + 12 * s, 160], [xx, 160]], S.M); } };
DEC.books = (c, d) => { const x = X(d.x), y = X(d.y), w = X(d.w), h = X(d.h); box(c, x, y, w, h, S.r); for (let yy = y + 4; yy < y + h - 20; yy += 28) { ln(c, x, yy + 24, x + w, yy + 24, 2); for (let k = x + 4; k < x + w - 6; k += 7) rect(c, k, yy + (k % 3) * 2, 6, 24 - (k % 3) * 2, [S.G, S.Y, S.C, S.M, S.W][(k + yy) % 5]); } };
DEC.dumbwaiter = (c, d) => { const x1 = X(d.x1), x2 = X(d.x2); box(c, x1, 200, x2 - x1, 152, S.w); rect(c, x1 + 6, 206, x2 - x1 - 12, 140, K); for (let k = 210; k < 346; k += 10) ln(c, x1 + 6, k, x2 - 6, k, 1, '#303030'); txt(c, 'LIFT', (x1 + x2) / 2, 194, 10, S.Y); };
DEC.glasshouse = c => { rect(c, 0, 0, 512, 240, '#001a00'); for (let x = 0; x <= 512; x += 64) rect(c, x - 3, 0, 6, 240, S.W); for (let y = 0; y <= 240; y += 60) rect(c, 0, y - 3, 512, 6, S.W); for (let i = 0; i < 18; i++) star(c, 20 + (i * 71) % 480, 20 + (i * 43) % 200, 2); disc(c, 90, 60, 18, S.Y); disc(c, 100, 54, 16, '#001a00'); for (let x = 0; x < 512; x += 30) { oval(c, x + 10, 232, 10, 20, S.g, 1); } };
DEC.sign = (c, d) => { const x = X(d.x), y = X(d.y); ln(c, x + 30, y + 60, x + 30, y + 120, 3, S.y); box(c, x - 6, y, 72, 60, S.W); d.text.forEach((t, i) => txt(c, t, x + 30, y + 12 + i * 12, 7.5, S.r)); };
DEC.wardrobe = (c, d) => { const x1 = X(d.x1), x2 = X(d.x2), y = X(d.y), w = x2 - x1;
  box(c, x1, y, w, 352 - y, S.y); rect(c, x1 - 4, y - 8, w + 8, 10, S.Y); ln(c, x1 - 4, y + 2, x2 + 4, y + 2);
  rect(c, x1 + 8, y + 12, w - 16, 352 - y - 16, '#3a2000'); for (let k = x1 + 14; k < x2 - 8; k += 12) ln(c, k, y + 12, k, 348, 1, '#5a3a00');
  ln(c, x1 + 10, y + 22, x2 - 10, y + 22, 2.4, S.w); for (const hx of [x1 + 24, x1 + 54, x1 + 74]) { ln(c, hx, y + 22, hx, y + 30, 1.4, S.w); shape(c, [[hx - 10, y + 36], [hx, y + 30], [hx + 10, y + 36]], null, 1.4); }
  rect(c, x1 + 10, 345, w - 20, 2.5, S.Y); // line of light under the back panel
  // open doors swung outwards
  shape(c, [[x1, y + 4], [x1 - 22, y + 14], [x1 - 22, 344], [x1, 352]], S.Y, 1.2); shape(c, [[x2, y + 4], [x2 + 22, y + 14], [x2 + 22, 344], [x2, 352]], S.Y, 1.2);
  disc(c, x1 - 18, y + 100, 2.4, S.r, 1); disc(c, x2 + 18, y + 100, 2.4, S.r, 1); };
DEC.wardrobeClosed = (c, d) => { const x1 = X(d.x1), x2 = X(d.x2), y = X(d.y), w = x2 - x1; box(c, x1, y, w, 352 - y, S.y); rect(c, x1 - 4, y - 8, w + 8, 10, S.Y); box(c, x1 + 8, y + 12, w / 2 - 10, 352 - y - 28, S.Y); box(c, x1 + w / 2 + 2, y + 12, w / 2 - 10, 352 - y - 28, S.Y); disc(c, x1 + w / 2 - 6, y + 90, 2.5, S.r, 1); disc(c, x1 + w / 2 + 6, y + 90, 2.5, S.r, 1); rect(c, x1 + w / 2 - 1, y + 12, 2, 352 - y - 28, K); };
DEC.sheepframe = (c, d) => { const x = X(d.x), y = X(d.y), w = X(d.w), h = X(d.h); box(c, x, y, w, h, S.Y); rect(c, x + 5, y + 5, w - 10, h - 10, S.G); rect(c, x + 5, y + h - 18, w - 10, 13, S.g); for (let k = 0; k < 3; k++) rect(c, x + 12 + k * 10, y + h - 30, 2, 14, S.W); rect(c, x + 10, y + h - 26, w - 20, 2, S.W); sheep(c, x + w / 2 - 4, y + h - 34, 0.55); };
DEC.sheepwall = c => { for (let r = 0; r < 4; r++) for (let x = 30 + (r % 2) * 40; x < 500; x += 80) {
    const odd = r === 1 && x > 300 && x < 400, yy = 70 + r * 46;
    if (odd) { rect(c, x - 13, yy - 25, 30, 32, '#202060'); sheep(c, x, yy - 10, 0.45); c.lineWidth = 3.5; c.strokeStyle = S.Y; c.strokeRect(x - 13, yy - 25, 30, 32); rect(c, x - 13, yy - 25, 6, 32, S.Y); }
    else { for (let k = 0; k < 3; k++) rect(c, x + 14 + k * 5, yy + 2, 1.5, 9, S.W); rect(c, x + 12, yy + 4, 16, 1.5, S.W); sheep(c, x, yy - 6, 0.45); }
  } };
DEC.mobile = (c, d) => { const x = X(d.x), y = X(d.y); ln(c, x, 25, x, y, 1.4, S.W); ln(c, x - 30, y, x + 30, y, 2, S.W); for (const [dx, col] of [[-30, S.Y], [0, S.C], [30, S.M]]) { ln(c, x + dx, y, x + dx, y + 14, 1, S.W); star(c, x + dx, y + 20, 6, col); } };
DEC.dummy = (c, d) => { const x = X(d.x), y = X(d.y); };
DEC.mirror = (c, d) => { const x = X(d.x), y = X(d.y); };
DEC.roofbeams = c => {};
DEC.balloon = () => {};
DEC.ropeladder = () => {};
DEC.chimneybreast = (c, d) => { const x1 = X(d.x1), x2 = X(d.x2); bricks(c, x1, 20, x2 - x1, 332, S.r, 10, 22); rect(c, x1 + 18, 270, x2 - x1 - 36, 70, K); rect(c, x1 + 30, 20, x2 - x1 - 60, 250, '#300000'); };
DEC.pipes = (c, d) => { const y = X(d.y); rect(c, 0, y, 512, 10, S.c); ln(c, 0, y, 512, y); ln(c, 0, y + 10, 512, y + 10); for (let x = 60; x < 512; x += 120) { rect(c, x, y - 4, 10, 18, S.C); } };
DEC.nightsky = () => {};
DEC.stack = (c, d) => { };
DEC.windbreak = (c, d) => { const x1 = X(d.x1), x2 = X(d.x2); bricks(c, x1, 200, x2 - x1, 128, S.r, 10, 14); rect(c, x1 - 4, 196, x2 - x1 + 8, 6, S.w); };
DEC.rocket = () => {};
DEC.dreamsky = () => {};
DEC.lighthouse = (c, d) => { const x = X(d.x), y = X(d.y); shape(c, [[x - 14, y], [x + 14, y], [x + 8, y - 70], [x - 8, y - 70]], S.W, 1.2); for (let k = 0; k < 3; k++) shape(c, [[x - 13 + k * 2, y - 14 - k * 20], [x + 13 - k * 2, y - 14 - k * 20], [x + 12 - k * 2, y - 22 - k * 20], [x - 12 + k * 2, y - 22 - k * 20]], S.R); box(c, x - 10, y - 86, 20, 16, S.Y); shape(c, [[x - 12, y - 86], [x, y - 98], [x + 12, y - 86]], S.R, 1.2); };
DEC.vault = (c, d) => { const x1 = X(d.x1), x2 = X(d.x2); for (let k = 0; k < 3; k++) { shape(c, [[x1 + k * 20, 340], [x1 + k * 20, 170 + k * 6], [x2, 170 + k * 6], [x2, 340]], k === 0 ? S.b : null); } box(c, x1, 160, x2 - x1, 10, S.C); for (let x = x1 + 8; x < x2; x += 18) box(c, x, 170, 8, 170, S.C); };
DEC.cellarwall = c => { };
DEC.trapdoorabove = (c, d) => { const x = X(d.x); box(c, x - 22, 4, 44, 12, S.y); for (let k = x - 18; k < x + 22; k += 10) ln(c, k, 4, k, 16, 1); };
DEC.rug = (c, d) => { const x1 = X(d.x1), x2 = X(d.x2); };

function sheep(c, x, y, s) { const odd = false;
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const [dx, dy] of [[-14, 0], [0, -6], [14, 0], [-6, 8], [8, 8], [0, 2]]) disc(c, dx, dy, 12, odd ? S.Y : S.W, 1.2);
  oval(c, 22, -2, 8, 7, K); disc(c, 25, -4, 1.6, S.W);
  for (const lx of [-10, 10]) rect(c, lx, 14, 4, 12, K);
  if (odd) { ln(c, 28, 4, 40, 16, 2.4, S.Y); oval(c, 42, 18, 6, 3, S.Y, 1.2); }
  c.restore();
}

/* ---------- doors and use-spot fixtures ---------- */
function backDoor(c, x1, x2, col, low) {
  const w = X(x2 - x1), x = X(x1), h = low ? 70 : 104, top = 352 - h;
  rect(c, x - 6, top - 6, w + 12, h + 6, S.W); rect(c, x - 2, top - 2, w + 4, h + 2, K);   // recessed frame
  rect(c, x + 2, top + 2, w - 4, h - 2, col); for (let k = x + 2 + (w - 4) / 4; k < x + w - 2; k += (w - 4) / 4) ln(c, k, top + 2, k, 352, 1.2);
  rect(c, x + 2, top + 2, w - 4, 5, 'rgba(0,0,0,0.45)'); rect(c, x + 2, top + 2, 4, h - 2, 'rgba(0,0,0,0.45)');
  disc(c, x + w - 9, top + h * 0.55, 3, S.Y, 1);
}
/* front doors: the dark opening is painted behind Norris (static layer); only the arch frame is drawn over him */
function frontDoorFill(c, x1, x2, low) {
  const w = X(x2 - x1) + 8, x = X(x1) - 4, h = low ? 76 : 112, top = 362 - h;
  c.save(); c.beginPath(); c.moveTo(x, 384); c.lineTo(x, top + 14); c.quadraticCurveTo(x + w / 2, top - 8, x + w, top + 14); c.lineTo(x + w, 384); c.closePath();
  c.fillStyle = '#000000'; c.fill(); c.restore();
}
function frontDoor(c, x1, x2, col, low) {
  const w = X(x2 - x1) + 8, x = X(x1) - 4, h = low ? 76 : 112, top = 362 - h;
  c.save(); c.beginPath(); c.moveTo(x, 384); c.lineTo(x, top + 14); c.quadraticCurveTo(x + w / 2, top - 8, x + w, top + 14); c.lineTo(x + w, 384);
  c.lineWidth = 3; c.strokeStyle = col; c.stroke(); c.restore();
  c.save(); c.globalAlpha = 0.5; ln(c, x + 6, top + 18, x + 6, 380, 1.4, col); ln(c, x + w - 6, top + 18, x + w - 6, 380, 1.4, col); c.restore();
}
const SPOTLOOK = {
  servinghatch: (c, s) => { const x = X(s.x1) - 2, w = X(s.x2 - s.x1) + 4, y = X(s.y) - 52; box(c, x - 4, y - 4, w + 8, 52, S.W); box(c, x, y, w / 2, 44, S.y); box(c, x + w / 2, y, w / 2, 44, S.y); disc(c, x + w / 2 - 4, y + 22, 2, S.Y, 1); disc(c, x + w / 2 + 4, y + 22, 2, S.Y, 1); },
  trapdoor: (c, s, R, st) => { const x = X(s.x1) - 6, w = X(s.x2 - s.x1) + 12; box(c, x, 353, w, 8, S.y); for (let k = x + 6; k < x + w; k += 8) ln(c, k, 353, k, 361, 1); disc(c, x + w / 2, 357, 2.4, S.w, 1); if (!(st.flags.cellar_open)) { box(c, x + w / 2 - 6, 340, 12, 12, S.Y); c.beginPath(); c.arc(x + w / 2, 340, 5, Math.PI, 0); c.lineWidth = 2.4; c.strokeStyle = S.w; c.stroke(); } },
  loftladder: (c, s, R, st) => { if (!st.flags.hatch_down) return; const x = X(s.x1), x2 = X(s.x2); for (const lx of [x, x2]) ln(c, lx, 26, lx, 352, 4, S.y); for (let y = 40; y < 352; y += 22) ln(c, x, y, x2, y, 3, S.y); },
  cord: (c, s, R, st) => { const x = X((s.x1 + s.x2) / 2); ln(c, x, 196, x, 300, 1.6, S.W); oval(c, x, 306, 4, 7, S.R, 1.2); const up = s.kind === 'up'; shape(c, up ? [[x - 6, 186], [x + 6, 186], [x, 176]] : [[x - 6, 176], [x + 6, 176], [x, 186]], st.flags.power_on && st.rides > 0 ? S.G : S.r, 1); },
  panel: (c, s) => { const x = X(s.x1), w = X(s.x2 - s.x1), top = 248; rect(c, x - 4, top - 4, w + 8, 108, S.Y); rect(c, x, top, w, 104, '#3a2000'); for (let k = x + 6; k < x + w; k += 8) ln(c, k, top, k, 352, 1, '#5a3a00'); },
  lowdoor: () => {},
  floorhatch: (c, s, R, st) => { const x = X(s.x1) - 4, w = X(s.x2 - s.x1) + 8; if (st.flags.hatch_down) { rect(c, x, 353, w, 8, K); for (const lx of [x + 6, x + w - 6]) ln(c, lx, 326, lx, 356, 3, S.y); for (let y = 330; y < 356; y += 10) ln(c, x + 6, y, x + w - 6, y, 2.4, S.y); } else { box(c, x, 353, w, 8, S.y); disc(c, x + w / 2, 357, 2.2, S.w, 1); } },
  crank: (c, s) => { const x = X((s.x1 + s.x2) / 2), y = 300; c.beginPath(); c.arc(x, y, 16, 0, Math.PI * 2); c.lineWidth = 4; c.strokeStyle = S.w; c.stroke(); for (let a = 0; a < 6; a++) ln(c, x, y, x + Math.cos(a) * 16, y + Math.sin(a) * 16, 2, S.w); ln(c, x + 16, y, x + 24, y + 12, 3, S.w); disc(c, x + 24, y + 14, 3.5, S.R, 1); ln(c, x, 200, x, y - 16, 1.6, S.W); }
};
function drawSpots(c, R, st) {
  const P = PAL[R.pal] || {};
  for (const s of R.spots || []) {
    if (s.hidden) continue;
    if (s.kind === 'front' && s.look === 'lowdoor') { frontDoorFill(c, s.x1, s.x2, true); continue; }
    if (s.look && s.look !== 'lowdoor' && SPOTLOOK[s.look]) { SPOTLOOK[s.look](c, s, R, st); continue; }
    if (s.look === 'none') continue;
    if (s.kind === 'back') backDoor(c, s.x1, s.x2, P.door || S.R, s.look === 'lowdoor');
    else if (s.kind === 'front') frontDoorFill(c, s.x1, s.x2, false);
  }
}
function drawFrontDoors(c, R) {
  const P = PAL[R.pal] || {};
  for (const s of R.spots || []) if (s.kind === 'front' && !s.look || (s.kind === 'front' && s.look === 'lowdoor')) frontDoor(c, s.x1, s.x2, P.door || S.Y, s.look === 'lowdoor');
}

/* ---------- fixed things ---------- */
const THING = {
  rooster: (c, th, st, t) => { const x = X((th.x1 + th.x2) / 2), y = X(th.y2), ring = st.won;
    const j = ring ? Math.sin(t * 60) * 2 : 0; c.save(); c.translate(x + j, y);
    for (const d of [-1, 1]) { disc(c, d * 9, -30, 6, S.Y, 1.2); }
    disc(c, 0, -16, 13, S.R, 1.4); disc(c, 0, -16, 10, S.W); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; disc(c, Math.sin(a) * 8, -16 - Math.cos(a) * 8, 0.8, K); }
    ln(c, 0, -16, 0, -22, 1.6); ln(c, 0, -16, 5, -14, 1.6); rect(c, -9, -4, 4, 4, S.Y); rect(c, 5, -4, 4, 4, S.Y);
    // little rooster on top
    oval(c, 0, -34, 7, 5, S.W, 1); disc(c, 6, -40, 3.5, S.W, 1); shape(c, [[8, -44], [11, -46], [10, -42]], S.R); shape(c, [[9, -40], [13, -39], [9, -38]], S.Y); shape(c, [[-6, -34], [-12, -42], [-9, -32]], S.G, 1);
    c.restore(); },
  lofthatch: (c, th, st) => { const x = X(th.x1), w = X(th.x2 - th.x1); if (st.flags.hatch_down) { rect(c, x, 22, w, 8, K); } else { box(c, x, 22, w, 8, S.y); c.beginPath(); c.arc(x + w / 2, 34, 4, 0, Math.PI * 2); c.lineWidth = 2; c.strokeStyle = S.W; c.stroke(); } },
  padlock: (c, th, st) => { if (st.flags.garage_open) return; const x = X((th.x1 + th.x2) / 2), y = 290; c.beginPath(); c.arc(x, y - 8, 8, Math.PI, 0); c.lineWidth = 3.4; c.strokeStyle = S.w; c.stroke(); box(c, x - 10, y - 8, 20, 18, S.Y); disc(c, x, y, 2.4, K); ln(c, x, y, x, y + 6, 1.6); },
  meter: (c, th, st) => { const x = X(th.x1), w = X(th.x2 - th.x1); box(c, x, 236, w, 42, S.w); box(c, x + 4, 242, w - 8, 14, st.flags.power_on ? S.G : K); rect(c, x + w / 2 - 5, 264, 10, 3, K); txt(c, '1/-', x + w / 2, 272, 6, K); if (st.flags.power_on) ln(c, x + 8, 254, x + w - 8, 244, 1.6); },
  switch: (c, th, st) => { const x = X(th.x1), w = X(th.x2 - th.x1), on = st.flags.power_on && st.rides > 0; box(c, x, 246, w, 28, S.W); box(c, x + w / 2 - 3, on ? 248 : 260, 6, 12, S.r); disc(c, x + w / 2, 236, 4, on ? S.G : S.r, 1); if (st.flags.power_on) txt(c, String(st.rides), x + w / 2, 284, 9, S.Y); },
  nightlight: (c, th, st, t) => { const x = X((th.x1 + th.x2) / 2), y = X(th.y2) - 52; const on = st.flags.nightlight_on;
    if (on) { const g = c.createRadialGradient(x, y - 16, 2, x, y - 16, 60); g.addColorStop(0, 'rgba(255,255,140,0.55)'); g.addColorStop(1, 'rgba(255,255,140,0)'); c.fillStyle = g; c.fillRect(x - 60, y - 76, 120, 120); }
    shape(c, [[x - 10, y], [x + 10, y], [x + 6, y - 8], [x - 6, y - 8]], S.b, 1); oval(c, x, y - 18, 9, 11, on ? S.Y : '#303030', 1.2); disc(c, x + 4, y - 22, 2, on ? S.W : S.w); },
  hottap: (c, th) => { const x = X((th.x1 + th.x2) / 2), y = X(th.y2) - 96; rect(c, x - 3, y - 26, 6, 26, S.Y); rect(c, x - 3, y - 26, 18, 6, S.Y); ln(c, x - 3, y - 26, x + 15, y - 26); box(c, x - 9, y - 34, 18, 6, S.R); txt(c, 'H', x, y - 42, 9, S.R); },
  tanktap: (c, th) => { const x = X(th.x1) + 6, y = 236; box(c, x - 4, y, 18, 8, S.C); box(c, x + 10, y + 2, 6, 14, S.C); box(c, x - 6, y - 8, 22, 6, S.B); },
  torchholder: (c, th, st, t) => { const x = X((th.x1 + th.x2) / 2), y = X(th.y2); box(c, x - 3, y - 70, 6, 70, S.Y); box(c, x - 9, y - 76, 18, 8, S.Y); if (st.flags.saucers_gone) { drawItemArt(c, 'torch', x, y - 74, 0.3, 'charged', t); const g = c.createRadialGradient(x + 8, y - 90, 2, x + 8, y - 90, 90); g.addColorStop(0, 'rgba(255,255,120,0.6)'); g.addColorStop(1, 'rgba(255,255,120,0)'); c.fillStyle = g; c.fillRect(x - 80, y - 180, 200, 180); } },
  charger: (c, th, st, t) => { const x = X(th.x1), w = X(th.x2 - th.x1); box(c, x, 324, w, 28, S.w); rect(c, x + 4, 330, w - 8, 8, K); for (let k = 0; k < 3; k++) rect(c, x + 6 + k * 7, 332, 4, 4, (Math.floor(t * 3) % 3) >= k ? S.G : '#004000'); ln(c, x + w / 2, 324, x + w / 2 + 10, 300, 1.6, S.R); txt(c, '⚡', x + w / 2, 346, 9, S.Y); }
};

/* ---------- items (100-unit box, bottom centre at 50,100) ---------- */
const ell = H.ell, hbox = H.box, poly = H.poly, line = H.line, FS = H.fillStroke;
function key(c, col, bow) { ell(c, 30, 60, 16, 16, col, 3.4); ell(c, 30, 60, 6, 6, '#000000', 0); hbox(c, 44, 56, 46, 8, 2, col, 3); hbox(c, 74, 64, 6, 14, 1, col, 2.6); hbox(c, 84, 64, 6, 10, 1, col, 2.6); if (bow) bow(); }
const ITEM = {
  hwb: (c, v) => { const full = v === 'full'; const w = full ? 32 : 28; c.beginPath(); c.moveTo(50 - w, 96); c.quadraticCurveTo(50 - w - 4, 50, 50 - w + 8, 40); c.lineTo(42, 34); c.lineTo(58, 34); c.lineTo(50 + w - 8, 40); c.quadraticCurveTo(50 + w + 4, 50, 50 + w, 96); c.closePath(); FS(c, '#FF0000', 3.4);
    for (let y = 50; y < 92; y += 8) line(c, 50 - w + 8, y, 50 + w - 8, y, 1.6); hbox(c, 42, 20, 16, 16, 2, '#00FFFF', 3); if (full) for (const dx of [-8, 4, 14]) { c.beginPath(); c.moveTo(50 + dx, 16); c.quadraticCurveTo(56 + dx, 8, 50 + dx, 0); c.lineWidth = 2.4; c.strokeStyle = '#FFFFFF'; c.stroke(); } },
  can: (c, v) => { hbox(c, 20, 36, 60, 62, 4, '#FF0000', 3.4); hbox(c, 26, 46, 48, 30, 2, '#FFFF00', 2.6); c.font = 'bold 13px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#000'; c.fillText('OIL', 50, 66); hbox(c, 58, 22, 14, 16, 2, '#D7D7D7', 3); line(c, 26, 34, 50, 18, 3); line(c, 50, 18, 56, 30, 3); if (v === 'full') { ell(c, 50, 86, 26, 6, '#FF00FF', 0); ell(c, 64, 14, 3, 5, '#FF00FF', 2); } },
  shilling: c => { ell(c, 50, 70, 26, 26, '#D7D7D7', 3.4); ell(c, 50, 70, 19, 19, '#FFFFFF', 2); c.font = 'bold 18px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#000'; c.fillText('1/-', 50, 77); },
  garagekey: c => key(c, '#00D7D7'), cellarkey: c => key(c, '#00FF00'), drawerkey: c => { c.save(); c.translate(50, 70); c.scale(0.75, 0.75); c.translate(-50, -70); key(c, '#FFFF00'); c.restore(); },
  windingkey: c => { ell(c, 30, 46, 16, 22, '#FFFF00', 3.4); ell(c, 70, 46, 16, 22, '#FFFF00', 3.4); ell(c, 30, 46, 6, 10, '#D7D700', 0); ell(c, 70, 46, 6, 10, '#D7D700', 0); hbox(c, 44, 40, 12, 16, 3, '#FFFF00', 3); hbox(c, 45, 54, 10, 42, 2, '#FFFF00', 3); H.shine(c, 26, 36, 5, 3, 0.6); },
  hookpole: c => { c.save(); c.translate(50, 60); c.rotate(-0.8); hbox(c, -4, -60, 8, 110, 2, '#D7D700', 3); c.beginPath(); c.arc(-6, -62, 10, Math.PI, 0); c.lineWidth = 5; c.strokeStyle = '#D7D7D7'; c.stroke(); c.restore(); },
  remote: c => V.drawObject(c, 'remote', 50, 100, 1),
  umbrella: c => V.drawObject(c, 'umbrella', 50, 100, 1),
  torch: (c, v) => { const on = v === 'charged'; hbox(c, 18, 52, 50, 24, 4, '#0000FF', 3.4); hbox(c, 64, 46, 20, 36, 3, '#D7D7D7', 3.2); ell(c, 84, 64, 4, 16, on ? '#FFFF00' : '#404040', 2.6); hbox(c, 34, 46, 10, 8, 2, '#FF0000', 2.4); for (const sx of [40, 50]) ell(c, sx, 82, 3, 3, '#FFFF00', 0); if (on) for (const a of [-0.4, 0, 0.4]) line(c, 92, 64 + a * 10, 100, 64 + a * 30, 2.4); },
  wcan: (c, v) => { hbox(c, 24, 46, 46, 50, 6, '#00D700', 3.4); line(c, 66, 58, 92, 34, 6); hbox(c, 86, 26, 12, 10, 2, '#00FF00', 2.6); c.beginPath(); c.arc(30, 56, 16, Math.PI * 0.5, Math.PI * 1.5); c.lineWidth = 4; c.strokeStyle = '#000'; c.stroke(); if (v === 'full') { ell(c, 47, 50, 20, 4, '#00FFFF', 0); for (const [dx, dy] of [[96, 44], [92, 52]]) ell(c, dx, dy, 2.2, 3.2, '#00FFFF', 0); } },
  bulb: c => { ell(c, 50, 50, 22, 26, '#FFFF00', 3.4); hbox(c, 40, 72, 20, 22, 2, '#D7D7D7', 3); for (let y = 78; y < 94; y += 5) line(c, 40, y, 60, y, 1.6); H.shine(c, 42, 40, 6, 9, 0.6); line(c, 44, 60, 50, 46, 1.6); line(c, 56, 60, 50, 46, 1.6); },
  scissors: c => { line(c, 30, 30, 70, 82, 5); line(c, 70, 30, 30, 82, 5); ell(c, 26, 86, 10, 10, '#FF0000', 3.4); ell(c, 74, 86, 10, 10, '#FF0000', 3.4); ell(c, 26, 86, 4, 4, '#000', 0); ell(c, 74, 86, 4, 4, '#000', 0); ell(c, 50, 56, 3, 3, '#FFFF00', 2); },
  feather: c => { c.save(); c.translate(50, 60); c.rotate(0.5); c.beginPath(); c.moveTo(0, -46); c.quadraticCurveTo(22, -16, 4, 38); c.lineTo(-4, 38); c.quadraticCurveTo(-22, -16, 0, -46); FS(c, '#FFFFFF', 3); line(c, 0, -40, 0, 46, 2.4); for (let y = -30; y < 30; y += 9) { line(c, 0, y, 10, y - 6, 1.4); line(c, 0, y, -10, y - 6, 1.4); } c.restore(); },
  whistle: c => { hbox(c, 14, 54, 70, 16, 6, '#D7D7D7', 3.4); for (const hx of [34, 48, 62]) ell(c, hx, 62, 3, 3, '#000', 0); hbox(c, 10, 52, 12, 20, 3, '#FFFF00', 3); line(c, 80, 56, 84, 56, 2); },
  teacosy: c => { c.beginPath(); c.moveTo(14, 96); c.quadraticCurveTo(12, 30, 50, 28); c.quadraticCurveTo(88, 30, 86, 96); c.closePath(); FS(c, '#FF00FF', 3.4); for (let y = 44; y < 96; y += 12) line(c, 18, y, 82, y, 1.6); ell(c, 50, 24, 9, 9, '#FFFF00', 3); },
  duck: c => { ell(c, 50, 74, 32, 20, '#FFFF00', 3.4); ell(c, 70, 44, 16, 16, '#FFFF00', 3.4); poly(c, [[84, 44], [98, 48], [84, 52]]); c.closePath(); FS(c, '#FF0000', 2.4); ell(c, 74, 40, 3, 3, '#000', 0); c.beginPath(); c.moveTo(30, 70); c.quadraticCurveTo(46, 62, 56, 74); FS(c, null, 2.4); },
  boot: c => { poly(c, [[30, 20], [56, 20], [58, 70], [90, 76], [92, 96], [26, 96]]); c.closePath(); FS(c, '#D70000', 3.4); line(c, 26, 90, 92, 90, 2.6); for (const y of [32, 44, 56]) line(c, 36, y, 52, y, 2); },
  sock: c => { poly(c, [[34, 14], [60, 14], [60, 66], [86, 74], [84, 96], [44, 96], [34, 80]]); c.closePath(); FS(c, '#00FFFF', 3.4); for (const y of [26, 40, 54]) line(c, 34, y, 60, y, 3); hbox(c, 32, 10, 30, 10, 2, '#FFFFFF', 3); },
  peg: c => { hbox(c, 40, 16, 9, 80, 3, '#D7D700', 3); hbox(c, 51, 16, 9, 80, 3, '#D7D700', 3); ell(c, 50, 46, 8, 5, '#D7D7D7', 2.6); },
  // food
  cocoa: c => V.drawObject(c, 'cocoa', 50, 100, 1),
  custard: c => { hbox(c, 16, 44, 68, 18, 4, '#D7D700', 3.4); hbox(c, 18, 60, 64, 8, 2, '#FFFFFF', 2.4); hbox(c, 16, 66, 68, 18, 4, '#D7D700', 3.4); for (let x = 24; x < 80; x += 10) ell(c, x, 52, 2, 2, '#A0A000', 0); },
  crumpet: c => { ell(c, 50, 74, 36, 18, '#D7D700', 3.4); ell(c, 50, 64, 34, 14, '#FFFF00', 3); for (const [dx, dy] of [[36, 62], [50, 60], [64, 64], [44, 68], [58, 70]]) ell(c, dx, dy, 2.6, 1.8, '#A0A000', 0); hbox(c, 44, 56, 16, 8, 2, '#FFFFFF', 2); for (const dx of [-10, 6]) { c.beginPath(); c.moveTo(50 + dx, 44); c.quadraticCurveTo(56 + dx, 34, 50 + dx, 26); c.lineWidth = 2.4; c.strokeStyle = '#FFFFFF'; c.stroke(); } },
  tart: c => { ell(c, 50, 74, 34, 16, '#D7D700', 3.4); ell(c, 50, 70, 24, 10, '#FF0000', 2.6); H.shine(c, 42, 66, 6, 3, 0.5); for (let a = 0; a < 10; a++) ell(c, 50 + Math.cos(a * 0.63) * 30, 74 + Math.sin(a * 0.63) * 13, 3, 2, '#FFFF00', 0); },
  pudding: c => { c.beginPath(); c.moveTo(16, 60); c.lineTo(84, 60); c.quadraticCurveTo(80, 96, 50, 96); c.quadraticCurveTo(20, 96, 16, 60); FS(c, '#0000FF', 3.4); ell(c, 50, 60, 34, 8, '#FFFFFF', 3); ell(c, 52, 58, 6, 3, '#FF0000', 0); hbox(c, 68, 34, 6, 28, 2, '#D7D7D7', 2.4); },
  milk: c => { poly(c, [[30, 30], [70, 30], [64, 96], [36, 96]]); c.closePath(); FS(c, 'rgba(255,255,255,0.35)', 3.4); poly(c, [[33, 44], [67, 44], [64, 94], [36, 94]]); c.closePath(); FS(c, '#FFFFFF', 0); H.shine(c, 40, 56, 3, 12, 0.6); for (const dx of [-6, 8]) { c.beginPath(); c.moveTo(50 + dx, 24); c.quadraticCurveTo(56 + dx, 14, 50 + dx, 4); c.lineWidth = 2.4; c.strokeStyle = '#FFFFFF'; c.stroke(); } }
};
function drawItemArt(c, id, x, y, s, variant, t) {
  const f = ITEM[id]; if (!f) return;
  c.save(); c.translate(x, y); c.scale(s, s); c.translate(-50, -100); f(c, variant, t || 0); c.restore();
}

/* ---------- remaining decor ---------- */
DEC.dummy = (c, d) => { const x = X(d.x), y = X(d.y); ln(c, x, y - 4, x, y - 50, 3, S.y); shape(c, [[x - 20, y - 4], [x + 20, y - 4], [x, y - 14]], S.y, 1.2);
  c.beginPath(); c.moveTo(x - 16, y - 50); c.quadraticCurveTo(x - 26, y - 90, x - 18, y - 118); c.lineTo(x + 18, y - 118); c.quadraticCurveTo(x + 26, y - 90, x + 16, y - 50); c.closePath(); c.fillStyle = S.M; c.fill(); c.lineWidth = 1.4; c.strokeStyle = K; c.stroke();
  rect(c, x - 3, y - 128, 6, 10, S.y); disc(c, x, y - 130, 4, S.y, 1); ln(c, x - 18, y - 86, x + 18, y - 86, 1.4, S.W); for (const px of [x - 8, x + 4]) ln(c, px, y - 100, px + 3, y - 108, 1.2, S.W); };
DEC.mirror = (c, d) => { const x = X(d.x), y = X(d.y); box(c, x, y, 70, 92, S.W); rect(c, x + 6, y + 6, 58, 80, '#00305a'); ln(c, x + 14, y + 20, x + 30, y + 10, 3, 'rgba(255,255,255,0.5)'); ln(c, x + 14, y + 36, x + 44, y + 16, 2, 'rgba(255,255,255,0.35)'); };
DEC.roofbeams = c => { rect(c, 0, 120, 512, 10, '#5a3a00'); ln(c, 0, 120, 512, 120, 1.2, S.y); ln(c, 0, 130, 512, 130, 1.2); c.save(); c.globalAlpha = 0.6; for (let k = 0; k < 4; k++) ln(c, 470, 26, 470 + Math.cos(0.8 + k * 0.5) * 40, 26 + Math.sin(0.8 + k * 0.5) * 40, 1, S.W); for (const r of [14, 26]) { c.beginPath(); c.arc(470, 26, r, 0.8, 2.3); c.lineWidth = 1; c.strokeStyle = S.W; c.stroke(); } c.restore(); };
function balloonArt(c, x, y, sway) { ln(c, x, y, x + sway, y - 70, 1.2, S.W); oval(c, x + sway, y - 96, 22, 27, S.R, 1.4); shape(c, [[x + sway - 4, y - 68], [x + sway + 4, y - 68], [x + sway, y - 74]], S.R, 1); oval(c, x + sway - 8, y - 106, 5, 8, 'rgba(255,255,255,0.6)'); }
DEC.balloon = (c, d, R, st) => { const sc = st.items.scissors; if (st.float || (sc && sc.gone)) return; balloonArt(c, 288, 224, 0); box(c, 282, 220, 12, 6, S.w); };
DEC.ropeladder = (c, d, R, st) => { const x1 = 466, x2 = 490; if (st.flags.ladder_down) { for (const lx of [x1, x2]) ln(c, lx, 84, lx, 352, 2.4, S.y); for (let y = 100; y < 352; y += 20) ln(c, x1, y, x2, y, 3, S.Y); }
  else { oval(c, (x1 + x2) / 2, 78, 16, 7, S.y, 1.2); for (const dx of [-8, 0, 8]) ln(c, (x1 + x2) / 2 + dx, 72, (x1 + x2) / 2 + dx, 84, 1.2); } };
DEC.nightsky = () => {}; DEC.dreamsky = () => {};
DEC.stack = (c, d) => { const x1 = X(d.x1), x2 = X(d.x2); bricks(c, x1, 284, x2 - x1, 46, S.r, 9, 20); rect(c, x1 - 6, 280, x2 - x1 + 12, 8, S.w); ln(c, x1 - 6, 288, x2 + 6, 288); };
DEC.rocket = (c, d) => { const x = X(d.x), y = X(d.y);
  shape(c, [[x - 14, y - 4], [x - 26, y], [x - 14, y - 34]], S.R, 1.2); shape(c, [[x + 14, y - 4], [x + 26, y], [x + 14, y - 34]], S.R, 1.2);
  c.beginPath(); c.moveTo(x - 14, y - 4); c.lineTo(x - 14, y - 70); c.quadraticCurveTo(x, y - 104, x + 14, y - 70); c.lineTo(x + 14, y - 4); c.closePath(); c.fillStyle = S.W; c.fill(); c.lineWidth = 1.4; c.strokeStyle = K; c.stroke();
  disc(c, x, y - 58, 6, S.C, 1.2); rect(c, x - 14, y - 30, 28, 6, S.R); ln(c, x - 14, y - 30, x + 14, y - 30); ln(c, x - 14, y - 24, x + 14, y - 24); shape(c, [[x - 8, y - 4], [x + 8, y - 4], [x + 4, y + 2], [x - 4, y + 2]], S.w, 1); };
DEC.cellarwall = c => { bricks(c, 0, 236, 512, 116, '#1a1a3a', 22, 44, '#000010'); c.save(); c.globalAlpha = 0.6; for (const x of [6, 506]) for (let k = 0; k < 4; k++) ln(c, x, 26, x + (x < 100 ? 1 : -1) * Math.cos(k * 0.45) * 36, 26 + Math.sin(k * 0.45) * 36, 1, S.W); c.restore(); };
DEC.vault = (c, d, R, st) => { const x1 = X(d.x1), x2 = X(d.x2), open = st.flags.lock_open;
  shape(c, [[x1, 340], [x1, 170], [x2, 170], [x2, 340]], '#000040'); box(c, x1, 160, x2 - x1, 10, S.C);
  if (open) { for (let x = x1 + 8; x < x2; x += 18) box(c, x, 170, 8, 18, S.C); for (let i = 0; i < 6; i++) star(c, x1 + 20 + (i * 13) % 60, 210 + (i * 23) % 100, 2.4, S.Y); }
  else for (let x = x1 + 8; x < x2; x += 18) box(c, x, 170, 8, 170, S.C); };
DEC.rug = () => {};
function rugArt(c, d, st) { const x1 = X(d.x1), x2 = 512, rolling = !st.flags.rug_stopped, off = rolling ? (st.rt * 48) % 24 : 0;
  rect(c, x1, 349, x2 - x1, 6, S.R); c.save(); c.beginPath(); c.rect(x1, 349, x2 - x1, 6); c.clip(); for (let x = x1 - 24 + off; x < x2; x += 24) { rect(c, x, 349, 8, 6, S.Y); } c.restore(); ln(c, x1, 349, x2, 349, 1); ln(c, x1, 355, x2, 355, 1);
  if (rolling) { const rx = x1 + 6, a = -st.rt * 6; disc(c, rx, 344, 10, S.R, 1.2); ln(c, rx, 344, rx + Math.cos(a) * 9, 344 + Math.sin(a) * 9, 1.6, S.Y); c.save(); c.globalAlpha = 0.6; for (let k = 0; k < 3; k++) ln(c, x1 + 30 + k * 60, 340, x1 + 14 + k * 60, 340, 1.4, S.W); c.restore(); }
  else for (let x = x1 + 4; x < x2; x += 12) ln(c, x, 355, x - 2, 359, 1, S.Y); }
const DYN_DEC = { rug: 1 }, DYN_THING = { nightlight: 1, charger: 1, rooster: 1, torchholder: 1 };
function hallPassage(c) { c.save(); rect(c, 476, 262, 36, 90, '#000040'); c.beginPath(); c.moveTo(476, 352); c.lineTo(476, 280); c.quadraticCurveTo(494, 258, 512, 262); c.lineWidth = 4; c.strokeStyle = S.Y; c.stroke(); c.restore(); }

/* ---------- arm glow + arrows ---------- */
function armGlow(c, sp, st, t) {
  const n = st.n, x1 = X(sp.x1), x2 = X(sp.x2), cx = (x1 + x2) / 2, y = X(sp.y);
  const armed = st.arm && st.arm.id === sp.id && st.arm.armed, arming = st.arm && st.arm.id === sp.id && !st.arm.armed && st.arm.t > 0;
  const on = n.ground && n.x >= sp.x1 && n.x <= sp.x2 && Math.abs(n.y - sp.y) < 0.6;
  if (!on) return;
  const col = sp.hidden ? '255,255,230' : sp.kind === 'back' ? '60,120,255' : sp.kind === 'front' ? '255,170,0' : '0,255,200';
  const a = sp.hidden ? (armed ? 0.22 : 0) : armed ? 0.45 + Math.sin(t * 10) * 0.1 : arming ? 0.18 : 0;
  if (a > 0) { const w = Math.max(x2 - x1, 36), h = sp.kind === 'front' || sp.kind === 'back' || sp.hidden ? 110 : 80; const g = c.createLinearGradient(0, y - h, 0, y); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${a})`); c.fillStyle = g; c.fillRect(cx - w / 2, y - h, w, h); }
  if (sp.hidden && !armed) return;
  const dir = sp.arrow || (sp.kind === 'back' ? 'in' : sp.kind === 'front' ? 'out' : null); if (!dir) return;
  const ay = y - 112 + Math.sin(t * 6) * 3, fill = armed ? `rgb(${col})` : 'rgba(255,255,255,0.55)';
  c.save(); c.translate(cx, ay);
  if (dir === 'in') { shape(c, [[-8, -10], [8, -10], [8, 0], [14, 0], [0, 12], [-14, 0], [-8, 0]], fill, 1.2); oval(c, 0, 16, 10, 3, fill); }
  else if (dir === 'out') { shape(c, [[-8, 10], [8, 10], [8, 0], [14, 0], [0, -12], [-14, 0], [-8, 0]], fill, 1.2); c.globalAlpha = 0.6; rect(c, -12, 14, 24, 3, fill); }
  else if (dir === 'up') shape(c, [[-6, 12], [6, 12], [6, 0], [12, 0], [0, -12], [-12, 0], [-6, 0]], fill, 1.2);
  else shape(c, [[-6, -12], [6, -12], [6, 0], [12, 0], [0, 12], [-12, 0], [-6, 0]], fill, 1.2);
  c.restore();
}

/* ---------- nightmares ---------- */
function eyes(c, x, y, gap, r = 3, angry) { for (const d of [-1, 1]) { disc(c, x + d * gap, y, r, S.W, 1); disc(c, x + d * gap + 0.6, y + 0.6, r * 0.45, K); } if (angry) for (const d of [-1, 1]) ln(c, x + d * gap - d * r, y - r - 2, x + d * gap + d * r * 0.8, y - r, 1.6); }
const ENEMY = {
  wool: (c, x, y, e, t) => { const r = 12, a = e.x / 6; disc(c, x, y - r, r, S.M, 1.4); c.save(); c.translate(x, y - r); c.rotate(a); for (let k = -2; k <= 2; k++) { c.beginPath(); c.ellipse(0, 0, r - 1, Math.abs(k) * 3 + 2, k * 0.6, 0, Math.PI * 2); c.lineWidth = 1; c.strokeStyle = S.m; c.stroke(); } c.restore(); eyes(c, x + e.dir * 3, y - r - 2, 4, 2.6, true); ln(c, x - e.dir * r, y - 2, x - e.dir * (r + 24), y - 1, 1.2, S.M); },
  moth: (c, x, y, e, t) => { V.drawMoth(c, Math.floor(t * 10) % 2, x, y + 4, 0.42, e.dir); if (e.warn) { c.save(); c.globalAlpha = 0.6; ln(c, x - 6, y - 30, x + 6, y - 30, 2, S.R); c.restore(); } },
  pincushion: (c, x, y, e) => { oval(c, x, y - 11, 14, 11, S.R, 1.4); for (let k = -2; k <= 2; k++) ln(c, x + k * 4, y - 20, x + k * 6, y - 31, 1.2, S.w); for (let k = -2; k <= 2; k++) disc(c, x + k * 6, y - 31, 1.8, [S.Y, S.C, S.G, S.M, S.W][k + 2]); eyes(c, x, y - 12, 5, 2.6, true); rect(c, x - 14, y - 3, 28, 3, S.y); },
  gravyboat: (c, x, y, e, t) => { const f = Math.sin(t * 18) * 8; for (const d of [-1, 1]) shape(c, [[x + d * 4, y - 14], [x + d * 22, y - 22 - f], [x + d * 16, y - 10]], S.W, 1); c.beginPath(); c.moveTo(x - 18 * e.dir, y - 14); c.quadraticCurveTo(x, y + 2, x + 16 * e.dir, y - 10); c.lineTo(x + 24 * e.dir, y - 18); c.lineTo(x - 18 * e.dir, y - 16); c.closePath(); c.fillStyle = S.W; c.fill(); c.lineWidth = 1.4; c.strokeStyle = K; c.stroke(); oval(c, x, y - 15, 14, 2.5, '#7a3a00'); eyes(c, x - e.dir * 2, y - 8, 4, 2.2); disc(c, x + 22 * e.dir, y - 8 + (t * 40 % 16), 2, '#7a3a00'); },
  toast: (c, x, y, e, t) => { const st = Math.floor(t * 6) % 2; rect(c, x - 3 - (st ? 2 : 0), y - 8, 3, 8, K); rect(c, x + 1 + (st ? 2 : 0), y - 8, 3, 8, K); box(c, x - 9, y - 38, 18, 32, S.y); rect(c, x - 7, y - 36, 14, 28, S.Y); eyes(c, x, y - 26, 4, 2.4, true); ln(c, x - 4, y - 16, x + 4, y - 16, 1.4); box(c, x - 8, y - 50, 16, 13, K); ln(c, x - 8, y - 40, x + 8, y - 40, 1.6, S.R); ln(c, x + 9 * e.dir, y - 26, x + 15 * e.dir, y - 34, 2, S.y); },
  hubcap: (c, x, y, e, t) => { const a = e.x / 7 * e.dir; disc(c, x, y - 14, 14, S.w, 1.4); disc(c, x, y - 14, 9, S.W, 1); c.save(); c.translate(x, y - 14); c.rotate(a); for (let k = 0; k < 5; k++) { const b = k * 1.2566; ln(c, Math.cos(b) * 3, Math.sin(b) * 3, Math.cos(b) * 9, Math.sin(b) * 9, 1.6); } c.restore(); disc(c, x, y - 14, 3, S.R, 1); eyes(c, x, y - 20, 5, 2, true); },
  coat: (c, x, y, e, t) => { if (e.warn) { c.save(); c.globalAlpha = 0.5 + Math.sin(t * 30) * 0.3; oval(c, x, 352, 16, 3, K); c.restore(); const sx = Math.sin(t * 40) * 2; shape(c, [[x - 10 + sx, 140], [x + 10 + sx, 140], [x + 14 + sx, 176], [x - 14 + sx, 176]], S.b, 1.2); return; } if (!e.active) return;
    shape(c, [[x - 8, y - 40], [x + 8, y - 40], [x + 18, y - 34], [x + 20, y], [x - 20, y], [x - 18, y - 34]], S.b, 1.4); ln(c, x, y - 36, x, y, 1.2); for (const d of [-1, 1]) shape(c, [[x + d * 18, y - 34], [x + d * 26, y - 18], [x + d * 22, y - 10], [x + d * 16, y - 26]], S.b, 1.2); eyes(c, x, y - 30, 5, 2.6, true); for (let k = 0; k < 3; k++) disc(c, x + 3, y - 24 + k * 8, 1.6, S.Y); },
  quill: (c, x, y, e, t) => { if (e.warn) { const sx = e.dir > 0 ? 6 : 506; c.save(); c.globalAlpha = 0.4 + Math.sin(t * 30) * 0.4; oval(c, sx, y - 6, 4, 6, S.B); c.restore(); return; } if (!e.active) return; c.save(); c.translate(x, y - 6); c.scale(e.dir, 1);
    c.beginPath(); c.moveTo(16, 0); c.quadraticCurveTo(-4, -12, -18, -4); c.quadraticCurveTo(-4, 2, 16, 0); c.fillStyle = S.W; c.fill(); c.lineWidth = 1.2; c.strokeStyle = K; c.stroke(); ln(c, -18, -3, 18, 0, 1.4); shape(c, [[16, -1], [22, 0], [16, 1]], S.B); c.globalAlpha = 0.5; ln(c, -24, -4, -38, -4, 1.4, S.W); c.restore(); },
  brush: (c, x, y, e, t) => { box(c, x - 14, y - 16, 28, 9, S.y); for (let k = -12; k <= 12; k += 3) ln(c, x + k, y - 7, x + k, y - 1, 1.2, S.W); oval(c, x, y - 20, 9, 5, S.R, 1.2); eyes(c, x, y - 12, 6, 2, true); },
  snapdragon: (c, x, y, e, t) => { ln(c, x, y, x, y - 30, 3, S.g); for (const d of [-1, 1]) oval(c, x + d * 8, y - 12, 7, 3, S.G, 1, d * 0.5);
    const open = e.snap ? Math.abs(Math.sin(t * 14)) * 10 : 0; if (e.asleep) { oval(c, x, y - 36, 9, 7, S.M, 1.2); ln(c, x - 6, y - 37, x - 2, y - 37, 1.2); ln(c, x + 2, y - 37, x + 6, y - 37, 1.2); txt(c, 'z', x + 14, y - 48 - (t * 6 % 6), 9, S.W); txt(c, 'z', x + 20, y - 58 - (t * 6 % 6), 7, S.W); return; }
    shape(c, [[x - 10, y - 32], [x + 12, y - 34 - open], [x + 2, y - 44 - open], [x - 10, y - 40]], S.M, 1.2); shape(c, [[x - 10, y - 32], [x + 12, y - 32 + open * 0.4], [x + 2, y - 26], [x - 10, y - 28]], S.M, 1.2); if (open > 2) for (let k = 0; k < 3; k++) shape(c, [[x - 2 + k * 4, y - 33 - open * 0.6], [x + k * 4, y - 30], [x + 2 + k * 4, y - 33 - open * 0.6]], S.W); disc(c, x - 4, y - 38 - open * 0.4, 2, S.Y, 1); },
  dustbunny: (c, x, y, e, t) => { const hop = Math.abs(Math.sin(t * 8)) * 4; c.save(); c.globalAlpha = 0.9; for (const [dx, dy, r] of [[0, 9, 10], [-6, 6, 6], [6, 6, 6], [e.dir * 8, 14, 6]]) disc(c, x + dx, y - dy - hop, r, '#9a9a9a'); for (const d of [-1, 1]) oval(c, x + e.dir * 8 + d * 3, y - 24 - hop, 2.5, 7, '#9a9a9a'); c.restore(); eyes(c, x + e.dir * 9, y - 14 - hop, 3, 1.8, true); },
  sock: (c, x, y, e, t) => { const by = y; if (e.warn) { oval(c, x, by - 2, 12, 4, K); c.save(); c.globalAlpha = 0.6; ln(c, x - 8 + Math.sin(t * 40) * 2, by - 4, x + 8, by - 4, 1.4, S.G); c.restore(); return; } if (!e.active) return;
    c.save(); c.beginPath(); c.rect(x - 40, by - 80, 80, 80); c.clip(); V.drawSock(c, Math.floor(t * 8) % 2, x, by + (1 - e.rise) * 40, 0.4, 1); c.restore(); },
  needle: (c, x, y, e, t) => { if (e.warn) { if (Math.floor((t || 0) * 10) % 2) return; const gx = e.dir > 0 ? 8 : 504; c.save(); star(c, gx, y - 4, 7, S.W); c.restore(); return; } if (!e.active) return; c.save(); c.translate(x, y - 4); c.scale(e.dir, 1); ln(c, -16, 0, 16, 0, 2.4, S.w); oval(c, -12, 0, 3, 1.4, K); shape(c, [[16, -1.2], [20, 0], [16, 1.2]], S.w); c.beginPath(); c.moveTo(-12, 0); c.quadraticCurveTo(-24, 6, -40, -2); c.lineWidth = 1.2; c.strokeStyle = S.R; c.stroke(); c.restore(); },
  bubble: (c, x, y, e, t) => { c.save(); c.globalAlpha = 0.85; disc(c, x, y - 12, 12, 'rgba(0,255,255,0.25)'); c.beginPath(); c.arc(x, y - 12, 12, 0, Math.PI * 2); c.lineWidth = 1.6; c.strokeStyle = S.C; c.stroke(); oval(c, x - 4, y - 17, 3, 4, S.W); c.restore(); eyes(c, x + 1, y - 11, 3.5, 1.8); },
  bedsheet: (c, x, y, e, t) => { const w = 22, wav = Math.sin(t * 6) * 3; c.beginPath(); c.moveTo(x - w, y); c.quadraticCurveTo(x - w - 2, y - 36, x, y - 38); c.quadraticCurveTo(x + w + 2, y - 36, x + w, y); for (let k = 0; k < 4; k++) c.lineTo(x + w - (k + 0.5) * w / 2, y - 6 + ((k % 2) ? wav : -wav)); c.closePath(); c.fillStyle = S.W; c.fill(); c.lineWidth = 1.4; c.strokeStyle = K; c.stroke(); for (const d of [-1, 1]) oval(c, x + d * 6, y - 24, 3, 5, K); if (e.warn) { oval(c, x, y - 12, 4, 4, K); } },
  mouse: (c, x, y, e, t) => { c.save(); c.translate(x, y); c.scale(e.dir, 1); oval(c, 0, -8, 14, 8, S.w, 1.4); disc(c, 12, -10, 5, S.w, 1.2); disc(c, 6, -16, 4, S.M, 1.2); disc(c, 16, -9, 1.6, K); disc(c, 18, -8, 1.4, S.M); ln(c, -14, -6, -26, -10, 1.4); const a = t * 8; c.translate(-4, -18); ln(c, 0, 0, 0, 4, 1.6, S.Y); c.rotate(a); rect(c, -6, -2, 12, 3, S.Y); c.restore(); for (const k of [-6, 6]) disc(c, x + k, y - 1, 2, K); },
  soot: (c, x, y, e, t) => { if (e.warn) { c.save(); c.globalAlpha = 0.4 + Math.sin(t * 30) * 0.3; oval(c, x, 340, 12, 3, K); c.restore(); return; } if (!e.active) return; for (const [dx, dy, r] of [[0, 8, 9], [-6, 4, 5], [6, 5, 6], [2, 14, 5]]) disc(c, x + dx, y - dy, r, '#202020'); eyes(c, x, y - 9, 3.5, 2, true); },
  drip: (c, x, y, e, t) => { if (e.warn) { oval(c, x, 120 + Math.min(1, (e.t % 1.8) / 0.7) * 6, 3, 3 + Math.min(1, (e.t % 1.8) / 0.7) * 3, S.C); return; } if (!e.active) return; c.beginPath(); c.moveTo(x, y - 16); c.quadraticCurveTo(x + 7, y - 4, x, y); c.quadraticCurveTo(x - 7, y - 4, x, y - 16); c.fillStyle = S.C; c.fill(); c.lineWidth = 1.2; c.strokeStyle = K; c.stroke(); },
  pigeon: (c, x, y, e, t) => { const f = Math.sin(t * 16) * 10; oval(c, x, y - 10, 14, 8, S.w, 1.4); disc(c, x + 12, y - 16, 6, S.w, 1.2); shape(c, [[x + 17, y - 17], [x + 23, y - 15], [x + 17, y - 14]], S.Y); disc(c, x + 13, y - 17, 1.6, S.R); shape(c, [[x - 4, y - 14], [x + 6, y - 14], [x - 2, y - 30 - f]], S.W, 1.2); shape(c, [[x - 14, y - 10], [x - 24, y - 14], [x - 22, y - 6]], S.w, 1); oval(c, x + 8, y - 11, 4, 3, S.M); },
  saucer: (c, x, y, e, t) => { if (e.gone) return; for (let k = 0; k < 3; k++) { const sx = X(200) + 14 + k * 18, sy = y - 20 - k * 34 + Math.sin(t * 3 + k) * 5; oval(c, sx, sy, 16, 5, S.W, 1.2); oval(c, sx, sy - 1, 6, 2, S.C); disc(c, sx, sy - 4, 5, 'rgba(0,255,0,0.6)'); disc(c, sx - 2, sy - 5, 1, K); disc(c, sx + 2, sy - 5, 1, K); } c.save(); c.globalAlpha = 0.25 + Math.sin(t * 8) * 0.1; rect(c, X(200), 60, 6, 292, S.G); c.restore(); },
  snorelock: (c, x, y, e, t) => { const X2 = X, x1 = X2(e.open ? 0 : 0); if (e.open) { c.beginPath(); c.arc(x - 8, y - 46, 12, Math.PI, 0); c.lineWidth = 5; c.strokeStyle = S.w; c.stroke(); box(c, x - 18, y - 30, 36, 30, S.Y); disc(c, x - 6, y - 18, 2, K); disc(c, x + 6, y - 18, 2, K); c.beginPath(); c.arc(x, y - 12, 5, 0, Math.PI); c.lineWidth = 1.4; c.strokeStyle = K; c.stroke(); return; }
    c.beginPath(); c.arc(x, y - 30, 12, Math.PI, 0); c.lineWidth = 5; c.strokeStyle = S.w; c.stroke(); box(c, x - 18, y - 30, 36, 30, S.Y); ln(c, x - 10, y - 18, x - 2, y - 18, 1.6); ln(c, x + 2, y - 18, x + 10, y - 18, 1.6); const mo = e.puff ? 6 : e.warn ? 4 : 2; oval(c, x, y - 8, mo, mo * 0.7, K);
    if (e.warn) txt(c, 'Z', x + 18, y - 44, 10, S.W);
    if (e.puff) { c.save(); c.globalAlpha = 0.65; const k = (e.t % 2.4 - 1.4) / 0.8; for (let i = 0; i < 4; i++) { const px = x - 24 - i * 30 - k * 40; if (px > X2(120)) cloudPuff(c, px, y - 14 - (i % 2) * 8, 26, S.W); } c.restore(); } else txt(c, 'z', x + 16, y - 40 - (t * 4 % 8), 8, S.W); },
  cork: (c, x, y, e, t) => { if (e.warn) { box(c, x - 4, y - 4, 8, 6, S.y); return; } if (!e.active) return; const h = e.rise * 30; box(c, x - 6, y - 4 - h, 12, 14, S.y); eyes(c, x, y - h + 2, 2.6, 1.6, true); c.save(); c.globalAlpha = 0.6; for (let k = 0; k < 3; k++) disc(c, x - 6 + k * 6, y - 10 - h * 1.3 - k * 3, 2, S.W); c.restore(); },
  steam: (c, x, y, e, t) => { if (e.warn) { c.save(); c.globalAlpha = 0.4; disc(c, x, y - 4, 4, S.W); c.restore(); return; } if (!e.active) return; c.save(); c.globalAlpha = 0.75; for (let k = 0; k < 5; k++) disc(c, x + Math.sin(t * 10 + k) * 4, y - 6 - k * 11 * e.rise, 7 + k, S.W); c.restore(); },
  coallump: (c, x, y, e) => { shape(c, [[x - 10, y - 2], [x - 12, y - 12], [x - 4, y - 20], [x + 8, y - 18], [x + 11, y - 8], [x + 6, y]], '#202020', 1.4); ln(c, x - 4, y - 16, x + 4, y - 12, 1, '#606060'); eyes(c, x, y - 10, 4, 2, true); },
  fire: (c, x, y, e, t, E) => { const x1 = X(E.x1), x2 = X(E.x2), fy = X(E.y); if (e.out) { c.save(); c.globalAlpha = 0.5; for (let k = 0; k < 3; k++) disc(c, (x1 + x2) / 2 + Math.sin(t + k) * 8, fy - 14 - k * 12 - (t * 10 % 12), 5 + k * 2, '#909090'); c.restore(); for (let k = x1; k < x2; k += 10) oval(c, k + 5, fy - 2, 6, 3, '#404040', 1); return; }
    for (let k = x1; k < x2; k += 12) { const h = 26 + Math.sin(t * 12 + k) * 8; shape(c, [[k, fy], [k + 6, fy - h], [k + 12, fy]], S.R); shape(c, [[k + 3, fy], [k + 6, fy - h * 0.6], [k + 9, fy]], S.Y); } eyes(c, (x1 + x2) / 2, fy - 16, 6, 2.4, true); },
  vane: (c, x, y, e, t, E) => { const vx = X(E.x), vy = X(E.y); ln(c, vx, vy, vx, vy - 60, 2.4, S.w); ln(c, vx - 14, vy - 40, vx + 14, vy - 40, 1.6, S.w); txt(c, 'W', vx - 20, vy - 40, 7, S.w); txt(c, 'E', vx + 20, vy - 40, 7, S.w);
    const sw = e.gust ? Math.sin(t * 30) * 0.2 : 0; c.save(); c.translate(vx, vy - 62); c.rotate(sw); shape(c, [[-18, 0], [10, 0], [16, -8], [10, -14], [4, -8], [-6, -12], [-18, -6]], S.Y, 1.2); disc(c, 11, -10, 1.4, K); c.restore();
    if (e.wind || e.gust) { c.save(); c.globalAlpha = e.gust ? 0.7 : 0.3; for (let k = 0; k < 6; k++) { const wx = (X(E.shelter) - ((t * 300 + k * 70) % X(E.shelter))), wy = 200 + k * 22; ln(c, wx, wy, wx + 30, wy, 2, S.W); } c.restore(); } },
  book: (c, x, y, e, t, E, st) => { const n = st.n; if (e.bounce > 0) { e.bounce -= 1 / 60; } if (!(n.ground && Math.abs(n.y - E.y) < 1 && n.x >= E.x1 && n.x <= E.x2)) return; const k = e.t / 1.2; if (k < 0.5) { c.save(); c.globalAlpha = 0.5; rect(c, X(n.x) - 8, 30, 16, 4, S.R); c.restore(); return; } const by = 30 + (k - 0.5) / 0.5 * (X(E.y) - 90 - 30); c.save(); c.translate(X(n.x), by); c.rotate(t * 8); box(c, -10, -7, 20, 14, S.R); rect(c, -10, -2, 20, 3, S.Y); c.restore(); },
  rug: () => {}
};
function drawEnemy(c, E, e, st, t) { const art = E.art || E.type; const f = ENEMY[art]; if (!f) return; c.save(); f(c, X(e.x), X(e.y), e, t, E, st); c.restore(); }
function drawCuckoo(c, st, R, t) {
  const C = st.cuckoo.pop; if (!C) return; const sp = (R.spots || []).find(s => s.id === C.door); if (!sp) return;
  const cx = X((sp.x1 + sp.x2) / 2), top = X(sp.y) - 100, out = C.t > 1.5 ? (2 - C.t) / 0.5 : C.t < 0.3 ? C.t / 0.3 : 1;
  const len = 6 + out * 26, bx = cx + 0, by = top - 4 + len;
  box(c, cx - 14, top - 18, 28, 14, S.y); rect(c, cx - 8, top - 14, 16, 10, K);
  c.save(); for (let k = 0; k < 6; k++) ln(c, cx + (k % 2 ? -5 : 5), top - 6 + k * len / 6, cx + (k % 2 ? 5 : -5), top - 6 + (k + 1) * len / 6, 1.4, S.w); c.restore();
  oval(c, bx, by + 6, 10, 8, S.y, 1.2); disc(c, bx + 6, by - 2, 6, S.y, 1.2); shape(c, [[bx + 11, by - 3], [bx + 18, by - 1 + (C.peek ? 0 : Math.sin(t * 20) * 2)], [bx + 11, by + 1]], S.Y, 1);
  if (C.peek) { c.beginPath(); c.moveTo(bx - 2, by - 2); c.quadraticCurveTo(bx + 6, by - 18, bx + 14, by - 2); c.closePath(); c.fillStyle = S.M; c.fill(); c.lineWidth = 1; c.strokeStyle = K; c.stroke(); ln(c, bx + 4, by - 1, bx + 9, by - 1, 1.2); txt(c, 'z', bx + 18, by - 16, 8, S.W); }
  else { disc(c, bx + 7, by - 3, 1.6, K); txt(c, 'CUCKOO!', cx, top - 30, 9, S.Y); }
}

/* ---------- Norris pose ---------- */
function norrisPose(n, idleT, t, reach) {
  if (reach > 0 && n.ground) return 'reach';
  if (!n.ground) return n.air < 0.08 && n.vy < 0 ? 'jump1' : (n.vy < 0 ? 'jump2' : 'jump3');
  if (n.vx) return 'walk' + (1 + Math.floor(n.walkT * 8) % 4);
  if (idleT > 5 && (idleT - 5) % 9 < 1.8) return 'yawn';
  return (t % 3.3) > 3.12 ? 'blink' : 'idle';
}

/* ---------- static cache + scene ---------- */
const cache = new Map();
function staticKey(st, R, W) { const sc = st.items.scissors; return [st.room, W, Object.keys(st.flags).sort().join(','), st.rides > 0, sc && sc.gone ? 1 : 0, st.float ? 1 : 0].join('|'); }
function paintStatic(c, R, st) {
  const P = PAL[R.pal] || PAL.hall;
  if (R.pal === 'hall') { HALL.drawHall(c, 0, 0, 1); hallPassage(c); }
  else if (P.outside) { nightSky(c, P.outside === 'cloud'); if (P.outside === 'roof') { shape(c, [[0, 328], [512, 328], [512, 384], [0, 384]], S.r); for (let y = 336; y < 384; y += 10) ln(c, 0, y, 512, y, 1.2); for (let r = 0; r < 5; r++) for (let x = (r % 2) * 10; x < 512; x += 20) ln(c, x, 328 + r * 10, x, 338 + r * 10, 1); } }
  else interior(c, P, R);
  for (const d of R.decor || []) if (DEC[d.k] && !DYN_DEC[d.k]) DEC[d.k](c, d, R, st);
  for (const p of G_platforms(R, st)) if (LOOK[p.look]) LOOK[p.look](c, p, R, st);
  drawSpots(c, R, st);
  for (const th of R.things || []) if (THING[th.draw] && !DYN_THING[th.draw]) THING[th.draw](c, th, st, 0);
}
let ENG = null;
function G_platforms(R, st) { return (R.plats || []).filter(p => !p.mover && (!p.req || reqOK(p.req, st))); }
function reqOK(c, st) { if (c.flags && !c.flags.every(f => st.flags[f])) return false; if (c.not && c.not.some(f => st.flags[f])) return false; if (c.carry && !c.carry.every(i => st.pockets.includes(i))) return false; if (c.found && !c.found.every(i => st.found[i])) return false; return true; }
function getStatic(R, st, pw) {
  const key = staticKey(st, R, pw); let cv = cache.get(key);
  if (!cv) { if (cache.size > 24) cache.clear(); cv = document.createElement('canvas'); cv.width = pw; cv.height = Math.round(pw * 0.75); const c = cv.getContext('2d'); c.scale(pw / 512, pw / 512); paintStatic(c, R, st); cache.set(key, cv); }
  return cv;
}
/* draw the whole play view into ctx, which is already transformed so that 512x384 room units fill the play area */
function drawScene(c, G, opts) {
  const st = G.st, R = G.room(), t = st.t, n = st.n;
  c.drawImage(getStatic(R, st, opts.pw), 0, 0, 512, 384);
  for (const d of R.decor || []) if (d.k === 'rug') rugArt(c, d, st);
  for (const p of R.plats || []) if (p.mover && LOOK[p.look]) { const cx = G.chairX(); LOOK[p.look](c, Object.assign({}, p, { x1: cx - p.w / 2, x2: cx + p.w / 2, mover: true }), R, st); }
  for (const th of R.things || []) if (THING[th.draw] && DYN_THING[th.draw]) THING[th.draw](c, th, st, t);
  // items + food
  for (const id in st.items) { const it = st.items[id]; if (it.room !== st.room || it.held || it.gone) continue; const bob = Math.sin(t * 3 + it.x) * 1.5; drawItemArt(c, id, X(it.x), X(it.y) - bob, 0.3, G.itemState(id), t); }
  const F = G.W.food[st.foodIdx % G.W.food.length]; if (F && F.at === st.room && R.food) drawItemArt(c, G.foodArt[st.foodIdx % G.foodArt.length], X(R.food[0]), X(R.food[1]) - Math.sin(t * 3) * 1.5, 0.3, null, t);
  // glow + arrows
  const sp = G.spotAt && st.mode === 'play' && !st.float && !st.trans ? G.spotAt() : null; if (sp) armGlow(c, sp, st, t);
  // enemies
  for (const e of st.en || []) { const E = R.enemies[e.k]; if (E) drawEnemy(c, E, e, st, t); }
  drawCuckoo(c, st, R, t);
  // Norris
  if (st.float) { const sway = Math.sin(t * 3) * 6; balloonArt(c, X(n.x) + 10, X(n.y) - 66, sway); }
  const flick = (st.inv > 0 && Math.floor(st.inv * 12) % 2 === 0) || (st.esafe > 0 && st.mode === 'play' && !st.trans && Math.floor(st.esafe * 10) % 2 === 1);
  if (!flick && st.mode !== 'win') V.drawNorris(c, st.float ? 'jump2' : norrisPose(n, opts.idleT || 0, t, st.reach || 0), X(n.x), X(n.y) + 2, 0.6, n.face);
  drawFrontDoors(c, R);
  if (st.trans) { const k = Math.min(1, st.trans.t / st.trans.dur); c.fillStyle = `rgba(0,0,0,${k})`; c.fillRect(0, 0, 512, 384); if (st.trans.kind === 'rocket') { const ry = 300 - k * 380; DEC.rocket(c, { x: n.x, y: ry / 2 }); for (let i = 0; i < 6; i++) disc(c, X(n.x) + Math.sin(i * 2 + t * 20) * 6, ry + 6 + i * 8, 6 - i * 0.8, i % 2 ? S.Y : S.R); } }
}

/* ---------- counting sheep ---------- */
function drawArcade(c, G) {
  const A = G.st.arcade, AR = G.AR, t = A.t;
  nightSky(c, true); rect(c, 0, 352, 512, 32, S.g); for (let x = 0; x < 512; x += 12) shape(c, [[x, 352], [x + 4, 344], [x + 8, 352]], S.G);
  const fx = X(AR.fence); for (const dx of [-14, 0, 14]) box(c, fx + dx - 3, 300, 6, 52, S.W); for (const yy of [310, 330]) box(c, fx - 20, yy, 40, 6, S.W);
  for (const s of A.sheep) { const jy = s.jt >= 0 ? Math.sin(Math.min(1, s.jt / 0.5) * Math.PI) * 70 : 0; const by = 352 - jy; c.save(); if (s.bonk) { c.translate(X(s.x), by - 10); c.rotate(-0.3); c.translate(-X(s.x), -(by - 10)); } sheep(c, X(s.x), by - 18, 0.75); c.restore(); if (s.done && s.ok && s.x < AR.fence + 30) txt(c, '+1', X(s.x), by - 50, 12, S.Y); }
  rect(c, 0, 0, 512, 34, 'rgba(0,0,0,0.5)'); txt(c, 'COUNTING SHEEP', 256, 16, 14, S.Y); txt(c, A.count + ' / ' + AR.need, 60, 16, 14, S.W, 'center');
  for (let i = 0; i < AR.lives; i++) txt(c, 'X', 420 + i * 22, 16, 14, i < A.miss ? S.R : '#404040');
  if (t < 3 && !A.result) txt(c, 'TAP JUMP AS EACH SHEEP REACHES THE FENCE', 256, 80, 10, S.W);
  if (A.result) { rect(c, 96, 140, 320, 90, K); c.lineWidth = 3; c.strokeStyle = A.result === 'win' ? S.Y : S.R; c.strokeRect(96, 140, 320, 90); txt(c, A.result === 'win' ? 'SOUND ASLEEP!' : 'WIDE AWAKE!', 256, 172, 22, A.result === 'win' ? S.Y : S.R); txt(c, A.result === 'win' ? (A.bonus ? 'EXTRA LIFE!' : 'WELL COUNTED') : 'TRY AGAIN ANOTHER TIME', 256, 206, 12, S.W); }
}

/* ---------- title + win ---------- */
function bedroomBackdrop(c) { interior(c, PAL.mast, {}); DEC.window(c, { x: 150, y: 26, w: 46, h: 50 }); DEC.picture(c, { x: 60, y: 40, w: 30, h: 24, col: 'G' }); }
function drawTitle(c, t, noText) {
  bedroomBackdrop(c); LOOK.bigbed(c, { x1: 120, x2: 214, y: 140 }); LOOK.bedside(c, { x1: 88, x2: 108, y: 148 });
  // Norris asleep: head on pillow, blanket over
  const hx = 268, hy = 262; V.drawNorrisHead(c, hx, hy, 0.75); shape(c, [[250, 280], [420, 266], [424, 292], [250, 296]], S.C, 1.2); for (let x = 270; x < 420; x += 24) ln(c, x, 276, x + 2, 294, 1.2, S.b);
  for (let i = 0; i < 3; i++) { const k = ((t * 0.6 + i / 3) % 1); c.save(); c.globalAlpha = 1 - k; txt(c, 'Z', hx + 30 + k * 60, hy - 50 - k * 70, 12 + k * 14, S.W); c.restore(); }
  c.save(); c.translate(198, 290); V.drawObject(c, 'clock', 0, 0, 0.3); c.restore();
  rect(c, 0, 0, 512, 22, 'rgba(0,0,0,0)');
  if (noText) return;
  c.save(); c.shadowColor = '#000'; c.shadowOffsetY = 4; txt(c, 'THE LONG', 256, 112, 34, S.Y); txt(c, 'LIE-IN', 256, 156, 52, S.M); c.restore();
}
function drawWin(c, t) {
  bedroomBackdrop(c); LOOK.bigbed(c, { x1: 120, x2: 214, y: 140 }); LOOK.bedside(c, { x1: 88, x2: 108, y: 148 });
  V.drawNorris(c, (t % 4) < 1.6 ? 'yawn' : 'idle', 300, 282, 0.7, -1);
  const j = Math.sin(t * 50) * 2; c.save(); c.translate(198 + j, 296); V.drawObject(c, 'clock', 0, 0, 0.32); c.restore();
  for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.6; ln(c, 198 + Math.cos(a) * 22, 270 + Math.sin(a) * 22, 198 + Math.cos(a) * 32, 270 + Math.sin(a) * 32, 2, S.Y); }
  for (let i = 0; i < 20; i++) { const x = (i * 83 + t * 40 * (1 + i % 3)) % 512, y = (i * 47 + t * 60) % 384; star(c, x, y, 3, [S.Y, S.C, S.M, S.G][i % 4]); }
}

root.LLI_ART = { PAL, LOOK, DEC, ITEM, ENEMY, THING, drawScene, drawArcade, drawTitle, drawWin, drawItemArt, norrisPose, clearCache: () => cache.clear(), sheep };
})(typeof window !== 'undefined' ? window : globalThis);

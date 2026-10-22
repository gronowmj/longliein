/* The Long Lie-In — sample room "The Hall" (v3: Spectrum palette, flat colour,
   drawn smoothly at high res). 512x384 room space = 2x the 256x192 play area.
   Needs v3.js first. */
(function (root) {
'use strict';
const S = { K: '#000000', b: '#0000D7', B: '#0000FF', r: '#D70000', R: '#FF0000', m: '#D700D7', M: '#FF00FF',
  g: '#00D700', G: '#00FF00', c: '#00D7D7', C: '#00FFFF', y: '#D7D700', Y: '#FFFF00', w: '#D7D7D7', W: '#FFFFFF' };
const HALL_PLATFORMS = [
  { x1: 0, x2: 512, y: 352, name: 'floor' },
  { x1: 146, x2: 266, y: 270, name: 'hall table' },
  { x1: 262, x2: 352, y: 178, name: 'shelf' },
  ...Array.from({ length: 8 }, (_, i) => ({ x1: 360 + i * 12, x2: 372 + i * 12, y: 352 - 19 * (i + 1), name: 'stair ' + (i + 1) })),
  { x1: 456, x2: 512, y: 200, name: 'landing' }
];
const rect = (ctx, x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); };
function ln(ctx, x1, y1, x2, y2, w = 1.2, col = S.K) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = 'butt'; ctx.stroke(); }
function shape(ctx, pts, col, edge) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); if (edge) { ctx.lineWidth = edge; ctx.strokeStyle = S.K; ctx.lineJoin = 'miter'; ctx.stroke(); } }
function disc(ctx, x, y, r, col, edge) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); if (edge) { ctx.lineWidth = edge; ctx.strokeStyle = S.K; ctx.stroke(); } }
function oval(ctx, x, y, rx, ry, col, edge) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); if (edge) { ctx.lineWidth = edge; ctx.strokeStyle = S.K; ctx.stroke(); } }
function bricks(ctx, x, y, w, h, col, bh = 8, bw = 18) {
  rect(ctx, x, y, w, h, col);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  for (let r = 0, yy = y; yy < y + h; r++, yy += bh) { ln(ctx, x, yy, x + w, yy, 1.6); for (let xx = x - (r % 2) * bw / 2; xx < x + w; xx += bw) ln(ctx, xx, yy, xx, yy + bh, 1.6); }
  ctx.restore();
}
// a turned baluster / table leg profile, centred on x, from y1 (top) to y2 (bottom)
function turned(ctx, x, y1, y2, w, col) {
  const h = y2 - y1, k = t => y1 + h * t;
  rect(ctx, x - w * 0.5, k(0), w, h * 0.1, col);
  rect(ctx, x - w * 0.22, k(0.1), w * 0.44, h * 0.14, col);
  oval(ctx, x, k(0.36), w * 0.42, h * 0.14, col);
  rect(ctx, x - w * 0.18, k(0.48), w * 0.36, h * 0.16, col);
  oval(ctx, x, k(0.7), w * 0.5, h * 0.12, col);
  rect(ctx, x - w * 0.22, k(0.8), w * 0.44, h * 0.1, col);
  rect(ctx, x - w * 0.5, k(0.9), w, h * 0.1, col);
  ln(ctx, x - w * 0.5, k(0.1), x + w * 0.5, k(0.1), 1); ln(ctx, x - w * 0.5, k(0.9), x + w * 0.5, k(0.9), 1);
}

function walls(ctx) {
  rect(ctx, 0, 0, 512, 384, S.K);
  bricks(ctx, 0, 0, 512, 22, S.r, 7.3, 20);
  rect(ctx, 0, 22, 512, 3, S.Y); ln(ctx, 0, 25.5, 512, 25.5, 1);
  for (let x = 6; x < 512; x += 14) rect(ctx, x, 26, 6, 3, S.M);
  // blue pillars
  for (const px of [138, 312, 476]) { rect(ctx, px - 3, 30, 6, 210, S.b); rect(ctx, px - 6, 29, 12, 5, S.B); rect(ctx, px - 6, 232, 12, 5, S.B); }
  // red plank wainscot + yellow dado rail
  rect(ctx, 0, 240, 512, 112, S.r);
  for (let x = 4; x < 512; x += 9) ln(ctx, x, 242, x, 352, 1.4);
  rect(ctx, 0, 236, 512, 6, S.Y); ln(ctx, 0, 242, 512, 242, 1.4);
}
function floor(ctx) {
  rect(ctx, 0, 352, 512, 9, S.C); ln(ctx, 0, 361, 512, 361, 1.6);
  rect(ctx, 0, 361.5, 512, 23, S.b);
  for (let r = 0; r < 2; r++) for (let x = (r ? 40 : 0); x < 512; x += 80) ln(ctx, x, 362 + r * 11, x, 373 + r * 11, 1.4);
  ln(ctx, 0, 373, 512, 373, 1.4);
}
function door(ctx) {
  rect(ctx, 8, 180, 70, 172, S.W);                 // frame
  rect(ctx, 14, 186, 58, 166, S.M);                // plank leaf
  for (let x = 14 + 9.6; x < 72; x += 9.6) ln(ctx, x, 186, x, 352, 1.6);
  for (const by of [204, 330]) { rect(ctx, 14, by - 5, 58, 10, S.m); ln(ctx, 14, by - 5, 72, by - 5, 1.2); ln(ctx, 14, by + 5, 72, by + 5, 1.2); }
  shape(ctx, [[16, 325], [24, 325], [70, 209], [62, 209]], S.m); ln(ctx, 16, 325, 62, 209, 1.2); ln(ctx, 24, 325, 70, 209, 1.2);
  for (const hy of [204, 330]) shape(ctx, [[14, hy - 3], [36, hy - 1.5], [36, hy + 1.5], [14, hy + 3]], S.Y, 1);
  rect(ctx, 26, 266, 34, 8, S.Y); ln(ctx, 29, 270, 57, 270, 2);             // letterbox
  disc(ctx, 64, 290, 4, S.Y, 1); disc(ctx, 64, 290, 1.6, S.K);
  rect(ctx, 4, 346, 80, 6, S.y); for (let x = 8; x < 82; x += 6) ln(ctx, x, 346, x, 352, 1);   // doormat
}
function hatStand(ctx) {
  const x = 106, Y = S.y;
  shape(ctx, [[x - 18, 352], [x - 14, 352], [x, 338], [x + 14, 352], [x + 18, 352], [x + 2, 334], [x - 2, 334]], Y);
  rect(ctx, x - 2.5, 172, 5, 168, Y);
  disc(ctx, x, 170, 5, S.Y);
  for (const d of [-1, 1]) { ln(ctx, x, 190, x + d * 15, 180, 3, Y); disc(ctx, x + d * 15, 180, 2.6, S.Y); }
  // ordinary green overcoat
  shape(ctx, [[x - 6, 188], [x + 6, 188], [x + 22, 204], [x + 26, 272], [x - 26, 272], [x - 22, 204]], S.G, 1.4);
  shape(ctx, [[x - 22, 204], [x - 10, 196], [x - 12, 272], [x - 26, 272]], S.g);
  shape(ctx, [[x - 6, 188], [x, 214], [x + 6, 188]], S.g, 1.2);
  ln(ctx, x, 214, x, 272, 1.4);
  for (const by of [224, 240, 256]) disc(ctx, x + 4, by, 2, S.Y);
  rect(ctx, x - 20, 244, 10, 3, S.g); rect(ctx, x + 10, 244, 10, 3, S.g);
  // red trilby hat on top
  oval(ctx, x, 168, 20, 4.5, S.r, 1.2);
  shape(ctx, [[x - 12, 167], [x - 10, 152], [x, 149], [x + 10, 152], [x + 12, 167]], S.R, 1.2);
  rect(ctx, x - 12, 161, 24, 4, S.K);
}
function chandelier(ctx) {
  const x = 200;
  oval(ctx, x, 30, 16, 5, S.C);
  for (let y = 34; y < 64; y += 6) oval(ctx, x, y + 2, 2, 3, S.Y);
  ctx.lineCap = 'round';
  // ornate arms
  ctx.strokeStyle = S.Y; ctx.lineWidth = 3.4;
  for (const d of [-1, 1]) for (const k of [1, 2]) {
    const ex = x + d * (k === 1 ? 22 : 44), ey = 74;
    ctx.beginPath(); ctx.moveTo(x, 86); ctx.bezierCurveTo(x + d * 8 * k, 104, ex, 100, ex, ey + 4); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + d * (k === 1 ? 14 : 30), 96, 3.2, 0, Math.PI * 2); ctx.stroke();
  }
  oval(ctx, x, 80, 6, 16, S.Y); ln(ctx, x - 6, 80, x + 6, 80, 1.4); disc(ctx, x, 100, 4, S.Y);
  for (const ex of [x - 44, x - 22, x + 22, x + 44]) {
    shape(ctx, [[ex - 7, 76], [ex + 7, 76], [ex + 4, 80], [ex - 4, 80]], S.Y);
    rect(ctx, ex - 2.6, 60, 5.2, 16, S.W);
    ctx.beginPath(); ctx.moveTo(ex, 47); ctx.quadraticCurveTo(ex + 5, 54, ex, 58); ctx.quadraticCurveTo(ex - 5, 54, ex, 47); ctx.fillStyle = S.Y; ctx.fill();
    disc(ctx, ex, 55, 1.6, S.R);
  }
}
function windowMoon(ctx) {
  rect(ctx, 334, 38, 100, 106, S.W);
  rect(ctx, 341, 45, 86, 92, S.K);
  disc(ctx, 404, 70, 12, S.Y); disc(ctx, 399, 66, 2.6, S.y); disc(ctx, 409, 75, 1.8, S.y);
  for (const [sx, sy] of [[352, 58], [372, 84], [358, 116], [420, 110], [388, 54]]) { rect(ctx, sx - 0.8, sy - 4, 1.6, 8, S.W); rect(ctx, sx - 4, sy - 0.8, 8, 1.6, S.W); }
  shape(ctx, [[341, 137], [341, 124], [356, 112], [371, 124], [394, 124], [412, 108], [427, 120], [427, 137]], S.b);
  rect(ctx, 360, 126, 4, 5, S.Y); rect(ctx, 410, 120, 4, 5, S.Y);
  rect(ctx, 382, 45, 4, 92, S.W); rect(ctx, 341, 89, 86, 4, S.W);
  rect(ctx, 328, 142, 112, 6, S.W); ln(ctx, 328, 148, 440, 148, 1.2);
  // magenta curtains + red pelmet
  for (const [x0, d] of [[318, 1], [450, -1]]) {
    shape(ctx, [[x0, 32], [x0 + d * 22, 32], [x0 + d * 16, 96], [x0 + d * 24, 162], [x0, 162]], S.M);
    for (const fx of [6, 13]) ln(ctx, x0 + d * fx, 34, x0 + d * (fx - 2), 160, 1.4, S.m);
  }
  rect(ctx, 312, 24, 144, 10, S.R); for (let x = 316; x < 456; x += 8) disc(ctx, x, 35, 2.2, S.R);
}
function table(ctx) {
  for (const lx of [158, 254]) turned(ctx, lx, 296, 352, 11, S.Y);
  rect(ctx, 152, 280, 108, 18, S.r); ln(ctx, 152, 298, 260, 298, 1.2);
  rect(ctx, 186, 283, 40, 12, S.R); ln(ctx, 186, 283, 226, 283, 1); disc(ctx, 206, 289, 2.4, S.Y);
  rect(ctx, 146, 270, 120, 10, S.Y); ln(ctx, 146, 280, 266, 280, 1.4);
  rect(ctx, 166, 336, 80, 4, S.y);
}
function clock(ctx) {
  const x = 268, w = 42, cx = x + w / 2;
  rect(ctx, x, 338, w, 14, S.r); rect(ctx, x - 2, 336, w + 4, 4, S.Y);
  rect(ctx, x + 5, 244, w - 10, 92, S.r);
  rect(ctx, x + 12, 254, w - 24, 72, S.K); ln(ctx, cx, 256, cx + 2, 304, 1.6, S.Y); disc(ctx, cx + 2, 308, 5.5, S.Y);
  rect(ctx, x + 3, 240, w - 6, 5, S.Y);
  rect(ctx, x, 190, w, 50, S.r);
  shape(ctx, [[x - 3, 192], [cx, 178], [x + w + 3, 192]], S.R); rect(ctx, x - 3, 190, w + 6, 4, S.Y);
  disc(ctx, cx, 216, 15, S.Y); disc(ctx, cx, 216, 12.5, S.W);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; disc(ctx, cx + Math.sin(a) * 10, 216 - Math.cos(a) * 10, i % 3 ? 0.8 : 1.4, S.K); }
  ln(ctx, cx, 216, cx, 208, 1.8); ln(ctx, cx, 216, cx + 6, 219, 1.8);
  // cyan shelf above
  rect(ctx, 262, 178, 90, 6, S.C); ln(ctx, 262, 184, 352, 184, 1.2);
  for (const bx of [316, 344]) shape(ctx, [[bx - 4, 184], [bx + 4, 184], [bx, 196]], S.c);
}
function stairs(ctx) {
  // red brick landing ledge
  bricks(ctx, 456, 200, 56, 40, S.r, 8, 18);
  rect(ctx, 456, 198, 56, 4, S.M);
  for (let i = 0; i < 8; i++) {
    const sx = 360 + i * 12, sy = 352 - 19 * (i + 1);
    rect(ctx, sx, sy, 24, 19, S.R); rect(ctx, sx, sy, 24, 3, S.M);
    ln(ctx, sx, sy + 19, sx + 24, sy + 19, 1.2); ln(ctx, sx, sy, sx, sy + 19, 1.2);
  }
  // under-stairs: black triangle, so the stairs read as a solid flight
  shape(ctx, [[384, 352], [480, 200], [512, 200], [512, 352]], S.K);
  bricks(ctx, 456, 200, 56, 40, S.r, 8, 18); rect(ctx, 456, 198, 56, 4, S.M);
  // turned balusters + handrail + newel post
  for (let i = 0; i < 8; i++) { const bx = 368 + i * 12, sy = 352 - 19 * (i + 1); turned(ctx, bx, sy - 36, sy, 7, S.Y); }
  for (let bx = 464; bx < 512; bx += 12) turned(ctx, bx, 162, 198, 7, S.Y);
  ctx.lineCap = 'butt'; ctx.strokeStyle = S.R; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(352, 312); ctx.lineTo(458, 158); ctx.lineTo(512, 158); ctx.stroke();
  ctx.strokeStyle = S.K; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(352, 315); ctx.lineTo(458, 161); ctx.lineTo(512, 161); ctx.stroke();
  rect(ctx, 350, 312, 13, 40, S.Y); ln(ctx, 350, 322, 363, 322, 1.2); ln(ctx, 350, 342, 363, 342, 1.2);
  disc(ctx, 356.5, 306, 7, S.Y); rect(ctx, 349, 310, 15, 3, S.y);
}
function drawHall(ctx, x = 0, y = 0, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.rect(0, 0, 512, 384); ctx.clip();
  walls(ctx); windowMoon(ctx); chandelier(ctx); door(ctx); hatStand(ctx); clock(ctx); table(ctx); stairs(ctx); floor(ctx);
  ctx.restore();
}
root.LLI_V3_HALL = { drawHall, HALL_PLATFORMS, SPECTRUM: S, SIZE: [512, 384] };
})(typeof window !== 'undefined' ? window : globalThis);

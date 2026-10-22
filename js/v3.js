/* The Long Lie-In — v3 art: Spectrum-style flat colour, redrawn cleanly at high res. Original artwork, drawn with Canvas 2D.
   Every draw function takes (ctx, x, y, scale, ...) where (x,y) is the
   object's ground point (bottom-centre). Units: Norris is 150 units tall,
   enemies and objects sit in a 100x100 box. Usable directly in the game. */
(function (root) {
'use strict';
const OUT = '#000000';
const C = {
  out: OUT, skin: '#ffd6ad', skinSh: '#f2b184', blush: '#ff9a8a', nose: '#f47f6e',
  pj: '#9fd4f7', pjSh: '#74b4e2', pjStripe: '#FFFFFF',
  cap: '#2f4ea3', capSh: '#1f3678', capPeak: '#1a2a5e', badge: '#FFFF00',
  tasselA: '#FF0000', tasselB: '#FFFFFF', pom: '#FFFFFF',
  bag: '#FF0000', bagSh: '#D70000', buckle: '#FFFF00', paper: '#FFFFFF',
  slip: '#d9558f', slipSh: '#ad3a6e', slipPom: '#FFFFFF', hair: '#d8742e',
  mouth: '#000000', tongue: '#FF0000', white: '#FFFFFF', eye: '#000000'
};
let LW = 0.55, ROUND = 0.45;
const rad = d => d * Math.PI / 180;

/* ---------- helpers ---------- */
function fillStroke(ctx, fill, lw) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (lw) { ctx.lineWidth = lw * LW; ctx.strokeStyle = OUT; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
}
function ell(ctx, x, y, rx, ry, fill, lw = 3, rot = 0) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); fillStroke(ctx, fill, lw);
}
function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r * ROUND, w / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function box(ctx, x, y, w, h, r, fill, lw = 3) { rrect(ctx, x, y, w, h, r); fillStroke(ctx, fill, lw); }
function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); }
function limb(ctx, pts, w, col, lw = 3) {
  lw *= LW;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  poly(ctx, pts); ctx.strokeStyle = OUT; ctx.lineWidth = w + lw * 2; ctx.stroke();
  poly(ctx, pts); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
}
function line(ctx, x1, y1, x2, y2, lw = 3, col = OUT) {
  if (col === OUT) lw *= LW;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.stroke();
}
function shine(ctx, x, y, rx, ry, a = 0.55, rot = -0.5) { return;
  ctx.save(); ctx.globalAlpha = a; ell(ctx, x, y, rx, ry, '#FFFFFF', 0, rot); ctx.restore();
}
function withClip(ctx, pathFn, drawFn) { ctx.save(); pathFn(); ctx.clip(); drawFn(); ctx.restore(); }
const H_limb = (...a) => limb(...a);
function seg(p, len, ang) { return [p[0] + len * Math.sin(rad(ang)), p[1] + len * Math.cos(rad(ang))]; }

/* ---------- Norris Nod (v3: white striped pyjamas, nightcap, slippers) ---------- */
const N = { pj: '#FFFFFF', pjBack: '#D7D7D7', stripe: '#00C8D7', skin: '#FFD2B0', skinSh: '#EDB592',
  cap: '#FFFFFF', capStripe: '#FF0000', bobble: '#FFFF00', slip: '#FF0000', slipBack: '#D70000', eye: '#000000' };
const POSES = {
  idle:  { bob: 0, crouch: 0, legs: [[-5, 3], [5, 3]], arms: [[-8, 10], [5, 14]], eyes: 'droopy', mouth: 'smile', tassel: 0 },
  blink: { bob: 0, crouch: 0, legs: [[-5, 3], [5, 3]], arms: [[-8, 10], [5, 14]], eyes: 'closed', mouth: 'smile', tassel: 0 },
  yawn:  { bob: -1, crouch: 0, legs: [[-5, 3], [5, 3]], arms: [[172, 8], [60, 160]], eyes: 'squeeze', mouth: 'yawn', tassel: 6 },
  walk1: { bob: 1, crouch: 0, legs: [[-22, 12], [24, 4]], arms: [[22, 14], [-22, 12]], eyes: 'droopy', mouth: 'smile', tassel: -8 },
  walk2: { bob: -2, crouch: 0, legs: [[6, 55], [0, 0]], arms: [[4, 12], [-4, 12]], eyes: 'droopy', mouth: 'smile', tassel: 8 },
  walk3: { bob: 1, crouch: 0, legs: [[24, 4], [-22, 12]], arms: [[-22, 12], [22, 14]], eyes: 'droopy', mouth: 'smile', tassel: -8 },
  walk4: { bob: -2, crouch: 0, legs: [[0, 0], [6, 55]], arms: [[-4, 12], [4, 12]], eyes: 'droopy', mouth: 'smile', tassel: 8 },
  jump1: { bob: 0, crouch: 12, legs: [[32, 70], [42, 78]], arms: [[-40, 18], [-30, 26]], eyes: 'closed', mouth: 'grit', tassel: 16 },
  jump2: { bob: 0, crouch: -6, legs: [[22, 82], [50, 96]], arms: [[165, -10], [125, -40]], eyes: 'droopy', mouth: 'o', tassel: 34 },
  jump3: { bob: 0, crouch: -2, legs: [[-12, 12], [16, 16]], arms: [[150, 10], [95, -55]], eyes: 'wide', mouth: 'o', tassel: -60 }
};
const NLW = 1.7; // Norris outline width (units)
function nLimb(ctx, pts, w, col, stripe) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  poly(ctx, pts); ctx.strokeStyle = OUT; ctx.lineWidth = w + NLW * 2; ctx.stroke();
  poly(ctx, pts); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  if (stripe) { poly(ctx, pts); ctx.strokeStyle = N.stripe; ctx.lineWidth = 1.6; ctx.stroke(); }
}
function nArm(ctx, sh, a, b, back) {
  const el = seg(sh, 18, a), hand = seg(el, 16, a + b);
  nLimb(ctx, [sh, el, hand], 7.5, back ? N.pjBack : N.pj, true);
  ell(ctx, hand[0], hand[1], 4.4, 4.4, back ? N.skinSh : N.skin, NLW / LW);
}
function nLeg(ctx, hip, a, b, back) {
  const kn = seg(hip, 23, a), an = seg(kn, 22, a - b);
  nLimb(ctx, [hip, kn, an], 10, back ? N.pjBack : N.pj, true);
  const tilt = rad(Math.max(-35, Math.min(35, -(a - b) * 0.6)));
  ctx.save(); ctx.translate(an[0], an[1]); ctx.rotate(tilt);
  poly(ctx, [[-7, -3], [6, -4], [14, -1], [16, 3], [14, 6], [-7, 6]]); ctx.closePath();
  ctx.fillStyle = back ? N.slipBack : N.slip; ctx.fill(); ctx.lineWidth = NLW; ctx.strokeStyle = OUT; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}
function nStroke(ctx, fill, lw = NLW) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = lw; ctx.strokeStyle = OUT; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
function nHead(ctx, hx, hy, P) {
  nTail(ctx, hx, hy, P);
  // head
  ctx.beginPath(); ctx.ellipse(hx, hy, 14, 16, 0, 0, Math.PI * 2); nStroke(ctx, N.skin);
  // nose: small, skin-tone
  ctx.beginPath(); ctx.moveTo(hx + 13, hy - 2); ctx.quadraticCurveTo(hx + 19, hy + 3, hx + 16, hy + 5); ctx.quadraticCurveTo(hx + 14, hy + 6, hx + 12.5, hy + 5); nStroke(ctx, N.skin);
  ctx.beginPath(); ctx.ellipse(hx - 7, hy + 2, 3.2, 4.2, 0, 0, Math.PI * 2); nStroke(ctx, N.skinSh, 1.3);
  // eye
  const ex = hx + 6.5, ey = hy - 2;
  if (P.eyes === 'closed') { ctx.beginPath(); ctx.moveTo(ex - 3.8, ey + 0.5); ctx.quadraticCurveTo(ex, ey + 3.2, ex + 3.8, ey + 0.2); nStroke(ctx, null, 1.8); }
  else if (P.eyes === 'squeeze') { poly(ctx, [[ex - 4, ey + 2], [ex, ey - 1], [ex + 4, ey + 2]]); nStroke(ctx, null, 1.8); }
  else if (P.eyes === 'wide') {
    ctx.beginPath(); ctx.ellipse(ex, ey - 0.5, 3.6, 4.2, 0, 0, Math.PI * 2); nStroke(ctx, '#FFFFFF', 1.4);
    ell(ctx, ex + 1, ey - 0.5, 1.6, 1.6, '#000000', 0);
    ctx.beginPath(); ctx.moveTo(ex - 4, ey - 7); ctx.lineTo(ex + 4, ey - 8); nStroke(ctx, null, 1.6);
  } else {
    ctx.beginPath(); ctx.ellipse(ex, ey, 3.6, 3.4, 0, 0, Math.PI * 2); nStroke(ctx, '#FFFFFF', 1.3);
    ell(ctx, ex + 1, ey + 1.2, 1.8, 1.8, '#000000', 0);
    ctx.beginPath(); ctx.moveTo(ex - 3.8, ey + 0.3); ctx.lineTo(ex - 3.8, ey - 3.6); ctx.lineTo(ex + 3.8, ey - 3.6); ctx.lineTo(ex + 3.8, ey - 0.2); ctx.closePath(); ctx.fillStyle = N.skinSh; ctx.fill();
    ctx.beginPath(); ctx.moveTo(ex - 4.2, ey + 0.4); ctx.lineTo(ex + 4.2, ey - 0.4); nStroke(ctx, null, 1.8);
  }
  // mouth
  const mx = hx + 7.5, my = hy + 9;
  if (P.mouth === 'yawn') { ctx.beginPath(); ctx.ellipse(mx, my, 2.8, 4, 0, 0, Math.PI * 2); nStroke(ctx, '#000000', 1.2); ell(ctx, mx, my + 2.2, 1.8, 1.2, '#FF0000', 0); }
  else if (P.mouth === 'o') { ctx.beginPath(); ctx.ellipse(mx + 0.5, my, 1.6, 2, 0, 0, Math.PI * 2); nStroke(ctx, '#000000', 1.2); }
  else if (P.mouth === 'grit') { ctx.beginPath(); ctx.moveTo(mx - 3, my); ctx.lineTo(mx + 3, my - 0.5); nStroke(ctx, null, 1.5); }
  else { ctx.beginPath(); ctx.moveTo(mx - 3, my - 0.5); ctx.quadraticCurveTo(mx, my + 1.8, mx + 3, my - 1); nStroke(ctx, null, 1.5); }
  // nightcap dome + band (floppy tail is drawn behind the head)
  const dome = () => { ctx.beginPath(); ctx.moveTo(hx + 15, hy - 8); ctx.quadraticCurveTo(hx + 14, hy - 30, hx - 2, hy - 30);
    ctx.quadraticCurveTo(hx - 16, hy - 29, hx - 15, hy - 5); ctx.closePath(); };
  dome(); ctx.fillStyle = N.cap; ctx.fill();
  ctx.save(); dome(); ctx.clip(); ctx.translate(hx, hy - 18); ctx.rotate(rad(-35));
  for (let k = -50; k < 50; k += 10) { ctx.fillStyle = N.capStripe; ctx.fillRect(k, -40, 4, 80); }
  ctx.restore(); dome(); nStroke(ctx, null);
  ctx.beginPath(); ctx.moveTo(hx - 16, hy - 4); ctx.lineTo(hx - 15, hy - 11); ctx.quadraticCurveTo(hx, hy - 15, hx + 16, hy - 13); ctx.lineTo(hx + 16, hy - 6); ctx.quadraticCurveTo(hx, hy - 8, hx - 16, hy - 4); ctx.closePath(); nStroke(ctx, '#FFFFFF');
}
function nTail(ctx, hx, hy, P) {
  const an = [hx - 6, hy - 25];
  const a = rad(Math.max(22, Math.min(140, 38 - (P.tassel || 0) * 1.5)));
  const L = 34, tip = [an[0] - L * Math.sin(a), an[1] + L * Math.cos(a)];
  const mid = [an[0] - L * 0.55 * Math.sin(a) - 6 * Math.cos(a), an[1] + L * 0.55 * Math.cos(a) - 6 * Math.sin(a)];
  const nx = Math.cos(a), ny = Math.sin(a);
  const tail = () => { ctx.beginPath(); ctx.moveTo(an[0] + nx * 8, an[1] + ny * 8);
    ctx.quadraticCurveTo(mid[0] + nx * 5, mid[1] + ny * 5, tip[0] + nx * 2, tip[1] + ny * 2);
    ctx.lineTo(tip[0] - nx * 2, tip[1] - ny * 2);
    ctx.quadraticCurveTo(mid[0] - nx * 5, mid[1] - ny * 5, an[0] - nx * 8, an[1] - ny * 8); ctx.closePath(); };
  tail(); ctx.fillStyle = N.cap; ctx.fill();
  ctx.save(); tail(); ctx.clip(); ctx.translate(an[0], an[1]); ctx.rotate(a);
  for (let k = 4; k < 44; k += 9) { ctx.fillStyle = N.capStripe; ctx.fillRect(-20, k, 40, 4); }
  ctx.restore(); tail(); nStroke(ctx, null);
  ctx.beginPath(); ctx.arc(tip[0], tip[1], 4.8, 0, Math.PI * 2); nStroke(ctx, N.bobble);
}
function drawNorris(ctx, pose, x, y, s = 1, facing = 1) {
  const P = POSES[pose] || POSES.idle;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * facing, s); ctx.translate(-50, -150);
  const dy = P.bob + P.crouch, hip = [48, 100 + dy];
  nArm(ctx, [41, 65 + dy], P.arms[0][0], P.arms[0][1], true);
  nLeg(ctx, [hip[0] - 3, hip[1]], P.legs[0][0], P.legs[0][1], true);
  nLeg(ctx, [hip[0] + 3, hip[1]], P.legs[1][0], P.legs[1][1], false);
  // pyjama top: squarer silhouette
  const body = () => { ctx.beginPath(); ctx.moveTo(38, 60 + dy); ctx.lineTo(59, 60 + dy); ctx.quadraticCurveTo(66, 66 + dy, 65, 80 + dy);
    ctx.lineTo(65, 104 + dy); ctx.lineTo(33, 104 + dy); ctx.lineTo(33, 70 + dy); ctx.quadraticCurveTo(33, 61 + dy, 38, 60 + dy); ctx.closePath(); };
  body(); ctx.fillStyle = N.pj; ctx.fill();
  ctx.save(); body(); ctx.clip(); for (let sx = 36; sx < 68; sx += 6) { ctx.fillStyle = N.stripe; ctx.fillRect(sx, 56 + dy, 1.8, 52); } ctx.restore();
  body(); nStroke(ctx, null);
  // collar + buttons + hem
  poly(ctx, [[46, 60 + dy], [53, 68 + dy], [60, 60 + dy]]); nStroke(ctx, '#FFFFFF', 1.4);
  for (const by of [76, 86, 96]) ell(ctx, 56, by + dy, 1.5, 1.5, '#FF0000', 0);
  line(ctx, 33, 99 + dy, 65, 99 + dy, 1.4 / LW);
  nHead(ctx, 50, 41 + dy * 0.9 + (P.crouch > 0 ? 2 : 0), P);
  nArm(ctx, [57, 66 + dy], P.arms[1][0], P.arms[1][1], false);
  ctx.restore();
}
function drawNorrisHead(ctx, x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-50, -36); nHead(ctx, 50, 41, POSES.idle); ctx.restore(); }
/* ---------- Nightmares ---------- */
function eyePair(ctx, pts, r, look = [1, 0.5], lid = 0) {
  for (const [ex, ey] of pts) {
    ell(ctx, ex, ey, r, r * 1.1, '#FFFFFF', 2.6);
    ell(ctx, ex + look[0] * r * 0.35, ey + look[1] * r * 0.35, r * 0.48, r * 0.52, C.eye, 0);
    ell(ctx, ex + look[0] * r * 0.35 + r * 0.15, ey - r * 0.1, r * 0.15, r * 0.15, '#FFFFFF', 0);
    if (lid) {
      ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, r, r * 1.1, 0, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = lid; ctx.beginPath(); ctx.moveTo(ex - r - 2, ey - r * 1.2 - 2); ctx.lineTo(ex + r + 2, ey - r * 1.2 - 2); ctx.lineTo(ex + r + 2, ey - r * 0.1); ctx.lineTo(ex - r - 2, ey - r * 0.6); ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.moveTo(ex - r, ey - r * 0.55); ctx.lineTo(ex + r, ey - r * 0.05); fillStroke(ctx, null, 2.6);
      ctx.beginPath(); ctx.ellipse(ex, ey, r, r * 1.1, 0, 0, Math.PI * 2); fillStroke(ctx, null, 2.6);
    }
  }
}
function drawBottle(ctx, frame, x, y, s = 1, facing = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * facing, s); ctx.translate(-50, -100);
  const hop = frame ? -10 : 0, sq = frame ? 1.04 : 1;
  if (frame) { ctx.save(); ctx.globalAlpha = 0.25; ell(ctx, 50, 98, 26, 4, '#000', 0); ctx.restore(); }
  ctx.translate(50, 100 + hop); ctx.scale(1 / sq, sq); ctx.translate(-50, -100);
  const R = '#FF0000', RS = '#D70000';
  const shape = () => { ctx.beginPath(); ctx.moveTo(40, 28); ctx.lineTo(60, 28); ctx.quadraticCurveTo(62, 36, 70, 38);
    ctx.quadraticCurveTo(84, 42, 84, 58); ctx.lineTo(84, 84); ctx.quadraticCurveTo(84, 98, 70, 98); ctx.lineTo(30, 98);
    ctx.quadraticCurveTo(16, 98, 16, 84); ctx.lineTo(16, 58); ctx.quadraticCurveTo(16, 42, 30, 38); ctx.quadraticCurveTo(38, 36, 40, 28); ctx.closePath(); };
  shape(); fillStroke(ctx, R, 0);
  withClip(ctx, shape, () => { ell(ctx, 22, 74, 12, 34, RS, 0); for (let ry = 50; ry < 98; ry += 7) { line(ctx, 20, ry, 30, ry, 2, 'rgba(120,30,20,.45)'); } });
  shape(); fillStroke(ctx, null, 3.4);
  shine(ctx, 72, 52, 4, 9, 0.5, 0.3);
  // stopper
  box(ctx, 38, 14, 24, 16, 4, '#FFFF00', 3); line(ctx, 43, 18, 43, 27, 2, '#D7D700'); line(ctx, 50, 18, 50, 27, 2, '#D7D700'); line(ctx, 57, 18, 57, 27, 2, '#D7D700');
  // face
  eyePair(ctx, [[40, 56], [62, 56]], 7, [0.8, 0.3], R);
  if (frame) {
    ctx.beginPath(); ctx.moveTo(28, 70); ctx.quadraticCurveTo(50, 64, 74, 70); ctx.quadraticCurveTo(72, 94, 50, 94); ctx.quadraticCurveTo(28, 94, 28, 70); ctx.closePath(); fillStroke(ctx, C.mouth, 3);
    ctx.fillStyle = '#FFFFFF'; poly(ctx, [[30, 70], [36, 78], [42, 68], [48, 77], [54, 67], [60, 77], [66, 68], [72, 76], [73, 70]]); ctx.closePath(); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = OUT; ctx.stroke();
    ell(ctx, 50, 89, 9, 4, C.tongue, 0);
  } else {
    ctx.beginPath(); ctx.moveTo(28, 74); ctx.quadraticCurveTo(50, 86, 74, 72); ctx.lineTo(70, 82); ctx.quadraticCurveTo(50, 92, 32, 82); ctx.closePath(); fillStroke(ctx, C.mouth, 3);
    ctx.fillStyle = '#FFFFFF'; poly(ctx, [[30, 76], [35, 82], [40, 79], [45, 85], [50, 81], [55, 85], [60, 80], [65, 83], [71, 75]]); ctx.closePath(); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = OUT; ctx.stroke();
  }
  ctx.restore();
}
function drawMoth(ctx, frame, x, y, s = 1, facing = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * facing, s); ctx.translate(-50, -100);
  const W = '#FFFFFF', WS = '#D7D7D7';
  const up = frame === 0;
  // wings
  for (const side of [0, 1]) {
    ctx.save(); ctx.translate(46, 60); ctx.scale(1.3, up ? 1.3 : 0.75); ctx.rotate(rad(up ? (side ? 14 : -22) : (side ? 62 : -68)));
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-30 + side * 26, -44, 2 + side * 34, -56, 10 + side * 10, -8); ctx.closePath();
    fillStroke(ctx, side ? W : WS, 3);
    ell(ctx, -4 + side * 18, -28, 5, 6, '#00FFFF', 2);
    ctx.restore();
  }
  // slipper body
  const S = '#FF00FF', SS = '#D700D7';
  ctx.beginPath(); ctx.moveTo(14, 70); ctx.quadraticCurveTo(14, 56, 30, 56); ctx.lineTo(64, 58); ctx.quadraticCurveTo(90, 60, 90, 74);
  ctx.quadraticCurveTo(90, 84, 74, 84); ctx.lineTo(24, 84); ctx.quadraticCurveTo(14, 84, 14, 70); ctx.closePath(); fillStroke(ctx, S, 3.2);
  box(ctx, 14, 80, 78, 9, 4.5, '#00FFFF', 3); // sole
  ctx.beginPath(); ctx.moveTo(16, 66); ctx.quadraticCurveTo(28, 52, 42, 62); ctx.quadraticCurveTo(30, 72, 16, 66); fillStroke(ctx, SS, 2.6); // opening
  // fluffy cuff
  for (let i = 0; i < 5; i++) ell(ctx, 50 + i * 6, 62 + Math.sin(i) * 2, 5, 5, '#FFFFFF', 2.2);
  // face + antennae
  line(ctx, 78, 62, 84, 38, 2.6); line(ctx, 84, 63, 96, 44, 2.6);
  ell(ctx, 84, 37, 3.5, 3.5, '#FFFF00', 2.2); ell(ctx, 96, 43, 3.5, 3.5, '#FFFF00', 2.2);
  eyePair(ctx, [[72, 70], [82, 69]], 4.6, [0.7, 0.4]);
  ctx.beginPath(); ctx.moveTo(74, 78); ctx.quadraticCurveTo(79, 81, 85, 77); fillStroke(ctx, null, 2.4);
  ctx.restore();
}
function drawSock(ctx, frame, x, y, s = 1, facing = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * facing, s); ctx.translate(-50, -100);
  const G = '#00FF00', GS = '#00D700';
  const top = frame ? 18 : 54;
  // hole in floor
  ell(ctx, 50, 96, 30, 6, '#000000', 3);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 100, 96); ctx.clip();
  const sock = () => { ctx.beginPath(); ctx.moveTo(32, 100); ctx.lineTo(32, top + 22); ctx.quadraticCurveTo(32, top, 54, top);
    ctx.quadraticCurveTo(80, top, 80, top + 20); ctx.quadraticCurveTo(80, top + 32, 68, top + 34); ctx.lineTo(68, 100); ctx.closePath(); };
  sock(); fillStroke(ctx, G, 0);
  withClip(ctx, sock, () => { for (let sy = top + 40; sy < 100; sy += 12) { ctx.fillStyle = '#FFFF00'; ctx.fillRect(20, sy, 70, 5); } ell(ctx, 36, 70, 7, 40, GS, 0); });
  sock(); fillStroke(ctx, null, 3.2);
  // mouth
  ctx.beginPath(); ctx.moveTo(56, top + 20); ctx.quadraticCurveTo(70, top + 18, 80, top + 20); ctx.quadraticCurveTo(76, top + 30, 66, top + 28); ctx.closePath(); fillStroke(ctx, '#D70000', 2.6);
  // button eye
  ell(ctx, 58, top + 9, 6, 6, '#fff3d6', 2.6); ell(ctx, 58, top + 9, 2.6, 2.6, OUT, 0);
  ell(ctx, 46, top + 8, 4.5, 4.5, '#fff3d6', 2.4); ell(ctx, 46, top + 8, 2, 2, OUT, 0);
  ctx.beginPath(); ctx.moveTo(52, top + 1); ctx.lineTo(64, top + 3); fillStroke(ctx, null, 2.4);
  ctx.restore();
  // rim in front
  ctx.beginPath(); ctx.ellipse(50, 96, 30, 6, 0, 0, Math.PI); fillStroke(ctx, '#D70000', 3);
  ctx.restore();
}

/* ---------- Objects ---------- */
const OBJ = {};
OBJ.letter = ctx => {
  ctx.save(); ctx.translate(50, 70); ctx.rotate(rad(-8));
  box(ctx, -34, -22, 68, 44, 4, '#FFFFFF', 3.2);
  poly(ctx, [[-32, -20], [0, 4], [32, -20]]); fillStroke(ctx, null, 2.6);
  line(ctx, -32, 20, -6, 0, 2, 'rgba(60,40,60,.4)'); line(ctx, 32, 20, 6, 0, 2, 'rgba(60,40,60,.4)');
  box(ctx, 16, -17, 13, 15, 1.5, '#FF0000', 2.4); ell(ctx, 22.5, -9.5, 3, 3, '#FFFFFF', 0);
  ell(ctx, 0, 6, 6, 6, '#D70000', 2.4);
  ctx.restore();
};
OBJ.parcel = ctx => {
  ctx.beginPath(); ctx.moveTo(18, 46); ctx.lineTo(50, 34); ctx.lineTo(82, 46); ctx.lineTo(50, 58); ctx.closePath(); fillStroke(ctx, '#FFFF00', 3);
  ctx.beginPath(); ctx.moveTo(18, 46); ctx.lineTo(50, 58); ctx.lineTo(50, 94); ctx.lineTo(18, 82); ctx.closePath(); fillStroke(ctx, '#D7D700', 3);
  ctx.beginPath(); ctx.moveTo(82, 46); ctx.lineTo(50, 58); ctx.lineTo(50, 94); ctx.lineTo(82, 82); ctx.closePath(); fillStroke(ctx, '#A0A000', 3);
  line(ctx, 34, 40, 66, 52, 4, '#FF0000'); line(ctx, 66, 52, 66, 88, 4, '#FF0000'); line(ctx, 34, 52, 34, 88, 4, '#FF0000');
  ell(ctx, 42, 40, 9, 5, '#FF0000', 2.6, -0.3); ell(ctx, 58, 40, 9, 5, '#FF0000', 2.6, 0.3); ell(ctx, 50, 42, 3.5, 3.5, '#D70000', 2.2);
  box(ctx, 22, 62, 14, 10, 1.5, '#FFFFFF', 2);
};
OBJ.key = ctx => {
  const B = '#FFFF00', BS = '#D7D700';
  ctx.save(); ctx.translate(50, 62); ctx.rotate(rad(-30));
  box(ctx, -6, -6, 48, 12, 5, B, 3);
  box(ctx, 24, 4, 7, 12, 1.5, B, 3); box(ctx, 34, 4, 6, 9, 1.5, B, 3);
  box(ctx, -6, -6, 48, 12, 5, B, 0);
  line(ctx, 0, 0, 38, 0, 2, BS);
  ell(ctx, -18, 0, 18, 18, B, 3.2); ell(ctx, -18, 0, 7, 7, '#000000', 3);
  shine(ctx, -24, -8, 5, 3, 0.7);
  ctx.restore();
};
OBJ.remote = ctx => {
  ctx.save(); ctx.translate(50, 56); ctx.rotate(rad(12));
  line(ctx, 8, -34, 18, -50, 3.2); ell(ctx, 18, -51, 3.5, 3.5, '#FF0000', 2.2);
  box(ctx, -16, -36, 32, 72, 9, '#00D7D7', 3.2);
  box(ctx, -10, -30, 20, 12, 3, '#00FF00', 2.4);
  ell(ctx, 0, -4, 7, 7, '#FF0000', 2.4);
  for (const [bx, by] of [[-7, 12], [7, 12], [-7, 24], [7, 24]]) ell(ctx, bx, by, 4, 3.2, '#FFFF00', 2);
  shine(ctx, -9, -10, 2.5, 12, 0.35, 0);
  ctx.restore();
};
OBJ.bell = ctx => {
  box(ctx, 43, 12, 14, 28, 6, '#D70000', 3);
  shine(ctx, 47, 22, 1.8, 7, 0.4, 0);
  ctx.beginPath(); ctx.moveTo(34, 44); ctx.quadraticCurveTo(34, 36, 50, 36); ctx.quadraticCurveTo(66, 36, 66, 44);
  ctx.quadraticCurveTo(68, 70, 82, 80); ctx.lineTo(18, 80); ctx.quadraticCurveTo(32, 70, 34, 44); ctx.closePath(); fillStroke(ctx, '#FFFF00', 3.2);
  shine(ctx, 42, 56, 3.5, 12, 0.6, 0.2);
  box(ctx, 14, 78, 72, 9, 4.5, '#D7D700', 3);
  ell(ctx, 50, 92, 6, 6, '#FFFF00', 3);
};
OBJ.umbrella = ctx => {
  ctx.save(); ctx.translate(50, 50); ctx.rotate(rad(-10));
  H_limb(ctx, [[0, -44], [0, 40]], 3.5, '#D70000', 2.4);
  ctx.beginPath(); ctx.moveTo(0, 38); ctx.quadraticCurveTo(0, 50, -10, 48); ctx.quadraticCurveTo(-16, 46, -14, 40); ctx.lineWidth = 7.5; ctx.strokeStyle = OUT; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = '#D70000'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -38); ctx.quadraticCurveTo(-20, -4, -16, 22); ctx.quadraticCurveTo(-8, 27, 0, 22); ctx.quadraticCurveTo(8, 27, 16, 22); ctx.quadraticCurveTo(20, -4, 0, -38); ctx.closePath(); fillStroke(ctx, '#D700D7', 3.2);
  ctx.beginPath(); ctx.moveTo(0, -38); ctx.quadraticCurveTo(-3, -6, 0, 22); fillStroke(ctx, null, 2);
  ell(ctx, -8, -2, 2.5, 13, '#FF00FF', 0, 0.12);
  box(ctx, -8, 4, 16, 5, 2, '#FFFF00', 2.2);
  ctx.restore();
};
OBJ.clock = ctx => {
  ell(ctx, 30, 26, 11, 9, '#FFFF00', 3, -0.5); ell(ctx, 70, 26, 11, 9, '#FFFF00', 3, 0.5);
  line(ctx, 30, 82, 22, 94, 5); line(ctx, 70, 82, 78, 94, 5);
  ell(ctx, 50, 58, 30, 30, '#FF0000', 3.4);
  ell(ctx, 50, 58, 22, 22, '#FFFFFF', 3);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; line(ctx, 50 + Math.sin(a) * 17, 58 - Math.cos(a) * 17, 50 + Math.sin(a) * 19.5, 58 - Math.cos(a) * 19.5, i % 3 ? 1.6 : 3); }
  line(ctx, 50, 58, 50, 43, 3.2); line(ctx, 50, 58, 61, 63, 3.2); ell(ctx, 50, 58, 2.6, 2.6, OUT, 0);
  shine(ctx, 34, 42, 6, 3.5, 0.5);
  box(ctx, 46, 22, 8, 8, 2, '#FFFF00', 2.4);
};
OBJ.cocoa = ctx => {
  for (const sx of [40, 54]) { ctx.beginPath(); ctx.moveTo(sx, 34); ctx.bezierCurveTo(sx - 8, 26, sx + 8, 20, sx, 10); ctx.lineWidth = 3.4; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineCap = 'round'; ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(76, 62, 13, 15, 0, 0, Math.PI * 2); ctx.lineWidth = 13; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 7; ctx.strokeStyle = '#FF0000'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(22, 42); ctx.lineTo(22, 84); ctx.quadraticCurveTo(22, 94, 34, 94); ctx.lineTo(62, 94); ctx.quadraticCurveTo(74, 94, 74, 84); ctx.lineTo(74, 42); ctx.closePath(); fillStroke(ctx, '#FF0000', 3.2);
  ell(ctx, 30, 70, 4, 18, '#D70000', 0);
  ell(ctx, 48, 42, 26, 6, '#D70000', 3); ell(ctx, 52, 41, 10, 2.5, '#FF0000', 0);
  ell(ctx, 48, 70, 9, 9, '#FFFFFF', 2.4); ell(ctx, 48, 70, 3.5, 3.5, '#FF0000', 0);
  shine(ctx, 64, 60, 2.5, 12, 0.45, 0);
};
OBJ.toast = ctx => {
  const crust = () => { ctx.beginPath(); ctx.moveTo(20, 92); ctx.lineTo(20, 40); ctx.quadraticCurveTo(12, 20, 32, 16); ctx.quadraticCurveTo(50, 8, 68, 16); ctx.quadraticCurveTo(88, 20, 80, 40); ctx.lineTo(80, 92); ctx.closePath(); };
  crust(); fillStroke(ctx, '#D7D700', 3.2);
  ctx.beginPath(); ctx.moveTo(27, 86); ctx.lineTo(27, 42); ctx.quadraticCurveTo(20, 27, 35, 23); ctx.quadraticCurveTo(50, 16, 65, 23); ctx.quadraticCurveTo(80, 27, 73, 42); ctx.lineTo(73, 86); ctx.closePath(); fillStroke(ctx, '#FFFF00', 0);
  for (const [dx, dy] of [[36, 48], [58, 40], [42, 72], [64, 70], [52, 58]]) ell(ctx, dx, dy, 1.8, 1.4, '#D7D700', 0);
  box(ctx, 40, 46, 22, 16, 4, '#FFFFFF', 2.6); shine(ctx, 46, 50, 4, 2, 0.8, 0);
};
OBJ.biscuit = ctx => {
  ell(ctx, 50, 60, 34, 32, '#D7D700', 3.4);
  ctx.beginPath(); ctx.ellipse(50, 60, 34, 32, 0, 0, Math.PI * 2); ctx.setLineDash([3, 5]); ctx.lineWidth = 2.6; ctx.strokeStyle = '#A0A000'; ctx.save(); ctx.translate(50, 60); ctx.scale(0.86, 0.86); ctx.translate(-50, -60); ctx.stroke(); ctx.restore(); ctx.setLineDash([]);
  for (const [dx, dy] of [[38, 50], [58, 46], [46, 66], [64, 64], [52, 78], [34, 72]]) ell(ctx, dx, dy, 2.6, 2.6, '#D70000', 0);
  shine(ctx, 36, 40, 8, 4, 0.35);
};
const OBJECT_NAMES = { letter: 'LETTER', parcel: 'PARCEL', key: 'DOOR KEY', remote: 'RUG REMOTE', bell: 'HAND BELL', umbrella: 'UMBRELLA', clock: 'ALARM CLOCK', cocoa: 'COCOA', toast: 'TOAST', biscuit: 'BISCUIT' };
function drawObject(ctx, name, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-50, -100); OBJ[name](ctx); ctx.restore();
}

/* ---------- Energy candle ---------- */
function drawCandle(ctx, x, y, s = 1, level = 1, t = 0) {
  // (x,y) bottom centre; full candle 100 wide x 200 tall units
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const h = 30 + 130 * level, top = -18 - h;
  box(ctx, -44, -22, 88, 20, 10, '#FFFF00', 3.2); // holder
  ctx.beginPath(); ctx.ellipse(36, -14, 14, 9, 0, 0, Math.PI * 2); ctx.lineWidth = 9; ctx.strokeStyle = OUT; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = '#FFFF00'; ctx.stroke();
  const wax = () => { ctx.beginPath(); ctx.moveTo(-20, -18); ctx.lineTo(-20, top + 6); ctx.quadraticCurveTo(-20, top, -12, top); ctx.lineTo(12, top); ctx.quadraticCurveTo(20, top, 20, top + 6); ctx.lineTo(20, -18); ctx.closePath(); };
  wax(); fillStroke(ctx, '#FFFFFF', 0);
  withClip(ctx, wax, () => { ell(ctx, 14, top + h / 2, 9, h, '#D7D7D7', 0); });
  wax(); fillStroke(ctx, null, 3.2);
  ctx.beginPath(); ctx.moveTo(-20, top + 4); ctx.quadraticCurveTo(-24, top + 20, -18, top + 26); ctx.quadraticCurveTo(-12, top + 22, -13, top + 4); fillStroke(ctx, '#FFFFFF', 2.6);
  line(ctx, 0, top, 0, top - 10, 3);
  const g = ctx.createRadialGradient(0, top - 26, 2, 0, top - 26, 46); g.addColorStop(0, 'rgba(255,210,90,.55)'); g.addColorStop(1, 'rgba(255,210,90,0)');
  
  const fl = Math.sin(t) * 2;
  ctx.beginPath(); ctx.moveTo(0, top - 6); ctx.quadraticCurveTo(-13, top - 16, fl, top - 44); ctx.quadraticCurveTo(13, top - 16, 0, top - 6); fillStroke(ctx, '#FF0000', 3);
  ctx.beginPath(); ctx.moveTo(0, top - 9); ctx.quadraticCurveTo(-6, top - 16, fl * 0.5, top - 30); ctx.quadraticCurveTo(6, top - 16, 0, top - 9); fillStroke(ctx, '#FFFF00', 0);
  ctx.restore();
}

root.LLI_V3 = { C, N, POSES, drawNorris, drawNorrisHead, drawBottle, drawMoth, drawSock, drawObject, drawCandle, OBJECT_NAMES,
  ENEMIES: { bottle: drawBottle, moth: drawMoth, sock: drawSock }, helpers: { ell, box, rrect, line, limb, poly, shine, withClip, fillStroke } };
})(typeof window !== 'undefined' ? window : globalThis);

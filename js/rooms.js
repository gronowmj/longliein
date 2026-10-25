/* The Long Lie-In — room layouts: platforms, use spots, fixed things, item spots, enemies, decor.
   Logical units (256x192 play area; floors at y=176). Drawing is done by art.js at 2x. */
(function (root) {
'use strict';
const F = (x1 = 0, x2 = 256, y = 176, look = 'floor') => ({ x1, x2, y, look });
const P = (x1, x2, y, look, extra) => Object.assign({ x1, x2, y, look }, extra || {});
const door = (id, x1, kind, to, extra) => Object.assign({ id, x1, x2: x1 + 18, y: 176, kind, to, arrow: kind === 'back' ? 'in' : 'out' }, extra || {});
const R = {};

R.f_mast = { name: 'MASTER BEDROOM', pal: 'mast', start: [64, 176], respawn: [64, 176],
  plats: [F(), P(16, 52, 138, 'chest'), P(88, 108, 148, 'bedside'), P(120, 214, 140, 'bigbed')],
  edges: { left: [{ to: 'f_land', y: 176 }], right: [{ to: 'f_bath', y: 176 }] },
  spots: [], items: { hwb: [34, 138] },
  things: [{ id: 'rooster', x1: 92, x2: 104, y1: 118, y2: 148, acts: ['WIN'], draw: 'rooster', msg: 'THE ROOSTER CLOCK HAS STOPPED.|IT NEEDS ITS WINDING KEY.' }],
  enemies: [], decor: [{ k: 'window', x: 150, y: 26, w: 46, h: 50 }, { k: 'picture', x: 60, y: 40, w: 30, h: 24, col: 'G' }, { k: 'lamp', x: 98, y: 118 }],
  msgs: { WIN: 'BRRRING! COCK-A-DOODLE-DOO!' } };

R.f_land = { name: 'LANDING', pal: 'land', respawn: [112, 176],
  plats: [F(0, 64), F(100, 256), P(214, 250, 150, 'seat')],
  pits: [{ x1: 64, x2: 100, to: 'g_hall', arrive: [240, 100], msg: 'WHEEE! DOWN THE BANNISTER!' }],
  edges: { left: [{ to: 'f_spar', y: 176 }], right: [{ to: 'f_mast', y: 176 }] },
  spots: [door('d_libr', 128, 'back', 'f_libr'), { id: 'loft', x1: 170, x2: 186, y: 176, kind: 'up', to: 'a_atti', req: { flags: ['hatch_down'] }, arrow: 'up', look: 'loftladder' }],
  things: [{ id: 'hatchhook', x1: 166, x2: 190, y1: 100, y2: 176, acts: ['hatch'], draw: 'lofthatch', msg: 'A LOFT HATCH, HIGH OUT OF REACH.', msgIf: [{ when: { flags: ['hatch_down'] }, msg: '' }] }],
  items: {}, enemies: [{ type: 'patrol', art: 'wool', x1: 108, x2: 206, y: 176, speed: 18, pause: 1, w: 12, h: 12 }],
  decor: [{ k: 'stairwell', x1: 64, x2: 100 }, { k: 'window', x: 214, y: 50, w: 36, h: 50 }, { k: 'picture', x: 24, y: 70, w: 26, h: 22, col: 'C' }],
  msgs: { hatch: 'HOOKED IT! THE LOFT LADDER SLIDES DOWN.' } };

R.g_hall = { name: 'HALL', pal: 'hall', hallArt: true, respawn: [40, 176],
  plats: [F(), P(73, 133, 135, 'none'), P(131, 176, 89, 'none'),
    ...Array.from({ length: 8 }, (_, i) => P(180 + i * 6, 186 + i * 6, 176 - 9.5 * (i + 1), 'none', { group: 's' })), P(228, 256, 100, 'none', { group: 's' })],
  edges: { right: [{ to: 'g_parl', y: 176 }, { to: 'f_land', y: 100, arrive: [112, 176] }] },
  spots: [door('d_clok', 10, 'back', 'g_clok', { x2: 32, look: 'none' })],
  things: [], items: { umbrella: [158, 89] }, food: [103, 135],
  enemies: [{ type: 'moth', art: 'moth', x1: 34, x2: 170, y: 114, speed: 22, dip: 22, w: 16, h: 12 }], decor: [] };

R.g_parl = { name: 'PARLOUR', pal: 'parl', respawn: [20, 176],
  plats: [F(), P(150, 200, 138, 'piano'), P(60, 120, 98, 'mantel')],
  edges: { left: [{ to: 'g_hall', y: 176 }], right: [{ to: 'g_dine', y: 176 }] },
  spots: [door('d_stud', 22, 'back', 'g_stud')], things: [], items: { shilling: [80, 98] },
  enemies: [{ type: 'patrol', art: 'pincushion', x1: 120, x2: 240, y: 176, speed: 26, bob: 1.0, amp: 50, w: 14, h: 12 }],
  decor: [{ k: 'fireplace', x1: 68, x2: 112 }, { k: 'picture', x: 70, y: 40, w: 40, h: 30, col: 'Y' }, { k: 'window', x: 200, y: 30, w: 40, h: 54 }] };

R.g_dine = { name: 'DINING ROOM', pal: 'dine', respawn: [20, 176],
  plats: [F(), P(36, 56, 150, 'chair'), P(66, 130, 138, 'table'), P(140, 158, 150, 'chair'), P(186, 246, 134, 'sideboard')],
  edges: { left: [{ to: 'g_parl', y: 176 }], right: [{ to: 'g_kitc', y: 176 }] },
  spots: [{ id: 'hatch', x1: 38, x2: 54, y: 150, kind: 'hatch', to: 'g_scul', arrow: 'in', look: 'servinghatch' }],
  things: [{ id: 'drawer', x1: 196, x2: 236, y1: 134, y2: 176, acts: ['drawer'], msg: 'THE SIDEBOARD DRAWER IS LOCKED.', msgIf: [{ when: { found: ['feather'] }, msg: '' }] }],
  items: {}, enemies: [{ type: 'fly8', art: 'gravyboat', cx: 128, cy: 96, rx: 76, ry: 18, period: 7, w: 18, h: 10 }],
  decor: [{ k: 'window', x: 100, y: 28, w: 50, h: 50 }, { k: 'picture', x: 196, y: 50, w: 34, h: 26, col: 'M' }],
  msgs: { drawer: 'CLICK! THE DRAWER OPENS. A FEATHER!' } };

R.g_kitc = { name: 'KITCHEN', pal: 'kitc', respawn: [20, 176],
  plats: [F(), P(52, 112, 138, 'table'), P(140, 180, 128, 'dresser'), P(140, 180, 92, 'shelf'), P(222, 252, 148, 'range')],
  edges: { left: [{ to: 'g_dine', y: 176 }] },
  spots: [{ id: 'trap', x1: 120, x2: 136, y: 176, kind: 'down', to: 'c_boil', req: { flags: ['cellar_open'] }, arrow: 'down', look: 'trapdoor', lockMsg: 'THE CELLAR TRAPDOOR IS LOCKED.' },
    door('d_cons', 196, 'back', 'g_cons')],
  things: [{ id: 'traplock', x1: 118, x2: 138, y1: 160, y2: 176, acts: ['unlock_cellar'] }],
  items: { teacosy: [82, 138] }, food: [160, 92],
  enemies: [{ type: 'patrol', art: 'toast', x1: 20, x2: 180, y: 176, speed: 24, w: 10, h: 20 }],
  decor: [{ k: 'window', x: 60, y: 30, w: 44, h: 46 }, { k: 'pans', x: 150, y: 40 }],
  msgs: { unlock_cellar: 'CLUNK! THE CELLAR TRAPDOOR IS UNLOCKED.' } };

R.g_garg = { name: 'GARAGE', pal: 'garg', respawn: [240, 176],
  plats: [F(), P(110, 176, 140, 'bench'), P(40, 84, 104, 'rack')],
  edges: { right: [{ to: 'g_clok', y: 176, req: { flags: ['garage_open'] } }] },
  spots: [], things: [], items: { hookpole: [150, 140] },
  enemies: [{ type: 'patrol', art: 'hubcap', x1: 20, x2: 236, y: 176, speed: 40, w: 14, h: 14 }],
  decor: [{ k: 'garagedoor', x1: 0, x2: 30 }, { k: 'tools', x: 120, y: 60 }] };

R.g_clok = { name: 'CLOAKROOM', pal: 'clok', respawn: [215, 176],
  plats: [F(), P(60, 110, 108, 'shelf'), P(140, 190, 150, 'bench')],
  edges: { left: [{ to: 'g_garg', y: 176, req: { flags: ['garage_open'] }, lockMsg: 'THE GARAGE DOOR IS PADLOCKED.' }], right: [{ to: 'g_stud', y: 176 }] },
  spots: [door('d_hall', 206, 'front', 'g_hall')],
  things: [{ id: 'padlock', x1: 0, x2: 22, y1: 120, y2: 176, acts: ['unlock_garage'], draw: 'padlock', hideIf: { flags: ['garage_open'] } }],
  items: { boot: [170, 150] },
  enemies: [{ type: 'drop', art: 'coat', x1: 60, x2: 110, period: 3.2, y0: 104, w: 18, h: 20 }],
  decor: [{ k: 'garagedoor', x1: 0, x2: 14 }, { k: 'pegs', x1: 56, x2: 116, y: 70 }, { k: 'curtain', side: 'right' }],
  msgs: { unlock_garage: 'CLICK! THE GARAGE PADLOCK OPENS.' } };

R.g_stud = { name: 'STUDY', pal: 'stud', respawn: [223, 176],
  plats: [F(), P(16, 66, 102, 'bookledge'), P(100, 156, 138, 'desk'), P(176, 196, 148, 'globe')],
  edges: { left: [{ to: 'g_clok', y: 176 }], right: [{ to: 'g_scul', y: 176 }] },
  spots: [door('d_parl', 214, 'front', 'g_parl')], things: [], items: { remote: [140, 138] }, food: [40, 102],
  enemies: [{ type: 'dart', art: 'quill', y: 152, period: 4.5, speed: 160, w: 16, h: 6 }],
  decor: [{ k: 'books', x: 16, y: 30, w: 50, h: 72 }, { k: 'window', x: 110, y: 30, w: 40, h: 50 }, { k: 'curtain', side: 'left' }] };

R.g_scul = { name: 'SCULLERY', pal: 'scul', respawn: [20, 176],
  plats: [F(), P(24, 76, 140, 'sink'), P(100, 130, 130, 'mangle')],
  edges: { left: [{ to: 'g_stud', y: 176 }], right: [{ to: 'g_cons', y: 176 }] },
  spots: [{ id: 'hatch', x1: 36, x2: 60, y: 140, kind: 'hatch', to: 'g_dine', arrive: [216, 134], arrow: 'in', look: 'servinghatch' },
    { id: 'cordU', x1: 176, x2: 190, y: 176, kind: 'up', to: 'f_sewi', ride: true, arrow: 'up', look: 'cord' },
    { id: 'cordD', x1: 206, x2: 220, y: 176, kind: 'down', to: 'c_coal', ride: true, arrow: 'down', look: 'cord' }],
  things: [{ id: 'meter', x1: 148, x2: 162, y1: 120, y2: 176, acts: ['meter'], draw: 'meter', msg: 'A COIN METER. NO POWER.', msgIf: [{ when: { flags: ['power_on'] }, msg: '' }] },
    { id: 'switch', x1: 232, x2: 246, y1: 120, y2: 176, acts: ['dumbwaiter_switch'], draw: 'switch', msg: 'THE SWITCH IS DEAD. NO POWER.', msgIf: [{ when: { flags: ['power_on'] }, msg: '' }] }],
  items: { peg: [116, 130] },
  enemies: [{ type: 'patrol', art: 'brush', x1: 84, x2: 150, y: 176, speed: 30, bob: 0.5, amp: 16, w: 14, h: 10 }],
  decor: [{ k: 'dumbwaiter', x1: 170, x2: 226 }, { k: 'window', x: 100, y: 34, w: 36, h: 40 }],
  msgs: { meter: 'CLUNK! THE METER TICKS. POWER ON.', dumbwaiter_switch: 'THE DUMBWAITER HUMS: 4 RIDES.' } };

R.g_cons = { name: 'CONSERVATORY', pal: 'cons', respawn: [240, 176],
  plats: [F(), P(56, 76, 140, 'plantstand'), P(94, 118, 150, 'wicker'), P(150, 214, 140, 'pottingbench')],
  edges: { left: [{ to: 'g_scul', y: 176 }] },
  spots: [door('d_kitc', 22, 'front', 'g_kitc')],
  things: [{ id: 'snaps', x1: 156, x2: 182, y1: 110, y2: 176, acts: ['calm_snapdragons'] }],
  items: { can: [204, 140] }, refuse: { can: 'SNAP! SNAP! THE SNAPDRAGONS WON\'T LET YOU NEAR.' },
  enemies: [{ type: 'snap', art: 'snapdragon', x: 168, y: 140, range: 16, until: 'snap_asleep' }],
  decor: [{ k: 'glasshouse' }, { k: 'sign', x: 120, y: 112, text: ['SNAPDRAGONS:', 'KEEP COSY,', 'THEY NOD OFF', 'WHEN WARM'] }],
  msgs: { calm_snapdragons: 'THE SNAPDRAGONS SNUGGLE UP... ZZZ.' } };

R.f_spar = { name: 'SPARE BEDROOM', pal: 'spar', respawn: [240, 176],
  plats: [F(), P(100, 170, 146, 'bed'), P(196, 224, 140, 'washstand')],
  edges: { right: [{ to: 'f_land', y: 176 }] },
  spots: [{ id: 'wardrobe', x1: 28, x2: 54, y: 176, kind: 'back', to: 'f_twin', hidden: true, arrow: 'in', look: 'none' }],
  things: [], items: { sock: [80, 176] }, food: [210, 140],
  enemies: [{ type: 'patrol', art: 'dustbunny', x1: 76, x2: 240, y: 176, speed: 14, w: 14, h: 10 }],
  decor: [{ k: 'wardrobe', x1: 16, x2: 66, y: 86 }, { k: 'window', x: 120, y: 34, w: 40, h: 46 }] };

R.f_twin = { name: 'TWIN BEDROOM', pal: 'twin', respawn: [31, 176],
  plats: [F(), P(70, 118, 146, 'bed'), P(132, 156, 148, 'bedside'), P(136, 162, 104, 'frameledge'), P(176, 226, 146, 'bed')],
  edges: {},
  spots: [door('d_spar', 22, 'front', 'f_spar', { look: 'panel' }), { id: 'frame', x1: 140, x2: 158, y: 104, kind: 'frame', act: 'enter_arcade', arrow: 'in', look: 'none' }],
  things: [], items: {}, enemies: [],
  decor: [{ k: 'sheepframe', x: 136, y: 62, w: 26, h: 30 }, { k: 'window', x: 186, y: 40, w: 34, h: 44 }] };

R.f_libr = { name: 'LIBRARY', pal: 'libr', respawn: [27, 176],
  plats: [F(), P(0, 0, 140, 'chair', { mover: 'chair', w: 26 }), P(160, 236, 92, 'gallery')],
  chair: { home: 132, min: 28, max: 84, speed: 22 },
  edges: { right: [{ to: 'f_nurs', y: 176 }] },
  spots: [door('d_land', 18, 'front', 'f_land')], things: [], items: { cellarkey: [222, 92] },
  refuse: { cellarkey: 'BOOKS RAIN DOWN ON YOU! YOU NEED COVER.' },
  onEnter: ['stop_rug'],
  enemies: [{ type: 'rug', until: 'rug_stopped', x1: 56, push: 24 }, { type: 'books', art: 'book', x1: 160, x2: 236, y: 92 }],
  decor: [{ k: 'books', x: 150, y: 20, w: 100, h: 60 }, { k: 'books', x: 60, y: 40, w: 60, h: 70 }, { k: 'rug', x1: 56, x2: 256 }],
  msgs: { stop_rug: 'CLICK! THE ROLLING RUG STOPS.' } };

R.f_nurs = { name: 'NURSERY', pal: 'nurs', respawn: [20, 176],
  plats: [F(), P(24, 80, 132, 'cot'), P(116, 150, 150, 'toychest'), P(178, 222, 146, 'horse')],
  edges: { left: [{ to: 'f_libr', y: 176 }], right: [{ to: 'f_sewi', y: 176 }] },
  spots: [], items: { torch: [52, 132] }, food: [200, 146],
  things: [{ id: 'nightlight', x1: 126, x2: 142, y1: 128, y2: 176, acts: ['nightlight'], draw: 'nightlight', msg: 'AN EMPTY NIGHT-LIGHT. NO BULB.', msgIf: [{ when: { flags: ['nightlight_on'] }, msg: '' }] }],
  enemies: [{ type: 'popup', art: 'sock', x: 133, y: 150, period: 3.5, up: 1.0, w: 12, h: 18 }],
  decor: [{ k: 'sheepwall' }, { k: 'mobile', x: 52, y: 40 }],
  msgs: { nightlight: 'THE NIGHT-LIGHT GLOWS... SOMETHING STIRRED UPSTAIRS...' } };

R.f_sewi = { name: 'SEWING ROOM', pal: 'sewi', respawn: [29, 176],
  plats: [F(), P(56, 116, 138, 'sewingtable'), P(146, 186, 102, 'shelf')],
  edges: { left: [{ to: 'f_nurs', y: 176 }] },
  spots: [door('d_bath', 20, 'front', 'f_bath'), { id: 'cord', x1: 214, x2: 230, y: 176, kind: 'down', to: 'g_scul', ride: true, arrow: 'down', look: 'cord' }],
  things: [], items: { scissors: [86, 138] }, food: [166, 102],
  enemies: [{ type: 'dart', art: 'needle', y: 124, period: 3.8, speed: 150, w: 16, h: 4 }],
  decor: [{ k: 'dumbwaiter', x1: 206, x2: 240 }, { k: 'dummy', x: 120, y: 176 }, { k: 'picture', x: 150, y: 40, w: 30, h: 26, col: 'C' }] };

R.f_bath = { name: 'BATHROOM', pal: 'bath', respawn: [20, 176],
  plats: [F(), P(24, 100, 146, 'bath'), P(124, 150, 140, 'basin'), P(162, 204, 100, 'cabinet')],
  edges: { left: [{ to: 'f_mast', y: 176 }] },
  spots: [door('d_sewi', 222, 'back', 'f_sewi')],
  things: [{ id: 'tap', x1: 26, x2: 42, y1: 118, y2: 176, acts: ['fill_hwb'], draw: 'hottap' }],
  items: { bulb: [184, 100], duck: [62, 146] },
  enemies: [{ type: 'fly8', art: 'bubble', cx: 160, cy: 128, rx: 52, ry: 20, period: 6, w: 12, h: 12 }],
  decor: [{ k: 'mirror', x: 166, y: 40 }],
  msgs: { fill_hwb: 'GLUG GLUG... THE HOT-WATER BOTTLE IS FULL.' } };

R.a_atti = { name: 'ATTIC', pal: 'atti', respawn: [40, 176],
  plats: [F(), P(90, 124, 150, 'trunk'), P(60, 200, 106, 'rafter'), P(214, 244, 148, 'drum')],
  edges: { right: [{ to: 'a_toys', y: 176 }] },
  spots: [{ id: 'hatch', x1: 16, x2: 34, y: 176, kind: 'down', to: 'f_land', req: { flags: ['hatch_down'] }, arrow: 'down', look: 'floorhatch' }, door('d_chim', 52, 'back', 'a_chim', { look: 'lowdoor' })],
  things: [{ id: 'drum', x1: 214, x2: 244, y1: 118, y2: 176, acts: ['fill_can'], msg: 'A DRUM OF PARAFFIN (OLD LAMP OIL).', msgIf: [{ when: { found: ['can'] }, msg: '' }] }],
  items: { whistle: [72, 106] },
  enemies: [{ type: 'bedsheet', art: 'bedsheet', x1: 130, x2: 196, y: 112, speed: 14, dip: 50, w: 22, h: 18 }],
  decor: [{ k: 'roofbeams' }],
  msgs: { fill_can: 'GLUG GLUG... THE PARAFFIN CAN IS FULL.' } };

R.a_toys = { name: 'TOY LOFT', pal: 'toys', respawn: [20, 176],
  plats: [F(), P(18, 64, 132, 'dollshouse'),
    P(112, 140, 156, 'brick', { req: { flags: ['nightlight_on'] } }), P(124, 148, 134, 'brick', { req: { flags: ['nightlight_on'] } }), P(132, 156, 112, 'brick', { req: { flags: ['nightlight_on'] } }),
    P(168, 248, 42, 'toyshelf', { rail: true })],
  floatTo: [200, 42], subRespawn: [{ x1: 167, x2: 249, ymax: 43, at: [200, 42] }],
  edges: { left: [{ to: 'a_atti', y: 176 }] },
  spots: [{ id: 'balloon', x1: 136, x2: 152, y: 112, kind: 'balloon', act: 'balloon', arrow: 'up', look: 'none' },
    { id: 'ladH', x1: 232, x2: 246, y: 42, kind: 'ladder', local: true, dest: [239, 176], req: { flags: ['ladder_down'] }, arrow: 'down', look: 'none' },
    { id: 'ladF', x1: 232, x2: 246, y: 176, kind: 'ladder', local: true, dest: [239, 42], req: { flags: ['ladder_down'] }, arrow: 'up', look: 'none' },
    door('d_tank', 72, 'back', 'a_tank')],
  things: [], items: { drawerkey: [214, 42] },
  enemies: [{ type: 'patrol', art: 'mouse', x1: 96, x2: 228, y: 176, speed: 30, w: 14, h: 9 }],
  decor: [{ k: 'roofbeams' }, { k: 'balloon' }, { k: 'ropeladder' }],
  msgs: { ladder_unrolls: 'THE ROPE LADDER UNROLLS TO THE FLOOR.' } };

R.a_chim = { name: 'CHIMNEY BREAST', pal: 'chim', respawn: [40, 176],
  plats: [F(), P(104, 152, 170, 'hearth')],
  edges: { right: [{ to: 'a_tank', y: 176 }] },
  spots: [{ id: 'flue', x1: 116, x2: 140, y: 170, kind: 'up', to: 'r_chtp', req: { flags: ['fire_out'] }, arrow: 'up', look: 'none', lockMsg: 'TOO HOT! THE FIRE IS BURNING.' }, door('d_atti', 28, 'front', 'a_atti', { look: 'lowdoor' })],
  things: [], items: {}, onEnter: ['douse_fire'],
  enemies: [{ type: 'fire', x: 128, x1: 110, x2: 146, y: 170, until: 'fire_out' }, { type: 'drop', art: 'soot', x1: 60, x2: 220, period: 2.6, y0: 0, w: 12, h: 10, track: true }],
  decor: [{ k: 'chimneybreast', x1: 96, x2: 160 }],
  msgs: { douse_fire: 'PSSSHHH! THE FIRE IS OUT.' } };

R.a_tank = { name: 'WATER TANK ROOM', pal: 'tank', respawn: [39, 176],
  plats: [F(), P(86, 118, 142, 'pipeledge'), P(130, 206, 110, 'tank')],
  edges: { left: [{ to: 'a_chim', y: 176 }] },
  spots: [door('d_toys', 30, 'front', 'a_toys')],
  things: [{ id: 'tanktap', x1: 130, x2: 160, y1: 120, y2: 176, acts: ['fill_wcan'], draw: 'tanktap' }],
  items: {}, enemies: [{ type: 'drop', art: 'drip', x1: 140, x2: 230, period: 1.8, y0: 60, w: 6, h: 8 }],
  decor: [{ k: 'roofbeams' }, { k: 'pipes', y: 56 }],
  msgs: { fill_wcan: 'SPLOSH! THE WATERING CAN IS FULL.' } };

R.r_chtp = { name: 'CHIMNEY TOP', pal: 'roof', outside: true, respawn: [110, 164],
  plats: [F(0, 256, 164, 'ridge'), P(70, 100, 128, 'bigpot'), P(130, 150, 140, 'pot')],
  edges: { right: [{ to: 'r_roof', y: 164 }] },
  spots: [{ id: 'pot', x1: 76, x2: 94, y: 128, kind: 'down', to: 'a_chim', arrow: 'down', look: 'none' }],
  things: [], items: {}, enemies: [{ type: 'swoop', art: 'pigeon', y: 50, dip: 76, period: 4.5, w: 16, h: 10 }],
  decor: [{ k: 'nightsky' }, { k: 'stack', x1: 60, x2: 160 }] };

R.r_roof = { name: 'ROOFTOP', pal: 'roof', outside: true, respawn: [20, 164],
  plats: [F(0, 256, 164, 'ridge'), P(196, 244, 156, 'pad')],
  edges: { left: [{ to: 'r_chtp', y: 164 }] },
  spots: [{ id: 'rocket', x1: 204, x2: 236, y: 156, kind: 'rocket', to: 'n_harb', act: 'rocket', arrow: 'up', look: 'none', lockMsg: 'THE ROCKET\'S TANK IS EMPTY.' }],
  things: [], placeAt: { can: [212, 156] }, items: {},
  enemies: [{ type: 'vane', x: 96, y: 164, shelter: 190 }],
  decor: [{ k: 'nightsky' }, { k: 'windbreak', x1: 176, x2: 190 }, { k: 'rocket', x: 220, y: 156 }] };

R.n_harb = { name: 'CLOUD HARBOUR', pal: 'cloud', outside: true, respawn: [40, 162],
  plats: [F(0, 256, 170, 'cloud'), P(18, 62, 162, 'mooring'), P(110, 160, 134, 'cloudbank')],
  walls: [{ x1: 200, x2: 256, y1: 0, y2: 170, req: { not: ['saucers_gone'] } }],
  edges: { right: [{ to: 'n_vaul', y: 170, req: { flags: ['saucers_gone'] } }] },
  spots: [{ id: 'rocket', x1: 26, x2: 54, y: 162, kind: 'rocket', to: 'r_roof', act: 'rocket_home', arrow: 'up', look: 'none' }],
  things: [{ id: 'holder', x1: 80, x2: 96, y1: 130, y2: 170, draw: 'torchholder', msg: 'AN EMPTY TORCH HOLDER.', msgIf: [{ when: { flags: ['saucers_gone'] }, msg: '' }] }],
  items: {}, onEnter: ['plant_torch'],
  enemies: [{ type: 'saucers', art: 'saucer', x1: 200, x: 228, y: 120, until: 'saucers_gone' }],
  decor: [{ k: 'dreamsky' }, { k: 'rocket', x: 40, y: 162 }, { k: 'lighthouse', x: 135, y: 134 }],
  msgs: { plant_torch: 'CLICK! THE DREAM TORCH SHINES. THE SAUCERS FLEE!' } };

R.n_vaul = { name: 'SNOOZE VAULT', pal: 'cloud', outside: true, respawn: [20, 170],
  plats: [F(0, 256, 170, 'cloud'), P(150, 180, 160, 'vaultstep')],
  walls: [{ x1: 188, x2: 208, y1: 90, y2: 170, req: { not: ['lock_open'] } }],
  edges: { left: [{ to: 'n_harb', y: 170 }] },
  spots: [], items: { windingkey: [232, 170] }, refuse: { windingkey: 'IT IS LOCKED IN THE VAULT.' },
  things: [{ id: 'lock', x1: 182, x2: 210, y1: 110, y2: 170, acts: ['tickle_lock'], msg: 'ZZZ... THE SNORE LOCK SNORES ON.', msgIf: [{ when: { flags: ['lock_open'] }, msg: '' }] }],
  enemies: [{ type: 'snore', art: 'snorelock', x1: 120, x2: 188, x: 198, y: 170, until: 'lock_open' }],
  decor: [{ k: 'dreamsky' }, { k: 'vault', x1: 210, x2: 256 }],
  msgs: { tickle_lock: 'A-A-ACHOO! THE SNORE LOCK SNEEZES OPEN.' } };

R.c_wine = { name: 'WINE CELLAR', pal: 'wine', respawn: [240, 176],
  plats: [F(), P(20, 100, 150, 'rack'), P(20, 100, 124, 'rack'), P(20, 100, 98, 'rack'), P(140, 180, 146, 'barrel')],
  edges: { right: [{ to: 'c_boil', y: 176 }] },
  spots: [], things: [], items: { wcan: [60, 124] },
  enemies: [{ type: 'popup', art: 'cork', x: 84, y: 124, period: 3, up: 0.8, w: 8, h: 16 }],
  decor: [{ k: 'cellarwall' }] };

R.c_boil = { name: 'BOILER ROOM', pal: 'boil', respawn: [200, 176],
  plats: [F(), P(90, 140, 140, 'pipeledge'), P(30, 80, 104, 'boiler'),
    ...Array.from({ length: 7 }, (_, i) => P(169 + i * 9, 178 + i * 9, 167 - 9 * i, 'step')), P(232, 256, 104, 'step')],
  edges: { left: [{ to: 'c_wine', y: 176 }] },
  spots: [{ id: 'steps', x1: 238, x2: 252, y: 104, kind: 'up', to: 'g_kitc', req: { flags: ['cellar_open'] }, arrow: 'up', look: 'none', lockMsg: 'THE TRAPDOOR ABOVE IS SHUT.' }],
  things: [{ id: 'charger', x1: 144, x2: 160, y1: 140, y2: 176, acts: ['charge_torch'], draw: 'charger', msg: 'A BATTERY CHARGER.' }],
  items: {}, enemies: [{ type: 'popup', art: 'steam', x: 112, y: 140, period: 2.8, up: 0.9, w: 10, h: 28 }],
  decor: [{ k: 'cellarwall' }, { k: 'pipes', y: 40 }, { k: 'trapdoorabove', x: 245 }],
  msgs: { charge_torch: 'BZZZT! THE DREAM TORCH IS CHARGED.' } };

R.c_coal = { name: 'COAL HOLE', pal: 'coal', respawn: [36, 176],
  plats: [F(), P(110, 210, 167, 'coal'), P(130, 200, 158, 'coal'), P(150, 190, 149, 'coal')],
  edges: {},
  spots: [{ id: 'crank', x1: 26, x2: 46, y: 176, kind: 'up', to: 'g_scul', arrow: 'up', look: 'crank' }],
  things: [], items: { garagekey: [170, 149] },
  enemies: [{ type: 'bounce2', art: 'coallump', x1: 60, x2: 240, y: 176, speed: 40, period: 0.8, amp: 30, w: 10, h: 10 }],
  decor: [{ k: 'cellarwall' }, { k: 'dumbwaiter', x1: 18, x2: 54 }] };

// layer per room (for door cues) and arcade stub
for (const id in R) R[id].id = id;
R.x_arca = { id: 'x_arca', name: 'COUNTING SHEEP', pal: 'arca', respawn: [128, 176], plats: [F()], edges: {}, spots: [], things: [], items: {}, enemies: [], decor: [], noDrop: true };
root.LLI_ROOMS = R;
if (typeof module !== 'undefined') module.exports = R;
})(typeof window !== 'undefined' ? window : globalThis);

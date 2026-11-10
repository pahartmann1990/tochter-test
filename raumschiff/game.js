'use strict';
/* VOIDHAVEN – Prototyp
   Außenbau (Blöcke) · Flug (Bergbau, Traktorstrahl, Piraten, Station) · Innenbau (Crew-Simulation)
   Alle Inhalte sind Datentabellen (BLOCKS, MODULES, TRAITS) → Grundlage für Mods. */

const $ = s => document.querySelector(s);
const cv = $('#c'), ctx = cv.getContext('2d');
let W = 0, H = 0;
function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
addEventListener('resize', resize); resize();

const B = 16;               // Blockgröße in Weltkoordinaten
const SIDE = 310;           // Breite Seitenpanel
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(Math.random() * a.length)];

// ---------------------------------------------------------------- Daten (moddbar)
const RES_NAMES = { eisen: 'Eisen', titan: 'Titan', eis: 'Eis', wasser: 'Wasser', nahrung: 'Nahrung', o2: 'O₂', strom: 'Strom', credits: 'Credits' };
const ORE = ['eisen', 'titan', 'eis'];
const ORE_COLOR = { eisen: '#b0a090', titan: '#7fb6e8', eis: '#cff6ff' };

const BLOCKS = {
  cockpit: { name: 'Cockpit',       color: '#4fc3f7', mass: 3, hp: 80,  cost: {},                    desc: 'Kern des Schiffs – wird es zerstört, ist das Schiff verloren. Gibt 2 Innenzellen.' },
  hull:    { name: 'Hülle',         color: '#78909c', mass: 1, hp: 30,  cost: { eisen: 4 },           desc: 'Leichte Struktur. Erzeugt 2 Zellen Innenraum.' },
  armor:   { name: 'Panzer',        color: '#3f515c', mass: 3, hp: 130, cost: { eisen: 6, titan: 2 }, desc: 'Sehr robust und schwer – aber kein Innenraum.' },
  engine:  { name: 'Triebwerk',     color: '#ff8a65', mass: 2, hp: 30,  cost: { eisen: 8, titan: 2 }, desc: 'Schub +60. Verbraucht beim Beschleunigen Strom.' },
  reactor: { name: 'Reaktor',       color: '#ffd54f', mass: 3, hp: 30,  cost: { eisen: 10, titan: 4 },desc: 'Erzeugt 8 Strom/s.' },
  tractor: { name: 'Traktorstrahl', color: '#ba68c8', mass: 1, hp: 20,  cost: { eisen: 6, titan: 3 }, desc: 'Zieht Erzbrocken an. Mehr Strahler = mehr Reichweite.' },
  turret:  { name: 'Geschützturm',  color: '#e57373', mass: 2, hp: 40,  cost: { eisen: 10, titan: 3 },desc: 'Feuert auf Mausposition bzw. Feinde. Feuerrate hängt von besetzten Geschützstationen ab.' },
  cargo:   { name: 'Frachtraum',    color: '#a1887f', mass: 1, hp: 25,  cost: { eisen: 5 },           desc: 'Erzlager +80.' },
};
const BUILDABLE = ['hull', 'armor', 'engine', 'reactor', 'tractor', 'turret', 'cargo'];

const MODULES = {
  lift:     { name: 'Lift/Treppe',     icon: '⇕',  color: '#546e7a', cost: { eisen: 3 },            desc: 'Verbindet Stockwerke. Lifte direkt übereinander bauen.' },
  quarter:  { name: 'Quartier',        icon: '🛏', color: '#5c6bc0', cost: { eisen: 5 },            desc: 'Bett zum Schlafen. Zu wenige Betten senken die Moral.' },
  canteen:  { name: 'Kantine',         icon: '🍽', color: '#8d6e63', cost: { eisen: 6 },            desc: 'Hier wird gegessen (verbraucht Nahrung).' },
  hydro:    { name: 'Hydroponik',      icon: '🌱', color: '#43a047', cost: { eisen: 6 },            desc: 'Arbeitsplatz: Wasser + Strom → Nahrung + O₂. Braucht Crew.' },
  recycler: { name: 'Elektrolyse',     icon: '💧', color: '#0288d1', cost: { eisen: 8, titan: 2 },  desc: 'Automatisch: Eis → Wasser, Wasser → O₂ (Strom).' },
  charger:  { name: 'Ladestation',     icon: '🔌', color: '#f9a825', cost: { eisen: 6, titan: 2 },  desc: 'Roboter laden hier ihren Akku.' },
  gun:      { name: 'Geschützstation', icon: '🎯', color: '#c62828', cost: { eisen: 8, titan: 2 },  desc: 'Bei Alarm besetzt die Crew diese Station → höhere Feuerrate der Türme.' },
  lounge:   { name: 'Lounge/Casino',   icon: '🎰', color: '#ad1457', cost: { eisen: 10, titan: 2 }, desc: 'Erholung: steigert die Moral (Moral = Arbeitstempo).' },
  tank:     { name: 'Drucktank',       icon: '🛢', color: '#00897b', cost: { eisen: 8, titan: 3 },  desc: '+150 Kapazität für O₂, Wasser und Nahrung.' },
  battery:  { name: 'Batterie',        icon: '🔋', color: '#7cb342', cost: { eisen: 6, titan: 2 },  desc: '+100 Stromspeicher.' },
};

const TRAITS = {
  human: [
    { id: 'gaertner',  name: 'Gärtner',   desc: 'Hydroponik ×2' },
    { id: 'schuetze',  name: 'Schütze',   desc: 'Geschützstation ×1,6' },
    { id: 'genuegsam', name: 'Genügsam',  desc: 'Hunger −40 %' },
    { id: 'nachteule', name: 'Nachteule', desc: 'Braucht weniger Schlaf' },
    { id: 'frohnatur', name: 'Frohnatur', desc: 'Moral sinkt langsamer' },
  ],
  robot: [
    { id: 'effizient', name: 'Effizient',      desc: 'Akku hält länger' },
    { id: 'kampf',     name: 'Kampfprotokoll', desc: 'Geschützstation ×1,6' },
    { id: 'agrar',     name: 'Agrar-Modul',    desc: 'Hydroponik ×1,5' },
  ],
};
const NAMES = { human: ['Mira', 'Jonas', 'Lena', 'Tarek', 'Ida', 'Bruno', 'Nova', 'Kalle', 'Sina', 'Oskar', 'Yara', 'Emil'], robot: ['RX-7', 'B0-B', 'K4-T', 'Unit-9', 'M-8', 'Z3-R0'] };

// ---------------------------------------------------------------- Spielzustand
const G = {
  mode: 'fly', sel: null, paused: false, time: 0, zoom: 1.6,
  res: { eisen: 80, titan: 30, eis: 60, wasser: 60, nahrung: 80, o2: 100, strom: 60, credits: 200 },
  ship: { blocks: null, x: 320, y: 0, a: 0, vx: 0, vy: 0 },
  stats: null, int: { floors: 0, width: 0, cells: [] }, modCount: {},
  crew: [], asteroids: [], chunks: [], bullets: [], pirates: [], particles: [], texts: [],
  alarm: false, manned: 0, pirateTimer: 90, wave: 0, cam: { x: 320, y: 0 }, thrusting: false,
  stars: [], nextId: 1,
};

function mkBlock(t) { return { type: t, hp: BLOCKS[t].hp, cd: 0, aim: 0 }; }
function starterShip() {
  const m = new Map(), put = (x, y, t) => m.set(x + ',' + y, mkBlock(t));
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) put(x, y, 'hull');
  put(0, 0, 'reactor'); put(-1, 0, 'cargo'); put(-2, 0, 'hull');
  put(2, 0, 'cockpit'); put(2, -1, 'tractor'); put(2, 1, 'armor');
  put(-2, -1, 'engine'); put(-2, 1, 'engine');
  put(1, -2, 'turret'); put(1, 2, 'turret');
  return m;
}

// ---------------------------------------------------------------- Ressourcen
function caps() {
  const t = G.modCount.tank || 0, b = G.modCount.battery || 0;
  return { cargo: G.stats.cargo, o2: 100 + 150 * t, wasser: 100 + 150 * t, nahrung: 100 + 150 * t, strom: 100 + 100 * b };
}
const cargoUsed = () => G.res.eisen + G.res.titan + G.res.eis;
function addRes(k, v) {
  const cp = caps(); let a = v;
  if (ORE.includes(k)) a = Math.max(0, Math.min(v, cp.cargo - cargoUsed()));
  else if (cp[k] !== undefined) a = Math.max(0, Math.min(v, cp[k] - G.res[k]));
  G.res[k] += a; return a;
}
function use(k, v) { if (v <= 0) return 1; if (G.res[k] >= v) { G.res[k] -= v; return 1; } const f = G.res[k] / v; G.res[k] = 0; return f; }
const canPay = c => Object.entries(c).every(([k, v]) => G.res[k] >= v);
function pay(c) { for (const [k, v] of Object.entries(c)) G.res[k] -= v; }
function refund(c, f = 0.5) { for (const [k, v] of Object.entries(c)) addRes(k, Math.floor(v * f)); }
const costText = c => Object.entries(c).map(([k, v]) => `${v} ${RES_NAMES[k]}`).join(', ') || 'gratis';

// ---------------------------------------------------------------- Schiffswerte
function computeStats() {
  const s = { mass: 0, thrust: 0, power: 0, tractors: 0, turrets: 0, engines: 0, cargo: 150, cells: 0, cx: 0, cy: 0, list: [], radius: 0, hasCockpit: false };
  for (const [k, b] of G.ship.blocks) {
    const [x, y] = k.split(',').map(Number), d = BLOCKS[b.type];
    s.mass += d.mass; s.cx += x * d.mass; s.cy += y * d.mass; s.list.push({ k, gx: x, gy: y, b });
    switch (b.type) {
      case 'cockpit': s.cells += 2; s.hasCockpit = true; break;
      case 'hull': s.cells += 2; break;
      case 'engine': s.engines++; s.thrust += 60; break;
      case 'reactor': s.power += 8; break;
      case 'tractor': s.tractors++; break;
      case 'turret': s.turrets++; break;
      case 'cargo': s.cargo += 80; break;
    }
  }
  s.cx /= s.mass; s.cy /= s.mass;
  for (const e of s.list) s.radius = Math.max(s.radius, Math.hypot((e.gx - s.cx) * B, (e.gy - s.cy) * B) + B * 0.7);
  s.tractorRange = s.tractors ? 150 + 60 * s.tractors : 0;
  s.turnRate = clamp(3.2 / Math.sqrt(s.mass / 10), 0.5, 3);
  s.floors = clamp(Math.round(Math.sqrt(s.cells / 4.5)), 1, 6);
  s.width = Math.max(1, Math.floor(s.cells / s.floors));
  return s;
}
function rebuildShip(keepPos = true) {
  const old = G.stats; G.stats = computeStats();
  if (old && keepPos) { // Schwerpunktverschiebung ausgleichen, damit das Schiff nicht springt
    const dx = (G.stats.cx - old.cx) * B, dy = (G.stats.cy - old.cy) * B, c = Math.cos(G.ship.a), s = Math.sin(G.ship.a);
    G.ship.x += dx * c - dy * s; G.ship.y += dx * s + dy * c;
  }
  syncInterior();
}
function blockWorld(e) {
  const S = G.ship, s = G.stats, lx = (e.gx - s.cx) * B, ly = (e.gy - s.cy) * B, c = Math.cos(S.a), n = Math.sin(S.a);
  return { x: S.x + lx * c - ly * n, y: S.y + lx * n + ly * c };
}

// ---------------------------------------------------------------- Innenraum
const cellAt = (f, x) => (G.int.cells[f] && G.int.cells[f][x]) || null;
const cellType = (f, x) => { const c = cellAt(f, x); return c ? c.type : null; };
function recount() { G.modCount = {}; for (const row of G.int.cells) for (const c of row) if (c) G.modCount[c.type] = (G.modCount[c.type] || 0) + 1; }
function syncInterior() {
  const I = G.int, nf = G.stats.floors, nw = G.stats.width;
  if (I.floors === nf && I.width === nw) { recount(); return; }
  const nc = []; let lost = 0;
  for (let f = 0; f < nf; f++) { nc.push([]); for (let x = 0; x < nw; x++) nc[f].push(cellAt(f, x)); }
  for (let f = 0; f < I.cells.length; f++) for (let x = 0; x < I.cells[f].length; x++) if ((f >= nf || x >= nw) && I.cells[f][x]) lost++;
  for (const row of nc) for (const c of row) if (c) c.claim = null;
  I.cells = nc; I.floors = nf; I.width = nw;
  for (const c of G.crew) { c.task = null; c.path = []; c.pf = clamp(Math.round(c.pf), 0, nf - 1); c.px = clamp(c.px, 0, nw - 1); }
  if (lost) log(`⚠ Innenraum verkleinert – ${lost} Modul(e) verloren.`, 'warn');
  recount();
}
function starterInterior() {
  const put = (f, x, t) => { if (G.int.cells[f] && x < G.int.width) G.int.cells[f][x] = { type: t, claim: null }; };
  ['lift', 'hydro', 'canteen', 'recycler', 'charger'].forEach((t, i) => put(0, i, t));
  ['lift', 'quarter', 'quarter', 'gun'].forEach((t, i) => put(1, i, t));
  recount();
}

// ---------------------------------------------------------------- Crew
function makeCrew(kind) {
  const used = new Set(G.crew.map(c => c.name)), free = NAMES[kind].filter(n => !used.has(n));
  return { id: G.nextId++, kind, name: free.length ? pick(free) : kind + G.nextId, trait: pick(TRAITS[kind]), px: 0, pf: 0, path: [], task: null, reeval: 1,
    hunger: rnd(70, 100), energy: rnd(60, 100), morale: 70, battery: 100, health: 100, hue: Math.floor(rnd(0, 360)) };
}
function bfs(f0, x0) {
  const I = G.int, w = I.width, n = I.floors * w, d = new Int32Array(n).fill(-1), prev = new Int32Array(n).fill(-1), q = [f0 * w + x0];
  d[q[0]] = 0;
  for (let i = 0; i < q.length; i++) {
    const id = q[i], f = Math.floor(id / w), x = id % w, nb = [];
    if (x > 0) nb.push(id - 1); if (x < w - 1) nb.push(id + 1);
    if (cellType(f, x) === 'lift') {
      if (f > 0 && cellType(f - 1, x) === 'lift') nb.push(id - w);
      if (f < I.floors - 1 && cellType(f + 1, x) === 'lift') nb.push(id + w);
    }
    for (const j of nb) if (d[j] < 0) { d[j] = d[id] + 1; prev[j] = id; q.push(j); }
  }
  return { d, prev };
}
function pathTo(prev, target, c, f0, x0) {
  const w = G.int.width, p = []; let id = target;
  while (id >= 0) { p.push({ f: Math.floor(id / w), x: id % w }); id = prev[id]; }
  p.reverse(); p.shift();
  if (Math.abs(c.px - x0) > 0.01 || Math.abs(c.pf - f0) > 0.01) p.unshift({ f: f0, x: x0 });
  return p;
}
function startNode(c) { return { f0: clamp(Math.round(c.pf), 0, G.int.floors - 1), x0: clamp(Math.round(c.px), 0, G.int.width - 1) }; }
function release(c) { if (c.task && c.task.cell && c.task.cell.claim === c.id) c.task.cell.claim = null; c.task = null; c.path = []; }
function tryTask(c, modType, type, dur) {
  const I = G.int, { f0, x0 } = startNode(c), { d, prev } = bfs(f0, x0);
  let best = -1, bd = 1e9;
  for (let f = 0; f < I.floors; f++) for (let x = 0; x < I.width; x++) {
    const cell = I.cells[f][x], id = f * I.width + x;
    if (cell && cell.type === modType && !cell.claim && d[id] >= 0 && d[id] < bd) { bd = d[id]; best = id; }
  }
  if (best < 0) return false;
  const cell = I.cells[Math.floor(best / I.width)][best % I.width];
  cell.claim = c.id; c.task = { type, cell, t: 0, dur }; c.path = pathTo(prev, best, c, f0, x0);
  return true;
}
const critical = c => c.kind === 'human' ? (c.hunger < 15 || c.energy < 10) : c.battery < 15;
const hasFree = t => G.int.cells.some(r => r.some(c => c && c.type === t && !c.claim));
function decide(c) {
  release(c);
  const human = c.kind === 'human';
  if (G.alarm && !critical(c) && tryTask(c, 'gun', 'gun', Infinity)) return;
  if (human) {
    if (c.hunger < (G.alarm ? 15 : 35) && G.res.nahrung >= 5 && tryTask(c, 'canteen', 'eat', 3)) return;
    if (c.energy < (G.alarm ? 10 : 30) && tryTask(c, 'quarter', 'sleep', Infinity)) return;
  } else if (c.battery < (G.alarm ? 15 : 35) && tryTask(c, 'charger', 'charge', Infinity)) return;
  if (tryTask(c, 'hydro', 'work', 15)) return;
  if (human && c.morale < 60 && tryTask(c, 'lounge', 'relax', 6)) return;
  const { f0, x0 } = startNode(c), { prev } = bfs(f0, x0), tx = Math.floor(Math.random() * G.int.width);
  c.task = { type: 'idle', t: 0, dur: rnd(2, 4) }; c.path = pathTo(prev, f0 * G.int.width + tx, c, f0, x0);
}
function workEff(c) {
  if (c.kind === 'human') return (0.5 + c.morale / 100) * (c.trait.id === 'gaertner' ? 2 : 1);
  return c.battery > 0 ? 0.8 * (c.trait.id === 'agrar' ? 1.5 : 1) : 0;
}
function updateCrew(c, dt) {
  const human = c.kind === 'human', tr = c.trait.id, t0 = c.task, resting = t0 && t0.type === 'sleep' && !c.path.length;
  if (human) {
    c.hunger = Math.max(0, c.hunger - dt * 0.7 * (tr === 'genuegsam' ? 0.6 : 1));
    if (!resting) c.energy = Math.max(0, c.energy - dt * 0.5 * (tr === 'nachteule' ? 0.6 : 1));
    const humans = G.crew.filter(k => k.kind === 'human').length, beds = G.modCount.quarter || 0;
    c.morale = clamp(c.morale - dt * (0.25 * (tr === 'frohnatur' ? 0.5 : 1) + (beds < humans ? 0.2 : 0) + (c.hunger < 15 ? 0.3 : 0)), 0, 100);
    if (G.res.o2 <= 0) c.health -= dt * 5; else if (c.hunger <= 0) c.health -= dt * 1.5; else c.health = Math.min(100, c.health + dt * 0.5);
  } else c.battery = Math.max(0, c.battery - dt * 0.45 * (tr === 'effizient' ? 0.6 : 1));

  if (!c.task) decide(c);
  if ((c.reeval -= dt) <= 0) {
    c.reeval = 1; const tt = c.task.type, casual = tt === 'work' || tt === 'idle' || tt === 'relax';
    if (G.alarm && tt !== 'gun' && !critical(c) && hasFree('gun')) decide(c);
    else if (tt === 'gun' && (!G.alarm || critical(c))) decide(c);
    else if (human && casual && (c.hunger < 20 || c.energy < 15)) decide(c);
    else if (!human && casual && c.battery < 20) decide(c);
  }
  // Bewegung
  if (c.path.length) {
    const speed = human ? 2.2 * (0.6 + c.energy / 250) : (c.battery > 0 ? 2.6 : 0.4);
    let step = speed * dt;
    const n = c.path[0], dx = n.x - c.px, df = n.f - c.pf;
    if (Math.abs(dx) > 1e-4) c.px += Math.sign(dx) * Math.min(Math.abs(dx), step);
    else if (Math.abs(df) > 1e-4) c.pf += Math.sign(df) * Math.min(Math.abs(df), step * 0.7);
    if (Math.abs(n.x - c.px) < 1e-4 && Math.abs(n.f - c.pf) < 1e-4) { c.px = n.x; c.pf = n.f; c.path.shift(); }
    return;
  }
  // Tätigkeit
  const t = c.task; t.t += dt;
  switch (t.type) {
    case 'eat':
      if (t.t >= 3) { if (G.res.nahrung >= 5) { G.res.nahrung -= 5; c.hunger = Math.min(100, c.hunger + 60); c.morale = Math.min(100, c.morale + 6); } decide(c); }
      break;
    case 'sleep':
      c.energy += dt * 6; c.morale = Math.min(100, c.morale + dt * 0.3);
      if (c.energy >= 100 || (G.alarm && c.energy >= 60)) { c.energy = Math.min(100, c.energy); decide(c); }
      break;
    case 'charge':
      if (G.res.strom > 0) { use('strom', dt * 2); c.battery += dt * 12; }
      if (c.battery >= 100) { c.battery = 100; decide(c); }
      break;
    case 'work':
      if (G.res.strom > 0 && G.res.wasser > 0) {
        const m = workEff(c) * dt; use('wasser', 0.2 * m); use('strom', 0.8 * dt); addRes('nahrung', 0.3 * m); addRes('o2', 0.2 * m); t.active = true;
      } else t.active = false;
      if (human) c.energy = Math.max(0, c.energy - dt * 0.2);
      if (t.t >= t.dur) decide(c);
      break;
    case 'relax':
      c.morale = Math.min(100, c.morale + dt * 7); use('strom', 0.4 * dt);
      if (t.t >= t.dur) decide(c);
      break;
    case 'idle': if (t.t >= t.dur) decide(c); break;
  }
}
function gunMult() {
  let m = 0;
  for (const c of G.crew) if (c.task && c.task.type === 'gun' && !c.path.length) m += (c.trait.id === 'schuetze' || c.trait.id === 'kampf') ? 1.6 : 1;
  G.manned = m;
  return 0.35 + 0.65 * Math.min(1.5, m / Math.max(1, G.stats.turrets));
}

// ---------------------------------------------------------------- Schiffssysteme
function updateSystems(dt) {
  const s = G.stats, cp = caps();
  G.res.strom = Math.min(cp.strom, G.res.strom + s.power * dt);
  let mods = 0; for (const k in G.modCount) mods += G.modCount[k];
  use('strom', dt * 0.05 * mods);
  for (let i = 0; i < (G.modCount.recycler || 0); i++) {
    if (G.res.strom <= 0) break;
    if (G.res.eis > 0 && G.res.wasser < cp.wasser - 1) { const a = Math.min(G.res.eis, 0.5 * dt); G.res.eis -= a; addRes('wasser', a); use('strom', 0.4 * dt); }
    if (G.res.o2 < cp.o2 * 0.95 && G.res.wasser > 0) { const a = Math.min(G.res.wasser, 0.15 * dt); G.res.wasser -= a; addRes('o2', a * 3); use('strom', dt); }
  }
  use('o2', 0.15 * G.crew.filter(c => c.kind === 'human').length * dt);
}

// ---------------------------------------------------------------- Weltraum
function spawnAsteroid(minFromShip = 0) {
  let x, y, d, tries = 0;
  do { const a = rnd(0, Math.PI * 2); d = rnd(350, 2600); x = Math.cos(a) * d; y = Math.sin(a) * d; tries++; }
  while (minFromShip && Math.hypot(x - G.ship.x, y - G.ship.y) < minFromShip && tries < 20);
  const r = rnd(14, 42), roll = Math.random();
  const type = roll < (d > 1500 ? 0.35 : 0.12) ? 'titan' : roll < 0.55 ? 'eis' : 'eisen';
  const verts = []; const nv = 9; for (let i = 0; i < nv; i++) verts.push(rnd(0.75, 1.15));
  G.asteroids.push({ x, y, r, type, hp: r * 1.6, vx: rnd(-6, 6), vy: rnd(-6, 6), rot: rnd(0, 6), vr: rnd(-0.3, 0.3), verts });
}
function burst(x, y, color, n = 12, sp = 120) {
  for (let i = 0; i < n; i++) { const a = rnd(0, 6.283), v = rnd(20, sp); G.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rnd(0.3, 0.9), color, size: rnd(1.5, 3.5) }); }
}
function floatText(x, y, text, color = '#fff') { G.texts.push({ x, y, text, color, life: 1.4 }); }
function breakAsteroid(a) {
  burst(a.x, a.y, ORE_COLOR[a.type], 16);
  const n = Math.ceil(a.r / 9);
  for (let i = 0; i < n; i++) G.chunks.push({ x: a.x + rnd(-a.r, a.r) * 0.5, y: a.y + rnd(-a.r, a.r) * 0.5, vx: rnd(-40, 40), vy: rnd(-40, 40), type: a.type, amt: a.type === 'titan' ? 3 : 6, life: 70 });
  if (a.r > 26) for (let i = 0; i < 2; i++) {
    const r = a.r * 0.55, verts = []; for (let j = 0; j < 9; j++) verts.push(rnd(0.75, 1.15));
    G.asteroids.push({ x: a.x + rnd(-10, 10), y: a.y + rnd(-10, 10), r, type: a.type, hp: r * 1.6, vx: rnd(-30, 30), vy: rnd(-30, 30), rot: 0, vr: rnd(-0.6, 0.6), verts });
  }
}
function spawnWave() {
  G.wave++;
  const n = Math.min(4, 1 + Math.floor(G.wave / 2)), a0 = rnd(0, 6.283);
  for (let i = 0; i < n; i++) {
    const a = a0 + i * 0.35, hp = 50 + G.wave * 15;
    G.pirates.push({ x: G.ship.x + Math.cos(a) * 1050, y: G.ship.y + Math.sin(a) * 1050, vx: 0, vy: 0, a: 0, hp, maxhp: hp, cd: rnd(1, 2.5), r: 20, strafe: Math.random() < 0.5 ? 1 : -1 });
  }
  log(`☠ Sensoren: ${n} Piratenschiff(e) im Anflug! (Welle ${G.wave})`, 'warn');
}
function screenToWorld(sx, sy) { return { x: (sx - W / 2) / G.zoom + G.cam.x, y: (sy - H / 2) / G.zoom + G.cam.y }; }

function updateSpace(dt, piloted) {
  const S = G.ship, s = G.stats;
  let thr = 0, turn = 0;
  if (piloted) {
    if (keys.KeyW || keys.ArrowUp) thr = 1; if (keys.KeyS || keys.ArrowDown) thr = -0.5;
    if (keys.KeyA || keys.ArrowLeft) turn = -1; if (keys.KeyD || keys.ArrowRight) turn = 1;
  }
  G.thrusting = thr !== 0 && s.engines > 0;
  let pf = 1; if (G.thrusting) pf = use('strom', s.engines * dt) >= 0.999 ? 1 : 0.25;
  const acc = s.thrust / s.mass * 20 * pf;
  S.vx += Math.cos(S.a) * acc * thr * dt; S.vy += Math.sin(S.a) * acc * thr * dt;
  const damp = Math.exp(-(piloted ? (keys.Space ? 2.5 : 0.35) : 1.2) * dt);
  S.vx *= damp; S.vy *= damp; S.a += turn * s.turnRate * dt; S.x += S.vx * dt; S.y += S.vy * dt;

  // Alarm
  const wasAlarm = G.alarm;
  G.alarm = G.pirates.some(p => Math.hypot(p.x - S.x, p.y - S.y) < 1150);
  if (G.alarm && !wasAlarm) log('🚨 ALARM! Crew besetzt die Geschützstationen.', 'warn');
  if (!G.alarm && wasAlarm) log('✅ Entwarnung – Crew kehrt an die Arbeit zurück.');

  // Geschütze
  const mult = gunMult(), mw = screenToWorld(mouse.x, mouse.y), manual = piloted && mouse.down && mouse.onCanvas;
  let target = null, td = 700;
  if (G.alarm) for (const p of G.pirates) { const d = Math.hypot(p.x - S.x, p.y - S.y); if (d < td) { td = d; target = p; } }
  for (const e of s.list) {
    if (e.b.type !== 'turret') continue;
    const b = e.b, wp = blockWorld(e); b.cd -= dt;
    let tx, ty; if (manual) { tx = mw.x; ty = mw.y; }
    else if (target) { const lead = Math.hypot(target.x - wp.x, target.y - wp.y) / 520; tx = target.x + (target.vx - S.vx) * lead; ty = target.y + (target.vy - S.vy) * lead; }
    else continue;
    b.aim = Math.atan2(ty - wp.y, tx - wp.x);
    if (b.cd <= 0 && G.res.strom >= 0.5) {
      b.cd = 0.55 / mult; use('strom', 0.5);
      const sp = 520, ang = b.aim + rnd(-0.03, 0.03);
      G.bullets.push({ x: wp.x, y: wp.y, vx: Math.cos(ang) * sp + S.vx, vy: Math.sin(ang) * sp + S.vy, life: 1.3, owner: 'p', dmg: 10 });
    }
  }

  // Asteroiden
  for (const a of G.asteroids) { a.x += a.vx * dt; a.y += a.vy * dt; a.rot += a.vr * dt; }
  while (G.asteroids.length < 45) spawnAsteroid(900);

  // Erzbrocken + Traktorstrahl
  let fullMsg = false;
  for (const c of G.chunks) {
    c.life -= dt; c.pulled = false;
    const dx = S.x - c.x, dy = S.y - c.y, d = Math.hypot(dx, dy);
    if (s.tractorRange && d < s.tractorRange && cargoUsed() < caps().cargo) {
      c.vx += dx / d * 380 * dt; c.vy += dy / d * 380 * dt; c.pulled = true; use('strom', 0.05 * dt);
      if (d < Math.max(18, s.radius * 0.45)) {
        const got = addRes(c.type, c.amt);
        if (got > 0) floatText(S.x, S.y - 20, `+${got} ${RES_NAMES[c.type]}`, ORE_COLOR[c.type]);
        c.amt -= got; if (c.amt <= 0) c.life = 0; else fullMsg = true;
      }
    } else if (s.tractorRange && d < s.tractorRange) fullMsg = true;
    const dmp = Math.exp(-(c.pulled ? 2.5 : 0.4) * dt); c.vx *= dmp; c.vy *= dmp; c.x += c.vx * dt; c.y += c.vy * dt;
  }
  if (fullMsg && G.time - (G.lastFull || -99) > 8) { G.lastFull = G.time; log('📦 Frachtraum voll! An der Station verkaufen oder Frachtraum bauen.', 'warn'); }
  G.chunks = G.chunks.filter(c => c.life > 0);

  // Piraten
  for (const p of G.pirates) {
    const dx = S.x - p.x, dy = S.y - p.y, d = Math.hypot(dx, dy) || 1;
    p.a = Math.atan2(dy, dx);
    const want = d > 300 ? 1 : d < 200 ? -1 : 0;
    p.vx += (dx / d * want * 150 + -dy / d * p.strafe * 60) * dt; p.vy += (dy / d * want * 150 + dx / d * p.strafe * 60) * dt;
    const dm = Math.exp(-0.8 * dt); p.vx *= dm; p.vy *= dm; p.x += p.vx * dt; p.y += p.vy * dt;
    if ((p.cd -= dt) <= 0 && d < 540) {
      p.cd = rnd(0.9, 1.6); const ang = p.a + rnd(-0.09, 0.09);
      G.bullets.push({ x: p.x, y: p.y, vx: Math.cos(ang) * 380 + p.vx, vy: Math.sin(ang) * 380 + p.vy, life: 1.8, owner: 'e', dmg: 9 });
    }
  }
  if ((G.pirateTimer -= dt) <= 0) {
    if (Math.hypot(S.x, S.y) > 700) { spawnWave(); G.pirateTimer = rnd(70, 100); } else G.pirateTimer = 5;
  }

  // Projektile
  for (const b of G.bullets) {
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.owner === 'p') {
      for (const a of G.asteroids) if (a.hp > 0 && Math.hypot(a.x - b.x, a.y - b.y) < a.r) {
        a.hp -= b.dmg; b.life = 0; burst(b.x, b.y, ORE_COLOR[a.type], 3, 60); if (a.hp <= 0) breakAsteroid(a); break;
      }
      if (b.life > 0) for (const p of G.pirates) if (p.hp > 0 && Math.hypot(p.x - b.x, p.y - b.y) < p.r) {
        p.hp -= b.dmg; b.life = 0; burst(b.x, b.y, '#ffab91', 4, 80);
        if (p.hp <= 0) {
          burst(p.x, p.y, '#ff7043', 40, 220); G.res.credits += 40; floatText(p.x, p.y, '+40 Credits', '#ffd54f');
          for (let i = 0; i < 4; i++) G.chunks.push({ x: p.x, y: p.y, vx: rnd(-60, 60), vy: rnd(-60, 60), type: i ? 'eisen' : 'titan', amt: 5, life: 70 });
        }
        break;
      }
    } else if (Math.hypot(b.x - S.x, b.y - S.y) < s.radius + 4) {
      for (const e of s.list) { const wp = blockWorld(e); if (Math.hypot(wp.x - b.x, wp.y - b.y) < B * 0.7) { damageBlock(e, b.dmg); b.life = 0; break; } }
      if (G.stats !== s) break; // Schiff wurde umgebaut
    }
  }
  G.asteroids = G.asteroids.filter(a => a.hp > 0);
  G.pirates = G.pirates.filter(p => p.hp > 0);
  G.bullets = G.bullets.filter(b => b.life > 0);
}
function damageBlock(e, dmg) {
  const b = e.b; b.hp -= dmg; const wp = blockWorld(e); burst(wp.x, wp.y, '#ffcc80', 5, 90);
  if (b.hp > 0) return;
  burst(wp.x, wp.y, BLOCKS[b.type].color, 20, 160);
  G.ship.blocks.delete(e.k);
  if (b.type === 'cockpit') return shipDestroyed();
  log(`💥 ${BLOCKS[b.type].name} zerstört!`, 'warn');
  rebuildShip();
}
function shipDestroyed() {
  log('☠ Cockpit zerstört! Notbergung zur Station – die Hälfte der Ladung ist verloren.', 'warn');
  G.ship.blocks = starterShip(); Object.assign(G.ship, { x: 320, y: 0, a: 0, vx: 0, vy: 0 });
  for (const k of ORE) G.res[k] = Math.floor(G.res[k] / 2);
  G.pirates = []; G.bullets = []; G.alarm = false; G.pirateTimer = 90;
  rebuildShip(false);
}

// ---------------------------------------------------------------- Station
const stationNear = () => Math.hypot(G.ship.x, G.ship.y) < 280;
function stationAction(act) {
  const [a, k] = act.split(':'), R = G.res;
  if (a === 'close') return toggleStation(false);
  if (a === 'sell') { const p = { eisen: 2, titan: 5, eis: 1 }[k], n = Math.floor(R[k]); if (!n) return; R[k] -= n; R.credits += n * p; log(`💰 ${n} ${RES_NAMES[k]} für ${n * p} Credits verkauft.`); }
  if (a === 'buy') {
    const o = { eisen: [20, 50], eis: [20, 30], nahrung: [30, 40] }[k];
    if (R.credits < o[1]) return log('Nicht genug Credits.', 'warn');
    const got = addRes(k, o[0]); if (!got) return log('Kein Platz dafür.', 'warn');
    R.credits -= o[1]; log(`🛒 ${Math.round(got)} ${RES_NAMES[k]} gekauft.`);
  }
  if (a === 'repair') {
    let missing = 0; for (const b of G.ship.blocks.values()) missing += BLOCKS[b.type].hp - b.hp;
    const cost = Math.ceil(missing / 10); if (!cost) return log('Schiff ist unbeschädigt.');
    if (R.eisen < cost) return log(`Reparatur braucht ${cost} Eisen.`, 'warn');
    R.eisen -= cost; for (const b of G.ship.blocks.values()) b.hp = BLOCKS[b.type].hp; log(`🔧 Schiff repariert (${cost} Eisen).`);
  }
  if (a === 'hire') {
    const price = k === 'human' ? 120 : 160; if (R.credits < price) return log('Nicht genug Credits.', 'warn');
    R.credits -= price; const c = makeCrew(k); G.crew.push(c); log(`🤝 ${c.name} (${c.trait.name}) ist an Bord gekommen.`);
  }
  updateStationInfo();
}
function toggleStation(show) {
  if (show && !stationNear()) return log('Zu weit von der Station entfernt.', 'warn');
  $('#station').classList.toggle('hidden', !show); G.stationOpen = show; if (show) updateStationInfo();
}
function updateStationInfo() { $('#stInfo').textContent = `Credits: ${Math.floor(G.res.credits)} · Fracht: ${Math.floor(cargoUsed())}/${caps().cargo} · Crew: ${G.crew.length}`; }

// ---------------------------------------------------------------- Eingabe
const keys = {}, mouse = { x: 0, y: 0, down: false, onCanvas: false };
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Space') e.preventDefault();
  if (e.code === 'KeyB') setMode('build');
  if (e.code === 'KeyF') setMode('fly');
  if (e.code === 'KeyI') setMode('inside');
  if (e.code === 'KeyP') { G.paused = !G.paused; log(G.paused ? '⏸ Pausiert' : '▶ Weiter'); }
  if (e.code === 'KeyT') toggleStation(!G.stationOpen);
  if (e.code === 'Escape') { toggleStation(false); $('#help').classList.add('hidden'); }
});
addEventListener('keyup', e => { keys[e.code] = false; });
cv.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.onCanvas = true; });
cv.addEventListener('mouseleave', () => { mouse.onCanvas = false; });
cv.addEventListener('mousedown', e => { mouse.x = e.clientX; mouse.y = e.clientY; if (e.button === 0) mouse.down = true; onClick(e.button === 2 || G.sel === 'remove'); });
addEventListener('mouseup', () => { mouse.down = false; });
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('wheel', e => { if (G.mode === 'fly') G.zoom = clamp(G.zoom * (e.deltaY > 0 ? 0.9 : 1.1), 0.35, 2.2); }, { passive: true });
document.querySelectorAll('#modes [data-mode]').forEach(b => b.onclick = () => setMode(b.dataset.mode));
$('#station').addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b) stationAction(b.dataset.act); });
$('#helpBtn').onclick = () => $('#help').classList.toggle('hidden');
$('#helpClose').onclick = () => $('#help').classList.add('hidden');

// Bau-Geometrie
const BC = 28;
function buildOrigin() { return { ox: (W - SIDE) / 2, oy: H / 2 + 10 }; }
function buildCellAt(mx, my) { const { ox, oy } = buildOrigin(); return { gx: Math.round((mx - ox) / BC), gy: Math.round((my - oy) / BC) }; }
function interiorGeom() {
  const I = G.int, CS = Math.floor(clamp(Math.min((W - SIDE - 60) / I.width, (H - 200) / I.floors), 30, 72));
  return { CS, ox: Math.floor((W - SIDE - CS * I.width) / 2), oy: Math.floor((H - CS * I.floors) / 2 + 30) };
}
function canPlaceBlock(gx, gy) {
  const m = G.ship.blocks; if (m.has(gx + ',' + gy)) return false;
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => m.has((gx + dx) + ',' + (gy + dy)));
}
function onClick(remove) {
  if (G.mode === 'build') {
    if (mouse.x > W - SIDE) return;
    const { gx, gy } = buildCellAt(mouse.x, mouse.y), k = gx + ',' + gy, m = G.ship.blocks;
    if (remove) {
      const b = m.get(k); if (!b) return;
      if (b.type === 'cockpit') return log('Das Cockpit kann nicht entfernt werden.', 'warn');
      m.delete(k); refund(BLOCKS[b.type].cost); rebuildShip(); return;
    }
    if (!G.sel || !BLOCKS[G.sel]) return;
    if (!canPlaceBlock(gx, gy)) return;
    const d = BLOCKS[G.sel]; if (!canPay(d.cost)) return log(`Zu teuer: ${costText(d.cost)}`, 'warn');
    pay(d.cost); m.set(k, mkBlock(G.sel)); rebuildShip();
  } else if (G.mode === 'inside') {
    const I = G.int, { CS, ox, oy } = interiorGeom();
    const x = Math.floor((mouse.x - ox) / CS), f = I.floors - 1 - Math.floor((mouse.y - oy) / CS);
    if (x < 0 || x >= I.width || f < 0 || f >= I.floors) return;
    const cell = I.cells[f][x];
    if (remove) {
      if (!cell) return;
      for (const c of G.crew) if (c.task && c.task.cell === cell) release(c);
      I.cells[f][x] = null; refund(MODULES[cell.type].cost); recount();
      for (const c of G.crew) if (c.path.length) release(c); // Wege neu berechnen
      return;
    }
    if (cell || !G.sel || !MODULES[G.sel]) return;
    const d = MODULES[G.sel]; if (!canPay(d.cost)) return log(`Zu teuer: ${costText(d.cost)}`, 'warn');
    pay(d.cost); I.cells[f][x] = { type: G.sel, claim: null }; recount();
  }
}

// ---------------------------------------------------------------- UI
const logs = [];
function log(text, cls = '') { logs.push({ text, cls, t: performance.now() }); if (logs.length > 6) logs.shift(); renderLog(); }
function renderLog() {
  const now = performance.now();
  $('#log').innerHTML = logs.filter(l => now - l.t < 12000).map(l => `<div style="${l.cls === 'warn' ? 'border-color:#ff7043' : ''}">${l.text}</div>`).join('');
}
function setMode(m) {
  G.mode = m; G.sel = null; toggleStation(false);
  document.querySelectorAll('#modes [data-mode]').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
  const pal = $('#palette'); $('#desc').textContent = '';
  if (m === 'build') {
    pal.innerHTML = '<h3>Blöcke</h3><div class="pal">' + BUILDABLE.map(t => `<button data-sel="${t}"><span class="sw" style="background:${BLOCKS[t].color}"></span>${BLOCKS[t].name}<small>${costText(BLOCKS[t].cost)}</small></button>`).join('') +
      '<button data-sel="remove">🗑 Entfernen<small>50 % zurück</small></button></div>';
  } else if (m === 'inside') {
    pal.innerHTML = '<h3>Module</h3><div class="pal">' + Object.entries(MODULES).map(([t, d]) => `<button data-sel="${t}">${d.icon} ${d.name}<small>${costText(d.cost)}</small></button>`).join('') +
      '<button data-sel="remove">🗑 Abreißen<small>50 % zurück</small></button></div>';
  } else {
    pal.innerHTML = `<h3>Steuerung</h3><div class="desc"><kbd>W</kbd>/<kbd>S</kbd> Schub · <kbd>A</kbd>/<kbd>D</kbd> drehen · <kbd>Leertaste</kbd> bremsen<br>
      <b>Maus halten</b> = feuern · Mausrad = Zoom · <kbd>T</kbd> Station · <kbd>P</kbd> Pause<br>
      Asteroiden zerschießen – der Traktorstrahl sammelt die Brocken ein. <span style="color:#cff6ff">Eis</span> ist überlebenswichtig (Wasser/O₂)!</div>`;
  }
  pal.querySelectorAll('[data-sel]').forEach(b => b.onclick = () => {
    G.sel = b.dataset.sel; pal.querySelectorAll('[data-sel]').forEach(x => x.classList.toggle('on', x === b));
    const d = BLOCKS[G.sel] || MODULES[G.sel]; $('#desc').textContent = d ? d.desc : 'Klicke auf ein Teil, um es zu entfernen (oder Rechtsklick).';
  });
  uiTick(1);
}
let uiT = 0;
function bar(v, color) { return `<div class="bar"><i style="width:${clamp(v, 0, 100)}%;background:${color}"></i></div>`; }
function uiTick(dt) {
  if ((uiT -= dt) > 0) return; uiT = 0.25;
  const R = G.res, cp = caps();
  const item = (k, cap) => { const v = Math.floor(R[k]), low = cap !== undefined && v < cap * 0.15; return `<span class="r ${low ? 'low' : ''}">${RES_NAMES[k]}: <b>${v}</b>${cap !== undefined ? '/' + cap : ''}</span>`; };
  $('#top').innerHTML = `<span class="r">📦 Fracht: <b>${Math.floor(cargoUsed())}</b>/${cp.cargo}</span>` + item('eisen') + item('titan') + item('eis') +
    item('wasser', cp.wasser) + item('nahrung', cp.nahrung) + item('o2', cp.o2) + item('strom', cp.strom) + item('credits') +
    (G.alarm ? '<span class="r low"><b>🚨 ALARM</b></span>' : '') + (G.paused ? '<span class="r"><b>⏸ PAUSE</b></span>' : '');
  const s = G.stats, info = $('#info');
  let h = '<h3>Schiff</h3><table class="st">' +
    `<tr><td>Blöcke / Masse</td><td>${s.list.length} / ${s.mass} t</td></tr>` +
    `<tr><td>Beschleunigung</td><td>${(s.thrust / s.mass * 20).toFixed(0)}</td></tr>` +
    `<tr><td>Wendigkeit</td><td>${s.turnRate.toFixed(2)} rad/s</td></tr>` +
    `<tr><td>Strom</td><td>+${s.power}/s</td></tr>` +
    `<tr><td>Traktor-Reichweite</td><td>${s.tractorRange || '—'}</td></tr>` +
    `<tr><td>Geschütze (besetzt)</td><td>${s.turrets} (${G.manned.toFixed(1)})</td></tr>` +
    `<tr><td>Innenraum</td><td>${s.cells} Zellen · ${s.floors} Etagen × ${s.width}</td></tr></table>`;
  if (G.mode !== 'build') {
    const label = { gun: '🎯 Geschützstation', eat: '🍽 Isst', sleep: '💤 Schläft', charge: '🔌 Lädt', work: '🌱 Hydroponik', relax: '🎰 Erholt sich', idle: '… frei' };
    h += `<h3>Crew (${G.crew.length})</h3>` + G.crew.map(c => {
      const t = c.task ? (c.path.length ? '🚶 unterwegs → ' : '') + label[c.task.type] : '';
      return `<div class="crew"><div class="h"><b>${c.kind === 'human' ? '👤' : '🤖'} ${c.name}</b><span class="t">${c.trait.name}</span></div><div class="t">${t}</div>` +
        (c.kind === 'human' ? bar(c.health, '#e57373') + bar(c.hunger, '#ffb74d') + bar(c.energy, '#64b5f6') + bar(c.morale, '#ba68c8')
          : bar(c.battery, '#fdd835')) + '</div>';
    }).join('') + '<div class="t" style="color:#7f8fb3;font-size:11px">Balken: <span style="color:#e57373">Gesundheit</span> · <span style="color:#ffb74d">Sättigung</span> · <span style="color:#64b5f6">Energie</span> · <span style="color:#ba68c8">Moral</span> · <span style="color:#fdd835">Akku</span></div>';
  }
  info.innerHTML = h;
  renderLog();
  if (G.stationOpen) { if (!stationNear()) toggleStation(false); else updateStationInfo(); }
}

// ---------------------------------------------------------------- Rendering
for (let i = 0; i < 260; i++) G.stars.push({ x: rnd(0, 4000), y: rnd(0, 4000), d: rnd(0.05, 0.5), s: rnd(0.5, 1.8) });
function drawStars() {
  ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, W, H);
  for (const s of G.stars) {
    const x = ((s.x - G.cam.x * s.d) % W + W) % W, y = ((s.y - G.cam.y * s.d) % H + H) % H;
    ctx.globalAlpha = 0.3 + s.d; ctx.fillStyle = '#cfd8ff'; ctx.fillRect(x, y, s.s, s.s);
  }
  ctx.globalAlpha = 1;
}
function drawBlock(type, x, y, size, hpRatio = 1, aim = null) {
  const d = BLOCKS[type], h = size / 2;
  ctx.fillStyle = d.color; ctx.fillRect(x - h, y - h, size, size);
  ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 1; ctx.strokeRect(x - h + 0.5, y - h + 0.5, size - 1, size - 1);
  if (type === 'cockpit') { ctx.fillStyle = '#e1f5fe'; ctx.fillRect(x + h * 0.1, y - h * 0.5, h * 0.7, h); }
  if (type === 'reactor') { ctx.fillStyle = '#fff59d'; ctx.beginPath(); ctx.arc(x, y, h * 0.45, 0, 7); ctx.fill(); }
  if (type === 'engine') { ctx.fillStyle = '#5d4037'; ctx.fillRect(x - h, y - h * 0.6, h * 0.6, h * 1.2); }
  if (type === 'tractor') { ctx.strokeStyle = '#f3e5f5'; ctx.beginPath(); ctx.arc(x, y, h * 0.5, 0, 7); ctx.stroke(); }
  if (type === 'cargo') { ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.moveTo(x - h, y - h); ctx.lineTo(x + h, y + h); ctx.moveTo(x + h, y - h); ctx.lineTo(x - h, y + h); ctx.stroke(); }
  if (type === 'armor') { ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(x - h + 2, y - h + 2, size - 4, size - 4); }
  if (type === 'turret') {
    ctx.fillStyle = '#b71c1c'; ctx.beginPath(); ctx.arc(x, y, h * 0.6, 0, 7); ctx.fill();
    const a = aim ?? 0; ctx.strokeStyle = '#eee'; ctx.lineWidth = size * 0.18; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * size * 0.8, y + Math.sin(a) * size * 0.8); ctx.stroke(); ctx.lineWidth = 1;
  }
  if (hpRatio < 1) { ctx.fillStyle = `rgba(0,0,0,${(1 - hpRatio) * 0.6})`; ctx.fillRect(x - h, y - h, size, size); }
}
function renderSpace() {
  const S = G.ship, s = G.stats;
  G.cam.x += (S.x - G.cam.x) * 0.15; G.cam.y += (S.y - G.cam.y) * 0.15;
  drawStars();
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(G.zoom, G.zoom); ctx.translate(-G.cam.x, -G.cam.y);
  // Station
  ctx.save(); ctx.rotate(G.time * 0.05);
  ctx.strokeStyle = '#4fc3f7'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, 120, 0, 7); ctx.stroke();
  ctx.lineWidth = 6; for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(25, 0); ctx.lineTo(115, 0); ctx.stroke(); }
  ctx.fillStyle = '#263850'; ctx.beginPath(); ctx.arc(0, 0, 28, 0, 7); ctx.fill();
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; ctx.fillStyle = (i + Math.floor(G.time * 2)) % 3 ? '#80deea' : '#ffd54f'; ctx.fillRect(Math.cos(a) * 120 - 2, Math.sin(a) * 120 - 2, 4, 4); }
  ctx.restore();
  ctx.fillStyle = '#80deea'; ctx.font = '13px system-ui'; ctx.textAlign = 'center'; ctx.fillText('Handelsstation', 0, -140);
  ctx.strokeStyle = 'rgba(79,195,247,.15)'; ctx.setLineDash([6, 8]); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 280, 0, 7); ctx.stroke(); ctx.setLineDash([]);
  // Asteroiden
  for (const a of G.asteroids) {
    ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.rot);
    ctx.fillStyle = { eisen: '#6d625a', titan: '#4d6b8a', eis: '#8fc9d6' }[a.type]; ctx.beginPath();
    a.verts.forEach((v, i) => { const ang = i / a.verts.length * 6.283; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(ang) * a.r * v, Math.sin(ang) * a.r * v); });
    ctx.closePath(); ctx.fill(); ctx.strokeStyle = ORE_COLOR[a.type]; ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1; ctx.restore();
  }
  // Traktorstrahl
  if (s.tractorRange) {
    ctx.strokeStyle = 'rgba(186,104,200,.10)'; ctx.beginPath(); ctx.arc(S.x, S.y, s.tractorRange, 0, 7); ctx.stroke();
    ctx.strokeStyle = 'rgba(206,147,216,.55)'; ctx.lineWidth = 2;
    for (const c of G.chunks) if (c.pulled) { ctx.beginPath(); ctx.moveTo(S.x, S.y); ctx.lineTo(c.x, c.y); ctx.stroke(); }
    ctx.lineWidth = 1;
  }
  for (const c of G.chunks) { ctx.fillStyle = ORE_COLOR[c.type]; ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(G.time * 2); ctx.fillRect(-3.5, -3.5, 7, 7); ctx.restore(); }
  // Spielerschiff
  ctx.save(); ctx.translate(S.x, S.y); ctx.rotate(S.a);
  for (const e of s.list) {
    const lx = (e.gx - s.cx) * B, ly = (e.gy - s.cy) * B;
    if (e.b.type === 'engine' && G.thrusting) { ctx.fillStyle = Math.random() < 0.5 ? '#ffca28' : '#ff7043'; ctx.beginPath(); ctx.moveTo(lx - B / 2, ly - 5); ctx.lineTo(lx - B / 2 - rnd(10, 22), ly); ctx.lineTo(lx - B / 2, ly + 5); ctx.fill(); }
    drawBlock(e.b.type, lx, ly, B, e.b.hp / BLOCKS[e.b.type].hp, e.b.aim - S.a);
  }
  ctx.restore();
  // Piraten
  for (const p of G.pirates) {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
    for (const [x, y] of [[1, 0], [0, -1], [0, 0], [0, 1], [-1, -1], [-1, 1]]) { ctx.fillStyle = x === 1 ? '#ff5252' : '#7b1f1f'; ctx.fillRect(x * 12 - 6, y * 12 - 6, 12, 12); }
    ctx.restore();
    ctx.fillStyle = '#300'; ctx.fillRect(p.x - 20, p.y - 32, 40, 4); ctx.fillStyle = '#ff5252'; ctx.fillRect(p.x - 20, p.y - 32, 40 * p.hp / p.maxhp, 4);
  }
  // Projektile, Partikel, Texte
  for (const b of G.bullets) { ctx.strokeStyle = b.owner === 'p' ? '#81d4fa' : '#ff8a80'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx * 0.02, b.y - b.vy * 0.02); ctx.stroke(); }
  ctx.lineWidth = 1;
  for (const p of G.particles) { ctx.globalAlpha = clamp(p.life, 0, 1); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size); }
  ctx.globalAlpha = 1; ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center';
  for (const t of G.texts) { ctx.globalAlpha = clamp(t.life, 0, 1); ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y); }
  ctx.globalAlpha = 1; ctx.restore();

  if (stationNear() && !G.stationOpen) banner('🛰 Station in Reichweite – [T] Handel, Reparatur, Crew', '#4fc3f7', H - 70);
  drawRadar(16 + 80, 100 + 80, 80);
}
function drawRadar(cx, cy, r) {
  const sc = r / 2600;
  ctx.fillStyle = 'rgba(8,14,26,.85)'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
  ctx.strokeStyle = '#24314d'; ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, r / 2, 0, 7); ctx.stroke();
  const P = (x, y) => [cx + (x - G.ship.x) * sc, cy + (y - G.ship.y) * sc];
  const dot = (x, y, c, s) => { const [a, b] = P(x, y); if (Math.hypot(a - cx, b - cy) < r - 2) { ctx.fillStyle = c; ctx.fillRect(a - s / 2, b - s / 2, s, s); } };
  for (const a of G.asteroids) dot(a.x, a.y, ORE_COLOR[a.type], 2);
  dot(0, 0, '#4fc3f7', 6);
  for (const p of G.pirates) dot(p.x, p.y, '#ff5252', 4);
  ctx.fillStyle = '#fff'; ctx.fillRect(cx - 2, cy - 2, 4, 4);
  ctx.fillStyle = '#7f8fb3'; ctx.font = '11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('Radar', cx, cy + r + 13);
}
function banner(text, color, y) {
  ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center'; const w = ctx.measureText(text).width + 24, x = (W - SIDE) / 2;
  ctx.fillStyle = 'rgba(8,12,22,.85)'; ctx.fillRect(x - w / 2, y - 18, w, 28); ctx.strokeStyle = color; ctx.strokeRect(x - w / 2, y - 18, w, 28);
  ctx.fillStyle = color; ctx.fillText(text, x, y + 1);
}
function renderBuild() {
  ctx.fillStyle = '#070b14'; ctx.fillRect(0, 0, W, H);
  const { ox, oy } = buildOrigin(), m = G.ship.blocks;
  ctx.strokeStyle = '#121b2e'; ctx.lineWidth = 1;
  for (let x = ox - BC / 2 - Math.ceil(ox / BC) * BC; x < W - SIDE; x += BC) { ctx.beginPath(); ctx.moveTo(x, 38); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = oy - BC / 2 - Math.ceil(oy / BC) * BC; y < H; y += BC) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W - SIDE, y); ctx.stroke(); }
  for (const [k, b] of m) { const [x, y] = k.split(',').map(Number); drawBlock(b.type, ox + x * BC, oy + y * BC, BC - 1, b.hp / BLOCKS[b.type].hp, 0); }
  // Schwerpunkt
  const s = G.stats; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(ox + s.cx * BC, oy + s.cy * BC, 5, 0, 7); ctx.stroke();
  // Vorschau
  if (mouse.onCanvas && mouse.x < W - SIDE && G.sel) {
    const { gx, gy } = buildCellAt(mouse.x, mouse.y), sx = ox + gx * BC, sy = oy + gy * BC;
    if (G.sel === 'remove') { if (m.has(gx + ',' + gy)) { ctx.strokeStyle = '#ff5252'; ctx.lineWidth = 2; ctx.strokeRect(sx - BC / 2, sy - BC / 2, BC, BC); } }
    else {
      const ok = canPlaceBlock(gx, gy) && canPay(BLOCKS[G.sel].cost);
      ctx.globalAlpha = 0.5; drawBlock(G.sel, sx, sy, BC - 1); ctx.globalAlpha = 1;
      ctx.strokeStyle = ok ? '#81c784' : '#ff5252'; ctx.lineWidth = 2; ctx.strokeRect(sx - BC / 2, sy - BC / 2, BC, BC);
    }
    ctx.lineWidth = 1;
  }
  ctx.fillStyle = '#7f8fb3'; ctx.font = '13px system-ui'; ctx.textAlign = 'left';
  ctx.fillText('Flugrichtung →   ·   Linksklick: setzen   ·   Rechtsklick: entfernen   ·   ○ = Schwerpunkt   ·   Spiel pausiert', 16, H - 16);
  banner('🔧 AUSSENBAU – Hülle = Innenraum · Panzer = Schutz', '#4fc3f7', 100);
}
function renderInside() {
  ctx.fillStyle = '#060912'; ctx.fillRect(0, 0, W, H);
  for (const s of G.stars) { ctx.globalAlpha = 0.25; ctx.fillStyle = '#cfd8ff'; ctx.fillRect((s.x + G.time * 8 * s.d) % W, s.y % H, s.s, s.s); }
  ctx.globalAlpha = 1;
  const I = G.int, { CS, ox, oy } = interiorGeom(), wpx = CS * I.width, hpx = CS * I.floors;
  // Hülle
  ctx.fillStyle = '#2b3a4a'; ctx.beginPath();
  ctx.moveTo(ox - 14, oy - 14); ctx.lineTo(ox + wpx + 10, oy - 14); ctx.lineTo(ox + wpx + 14 + hpx * 0.35, oy + hpx / 2); ctx.lineTo(ox + wpx + 10, oy + hpx + 14); ctx.lineTo(ox - 14, oy + hpx + 14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#111925'; ctx.fillRect(ox, oy, wpx, hpx);
  // Zellen
  for (let f = 0; f < I.floors; f++) for (let x = 0; x < I.width; x++) {
    const cx = ox + x * CS, cy = oy + (I.floors - 1 - f) * CS, cell = I.cells[f][x];
    ctx.strokeStyle = '#1b2638'; ctx.strokeRect(cx + 0.5, cy + 0.5, CS - 1, CS - 1);
    if (cell) {
      const d = MODULES[cell.type];
      ctx.fillStyle = d.color; ctx.globalAlpha = 0.35; ctx.fillRect(cx + 2, cy + 2, CS - 4, CS - 4); ctx.globalAlpha = 1;
      if (cell.type === 'lift') { ctx.strokeStyle = '#90a4ae'; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(cx + CS * 0.3, cy + i * CS / 5); ctx.lineTo(cx + CS * 0.7, cy + i * CS / 5); ctx.stroke(); } }
      ctx.font = `${Math.floor(CS * 0.38)}px system-ui`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(d.icon, cx + CS / 2, cy + CS * 0.5);
      if (CS >= 48) { ctx.font = '9.5px system-ui'; ctx.fillStyle = '#b0bec5'; ctx.fillText(d.name.split('/')[0], cx + CS / 2, cy + CS - 6); }
      if (cell.claim) { ctx.fillStyle = '#ffd54f'; ctx.beginPath(); ctx.arc(cx + CS - 7, cy + 7, 3, 0, 7); ctx.fill(); }
    }
    ctx.fillStyle = '#3b4a60'; ctx.fillRect(cx, cy + CS - 3, CS, 3); // Boden
  }
  ctx.fillStyle = '#7f8fb3'; ctx.font = '11px system-ui'; ctx.textAlign = 'right';
  for (let f = 0; f < I.floors; f++) ctx.fillText(`Deck ${f + 1}`, ox - 18, oy + (I.floors - 1 - f) * CS + CS / 2 + 4);
  // Vorschau
  if (mouse.onCanvas && G.sel) {
    const x = Math.floor((mouse.x - ox) / CS), f = I.floors - 1 - Math.floor((mouse.y - oy) / CS);
    if (x >= 0 && x < I.width && f >= 0 && f < I.floors) {
      const occ = !!I.cells[f][x], ok = G.sel === 'remove' ? occ : !occ && canPay(MODULES[G.sel].cost);
      ctx.strokeStyle = ok ? (G.sel === 'remove' ? '#ff5252' : '#81c784') : '#ff5252'; ctx.lineWidth = 2;
      ctx.strokeRect(ox + x * CS + 1, oy + (I.floors - 1 - f) * CS + 1, CS - 2, CS - 2); ctx.lineWidth = 1;
    }
  }
  // Crew
  for (const c of G.crew) {
    const x = ox + (c.px + 0.5) * CS, y = oy + (I.floors - 1 - c.pf) * CS + CS - 4, s = CS / 48;
    const off = (c.id % 3 - 1) * 5 * s, bob = c.path.length ? Math.sin(G.time * 12 + c.id) * 1.5 : 0;
    const sleeping = c.task && c.task.type === 'sleep' && !c.path.length;
    if (c.kind === 'human') {
      ctx.fillStyle = `hsl(${c.hue},55%,55%)`; ctx.fillRect(x + off - 4 * s, y - 18 * s + bob, 8 * s, 12 * s);
      ctx.fillStyle = '#ffccbc'; ctx.beginPath(); ctx.arc(x + off, y - 22 * s + bob, 4 * s, 0, 7); ctx.fill();
      ctx.fillStyle = '#37474f'; ctx.fillRect(x + off - 4 * s, y - 6 * s, 3 * s, 6 * s); ctx.fillRect(x + off + 1 * s, y - 6 * s, 3 * s, 6 * s);
    } else {
      ctx.fillStyle = '#90a4ae'; ctx.fillRect(x + off - 5 * s, y - 16 * s + bob, 10 * s, 12 * s);
      ctx.fillStyle = c.battery > 20 ? '#4fc3f7' : '#ff5252'; ctx.fillRect(x + off - 3 * s, y - 13 * s + bob, 6 * s, 3 * s);
      ctx.fillStyle = '#607d8b'; ctx.fillRect(x + off - 4 * s, y - 4 * s, 8 * s, 4 * s);
      ctx.strokeStyle = '#90a4ae'; ctx.beginPath(); ctx.moveTo(x + off, y - 16 * s); ctx.lineTo(x + off, y - 21 * s); ctx.stroke();
    }
    ctx.font = '10px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#e3eaff'; ctx.fillText(c.name, x + off, y - 30 * s);
    let st = sleeping ? '💤' : '';
    if (c.kind === 'human') { if (c.hunger < 20) st += '🍞'; if (G.res.o2 <= 0) st += '😵'; } else if (c.battery < 20) st += '🔋';
    if (c.task && c.task.type === 'work' && !c.path.length && c.task.active) st += '✨';
    if (st) ctx.fillText(st, x + off, y - 40 * s);
  }
  if (G.alarm) banner(`🚨 ALARM – Geschütze besetzt: ${G.manned.toFixed(1)} · Versorgung leidet!`, '#ff5252', 96);
  else banner('🏠 INNENANSICHT – Autopilot aktiv', '#4fc3f7', 96);
  drawRadar(16 + 70, 100 + 70, 70);
}

// ---------------------------------------------------------------- Hauptschleife
function update(dt) {
  G.time += dt;
  updateSystems(dt);
  updateSpace(dt, G.mode === 'fly' && !G.stationOpen);
  for (const c of G.crew) updateCrew(c, dt);
  const dead = G.crew.filter(c => c.health <= 0);
  for (const c of dead) { release(c); log(`✝ ${c.name} ist gestorben (${G.res.o2 <= 0 ? 'Sauerstoffmangel' : 'Hunger'}).`, 'warn'); }
  if (dead.length) G.crew = G.crew.filter(c => c.health > 0);
  for (const p of G.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
  G.particles = G.particles.filter(p => p.life > 0);
  for (const t of G.texts) { t.y -= 20 * dt; t.life -= dt; }
  G.texts = G.texts.filter(t => t.life > 0);
  if (G.res.o2 <= 0 && G.time - (G.lastO2 || -99) > 10) { G.lastO2 = G.time; log('😵 Kein Sauerstoff! Eis abbauen und Elektrolyse betreiben!', 'warn'); }
}
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (G.mode !== 'build' && !G.paused) update(dt);
  if (G.mode === 'build') renderBuild(); else if (G.mode === 'inside') renderInside(); else renderSpace();
  uiTick(dt);
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------- Start
G.ship.blocks = starterShip();
rebuildShip(false);
starterInterior();
for (let i = 0; i < 45; i++) spawnAsteroid();
for (let i = 0; i < 5; i++) { // ein paar Eis-Asteroiden in Startnähe
  const a = rnd(-0.8, 0.8), d = rnd(450, 800), verts = []; for (let j = 0; j < 9; j++) verts.push(rnd(0.75, 1.15));
  G.asteroids.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: rnd(18, 30), type: i < 3 ? 'eis' : 'eisen', hp: 40, vx: 0, vy: 0, rot: 0, vr: rnd(-0.3, 0.3), verts });
}
G.crew.push(Object.assign(makeCrew('human'), { name: 'Mira', trait: TRAITS.human[0] }));
G.crew.push(Object.assign(makeCrew('human'), { name: 'Jonas', trait: TRAITS.human[1], pf: 1, px: 2 }));
G.crew.push(Object.assign(makeCrew('robot'), { name: 'RX-7', trait: TRAITS.robot[0], px: 4 }));
setMode('fly');
log('Willkommen, Kapitän! Baue Eis ab – deine Crew braucht Wasser und Sauerstoff.');
requestAnimationFrame(frame);
window.G = G; // für Mods/Debugging

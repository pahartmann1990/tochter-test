// ============================================================
// gear.js — Zahnrad-Klassen und Berechnungen
// ============================================================

let _gearIdCounter = 0;

export function resetIdCounter() {
  _gearIdCounter = 0;
}

export function nextGearId() {
  _gearIdCounter++;
  return `gear_${_gearIdCounter}`;
}

// ----- Konstanten -----
export const MODULE_OPTIONS = [1.0, 1.25, 1.5, 2.0, 2.5];
export const DEFAULT_MODULE = 1.5;
export const PRINT_BED_MM = 200;

// ----- Berechnungen -----
export function pitchDiameter(teeth, mod) {
  return teeth * mod;
}

export function pitchRadius(teeth, mod) {
  return (teeth * mod) / 2;
}

export function outerRadius(teeth, mod) {
  return pitchRadius(teeth, mod) + mod;
}

export function baseRadius(teeth, mod) {
  return pitchRadius(teeth, mod) - 1.25 * mod;
}

// ----- Zahnrad-Klasse -----
export class Gear {
  constructor({ teeth = 20, module: mod = DEFAULT_MODULE, x = 0, y = 0, type = "simple", label = "" }) {
    this.id = nextGearId();
    this.teeth = teeth;
    this.module = mod;
    this.x = x;
    this.y = y;
    this.type = type;          // "simple" | "compound"
    this.label = label;
    this.rotation = 0;         // rad
    this.rpm = 0;
    this.isDriver = false;
    this.connections = [];      // IDs der verbundenen Zahnräder

    // Compound: zweites Zahnrad auf gleicher Achse
    this.compoundTeeth = type === "compound" ? Math.max(8, Math.round(teeth / 2)) : null;
  }

  get diameter() {
    return pitchDiameter(this.teeth, this.module);
  }

  get pRadius() {
    return pitchRadius(this.teeth, this.module);
  }

  get oRadius() {
    return outerRadius(this.teeth, this.module);
  }

  get compoundPRadius() {
    if (this.compoundTeeth == null) return null;
    return pitchRadius(this.compoundTeeth, this.module);
  }

  get compoundORadius() {
    if (this.compoundTeeth == null) return null;
    return outerRadius(this.compoundTeeth, this.module);
  }

  fitsOnPrintBed() {
    const d = this.oRadius * 2;
    return d <= PRINT_BED_MM;
  }

  hitTest(px, py, scale) {
    const r = this.oRadius * scale;
    const dx = px - this.x * scale;
    const dy = py - this.y * scale;
    return dx * dx + dy * dy <= r * r;
  }

  toJSON() {
    const obj = {
      id: this.id,
      type: this.type === "simple" ? "Einfach" : "Kombi",
      teeth: this.teeth,
      module: this.module,
      diameter_mm: +this.diameter.toFixed(2),
      outer_diameter_mm: +(this.oRadius * 2).toFixed(2),
      position: { x: +this.x.toFixed(1), y: +this.y.toFixed(1) },
      rpm: +this.rpm.toFixed(2),
      is_driver: this.isDriver,
      connections: [...this.connections],
    };
    if (this.type === "compound") {
      obj.compound_teeth = this.compoundTeeth;
      obj.compound_diameter_mm = +(this.compoundTeeth * this.module).toFixed(2);
    }
    if (this.label) obj.label = this.label;
    return obj;
  }
}

// ----- Zahnrad zeichnen (Canvas) -----
// Erwartet: Canvas-Context hat bereits translate(panX,panY) + scale(s,s)
// gear.x / gear.y sind in WELT-Koordinaten (mm)
export function drawGear(ctx, gear, currentScale, isSelected, isHover) {
  const x = gear.x;
  const y = gear.y;
  const pR = gear.pRadius;
  const oR = gear.oRadius;
  const mod = gear.module;
  const teeth = gear.teeth;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(gear.rotation);

  // Zahnkranz
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2;
    const a1 = ((i + 0.15) / teeth) * Math.PI * 2;
    const a2 = ((i + 0.35) / teeth) * Math.PI * 2;
    const a3 = ((i + 0.5) / teeth) * Math.PI * 2;

    const inner = pR - mod * 0.3;
    if (i === 0) {
      ctx.moveTo(Math.cos(a0) * inner, Math.sin(a0) * inner);
    }
    ctx.lineTo(Math.cos(a1) * oR, Math.sin(a1) * oR);
    ctx.lineTo(Math.cos(a2) * oR, Math.sin(a2) * oR);
    ctx.lineTo(Math.cos(a3) * inner, Math.sin(a3) * inner);
  }
  ctx.closePath();

  const color = gear.isDriver ? "#e94560" : gear.type === "compound" ? "#ffd93d" : "#4a9eff";
  ctx.fillStyle = color + "1a";
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = (isSelected ? 2.5 : 1.2) / currentScale;
  ctx.stroke();

  // Compound inneres Zahnrad (dünn gestrichelt)
  if (gear.type === "compound" && gear.compoundTeeth) {
    const cpR = gear.compoundPRadius;
    const coR = gear.compoundORadius;
    const cTeeth = gear.compoundTeeth;

    ctx.beginPath();
    for (let i = 0; i < cTeeth; i++) {
      const a0 = (i / cTeeth) * Math.PI * 2;
      const a1 = ((i + 0.15) / cTeeth) * Math.PI * 2;
      const a2 = ((i + 0.35) / cTeeth) * Math.PI * 2;
      const a3 = ((i + 0.5) / cTeeth) * Math.PI * 2;
      const inner = cpR - mod * 0.3;
      if (i === 0) ctx.moveTo(Math.cos(a0) * inner, Math.sin(a0) * inner);
      ctx.lineTo(Math.cos(a1) * coR, Math.sin(a1) * coR);
      ctx.lineTo(Math.cos(a2) * coR, Math.sin(a2) * coR);
      ctx.lineTo(Math.cos(a3) * inner, Math.sin(a3) * inner);
    }
    ctx.closePath();
    ctx.fillStyle = "#ffd93d0d";
    ctx.fill();
    ctx.setLineDash([4 / currentScale, 3 / currentScale]);
    ctx.strokeStyle = "#ffd93d88";
    ctx.lineWidth = 1 / currentScale;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Nabenbohrung
  const holeR = Math.max(2, mod * 1.2);
  ctx.beginPath();
  ctx.arc(0, 0, holeR, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1a2e";
  ctx.fill();
  ctx.strokeStyle = "#c084fc";
  ctx.lineWidth = 1.5 / currentScale;
  ctx.stroke();

  // Drehrichtungs-Pfeil
  if (Math.abs(gear.rpm) > 0.01) {
    const arrowR = pR * 0.55;
    const dir = gear.rpm > 0 ? 1 : -1;
    const startA = 0;
    const endA = dir * Math.PI * 0.6;
    ctx.beginPath();
    ctx.arc(0, 0, arrowR, startA, endA, dir < 0);
    ctx.strokeStyle = color + "88";
    ctx.lineWidth = 1.5 / currentScale;
    ctx.stroke();
    const tipA = endA;
    const tipX = Math.cos(tipA) * arrowR;
    const tipY = Math.sin(tipA) * arrowR;
    const perpA = tipA + (dir > 0 ? -0.4 : 0.4);
    const arrSz = 4 / currentScale;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX + Math.cos(perpA - 0.5) * arrSz, tipY + Math.sin(perpA - 0.5) * arrSz);
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX + Math.cos(perpA + 0.5) * arrSz, tipY + Math.sin(perpA + 0.5) * arrSz);
    ctx.strokeStyle = color + "88";
    ctx.stroke();
  }

  ctx.restore();

  // ---- Labels (nicht rotierend, aber skaliert) ----
  ctx.save();
  ctx.translate(x, y);

  const fontSize = 11 / currentScale;
  const smallFont = 9 / currentScale;

  ctx.fillStyle = "#eee";
  ctx.font = `bold ${fontSize}px 'JetBrains Mono', monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${teeth}Z`, 0, 0);

  if (gear.type === "compound" && gear.compoundTeeth) {
    ctx.font = `${smallFont}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = "#ffd93d";
    ctx.fillText(`(${gear.compoundTeeth}Z)`, 0, 10 / currentScale);
  }

  if (gear.label) {
    ctx.font = `${smallFont}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = "#8892a4";
    ctx.fillText(gear.label, 0, oR + 10 / currentScale);
  }

  if (Math.abs(gear.rpm) > 0.001) {
    ctx.font = `bold ${smallFont}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = "#e94560";
    ctx.fillText(`${gear.rpm.toFixed(1)} rpm`, 0, -oR - 8 / currentScale);
  }

  if (isSelected) {
    ctx.beginPath();
    ctx.arc(0, 0, oR + 4 / currentScale, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(233,69,96,0.5)";
    ctx.lineWidth = 2 / currentScale;
    ctx.setLineDash([5 / currentScale, 4 / currentScale]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (isHover && !isSelected) {
    ctx.beginPath();
    ctx.arc(0, 0, oR + 3 / currentScale, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(74,158,255,0.3)";
    ctx.lineWidth = 1.5 / currentScale;
    ctx.stroke();
  }

  ctx.restore();
}

// ----- Snap-Vorschau (world coords, transform already applied) -----
export function drawSnapPreview(ctx, gear, allGears, currentScale) {
  for (const other of allGears) {
    if (other.id === gear.id) continue;
    const meshDist = gear.pRadius + other.pRadius;
    const dx = gear.x - other.x;
    const dy = gear.y - other.y;
    const dist = Math.hypot(dx, dy);
    if (Math.abs(dist - meshDist) < 20) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(other.x, other.y, meshDist, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(233,69,96,0.3)";
      ctx.lineWidth = 2 / currentScale;
      ctx.setLineDash([6 / currentScale, 4 / currentScale]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }
}

// ----- Verbindungslinie (world coords) -----
export function drawConnection(ctx, a, b, currentScale) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = "rgba(233,69,96,0.25)";
  ctx.lineWidth = 1 / currentScale;
  ctx.setLineDash([3 / currentScale, 3 / currentScale]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

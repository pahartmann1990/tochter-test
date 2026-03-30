// ============================================================
// simulation.js — Physik-Engine: Verbindungen, Drehzahlen
// ============================================================

import { pitchRadius } from "./gear.js";

const SNAP_TOLERANCE_FACTOR = 0.12; // 12 % des Soll-Abstands

// ============================================================
// Auto-Connect: prüft alle Paare auf korrekten Achsabstand
// ============================================================
export function autoConnect(gears) {
  const connections = [];

  for (let i = 0; i < gears.length; i++) {
    gears[i].connections = [];
  }

  for (let i = 0; i < gears.length; i++) {
    for (let j = i + 1; j < gears.length; j++) {
      const a = gears[i];
      const b = gears[j];

      // Nur gleicher Modul kann kämmen
      if (Math.abs(a.module - b.module) > 0.001) continue;

      const meshDist = a.pRadius + b.pRadius;
      const realDist = Math.hypot(a.x - b.x, a.y - b.y);
      const tolerance = meshDist * SNAP_TOLERANCE_FACTOR;

      if (Math.abs(realDist - meshDist) <= tolerance) {
        connections.push({ from: a.id, to: b.id, type: "mesh" });
        a.connections.push(b.id);
        b.connections.push(a.id);
      }
    }
  }

  return connections;
}

// ============================================================
// Snap: Bewege Zahnrad auf exakte Kämmposition
// ============================================================
export function snapGear(gear, allGears) {
  let bestDist = Infinity;
  let bestSnap = null;

  for (const other of allGears) {
    if (other.id === gear.id) continue;
    if (Math.abs(other.module - gear.module) > 0.001) continue;

    const meshDist = gear.pRadius + other.pRadius;
    const dx = gear.x - other.x;
    const dy = gear.y - other.y;
    const realDist = Math.hypot(dx, dy);
    const diff = Math.abs(realDist - meshDist);

    if (diff < meshDist * 0.25 && diff < bestDist) {
      bestDist = diff;
      const angle = Math.atan2(dy, dx);
      bestSnap = {
        x: other.x + Math.cos(angle) * meshDist,
        y: other.y + Math.sin(angle) * meshDist,
      };
    }
  }

  if (bestSnap) {
    gear.x = bestSnap.x;
    gear.y = bestSnap.y;
  }
}

// ============================================================
// Drehzahlen berechnen (BFS vom Antrieb ausgehend)
// ============================================================
export function propagateRpm(gears, connections, driverRpm) {
  // Reset
  for (const g of gears) {
    g.rpm = 0;
  }

  const driver = gears.find(g => g.isDriver);
  if (!driver) return { totalRatio: null };

  driver.rpm = driverRpm;

  const visited = new Set([driver.id]);
  const queue = [driver.id];
  const gearMap = new Map(gears.map(g => [g.id, g]));

  while (queue.length > 0) {
    const cId = queue.shift();
    const cur = gearMap.get(cId);

    for (const conn of connections) {
      let nId = null;
      if (conn.from === cId && !visited.has(conn.to)) nId = conn.to;
      if (conn.to === cId && !visited.has(conn.from)) nId = conn.from;
      if (!nId) continue;

      const nei = gearMap.get(nId);
      if (!nei) continue;

      if (conn.type === "mesh") {
        // Kämmende Zahnräder: Übersetzung + Richtungswechsel
        const effectiveTeeth = cur.type === "compound" ? cur.compoundTeeth : cur.teeth;
        const ratio = effectiveTeeth / nei.teeth;
        nei.rpm = -cur.rpm * ratio;
      }

      visited.add(nId);
      queue.push(nId);
    }
  }

  // Gesamtübersetzung berechnen
  let totalRatio = null;
  const nonDriver = gears.filter(g => !g.isDriver && Math.abs(g.rpm) > 0.001);
  if (nonDriver.length > 0) {
    const last = nonDriver[nonDriver.length - 1];
    const r = Math.abs(driverRpm / last.rpm);
    totalRatio = r >= 1
      ? `${r.toFixed(2)} : 1`
      : `1 : ${(1 / r).toFixed(2)}`;
  }

  return { totalRatio };
}

// ============================================================
// Rotationen aktualisieren (ein Zeitschritt)
// ============================================================
export function stepRotation(gears, connections, driverRpm, dt) {
  const driver = gears.find(g => g.isDriver);
  if (!driver) return;

  // Antrieb drehen
  driver.rotation += (driverRpm / 60) * Math.PI * 2 * dt;

  const visited = new Set([driver.id]);
  const queue = [driver.id];
  const gearMap = new Map(gears.map(g => [g.id, g]));

  while (queue.length > 0) {
    const cId = queue.shift();
    const cur = gearMap.get(cId);

    for (const conn of connections) {
      let nId = null;
      if (conn.from === cId && !visited.has(conn.to)) nId = conn.to;
      if (conn.to === cId && !visited.has(conn.from)) nId = conn.from;
      if (!nId) continue;

      const nei = gearMap.get(nId);
      if (!nei) continue;

      if (conn.type === "mesh") {
        const effectiveTeeth = cur.type === "compound" ? cur.compoundTeeth : cur.teeth;
        const ratio = effectiveTeeth / nei.teeth;
        nei.rotation = -cur.rotation * ratio;
      }

      visited.add(nId);
      queue.push(nId);
    }
  }
}

// ============================================================
// Manuelle Drehung: Antrieb um Δ drehen
// ============================================================
export function manualRotate(gears, connections, deltaAngle) {
  const driver = gears.find(g => g.isDriver);
  if (!driver) return;

  driver.rotation += deltaAngle;
  driver.rpm = 0; // manuell → keine konstante Drehzahl

  const visited = new Set([driver.id]);
  const queue = [driver.id];
  const gearMap = new Map(gears.map(g => [g.id, g]));

  while (queue.length > 0) {
    const cId = queue.shift();
    const cur = gearMap.get(cId);

    for (const conn of connections) {
      let nId = null;
      if (conn.from === cId && !visited.has(conn.to)) nId = conn.to;
      if (conn.to === cId && !visited.has(conn.from)) nId = conn.from;
      if (!nId) continue;

      const nei = gearMap.get(nId);
      if (!nei) continue;

      if (conn.type === "mesh") {
        const effectiveTeeth = cur.type === "compound" ? cur.compoundTeeth : cur.teeth;
        const ratio = effectiveTeeth / nei.teeth;
        nei.rotation = -cur.rotation * ratio;
      }

      visited.add(nId);
      queue.push(nId);
    }
  }
}

// ============================================================
// Prozentanzeige: Winkel → 0–100 %
// ============================================================
export function calcPercent(gear) {
  if (!gear) return 0;
  // Normalisiere Rotation auf 0–2π
  let angle = gear.rotation % (Math.PI * 2);
  if (angle < 0) angle += Math.PI * 2;
  return (angle / (Math.PI * 2)) * 100;
}

// ============================================================
// Export: Teileliste als JSON
// ============================================================
export function exportProject(gears, connections, totalRatio) {
  const usedModules = [...new Set(gears.map(g => g.module))].sort();

  return {
    project: "Zahnrad-Simulation",
    timestamp: new Date().toISOString(),
    print_bed_mm: 200,
    total_ratio: totalRatio || "–",
    used_modules: usedModules,
    gears: gears.map(g => g.toJSON()),
    connections: connections.map(c => ({
      from: c.from,
      to: c.to,
      type: c.type,
    })),
  };
}

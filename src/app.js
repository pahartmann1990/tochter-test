// ============================================================
// app.js — Hauptanwendung: Init, Render-Loop, Events
// ============================================================

import { Gear, drawGear, drawSnapPreview, drawConnection } from "./gear.js";
import {
  autoConnect,
  snapGear,
  propagateRpm,
  stepRotation,
  manualRotate,
  calcPercent,
  exportProject,
} from "./simulation.js";
import {
  initLeftSidebar,
  renderRightSidebar,
  drawGauge,
  showExportDialog,
  drawGrid,
  drawPrintBed,
  renderInfoBar,
} from "./ui.js";

// ============================================================
// State
// ============================================================
let gears = [];
let connections = [];
let selectedId = null;
let hoveredId = null;
let dragging = null;
let dragOffX = 0;
let dragOffY = 0;

let simRunning = false;
let driverRpm = 10;
let manualMode = false;
let showBed = true;
let totalRatio = null;

let scale = 3.0;    // px per mm
let panX = 100;     // initial offset to center content
let panY = 50;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;

let lastTime = 0;
let fps = 0;
let frameCount = 0;
let fpsTimer = 0;

// Canvas
let canvas, ctx, gaugeCanvas, gaugeCtx;

// ============================================================
// Boot
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("mainCanvas");
  ctx = canvas.getContext("2d");
  gaugeCanvas = document.getElementById("gaugeCanvas");
  gaugeCtx = gaugeCanvas.getContext("2d");

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Left sidebar
  const left = initLeftSidebar(document.getElementById("leftSidebar"), addGear);
  const rpmSlider = left.getRpmSlider();
  const rpmVal = left.getRpmVal();
  const btnPlay = left.getBtnPlay();
  const btnReset = left.getBtnReset();
  const chkManual = left.getChkManual();
  const chkBed = left.getChkBed();
  const btnExport = left.getBtnExport();

  rpmSlider.addEventListener("input", () => {
    driverRpm = +rpmSlider.value;
    rpmVal.textContent = rpmSlider.value;
    recalc();
  });

  btnPlay.addEventListener("click", () => {
    simRunning = !simRunning;
    manualMode = false;
    chkManual.checked = false;
    btnPlay.textContent = simRunning ? "⏸ Stop" : "▶ Start";
    if (simRunning) lastTime = 0;
  });

  btnReset.addEventListener("click", () => {
    simRunning = false;
    btnPlay.textContent = "▶ Start";
    gears.forEach(g => { g.rotation = 0; g.rpm = 0; });
    recalc();
  });

  chkManual.addEventListener("change", () => {
    manualMode = chkManual.checked;
    if (manualMode) {
      simRunning = false;
      btnPlay.textContent = "▶ Start";
    }
  });

  chkBed.addEventListener("change", () => {
    showBed = chkBed.checked;
  });

  btnExport.addEventListener("click", () => {
    const data = exportProject(gears, connections, totalRatio);
    showExportDialog(data);
  });

  // Canvas events
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("mouseleave", onMouseUp);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("dblclick", onDblClick);

  // Seed default gears
  seedDefaults();

  // Go
  requestAnimationFrame(loop);
});

// ============================================================
// Resize
// ============================================================
function resizeCanvas() {
  const container = canvas.parentElement;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}

// ============================================================
// Default Zahnräder
// ============================================================
function seedDefaults() {
  const g1 = new Gear({ teeth: 40, module: 1.5, x: 100, y: 90, label: "Antrieb" });
  g1.isDriver = true;

  const g2 = new Gear({ teeth: 20, module: 1.5, x: 145, y: 90, label: "Abtrieb" });

  gears.push(g1, g2);
  snapGear(g2, gears);
  recalc();
}

// ============================================================
// Add gear
// ============================================================
function addGear(gear) {
  gears.push(gear);
  if (gears.length === 1) gear.isDriver = true;
  selectedId = gear.id;
  recalc();
  refreshRight();
}

// ============================================================
// Recalc connections + RPMs
// ============================================================
function recalc() {
  connections = autoConnect(gears);
  const result = propagateRpm(gears, connections, driverRpm);
  totalRatio = result.totalRatio;
}

// ============================================================
// Refresh right sidebar
// ============================================================
function refreshRight() {
  const sel = gears.find(g => g.id === selectedId) || null;
  renderRightSidebar(document.getElementById("rightSidebar"), sel, gears, {
    onSelect: (id) => { selectedId = id; refreshRight(); },
    onLabel: (id, label) => {
      const g = gears.find(gi => gi.id === id);
      if (g) g.label = label;
      refreshRight();
    },
    onMakeDriver: (id) => {
      gears.forEach(g => g.isDriver = (g.id === id));
      recalc();
      refreshRight();
    },
    onDelete: (id) => {
      gears = gears.filter(g => g.id !== id);
      if (selectedId === id) selectedId = null;
      recalc();
      refreshRight();
    },
  });
}

// ============================================================
// Canvas → World coords
// ============================================================
function screenToWorld(sx, sy) {
  return {
    x: (sx - panX) / scale,
    y: (sy - panY) / scale,
  };
}

function worldToScreen(wx, wy) {
  return {
    x: wx * scale + panX,
    y: wy * scale + panY,
  };
}

// ============================================================
// Mouse
// ============================================================
function hitTest(sx, sy) {
  const w = screenToWorld(sx, sy);
  for (let i = gears.length - 1; i >= 0; i--) {
    const g = gears[i];
    const dx = w.x - g.x;
    const dy = w.y - g.y;
    if (dx * dx + dy * dy <= g.oRadius * g.oRadius) return g;
  }
  return null;
}

function onMouseDown(e) {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;

  if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
    // Pan
    isPanning = true;
    panStartX = e.clientX - panX;
    panStartY = e.clientY - panY;
    canvas.style.cursor = "grabbing";
    return;
  }

  const gear = hitTest(sx, sy);
  if (gear) {
    selectedId = gear.id;
    dragging = gear.id;
    const w = screenToWorld(sx, sy);
    dragOffX = w.x - gear.x;
    dragOffY = w.y - gear.y;
    canvas.style.cursor = "grabbing";
  } else {
    selectedId = null;
  }
  refreshRight();
}

function onMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;

  if (isPanning) {
    panX = e.clientX - panStartX;
    panY = e.clientY - panStartY;
    return;
  }

  if (dragging) {
    const w = screenToWorld(sx, sy);
    const g = gears.find(gi => gi.id === dragging);
    if (g) {
      g.x = w.x - dragOffX;
      g.y = w.y - dragOffY;
    }
    return;
  }

  // Hover
  const gear = hitTest(sx, sy);
  hoveredId = gear ? gear.id : null;
  canvas.style.cursor = gear ? "grab" : "default";
}

function onMouseUp() {
  if (isPanning) {
    isPanning = false;
    canvas.style.cursor = "default";
    return;
  }

  if (dragging) {
    const g = gears.find(gi => gi.id === dragging);
    if (g) {
      snapGear(g, gears);
    }
    dragging = null;
    canvas.style.cursor = "default";
    recalc();
    refreshRight();
  }
}

function onWheel(e) {
  e.preventDefault();

  if (manualMode) {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    manualRotate(gears, connections, delta);
    return;
  }

  // Zoom
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const oldScale = scale;
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  scale = Math.max(0.5, Math.min(10, scale * zoomFactor));

  // Zoom toward cursor
  panX = mx - (mx - panX) * (scale / oldScale);
  panY = my - (my - panY) * (scale / oldScale);
}

function onDblClick(e) {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const gear = hitTest(sx, sy);
  if (gear) {
    gears.forEach(g => g.isDriver = false);
    gear.isDriver = true;
    recalc();
    refreshRight();
  }
}

// ============================================================
// Render Loop
// ============================================================
function loop(time) {
  const dt = lastTime ? (time - lastTime) / 1000 : 0;
  lastTime = time;

  // FPS
  frameCount++;
  fpsTimer += dt;
  if (fpsTimer >= 1) {
    fps = frameCount;
    frameCount = 0;
    fpsTimer = 0;
  }

  // Simulation step
  if (simRunning) {
    stepRotation(gears, connections, driverRpm, dt);
    propagateRpm(gears, connections, driverRpm);
  }

  // ---- Draw ----
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, w, h);

  // Apply world transform: translate + scale
  ctx.save();
  ctx.translate(panX, panY);
  ctx.scale(scale, scale);

  // Calculate visible world bounds
  const worldMinX = -panX / scale;
  const worldMinY = -panY / scale;
  const worldMaxX = (w - panX) / scale;
  const worldMaxY = (h - panY) / scale;

  // Grid
  drawGrid(ctx, worldMinX, worldMinY, worldMaxX, worldMaxY, scale);

  // Print bed (centered at world origin 100,100 so default gears sit on it)
  if (showBed) {
    drawPrintBed(ctx, 100, 100, scale);
  }

  // Connections
  for (const conn of connections) {
    const a = gears.find(g => g.id === conn.from);
    const b = gears.find(g => g.id === conn.to);
    if (a && b) drawConnection(ctx, a, b, scale);
  }

  // Snap preview
  if (dragging) {
    const dg = gears.find(g => g.id === dragging);
    if (dg) drawSnapPreview(ctx, dg, gears, scale);
  }

  // Gears
  for (const gear of gears) {
    const isSelected = gear.id === selectedId;
    const isHover = gear.id === hoveredId;
    drawGear(ctx, gear, scale, isSelected, isHover);
  }

  ctx.restore();

  // ---- Gauge ----
  const gw = gaugeCanvas.width;
  const gh = gaugeCanvas.height;
  gaugeCtx.fillStyle = "#1a1a2e";
  gaugeCtx.fillRect(0, 0, gw, gh);

  // Find last gear in chain (non-driver with rpm)
  const gaugeGear = gears.filter(g => !g.isDriver && Math.abs(g.rpm) > 0.001).pop() || gears.find(g => g.isDriver);
  const pct = gaugeGear ? calcPercent(gaugeGear) : 0;
  drawGauge(gaugeCtx, gw / 2, gh / 2 - 10, Math.min(gw, gh) / 2 - 30, pct, gaugeGear ? gaugeGear.label || gaugeGear.id : "–");

  // Info bar
  renderInfoBar(document.getElementById("infoBar"), totalRatio, gears.length, fps);

  requestAnimationFrame(loop);
}

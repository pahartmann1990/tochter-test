// ============================================================
// ui.js — Sidebar, Gauge, Dialoge, Event-Binding
// ============================================================

import { MODULE_OPTIONS, DEFAULT_MODULE, Gear, outerRadius, PRINT_BED_MM } from "./gear.js";

// ============================================================
// LEFT SIDEBAR: Zahnrad erstellen
// ============================================================
export function initLeftSidebar(container, onAdd) {
  container.innerHTML = `
    <div class="panel-section">
      <h3>⚙ Zahnrad erstellen</h3>

      <label class="field-label">Typ</label>
      <select id="newType" class="field-select">
        <option value="simple">Einfaches Zahnrad</option>
        <option value="compound">Kombi-Zahnrad</option>
      </select>

      <label class="field-label">Zähne: <span id="teethVal">20</span></label>
      <input type="range" id="newTeeth" min="8" max="120" value="20" class="field-range" />

      <label class="field-label">Modul</label>
      <div id="moduleBtns" class="module-btns"></div>

      <div id="compoundRow" class="hidden">
        <label class="field-label" style="color:#ffd93d">2. Zahnrad: <span id="compVal">10</span> Z</label>
        <input type="range" id="compTeeth" min="8" max="120" value="10" class="field-range" />
      </div>

      <label class="field-label">Bezeichnung</label>
      <input type="text" id="newLabel" class="field-input" placeholder="z.B. Antrieb" />

      <div id="sizeHint" class="size-hint"></div>

      <button id="btnAdd" class="btn-primary">+ Hinzufügen</button>
    </div>

    <div class="panel-section">
      <h3>▶ Simulation</h3>

      <label class="field-label">Antrieb RPM: <span id="rpmVal">10</span></label>
      <input type="range" id="rpmSlider" min="1" max="60" value="10" class="field-range" />

      <div class="btn-row">
        <button id="btnPlay" class="btn-accent">▶ Start</button>
        <button id="btnReset" class="btn-ghost">↺ Reset</button>
      </div>

      <label class="field-label" style="margin-top:8px">
        <input type="checkbox" id="chkManual" /> Manuell drehen (Mausrad)
      </label>
    </div>

    <div class="panel-section">
      <h3>⚡ Optionen</h3>
      <label class="field-label">
        <input type="checkbox" id="chkBed" checked /> 200×200 Druckbett
      </label>
      <button id="btnExport" class="btn-ghost" style="width:100%;margin-top:6px">📋 JSON Export</button>
    </div>
  `;

  // Modul-Buttons
  const moduleBtns = container.querySelector("#moduleBtns");
  let selectedModule = DEFAULT_MODULE;
  MODULE_OPTIONS.forEach(m => {
    const btn = document.createElement("button");
    btn.textContent = m;
    btn.className = "mod-btn" + (m === selectedModule ? " active" : "");
    btn.addEventListener("click", () => {
      selectedModule = m;
      moduleBtns.querySelectorAll(".mod-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updateHint();
    });
    moduleBtns.appendChild(btn);
  });

  const teethSlider = container.querySelector("#newTeeth");
  const teethVal = container.querySelector("#teethVal");
  const typeSelect = container.querySelector("#newType");
  const compRow = container.querySelector("#compoundRow");
  const compSlider = container.querySelector("#compTeeth");
  const compVal = container.querySelector("#compVal");
  const sizeHint = container.querySelector("#sizeHint");
  const labelInput = container.querySelector("#newLabel");

  function updateHint() {
    const t = +teethSlider.value;
    const d = outerRadius(t, selectedModule) * 2;
    const ok = d <= PRINT_BED_MM;
    sizeHint.innerHTML = `⌀ ${d.toFixed(1)} mm ${ok ? "✓" : '<span style="color:#e94560">⚠ zu groß!</span>'}`;
  }

  teethSlider.addEventListener("input", () => {
    teethVal.textContent = teethSlider.value;
    updateHint();
  });

  typeSelect.addEventListener("change", () => {
    compRow.classList.toggle("hidden", typeSelect.value !== "compound");
  });

  compSlider.addEventListener("input", () => {
    compVal.textContent = compSlider.value;
  });

  updateHint();

  // Add
  container.querySelector("#btnAdd").addEventListener("click", () => {
    const gear = new Gear({
      teeth: +teethSlider.value,
      module: selectedModule,
      x: 120 + Math.random() * 60,
      y: 120 + Math.random() * 60,
      type: typeSelect.value,
      label: labelInput.value.trim(),
    });
    if (typeSelect.value === "compound") {
      gear.compoundTeeth = +compSlider.value;
    }
    labelInput.value = "";
    onAdd(gear);
  });

  // Expose controls
  return {
    getRpmSlider: () => container.querySelector("#rpmSlider"),
    getRpmVal: () => container.querySelector("#rpmVal"),
    getBtnPlay: () => container.querySelector("#btnPlay"),
    getBtnReset: () => container.querySelector("#btnReset"),
    getChkManual: () => container.querySelector("#chkManual"),
    getChkBed: () => container.querySelector("#chkBed"),
    getBtnExport: () => container.querySelector("#btnExport"),
  };
}

// ============================================================
// RIGHT SIDEBAR: Eigenschaften
// ============================================================
export function renderRightSidebar(container, gear, gears, callbacks) {
  if (!gear) {
    container.innerHTML = `
      <div class="panel-section">
        <h3>📋 Eigenschaften</h3>
        <p class="hint">Zahnrad auswählen…</p>
      </div>
      <div class="panel-section">
        <h3>Zahnräder (${gears.length})</h3>
        ${gears.map(g => `
          <div class="gear-list-item ${g.isDriver ? 'driver' : ''}" data-id="${g.id}">
            <span>${g.isDriver ? "⚡" : "⚙"} ${g.label || g.id}</span>
            <span class="dim">${g.teeth}Z</span>
          </div>
        `).join("")}
      </div>
    `;
    container.querySelectorAll(".gear-list-item").forEach(el => {
      el.addEventListener("click", () => callbacks.onSelect(el.dataset.id));
    });
    return;
  }

  const g = gear;
  container.innerHTML = `
    <div class="panel-section">
      <h3>📋 ${g.label || g.id}</h3>
      <table class="prop-table">
        <tr><td class="dim">Typ</td><td>${g.type === "simple" ? "Einfach" : "Kombi"}</td></tr>
        <tr><td class="dim">Zähne</td><td>${g.teeth}</td></tr>
        ${g.type === "compound" ? `<tr><td class="dim">Kombi-Z</td><td>${g.compoundTeeth}</td></tr>` : ""}
        <tr><td class="dim">Modul</td><td>${g.module}</td></tr>
        <tr><td class="dim">⌀ Teilkreis</td><td>${g.diameter.toFixed(1)} mm</td></tr>
        <tr><td class="dim">⌀ Außen</td><td>${(g.oRadius * 2).toFixed(1)} mm</td></tr>
        <tr><td class="dim">Druckbar</td><td>${g.fitsOnPrintBed() ? "✓ Ja" : "⚠ Nein"}</td></tr>
        <tr><td class="dim">RPM</td><td style="color:#e94560;font-weight:bold">${g.rpm.toFixed(2)}</td></tr>
        <tr><td class="dim">Antrieb</td><td>${g.isDriver ? "⚡ Ja" : "Nein"}</td></tr>
        <tr><td class="dim">Verbindungen</td><td>${g.connections.length}</td></tr>
      </table>

      <label class="field-label" style="margin-top:8px">Bezeichnung</label>
      <input type="text" id="editLabel" class="field-input" value="${g.label || ""}" />

      <div class="btn-row" style="margin-top:8px">
        <button id="btnMakeDriver" class="btn-accent" style="flex:1">⚡ Antrieb</button>
        <button id="btnDelete" class="btn-danger" style="flex:1">🗑 Löschen</button>
      </div>
    </div>

    <div class="panel-section">
      <h3>Zahnräder (${gears.length})</h3>
      ${gears.map(gi => `
        <div class="gear-list-item ${gi.id === g.id ? 'selected' : ''} ${gi.isDriver ? 'driver' : ''}" data-id="${gi.id}">
          <span>${gi.isDriver ? "⚡" : "⚙"} ${gi.label || gi.id}</span>
          <span class="dim">${gi.teeth}Z · ${Math.abs(gi.rpm).toFixed(1)}rpm</span>
        </div>
      `).join("")}
    </div>
  `;

  container.querySelector("#editLabel").addEventListener("change", (e) => {
    callbacks.onLabel(g.id, e.target.value.trim());
  });
  container.querySelector("#btnMakeDriver").addEventListener("click", () => callbacks.onMakeDriver(g.id));
  container.querySelector("#btnDelete").addEventListener("click", () => callbacks.onDelete(g.id));

  container.querySelectorAll(".gear-list-item").forEach(el => {
    el.addEventListener("click", () => callbacks.onSelect(el.dataset.id));
  });
}

// ============================================================
// GAUGE: Drehscheibe 0–100 %
// ============================================================
export function drawGauge(ctx, cx, cy, radius, percent, label) {
  ctx.save();

  // Hintergrund
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#16213e";
  ctx.fill();
  ctx.strokeStyle = "#0f3460";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Skala
  for (let i = 0; i <= 100; i += 5) {
    const a = ((i / 100) * 360 - 90) * (Math.PI / 180);
    const isMajor = i % 10 === 0;
    const r1 = radius - (isMajor ? 16 : 10);
    const r2 = radius - 4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.strokeStyle = isMajor ? "#eee" : "#445";
    ctx.lineWidth = isMajor ? 1.5 : 0.8;
    ctx.stroke();

    if (isMajor) {
      const tr = radius - 24;
      ctx.fillStyle = "#8892a4";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(i.toString(), cx + Math.cos(a) * tr, cy + Math.sin(a) * tr);
    }
  }

  // Zeiger
  const needleA = ((percent / 100) * 360 - 90) * (Math.PI / 180);
  const needleLen = radius - 28;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(needleA) * needleLen, cy + Math.sin(needleA) * needleLen);
  ctx.strokeStyle = "#e94560";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.stroke();

  // Mittelpunkt
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#e94560";
  ctx.fill();

  // Wert
  ctx.fillStyle = "#eee";
  ctx.font = "bold 16px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(`${percent.toFixed(1)}%`, cx, cy + radius + 22);

  // Label
  if (label) {
    ctx.fillStyle = "#8892a4";
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillText(label, cx, cy + radius + 38);
  }

  ctx.restore();
}

// ============================================================
// EXPORT DIALOG
// ============================================================
export function showExportDialog(data) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const json = JSON.stringify(data, null, 2);

  overlay.innerHTML = `
    <div class="modal">
      <h3 style="color:#e94560;margin:0 0 12px">📋 Zahnrad-Export</h3>
      <pre class="export-pre">${escapeHtml(json)}</pre>
      <div class="modal-hints">
        <p><strong>3D-Druck Hinweise:</strong></p>
        <p>• Modul 1.5+ empfohlen für FDM (0.4 mm Nozzle)</p>
        <p>• Zahnspiel: +0.2 mm Toleranz einplanen</p>
        <p>• Achsbohrung: 8 mm für 608ZZ Kugellager</p>
        <p>• Druckbett-Limit: 200 × 200 mm</p>
      </div>
      <div class="btn-row" style="margin-top:12px">
        <button id="btnCopy" class="btn-accent">📋 Kopieren</button>
        <button id="btnDownload" class="btn-accent">💾 Download</button>
        <button id="btnClose" class="btn-ghost">Schließen</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector("#btnCopy").addEventListener("click", () => {
    navigator.clipboard.writeText(json).then(() => {
      overlay.querySelector("#btnCopy").textContent = "✓ Kopiert!";
    });
  });

  overlay.querySelector("#btnDownload").addEventListener("click", () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zahnrad-projekt.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  overlay.querySelector("#btnClose").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ============================================================
// GRID + DRUCKBETT (drawn in world-space; canvas is already transformed)
// ============================================================
export function drawGrid(ctx, worldMinX, worldMinY, worldMaxX, worldMaxY, currentScale) {
  const step = 20; // 20 mm grid
  const startX = Math.floor(worldMinX / step) * step;
  const startY = Math.floor(worldMinY / step) * step;

  ctx.strokeStyle = "#1e2d4a";
  ctx.lineWidth = 0.5 / currentScale;

  for (let x = startX; x <= worldMaxX; x += step) {
    ctx.beginPath(); ctx.moveTo(x, worldMinY); ctx.lineTo(x, worldMaxY); ctx.stroke();
  }
  for (let y = startY; y <= worldMaxY; y += step) {
    ctx.beginPath(); ctx.moveTo(worldMinX, y); ctx.lineTo(worldMaxX, y); ctx.stroke();
  }
}

export function drawPrintBed(ctx, centerX, centerY, currentScale) {
  const half = PRINT_BED_MM / 2;
  ctx.save();
  ctx.strokeStyle = "rgba(74,158,255,0.25)";
  ctx.lineWidth = 1 / currentScale;
  ctx.setLineDash([6 / currentScale, 3 / currentScale]);
  ctx.strokeRect(centerX - half, centerY - half, PRINT_BED_MM, PRINT_BED_MM);
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(74,158,255,0.06)";
  ctx.fillRect(centerX - half, centerY - half, PRINT_BED_MM, PRINT_BED_MM);

  ctx.fillStyle = "rgba(74,158,255,0.4)";
  const fs = 10 / currentScale;
  ctx.font = `${fs}px 'JetBrains Mono', monospace`;
  ctx.textAlign = "center";
  ctx.fillText("200 × 200 mm Druckbett", centerX, centerY - half - 4 / currentScale);
  ctx.restore();
}

// ============================================================
// INFO-BAR (untere Statuszeile)
// ============================================================
export function renderInfoBar(container, totalRatio, gearCount, fps) {
  container.innerHTML = `
    <span>Zahnräder: <strong>${gearCount}</strong></span>
    <span>Übersetzung: <strong style="color:#ffd93d">${totalRatio || "–"}</strong></span>
    <span class="dim">${fps} FPS</span>
  `;
}

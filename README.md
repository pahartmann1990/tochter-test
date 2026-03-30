# ⚙ Zahnrad-Simulation

> Interaktive 2D-Simulation für mechanische Zahnradsysteme — speziell für den **Kohlenhydrat-Rechner** (3D-Druck-Projekt, 200 × 200 mm Druckbett).

---

## Funktionen

| Feature | Beschreibung |
|---------|-------------|
| **Zahnrad erstellen** | Zähne (8–120), Modul (1.0 – 2.5), einfach oder Kombi |
| **Drag & Drop** | Zahnräder frei auf der Arbeitsfläche positionieren |
| **Snap-Funktion** | Automatisches Einrasten bei korrektem Achsabstand |
| **Simulation** | Automatisch (RPM einstellbar) oder manuell (Mausrad) |
| **Übersetzung** | Automatische Berechnung: `RPM_B = RPM_A × (Z_A / Z_B)` |
| **Drehrichtung** | Wird bei kämmenden Zahnrädern korrekt umgekehrt |
| **Prozent-Gauge** | 0–100 % Drehscheibe (1 Umdrehung = 100 %) |
| **Kombi-Zahnrad** | Zwei Zahnräder auf einer Achse (Compound Gear) |
| **JSON Export** | Komplette Teileliste mit Maßen + Kopieren/Download |
| **Druckbett-Anzeige** | 200 × 200 mm Rahmen als Referenz |
| **Zoom + Pan** | Mausrad = Zoom, Shift+Drag = Pan |

---

## Starten (lokal)

### Option A: Einfacher HTTP-Server

```bash
cd gear-simulator/src
python3 -m http.server 8080
```

Dann öffne: **http://localhost:8080**

### Option B: Node.js

```bash
npx serve gear-simulator/src
```

### Option C: VS Code

Installiere die Extension **Live Server** und öffne `src/index.html`.

> **Hinweis:** Die App verwendet ES-Module (`import/export`). Das Öffnen der HTML-Datei direkt im Browser (file://) funktioniert **nicht** — ein lokaler Server ist nötig.

---

## Bedienung

| Aktion | Eingabe |
|--------|---------|
| Zahnrad auswählen | Klick |
| Zahnrad verschieben | Drag |
| Antrieb setzen | Doppelklick oder Button |
| Zoomen | Mausrad |
| Pan (verschieben) | Shift + Drag |
| Manuell drehen | Checkbox aktivieren → Mausrad |
| Löschen | Zahnrad auswählen → 🗑 Button |

---

## Berechnungen

### Teilkreisdurchmesser

```
d = Z × m
```

- `Z` = Anzahl Zähne
- `m` = Modul (mm)

### Außendurchmesser

```
d_a = d + 2 × m
```

### Übersetzungsverhältnis

```
i = Z_Antrieb / Z_Abtrieb
RPM_Abtrieb = RPM_Antrieb × i
```

Bei kämmenden Zahnrädern kehrt sich die Drehrichtung um.

### Kombi-Zahnrad (Compound)

Zwei Zahnräder auf einer Achse drehen mit gleicher Drehzahl. Das kleinere Zahnrad kämmt mit dem nächsten in der Kette:

```
RPM_C = RPM_B × (Z_B_compound / Z_C)
```

### Prozentanzeige

```
Prozent = (Winkel_rad / 2π) × 100
```

1 volle Umdrehung = 100 %

---

## Dateistruktur

```
gear-simulator/
├── src/
│   ├── index.html        ← Hauptseite
│   ├── style.css         ← Styling
│   ├── app.js            ← Hauptlogik, Render-Loop
│   ├── gear.js           ← Zahnrad-Klasse, Zeichenfunktionen
│   ├── simulation.js     ← Physik: Verbindungen, RPM, Export
│   └── ui.js             ← Sidebar, Gauge, Dialoge
├── assets/               ← (Platzhalter für Icons etc.)
└── README.md             ← Diese Datei
```

---

## JSON Export Format

```json
{
  "project": "Zahnrad-Simulation",
  "timestamp": "2026-03-30T...",
  "print_bed_mm": 200,
  "total_ratio": "2.00 : 1",
  "used_modules": [1.5],
  "gears": [
    {
      "id": "gear_1",
      "type": "Einfach",
      "teeth": 40,
      "module": 1.5,
      "diameter_mm": 60,
      "outer_diameter_mm": 63,
      "position": { "x": 100, "y": 90 },
      "rpm": 10,
      "is_driver": true,
      "connections": ["gear_2"],
      "label": "Antrieb"
    }
  ],
  "connections": [
    { "from": "gear_1", "to": "gear_2", "type": "mesh" }
  ]
}
```

---

## 3D-Druck Hinweise

| Parameter | Empfehlung |
|-----------|-----------|
| Modul | ≥ 1.5 mm für FDM (0.4 mm Nozzle) |
| Zahnspiel | + 0.2 mm Toleranz |
| Achsbohrung | 8 mm (608ZZ Skateboard-Kugellager) |
| Druckbett | max. 200 × 200 mm |
| Magnete | 6 × 3 mm Neodym für Steckverbindung |
| Material | PLA oder PETG |

---

## Lizenz

MIT — frei verwendbar.

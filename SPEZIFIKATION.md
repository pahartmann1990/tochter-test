# Kohlenhydrat-Rechner — Mechanisches Zahnradsystem

## Zweck
Ein mechanischer Rechner für ein Kind mit Diabetes.
Das Kind dreht eine Eingabe-Scheibe auf das Gewicht eines Lebensmittels (z.B. 150g).
Über ein austauschbares Zahnrad (Faktor) wird automatisch der Kohlenhydrat-Wert berechnet.
Eine Ausgangs-Scheibe zeigt das Ergebnis (z.B. 63g KH).

Formel: **KH (g) = Gewicht (g) × Faktor / 100**

Beispiel: 150g Nudeln × 42/100 = 63g KH

---

## Kugellager
Überall wird das **623ZZ** Kugellager verwendet:
- Innendurchmesser: 3 mm
- Außendurchmesser: 10 mm
- Breite: 4 mm
- Alle Achsen: 3 mm Stahl oder M3-Schraube
- Alle Lagersitze in Gehäuse/Platten: 10 mm Bohrung

---

## Modul
Alle Zahnräder: **Modul 1.0**
Eingriffswinkel: 20°
3D-Druck, Druckbett 200 × 200 mm

---

## TEIL 1: Das Compound-Planeten-Differential (Addierer)

### Funktion
Das Differential hat **2 Eingänge** und **1 Ausgang**.
Es addiert die Drehbewegungen der beiden Eingänge.

Eingang 1: Hohlrad R1 (von außen angetrieben)
Eingang 2: Bodenplatte/Planetenträger (von unten angetrieben)
Ausgang: Hohlrad R2 → Abnehmer-Zahnrad

### Mathematik
```
k = (R1_innen × P2) / (R2_innen × P1)
k = (75 × 10) / (60 × 25) = 0.5

ω_R2 = 0.5 × ω_R1 + 0.5 × ω_Bodenplatte

Nach 2:1 Korrektur (Abnehmer):
ω_Ergebnis = ω_R1 + ω_Bodenplatte = echte Addition!
```

### Aufbau (von unten nach oben)

```
Ebene 1 (ganz unten):  Bodenplatten-Zahnrad (100Z Stirnrad)
Ebene 2:               Bodenplatte (Trägerscheibe mit 3 Achsen)
Ebene 3:               R1 (Eingangs-Hohlrad) + 3× P1 (Planeten unten)
Ebene 4:               R2 (Ausgangs-Hohlrad) + 3× P2 (Planeten oben)
Ebene 5 (ganz oben):   Abnehmer (40Z, kämmt mit R2-Außen)
```

---

## TEIL 2: Einzelne Zahnräder

### R1 — Eingangs-Hohlrad (INNEN + AUSSEN verzahnt)

| Parameter | Wert |
|---|---|
| **Innenverzahnung** | |
| Zähne innen | 75Z |
| Teilkreis-d | 75.0 mm |
| Kopfkreis-d (nach innen) | 73.0 mm |
| Fußkreis-d (nach außen) | 77.5 mm |
| **Außenverzahnung** | |
| Zähne außen | 100Z |
| Teilkreis-d | 100.0 mm |
| Kopfkreis-d | 102.0 mm |
| Fußkreis-d | 97.5 mm |
| **Allgemein** | |
| Wandstärke (Innen→Außen) | (97.5 - 77.5) / 2 = 10.0 mm |
| Bohrung Zentrum | 10 mm (623ZZ Lagersitz) |
| Breite | 8 mm |
| Modul | 1.0 |

**Funktion:** Eingang 1 des Differentials. Die Innenverzahnung (75Z) kämmt mit den Planeten P1. Die Außenverzahnung (100Z) wird vom Faktor-Zahnrad (Zehner-Stelle) angetrieben. Das gleiche 100Z-Referenz-Zahnrad wird auch bei der Bodenplatte verwendet, damit die gleichen steckbaren Zahnräder auf beide Eingänge passen.

---

### R2 — Ausgangs-Hohlrad (INNEN + AUSSEN verzahnt)

| Parameter | Wert |
|---|---|
| **Innenverzahnung** | |
| Zähne innen | 60Z |
| Teilkreis-d | 60.0 mm |
| Kopfkreis-d (nach innen) | 58.0 mm |
| Fußkreis-d (nach außen) | 62.5 mm |
| **Außenverzahnung** | |
| Zähne außen | 80Z |
| Teilkreis-d | 80.0 mm |
| Kopfkreis-d | 82.0 mm |
| Fußkreis-d | 77.5 mm |
| **Allgemein** | |
| Wandstärke | (77.5 - 62.5) / 2 = 7.5 mm |
| Bohrung Zentrum | 10 mm (623ZZ) |
| Breite | 8 mm |
| Modul | 1.0 |

**Funktion:** Ausgang des Differentials. Die Innenverzahnung (60Z) kämmt mit den Planeten P2. Die Außenverzahnung (80Z) kämmt mit dem Abnehmer (40Z). Das Verhältnis 80:40 = 2:1 ist die Korrektur für k=0.5.

---

### P1 — Planet unten (3 Stück)

| Parameter | Wert |
|---|---|
| Zähne | 25Z |
| Teilkreis-d | 25.0 mm |
| Kopfkreis-d | 27.0 mm |
| Fußkreis-d | 22.5 mm |
| Bohrung | 3 mm (623ZZ Achse) |
| Breite | 4 mm |
| Modul | 1.0 |

**Funktion:** Kämmt mit R1-Innenverzahnung (75Z). Sitzt auf gleicher Achse wie P2 (fest verbunden = Compound-Planet). 3 Stück bei 120° Abstand.

---

### P2 — Planet oben (3 Stück)

| Parameter | Wert |
|---|---|
| Zähne | 10Z |
| Teilkreis-d | 10.0 mm |
| Kopfkreis-d | 12.0 mm |
| Fußkreis-d | 7.5 mm |
| Bohrung | 3 mm (623ZZ) |
| Breite | 4 mm |
| Modul | 1.0 |

**Funktion:** Kämmt mit R2-Innenverzahnung (60Z). Gleiche Achse wie P1 — MUSS fest verbunden sein (ein Druckteil oder verklebt). 3 Stück.

---

### Compound-Planet (P1 + P2 zusammen)

| Parameter | Wert |
|---|---|
| Gesamthöhe | 9 mm (4mm P1 + 1mm Abstand + 4mm P2) |
| Unterer Kranz (P1) | 25Z, d=27mm |
| Oberer Kranz (P2) | 10Z, d=12mm |
| Bohrung durchgehend | 3 mm |
| Achsabstand vom Zentrum | 25.0 mm |

**Geometrie-Beweis:**
- Untere Ebene: (R1_innen - P1) / 2 = (75 - 25) / 2 = 25 ✓
- Obere Ebene: (R2_innen - P2) / 2 = (60 - 10) / 2 = 25 ✓
- Beide gleich → Achsabstand passt!

---

### Bodenplatte (Planetenträger)

| Parameter | Wert |
|---|---|
| Außendurchmesser | 72 mm |
| Dicke | 6 mm |
| Zentralbohrung | 3 mm (623ZZ Achse) |
| Lagersitz Zentrum | 10 mm |
| 3× Planeten-Achsbohrungen | je 3 mm (623ZZ) |
| Achsabstand Mitte→Planet | 25.0 mm |

Achspositionen vom Zentrum:
- Planet 1: x=25.0, y=0.0 mm (0°)
- Planet 2: x=-12.5, y=21.7 mm (120°)
- Planet 3: x=-12.5, y=-21.7 mm (240°)

---

### Bodenplatten-Zahnrad (100Z, sitzt UNTER der Bodenplatte)

| Parameter | Wert |
|---|---|
| Zähne | 100Z |
| Teilkreis-d | 100.0 mm |
| Kopfkreis-d | 102.0 mm |
| Fußkreis-d | 97.5 mm |
| Bohrung | 3 mm (623ZZ) |
| Breite | 6 mm |
| Modul | 1.0 |

**Funktion:** Eingang 2 des Differentials. Fest mit der Bodenplatte verbunden. Wird vom Faktor-Zahnrad (Einer-Stelle) angetrieben. Hat 100Z damit die gleichen steckbaren Zahnräder passen wie bei R1-Außen.

---

### Abnehmer (Korrektur + Ausgang)

| Parameter | Wert |
|---|---|
| Zähne | 40Z |
| Teilkreis-d | 40.0 mm |
| Kopfkreis-d | 42.0 mm |
| Fußkreis-d | 37.5 mm |
| Bohrung | 3 mm (623ZZ) |
| Breite | 8 mm |
| Modul | 1.0 |

**Funktion:** Kämmt mit R2-Außenverzahnung (80Z). Übersetzung 80:40 = 2:1 — das ist die Korrektur für k=0.5. Dieser Abnehmer liefert die korrigierte Summe (echte Addition). Von hier geht es weiter zur Ergebnis-Anzeige oder zur nächsten Stufe.

Achsabstand R2-Mitte → Abnehmer-Mitte: (80+40)/2 × 0.5 = 60.0 mm

---

## TEIL 3: Steckbare Faktor-Zahnräder

Es gibt 9 verschiedene Zahnräder (Wert 1-9). Jedes kämmt mit einem 100Z-Rad (entweder R1-Außen oder Bodenplatte).

Pro KH-Wert werden 2 Stück benötigt: eines für die Zehnerstelle, eines für die Einerstelle.

Die Zahnräder sind identisch — die Position bestimmt den Stellenwert.

| Wert | Verhältnis | Zähne | Teilkreis-d | Kopfkreis-d | Achsabstand zu 100Z |
|---|---|---|---|---|---|
| 1 | 1:10 | 10Z | 10 mm | 12 mm | 55.0 mm |
| 2 | 1:5 | 20Z | 20 mm | 22 mm | 60.0 mm |
| 3 | 3:10 | 30Z | 30 mm | 32 mm | 65.0 mm |
| 4 | 2:5 | 40Z | 40 mm | 42 mm | 70.0 mm |
| 5 | 1:2 | 50Z | 50 mm | 52 mm | 75.0 mm |
| 6 | 3:5 | 60Z | 60 mm | 62 mm | 80.0 mm |
| 7 | 7:10 | 70Z | 70 mm | 72 mm | 85.0 mm |
| 8 | 4:5 | 80Z | 80 mm | 82 mm | 90.0 mm |
| 9 | 9:10 | 90Z | 90 mm | 92 mm | 95.0 mm |

Alle: Modul 1.0, Bohrung 3mm (623ZZ), Breite 6mm.

---

## TEIL 4: Vereinfachte Variante (Zwei-Scheiben-Anzeige)

### Neueste Idee
Statt dem komplexen 3-stufigen Differential eine einfachere Lösung:

Zwei Anzeige-Scheiben (Drehscheiben mit Gramm-Skala am Rand).
Der Faktor zwischen den Scheiben bestimmt die Übersetzung.

```
Eingangs-Scheibe ──→ Faktor-Zahnrad (steckbar) ──→ Ausgangs-Scheibe
  "150g"               z.B. 42:100                    "63g KH"
  dreht schneller                                     dreht langsamer
```

Die Eingangs-Scheibe hat eine Skala 0-100g pro Umdrehung.
Die Ausgangs-Scheibe zeigt den KH-Wert.

### Vorhandener Aufbau
Ein 10Z-Zahnrad ist fest an der Grundplatte.
Über ein 50Z-Koppler-Zahnrad ist ein 100Z-Zahnrad am anderen Eingang angeschlossen.
Rechts und links vom 50er können verschiedene Faktor-Zahnräder eingesteckt werden.

---

## TEIL 5: Rechenbeispiele (Verifizierung)

### Beispiel 1: 150g × 42% = 63g KH
```
Zehner-Faktor "4" (40Z) auf R1-Außen (100Z): Verhältnis 40:100 = 0.4
Einer-Faktor "2" (20Z) auf Bodenplatte (100Z): Verhältnis 20:100 = 0.2

Hunderter-Stellrad auf 1: 
  → R1 dreht 1× → durch Differential + Korrektur → 1 am Ausgang
  → × Faktor → 0.42 × 100 = 42

Zehner-Stellrad auf 5:
  → R1 dreht 5× → × Faktor → 0.42 × 50 = 21

Summe: 42 + 21 = 63g KH ✓
```

### Beispiel 2: 200g × 72% = 144g KH
```
Faktor "7" + "2"
Hunderter=2: 0.72 × 200 = 144g KH ✓
```

### Beispiel 3: 80g × 57% = 45.6g KH
```
Faktor "5" + "7"
Zehner=8: 0.57 × 80 = 45.6g KH ✓
```

---

## TEIL 6: Stückliste komplett

| Teil | Anzahl | Zähne | Kopfkreis-d | Typ |
|---|---|---|---|---|
| R1 Eingangs-Hohlrad | 1x | 75Z innen / 100Z außen | 73/102 mm | Innen+Außen |
| R2 Ausgangs-Hohlrad | 1x | 60Z innen / 80Z außen | 58/82 mm | Innen+Außen |
| Compound-Planet P1+P2 | 3x | 25Z / 10Z | 27/12 mm | Doppel-Stirnrad |
| Bodenplatte | 1x | — | 72 mm | Träger mit 3 Achsen |
| Bodenplatten-Zahnrad | 1x | 100Z | 102 mm | Stirnrad |
| Abnehmer | 1x | 40Z | 42 mm | Stirnrad |
| Faktor-Zahnräder | 18x | 10-90Z | 12-92 mm | Steckbar |
| 623ZZ Kugellager | ~12x | — | 10 mm | Standard |
| 3mm Achsen | ~8x | — | 3 mm | Stahl/M3 |

Gesamte Druckteile: ca. 27 Stück
Alle Zahnräder: Modul 1.0, Eingriffswinkel 20°

# 🚀 Arbeitstitel: „VOIDHAVEN" – Konzeptdokument

> **Elevator Pitch:** Ein Weltraum-Sandbox-Spiel, bei dem du dein Schiff von außen Block für Block
> baust und es von innen als lebendige Kolonie führst. Außen: Bauen, Fliegen, Bergbau, Gefechte, Handel.
> Innen: Stockwerke, Räume, Crew aus Menschen und Robotern mit Bedürfnissen – und im Gefecht
> rennen alle an ihre Stationen.

Inspiration (Genre/Mechaniken, keine Kopie): Block-Raumschiffbau im Stil von Weltraum-Sandboxen
+ Kolonie-/Lebenserhaltungssimulation im Stil von Basisbau-Survival-Spielen.

---

## 1. Die zwei (bzw. drei) Ebenen des Spiels

| Ebene | Ansicht | Was du tust |
|---|---|---|
| **Außenbau** | 3D/2D-Raster, Blöcke | Schiffsform, Panzerung, Triebwerke, Reaktoren, Geschütze, Traktorstrahlen, Laderampen, Andockpunkte |
| **Flug / Weltraum** | Freie Kamera | Fliegen, Bergbau, Ressourcen einsammeln, Handel, Kämpfe, Quests |
| **Innenbau** | Seitenansicht (Querschnitt) | Volumen in Stockwerke teilen, Wände, Treppen/Lifte, Räume, Crew-Management |

**Kernidee:** Das Innenvolumen ergibt sich aus dem Außenbau. Mehr Hüllenblöcke = mehr Platz innen.
Panzerblöcke schützen, geben aber keinen Innenraum. Dadurch entsteht ein echter Zielkonflikt:
*Dick gepanzert oder geräumig?*

### Simulations-Detailstufen (Performance-Trick)
- **Du bist innen:** Jede Person wird einzeln simuliert (Laufwege, Bedürfnisse, Arbeitsplätze).
- **Du bist außen / anderes Schiff:** Das Schiff wird *pauschal* berechnet – aus dem Raumlayout
  wird ein Effizienzwert ermittelt (Wegelängen, Raumboni, Crewzahl vs. Arbeitsplätze).
  So können auch NPC-Flotten und Stationen „leben", ohne dass jeder Duplikant berechnet wird.
- **Autopilot / Kapitän:** Ein NPC-Kapitän fliegt das Schiff (Route, Bergbau, Ausweichen), während
  du dich um das Innere kümmerst.

---

## 2. Außenbau (Block-Raumschiff)

### Blocktypen (Grundset)
- **Hülle** (Materialstufen: Eisen → Titan → Verbundwerkstoff → Exotisch) – gibt Innenvolumen
- **Panzerung** – hohe HP, keine Innenfläche
- **Triebwerke** (Haupt- und Manövrierdüsen), **Reaktoren/Generatoren**, **Schildgeneratoren**
- **Traktorstrahl** – Reichweite/Zugkraft steigt mit Anzahl & Qualität
- **Geschütztürme** – brauchen Strom und idealerweise Crew (direkt im Turm oder über Kontrollstation)
- **Frachtraum, Laderampen, Andockklammern, Hangar** (für Drohnen/Shuttles)
- **Werkzeug-Module:** ausklappbare Bohrer (Asteroiden fräsen), Schweiß-/Schneidarme (Wracks zerlegen),
  Bergbau-Laser
- **Effizienz-/Upgrade-Chips** – Slots im Schiff, z. B. „+15 % Schildladung", „−10 % Reaktorhitze"

### Physik/Werte pro Schiff
Masse, Schub, Wendigkeit (Masse & Trägheit), Energiebilanz, Hitze, Strukturintegrität,
Innenvolumen, Lagerkapazität.

---

## 3. Innenbau (Kolonie-Simulation)

### Volumen → Stockwerke
- Aus dem Außenbau ergibt sich ein Innenvolumen (z. B. 18 Zellen).
- Der Spieler teilt es in **Stockwerke** (Raster), die aneinander snappen.
- **Treppen, Leitern, Lifte** verbinden Etagen; Wände, Türen und Schotts unterteilen Bereiche.
- Später: **Druckzonen** – ein Hüllentreffer erzeugt ein Leck, Schotts schließen sich, Sauerstoff entweicht.

### Bereiche & Räume
| Bereich | Funktion |
|---|---|
| Energieerzeugung | Reaktor-Konsole, Batteriebänke, Kühlung |
| Lebenserhaltung | Elektrolyse (Wasser → O₂ + H₂), CO₂-Wäscher, Wasser-Recycling |
| Anbau | Hydroponik (Nahrung + O₂), Algentanks, Pilzfarm |
| Versorgung | Kantine, Küche (Nährstoffpaste → richtiges Essen = Qualität) |
| Lager | Ressourcen, **Drucktanks** (O₂, H₂, Wasser, Nährstoffpaste) |
| Wohnen | Quartiere, Schlafsäle (Platz/Komfort beeinflusst Erholung) |
| Freizeit | Lounge, **Casino**, Fitness, Aussichtsdeck → Zufriedenheit |
| Gefecht | Geschützstationen, Brücke, Schadenskontrolle |
| Forschung | Labor, Triebwerks-Simulator (siehe Kapitel 5) |

**Räume wie im Kolonie-Genre:** Ein Raum gilt als „Quartier", wenn er geschlossen ist und bestimmte
Möbel enthält → Bonus. Optional gibt es **fertige Raum-Module** (Blaupausen) zum direkten Einsetzen.

### Crew: Menschen & Roboter
| | Menschen | Roboter |
|---|---|---|
| Braucht | O₂, Nahrung, Wasser, Schlaf, Zufriedenheit | Strom (Ladestation), Wartung |
| Stärken | Kreativ, Forschung, Moral-Boni | Kein O₂, kein Schlaf, gefahrlos bei Lecks |
| Schwächen | Krank, müde, unzufrieden | Teuer, hackbar (EMP), keine Moral-Boni |

- **Eigenschaften/Traits:** Gärtner, Schütze, Techniker, Genügsam, Nachteule, Frohnatur, Pessimist …
- **Anheuern** auf Stationen, Lohn, Erfahrung/Level.
- **Prioritäten** pro Person (wie Arbeits-Prioritätentabelle): Versorgung, Anbau, Gefecht, Reparatur.
- **Schichtsystem:** Genug Leute = einige schlafen, andere arbeiten.

### Gefechtsalarm (die spannende Verbindung beider Ebenen!)
- Feinde erkannt → **Alarm**. Crew verlässt Arbeitsplätze und läuft zu Geschützstationen / in die Türme.
- **Folge:** Versorgung leidet (Hydroponik steht still, Küche kalt) → du musst abwägen und genug
  Personal einplanen.
- **Laufwege zählen:** Stehen die Geschützstationen weit von den Quartieren weg, dauert es länger,
  bis die Türme besetzt sind. Ein gutes Layout gewinnt Schlachten.
- Unbesetzte Türme feuern langsam (Automatik), besetzte schnell; Schützen-Trait gibt Bonus.

---

## 4. Ressourcen & Wirtschaft
- **Abbau:** Asteroiden zerschießen/anbohren → Erzbrocken → **Traktorstrahl** zieht sie in den Frachtraum.
- **Rohstoffe:** Eisen, Titan, Eis (→ Wasser → O₂/H₂), Kohlenstoff, seltene Kristalle, Exotische Materie.
- **Verarbeitung:** Raffinerie an Bord oder auf Stationen.
- **Stationen:** Handel, Werften, Crew-Anheuern, Quests, Reparatur. Später eigene Stationen gründen.
- **Fraktionen:** Händler, Piraten, Militär, Aliens – mit Ruf-System.

---

## 5. Triebwerks-Labor (das Alleinstellungsmerkmal)

Statt nur fertige Triebwerksblöcke zu kaufen, **konstruiert** man eigene Triebwerke in einem
Voxel-Sandbox-Editor.

### Prinzip
1. **Form** aus Voxeln modellieren (z. B. Hohlkegel, Düse, Brennkammer).
2. **Materialien** pro Voxel bzw. als **Schicht/Beschichtung** zuweisen („Lackieren"):
   z. B. innen gut wärmeleitendes Kupfer, außen hauchdünne hitzeresistente Keramikschicht.
3. **Simulation** berechnet Eigenschaften:
   - Schub, Effizienz (Treibstoff/Strom pro Schub), Hitzeentwicklung, Haltbarkeit, Masse
   - **Boost** und **Hyper-Boost**-Verhalten (Überlastung → Materialien entscheiden, ob es hält)
4. **Spezialeffekte** aus Kombinationen, z. B.:
   - Kegel + supraleitende Spule → Ionenantrieb (sparsam, wenig Schub)
   - Doppelwandig mit Kühlkanal → lange Boost-Dauer
   - Kristallbeschichtung → Hyperboost hinterlässt Plasmaspur (Schaden an Verfolgern)
5. **Baupläne** speichern, teilen, handeln, über Forschung freischalten.

Das gleiche System lässt sich auf **Bergbau-Laser, Bohrer, Schweißarme, Schildgeneratoren** übertragen.

### Vereinfachtes Modell (umsetzbar)
Jedes Material hat Werte: Wärmeleitfähigkeit, Schmelzpunkt, Dichte, Festigkeit, Leitfähigkeit.
Die Form liefert geometrische Kennzahlen (Düsenverhältnis, Wandstärke, Oberfläche).
Formel-basierte „Pseudo-Physik" statt echter Strömungssimulation – nachvollziehbar und spielbar.

---

## 6. Welt, Gegner & Super-Wesen
- **Sektoren** mit steigender Gefahr/Ressourcenqualität Richtung Galaxiezentrum (Story-Ziel).
- **Piraten**, Fraktionen, **Aliens**.
- **Weltraum-Megafauna:**
  - **Weltraumwal** – friedlich, zieht durch Nebel; man kann ihm folgen (er frisst Gaswolken und
    hinterlässt seltene Stoffe).
  - **Weltraumschildkröte** – riesig, langsam. **Auf ihrem Panzer kann man eine Station gründen!**
    Sie ist der Antrieb – kein Triebwerk nötig, aber sie hat eigene **Zufriedenheit**
    (füttern, pflegen, vor Parasiten schützen). Unzufrieden → sie taucht ab oder schüttelt Module ab.
  - Aggressive Arten: Schwarm-Kreaturen, Leviathane, Kristallwesen.

---

## 7. Quests & Story
Hauptstory (Reise ins Zentrum, Geheimnis der Megafauna), Nebenquests auf Stationen,
dynamische Ereignisse (Notrufe, Wracks, Seuchen an Bord, Meuterei bei schlechter Moral).

---

## 8. Modding
- Datengetriebene Inhalte: Blöcke, Module, Materialien, Traits, Gegner als **JSON/YAML**.
- Skript-API (z. B. **Lua**) für Quests, KI, neue Mechaniken.
- Workshop/Ordner-basiertes Mod-Laden, Mod-Ladereihenfolge.
- Im Prototyp schon angelegt: alle Blöcke und Module sind Datentabellen (`BLOCKS`, `MODULES`, `TRAITS`
  in `game.js`) – ein erster Schritt Richtung Mod-Fähigkeit.

---

## 9. Technik-Empfehlung für das „richtige" Spiel
| Option | Pro | Contra |
|---|---|---|
| **Godot 4** (C#/GDScript) | Kostenlos, Open Source, gut für 2D+3D, Modding leicht | 3D-Performance bei sehr großen Voxel-Schiffen braucht Optimierung |
| **Unity** (C#) | Riesiges Ökosystem, Voxel-Assets | Lizenzmodell |
| **Unreal** | Top-Grafik | Hohe Einstiegshürde, schwerer zu modden |

Empfehlung: **Godot 4** – Innenansicht als 2D-Querschnitt, Außen in 3D mit Voxel-Mesh.

---

## 10. Roadmap
1. ✅ **Prototyp (dieser Ordner):** 2D-Browser – Block-Bau, Flug, Bergbau, Traktorstrahl, Station,
   Piraten, Innenraum mit Stockwerken/Liften, Crew (Menschen/Roboter), Bedürfnisse, Gefechtsalarm.
2. Räume mit Wänden/Türen + Raumboni, Prioritäten-Tabelle, Speichern/Laden.
3. Schaden innen (Lecks, Brände), Reparatur-Crew, Schilde, Hitze.
4. Triebwerks-Labor (Voxel-Editor + Materialsimulation).
5. Sektoren, Fraktionen, Quests, Megafauna (Wal, Schildkröten-Station).
6. Umstieg auf Engine (3D außen), Modding-API.

---

## Prototyp spielen
`raumschiff/index.html` im Browser öffnen (keine Installation nötig).

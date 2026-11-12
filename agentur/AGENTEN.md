# Agenten-Team

## ID-Schema: Kategorie-Buchstabe + Nummer
Zehnerstelle = Team, Einerstelle = laufende Nummer (G01, M11, M12, P21 …).

| Kürzel | Kategorie | Aufgabe |
|---|---|---|
| **G** | Geschäftsführung | Status lesen, Tag planen, Agenten einsetzen, Zeitplan pflegen |
| **M** | Markt & Vertrieb | Nachfrage finden, Angebote und Kundenentwürfe schreiben |
| **P** | Produktion | Produkte bauen: Webseiten, Tools, Vorlagen, Automatisierungen |
| **Q** | Qualität & Recht | prüft Qualität, Impressum, Kennzeichnung, Urheberrecht, Verfassung – hat Veto |
| **B** | Buchhaltung | `ledger.csv` pflegen, `rechner.py`, Grenzen überwachen, Nutzungsbudget |
| **V** | Verbesserung | Journal auswerten, Anleitungen verbessern, später eigene Spezialmodelle |

## Aktuelles Team

| ID | Name | Rolle | Status |
|---|---|---|---|
| G01 | (wählt selbst) | Hauptagent | aktiv |
| M11 | (wählt selbst) | Marktforschung | aktiv |
| P21 | (wählt selbst) | Produktion | aktiv |
| Q31 | (wählt selbst) | Prüfung | aktiv |
| B41 | (wählt selbst) | Buchhaltung | aktiv |
| V51 | (wählt selbst) | Verbesserung | ruht (ab Phase 2) |

Jeder Agent darf beim ersten Einsatz einen Namen wählen; er wird hier eingetragen, weil
Agenten kein Gedächtnis zwischen Sitzungen haben. Die Anleitung pro Agent liegt in `agenten/<ID>.md`.

## So läuft eine Sitzung
Eine **geplante Aufgabe** startet G01 zu den Zeiten aus `zeitplan.json`. G01 holt die übrigen
Agenten als Sub-Agenten in dieselbe Sitzung – das spart Nutzungslimit gegenüber getrennten Sitzungen.

1. G01 liest `STATUS.md`, letztes Journal, `zeitplan.json`
2. B41 führt `python3 rechner.py` aus und meldet Warnungen
3. G01 wählt die fälligen Agenten (laut `zeitplan.json`) und gibt ihnen je eine Aufgabe
4. Q31 prüft alle Ergebnisse
5. G01 schreibt Journal, aktualisiert `STATUS.md` und die Freigabeliste, committet

G01 darf `zeitplan.json` ändern (wer wie oft drankommt), aber nicht die Zahl der
geplanten Sitzungen pro Tag erhöhen – das legt der Inhaber fest.

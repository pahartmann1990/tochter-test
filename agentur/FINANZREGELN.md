# Finanzregeln (anpassbar, Werte stehen in `config.json`)

## Aufteilung jedes Netto-Gewinns
Zuerst Steuer-Rücklage, dann der Rest:

| Topf | Anteil | Zweck |
|---|---|---|
| Steuer-Rücklage | 30 % vom Gewinn | Einkommensteuer, ggf. Gewerbesteuer – nicht anfassen |
| Reinvestition | 40 % vom Rest | Tools, Werbung, neue Projekte |
| Familie (Patrick) | 40 % vom Rest | Auszahlung an den Inhaber |
| Gemeinwohl | 10 % vom Rest | Spenden, Ehrenamt, später soziale Projekte |
| Notreserve | 10 % vom Rest | bis 3 Monatskosten erreicht sind |

## Risiko- und Verlustgrenzen
- **Max. Einsatz pro Projekt:** 20 % des Reinvestitions-Topfs.
- **Stop-Loss pro Projekt:** Hat ein Projekt 50 % seines Budgets verloren und nach
  60 Tagen keinen Euro Umsatz → stoppen, auswerten, Lehre ins Journal.
- **Gesamt-Verlustgrenze:** Fällt der Reinvestitions-Topf um 30 % unter seinen Höchststand
  → alle Ausgaben einfrieren, Inhaber informieren.
- **Niemals** Kredite, Spekulation, Krypto-Trading oder Geld des Inhabers außerhalb
  des freigegebenen Startbudgets.

## Buchführung
Jede Einnahme/Ausgabe kommt in `ledger.csv` (Datum, Projekt, Betrag, Kategorie, Beleg).
Das ist zugleich die Grundlage für die Einnahmen-Überschuss-Rechnung (EÜR).

#!/usr/bin/env python3
"""Wirtschaftsrechner: wertet ledger.csv nach den Regeln in config.json aus.

Beträge: Einnahmen positiv, Ausgaben negativ.
Aufruf: python3 rechner.py
"""
import csv
import json
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path

BASIS = Path(__file__).parent
cfg = json.loads((BASIS / "config.json").read_text())

buchungen = []
with open(BASIS / "ledger.csv", newline="") as f:
    for z in csv.DictReader(f):
        buchungen.append((datetime.strptime(z["datum"], "%Y-%m-%d").date(),
                          z["projekt"], float(z["betrag_eur"])))
buchungen.sort()

# Kapitalverlauf und Höchststand
kapital = hoechst = cfg["startbudget_eur"]
for _, _, betrag in buchungen:
    kapital += betrag
    hoechst = max(hoechst, kapital)

einnahmen = sum(b for *_, b in buchungen if b > 0)
ausgaben = -sum(b for *_, b in buchungen if b < 0)
gewinn = einnahmen - ausgaben

print(f"Einnahmen:  {einnahmen:10.2f} €")
print(f"Ausgaben:   {ausgaben:10.2f} €")
print(f"Gewinn:     {gewinn:10.2f} €")
print(f"Kapital:    {kapital:10.2f} €  (Höchststand {hoechst:.2f} €)")

if gewinn > 0:
    steuer = gewinn * cfg["steuer_ruecklage"]
    rest = gewinn - steuer
    print(f"\nAufteilung des Gewinns:\n  Steuer-Rücklage  {steuer:10.2f} €")
    for topf, anteil in cfg["aufteilung_nach_steuer"].items():
        print(f"  {topf:<16} {rest * anteil:10.2f} €")

warnungen = []
if hoechst > 0 and kapital < hoechst * (1 - cfg["gesamt_verlustgrenze"]):
    warnungen.append("GESAMT-VERLUSTGRENZE erreicht: alle Ausgaben einfrieren, Patrick informieren!")

projekte = defaultdict(lambda: {"ein": 0.0, "aus": 0.0, "start": None})
for datum, projekt, betrag in buchungen:
    p = projekte[projekt]
    p["start"] = p["start"] or datum
    p["ein" if betrag > 0 else "aus"] += abs(betrag)

max_projekt = max(hoechst, 0) * cfg["max_anteil_pro_projekt"]
if projekte:
    print("\nProjekte:")
for name, p in projekte.items():
    tage = (date.today() - p["start"]).days
    print(f"  {name:<20} +{p['ein']:.2f} / -{p['aus']:.2f} €  ({tage} Tage)")
    if max_projekt and p["aus"] > max_projekt:
        warnungen.append(f"{name}: Ausgaben über {cfg['max_anteil_pro_projekt']:.0%} des Kapitals")
    if p["ein"] == 0 and tage >= 60 and p["aus"] > 0:
        warnungen.append(f"{name}: 60 Tage ohne Umsatz → Stop-Loss prüfen")

print("\n" + ("\n".join("⚠ " + w for w in warnungen) if warnungen else "✓ Alle Grenzen eingehalten"))

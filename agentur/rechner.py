#!/usr/bin/env python3
"""Wirtschaftsrechner: wertet ledger.csv monatlich nach config.json aus.

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


def familie_anteil(rest):
    """Gestaffelter Familienanteil (wie eine umgekehrte Steuer) mit Obergrenze."""
    stufen = cfg["familie_staffel"]
    summe = 0.0
    for i, (ab, satz) in enumerate(stufen):
        bis = stufen[i + 1][0] if i + 1 < len(stufen) else float("inf")
        if rest > ab:
            summe += (min(rest, bis) - ab) * satz
    return min(summe, cfg["familie_max_monat"])


buchungen = []
with open(BASIS / "ledger.csv", newline="") as f:
    for z in csv.DictReader(f):
        buchungen.append((datetime.strptime(z["datum"], "%Y-%m-%d").date(),
                          z["projekt"], float(z["betrag_eur"])))
buchungen.sort()

# --- Monatsabrechnung -------------------------------------------------------
monate = defaultdict(float)
for d, _, b in buchungen:
    monate[d.strftime("%Y-%m")] += b

toepfe = defaultdict(float)
verlustvortrag = 0.0
reserve_ziel = cfg["monatskosten_eur"] * cfg["notreserve_ziel_monate"]

if monate:
    print(f"{'Monat':<8}{'Gewinn':>10}{'Steuer':>9}{'Familie':>9}{'Reinv.':>9}"
          f"{'Gemeinw.':>9}{'Reserve':>9}{'Frei':>9}")
for monat in sorted(monate):
    gewinn = monate[monat] + verlustvortrag
    if gewinn <= 0:
        verlustvortrag = gewinn
        print(f"{monat:<8}{monate[monat]:>10.2f}   (Verlustvortrag {verlustvortrag:.2f})")
        continue
    verlustvortrag = 0.0
    steuer = gewinn * cfg["steuer_ruecklage"]
    rest = gewinn - steuer
    reserve = min(rest * cfg["notreserve_anteil"], max(reserve_ziel - toepfe["Notreserve"], 0))
    familie = familie_anteil(rest)
    reinv = min(cfg["reinvest_bedarf_monat"], rest * cfg["reinvest_max_anteil"])
    gemein = rest * cfg["gemeinwohl_anteil"]
    frei = rest - reserve - familie - reinv - gemein
    for k, v in [("Steuer-Rücklage", steuer), ("Notreserve", reserve), ("Familie", familie),
                 ("Reinvestition", reinv), ("Gemeinwohl", gemein), ("Freies Kapital", frei)]:
        toepfe[k] += v
    print(f"{monat:<8}{gewinn:>10.2f}{steuer:>9.2f}{familie:>9.2f}{reinv:>9.2f}"
          f"{gemein:>9.2f}{reserve:>9.2f}{frei:>9.2f}")

if toepfe:
    print("\nTöpfe gesamt:")
    for k, v in toepfe.items():
        print(f"  {k:<16}{v:>11.2f} €")

# --- Kapital und Grenzen ----------------------------------------------------
kapital = hoechst = cfg["startbudget_eur"]
for _, _, b in buchungen:
    kapital += b
    hoechst = max(hoechst, kapital)
print(f"\nKapital (Kasse): {kapital:.2f} €  (Höchststand {hoechst:.2f} €)")

warnungen = []
if hoechst > 0 and kapital < hoechst * (1 - cfg["gesamt_verlustgrenze"]):
    warnungen.append("GESAMT-VERLUSTGRENZE erreicht: Ausgaben einfrieren, Inhaber informieren!")

projekte = defaultdict(lambda: {"ein": 0.0, "aus": 0.0, "start": None})
for d, name, b in buchungen:
    p = projekte[name]
    p["start"] = p["start"] or d
    p["ein" if b > 0 else "aus"] += abs(b)

max_projekt = max(hoechst, 0) * cfg["max_anteil_pro_projekt"]
if projekte:
    print("\nProjekte:")
for name, p in projekte.items():
    tage = (date.today() - p["start"]).days
    print(f"  {name:<20} +{p['ein']:.2f} / -{p['aus']:.2f} €  ({tage} Tage)")
    if max_projekt and p["aus"] > max_projekt:
        warnungen.append(f"{name}: Ausgaben über {cfg['max_anteil_pro_projekt']:.0%} des Kapitals")
    if p["ein"] == 0 and p["aus"] > 0 and tage >= cfg["stop_loss_tage"]:
        warnungen.append(f"{name}: {cfg['stop_loss_tage']} Tage ohne Umsatz → Stop-Loss prüfen")

print("\n" + ("\n".join("⚠ " + w for w in warnungen) if warnungen else "✓ Alle Grenzen eingehalten"))

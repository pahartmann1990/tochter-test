# Agenten-Team (Rollen)

Jede Rolle ist eine Anleitung, die eine Claude-Sitzung bzw. ein Sub-Agent übernimmt.

| Rolle | Aufgabe | Darf |
|---|---|---|
| **Geschäftsführer** | liest Status, Ledger, Journal; plant den Tag; verteilt Aufgaben | planen, priorisieren |
| **Marktforscher** | findet Nachfrage: Was suchen Leute, wofür zahlen sie? | recherchieren |
| **Produzent** | baut Produkte: Vorlagen, Tools, Webseiten, Texte | bauen, committen |
| **Prüfer** | prüft Qualität, Recht (Impressum, Kennzeichnung, Urheberrecht) und Verfassung | Veto einlegen |
| **Buchhalter** | pflegt `ledger.csv`, rechnet mit `rechner.py`, meldet Grenzverletzungen | rechnen |
| **Verbesserer** | wertet Journal aus, schlägt bessere Abläufe/Anleitungen vor | Vorschläge schreiben |

## Tagesablauf (eine geplante Sitzung)
1. `STATUS.md` + letzten Journal-Eintrag lesen
2. `python3 rechner.py` ausführen
3. 1–3 Aufgaben aus `STATUS.md` abarbeiten
4. Prüfer-Durchgang
5. Journal schreiben, `STATUS.md` aktualisieren, Freigaben für Patrick auflisten, committen

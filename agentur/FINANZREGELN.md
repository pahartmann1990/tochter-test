# Finanzregeln (anpassbar, Werte in `config.json`)

Abgerechnet wird **monatlich**. Verluste werden mit späteren Gewinnen verrechnet.

## 1. Steuer-Rücklage: 35 % vom Gewinn
Neben einem Angestelltenjob wird der Gewinn mit dem persönlichen Grenzsteuersatz besteuert
(ungefähr 30–42 %); ab 24.500 € Jahresgewinn kommt Gewerbesteuer hinzu, die größtenteils
angerechnet wird. 35 % ist ein vorsichtiger Startwert. Nach der ersten Steuererklärung wird er
mit einem Steuerberater angepasst; was übrig bleibt, wird freies Kapital.

## 2. Notreserve: 15 % vom Rest
Bis die Reserve 6 Monatskosten deckt, danach fließen diese 15 % ins freie Kapital.

## 3. Familie (Entnahme des Inhabers) – gestaffelt
Wie eine umgekehrte Steuer: Der Anteil sinkt, je mehr übrig ist.

| Rest nach Steuer im Monat | Anteil Familie auf diesen Teil |
|---|---|
| 0 – 10.000 € | 40 % |
| 10.000 – 20.000 € | 20 % |
| über 20.000 € | 10 % |

Zusätzlich gibt es eine **Obergrenze** (`familie_max_monat`, Start: 6.000 €). Bei 10.000 € Rest
sind das 4.000 €, bei 20.000 € Rest 6.000 €.

## 4. Reinvestition (Agentensystem): nach Bedarf, max. 30 %
Das Agentensystem braucht kein Geld für sich. Es bekommt, was es nachweislich braucht
(Abos, API-Tokens, Server, Tools, Werbung) – geplant im Monatsbudget `reinvest_bedarf_monat`,
höchstens 30 % des Rests. Was nicht gebraucht wird, geht ins freie Kapital.

## 5. Gemeinwohl: 10 % vom Rest
Spenden, Ehrenamt, soziale Projekte.

## 6. Freies Kapital (Großziele)
Alles Übrige: was die Staffel, die Reinvestition oder die volle Notreserve nicht abruft.
Dafür sind Wohnungen, Grundstücke, eigene Rechenleistung und soziale Großprojekte gedacht.
Investitionen daraus bedürfen immer der Freigabe des Inhabers.

## Risiko- und Verlustgrenzen
- Max. Einsatz pro Projekt: 20 % des Kapitals.
- Stop-Loss: 60 Tage ohne Umsatz bei laufenden Kosten → stoppen und auswerten.
- Gesamt-Verlustgrenze: Kapital 30 % unter Höchststand → Ausgaben einfrieren, Inhaber informieren.
- Niemals Kredite, Spekulation oder Krypto-Trading.

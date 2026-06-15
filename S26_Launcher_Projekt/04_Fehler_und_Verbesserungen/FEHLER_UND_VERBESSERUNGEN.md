# Fehler & Verbesserungen — S26 Launcher One UI

**Stand:** 2026-06-15 (nach erster APK-Analyse)  
**Status-Legende:** 🔴 Kritisch | 🟠 Wichtig | 🟡 Nice-to-have | ✅ Erledigt

---

## Sicherheit & Datenschutz

| Nr | Status | Problem | Details |
|----|--------|---------|---------|
| S-01 | 🔴 | Übermäßige Berechtigungen | `INSTALL_PACKAGES`, `DUMP`, `WRITE_SECURE_SETTINGS` sind für einen Launcher ungewöhnlich und ein Sicherheitsrisiko |
| S-02 | 🔴 | Tracking-Permissions | `ACCESS_ADSERVICES_*` und `AD_ID` für Werbe-Tracking aktiv |
| S-03 | 🟠 | Notification Listener | Liest ALLE Benachrichtigungen — Datenschutz fraglich wenn nicht explizit gebraucht |
| S-04 | 🟠 | Firebase Analytics | Nutzerverhalten wird zu Google gesendet ohne explizite Zustimmung sichtbar |
| S-05 | 🟡 | PairIP DRM | Lizenz-Check-Mechanismus — beeinträchtigt Offline-Nutzung |

---

## Performance

| Nr | Status | Problem | Details |
|----|--------|---------|---------|
| P-01 | 🟠 | APK-Größe 26 MB | Für einen Launcher groß — 17 MB Ressourcen, 12 MB Code. Ressourcen optimierbar |
| P-02 | 🟠 | 2 DEX-Dateien | Deutet auf viel Code hin — möglicherweise ungenutzte Bibliotheken dabei |
| P-03 | 🟡 | Große Ressourcen | 1.462 Ressource-Dateien — viele womöglich für ungenutzte Features |

---

## Features / Verbesserungspotenzial

| Nr | Status | Verbesserung | Details |
|----|--------|-------------|---------|
| F-01 | 🟡 | Werbung entfernen | AdMob-Integration deaktivieren (smali-Patch oder Rebuild) |
| F-02 | 🟡 | Premium-Features freischalten | In-App-Kauf-Logik identifizieren und patchen |
| F-03 | 🟡 | Offline-Modus verbessern | Netzwerkabhängigkeiten reduzieren (Firebase, AdMob) |
| F-04 | 🟡 | Crash-Reporting deaktivieren | Firebase Crashlytics sendet Daten an Google |
| F-05 | 🟡 | Remote Config lokal ersetzen | Firebase Remote Config durch lokale Werte ersetzen |

---

## Bekannte Fehler (noch zu untersuchen)

| Nr | Status | Fehler | Details |
|----|--------|--------|---------|
| B-01 | 🟡 | Unbekannt | Noch nicht getestet — apktool-Dekompilierung nötig |

---

## Nächste Schritte zur Verbesserung

```bash
# 1. APK dekompilieren
apktool d S26_Launcher.apk -o 02_App/02.2_Source/apktool_out/

# 2. Java/Kotlin Source (lesbar)
jadx -d 02_App/02.2_Source/jadx_out/ S26_Launcher.apk

# 3. Strings extrahieren
unzip S26_Launcher.apk res/values/strings.xml -d extracted/

# 4. Neu signieren nach Änderungen
# zipalign -v 4 modified.apk aligned.apk
# apksigner sign --ks mein.keystore aligned.apk
```

---

*Zuletzt aktualisiert: 2026-06-15*

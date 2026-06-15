# APK-Analyse: S26 Launcher One UI inspired

**Datum:** 2026-06-15  
**Analysiert mit:** unzip, Python AXML-Parser, DEX-String-Extraktion

---

## 1. Grunddaten

| Eigenschaft | Wert |
|-------------|------|
| Dateiname | S26 Launcher One UI inspired_2.1.256 (1).apk |
| Dateigröße (komprimiert) | 26 MB |
| Paketname | `com.glx.bhnd` |
| Version | 2.1.256 |
| Haupt-Klasse (Application) | `com.android.yato.GalaxyApp` |
| Launcher-Klasse | `com.glx.Launcher` |
| Workspace | `com.glx.Workspace` |
| Kompiliert mit | Android 8.0.0 (compileSdkVersionCodename) |
| Kotlin-Coroutines | Ja (DebugProbesKt.bin) |
| Obfuskierung | Ja (kurze Namen: com.glx.a, com.glx.i, ...) |

---

## 2. APK-Struktur & Größen

| Bereich | Größe (unkomprimiert) |
|---------|----------------------|
| Ressourcen (`res/`) | 17,28 MB |
| DEX-Code (`classes*.dex`) | 12,52 MB |
| META-INF | 0,39 MB |
| OkHttp3 | 0,04 MB |
| Kotlin stdlib | 0,03 MB |
| Assets | < 0,01 MB |

- **Gesamt-Dateien:** 1.657
- **DEX-Dateien:** 2 (classes.dex ~5 MB, classes2.dex ~7 MB)
- **Ressource-Dateien:** 1.462 (XML, PNG, WebP, 9-Patch)

---

## 3. Features (erkannt aus Klassen & Manifest)

### Kern-Launcher
- Home Screen mit One UI / Samsung-Optik
- `com.glx.Launcher` (Haupt-Activity mit HOME-Intent)
- `com.glx.Workspace` (App-Grid-Verwaltung)
- `com.glx.LauncherProvider` (Daten-Provider)
- AppWidget-Host (Widgets auf dem Home Screen)

### Edge Panel (Samsung-Style)
- `com.android.edge.EdgeAppPanelActivity` — App-Panel
- `com.android.edge.SelectAppAc` — App-Auswahl
- `com.android.edge.view.favcontact.SelectFavoriteContactAc` — Lieblings-Kontakte

### Edge Special Pages
- `com.android.yato.specialedge.EdgeSpecialPage` — Spezial-Seiten
- `com.android.yato.specialedge.EdgeAppsSearchContainerLayout` — App-Suche
- `com.android.yato.specialedge.drinkwater.*` — Wasser-Trinken-Tracker (mit Statistiken, History, Tassen-Auswahl)
- `com.android.yato.specialedge.sleepy.SleepyTimeActivity` — Schlaf-Timer

### Edge Lighting / Dynamic Island
- `com.android.yato.edgelighting.EdgeLightingView` — Kanten-Beleuchtung
- `com.android.yato.edgelighting.DynamicIslandView` — Dynamic Island-Effekt
- `com.android.yato.edgelighting.EdgeLightingSettingActivity`

### Control Center
- `com.android.yato.controlcenter.ControlcenterSetting`
- `com.android.yato.controlcenter.TopCCView` / `TopCCViewNew`
- `com.android.yato.controlcenter.WaveSeekBarDraw*` — Wave-Schieberegler für Helligkeit/Lautstärke

### Widgets
- `com.android.ss.widget.widglx.BatteryWidgetProvider` — Batterie-Widget
- `com.android.ss.widget.widglx.PhotoWidgetProvider` — Foto-Widget
- `com.android.yato.clock.ClockAppWidget` — Uhr-Widget

### Personalisierung (`com.glx.personal.*`)
- `ThemesActivity` — Themes/Designs
- `IconPackActivity` — Icon Packs
- `WallpaperAc` / `CropWallpaperActivity` — Hintergrundbilder
- `ChangeFontHomeScreen` — Schriftart wechseln
- `ChangeIconAppActivity` / `ChangeIconDirectActivity` — App-Icon ändern
- `ChangeNameAppActivity` — App-Namen ändern
- `GestureActivity` — Gesten-Steuerung
- `LayoutSettingActivity` — Layout-Einstellungen
- `LockAppAc` — App-Sperre (Fingerprint/PIN)
- `HiddenAppAc` — Versteckte Apps

### Sonstiges
- `com.android.notification.NotificationListener` — Benachrichtigungen lesen
- `com.glx.music` — Musik-Integration
- Clock: `com.android.yato.clock.CustomClock` — Custom-Uhr

---

## 4. Berechtigungen (vollständig)

### Kritisch / Sensibel
| Permission | Zweck/Risiko |
|------------|--------------|
| `INSTALL_PACKAGES` | Kann andere Apps installieren — sehr mächtig |
| `DUMP` | Liest sensible System-Infos (normalerweise nur System-Apps) |
| `WRITE_SECURE_SETTINGS` | Ändert sichere System-Einstellungen |
| `WRITE_SETTINGS` | Ändert globale Systemeinstellungen |
| `QUERY_ALL_PACKAGES` | Sieht alle installierten Apps |
| `BIND_NOTIFICATION_LISTENER_SERVICE` | Liest ALLE Benachrichtigungen |
| `CALL_PHONE` | Kann Anrufe tätigen ohne Bestätigung |
| `READ_CONTACTS` / `WRITE_CONTACTS` | Vollzugriff auf Kontakte |
| `READ_CALENDAR` / `WRITE_CALENDAR` | Vollzugriff auf Kalender |
| `CAMERA` | Kamera-Zugriff |
| `UPDATE_DEVICE_STATS` | Gerätenutzungsstatistiken schreiben |

### Normale Berechtigungen
- `ACCESS_NETWORK_STATE`, `ACCESS_WIFI_STATE`, `CHANGE_WIFI_STATE`
- `BLUETOOTH`, `BLUETOOTH_ADMIN`, `BLUETOOTH_CONNECT`
- `INTERNET`, `WAKE_LOCK`, `VIBRATE`
- `SET_WALLPAPER`, `SET_WALLPAPER_HINTS`
- `EXPAND_STATUS_BAR`, `FLASHLIGHT`
- `RECEIVE_BOOT_COMPLETED`, `FOREGROUND_SERVICE`
- `READ_EXTERNAL_STORAGE`, `READ_MEDIA_IMAGES`
- `POST_NOTIFICATIONS`, `ACCESS_NOTIFICATION_POLICY`

### Ad-Tracking
- `ACCESS_ADSERVICES_AD_ID`
- `ACCESS_ADSERVICES_ATTRIBUTION`
- `ACCESS_ADSERVICES_TOPICS`
- `com.google.android.gms.permission.AD_ID`

---

## 5. Drittanbieter-Bibliotheken

### Analytics & Crash-Reporting
- **Firebase Analytics** — Nutzerverhalten-Tracking
- **Firebase Crashlytics** — Crash-Berichte
- **Firebase Remote Config** — Ferngesteuerte Konfiguration
- **Firebase A/B Testing** (AbtRegistrar) — A/B-Tests
- **Firebase Sessions** — Session-Tracking
- **Google Analytics Measurement** — App-Messung

### Monetarisierung
- **Google AdMob** — In-App-Werbung
  - App-ID: `ca-app-pub-4514656972126937~2858491845`
  - Flaggen: OPTIMIZE_INITIALIZATION, OPTIMIZE_AD_LOADING
- **Google Play Billing** — In-App-Käufe/Abonnements
- **PairIP License Check** — DRM / Lizenz-Überprüfung
  - `LicenseActivity`, `LicenseContentProvider`, `LicenseContentProvider1`

### Netzwerk & Infrastruktur
- **OkHttp3** — HTTP-Client
- **Google Data Transport** (CCT Backend) — Firebase-Datentransport
- **WorkManager** — Hintergrund-Jobs
- **Room** — Lokale SQLite-Datenbank
- **DataStore** — Moderne Einstellungs-Speicherung
- **Kotlin Coroutines** — Async-Programmierung

### UI & Sonstiges
- **TedPermission** — Permission-Dialog-Bibliothek
- **ConstraintLayout** — Layout
- **AndroidX Browser** (Custom Tabs) — In-App-Browser
- **AsyncLayoutInflater** — Layout-Performance
- **ProfileInstaller** — AOT-Compilation

---

## 6. Monetarisierungs-Modell

Basierend auf den gefundenen Klassen und Schlüsselwörtern:
- Kostenlose Version mit **Werbung** (AdMob)
- **Premium/Pro** per In-App-Kauf oder Abonnement (Billing + "subscribe", "unlock", "pro" gefunden)
- DRM über **PairIP** (verhindert unlizenzierte Nutzung)
- Firebase Remote Config vermutlich für Feature-Flags (Premium vs. Free)

---

## 7. Einschätzung: Modifizieren oder Neu aufbauen?

### Option A: Modifizieren (Patch)
**Aufwand:** Mittel-Hoch  
**Werkzeuge:** apktool + jadx + zipalign + apksigner

Möglich:
- Berechtigungen entfernen (aus AndroidManifest.xml)
- Werbung deaktivieren (smali-Patches)
- Strings/Texte anpassen (strings.xml)
- Icons/Ressourcen austauschen

Schwierig wegen:
- Code-Obfuskierung (kurze Klassennamen)
- PairIP DRM (Lizenz-Check muss umgangen werden)
- Firebase tief integriert

### Option B: Neu aufbauen (Clone/Rewrite)
**Aufwand:** Sehr Hoch  
**Werkzeuge:** Android Studio, Kotlin, AOSP Launcher3 als Basis

Vorteile:
- Sauberer Code ohne Werbung/Tracking
- Eigene Features frei wählbar
- Kein DRM-Problem

Empfehlung: **Option A** für schnelle Anpassungen, **Option B** für langfristige eigene Lösung.

---

## 8. Sofort-Empfehlungen

1. APK mit **jadx** vollständig dekompilieren für Code-Review
2. **strings.xml** extrahieren → deutsche Texte prüfen
3. Berechtigungen `INSTALL_PACKAGES`, `DUMP`, `WRITE_SECURE_SETTINGS` im Manifest kritisch prüfen — für einen Launcher ungewöhnlich mächtig
4. Firebase-Konfigurationsdatei (`google-services.json`) suchen
5. Premium-Feature-Logik im Code lokalisieren

---

*Analyse erstellt: 2026-06-15 | Tool: Claude Code*

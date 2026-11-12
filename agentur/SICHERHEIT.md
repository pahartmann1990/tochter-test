# Sicherheit & Verschlüsselung

## Stufe 1 – Privates Repo (sofort, reicht für den Anfang)
Ein privates GitHub-Repo ist für alle außer dem Inhaber und den freigegebenen Agenten
unsichtbar. **Das aktuelle Repo `tochter-test` ist öffentlich** (wegen GitHub Pages) – daher
zieht dieses Projekt in ein neues privates Repo um.

## Stufe 2 – Verschlüsselung sensibler Dateien im Repo
Für Kundendaten, Finanzbelege, Verträge: Verschlüsselung mit `age` oder `git-crypt`.
Auf GitHub liegt dann nur Datensalat – selbst wer Zugriff auf das Repo hätte, kann ihn nicht lesen.

- Schlüssel des Inhabers: im Passwortmanager, zum Lesen auf dem eigenen Rechner.
- Schlüssel der Agenten: als Secret in der Cloud-Umgebung, nie im Repo.
- Verschlüsselt wird nur, was sensibel ist. Code, Pläne und Journal bleiben lesbar,
  sonst kann man auf GitHub nichts mehr ansehen oder vergleichen.

Ein Browser-Add-on ist nicht nötig: Der Inhaber entschlüsselt lokal mit einem Befehl,
die Agenten entschlüsseln in ihrer Sitzung.

**Ehrliche Grenze:** Damit Agenten in der Cloud arbeiten können, muss ihr Schlüssel dort
liegen. Gegen Außenstehende schützt das gut, gegen den Cloud-Anbieter selbst nicht vollständig.

## Stufe 3 – Notfallplan für Schlüssel und Konten (Lehre aus dem Handy-Ausfall)
Nie nur **ein** Gerät für Logins. Mindestens:
1. **Passwortmanager** (z. B. Bitwarden) für alle Passwörter und Schlüssel.
2. **Zwei Sicherheitsschlüssel** (USB/NFC, z. B. YubiKey): einer am Schlüsselbund, einer bei den Eltern.
3. **2FA-App mit Backup** (Codes verschlüsselt exportiert oder Geräte-Synchronisation).
4. **Wiederherstellungscodes ausgedruckt** in einem Umschlag bei den Eltern.
5. **Notfallblatt**: welche Konten es gibt und wie man sie wiederherstellt.
Einmal im Jahr testen: Komme ich ohne mein Handy in alle wichtigen Konten?

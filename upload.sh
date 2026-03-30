#!/bin/bash
# ============================================================
# upload.sh — Projekt auf GitHub pushen
# ============================================================
# Starte dieses Script im entpackten gear-simulator/ Ordner:
#   chmod +x upload.sh && ./upload.sh
# ============================================================

REPO="https://github.com/pahartmann1990/tochter-test.git"

echo "🔧 Zahnrad-Simulation → GitHub Upload"
echo "======================================"
echo ""

# Check git
if ! command -v git &> /dev/null; then
    echo "❌ Git nicht gefunden. Bitte installieren:"
    echo "   sudo apt install git"
    exit 1
fi

# Init if needed
if [ ! -d ".git" ]; then
    git init
    git branch -m main
fi

git add -A
git commit -m "Initial: Zahnrad-Simulation für KH-Rechner

- Interaktive 2D Zahnrad-Simulation (Canvas)
- Drag & Drop mit Snap-Funktion
- Einfache + Kombi-Zahnräder (Compound)
- Automatische Übersetzungsberechnung
- 0-100% Gauge-Anzeige
- JSON Export (Teileliste)
- 200x200mm Druckbett-Overlay
- Vanilla JS, kein Framework"

# Set remote
git remote remove origin 2>/dev/null
git remote add origin "$REPO"

echo ""
echo "📤 Pushe zu $REPO ..."
git push -u origin main

echo ""
echo "✅ Fertig! Öffne: https://github.com/pahartmann1990/tochter-test"

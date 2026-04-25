#!/bin/bash
# Run this script ON the remote server to deploy the latest changes.
# Usage: ./deploy.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_ROOT="/var/www/briva-diena"
SERVICE="briva-diena-backend"

echo ""
echo "================================================"
echo "  Brīva Diena - Deploy"
echo "================================================"
echo ""

# ── 1. Pull latest code ─────────────────────────────
echo "[1/5] Pulling latest changes from git..."
git -C "$SCRIPT_DIR" pull origin main
echo "[OK] Code updated"
echo ""

# ── 2. Stop backend service ─────────────────────────
echo "[2/5] Stopping backend service..."
if sudo systemctl is-active --quiet "$SERVICE"; then
    sudo systemctl stop "$SERVICE"
    echo "[OK] Backend stopped"
else
    echo "[INFO] Backend was not running"
fi
echo ""

# ── 3. Build backend ────────────────────────────────
echo "[3/5] Building backend..."
cd "$SCRIPT_DIR/backend"
chmod +x mvnw
./mvnw clean package -DskipTests -q
echo "[OK] Backend built"
echo ""

# ── 4. Build and deploy frontend ────────────────────
echo "[4/5] Building frontend..."
cd "$SCRIPT_DIR/frontend"
npm install --silent
npm run build

sudo mkdir -p "$WEB_ROOT"
sudo cp -r dist/frontend/browser/. "$WEB_ROOT/"
echo "[OK] Frontend deployed to $WEB_ROOT"
echo ""

# ── 5. Start backend service ────────────────────────
echo "[5/5] Starting backend service..."
sudo systemctl start "$SERVICE"

# Wait for backend to come up (up to 30 s)
echo -n "Waiting for backend"
for i in $(seq 1 10); do
    sleep 3
    if sudo systemctl is-active --quiet "$SERVICE"; then
        echo ""
        echo "[OK] Backend is running"
        break
    fi
    echo -n "."
    if [ "$i" -eq 10 ]; then
        echo ""
        echo "[ERROR] Backend failed to start. Check logs:"
        echo "  sudo journalctl -u $SERVICE -n 50 --no-pager"
        exit 1
    fi
done
echo ""

echo "================================================"
echo "  Deploy complete!"
echo "================================================"
echo ""
echo "Service status:"
sudo systemctl status "$SERVICE" --no-pager -l | head -8
echo ""
echo "Useful commands:"
echo "  sudo journalctl -u $SERVICE -f          # live logs"
echo "  sudo systemctl status $SERVICE          # service status"
echo ""

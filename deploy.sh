#!/bin/bash
# Run this script ON the remote server to deploy the latest changes.
# Usage: ./deploy.sh
#
# Ordering note: the frontend build's sitemap generation step calls the LIVE
# /api/trips endpoint (see scripts/generate-seo-build-files.mjs), so the
# backend must still be serving requests when "npm run build" runs. That's
# why we build+deploy the frontend BEFORE swapping the backend jar — the old
# backend instance keeps answering /api/trips throughout the frontend build,
# then gets stopped/replaced only at the very end. Trip pages themselves
# don't depend on this ordering: the frontend service server-renders them on
# demand against whichever backend is live at request time (see
# frontend/server.ts's SSR_CACHE_TTL_MS render cache).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE="briva-diena-backend"
FRONTEND_SERVICE="briva-diena-frontend"

echo ""
echo "================================================"
echo "  Brīva Diena - Deploy"
echo "================================================"
echo ""

# ── 1. Pull latest code ─────────────────────────────
echo "[1/5] Pulling latest changes from git..."
# Fix ownership in case previous root runs corrupted it
chown -R ubuntu:ubuntu "$SCRIPT_DIR" 2>/dev/null || true
sudo -u ubuntu git -C "$SCRIPT_DIR" fetch origin
sudo -u ubuntu git -C "$SCRIPT_DIR" reset --hard origin/main
echo "[OK] Code updated"
echo ""

# ── 2. Build backend jar (service keeps running the old jar for now) ──
echo "[2/5] Building backend..."
cd "$SCRIPT_DIR/backend"
chmod +x mvnw
./mvnw clean package -DskipTests -q
echo "[OK] Backend built"
echo ""

# ── 3. Build frontend (backend is still up, serving /api for the sitemap step) ──
echo "[3/5] Building frontend..."
cd "$SCRIPT_DIR/frontend"
npm install --silent
npm run build
echo "[OK] Frontend built"
echo ""

# ── 4. Restart the frontend SSR service on the freshly built output ──
echo "[4/5] Restarting frontend service..."
if sudo systemctl is-active --quiet "$FRONTEND_SERVICE"; then
    sudo systemctl stop "$FRONTEND_SERVICE"
    echo "[OK] Frontend stopped"
else
    echo "[INFO] Frontend was not running"
fi
sudo systemctl start "$FRONTEND_SERVICE"

# Wait for frontend to come up (up to 30 s)
echo -n "Waiting for frontend"
for i in $(seq 1 10); do
    sleep 3
    if sudo systemctl is-active --quiet "$FRONTEND_SERVICE"; then
        echo ""
        echo "[OK] Frontend is running"
        break
    fi
    echo -n "."
    if [ "$i" -eq 10 ]; then
        echo ""
        echo "[ERROR] Frontend failed to start. Check logs:"
        echo "  sudo journalctl -u $FRONTEND_SERVICE -n 50 --no-pager"
        exit 1
    fi
done
echo ""

# Warm the render cache for the two highest-traffic routes so the first
# real visitor after this deploy doesn't pay the SSR render cost.
curl -s -o /dev/null http://localhost:4000/ || true
curl -s -o /dev/null http://localhost:4000/trips || true
echo "[OK] Warmed frontend cache"
echo ""

# ── 5. Swap in the freshly built backend jar ────────
echo "[5/5] Restarting backend service..."
if sudo systemctl is-active --quiet "$SERVICE"; then
    sudo systemctl stop "$SERVICE"
    echo "[OK] Backend stopped"
else
    echo "[INFO] Backend was not running"
fi
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
sudo systemctl status "$FRONTEND_SERVICE" --no-pager -l | head -8
echo ""
echo "Useful commands:"
echo "  sudo journalctl -u $SERVICE -f            # backend logs"
echo "  sudo journalctl -u $FRONTEND_SERVICE -f   # frontend logs"
echo "  sudo systemctl status $SERVICE            # backend status"
echo "  sudo systemctl status $FRONTEND_SERVICE   # frontend status"
echo ""

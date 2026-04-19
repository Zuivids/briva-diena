#!/bin/bash

echo ""
echo "============================================"
echo "  Stopping Briva Diena Services"
echo "============================================"
echo ""

# Stop backend
echo "Stopping backend..."
pkill -f "mvn clean spring-boot:run"
echo "[OK] Backend stopped"

# Stop frontend
echo "Stopping frontend..."
pkill -f "npm start"
echo "[OK] Frontend stopped"

# Stop database
echo "Stopping database..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"
docker-compose down
echo "[OK] Database stopped"

echo ""
echo "============================================"
echo "  All services stopped"
echo "============================================"
echo ""

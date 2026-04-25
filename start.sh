#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "============================================"
echo "  Briva Diena - Starting Database, Backend & Frontend"
echo "============================================"
echo ""

# Function to kill processes
kill_process() {
    local process_name=$1
    local pids=$(pgrep -f "$process_name" 2>/dev/null)
    
    if [ -n "$pids" ]; then
        echo "Killing $process_name processes..."
        echo "$pids" | xargs kill -9 2>/dev/null
        sleep 1
    fi
}

echo "Stopping any existing processes..."
echo ""

# Kill frontend (ng serve)
kill_process "ng serve"
echo "[OK] Frontend stopped (if any)"

# Kill backend (Spring Boot)
kill_process "spring-boot:run"
echo "[OK] Backend stopped (if any)"

echo ""
echo "============================================"
echo "  Starting Database (MariaDB)..."
echo "============================================"
echo ""

# Navigate to backend directory and start docker-compose
cd "$SCRIPT_DIR/backend"
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to start MariaDB. Make sure Docker and Docker Compose are installed and running."
    exit 1
fi

echo "[OK] MariaDB container started"

# Wait for database to be ready
echo "Waiting for database to initialize..."
sleep 8

echo ""
echo "============================================"
echo "  Starting Backend..."
echo "============================================"
echo ""

# Start backend in the background
cd "$SCRIPT_DIR/backend"
chmod +x mvnw
./mvnw spring-boot:run > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "[OK] Backend starting (PID: $BACKEND_PID)"

# Wait for backend to initialize
sleep 10

echo ""
echo "============================================"
echo "  Starting Frontend..."
echo "============================================"
echo ""

# Start frontend in the background
cd "$SCRIPT_DIR/frontend"
npm start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "[OK] Frontend starting (PID: $FRONTEND_PID)"

echo ""
echo "============================================"
echo "  All services are starting..."
echo "============================================"
echo ""
echo "Database:  MariaDB on localhost:3306 (via docker-compose)"
echo "Backend:   http://localhost:8080"
echo "Frontend:  http://localhost:4200"
echo ""
echo "Logs:"
echo "  Backend:  tail -f /tmp/backend.log"
echo "  Frontend: tail -f /tmp/frontend.log"
echo ""
echo "To stop all services:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo "  docker-compose -f backend/docker-compose.yml down"
echo ""

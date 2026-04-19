@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================
echo   Briva Diena - Starting Database, Backend & Frontend
echo ============================================
echo.

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"

echo Stopping any existing processes...
echo.

REM Kill any running Node processes (frontend)
taskkill /f /im node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend stopped
) else (
    echo [INFO] No frontend process running
)

REM Kill any running Java processes (backend)
taskkill /f /im java.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend stopped
) else (
    echo [INFO] No backend process running
)

echo.
echo ============================================
echo   Starting Database (MariaDB)...
echo ============================================
echo.

REM Start MariaDB using docker-compose
cd /d "%SCRIPT_DIR%backend"
docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start MariaDB. Make sure Docker is installed and running.
    pause
    exit /b 1
)
echo [OK] MariaDB container started

REM Wait for database to be ready
echo Waiting for database to initialize...
timeout /t 8 /nobreak

echo.
echo ============================================
echo   Starting Backend...
echo ============================================
echo.

REM Start backend in a new terminal (with clean build)
start "Briva Diena - Backend" cmd /k "cd /d "%SCRIPT_DIR%backend" && mvn clean spring-boot:run"

REM Wait for backend to initialize
timeout /t 10 /nobreak

echo.
echo ============================================
echo   Starting Frontend...
echo ============================================
echo.

REM Start frontend in a new terminal
start "Briva Diena - Frontend" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm start"

echo.
echo ============================================
echo   All services are starting...
echo ============================================
echo.
echo Database:  MariaDB on localhost:3307
echo Backend:   http://localhost:8080
echo Frontend:  http://localhost:4200
echo.
echo Press Ctrl+C in any terminal to stop that service.
echo To stop all services: 
echo   - Close the terminal windows, OR
echo   - Run: docker-compose -f backend/docker-compose.yml down
echo.

pause

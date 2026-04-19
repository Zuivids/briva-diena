@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================
echo   Briva Diena - Starting Backend & Frontend
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
echo   Starting Backend...
echo ============================================
echo.

REM Start backend in a new terminal
start "Briva Diena - Backend" cmd /k "cd /d "%SCRIPT_DIR%backend" && mvn spring-boot:run"

REM Wait for backend to initialize
timeout /t 5 /nobreak

echo.
echo ============================================
echo   Starting Frontend...
echo ============================================
echo.

REM Start frontend in a new terminal
start "Briva Diena - Frontend" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm start"

echo.
echo ============================================
echo   Both services are starting...
echo ============================================
echo.
echo Backend URL: http://localhost:8080
echo Frontend URL: http://localhost:4200
echo.
echo Press Ctrl+C in either terminal to stop that service.
echo To stop all services at once, close both terminal windows or run:
echo   taskkill /im node.exe
echo   taskkill /im java.exe
echo.

pause

@echo off
REM ================================================
REM Inventory ITRF Backend - PM2 Production Starter
REM ================================================
REM Quick script to start/restart the backend with PM2
REM ================================================

echo ================================================
echo Inventory ITRF Backend - PM2 Production Mode
echo ================================================
echo.

cd /d "%~dp0"

REM Check if PM2 is installed
where pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PM2 is not installed!
    echo.
    echo Please run: install-pm2-service.ps1 (as Administrator)
    echo.
    pause
    exit /b 1
)

REM Check if already running
pm2 describe inventory-api >nul 2>&1
if %errorlevel% equ 0 (
    echo Backend is already running. Restarting...
    pm2 restart inventory-api
) else (
    echo Starting backend with PM2...
    pm2 start ecosystem.config.js --env production
    pm2 save
)

echo.
echo ✓ Backend is running with PM2
echo.

REM Show status
pm2 status

echo.
echo View logs: pm2 logs
echo Monitor: pm2 monit
echo.
pause


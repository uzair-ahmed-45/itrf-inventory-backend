@echo off
REM ================================================
REM Inventory ITRF Backend - Native Production Mode
REM ================================================
REM Uses built-in Node.js process manager
REM NO external dependencies required
REM Perfect for offline deployments
REM ================================================

echo ================================================
echo Inventory ITRF Backend - Native Production Mode
echo ================================================
echo.

cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH!
    echo Please install Node.js first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create .env file first
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo ERROR: node_modules folder not found!
    echo Please run: npm install
    pause
    exit /b 1
)

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

echo Starting backend with native process manager...
echo.
echo Features:
echo - Auto-restart on crash
echo - Memory monitoring (1GB limit)
echo - Graceful shutdown
echo - Detailed logging
echo.
echo Press Ctrl+C to stop the server
echo ================================================
echo.

REM Start the backend with process manager
node src/processManager.js

REM If it stops, pause
echo.
echo Server stopped.
pause


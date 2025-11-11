@echo off
REM ================================================
REM Inventory ITRF Backend - Startup Script
REM ================================================
REM This script starts the backend server
REM Can be used with Windows Task Scheduler for auto-start
REM ================================================

echo Starting Inventory ITRF Backend API...
echo.

REM Change to the directory where this script is located
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
    echo WARNING: .env file not found!
    echo Please create .env file from .env.example
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo ERROR: node_modules folder not found!
    echo Please run: npm install --production
    pause
    exit /b 1
)

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Log the start time
echo [%date% %time%] Starting backend server... >> logs\startup.log

REM Start the backend server
echo Starting server on port 5000...
node src/index.js

REM If the server stops, log it
echo [%date% %time%] Backend server stopped. >> logs\startup.log

pause


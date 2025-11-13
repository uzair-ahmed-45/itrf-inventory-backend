# ================================================
# Inventory ITRF Backend - PM2 Production Setup
# ================================================
# This script sets up PM2 as a Windows service
# with automatic restart on crash and server reboot
# ================================================
# RUN AS ADMINISTRATOR
# ================================================

param(
    [switch]$Uninstall
)

$taskName = "Inventory ITRF Backend PM2"
$backendPath = $PSScriptRoot

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Inventory ITRF Backend - PM2 Production Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

# Change to backend directory
Set-Location $backendPath

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js first from: https://nodejs.org/" -ForegroundColor Yellow
    pause
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file first" -ForegroundColor Yellow
    pause
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "ERROR: node_modules not found!" -ForegroundColor Red
    Write-Host "Please run: npm install" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""
Write-Host "Checking PM2 installation..." -ForegroundColor Yellow

# Check if PM2 is installed globally
try {
    $pm2Version = pm2 --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ PM2 already installed: v$pm2Version" -ForegroundColor Green
    } else {
        throw "PM2 not found"
    }
} catch {
    Write-Host "PM2 not found. Installing PM2 globally..." -ForegroundColor Yellow
    npm install -g pm2
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install PM2!" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "✓ PM2 installed successfully" -ForegroundColor Green
}

Write-Host ""

if ($Uninstall) {
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host "UNINSTALLING PM2 SERVICE" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host ""
    
    # Stop and delete the app
    Write-Host "Stopping application..." -ForegroundColor Yellow
    pm2 stop inventory-api 2>$null
    pm2 delete inventory-api 2>$null
    
    # Uninstall PM2 service
    Write-Host "Uninstalling PM2 Windows service..." -ForegroundColor Yellow
    pm2-startup uninstall
    
    Write-Host ""
    Write-Host "✓ PM2 service uninstalled successfully" -ForegroundColor Green
    Write-Host ""
    pause
    exit 0
}

Write-Host "================================================" -ForegroundColor Yellow
Write-Host "Setting up PM2 Production Environment" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow
Write-Host ""

# Stop any existing PM2 processes
Write-Host "Stopping any existing processes..." -ForegroundColor Yellow
pm2 stop all 2>$null
pm2 delete all 2>$null

# Create logs directory
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

Write-Host "✓ Cleaned existing PM2 processes" -ForegroundColor Green
Write-Host ""

# Start the application with PM2
Write-Host "Starting application with PM2..." -ForegroundColor Yellow
pm2 start ecosystem.config.js --env production

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start application with PM2!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "✓ Application started with PM2" -ForegroundColor Green
Write-Host ""

# Save PM2 process list
Write-Host "Saving PM2 process list..." -ForegroundColor Yellow
pm2 save --force

Write-Host "✓ PM2 process list saved" -ForegroundColor Green
Write-Host ""

# Install PM2 startup script for Windows
Write-Host "Installing PM2 Windows startup service..." -ForegroundColor Yellow
pm2-startup install

if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: PM2 startup installation might have issues" -ForegroundColor Yellow
    Write-Host "The application will still run, but might not auto-start on reboot" -ForegroundColor Yellow
} else {
    Write-Host "✓ PM2 startup service installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "SUCCESS! Production environment is ready!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Show PM2 status
pm2 status

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "IMPORTANT INFORMATION" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Backend is now running with PM2" -ForegroundColor Green
Write-Host "✓ Auto-restart on crash: ENABLED" -ForegroundColor Green
Write-Host "✓ Auto-start on server reboot: ENABLED" -ForegroundColor Green
Write-Host "✓ Max memory limit: 1GB (will auto-restart if exceeded)" -ForegroundColor Green
Write-Host "✓ Logs location: .\logs\" -ForegroundColor Green
Write-Host ""
Write-Host "Useful PM2 Commands:" -ForegroundColor Yellow
Write-Host "  pm2 status              - Check application status" -ForegroundColor White
Write-Host "  pm2 logs                - View live logs" -ForegroundColor White
Write-Host "  pm2 restart inventory-api - Restart the application" -ForegroundColor White
Write-Host "  pm2 stop inventory-api    - Stop the application" -ForegroundColor White
Write-Host "  pm2 monit               - Monitor CPU/Memory usage" -ForegroundColor White
Write-Host ""
Write-Host "API URL: http://localhost:5000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "To uninstall PM2 service, run:" -ForegroundColor Yellow
Write-Host "  .\install-pm2-service.ps1 -Uninstall" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
pause


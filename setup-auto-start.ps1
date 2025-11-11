# ================================================
# Inventory ITRF Backend - Auto-Start Setup Script
# ================================================
# This script creates a Windows Task Scheduler task
# to automatically start the backend on system boot
# ================================================
# RUN AS ADMINISTRATOR
# ================================================

# Configuration
$taskName = "Inventory ITRF Backend"
$backendPath = $PSScriptRoot  # Current directory where script is located
$scriptPath = Join-Path $backendPath "start-backend-hidden.vbs"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Inventory ITRF Backend - Auto-Start Setup" -ForegroundColor Cyan
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

# Verify script file exists
if (-not (Test-Path $scriptPath)) {
    Write-Host "ERROR: Cannot find startup script!" -ForegroundColor Red
    Write-Host "Looking for: $scriptPath" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

# Verify .env file exists
$envPath = Join-Path $backendPath ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host "Please create .env file before starting the backend" -ForegroundColor Yellow
    Write-Host "Location: $envPath" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Backend Path: $backendPath" -ForegroundColor Green
Write-Host "Startup Script: $scriptPath" -ForegroundColor Green
Write-Host ""

# Remove existing task if it exists
Write-Host "Checking for existing task..." -ForegroundColor Yellow
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Removing existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "Existing task removed." -ForegroundColor Green
}

# Create new scheduled task
Write-Host ""
Write-Host "Creating new scheduled task..." -ForegroundColor Yellow

# Action: Start the backend using VBS script (hidden window)
$action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$scriptPath`""

# Trigger: At system startup with 30 second delay
$trigger = New-ScheduledTaskTrigger -AtStartup
$trigger.Delay = "PT30S"  # 30 second delay

# Principal: Run as SYSTEM account with highest privileges
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -DontStopOnIdleEnd `
    -ExecutionTimeLimit (New-TimeSpan -Days 0) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)

# Register the task
try {
    Register-ScheduledTask `
        -TaskName $taskName `
        -Action $action `
        -Trigger $trigger `
        -Principal $principal `
        -Settings $settings `
        -Description "Auto-start backend API server for Inventory ITRF system. Runs on system startup." `
        -ErrorAction Stop | Out-Null
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "SUCCESS! Scheduled task created!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Task Name: $taskName" -ForegroundColor Cyan
    Write-Host "Status: Enabled" -ForegroundColor Cyan
    Write-Host "Trigger: At system startup (30 second delay)" -ForegroundColor Cyan
    Write-Host "Backend will start automatically on next reboot" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To test the task now:" -ForegroundColor Yellow
    Write-Host "1. Open Task Scheduler (taskschd.msc)" -ForegroundColor Yellow
    Write-Host "2. Find: $taskName" -ForegroundColor Yellow
    Write-Host "3. Right-click -> Run" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To verify backend is running:" -ForegroundColor Yellow
    Write-Host "Open browser -> http://localhost:5000/api/health" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Failed to create scheduled task!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
pause


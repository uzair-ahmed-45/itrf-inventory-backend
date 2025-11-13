# ================================================
# Inventory ITRF Backend - Native Service Setup
# ================================================
# Sets up Windows Task Scheduler to run the native
# Node.js process manager on system startup
# NO external dependencies required (no PM2)
# Perfect for offline/closed network environments
# ================================================
# RUN AS ADMINISTRATOR
# ================================================

param(
    [switch]$Uninstall
)

$taskName = "Inventory ITRF Backend Native"
$backendPath = $PSScriptRoot
$batchFile = Join-Path $backendPath "start-production-native.bat"
$nodeExe = "node.exe"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Inventory ITRF Backend - Native Service Setup" -ForegroundColor Cyan
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

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js installed: $nodeVersion" -ForegroundColor Green
    $nodePath = (Get-Command node).Source
    Write-Host "Node.js path: $nodePath" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js first" -ForegroundColor Yellow
    pause
    exit 1
}

# Check if processManager.js exists
$processManagerPath = Join-Path $backendPath "src\processManager.js"
if (-not (Test-Path $processManagerPath)) {
    Write-Host "ERROR: processManager.js not found!" -ForegroundColor Red
    Write-Host "Looking for: $processManagerPath" -ForegroundColor Yellow
    pause
    exit 1
}

# Check if .env file exists
$envPath = Join-Path $backendPath ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host "Please create .env file before starting the backend" -ForegroundColor Yellow
    Write-Host "Location: $envPath" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""

if ($Uninstall) {
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host "UNINSTALLING NATIVE SERVICE" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host ""
    
    # Check if task exists
    $existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Write-Host "Removing scheduled task..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
        Write-Host "Scheduled task removed" -ForegroundColor Green
    } else {
        Write-Host "Task not found: $taskName" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "To stop the running backend, manually close the Node.js process" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 0
}

Write-Host "================================================" -ForegroundColor Yellow
Write-Host "Setting up Native Production Service" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "Backend Path: $backendPath" -ForegroundColor Cyan
Write-Host "Process Manager: $processManagerPath" -ForegroundColor Cyan
Write-Host ""

# Remove existing task if it exists
Write-Host "Checking for existing task..." -ForegroundColor Yellow
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Removing existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "Existing task removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Creating new scheduled task..." -ForegroundColor Yellow

# Create action to start the process manager
$action = New-ScheduledTaskAction -Execute "node.exe" -Argument "`"$processManagerPath`"" -WorkingDirectory $backendPath

# Trigger: At system startup with 30 second delay
$trigger = New-ScheduledTaskTrigger -AtStartup
$trigger.Delay = "PT30S"

# Principal: Run as SYSTEM with highest privileges
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -DontStopOnIdleEnd -ExecutionTimeLimit (New-TimeSpan -Days 0) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

# Register the task
try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Auto-start backend API with native Node.js process manager. Runs on system startup with auto-restart on crash." -ErrorAction Stop | Out-Null
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "SUCCESS! Native service installed!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Task Name: $taskName" -ForegroundColor Green
    Write-Host "Auto-restart on crash: ENABLED" -ForegroundColor Green
    Write-Host "Auto-start on server reboot: ENABLED" -ForegroundColor Green
    Write-Host "Memory monitoring: ENABLED (1GB limit)" -ForegroundColor Green
    $logsPath = Join-Path $backendPath "logs"
    Write-Host "Logs location: $logsPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "IMPORTANT: NO PM2 REQUIRED!" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "This solution uses only built-in Node.js features" -ForegroundColor Cyan
    Write-Host "Perfect for offline/closed network environments" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To start manually:" -ForegroundColor Yellow
    Write-Host "  start-production-native.bat" -ForegroundColor White
    Write-Host ""
    Write-Host "To test the scheduled task:" -ForegroundColor Yellow
    Write-Host "  1. Open Task Scheduler (taskschd.msc)" -ForegroundColor White
    Write-Host "  2. Find: $taskName" -ForegroundColor White
    Write-Host "  3. Right-click -> Run" -ForegroundColor White
    Write-Host ""
    Write-Host "To verify backend is running:" -ForegroundColor Yellow
    Write-Host "  http://localhost:5000/api" -ForegroundColor White
    Write-Host ""
    Write-Host "View logs:" -ForegroundColor Yellow
    Write-Host "  type logs\process-manager.log" -ForegroundColor White
    Write-Host ""
    Write-Host "To uninstall:" -ForegroundColor Yellow
    Write-Host "  .\install-native-service.ps1 -Uninstall" -ForegroundColor White
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


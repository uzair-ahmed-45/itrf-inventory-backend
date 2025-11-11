# Backend Deployment Guide - Windows Server (Without PM2)

## Overview
This guide explains how to deploy the Inventory ITRF backend using direct Node.js and Windows Task Scheduler for auto-start.

**Method**: Direct Node.js execution (no PM2 required)
**Auto-start**: Windows Task Scheduler
**Platform**: Windows Server / Windows 10/11

---

## Prerequisites

### On Internet Machine (Development):
- ✅ Node.js installed
- ✅ Backend folder with all code

### On Offline Server:
- ✅ Node.js installed (download installer from nodejs.org)
- ✅ SQL Server with InventoryDB database

---

## Step 1: Prepare Backend on Internet Machine

### 1.1 Install Production Dependencies

```bash
cd Backend
npm install --production
```

This installs all required packages in `node_modules` folder.

### 1.2 Test the Backend

```bash
# Create .env file first (see Step 2)
node src/index.js
```

Verify it starts without errors.

### 1.3 Files to Deploy

You need to copy these to the offline server:

```
Backend/
├── src/                  ← All source code
├── node_modules/         ← All dependencies (IMPORTANT!)
├── package.json          ← Package info
├── .env.example          ← Template for configuration
├── start-backend.bat     ← Startup script
├── start-backend-hidden.vbs  ← Hidden startup script
└── logs/                 ← Will be created automatically
```

**Files NOT needed on server:**
- ❌ `ecosystem.config.js` (only for PM2)
- ❌ `node_modules/.package-lock.json`
- ❌ `.git` folder

---

## Step 2: Create Configuration File (.env)

On the **offline server**, create a file named `.env` in the Backend folder:

**Location**: `C:\Backend\.env` (or wherever you placed Backend folder)

**Contents**:
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_SERVER=localhost
DB_DATABASE=InventoryDB
DB_USER=sa
DB_PASSWORD=YourActualPassword123
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-min-32-chars
JWT_EXPIRES_IN=24h
```

**⚠️ IMPORTANT**: 
- Change `DB_PASSWORD` to your actual SQL Server password
- Change `JWT_SECRET` to a random secure string (minimum 32 characters)
- If SQL Server is on another machine, change `DB_SERVER` to the server IP/name

---

## Step 3: Deploy to Offline Server

### 3.1 Install Node.js on Offline Server

1. **On Internet Machine**: Download Node.js installer
   - Go to: https://nodejs.org/
   - Download Windows Installer (.msi) - LTS version
   - Copy installer to USB drive

2. **On Offline Server**: Run the installer
   - Install with default settings
   - Check "Add to PATH" option
   - Restart computer after installation

3. **Verify Installation**:
   ```cmd
   node --version
   npm --version
   ```

### 3.2 Copy Backend Files

1. Copy entire `Backend` folder to server
   - Recommended location: `C:\Backend`
   - Make sure `node_modules` folder is included!

2. Create `.env` file (see Step 2)

### 3.3 Create Logs Directory

```cmd
cd C:\Backend
mkdir logs
```

---

## Step 4: Test the Backend

### 4.1 Manual Test

Open Command Prompt as Administrator:

```cmd
cd C:\Backend
node src/index.js
```

**Expected Output**:
```
Database connected successfully
Server is running on port 5000
```

**Test the API**:
- Open browser: `http://localhost:5000/api/health`
- Should see: `{"success": true, "message": "API is running"}`

Press `Ctrl+C` to stop the server.

### 4.2 Test Using Batch File

```cmd
cd C:\Backend
start-backend.bat
```

Should start the server. Press `Ctrl+C` to stop.

---

## Step 5: Setup Auto-Start with Windows Task Scheduler

### Method 1: Using Task Scheduler GUI (Recommended)

#### 5.1 Open Task Scheduler

1. Press `Windows Key + R`
2. Type: `taskschd.msc`
3. Press Enter

#### 5.2 Create New Task

1. In the right panel, click **"Create Task..."** (not "Create Basic Task")

2. **General Tab**:
   - **Name**: `Inventory ITRF Backend`
   - **Description**: `Auto-start backend API server for Inventory ITRF`
   - ✅ Check: **"Run whether user is logged on or not"**
   - ✅ Check: **"Run with highest privileges"**
   - **Configure for**: Windows 10 (or your Windows version)

3. **Triggers Tab**:
   - Click **"New..."**
   - **Begin the task**: `At startup`
   - **Delay task for**: `30 seconds` (gives time for services to start)
   - ✅ Check: **"Enabled"**
   - Click **OK**

4. **Actions Tab**:
   - Click **"New..."**
   - **Action**: `Start a program`
   - **Program/script**: `wscript.exe`
   - **Add arguments**: `"C:\Backend\start-backend-hidden.vbs"`
   - Click **OK**
   
   **Alternative (with visible console)**:
   - **Program/script**: `C:\Backend\start-backend.bat`
   - Leave arguments empty

5. **Conditions Tab**:
   - ❌ Uncheck: **"Start the task only if the computer is on AC power"**
   - ❌ Uncheck: **"Stop if the computer switches to battery power"**

6. **Settings Tab**:
   - ❌ Uncheck: **"Stop the task if it runs longer than"**
   - ✅ Check: **"If the task fails, restart every"**: `1 minute`
   - **Attempt to restart up to**: `3 times`
   - ✅ Check: **"If the running task does not end when requested, force it to stop"**

7. Click **OK**

8. Enter your Windows password when prompted

#### 5.3 Test the Task

1. Right-click on your task: `Inventory ITRF Backend`
2. Click **"Run"**
3. Wait 10 seconds
4. Open browser: `http://localhost:5000/api/health`
5. Should see the API response

#### 5.4 Verify Auto-Start

1. Restart your computer
2. Wait 1 minute after login
3. Open browser: `http://localhost:5000/api/health`
4. Should see the API response (server started automatically!)

---

### Method 2: Using PowerShell Script (Alternative)

Create a PowerShell script to set up the scheduled task:

**Create**: `Backend\setup-auto-start.ps1`

```powershell
# Run this as Administrator

$taskName = "Inventory ITRF Backend"
$scriptPath = "C:\Backend\start-backend-hidden.vbs"

# Remove existing task if it exists
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Create new task
$action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -AtStartup -RandomDelay (New-TimeSpan -Seconds 30)
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -DontStopOnIdleEnd

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Auto-start backend API for Inventory ITRF"

Write-Host "Scheduled task created successfully!"
Write-Host "Task Name: $taskName"
Write-Host "The backend will start automatically on system boot."
```

**Run in PowerShell as Administrator**:
```powershell
cd C:\Backend
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup-auto-start.ps1
```

---

## Step 6: Monitoring and Logs

### 6.1 Check if Backend is Running

**Method 1**: Check in browser
```
http://localhost:5000/api/health
```

**Method 2**: Check with PowerShell
```powershell
Test-NetConnection -ComputerName localhost -Port 5000
```

**Method 3**: Check running Node processes
```cmd
tasklist | findstr node.exe
```

### 6.2 View Logs

Logs are stored in: `C:\Backend\logs\`

**View startup log**:
```cmd
type C:\Backend\logs\startup.log
```

**View latest entries**:
```cmd
powershell -command "Get-Content C:\Backend\logs\startup.log -Tail 20"
```

---

## Step 7: Stop/Start Backend Manually

### Stop Backend

**Method 1**: Task Manager
1. Open Task Manager (`Ctrl+Shift+Esc`)
2. Find `Node.js: Server-side JavaScript`
3. Right-click → End Task

**Method 2**: Command Line
```cmd
taskkill /F /IM node.exe
```

### Start Backend

**Method 1**: Run batch file
```cmd
cd C:\Backend
start-backend.bat
```

**Method 2**: Run via Task Scheduler
1. Open Task Scheduler
2. Find: `Inventory ITRF Backend`
3. Right-click → Run

**Method 3**: Direct command
```cmd
cd C:\Backend
node src/index.js
```

---

## Troubleshooting

### Issue: Backend won't start

**Check 1**: Verify .env file exists
```cmd
cd C:\Backend
dir .env
```

**Check 2**: Verify Node.js is installed
```cmd
node --version
```

**Check 3**: Check if port 5000 is already in use
```cmd
netstat -ano | findstr :5000
```

**Check 4**: View error logs
```cmd
type logs\startup.log
```

### Issue: Database connection failed

**Solution**:
1. Verify SQL Server is running
2. Check `.env` file has correct DB credentials
3. Test connection to SQL Server:
   ```cmd
   sqlcmd -S localhost -U sa -P YourPassword
   ```

### Issue: Task Scheduler task fails

**Solution**:
1. Open Task Scheduler
2. Find your task → Right-click → Properties
3. Go to **History** tab
4. Check for error messages
5. Verify paths in Actions tab are correct

### Issue: Backend stops after some time

**Solution**:
1. Check Windows Task Scheduler → Settings tab
2. Uncheck "Stop the task if it runs longer than"
3. Check logs for crash errors
4. Increase memory if needed

---

## Security Checklist

- ✅ Strong password in `.env` file
- ✅ Change default JWT_SECRET
- ✅ SQL Server access restricted
- ✅ Windows Firewall configured
- ✅ .env file permissions (not accessible by other users)

---

## Quick Reference Commands

```cmd
# Navigate to backend
cd C:\Backend

# Start manually
node src/index.js

# Start with batch file
start-backend.bat

# Check if running
curl http://localhost:5000/api/health

# View logs
type logs\startup.log

# Stop backend
taskkill /F /IM node.exe
```

---

## Files You Need

### Required Files (Must Deploy):
- ✅ `src/` folder - All source code
- ✅ `node_modules/` folder - All dependencies
- ✅ `package.json` - Package configuration
- ✅ `.env` - Your configuration (CREATE ON SERVER)
- ✅ `start-backend.bat` - Startup script
- ✅ `start-backend-hidden.vbs` - Hidden startup

### Optional Files (Not Required):
- ❌ `ecosystem.config.js` - Only for PM2
- ❌ `.env.example` - Just a template
- ❌ `node_modules/.package-lock.json`

---

## Summary

1. ✅ Install Node.js on offline server
2. ✅ Copy Backend folder (with node_modules) to `C:\Backend`
3. ✅ Create `.env` file with your database credentials
4. ✅ Test: `node src/index.js`
5. ✅ Create Task Scheduler task for auto-start
6. ✅ Restart and verify it auto-starts

**That's it!** Your backend will now start automatically every time Windows boots! 🚀


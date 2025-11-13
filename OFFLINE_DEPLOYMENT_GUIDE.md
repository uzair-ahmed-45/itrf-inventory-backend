# Offline Deployment Guide - Closed Network Environment

## Overview
This guide explains how to deploy the backend on an **offline server** in a closed network environment with automatic restart capabilities.

---

## Option 1: PM2 Offline Installation (Recommended)

### Step 1: Prepare PM2 Package (On Internet-Connected Machine)

On a machine **with internet access**, run these commands:

```bash
# Create a directory for offline packages
mkdir pm2-offline-package
cd pm2-offline-package

# Download PM2 and all its dependencies
npm pack pm2

# This creates a file like: pm2-5.3.0.tgz
```

Or download all global dependencies:

```bash
# Create package directory
mkdir pm2-bundle
cd pm2-bundle

# Install PM2 locally (downloads all dependencies)
npm install pm2 pm2-windows-startup

# This creates node_modules with everything needed
```

### Step 2: Transfer to Offline Server

Transfer the entire folder to your offline server via:
- USB drive
- Shared network folder
- Any available file transfer method

### Step 3: Install PM2 Offline

On the **offline server**:

```powershell
# Navigate to the transferred folder
cd D:\path\to\pm2-bundle

# Install PM2 globally from local files
npm install -g .\node_modules\pm2

# Install Windows startup helper
npm install -g .\node_modules\pm2-windows-startup
```

### Step 4: Setup Production Environment

Run the installation script (as Administrator):

```powershell
cd D:\Personal\ITRF\itrf-inventory-backend
.\install-pm2-service.ps1
```

---

## Option 2: Native Node.js Auto-Restart (No External Dependencies)

If PM2 installation is too complex, use our **custom built-in solution** that requires NO external packages.

### Features:
✅ Automatic restart on crash  
✅ Automatic start on server reboot  
✅ Memory monitoring  
✅ Detailed logging  
✅ **Uses only native Node.js - NO npm packages needed**

### Setup:

1. Use the provided `start-production-service.ps1` script
2. This creates a Windows service that monitors and restarts your backend
3. Everything is built-in, no internet required

**See:** `start-production-service.ps1` for setup instructions

---

## Option 3: Windows Service with NSSM (No Node.js Dependencies)

### Download NSSM (On Internet-Connected Machine):
1. Download from: https://nssm.cc/download
2. Extract `nssm.exe`
3. Transfer to offline server

### Setup on Offline Server:

```cmd
# Install as Windows service
nssm install "Inventory-ITRF-Backend" "C:\Program Files\nodejs\node.exe" "D:\Personal\ITRF\itrf-inventory-backend\src\index.js"

# Configure auto-restart
nssm set "Inventory-ITRF-Backend" AppDirectory "D:\Personal\ITRF\itrf-inventory-backend"
nssm set "Inventory-ITRF-Backend" AppExit Default Restart
nssm set "Inventory-ITRF-Backend" AppThrottle 5000
nssm set "Inventory-ITRF-Backend" AppStdout "D:\Personal\ITRF\itrf-inventory-backend\logs\service-out.log"
nssm set "Inventory-ITRF-Backend" AppStderr "D:\Personal\ITRF\itrf-inventory-backend\logs\service-error.log"

# Start the service
nssm start "Inventory-ITRF-Backend"
```

---

## Comparison

| Feature | PM2 Offline | Native Node.js | NSSM |
|---------|-------------|----------------|------|
| Auto-restart on crash | ✅ | ✅ | ✅ |
| Auto-start on reboot | ✅ | ✅ | ✅ |
| Memory limits | ✅ | ✅ | ❌ |
| Zero-downtime reload | ✅ | ❌ | ❌ |
| Setup complexity | Medium | Easy | Easy |
| External dependencies | Yes (offline install) | **NO** | Yes (exe file) |
| Production-ready | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Recommended for Your Case

**For 100+ users in offline environment:**

1. **Best**: PM2 Offline Installation (most features)
2. **Easiest**: Native Node.js Solution (no dependencies, works immediately)
3. **Alternative**: NSSM (if you need Windows service)

Choose based on your comfort level and deployment requirements.


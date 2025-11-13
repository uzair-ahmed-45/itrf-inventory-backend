# 🚀 Production Setup - Quick Start Guide

## For Offline/Closed Network Deployment (100+ Users)

---

## ⚡ **RECOMMENDED: Native Node.js Solution**

### ✅ **Why This Solution?**
- ✅ **NO external dependencies** (no PM2, no npm packages to install offline)
- ✅ **Auto-restart on crash** - built-in recovery
- ✅ **Auto-start on server reboot** - via Windows Task Scheduler
- ✅ **Memory monitoring** - restarts if exceeds 1GB
- ✅ **Production-grade logging**
- ✅ **Perfect for offline environments**

### 📋 **Setup Steps:**

#### 1. **Deploy Your Application**
Transfer your entire backend folder to the offline server:
```
D:\Personal\ITRF\itrf-inventory-backend\
```

#### 2. **Install Dependencies (One-time)**
On a machine with internet, prepare node_modules:
```bash
cd itrf-inventory-backend
npm install --production
```
Then transfer the `node_modules` folder to the offline server.

#### 3. **Create .env File**
Create `.env` file in the backend root with your database configuration:
```env
PORT=5000
DB_SERVER=your_db_server
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your-secret-key-here
```

#### 4. **Install as Windows Service (One-time)**

**Open PowerShell as Administrator** and run:
```powershell
cd D:\Personal\ITRF\itrf-inventory-backend
.\install-native-service.ps1
```

This will:
- Create a Windows Task Scheduler task
- Configure auto-start on system boot
- Enable automatic crash recovery

#### 5. **Verify It's Running**

Open browser and check:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-xx-xxTxx:xx:xx.xxxZ"
}
```

---

## 🔧 **Manual Start (For Testing)**

To manually test before installing as service:

```cmd
start-production-native.bat
```

This starts the backend with:
- Auto-restart enabled
- Memory monitoring
- Detailed logging

Press **Ctrl+C** to stop.

---

## 📊 **Monitoring**

### View Logs:
```powershell
# View process manager logs
type logs\process-manager.log

# View latest logs (last 50 lines)
Get-Content logs\process-manager.log -Tail 50

# Watch logs in real-time
Get-Content logs\process-manager.log -Wait -Tail 50
```

### Check if Running:
```powershell
# Check if node process is running
Get-Process node

# Check Task Scheduler
taskschd.msc
# Look for: "Inventory ITRF Backend Native"
```

---

## 🔄 **What Happens When:**

| Scenario | Result |
|----------|--------|
| **Backend crashes** | ✅ Automatically restarts within 1 second |
| **Out of memory** | ✅ Automatically restarts when exceeds 1GB |
| **Server reboots** | ✅ Automatically starts 30 seconds after boot |
| **Too many crashes** | ⚠️ Stops after 10 restarts in 60 seconds (prevents infinite loop) |
| **Manual stop** | Graceful shutdown (closes all connections properly) |

---

## 🛠️ **Management Commands**

### To Uninstall:
```powershell
# Run as Administrator
.\install-native-service.ps1 -Uninstall
```

### To Restart Manually:
1. Open **Task Scheduler** (`taskschd.msc`)
2. Find **"Inventory ITRF Backend Native"**
3. Right-click → **End** (to stop)
4. Right-click → **Run** (to start)

Or use PowerShell:
```powershell
# Stop (kill the node process)
Stop-Process -Name node -Force

# The Task Scheduler will automatically restart it
```

---

## ⚠️ **Important Notes**

1. **First Run**: After installing the service, the backend will start automatically on next reboot. To start immediately, run the task manually from Task Scheduler.

2. **Logs**: Check `logs\process-manager.log` for detailed information about starts, stops, restarts, and errors.

3. **Port Conflicts**: Make sure port 5000 is not used by another application.

4. **Firewall**: If accessing from other machines, ensure Windows Firewall allows port 5000.

5. **Updates**: After updating your code, restart the task from Task Scheduler or reboot the server.

---

## 🔐 **Security Recommendations**

For production with 100+ users:

1. ✅ Use strong `JWT_SECRET` in `.env`
2. ✅ Use database user with minimal permissions
3. ✅ Enable Windows Firewall
4. ✅ Restrict network access to trusted IPs only
5. ✅ Regular backup of logs directory
6. ✅ Monitor logs for unusual activity

---

## 🆘 **Troubleshooting**

### Backend Not Starting?

1. **Check logs:**
   ```powershell
   type logs\process-manager.log
   type logs\startup.log
   ```

2. **Check if Node.js is accessible:**
   ```cmd
   node --version
   ```

3. **Check .env file exists:**
   ```cmd
   dir .env
   ```

4. **Check database connection:**
   - Verify `DB_SERVER` in `.env`
   - Test database connectivity

5. **Check Task Scheduler:**
   - Open `taskschd.msc`
   - Find "Inventory ITRF Backend Native"
   - Check "Last Run Result" (should be 0x0 for success)

### Backend Keeps Restarting?

Check logs for the error:
```powershell
type logs\process-manager.log | Select-String "ERROR"
```

Common issues:
- Database connection failed
- Port 5000 already in use
- Missing dependencies in `node_modules`
- Syntax error in code

---

## 📞 **Quick Reference**

| Task | Command |
|------|---------|
| Install service | `.\install-native-service.ps1` |
| Uninstall service | `.\install-native-service.ps1 -Uninstall` |
| Manual start (test) | `start-production-native.bat` |
| View logs | `type logs\process-manager.log` |
| Check health | `http://localhost:5000/api/health` |
| Task Scheduler | `taskschd.msc` |

---

## ✨ **You're All Set!**

Your backend is now production-ready with:
- ✅ Automatic crash recovery
- ✅ Automatic reboot recovery  
- ✅ Memory management
- ✅ Production-grade logging
- ✅ **NO internet required!**

Perfect for your closed network environment with 100+ users! 🎉


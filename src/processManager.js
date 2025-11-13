/**
 * ================================================
 * Native Node.js Process Manager
 * ================================================
 * Production-grade process manager with auto-restart
 * NO external dependencies required - uses only Node.js built-ins
 * Perfect for offline/closed network deployments
 * ================================================
 */

import cluster from 'cluster';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  workers: 1, // Number of worker processes (1 for single instance)
  maxRestarts: 10, // Maximum restarts within the restart window
  restartWindow: 60000, // Time window for counting restarts (1 minute)
  gracefulShutdownTimeout: 30000, // 30 seconds for graceful shutdown
  minUptime: 5000, // Minimum uptime before considering it a successful start
  memoryLimit: 1024 * 1024 * 1024, // 1GB memory limit
  memoryCheckInterval: 30000, // Check memory every 30 seconds
  logDir: path.join(__dirname, '..', 'logs'),
  scriptPath: path.join(__dirname, 'index.js')
};

// Worker tracking
const workerRestarts = new Map();
const workerStartTimes = new Map();

/**
 * Initialize log directory
 */
function initLogDirectory() {
  if (!fs.existsSync(CONFIG.logDir)) {
    fs.mkdirSync(CONFIG.logDir, { recursive: true });
  }
}

/**
 * Log message to file and console
 */
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  const logFile = path.join(CONFIG.logDir, 'process-manager.log');
  fs.appendFileSync(logFile, logMessage);
}

/**
 * Check if worker should be restarted based on restart count
 */
function canRestart(workerId) {
  const now = Date.now();
  const restarts = workerRestarts.get(workerId) || [];
  
  // Remove old restart records outside the window
  const recentRestarts = restarts.filter(time => now - time < CONFIG.restartWindow);
  workerRestarts.set(workerId, recentRestarts);
  
  if (recentRestarts.length >= CONFIG.maxRestarts) {
    log(`Worker ${workerId} has restarted ${recentRestarts.length} times in the last ${CONFIG.restartWindow / 1000}s. Stopping restarts.`, 'ERROR');
    return false;
  }
  
  return true;
}

/**
 * Record worker restart
 */
function recordRestart(workerId) {
  const restarts = workerRestarts.get(workerId) || [];
  restarts.push(Date.now());
  workerRestarts.set(workerId, restarts);
}

/**
 * Check worker memory usage
 */
function checkWorkerMemory(worker) {
  if (!worker.process.pid) return;
  
  const memUsage = process.memoryUsage();
  const heapUsed = memUsage.heapUsed;
  
  log(`Worker ${worker.id} memory: ${Math.round(heapUsed / 1024 / 1024)}MB`, 'DEBUG');
  
  if (heapUsed > CONFIG.memoryLimit) {
    log(`Worker ${worker.id} exceeded memory limit (${Math.round(heapUsed / 1024 / 1024)}MB > ${Math.round(CONFIG.memoryLimit / 1024 / 1024)}MB). Restarting...`, 'WARN');
    worker.process.kill('SIGTERM');
  }
}

/**
 * Start a worker
 */
function startWorker() {
  const worker = cluster.fork();
  const workerId = worker.id;
  
  workerStartTimes.set(workerId, Date.now());
  log(`Starting worker ${workerId} (PID: ${worker.process.pid})`);
  
  // Monitor memory usage
  const memoryMonitor = setInterval(() => {
    checkWorkerMemory(worker);
  }, CONFIG.memoryCheckInterval);
  
  worker.on('exit', (code, signal) => {
    clearInterval(memoryMonitor);
    workerStartTimes.delete(workerId);
    
    const uptime = Date.now() - (workerStartTimes.get(workerId) || Date.now());
    
    if (signal) {
      log(`Worker ${workerId} was killed by signal: ${signal}`, 'WARN');
    } else if (code !== 0) {
      log(`Worker ${workerId} exited with error code: ${code}`, 'ERROR');
    } else {
      log(`Worker ${workerId} exited successfully`);
    }
    
    // Check if worker crashed too quickly
    if (uptime < CONFIG.minUptime) {
      log(`Worker ${workerId} crashed too quickly (uptime: ${uptime}ms)`, 'ERROR');
    }
    
    // Attempt restart
    if (canRestart(workerId)) {
      recordRestart(workerId);
      log(`Restarting worker ${workerId}...`, 'INFO');
      setTimeout(() => startWorker(), 1000); // Wait 1 second before restart
    } else {
      log(`Worker ${workerId} will not be restarted (too many restarts)`, 'ERROR');
      
      // If no workers are left, exit the master process
      if (Object.keys(cluster.workers).length === 0) {
        log('No workers remaining. Exiting master process.', 'ERROR');
        process.exit(1);
      }
    }
  });
  
  return worker;
}

/**
 * Handle graceful shutdown
 */
function gracefulShutdown(signal) {
  log(`Received ${signal}. Starting graceful shutdown...`, 'INFO');
  
  const workers = Object.values(cluster.workers);
  let workersShutdown = 0;
  
  workers.forEach(worker => {
    worker.process.kill('SIGTERM');
    
    worker.once('exit', () => {
      workersShutdown++;
      if (workersShutdown === workers.length) {
        log('All workers shut down. Exiting master process.', 'INFO');
        process.exit(0);
      }
    });
  });
  
  // Force shutdown after timeout
  setTimeout(() => {
    log('Graceful shutdown timeout. Forcing exit.', 'WARN');
    workers.forEach(worker => {
      worker.process.kill('SIGKILL');
    });
    process.exit(1);
  }, CONFIG.gracefulShutdownTimeout);
}

/**
 * Master process logic
 */
function runMaster() {
  log('='.repeat(60));
  log('Process Manager Starting');
  log('='.repeat(60));
  log(`Node.js version: ${process.version}`);
  log(`Platform: ${os.platform()} ${os.arch()}`);
  log(`CPUs: ${os.cpus().length}`);
  log(`Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`);
  log(`Workers: ${CONFIG.workers}`);
  log(`Memory limit per worker: ${Math.round(CONFIG.memoryLimit / 1024 / 1024)}MB`);
  log('='.repeat(60));
  
  // Initialize log directory
  initLogDirectory();
  
  // Start workers
  for (let i = 0; i < CONFIG.workers; i++) {
    startWorker();
  }
  
  // Handle process signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Log master process info
  log(`Master process started (PID: ${process.pid})`);
  log('Process manager is running. Press Ctrl+C to stop.');
}

/**
 * Worker process logic
 */
async function runWorker() {
  try {
    // Import and start the actual application
    const app = await import('./index.js');
    
    // Handle worker signals
    process.on('SIGTERM', () => {
      log(`Worker ${cluster.worker.id} received SIGTERM. Shutting down gracefully...`, 'INFO');
      
      // Close server if exists
      if (app.server && typeof app.server.close === 'function') {
        app.server.close(() => {
          log(`Worker ${cluster.worker.id} closed all connections`, 'INFO');
          process.exit(0);
        });
        
        // Force exit after timeout
        setTimeout(() => {
          log(`Worker ${cluster.worker.id} forced shutdown`, 'WARN');
          process.exit(1);
        }, CONFIG.gracefulShutdownTimeout);
      } else {
        process.exit(0);
      }
    });
    
  } catch (error) {
    log(`Worker ${cluster.worker.id} failed to start: ${error.message}`, 'ERROR');
    console.error(error);
    process.exit(1);
  }
}

/**
 * Main entry point
 */
if (cluster.isPrimary || cluster.isMaster) {
  runMaster();
} else {
  runWorker();
}

export default cluster;


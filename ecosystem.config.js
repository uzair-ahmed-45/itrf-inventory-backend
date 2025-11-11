module.exports = {
  apps: [{
    name: 'inventory-api',
    script: './src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // Restart settings
    min_uptime: '10s',
    max_restarts: 10,
    // Error handling
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};


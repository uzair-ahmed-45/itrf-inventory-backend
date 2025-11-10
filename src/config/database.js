import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '141421',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433, 
  database: process.env.DB_NAME || 'InventoryDB',
  options: {
    encrypt: false, // Set to false for local development
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000 // Increase timeout to 30 seconds
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Debug logging
console.log('=== DATABASE CONFIGURATION DEBUG ===');
console.log('DB_SERVER from .env:', process.env.DB_SERVER);
console.log('Effective server config:', config.server);
console.log('====================================');

// Create connection pool
let pool = null;

export const getConnection = async () => {
  try {
    if (pool) {
      return pool;
    }
    pool = await sql.connect(config);
    console.log('Connected to MSSQL database');
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Test connection function
export const testConnection = async () => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT 1 AS result');
    console.log('Database connection test successful:', result.recordset);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

// Close connection pool
export const closeConnection = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('Database connection closed');
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

export default { getConnection, testConnection, closeConnection };


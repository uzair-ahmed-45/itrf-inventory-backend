import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getConnection } from './config/database.js';
import { initializeDatabase as initDB } from './config/initDatabase.js';
import cors from 'cors';

app.use(cors({
    origin: "http://133.125.99.61:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors()); // VERY IMPORTANT

// Import routes
import authRoutes from './routes/authRoutes.js';
import setupRoutes from './routes/setupRoutes.js';
import setupDetailRoutes from './routes/setupDetailRoutes.js';
import userRoutes from './routes/userRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import unitRoutes from './routes/unitRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/setups', setupRoutes);
app.use('/api/setup-details', setupDetailRoutes);
app.use('/api/users', userRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Initialize database and start server
let server;

const startServer = async () => {
  try {
    // Connect to database
    console.log('Connecting to database...');
    await getConnection();
    console.log('Database connected successfully');

    // Initialize database tables
    // console.log('Initializing database tables...');
    // await initDB();
    
    // Start server
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API endpoints available at http://0.0.0.0:${PORT}/api`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Start the server
startServer();

export default app;
export { server };


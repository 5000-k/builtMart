const dotenv = require('dotenv');
const app = require('./app.js');
const connectDB = require('./config/db.js');
const { configureCloudinary } = require('./config/cloudinary.js');
const logger = require('./utils/logger.js');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  if (process.env.VERCEL !== '1') {
    process.exit(1);
  }
}

// Initialize database connection (will be reused across invocations)
let dbInitialized = false;

async function initializeServices() {
  if (!dbInitialized) {
    try {
      await connectDB();
      configureCloudinary();
      dbInitialized = true;
      logger.info('Services initialized successfully');
    } catch (error) {
      logger.error(`Service initialization failed: ${error.message}`);
      throw error;
    }
  }
}

// Check if running on Vercel (serverless)
if (process.env.VERCEL === '1') {
  // Export the Express app for serverless
  module.exports = async function handler(req, res) {
    try {
      await initializeServices();
      app(req, res);
    } catch (error) {
      logger.error(`Handler error: ${error.message}`);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
} else {
  // Traditional server deployment
  // Connect to database
  connectDB();
  
  // Configure third-party services
  configureCloudinary();
  
  // Start server
  const PORT = process.env.PORT || 5000;
  
  const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    logger.info(`API available at http://localhost:${PORT}/api`);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    logger.error(err.stack);
    
    // Close server & exit process
    server.close(() => {
      process.exit(1);
    });
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    logger.error(err.stack);
    
    // Exit process
    process.exit(1);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });
}
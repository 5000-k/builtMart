import dotenv from 'dotenv';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import { configureCloudinary } from '../src/config/cloudinary.js';
import { configurePaddle } from '../src/config/paddle.js';
import logger from '../src/utils/logger.js';

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
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Initialize database connection (will be reused across invocations)
let dbInitialized = false;

async function initializeServices() {
  if (!dbInitialized) {
    try {
      await connectDB();
      configureCloudinary();
      configurePaddle();
      dbInitialized = true;
      logger.info('Services initialized successfully');
    } catch (error) {
      logger.error(`Service initialization failed: ${error.message}`);
      throw error;
    }
  }
}

// Export the Express app for serverless
export default async function handler(req, res) {
  try {
    await initializeServices();
    return app(req, res);
  } catch (error) {
    logger.error(`Handler error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

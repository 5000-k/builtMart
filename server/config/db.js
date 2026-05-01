import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!uri) {
      logger.error('MONGODB_URI environment variable is NOT SET');
      logger.error('Please set MONGODB_URI in Render Environment Variables');
      process.exit(1);
    }
    
    // Debug: log the connection attempt (masked URI)
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    logger.info(`Attempting MongoDB connection to: ${maskedUri}`);
    
    // Reuse existing connection in serverless environment
    if (mongoose.connection.readyState >= 1) {
      logger.info('Using existing MongoDB connection');
      return mongoose.connection;
    }

    const conn = await mongoose.connect(uri, {
      // Mongoose 7+ no longer needs these options
      // useNewUrlParser and useUnifiedTopology are default
      maxPoolSize: 10, // Limit connection pool for serverless
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown (only for non-serverless environments)
    if (process.env.VERCEL !== '1') {
      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      });
    }

    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    // Don't call process.exit in serverless - throw error instead
    if (process.env.VERCEL === '1') {
      throw error;
    }
    process.exit(1);
  }
};

export default connectDB;

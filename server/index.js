import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import { configurePaddle } from './config/paddle.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

// PORT is only required for non-serverless environments
if (process.env.VERCEL !== '1') {
  requiredEnvVars.push('PORT');
}

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Connect to database
connectDB();

// Configure third-party services
configureCloudinary();
configurePaddle();

// Homepage route with welcome message
app.get('/', (req, res) => {
  const quotes = [
    "Quality tools for quality work",
    "Build your dreams, one tool at a time",
    "Where every project begins with the right tools",
    "Your trusted partner in every build",
    "From foundation to finish, we've got you covered"
  ];
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BuiltMart Hardware Store API</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          padding: 60px 40px;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
        }
        .logo {
          font-size: 48px;
          margin-bottom: 10px;
        }
        h1 {
          color: #2d3748;
          font-size: 36px;
          margin-bottom: 10px;
          font-weight: 700;
        }
        .tagline {
          color: #667eea;
          font-size: 20px;
          margin-bottom: 30px;
          font-weight: 600;
        }
        .quote {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 25px 30px;
          border-radius: 15px;
          font-size: 18px;
          font-style: italic;
          margin: 30px 0;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }
        .info {
          color: #718096;
          font-size: 14px;
          margin-top: 30px;
          line-height: 1.6;
        }
        .api-link {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 12px 30px;
          border-radius: 8px;
          text-decoration: none;
          margin-top: 20px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .api-link:hover {
          background: #764ba2;
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
        .status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #f0fff4;
          color: #22543d;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 20px;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          background: #48bb78;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 30px;
        }
        .feature {
          background: #f7fafc;
          padding: 15px;
          border-radius: 10px;
          font-size: 14px;
          color: #4a5568;
        }
        .feature-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🛠️</div>
        <h1>Welcome to BuiltMart</h1>
        <p class="tagline">Hardware Store API</p>
        
        <div class="quote">
          "${randomQuote}"
        </div>
        
        <div class="status">
          <span class="status-dot"></span>
          API Server Running
        </div>
        
        <div class="features">
          <div class="feature">
            <div class="feature-icon">🔐</div>
            <strong>Secure Auth</strong>
          </div>
          <div class="feature">
            <div class="feature-icon">📦</div>
            <strong>Product Mgmt</strong>
          </div>
          <div class="feature">
            <div class="feature-icon">💳</div>
            <strong>Payments</strong>
          </div>
          <div class="feature">
            <div class="feature-icon">📊</div>
            <strong>Analytics</strong>
          </div>
        </div>
        
        <a href="/health" class="api-link">Check API Health</a>
        
        <p class="info">
          <strong>BuiltMart API v1.0</strong><br>
          RESTful API for hardware e-commerce platform<br>
          © ${new Date().getFullYear()} BuiltMart. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `);
});

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

export default server;

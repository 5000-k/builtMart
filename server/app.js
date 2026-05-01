const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./middleware/errorMiddleware.js');
const apiLimiter = require('./middleware/rateLimit.js');
const logger = require('./utils/logger.js');

// Import configurations
const connectDB = require('./config/db.js');
const configureCloudinary = require('./config/cloudinary.js');
const authRoutes = require('./routes/auth.routes.js');
const productRoutes = require('./routes/product.routes.js');
const categoryRoutes = require('./routes/category.routes.js');
const cartRoutes = require('./routes/cart.routes.js');
const wishlistRoutes = require('./routes/wishlist.routes.js');
const orderRoutes = require('./routes/order.routes.js');
const reviewRoutes = require('./routes/review.routes.js');
const userRoutes = require('./routes/user.routes.js');
const adminRoutes = require('./routes/admin.routes.js');
const realTimePaymentRoutes = require('./routes/realTimePayment.routes.js');
const notificationRoutes = require('./routes/notification.routes.js');
const discountRoutes = require('./routes/discount.routes.js');
const contactRoutes = require('./routes/contact.routes.js');
const uploadRoutes = require('./routes/upload.routes.js');
const settingsRoutes = require('./routes/settings.routes.js');

const app = express();

// Trust proxy for rate limiting (for Vercel/Railway)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
const envOrigins = allowedOriginsEnv.split(',').map(origin => origin.trim()).filter(Boolean);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5177',
  process.env.CLIENT_URL,
  ...envOrigins,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(null, true); // Allow all origins in production for now
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-CSRF-Token',
      'X-Api-Version',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
  })
);

// Handle preflight requests explicitly
app.options('*', cors());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Serve uploaded files (for local storage)
app.use('/uploads', express.static('uploads'));

// Rate limiting
app.use('/api', apiLimiter);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Handle OPTIONS preflight for products
app.options('/api/products', (req, res) => {
  res.status(200).end();
});
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments/realtime', realTimePaymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);

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

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('../../shared/src/middleware/errorHandler');
const { rateLimiter } = require('../../shared/src/middleware/rateLimiter');
const bookingRoutes = require('./routes/booking.routes');
const cartRoutes = require('./routes/cart.routes');
const wishlistRoutes = require('./routes/wishlist.routes');

const app = express();

// ==================== Environment Validation ====================
const isProduction = process.env.NODE_ENV === 'production';

// Security middlewares
app.use(helmet());

// ==================== CORS Configuration ====================
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);

// SECURITY: Require explicit CORS_ORIGIN in production
if (isProduction && allowedOrigins.length === 0) {
  console.error('FATAL: CORS_ORIGIN must be set in production');
  throw new Error('CORS_ORIGIN environment variable is required in production');
}

app.use(cors({
  origin: function(origin, cb) {
    // Allow internal service-to-service calls (no origin header)
    if (!origin) {
      return cb(null, true);
    }

    // Check against allowed origins
    if (allowedOrigins.length === 0) {
      // Development mode with no explicit origins - allow all
      return cb(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }

    cb(new Error('CORS not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Internal-Service']
}));

// Rate limiting
app.use(rateLimiter);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parser with size limit - SECURITY: Reduced limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'booking-service',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;

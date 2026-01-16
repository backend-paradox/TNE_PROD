const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { authLimiter } = require('../../shared/src/middleware/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./middleware/errorHandlers');

const app = express();

// ==================== Environment Validation ====================
const isProduction = process.env.NODE_ENV === 'production';

// Security middlewares
app.use(helmet());

// ==================== CORS Configuration ====================
const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);

// SECURITY: Require explicit FRONTEND_URL in production
if (isProduction && allowedOrigins.length === 0) {
  console.error('FATAL: FRONTEND_URL must be set in production');
  throw new Error('FRONTEND_URL environment variable is required in production');
}

app.use(cors({
  origin: function(origin, cb) {
    // In development, allow requests without origin (Postman, curl, etc.)
    if (!origin) {
      if (isProduction) {
        return cb(new Error('Origin header required'));
      }
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
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Body parser - SECURITY: Reduced limit for auth requests
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting for auth routes
app.use('/api/v1/auth', authLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('../../shared/src/middleware/errorHandler');
const { rateLimiter } = require('../../shared/src/middleware/rateLimiter');
const adminRoutes = require('./routes/admin.routes');
const catalogRoutes = require('./routes/catalog.routes');

const app = express();

// ==================== Environment Validation ====================
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware
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

// Request logging
app.use(morgan(isProduction ? 'combined' : 'dev'));

// Body parsing - SECURITY: Reduced limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'crmsync-service',
    timestamp: new Date().toISOString()
  });
});

// API routes - mounted at /api/v1/crmsync to match API Gateway routing
// IMPORTANT: More specific routes (catalog) must be mounted BEFORE less specific routes (admin)
app.use('/api/v1/crmsync/catalog', catalogRoutes); // Public catalog endpoints for chatbot
app.use('/api/v1/crmsync', adminRoutes); // Protected admin endpoints

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { errorHandler } = require('../../shared/src/middleware/errorHandler');
const { rateLimiter } = require('../../shared/src/middleware/rateLimiter');
const userRoutes = require('./routes/user.routes');

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
} else {
  app.use(morgan('combined'));
}

// Body parser with size limit - SECURITY: Reduced from 10mb
// IMPORTANT: Skip body parsing for multipart/form-data to allow multer to handle file uploads
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return next(); // Skip - multer will handle
  }
  express.json({ limit: '5mb' })(req, res, next);
});
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return next(); // Skip - multer will handle
  }
  express.urlencoded({ extended: true, limit: '5mb' })(req, res, next);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'user-service',
    timestamp: new Date().toISOString(),
  });
});

// ==================== Static File Serving (Local Uploads - Dev Only) ====================
// In production, files are served from S3/CDN
if (!isProduction) {
  const uploadsPath = path.join(__dirname, '../uploads');
  // Allow cross-origin access to uploaded images (needed for frontend at different port)
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  }, express.static(uploadsPath, {
    maxAge: '1d', // Cache for 1 day
    etag: true,
    lastModified: true,
  }));
}

// API routes
app.use('/api/v1/users', userRoutes);

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

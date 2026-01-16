const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/env');

// Import routes
const conversationRoutes = require('./routes/conversation.routes');
const messageRoutes = require('./routes/message.routes');
const healthRoutes = require('./routes/health.routes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFoundHandler');

const app = express();

// ==================== Environment Validation ====================
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware
app.use(helmet());

// ==================== CORS Configuration ====================
const allowedOrigins = (config.socket.corsOrigin || '').split(',').map(s => s.trim()).filter(Boolean);

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

// Request parsing - SECURITY: Reduced limits
// Skip body parsing for multipart/form-data (let multer handle it)
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return next(); // Skip - multer will handle
  }
  express.json({ limit: '5mb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
}

// Static file serving for uploads (development only)
if (!isProduction) {
  const uploadsPath = path.join(__dirname, '../uploads');
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  }, express.static(uploadsPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true,
  }));
}

// Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/chat/conversations', conversationRoutes);
app.use('/api/v1/chat/messages', messageRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

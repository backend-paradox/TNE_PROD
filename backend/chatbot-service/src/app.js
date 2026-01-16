const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const chatbotRoutes = require('./routes/chatbot.routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = config.corsOrigin.split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: function(origin, cb) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      return cb(null, true);
    }

    // Development mode - allow all
    if (config.env === 'development' && allowedOrigins.length === 0) {
      return cb(null, true);
    }

    // Check against allowed origins
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return cb(null, true);
    }

    cb(new Error('CORS not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

// Request logging
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'chatbot-service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/v1/chatbot', chatbotRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  // CORS error
  if (err.message === 'CORS not allowed') {
    return res.status(403).json({
      status: 'error',
      code: 'CORS_ERROR',
      message: 'Cross-origin request blocked'
    });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      status: 'error',
      code: 'DUPLICATE_ENTRY',
      message: 'A record with this value already exists'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      status: 'error',
      code: 'NOT_FOUND',
      message: 'Record not found'
    });
  }

  // JSON parse error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      code: 'INVALID_JSON',
      message: 'Invalid JSON in request body'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    status: 'error',
    code: err.code || 'INTERNAL_ERROR',
    message: config.env === 'production' ? 'An unexpected error occurred' : err.message
  });
});

module.exports = app;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const paymentRoutes = require('./routes/paymentRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();

// ==================== Environment Validation ====================
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware
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

// Body parser middleware
// NOTE: For webhooks, we need raw body, so we handle it differently
app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(isProduction ? 'combined' : 'dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Payment service is healthy',
    timestamp: new Date().toISOString(),
    service: 'payment-service',
  });
});

// API Routes
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/webhooks', webhookRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  // SECURITY: Don't log full error in production
  if (!isProduction) {
    console.error('Error:', err);
  } else {
    console.error('Error:', err.message);
  }

  const statusCode = err.statusCode || 500;
  const message = isProduction && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(!isProduction && { stack: err.stack }),
  });
});

module.exports = app;

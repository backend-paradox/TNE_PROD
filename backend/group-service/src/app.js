const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');

// Import routes
const groupRoutes = require('./routes/group.routes');
const memberRoutes = require('./routes/member.routes');
const itineraryRoutes = require('./routes/itinerary.routes');
const expenseRoutes = require('./routes/expense.routes');
const pollRoutes = require('./routes/poll.routes');
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

// Request parsing - SECURITY: Reduced limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
}

// Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/groups', memberRoutes);
app.use('/api/v1/groups', itineraryRoutes);
app.use('/api/v1/groups', expenseRoutes);
app.use('/api/v1/groups', pollRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

// ==============================================================================
// TNE Notification Service - Express Application
// ==============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const notificationRoutes = require('./routes/notificationRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// ==============================================================================
// Middleware
// ==============================================================================

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: config.corsOrigin.split(',').map(origin => origin.trim()),
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/health' && !req.path.startsWith('/health/')) {
      logger.debug(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
});

// ==============================================================================
// Routes
// ==============================================================================

// Health checks
app.use('/health', healthRoutes);

// API routes
app.use('/api/v1/notifications', notificationRoutes);

// Legacy route support (if gateway strips /api/v1)
app.use('/notifications', notificationRoutes);

// ==============================================================================
// Error Handling
// ==============================================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;

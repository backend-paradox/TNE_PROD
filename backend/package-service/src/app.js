const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');

// Import routes
const tourRoutes = require('./routes/tour.routes');
const cineTripRoutes = require('./routes/cinetrip.routes');
const seedRoutes = require('./routes/seed.routes');

const app = express();

// Middleware
app.use(helmet());
// CORS handled by API Gateway - allow all for internal service-to-service calls
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'package-service',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/tour-packages', tourRoutes);
app.use('/api/v1/cinetrip-packages', cineTripRoutes);
app.use('/api/v1/seed', seedRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;

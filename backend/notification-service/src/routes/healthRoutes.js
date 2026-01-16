// ==============================================================================
// Health Check Routes
// ==============================================================================

const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const logger = require('../utils/logger');

// Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'notification-service',
    timestamp: new Date().toISOString(),
  });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  const health = {
    status: 'ok',
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = { status: 'ok' };
  } catch (error) {
    health.status = 'degraded';
    health.checks.database = { status: 'error', message: error.message };
  }

  // Memory check
  const memUsage = process.memoryUsage();
  health.checks.memory = {
    status: 'ok',
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
  };

  // Uptime
  health.uptime = `${Math.round(process.uptime())}s`;

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Readiness check
router.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

// Liveness check
router.get('/live', (req, res) => {
  res.json({ status: 'alive' });
});

module.exports = router;

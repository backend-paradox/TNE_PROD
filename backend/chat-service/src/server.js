// Load environment configuration FIRST (before anything else)
const config = require('./config/env');

// Set DATABASE_URL for Prisma (must be done before importing app)
process.env.DATABASE_URL = config.databaseUrl;

const http = require('http');
const app = require('./app');
const prisma = require('./config/prisma');
const { initializeSocket } = require('./config/socket');
const { setupSocketHandlers } = require('./events/socketHandlers');
const logger = require('./utils/logger');

const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Setup socket event handlers
setupSocketHandlers(io);

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    await prisma.$disconnect();
    logger.info('Database connection closed');

    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    server.listen(config.port, () => {
      logger.info(`Chat Service running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Socket.IO ready for connections`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

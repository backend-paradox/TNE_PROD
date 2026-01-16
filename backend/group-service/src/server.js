// Load environment configuration FIRST
const config = require('./config/env');

// Set DATABASE_URL for Prisma (must be done before importing app)
process.env.DATABASE_URL = config.databaseUrl;

const app = require('./app');
const prisma = require('./config/prisma');
const logger = require('./utils/logger');

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  await prisma.$disconnect();
  logger.info('Database connection closed');

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    app.listen(config.port, () => {
      logger.info(`Group Service running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

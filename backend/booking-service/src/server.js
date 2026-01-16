// Load shared environment config FIRST
const config = require('./config/env');

// Set DATABASE_URL for Prisma (must be done before importing app)
process.env.DATABASE_URL = config.databaseUrl;

const app = require('./app');
const prisma = require('./config/prisma');
const { createLogger } = require('../../shared/src/utils/logger');

const logger = createLogger('booking-service');
const PORT = config.port;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', { error: err.message, stack: err.stack });
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    const server = app.listen(PORT, () => {
      logger.info(`Booking Service running on port ${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! Shutting down...', { error: err.message, stack: err.stack });
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(1);
      });
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await prisma.$disconnect();
          logger.info('Database connection closed');
          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (err) {
          logger.error('Error during shutdown', { error: err.message });
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();

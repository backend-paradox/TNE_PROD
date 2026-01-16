// Load environment configuration FIRST (before anything else)
const { env } = require('./config/env'); // Validates environment on load

// Set DATABASE_URL for Prisma (must be done before importing app)
process.env.DATABASE_URL = env.DATABASE_URL;

const app = require('./app');
const prisma = require('./config/prisma');
const { createLogger } = require('../../shared/src/utils/logger');

const logger = createLogger('user-service');
const PORT = env.PORT;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', { error: err.message, stack: err.stack });
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    console.log('🔍 Validating environment configuration...');
    console.log(`✅ Environment: ${env.NODE_ENV}`);
    console.log(`✅ Port: ${env.PORT}`);

    // Test database connection
    console.log('🔌 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    const server = app.listen(PORT, () => {
      console.log('=========================================');
      console.log(`🚀 User Service running on port ${PORT}`);
      console.log(`📝 Environment: ${env.NODE_ENV}`);
      console.log(`🔐 JWT configured with ${env.JWT_REFRESH_SECRET ? 'separate' : 'same'} refresh secret`);
      console.log(`🔗 Auth service: ${env.AUTH_SERVICE_URL || 'not configured'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log('=========================================');
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

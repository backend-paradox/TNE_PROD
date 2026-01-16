// ==============================================================================
// TNE Notification Service - Server Entry Point
// ==============================================================================

// Load environment configuration FIRST (before anything else)
const config = require('./config/env');

// Set DATABASE_URL for Prisma (must be done before importing app)
process.env.DATABASE_URL = config.databaseUrl;

const http = require('http');
const app = require('./app');
const logger = require('./utils/logger');
const prisma = require('./config/prisma');
const socketHandler = require('./events/socketHandler');
const kafkaConsumer = require('./events/kafkaConsumer');
const { emailChannel, smsChannel, pushChannel } = require('./services/channels');

// Create HTTP server
const server = http.createServer(app);

// ==============================================================================
// Initialization
// ==============================================================================

async function initialize() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected');

    // Initialize notification channels
    await emailChannel.initialize();
    if (config.twilio.enabled) {
      await smsChannel.initialize();
    }
    if (config.firebase.enabled) {
      await pushChannel.initialize();
    }

    // Initialize WebSocket server
    socketHandler.initialize(server);

    // Initialize Kafka consumer (if enabled)
    if (config.kafka.enabled) {
      await kafkaConsumer.initialize();
    }

    logger.info('All services initialized');
  } catch (error) {
    logger.error('Initialization failed:', error);
    throw error;
  }
}

// ==============================================================================
// Graceful Shutdown
// ==============================================================================

async function shutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      // Disconnect Kafka consumer
      await kafkaConsumer.disconnect();

      // Close email channel
      await emailChannel.close();

      // Disconnect database
      await prisma.$disconnect();

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

// Register shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
});

// ==============================================================================
// Start Server
// ==============================================================================

async function start() {
  try {
    await initialize();

    server.listen(config.port, () => {
      logger.info(`
========================================
  TNE Notification Service
========================================
  Environment: ${config.nodeEnv}
  Port: ${config.port}
  Kafka: ${config.kafka.enabled ? 'enabled' : 'disabled'}
  Email: ${config.email.user ? 'configured' : 'not configured'}
  SMS: ${config.twilio.enabled ? 'enabled' : 'disabled'}
  Push: ${config.firebase.enabled ? 'enabled' : 'disabled'}
========================================
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

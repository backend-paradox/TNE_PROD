const app = require('./app');
const config = require('./config/env');
const prisma = require('./config/prisma');

const PORT = config.port;

// Start server
const server = app.listen(PORT, () => {
  console.log(`🤖 Chatbot Service running on port ${PORT}`);
  console.log(`   Environment: ${config.env}`);
  console.log(`   CRM Service: ${config.services.crmsync}`);
  console.log(`   OpenAI: ${config.openai.apiKey ? 'Configured' : 'Not configured (using fallback)'}`);
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    console.log('HTTP server closed');

    try {
      await prisma.$disconnect();
      console.log('Database connection closed');
    } catch (err) {
      console.error('Error closing database connection:', err);
    }

    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

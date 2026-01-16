// Load shared environment config
const config = require('./config/env');
const app = require('./app');
const prisma = require('./config/prisma');

const PORT = config.port;

const server = app.listen(PORT, async () => {
  await prisma.$connect();
  console.log(`Admin Service running on port ${PORT} (env=${config.nodeEnv})`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Server closed');
    process.exit(0);
  });
});

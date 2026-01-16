// backend/api-gateway/src/server.js
// Load shared environment config (handles .env loading automatically)
const { env } = require('./config/env');
const app = require('./app');

app.listen(env.PORT, () => {
  console.log(`API Gateway running on port ${env.PORT} (env=${env.NODE_ENV})`);
});


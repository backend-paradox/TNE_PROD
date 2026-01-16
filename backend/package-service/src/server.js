require('dotenv').config();
const app = require('./app');
const env = require('./config/env');

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║              PACKAGE SERVICE STARTED                       ║
╠════════════════════════════════════════════════════════════╣
║  🚀 Server running on port: ${PORT}                          ║
║  🌍 Environment: ${env.NODE_ENV.padEnd(40)}║
║  📦 API Base: /api/v1/tour-packages                        ║
║  🎬 API Base: /api/v1/cinetrip-packages                    ║
╚════════════════════════════════════════════════════════════╝
  `);
});

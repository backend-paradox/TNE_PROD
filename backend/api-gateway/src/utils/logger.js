// backend/api-gateway/src/utils/logger.js
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const { combine, timestamp, printf, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const base = { timestamp, level, message };
  return JSON.stringify(Object.assign(base, meta, stack ? { stack } : {}));
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp(), errors({ stack: true }), logFormat),
  transports: [
    new transports.Console(),
    // rotate logs file if desired
    // new transports.DailyRotateFile({ filename: 'logs/gateway-%DATE%.log', datePattern: 'YYYY-MM-DD', maxFiles: '14d' })
  ]
});

// morgan stream adapter
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger;

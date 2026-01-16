// backend/api-gateway/src/middleware/errorHandler.js
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const msg = err.message || 'Internal Server Error';
  logger.error(`Error: ${msg}`, {
    status,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    route: req.originalUrl,
    traceId: req.id
  });
  const body = { error: msg };
  if (process.env.NODE_ENV !== 'production') body.stack = err.stack;
  res.status(status).json(body);
}

module.exports = errorHandler;

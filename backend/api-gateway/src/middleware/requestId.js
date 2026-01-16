// backend/api-gateway/src/middleware/requestId.js
const { v4: uuidv4 } = require('uuid');

module.exports = function (req, res, next) {
  const id = req.headers['x-request-id'] || uuidv4();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
};

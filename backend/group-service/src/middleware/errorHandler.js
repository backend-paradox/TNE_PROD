const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

const isProduction = process.env.NODE_ENV === 'production';

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error.errors);
  }

  // SECURITY: In production, hide internal error details for 500 errors
  const isServerError = error.statusCode >= 500;
  const message = isProduction && isServerError
    ? 'Internal Server Error'
    : error.message;

  const response = {
    success: false,
    message,
    // Only show stack trace in development
    ...(!isProduction && { stack: error.stack }),
    // Only show detailed errors in development or for non-500 errors
    ...(error.errors && error.errors.length > 0 && (!isProduction || !isServerError) && { errors: error.errors }),
  };

  if (isServerError) {
    logger.error('Server Error:', { error: err.message, stack: err.stack });
  }

  res.status(error.statusCode).json(response);
};

module.exports = { errorHandler };

const { sendError } = require('../utils/responseHandler');

const notFound = (req, res, next) => {
  return sendError(res, 404, `Endpoint not found: ${req.originalUrl}`);
};

const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware Caught]:', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const val = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate value '${val}' for '${field}'. Must be unique.`;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for: ${err.path}`;
  }

  return sendError(
    res,
    statusCode,
    message,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
};

module.exports = {
  notFound,
  errorHandler
};

/**
 * Centralized standard response handler
 * Success format: { success: true, message: "...", data: {} }
 * Error format: { success: false, message: "..." }
 */

const sendSuccess = (res, statusCode = 200, message = 'Success', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    message
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError
};

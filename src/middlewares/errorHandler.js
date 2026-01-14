const ApiError = require('../utils/apiError');

const errorHandler = (err, req, res, next) => {
  if (!(err instanceof ApiError)) {
    console.error(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || undefined;

  res.status(statusCode).json({ message, ...(details ? { details } : {}) });
};

module.exports = errorHandler;

import { ApiError } from '../utils/ApiError.js';

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let { statusCode, message, details } = err;

  // Mongoose specific errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    details = Object.values(err.errors || {}).map((e) => ({ field: e.path, message: e.message }));
    message = 'Validation error';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field '${err.path}'`;
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `A record with this ${field} already exists` : 'Duplicate value violates a unique constraint';
  }

  if (!(err instanceof ApiError) && !statusCode) {
    statusCode = 500;
    message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  }

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode || 500).json({
    success: false,
    message: message || 'Something went wrong',
    ...(details ? { details } : {}),
  });
};

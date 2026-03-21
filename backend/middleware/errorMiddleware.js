// Centralized error handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Postgres unique violation
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Resource already exists due to unique constraint';
  }

  // Postgres foreign key violation
  if (err.code === '23503') {
    statusCode = 400;
    message = 'Related resource not found';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
    },
  });
};

module.exports = {
  errorHandler,
};


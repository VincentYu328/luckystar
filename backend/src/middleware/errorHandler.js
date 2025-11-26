// backend/src/middleware/errorHandler.js

// ------------------------------------------------------------
// Async route wrapper (avoids try/catch hell in routes)
// ------------------------------------------------------------
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ------------------------------------------------------------
// 404 Not Found handler
// ------------------------------------------------------------
export function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.path}`);
  error.status = 404;
  next(error);
}

// ------------------------------------------------------------
// Centralized Error Handler
// ------------------------------------------------------------
export function errorHandler(err, req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';

  // Log
  if (!isProd) {
    console.error('❌ Error:', err);
  } else {
    console.error('❌ Error:', {
      message: err.message,
      status: err.status,
      path: req.path,
      method: req.method
    });
  }

  const statusCode = err.status || err.statusCode || 500;

  const response = {
    error: err.message || 'Internal Server Error'
  };

  // Debug info in dev
  if (!isProd) {
    response.stack = err.stack;
    response.path = req.path;
    response.method = req.method;
  }

  // Specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.message,
    });
  }

  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      error: 'Database constraint violation',
      details: isProd ? 'Duplicate entry' : err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Authentication required',
    });
  }

  return res.status(statusCode).json(response);
}

export default errorHandler;

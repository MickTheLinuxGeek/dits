import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

/**
 * Custom error class with status code
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public errors?: any[],
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  status: 'error' | 'fail';
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: any[];
  stack?: string;
}

/**
 * Centralized error handling middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  // Default to 500 server error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let errors: any[] | undefined;

  // Handle AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
    errors = err.errors;
  }
  // Handle Prisma errors
  else if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Database operation failed';
    isOperational = true;
  }
  // Handle Prisma validation errors
  else if (err.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Invalid data provided';
    isOperational = true;
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  }
  // Handle validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    isOperational = true;
  }
  // Handle syntax errors
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON payload';
    isOperational = true;
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
  };

  // Add errors array if present
  if (errors && errors.length > 0) {
    errorResponse.errors = errors;
  }

  // Include stack trace in development
  if (config.app.env === 'development') {
    errorResponse.stack = err.stack;
  }

  // Log error
  if (!isOperational || statusCode >= 500) {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      url: req.url,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

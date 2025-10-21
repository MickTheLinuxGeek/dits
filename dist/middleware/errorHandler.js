"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = exports.AppError = void 0;
const env_1 = require("../config/env");
/**
 * Custom error class with status code
 */
class AppError extends Error {
    constructor(statusCode, message, isOperational = true, errors) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        this.errors = errors;
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, _next) => {
    // Default to 500 server error
    let statusCode = 500;
    let message = 'Internal Server Error';
    let isOperational = false;
    let errors;
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
    }
    else if (err.name === 'TokenExpiredError') {
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
    const errorResponse = {
        status: statusCode >= 500 ? 'error' : 'fail',
        message,
    };
    // Add errors array if present
    if (errors && errors.length > 0) {
        errorResponse.errors = errors;
    }
    // Include stack trace in development
    if (env_1.config.app.env === 'development') {
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
exports.errorHandler = errorHandler;
/**
 * Async error wrapper to catch errors in async route handlers
 */
const asyncHandler = 
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
(fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;

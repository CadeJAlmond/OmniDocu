/**
 * @file Error Handling Middleware
 * @description Centralized error handling for Express application
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Custom error class with status code
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 * @param {Error | AppError} err - Error object
 * @param {Request} _req - Express request object (unused)
 * @param {Response} res - Express response object
 * @param {NextFunction} _next - Express next function (unused)
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err } as AppError;
  error.message = err.message;

  // Log error details
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    name: err.name,
  });

  let statusCode = 500;
  let message = 'Internal Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Mongoose duplicate key
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // PostgreSQL errors
  if (err.name === 'QueryError') {
    switch ((err as any).code) {
      case '23505': // unique_violation
        statusCode = 409;
        message = 'Duplicate entry';
        break;
      case '23503': // foreign_key_violation
        statusCode = 400;
        message = 'Referenced entity does not exist';
        break;
      default:
        statusCode = 500;
        message = 'Database error';
    }
  }

  // Use AppError values if available
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Development mode includes detailed error info
  const response: Record<string, unknown> = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.error = err.name;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Catch async handler wrapper to catch rejected promises
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
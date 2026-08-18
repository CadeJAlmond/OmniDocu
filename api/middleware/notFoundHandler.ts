/**
 * @file Not Found Handler Middleware
 * @description Handles requests to non-existent routes
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Handle 404 errors for undefined routes
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn('Route not found', { method: req.method, url: req.url, ip: req.ip });

  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
};
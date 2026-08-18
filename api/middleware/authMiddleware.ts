/**
 * @file Authentication Middleware
 * @description Middleware to protect routes requiring authentication
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
import { catchAsync } from './errorHandler.js';

/**
 * Middleware to authenticate requests using JWT tokens
 * Attaches user info to req.user if valid token is present
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object (unused if auth fails)
 * @param {NextFunction} next - Express next function
 */
export const authenticate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No token provided.',
    });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }

  // Attach user info to request
  (req as any).user = {
    id: decoded.id,
    email: decoded.email,
  };

  next();
});

/**
 * Middleware factory to require authentication (alias for authenticate)
 * Usage: router.get('/protected', requireAuth, handler);
 */
export const requireAuth = authenticate;
/**
 * @file JWT Utility
 * @description JSON Web Token generation and verification utilities
 */

import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/index.js';

/**
 * JWT secret key (must be at least 32 characters for security)
 */
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production';

/**
 * JWT expiration time (e.g., 7d, 24h, 60m)
 */
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token for a user
 * @param {object} payload - Token payload containing user ID and email
 * @param {string} payload.id - User ID
 * @param {string} payload.email - User email
 * @returns {string} Signed JWT token
 */
export const generateToken = (payload: { id: string; email: string }): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {JwtPayload | null} Decoded token payload or null if invalid
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string | null} Token or null if not found/invalid
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return token || null;
};
/**
 * @file Authentication Routes
 * @description User registration and authentication endpoints
 */

import { Router, Request, Response } from 'express';
import { query, transaction } from '../config/database.js';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { catchAsync } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { SignupRequest, SigninRequest } from '../types/index.js';

const router = Router();

/**
 * @route POST /api/v1/auth/signup
 * @description Register a new user account
 * @access Public
 * @bodyParam {string} email - User email (required, valid email format)
 * @bodyParam {string} password - User password (required, min 8 chars)
 * @bodyParam {string} fullName - User's full name (required)
 * @returns {Object} User data and JWT token
 */
router.post(
  '/signup',
  catchAsync(async (req: Request<unknown, unknown, SignupRequest>, res: Response) => {
    const { email, password, fullName } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required.',
      });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements.',
        errors: passwordValidation.errors,
      });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingUser.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in transaction
    const result = await transaction(async (client) => {
      const userRes = await client.query(
        'INSERT INTO users (email, password_hash, full_name, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, email, full_name, created_at, updated_at',
        [email.toLowerCase(), passwordHash, fullName]
      );

      return userRes.rows[0];
    });

    // Generate JWT token
    const token = generateToken({ id: result.id, email: result.email });

    logger.info('User signed up successfully', { userId: result.id, email: result.email });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: {
          id: result.id,
          email: result.email,
          fullName: result.full_name,
          createdAt: result.created_at,
          updatedAt: result.updated_at,
        },
        token,
      },
    });
  })
);

/**
 * @route POST /api/v1/auth/signin
 * @description Authenticate user and return JWT token
 * @access Public
 * @bodyParam {string} email - User email (required)
 * @bodyParam {string} password - User password (required)
 * @returns {Object} User data and JWT token
 */
router.post(
  '/signin',
  catchAsync(async (req: Request<unknown, unknown, SigninRequest>, res: Response) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find user
    const userRes = await query(
      'SELECT id, email, password_hash, full_name, created_at, updated_at, last_login FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userRes.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const user = userRes.rows[0];

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email });

    logger.info('User signed in successfully', { userId: user.id, email: user.email });

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          lastLogin: user.last_login,
        },
        token,
      },
    });
  })
);

/**
 * @route GET /api/v1/auth/me
 * @description Get current authenticated user profile
 * @access Private
 * @returns {Object} User profile data
 */
router.get(
  '/me',
  catchAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    const userRes = await query(
      'SELECT id, email, full_name, created_at, updated_at, last_login FROM users WHERE id = $1',
      [userId]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const user = userRes.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          lastLogin: user.last_login,
        },
      },
    });
  })
);

export default router;
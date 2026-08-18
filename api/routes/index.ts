/**
 * @file Main Routes Index
 * @description Central route configuration for the API
 */

import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import authRoutes from './auth.js';
import documentRoutes from './documents.js';
import folderRoutes from './folders.js';
import combinedRoutes from './combined.js';

/**
 * Main API router
 */
const router = Router();

/**
 * Authentication routes - no authentication required
 * @route /api/v1/auth
 */
router.use('/auth', authRoutes);

/**
 * All routes below require authentication
 */
router.use('/documents', authenticate, documentRoutes);
router.use('/folders', authenticate, folderRoutes);
router.use('/combined', authenticate, combinedRoutes);

export { router as routes };
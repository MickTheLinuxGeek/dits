import { Router } from 'express';
import authRoutes from './auth';

/**
 * API Routes Index
 * Organizes all API routes under versioned endpoints
 */
const router = Router();

// Version 1 API routes
const v1Router = Router();

/**
 * @swagger
 * /api/v1:
 *   get:
 *     summary: API v1 information
 *     description: Returns information about API version 1
 *     tags:
 *       - API Info
 *     responses:
 *       200:
 *         description: API version information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 name:
 *                   type: string
 *                   example: "DITS API v1"
 *                 endpoints:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["/api/v1/auth", "/api/v1/issues", "/api/v1/projects"]
 */
v1Router.get('/', (_req, res) => {
  res.json({
    version: '1.0.0',
    name: 'DITS API v1',
    endpoints: [
      '/api/v1/auth',
      '/api/v1/issues',
      '/api/v1/projects',
      '/api/v1/areas',
      '/api/v1/labels',
    ],
    graphql: '/graphql',
    docs: '/api/docs',
  });
});

// Mount auth routes
v1Router.use('/auth', authRoutes);

// TODO: Add more route modules here as they are implemented
// v1Router.use('/issues', issueRoutes);
// v1Router.use('/projects', projectRoutes);
// v1Router.use('/areas', areaRoutes);
// v1Router.use('/labels', labelRoutes);

// Mount v1 routes
router.use('/v1', v1Router);

export default router;

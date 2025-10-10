import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../auth/jwt';

/**
 * Extended Request interface with user information
 */
export interface AuthenticatedRequest extends Request {
  userId: string;
  userEmail: string;
}

/**
 * JWT Authentication Middleware
 *
 * Verifies the JWT access token from the Authorization header
 * and attaches user information to the request object.
 *
 * Usage:
 *   router.get('/protected', requireAuth, (req: Request, res: Response) => {
 *     const userId = (req as AuthenticatedRequest).userId;
 *     // ...
 *   });
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization header provided',
      });
      return;
    }

    // Check if header follows "Bearer <token>" format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        error: 'Unauthorized',
        message:
          'Invalid authorization header format. Expected "Bearer <token>"',
      });
      return;
    }

    const token = parts[1];

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user information to request
    (req as AuthenticatedRequest).userId = decoded.userId;
    (req as AuthenticatedRequest).userEmail = decoded.email;

    next();
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    res.status(401).json({
      error: 'Unauthorized',
      message: error.message || 'Invalid or expired token',
    });
  }
}

/**
 * Optional Authentication Middleware
 *
 * Similar to requireAuth, but doesn't reject requests without a token.
 * If a token is provided and valid, user information is attached.
 * If no token or invalid token, request continues without user info.
 *
 * Useful for endpoints that behave differently for authenticated vs non-authenticated users.
 */
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next();
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1];
      const decoded = verifyAccessToken(token);

      (req as AuthenticatedRequest).userId = decoded.userId;
      (req as AuthenticatedRequest).userEmail = decoded.email;
    }

    next();
  } catch (error) {
    // Silently continue without authentication for optional auth
    next();
  }
}

/**
 * Get user ID from authenticated request
 *
 * Helper function to safely extract user ID from request
 */
export function getUserId(req: Request): string | undefined {
  return (req as AuthenticatedRequest).userId;
}

/**
 * Get user email from authenticated request
 *
 * Helper function to safely extract user email from request
 */
export function getUserEmail(req: Request): string | undefined {
  return (req as AuthenticatedRequest).userEmail;
}

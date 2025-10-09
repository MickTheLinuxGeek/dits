import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../database/redis';
import { config } from '../config/env';

/**
 * Rate limit configuration for different endpoint types
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests allowed in the window
  message?: string; // Custom error message
  keyGenerator?: (req: Request) => string; // Custom key generator
}

/**
 * Default rate limit configurations
 */
export const RateLimitPresets = {
  // Very strict for login attempts (5 attempts per 15 minutes)
  AUTH_LOGIN: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many login attempts. Please try again later.',
  },

  // Strict for registration (3 attempts per hour)
  AUTH_REGISTER: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    message: 'Too many registration attempts. Please try again later.',
  },

  // Moderate for password reset requests (3 attempts per hour)
  PASSWORD_RESET_REQUEST: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    message: 'Too many password reset requests. Please try again later.',
  },

  // Moderate for password reset confirmation (5 attempts per hour)
  PASSWORD_RESET_CONFIRM: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many password reset attempts. Please try again later.',
  },

  // Moderate for email verification (5 attempts per hour)
  EMAIL_VERIFICATION: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many verification attempts. Please try again later.',
  },

  // Lenient for token refresh (20 attempts per 15 minutes)
  TOKEN_REFRESH: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 20,
    message: 'Too many token refresh requests. Please try again later.',
  },

  // General API rate limit (from config)
  DEFAULT: {
    windowMs: config.rateLimit.windowMs,
    maxRequests: config.rateLimit.maxRequests,
    message: 'Too many requests. Please try again later.',
  },
};

/**
 * Get rate limit key for Redis
 */
function getRateLimitKey(identifier: string, endpoint: string): string {
  return `rate_limit:${endpoint}:${identifier}`;
}

/**
 * Default key generator - uses IP address and endpoint
 */
function defaultKeyGenerator(req: Request, endpoint: string): string {
  const ip =
    req.ip ||
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    'unknown';
  return `${ip}:${endpoint}`;
}

/**
 * Create rate limiting middleware
 * @param endpoint - Unique identifier for this endpoint
 * @param config - Rate limit configuration
 * @returns Express middleware function
 */
export function createRateLimiter(
  endpoint: string,
  rateLimitConfig: RateLimitConfig,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Generate key for this request
      const identifier = rateLimitConfig.keyGenerator
        ? rateLimitConfig.keyGenerator(req)
        : defaultKeyGenerator(req, endpoint);

      const key = getRateLimitKey(identifier, endpoint);

      // Get current request count
      const currentCount = await redisClient.get(key);
      const requestCount = currentCount ? parseInt(currentCount, 10) : 0;

      // Check if limit exceeded
      if (requestCount >= rateLimitConfig.maxRequests) {
        // Get TTL to inform user when they can try again
        const ttl = await redisClient.ttl(key);
        const retryAfter =
          ttl > 0 ? ttl : Math.floor(rateLimitConfig.windowMs / 1000);

        res.set('Retry-After', retryAfter.toString());
        res.set('X-RateLimit-Limit', rateLimitConfig.maxRequests.toString());
        res.set('X-RateLimit-Remaining', '0');
        res.set(
          'X-RateLimit-Reset',
          (Date.now() + retryAfter * 1000).toString(),
        );

        return res.status(429).json({
          error: 'Too Many Requests',
          message:
            rateLimitConfig.message ||
            'Too many requests. Please try again later.',
          retryAfter,
        });
      }

      // Increment request count
      const newCount = requestCount + 1;

      if (requestCount === 0) {
        // First request - set with expiration
        const ttlSeconds = Math.floor(rateLimitConfig.windowMs / 1000);
        await redisClient.setex(key, ttlSeconds, newCount.toString());
      } else {
        // Subsequent request - just increment
        await redisClient.incr(key);
      }

      // Get TTL for headers
      const ttl = await redisClient.ttl(key);
      const remaining = rateLimitConfig.maxRequests - newCount;

      // Set rate limit headers
      res.set('X-RateLimit-Limit', rateLimitConfig.maxRequests.toString());
      res.set('X-RateLimit-Remaining', remaining.toString());
      res.set('X-RateLimit-Reset', (Date.now() + ttl * 1000).toString());

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      // On error, allow the request through (fail open)
      next();
    }
  };
}

/**
 * Pre-configured rate limiters for common authentication endpoints
 */
export const rateLimiters = {
  login: createRateLimiter('auth:login', RateLimitPresets.AUTH_LOGIN),
  register: createRateLimiter('auth:register', RateLimitPresets.AUTH_REGISTER),
  passwordResetRequest: createRateLimiter(
    'auth:password-reset-request',
    RateLimitPresets.PASSWORD_RESET_REQUEST,
  ),
  passwordResetConfirm: createRateLimiter(
    'auth:password-reset-confirm',
    RateLimitPresets.PASSWORD_RESET_CONFIRM,
  ),
  emailVerification: createRateLimiter(
    'auth:email-verification',
    RateLimitPresets.EMAIL_VERIFICATION,
  ),
  tokenRefresh: createRateLimiter(
    'auth:token-refresh',
    RateLimitPresets.TOKEN_REFRESH,
  ),
};

/**
 * Manually reset rate limit for a specific identifier
 * Useful for administrative purposes or testing
 * @param endpoint - Endpoint identifier
 * @param identifier - User/IP identifier
 * @returns Promise resolving to true if reset was successful
 */
export async function resetRateLimit(
  endpoint: string,
  identifier: string,
): Promise<boolean> {
  try {
    const key = getRateLimitKey(identifier, endpoint);
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Error resetting rate limit:', error);
    return false;
  }
}

/**
 * Get current rate limit status for an identifier
 * @param endpoint - Endpoint identifier
 * @param identifier - User/IP identifier
 * @param maxRequests - Maximum allowed requests
 * @returns Promise resolving to rate limit status
 */
export async function getRateLimitStatus(
  endpoint: string,
  identifier: string,
  maxRequests: number,
): Promise<{
  remaining: number;
  resetAt: number;
  limited: boolean;
}> {
  try {
    const key = getRateLimitKey(identifier, endpoint);
    const currentCount = await redisClient.get(key);
    const requestCount = currentCount ? parseInt(currentCount, 10) : 0;
    const ttl = await redisClient.ttl(key);

    return {
      remaining: Math.max(0, maxRequests - requestCount),
      resetAt: ttl > 0 ? Date.now() + ttl * 1000 : 0,
      limited: requestCount >= maxRequests,
    };
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    return {
      remaining: maxRequests,
      resetAt: 0,
      limited: false,
    };
  }
}

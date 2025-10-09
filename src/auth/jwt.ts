import jwt from 'jsonwebtoken';
import { config } from '../config/env';

/**
 * JWT Token Payload
 */
export interface JWTPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

/**
 * Decoded JWT Token with standard claims
 */
export interface DecodedJWT extends JWTPayload {
  iat: number;
  exp: number;
}

/**
 * Generate an access token for a user
 * @param userId - The user's unique identifier
 * @param email - The user's email address
 * @returns JWT access token string
 */
export function generateAccessToken(userId: string, email: string): string {
  const payload: JWTPayload = {
    userId,
    email,
    type: 'access',
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/**
 * Generate a refresh token for a user
 * @param userId - The user's unique identifier
 * @param email - The user's email address
 * @returns JWT refresh token string
 */
export function generateRefreshToken(userId: string, email: string): string {
  const payload: JWTPayload = {
    userId,
    email,
    type: 'refresh',
  };

  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
}

/**
 * Generate both access and refresh tokens
 * @param userId - The user's unique identifier
 * @param email - The user's email address
 * @returns Object containing both tokens
 */
export function generateTokens(
  userId: string,
  email: string,
): { accessToken: string; refreshToken: string } {
  return {
    accessToken: generateAccessToken(userId, email),
    refreshToken: generateRefreshToken(userId, email),
  };
}

/**
 * Verify and decode an access token
 * @param token - The JWT access token to verify
 * @returns Decoded token payload
 * @throws {Error} if token is invalid or expired
 */
export function verifyAccessToken(token: string): DecodedJWT {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as DecodedJWT;

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    }
    throw error;
  }
}

/**
 * Verify and decode a refresh token
 * @param token - The JWT refresh token to verify
 * @returns Decoded token payload
 * @throws {Error} if token is invalid or expired
 */
export function verifyRefreshToken(token: string): DecodedJWT {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as DecodedJWT;

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Decode a token without verification (useful for debugging)
 * @param token - The JWT token to decode
 * @returns Decoded token payload or null if invalid
 */
export function decodeToken(token: string): DecodedJWT | null {
  try {
    return jwt.decode(token) as DecodedJWT;
  } catch {
    return null;
  }
}

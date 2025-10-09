import { redis as redisClient } from '../database/redis';
import { config } from '../config/env';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from './jwt';
import { createSession, deleteSession } from './session';

/**
 * Refresh token key prefix for Redis
 */
const REFRESH_TOKEN_PREFIX = 'refresh_token:';
const TOKEN_FAMILY_PREFIX = 'token_family:';

/**
 * Token rotation data structure
 */
interface TokenRotationData {
  userId: string;
  email: string;
  familyId: string;
  rotationCount: number;
  createdAt: number;
  lastRotated: number;
}

/**
 * Get refresh token key
 */
function getRefreshTokenKey(tokenHash: string): string {
  return `${REFRESH_TOKEN_PREFIX}${tokenHash}`;
}

/**
 * Get token family key
 */
function getTokenFamilyKey(familyId: string): string {
  return `${TOKEN_FAMILY_PREFIX}${familyId}`;
}

/**
 * Create a simple hash of the token for storage
 */
function hashToken(token: string): string {
  // Using base64 encoding of first 32 chars as a simple hash
  // In production, consider using crypto.createHash('sha256')
  return Buffer.from(token.substring(0, 32)).toString('base64');
}

/**
 * Generate a unique family ID for token rotation
 */
function generateFamilyId(): string {
  return `fam_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Store refresh token with rotation tracking
 * @param refreshToken - The refresh token to store
 * @param userId - User ID
 * @param email - User email
 * @param familyId - Token family ID (for rotation tracking)
 * @returns Promise resolving to true if successful
 */
export async function storeRefreshToken(
  refreshToken: string,
  userId: string,
  email: string,
  familyId?: string,
): Promise<{ success: boolean; familyId: string }> {
  const tokenHash = hashToken(refreshToken);
  const actualFamilyId = familyId || generateFamilyId();

  const tokenData: TokenRotationData = {
    userId,
    email,
    familyId: actualFamilyId,
    rotationCount: 0,
    createdAt: Date.now(),
    lastRotated: Date.now(),
  };

  try {
    // Calculate TTL in seconds (same as JWT refresh token expiration)
    const ttlSeconds = Math.floor(
      parseDuration(config.jwt.refreshExpiresIn) / 1000,
    );

    // Store token data
    await redisClient.setex(
      getRefreshTokenKey(tokenHash),
      ttlSeconds,
      JSON.stringify(tokenData),
    );

    // Add token to family
    await redisClient.sadd(getTokenFamilyKey(actualFamilyId), tokenHash);

    // Set expiration on family set
    await redisClient.expire(getTokenFamilyKey(actualFamilyId), ttlSeconds);

    return { success: true, familyId: actualFamilyId };
  } catch (error) {
    console.error('Error storing refresh token:', error);
    return { success: false, familyId: actualFamilyId };
  }
}

/**
 * Rotate refresh token (generate new one, invalidate old one)
 * @param oldRefreshToken - The current refresh token
 * @returns Promise resolving to new tokens or null if rotation fails
 */
export async function rotateRefreshToken(oldRefreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  try {
    // Verify the old refresh token
    const decoded = verifyRefreshToken(oldRefreshToken);

    // Get token data from Redis
    const tokenHash = hashToken(oldRefreshToken);
    const tokenDataStr = await redisClient.get(getRefreshTokenKey(tokenHash));

    if (!tokenDataStr) {
      // Token not found - possible reuse attempt
      console.warn('Refresh token reuse detected:', decoded.userId);
      await invalidateTokenFamily(tokenHash);
      return null;
    }

    const tokenData: TokenRotationData = JSON.parse(tokenDataStr);

    // Check if this is a reuse attempt (token already used)
    const familyTokens = await redisClient.smembers(
      getTokenFamilyKey(tokenData.familyId),
    );
    if (!familyTokens.includes(tokenHash)) {
      // Token was already removed from family - reuse detected
      console.warn(
        'Token reuse detected, invalidating family:',
        tokenData.familyId,
      );
      await invalidateTokenFamily(tokenData.familyId);
      return null;
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(decoded.userId, decoded.email);
    const newRefreshToken = generateRefreshToken(decoded.userId, decoded.email);

    // Store new refresh token with incremented rotation count
    const newTokenData: TokenRotationData = {
      ...tokenData,
      rotationCount: tokenData.rotationCount + 1,
      lastRotated: Date.now(),
    };

    const newTokenHash = hashToken(newRefreshToken);
    const ttlSeconds = Math.floor(
      parseDuration(config.jwt.refreshExpiresIn) / 1000,
    );

    // Store new token
    await redisClient.setex(
      getRefreshTokenKey(newTokenHash),
      ttlSeconds,
      JSON.stringify(newTokenData),
    );

    // Add new token to family
    await redisClient.sadd(getTokenFamilyKey(tokenData.familyId), newTokenHash);

    // Remove old token from family and delete it
    await redisClient.srem(getTokenFamilyKey(tokenData.familyId), tokenHash);
    await redisClient.del(getRefreshTokenKey(tokenHash));

    // Delete old session and create new one
    await deleteSession(oldRefreshToken);
    await createSession(decoded.userId, decoded.email, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    console.error('Error rotating refresh token:', error);
    return null;
  }
}

/**
 * Invalidate all tokens in a token family (used when reuse is detected)
 * @param familyIdOrTokenHash - Family ID or token hash
 */
async function invalidateTokenFamily(
  familyIdOrTokenHash: string,
): Promise<void> {
  try {
    // Check if it's a family ID or token hash
    let familyId = familyIdOrTokenHash;

    // If it looks like a token hash, get the family ID
    if (!familyIdOrTokenHash.startsWith('fam_')) {
      const tokenDataStr = await redisClient.get(
        getRefreshTokenKey(familyIdOrTokenHash),
      );
      if (tokenDataStr) {
        const tokenData: TokenRotationData = JSON.parse(tokenDataStr);
        familyId = tokenData.familyId;
      }
    }

    // Get all tokens in family
    const familyTokens = await redisClient.smembers(
      getTokenFamilyKey(familyId),
    );

    // Delete all tokens
    for (const tokenHash of familyTokens) {
      await redisClient.del(getRefreshTokenKey(tokenHash));
      await deleteSession(tokenHash);
    }

    // Delete family set
    await redisClient.del(getTokenFamilyKey(familyId));
  } catch (error) {
    console.error('Error invalidating token family:', error);
  }
}

/**
 * Revoke a specific refresh token
 * @param refreshToken - The refresh token to revoke
 * @returns Promise resolving to true if successful
 */
export async function revokeRefreshToken(
  refreshToken: string,
): Promise<boolean> {
  try {
    const tokenHash = hashToken(refreshToken);
    const tokenDataStr = await redisClient.get(getRefreshTokenKey(tokenHash));

    if (!tokenDataStr) {
      return false;
    }

    const tokenData: TokenRotationData = JSON.parse(tokenDataStr);

    // Remove token from family
    await redisClient.srem(getTokenFamilyKey(tokenData.familyId), tokenHash);

    // Delete token
    await redisClient.del(getRefreshTokenKey(tokenHash));

    // Delete session
    await deleteSession(refreshToken);

    return true;
  } catch (error) {
    console.error('Error revoking refresh token:', error);
    return false;
  }
}

/**
 * Revoke all refresh tokens for a user
 * @param userId - User ID
 * @returns Promise resolving to number of tokens revoked
 */
export async function revokeAllUserTokens(userId: string): Promise<number> {
  try {
    // Find all tokens for this user
    const pattern = `${REFRESH_TOKEN_PREFIX}*`;
    let cursor = '0';
    let count = 0;
    const tokensToRevoke: string[] = [];

    do {
      const [newCursor, keys] = await redisClient.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = newCursor;

      for (const key of keys) {
        const tokenDataStr = await redisClient.get(key);
        if (tokenDataStr) {
          const tokenData: TokenRotationData = JSON.parse(tokenDataStr);
          if (tokenData.userId === userId) {
            tokensToRevoke.push(key);
          }
        }
      }
    } while (cursor !== '0');

    // Revoke all found tokens
    for (const tokenKey of tokensToRevoke) {
      await redisClient.del(tokenKey);
      count++;
    }

    return count;
  } catch (error) {
    console.error('Error revoking all user tokens:', error);
    return 0;
  }
}

/**
 * Parse duration string (like '7d', '15m') to milliseconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000; // Default to 7 days
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

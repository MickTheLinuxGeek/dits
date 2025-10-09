"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeRefreshToken = storeRefreshToken;
exports.rotateRefreshToken = rotateRefreshToken;
exports.revokeRefreshToken = revokeRefreshToken;
exports.revokeAllUserTokens = revokeAllUserTokens;
const redis_1 = require("../database/redis");
const env_1 = require("../config/env");
const jwt_1 = require("./jwt");
const session_1 = require("./session");
/**
 * Refresh token key prefix for Redis
 */
const REFRESH_TOKEN_PREFIX = 'refresh_token:';
const TOKEN_FAMILY_PREFIX = 'token_family:';
/**
 * Get refresh token key
 */
function getRefreshTokenKey(tokenHash) {
    return `${REFRESH_TOKEN_PREFIX}${tokenHash}`;
}
/**
 * Get token family key
 */
function getTokenFamilyKey(familyId) {
    return `${TOKEN_FAMILY_PREFIX}${familyId}`;
}
/**
 * Create a simple hash of the token for storage
 */
function hashToken(token) {
    // Using base64 encoding of first 32 chars as a simple hash
    // In production, consider using crypto.createHash('sha256')
    return Buffer.from(token.substring(0, 32)).toString('base64');
}
/**
 * Generate a unique family ID for token rotation
 */
function generateFamilyId() {
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
function storeRefreshToken(refreshToken, userId, email, familyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenHash = hashToken(refreshToken);
        const actualFamilyId = familyId || generateFamilyId();
        const tokenData = {
            userId,
            email,
            familyId: actualFamilyId,
            rotationCount: 0,
            createdAt: Date.now(),
            lastRotated: Date.now(),
        };
        try {
            // Calculate TTL in seconds (same as JWT refresh token expiration)
            const ttlSeconds = Math.floor(parseDuration(env_1.config.jwt.refreshExpiresIn) / 1000);
            // Store token data
            yield redis_1.redis.setex(getRefreshTokenKey(tokenHash), ttlSeconds, JSON.stringify(tokenData));
            // Add token to family
            yield redis_1.redis.sadd(getTokenFamilyKey(actualFamilyId), tokenHash);
            // Set expiration on family set
            yield redis_1.redis.expire(getTokenFamilyKey(actualFamilyId), ttlSeconds);
            return { success: true, familyId: actualFamilyId };
        }
        catch (error) {
            console.error('Error storing refresh token:', error);
            return { success: false, familyId: actualFamilyId };
        }
    });
}
/**
 * Rotate refresh token (generate new one, invalidate old one)
 * @param oldRefreshToken - The current refresh token
 * @returns Promise resolving to new tokens or null if rotation fails
 */
function rotateRefreshToken(oldRefreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Verify the old refresh token
            const decoded = (0, jwt_1.verifyRefreshToken)(oldRefreshToken);
            // Get token data from Redis
            const tokenHash = hashToken(oldRefreshToken);
            const tokenDataStr = yield redis_1.redis.get(getRefreshTokenKey(tokenHash));
            if (!tokenDataStr) {
                // Token not found - possible reuse attempt
                console.warn('Refresh token reuse detected:', decoded.userId);
                yield invalidateTokenFamily(tokenHash);
                return null;
            }
            const tokenData = JSON.parse(tokenDataStr);
            // Check if this is a reuse attempt (token already used)
            const familyTokens = yield redis_1.redis.smembers(getTokenFamilyKey(tokenData.familyId));
            if (!familyTokens.includes(tokenHash)) {
                // Token was already removed from family - reuse detected
                console.warn('Token reuse detected, invalidating family:', tokenData.familyId);
                yield invalidateTokenFamily(tokenData.familyId);
                return null;
            }
            // Generate new tokens
            const newAccessToken = (0, jwt_1.generateAccessToken)(decoded.userId, decoded.email);
            const newRefreshToken = (0, jwt_1.generateRefreshToken)(decoded.userId, decoded.email);
            // Store new refresh token with incremented rotation count
            const newTokenData = Object.assign(Object.assign({}, tokenData), { rotationCount: tokenData.rotationCount + 1, lastRotated: Date.now() });
            const newTokenHash = hashToken(newRefreshToken);
            const ttlSeconds = Math.floor(parseDuration(env_1.config.jwt.refreshExpiresIn) / 1000);
            // Store new token
            yield redis_1.redis.setex(getRefreshTokenKey(newTokenHash), ttlSeconds, JSON.stringify(newTokenData));
            // Add new token to family
            yield redis_1.redis.sadd(getTokenFamilyKey(tokenData.familyId), newTokenHash);
            // Remove old token from family and delete it
            yield redis_1.redis.srem(getTokenFamilyKey(tokenData.familyId), tokenHash);
            yield redis_1.redis.del(getRefreshTokenKey(tokenHash));
            // Delete old session and create new one
            yield (0, session_1.deleteSession)(oldRefreshToken);
            yield (0, session_1.createSession)(decoded.userId, decoded.email, newRefreshToken);
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        }
        catch (error) {
            console.error('Error rotating refresh token:', error);
            return null;
        }
    });
}
/**
 * Invalidate all tokens in a token family (used when reuse is detected)
 * @param familyIdOrTokenHash - Family ID or token hash
 */
function invalidateTokenFamily(familyIdOrTokenHash) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if it's a family ID or token hash
            let familyId = familyIdOrTokenHash;
            // If it looks like a token hash, get the family ID
            if (!familyIdOrTokenHash.startsWith('fam_')) {
                const tokenDataStr = yield redis_1.redis.get(getRefreshTokenKey(familyIdOrTokenHash));
                if (tokenDataStr) {
                    const tokenData = JSON.parse(tokenDataStr);
                    familyId = tokenData.familyId;
                }
            }
            // Get all tokens in family
            const familyTokens = yield redis_1.redis.smembers(getTokenFamilyKey(familyId));
            // Delete all tokens
            for (const tokenHash of familyTokens) {
                yield redis_1.redis.del(getRefreshTokenKey(tokenHash));
                yield (0, session_1.deleteSession)(tokenHash);
            }
            // Delete family set
            yield redis_1.redis.del(getTokenFamilyKey(familyId));
        }
        catch (error) {
            console.error('Error invalidating token family:', error);
        }
    });
}
/**
 * Revoke a specific refresh token
 * @param refreshToken - The refresh token to revoke
 * @returns Promise resolving to true if successful
 */
function revokeRefreshToken(refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tokenHash = hashToken(refreshToken);
            const tokenDataStr = yield redis_1.redis.get(getRefreshTokenKey(tokenHash));
            if (!tokenDataStr) {
                return false;
            }
            const tokenData = JSON.parse(tokenDataStr);
            // Remove token from family
            yield redis_1.redis.srem(getTokenFamilyKey(tokenData.familyId), tokenHash);
            // Delete token
            yield redis_1.redis.del(getRefreshTokenKey(tokenHash));
            // Delete session
            yield (0, session_1.deleteSession)(refreshToken);
            return true;
        }
        catch (error) {
            console.error('Error revoking refresh token:', error);
            return false;
        }
    });
}
/**
 * Revoke all refresh tokens for a user
 * @param userId - User ID
 * @returns Promise resolving to number of tokens revoked
 */
function revokeAllUserTokens(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Find all tokens for this user
            const pattern = `${REFRESH_TOKEN_PREFIX}*`;
            let cursor = '0';
            let count = 0;
            const tokensToRevoke = [];
            do {
                const [newCursor, keys] = yield redis_1.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
                cursor = newCursor;
                for (const key of keys) {
                    const tokenDataStr = yield redis_1.redis.get(key);
                    if (tokenDataStr) {
                        const tokenData = JSON.parse(tokenDataStr);
                        if (tokenData.userId === userId) {
                            tokensToRevoke.push(key);
                        }
                    }
                }
            } while (cursor !== '0');
            // Revoke all found tokens
            for (const tokenKey of tokensToRevoke) {
                yield redis_1.redis.del(tokenKey);
                count++;
            }
            return count;
        }
        catch (error) {
            console.error('Error revoking all user tokens:', error);
            return 0;
        }
    });
}
/**
 * Parse duration string (like '7d', '15m') to milliseconds
 */
function parseDuration(duration) {
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

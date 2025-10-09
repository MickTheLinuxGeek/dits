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
exports.createSession = createSession;
exports.getSession = getSession;
exports.updateSessionActivity = updateSessionActivity;
exports.deleteSession = deleteSession;
exports.deleteAllUserSessions = deleteAllUserSessions;
exports.getUserSessions = getUserSessions;
exports.sessionExists = sessionExists;
exports.cleanupExpiredSessions = cleanupExpiredSessions;
const redis_1 = require("../database/redis");
const env_1 = require("../config/env");
/**
 * Session key prefix for Redis
 */
const SESSION_PREFIX = 'session:';
const USER_SESSIONS_PREFIX = 'user_sessions:';
/**
 * Generate a session key
 */
function getSessionKey(sessionId) {
    return `${SESSION_PREFIX}${sessionId}`;
}
/**
 * Generate a user sessions key
 */
function getUserSessionsKey(userId) {
    return `${USER_SESSIONS_PREFIX}${userId}`;
}
/**
 * Create a new session for a user
 * @param userId - The user's unique identifier
 * @param email - The user's email address
 * @param sessionId - Unique session identifier (typically the refresh token)
 * @param metadata - Additional session metadata
 * @returns Promise resolving to true if successful
 */
function createSession(userId, email, sessionId, metadata) {
    return __awaiter(this, void 0, void 0, function* () {
        const now = Date.now();
        const sessionData = {
            userId,
            email,
            createdAt: now,
            lastActivity: now,
            ipAddress: metadata === null || metadata === void 0 ? void 0 : metadata.ipAddress,
            userAgent: metadata === null || metadata === void 0 ? void 0 : metadata.userAgent,
        };
        // Calculate TTL in seconds
        const ttlSeconds = Math.floor(env_1.config.session.timeout / 1000);
        try {
            // Store session data
            yield redis_1.redis.setex(getSessionKey(sessionId), ttlSeconds, JSON.stringify(sessionData));
            // Add session to user's session set
            yield redis_1.redis.sadd(getUserSessionsKey(userId), sessionId);
            return true;
        }
        catch (error) {
            console.error('Error creating session:', error);
            return false;
        }
    });
}
/**
 * Get session data by session ID
 * @param sessionId - The session identifier
 * @returns Promise resolving to session data or null if not found
 */
function getSession(sessionId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield redis_1.redis.get(getSessionKey(sessionId));
            if (!data) {
                return null;
            }
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    });
}
/**
 * Update session's last activity timestamp
 * @param sessionId - The session identifier
 * @returns Promise resolving to true if successful
 */
function updateSessionActivity(sessionId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield getSession(sessionId);
            if (!session) {
                return false;
            }
            session.lastActivity = Date.now();
            // Calculate TTL in seconds
            const ttlSeconds = Math.floor(env_1.config.session.timeout / 1000);
            yield redis_1.redis.setex(getSessionKey(sessionId), ttlSeconds, JSON.stringify(session));
            return true;
        }
        catch (error) {
            console.error('Error updating session activity:', error);
            return false;
        }
    });
}
/**
 * Delete a session
 * @param sessionId - The session identifier
 * @returns Promise resolving to true if successful
 */
function deleteSession(sessionId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const session = yield getSession(sessionId);
            if (!session) {
                return false;
            }
            // Remove session data
            yield redis_1.redis.del(getSessionKey(sessionId));
            // Remove session from user's session set
            yield redis_1.redis.srem(getUserSessionsKey(session.userId), sessionId);
            return true;
        }
        catch (error) {
            console.error('Error deleting session:', error);
            return false;
        }
    });
}
/**
 * Delete all sessions for a user
 * @param userId - The user's unique identifier
 * @returns Promise resolving to the number of sessions deleted
 */
function deleteAllUserSessions(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sessionIds = yield redis_1.redis.smembers(getUserSessionsKey(userId));
            if (sessionIds.length === 0) {
                return 0;
            }
            // Delete all session data
            const sessionKeys = sessionIds.map(getSessionKey);
            yield redis_1.redis.del(...sessionKeys);
            // Clear user's session set
            yield redis_1.redis.del(getUserSessionsKey(userId));
            return sessionIds.length;
        }
        catch (error) {
            console.error('Error deleting all user sessions:', error);
            return 0;
        }
    });
}
/**
 * Get all active sessions for a user
 * @param userId - The user's unique identifier
 * @returns Promise resolving to array of session data
 */
function getUserSessions(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sessionIds = yield redis_1.redis.smembers(getUserSessionsKey(userId));
            if (sessionIds.length === 0) {
                return [];
            }
            const sessions = [];
            for (const sessionId of sessionIds) {
                const session = yield getSession(sessionId);
                if (session) {
                    sessions.push(session);
                }
                else {
                    // Clean up stale session ID from set
                    yield redis_1.redis.srem(getUserSessionsKey(userId), sessionId);
                }
            }
            return sessions;
        }
        catch (error) {
            console.error('Error getting user sessions:', error);
            return [];
        }
    });
}
/**
 * Check if a session exists and is valid
 * @param sessionId - The session identifier
 * @returns Promise resolving to true if session exists
 */
function sessionExists(sessionId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const exists = yield redis_1.redis.exists(getSessionKey(sessionId));
            return exists === 1;
        }
        catch (error) {
            console.error('Error checking session existence:', error);
            return false;
        }
    });
}
/**
 * Clean up expired sessions for a user (called periodically)
 * This removes session IDs from the user's session set if the session data no longer exists
 * @param userId - The user's unique identifier
 * @returns Promise resolving to the number of stale sessions cleaned up
 */
function cleanupExpiredSessions(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const sessionIds = yield redis_1.redis.smembers(getUserSessionsKey(userId));
            let cleanedCount = 0;
            for (const sessionId of sessionIds) {
                const exists = yield sessionExists(sessionId);
                if (!exists) {
                    yield redis_1.redis.srem(getUserSessionsKey(userId), sessionId);
                    cleanedCount++;
                }
            }
            return cleanedCount;
        }
        catch (error) {
            console.error('Error cleaning up expired sessions:', error);
            return 0;
        }
    });
}

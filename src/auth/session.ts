import { redisClient } from '../database/redis';
import { config } from '../config/env';

/**
 * Session data structure
 */
export interface SessionData {
  userId: string;
  email: string;
  createdAt: number;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Session key prefix for Redis
 */
const SESSION_PREFIX = 'session:';
const USER_SESSIONS_PREFIX = 'user_sessions:';

/**
 * Generate a session key
 */
function getSessionKey(sessionId: string): string {
  return `${SESSION_PREFIX}${sessionId}`;
}

/**
 * Generate a user sessions key
 */
function getUserSessionsKey(userId: string): string {
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
export async function createSession(
  userId: string,
  email: string,
  sessionId: string,
  metadata?: { ipAddress?: string; userAgent?: string },
): Promise<boolean> {
  const now = Date.now();
  const sessionData: SessionData = {
    userId,
    email,
    createdAt: now,
    lastActivity: now,
    ipAddress: metadata?.ipAddress,
    userAgent: metadata?.userAgent,
  };

  // Calculate TTL in seconds
  const ttlSeconds = Math.floor(config.session.timeout / 1000);

  try {
    // Store session data
    await redisClient.setex(
      getSessionKey(sessionId),
      ttlSeconds,
      JSON.stringify(sessionData),
    );

    // Add session to user's session set
    await redisClient.sadd(getUserSessionsKey(userId), sessionId);

    return true;
  } catch (error) {
    console.error('Error creating session:', error);
    return false;
  }
}

/**
 * Get session data by session ID
 * @param sessionId - The session identifier
 * @returns Promise resolving to session data or null if not found
 */
export async function getSession(
  sessionId: string,
): Promise<SessionData | null> {
  try {
    const data = await redisClient.get(getSessionKey(sessionId));

    if (!data) {
      return null;
    }

    return JSON.parse(data) as SessionData;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Update session's last activity timestamp
 * @param sessionId - The session identifier
 * @returns Promise resolving to true if successful
 */
export async function updateSessionActivity(
  sessionId: string,
): Promise<boolean> {
  try {
    const session = await getSession(sessionId);

    if (!session) {
      return false;
    }

    session.lastActivity = Date.now();

    // Calculate TTL in seconds
    const ttlSeconds = Math.floor(config.session.timeout / 1000);

    await redisClient.setex(
      getSessionKey(sessionId),
      ttlSeconds,
      JSON.stringify(session),
    );

    return true;
  } catch (error) {
    console.error('Error updating session activity:', error);
    return false;
  }
}

/**
 * Delete a session
 * @param sessionId - The session identifier
 * @returns Promise resolving to true if successful
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    const session = await getSession(sessionId);

    if (!session) {
      return false;
    }

    // Remove session data
    await redisClient.del(getSessionKey(sessionId));

    // Remove session from user's session set
    await redisClient.srem(getUserSessionsKey(session.userId), sessionId);

    return true;
  } catch (error) {
    console.error('Error deleting session:', error);
    return false;
  }
}

/**
 * Delete all sessions for a user
 * @param userId - The user's unique identifier
 * @returns Promise resolving to the number of sessions deleted
 */
export async function deleteAllUserSessions(userId: string): Promise<number> {
  try {
    const sessionIds = await redisClient.smembers(getUserSessionsKey(userId));

    if (sessionIds.length === 0) {
      return 0;
    }

    // Delete all session data
    const sessionKeys = sessionIds.map(getSessionKey);
    await redisClient.del(...sessionKeys);

    // Clear user's session set
    await redisClient.del(getUserSessionsKey(userId));

    return sessionIds.length;
  } catch (error) {
    console.error('Error deleting all user sessions:', error);
    return 0;
  }
}

/**
 * Get all active sessions for a user
 * @param userId - The user's unique identifier
 * @returns Promise resolving to array of session data
 */
export async function getUserSessions(userId: string): Promise<SessionData[]> {
  try {
    const sessionIds = await redisClient.smembers(getUserSessionsKey(userId));

    if (sessionIds.length === 0) {
      return [];
    }

    const sessions: SessionData[] = [];

    for (const sessionId of sessionIds) {
      const session = await getSession(sessionId);
      if (session) {
        sessions.push(session);
      } else {
        // Clean up stale session ID from set
        await redisClient.srem(getUserSessionsKey(userId), sessionId);
      }
    }

    return sessions;
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
}

/**
 * Check if a session exists and is valid
 * @param sessionId - The session identifier
 * @returns Promise resolving to true if session exists
 */
export async function sessionExists(sessionId: string): Promise<boolean> {
  try {
    const exists = await redisClient.exists(getSessionKey(sessionId));
    return exists === 1;
  } catch (error) {
    console.error('Error checking session existence:', error);
    return false;
  }
}

/**
 * Clean up expired sessions for a user (called periodically)
 * This removes session IDs from the user's session set if the session data no longer exists
 * @param userId - The user's unique identifier
 * @returns Promise resolving to the number of stale sessions cleaned up
 */
export async function cleanupExpiredSessions(userId: string): Promise<number> {
  try {
    const sessionIds = await redisClient.smembers(getUserSessionsKey(userId));
    let cleanedCount = 0;

    for (const sessionId of sessionIds) {
      const exists = await sessionExists(sessionId);
      if (!exists) {
        await redisClient.srem(getUserSessionsKey(userId), sessionId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    return 0;
  }
}

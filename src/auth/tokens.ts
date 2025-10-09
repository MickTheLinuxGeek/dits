import crypto from 'crypto';
import { redisClient } from '../database/redis';

/**
 * Token type enumeration
 */
export enum TokenType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
}

/**
 * Token data structure
 */
interface TokenData {
  userId: string;
  email: string;
  type: TokenType;
  createdAt: number;
}

/**
 * Token key prefixes
 */
const TOKEN_PREFIX = {
  [TokenType.EMAIL_VERIFICATION]: 'verify_token:',
  [TokenType.PASSWORD_RESET]: 'reset_token:',
};

/**
 * Token expiration times (in seconds)
 */
const TOKEN_EXPIRATION = {
  [TokenType.EMAIL_VERIFICATION]: 24 * 60 * 60, // 24 hours
  [TokenType.PASSWORD_RESET]: 60 * 60, // 1 hour
};

/**
 * Generate a secure random token
 * @param length - Token length (default: 32 bytes)
 * @returns Hexadecimal token string
 */
function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Get token key for Redis storage
 */
function getTokenKey(type: TokenType, token: string): string {
  return `${TOKEN_PREFIX[type]}${token}`;
}

/**
 * Create a verification or reset token
 * @param userId - User ID
 * @param email - User email
 * @param type - Token type
 * @returns Promise resolving to the generated token
 */
export async function createToken(
  userId: string,
  email: string,
  type: TokenType,
): Promise<string> {
  const token = generateSecureToken();

  const tokenData: TokenData = {
    userId,
    email,
    type,
    createdAt: Date.now(),
  };

  const ttl = TOKEN_EXPIRATION[type];

  try {
    await redisClient.setex(
      getTokenKey(type, token),
      ttl,
      JSON.stringify(tokenData),
    );

    return token;
  } catch (error) {
    console.error('Error creating token:', error);
    throw new Error('Failed to create token');
  }
}

/**
 * Verify and retrieve token data
 * @param token - The token to verify
 * @param type - Expected token type
 * @returns Promise resolving to token data or null if invalid
 */
export async function verifyToken(
  token: string,
  type: TokenType,
): Promise<TokenData | null> {
  try {
    const data = await redisClient.get(getTokenKey(type, token));

    if (!data) {
      return null;
    }

    const tokenData: TokenData = JSON.parse(data);

    // Verify token type matches
    if (tokenData.type !== type) {
      return null;
    }

    return tokenData;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Consume (delete) a token after use
 * @param token - The token to consume
 * @param type - Token type
 * @returns Promise resolving to true if token was consumed
 */
export async function consumeToken(
  token: string,
  type: TokenType,
): Promise<boolean> {
  try {
    const result = await redisClient.del(getTokenKey(type, token));
    return result === 1;
  } catch (error) {
    console.error('Error consuming token:', error);
    return false;
  }
}

/**
 * Create an email verification token
 * @param userId - User ID
 * @param email - User email
 * @returns Promise resolving to the verification token
 */
export async function createEmailVerificationToken(
  userId: string,
  email: string,
): Promise<string> {
  return createToken(userId, email, TokenType.EMAIL_VERIFICATION);
}

/**
 * Verify an email verification token
 * @param token - The verification token
 * @returns Promise resolving to token data or null if invalid
 */
export async function verifyEmailVerificationToken(
  token: string,
): Promise<TokenData | null> {
  return verifyToken(token, TokenType.EMAIL_VERIFICATION);
}

/**
 * Consume an email verification token
 * @param token - The verification token
 * @returns Promise resolving to true if consumed
 */
export async function consumeEmailVerificationToken(
  token: string,
): Promise<boolean> {
  return consumeToken(token, TokenType.EMAIL_VERIFICATION);
}

/**
 * Create a password reset token
 * @param userId - User ID
 * @param email - User email
 * @returns Promise resolving to the reset token
 */
export async function createPasswordResetToken(
  userId: string,
  email: string,
): Promise<string> {
  return createToken(userId, email, TokenType.PASSWORD_RESET);
}

/**
 * Verify a password reset token
 * @param token - The reset token
 * @returns Promise resolving to token data or null if invalid
 */
export async function verifyPasswordResetToken(
  token: string,
): Promise<TokenData | null> {
  return verifyToken(token, TokenType.PASSWORD_RESET);
}

/**
 * Consume a password reset token
 * @param token - The reset token
 * @returns Promise resolving to true if consumed
 */
export async function consumePasswordResetToken(
  token: string,
): Promise<boolean> {
  return consumeToken(token, TokenType.PASSWORD_RESET);
}

/**
 * Invalidate all tokens of a specific type for a user
 * @param userId - User ID
 * @param type - Token type
 * @returns Promise resolving to number of tokens invalidated
 */
export async function invalidateUserTokens(
  userId: string,
  type: TokenType,
): Promise<number> {
  try {
    const pattern = `${TOKEN_PREFIX[type]}*`;
    let cursor = '0';
    let count = 0;

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
        const data = await redisClient.get(key);
        if (data) {
          const tokenData: TokenData = JSON.parse(data);
          if (tokenData.userId === userId) {
            await redisClient.del(key);
            count++;
          }
        }
      }
    } while (cursor !== '0');

    return count;
  } catch (error) {
    console.error('Error invalidating user tokens:', error);
    return 0;
  }
}

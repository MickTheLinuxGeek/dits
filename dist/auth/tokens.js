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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = void 0;
exports.createToken = createToken;
exports.verifyToken = verifyToken;
exports.consumeToken = consumeToken;
exports.createEmailVerificationToken = createEmailVerificationToken;
exports.verifyEmailVerificationToken = verifyEmailVerificationToken;
exports.consumeEmailVerificationToken = consumeEmailVerificationToken;
exports.createPasswordResetToken = createPasswordResetToken;
exports.verifyPasswordResetToken = verifyPasswordResetToken;
exports.consumePasswordResetToken = consumePasswordResetToken;
exports.invalidateUserTokens = invalidateUserTokens;
const crypto_1 = __importDefault(require("crypto"));
const redis_1 = require("../database/redis");
/**
 * Token type enumeration
 */
var TokenType;
(function (TokenType) {
    TokenType["EMAIL_VERIFICATION"] = "email_verification";
    TokenType["PASSWORD_RESET"] = "password_reset";
})(TokenType || (exports.TokenType = TokenType = {}));
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
function generateSecureToken(length = 32) {
    return crypto_1.default.randomBytes(length).toString('hex');
}
/**
 * Get token key for Redis storage
 */
function getTokenKey(type, token) {
    return `${TOKEN_PREFIX[type]}${token}`;
}
/**
 * Create a verification or reset token
 * @param userId - User ID
 * @param email - User email
 * @param type - Token type
 * @returns Promise resolving to the generated token
 */
function createToken(userId, email, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = generateSecureToken();
        const tokenData = {
            userId,
            email,
            type,
            createdAt: Date.now(),
        };
        const ttl = TOKEN_EXPIRATION[type];
        try {
            yield redis_1.redis.setex(getTokenKey(type, token), ttl, JSON.stringify(tokenData));
            return token;
        }
        catch (error) {
            console.error('Error creating token:', error);
            throw new Error('Failed to create token');
        }
    });
}
/**
 * Verify and retrieve token data
 * @param token - The token to verify
 * @param type - Expected token type
 * @returns Promise resolving to token data or null if invalid
 */
function verifyToken(token, type) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield redis_1.redis.get(getTokenKey(type, token));
            if (!data) {
                return null;
            }
            const tokenData = JSON.parse(data);
            // Verify token type matches
            if (tokenData.type !== type) {
                return null;
            }
            return tokenData;
        }
        catch (error) {
            console.error('Error verifying token:', error);
            return null;
        }
    });
}
/**
 * Consume (delete) a token after use
 * @param token - The token to consume
 * @param type - Token type
 * @returns Promise resolving to true if token was consumed
 */
function consumeToken(token, type) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield redis_1.redis.del(getTokenKey(type, token));
            return result === 1;
        }
        catch (error) {
            console.error('Error consuming token:', error);
            return false;
        }
    });
}
/**
 * Create an email verification token
 * @param userId - User ID
 * @param email - User email
 * @returns Promise resolving to the verification token
 */
function createEmailVerificationToken(userId, email) {
    return __awaiter(this, void 0, void 0, function* () {
        return createToken(userId, email, TokenType.EMAIL_VERIFICATION);
    });
}
/**
 * Verify an email verification token
 * @param token - The verification token
 * @returns Promise resolving to token data or null if invalid
 */
function verifyEmailVerificationToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        return verifyToken(token, TokenType.EMAIL_VERIFICATION);
    });
}
/**
 * Consume an email verification token
 * @param token - The verification token
 * @returns Promise resolving to true if consumed
 */
function consumeEmailVerificationToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        return consumeToken(token, TokenType.EMAIL_VERIFICATION);
    });
}
/**
 * Create a password reset token
 * @param userId - User ID
 * @param email - User email
 * @returns Promise resolving to the reset token
 */
function createPasswordResetToken(userId, email) {
    return __awaiter(this, void 0, void 0, function* () {
        return createToken(userId, email, TokenType.PASSWORD_RESET);
    });
}
/**
 * Verify a password reset token
 * @param token - The reset token
 * @returns Promise resolving to token data or null if invalid
 */
function verifyPasswordResetToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        return verifyToken(token, TokenType.PASSWORD_RESET);
    });
}
/**
 * Consume a password reset token
 * @param token - The reset token
 * @returns Promise resolving to true if consumed
 */
function consumePasswordResetToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        return consumeToken(token, TokenType.PASSWORD_RESET);
    });
}
/**
 * Invalidate all tokens of a specific type for a user
 * @param userId - User ID
 * @param type - Token type
 * @returns Promise resolving to number of tokens invalidated
 */
function invalidateUserTokens(userId, type) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pattern = `${TOKEN_PREFIX[type]}*`;
            let cursor = '0';
            let count = 0;
            do {
                const [newCursor, keys] = yield redis_1.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
                cursor = newCursor;
                for (const key of keys) {
                    const data = yield redis_1.redis.get(key);
                    if (data) {
                        const tokenData = JSON.parse(data);
                        if (tokenData.userId === userId) {
                            yield redis_1.redis.del(key);
                            count++;
                        }
                    }
                }
            } while (cursor !== '0');
            return count;
        }
        catch (error) {
            console.error('Error invalidating user tokens:', error);
            return 0;
        }
    });
}

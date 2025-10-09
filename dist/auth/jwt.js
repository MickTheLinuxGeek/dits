"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.generateTokens = generateTokens;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
exports.decodeToken = decodeToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
/**
 * Generate an access token for a user
 * @param userId - The user's unique identifier
 * @param email - The user's email address
 * @returns JWT access token string
 */
function generateAccessToken(userId, email) {
    const payload = {
        userId,
        email,
        type: 'access',
    };
    const options = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expiresIn: env_1.config.jwt.expiresIn,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.config.jwt.secret, options);
}
/**
 * Generate a refresh token for a user
 * @param userId - The user's unique identifier
 * @param email - The user's email address
 * @returns JWT refresh token string
 */
function generateRefreshToken(userId, email) {
    const payload = {
        userId,
        email,
        type: 'refresh',
    };
    const options = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expiresIn: env_1.config.jwt.refreshExpiresIn,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.config.jwt.refreshSecret, options);
}
/**
 * Generate both access and refresh tokens
 * @param userId - The user's unique identifier
 * @param email - The user's email address
 * @returns Object containing both tokens
 */
function generateTokens(userId, email) {
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
function verifyAccessToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwt.secret);
        if (decoded.type !== 'access') {
            throw new Error('Invalid token type');
        }
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('Access token has expired');
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
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
function verifyRefreshToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwt.refreshSecret);
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('Refresh token has expired');
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
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
function decodeToken(token) {
    try {
        return jsonwebtoken_1.default.decode(token);
    }
    catch (_a) {
        return null;
    }
}

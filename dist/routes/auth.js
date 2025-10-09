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
const express_1 = require("express");
const client_1 = require("@prisma/client");
const password_1 = require("../auth/password");
const jwt_1 = require("../auth/jwt");
const session_1 = require("../auth/session");
const refreshToken_1 = require("../auth/refreshToken");
const tokens_1 = require("../auth/tokens");
const email_1 = require("../services/email");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', rateLimit_1.rateLimiters.register, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name } = req.body;
        // Validate required fields
        if (!email || !password || !name) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Email, password, and name are required',
            });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Invalid email format',
            });
        }
        // Validate password strength
        const passwordValidation = (0, password_1.validatePasswordStrength)(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Password does not meet requirements',
                errors: passwordValidation.errors,
            });
        }
        // Check if user already exists
        const existingUser = yield prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'User with this email already exists',
            });
        }
        // Hash password
        const hashedPassword = yield (0, password_1.hashPassword)(password);
        // Create user
        const user = yield prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name,
                preferences: {},
            },
        });
        // Generate email verification token
        const verificationToken = yield (0, tokens_1.createEmailVerificationToken)(user.id, user.email);
        // Send verification email (don't wait for it)
        (0, email_1.sendVerificationEmail)(user.email, user.name, verificationToken).catch((error) => {
            console.error('Failed to send verification email:', error);
        });
        // Generate tokens
        const tokens = (0, jwt_1.generateTokens)(user.id, user.email);
        // Store refresh token
        yield (0, refreshToken_1.storeRefreshToken)(tokens.refreshToken, user.id, user.email);
        // Create session
        yield (0, session_1.createSession)(user.id, user.email, tokens.refreshToken, {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        // Send welcome email (don't wait for it)
        (0, email_1.sendWelcomeEmail)(user.email, user.name).catch((error) => {
            console.error('Failed to send welcome email:', error);
        });
        return res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            tokens,
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred during registration',
        });
    }
}));
/**
 * POST /auth/login
 * Login user and return tokens
 */
router.post('/login', rateLimit_1.rateLimiters.login, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Email and password are required',
            });
        }
        // Find user
        const user = yield prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            return res.status(401).json({
                error: 'Authentication Failed',
                message: 'Invalid email or password',
            });
        }
        // Verify password
        const isPasswordValid = yield (0, password_1.verifyPassword)(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Authentication Failed',
                message: 'Invalid email or password',
            });
        }
        // Generate tokens
        const tokens = (0, jwt_1.generateTokens)(user.id, user.email);
        // Store refresh token
        yield (0, refreshToken_1.storeRefreshToken)(tokens.refreshToken, user.id, user.email);
        // Create session
        yield (0, session_1.createSession)(user.id, user.email, tokens.refreshToken, {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });
        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            tokens,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred during login',
        });
    }
}));
/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', rateLimit_1.rateLimiters.tokenRefresh, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Refresh token is required',
            });
        }
        // Rotate refresh token
        const newTokens = yield (0, refreshToken_1.rotateRefreshToken)(refreshToken);
        if (!newTokens) {
            return res.status(401).json({
                error: 'Authentication Failed',
                message: 'Invalid or expired refresh token',
            });
        }
        return res.status(200).json({
            message: 'Token refreshed successfully',
            tokens: newTokens,
        });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred during token refresh',
        });
    }
}));
/**
 * POST /auth/logout
 * Logout user and revoke tokens
 */
router.post('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            // Revoke refresh token
            yield (0, refreshToken_1.revokeRefreshToken)(refreshToken);
            // Delete session
            yield (0, session_1.deleteSession)(refreshToken);
        }
        return res.status(200).json({
            message: 'Logout successful',
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred during logout',
        });
    }
}));
/**
 * POST /auth/request-password-reset
 * Request password reset email
 */
router.post('/request-password-reset', rateLimit_1.rateLimiters.passwordResetRequest, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Email is required',
            });
        }
        // Find user
        const user = yield prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        // Always return success to prevent email enumeration
        if (!user) {
            return res.status(200).json({
                message: 'If the email exists, a password reset link has been sent',
            });
        }
        // Create password reset token
        const resetToken = yield (0, tokens_1.createPasswordResetToken)(user.id, user.email);
        // Send reset email
        const emailSent = yield (0, email_1.sendPasswordResetEmail)(user.email, user.name, resetToken);
        if (!emailSent) {
            console.error('Failed to send password reset email');
        }
        return res.status(200).json({
            message: 'If the email exists, a password reset link has been sent',
        });
    }
    catch (error) {
        console.error('Password reset request error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred while processing your request',
        });
    }
}));
/**
 * POST /auth/reset-password
 * Reset password using token
 */
router.post('/reset-password', rateLimit_1.rateLimiters.passwordResetConfirm, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Token and new password are required',
            });
        }
        // Validate password strength
        const passwordValidation = (0, password_1.validatePasswordStrength)(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Password does not meet requirements',
                errors: passwordValidation.errors,
            });
        }
        // Verify token
        const tokenData = yield (0, tokens_1.verifyPasswordResetToken)(token);
        if (!tokenData) {
            return res.status(401).json({
                error: 'Invalid Token',
                message: 'Invalid or expired password reset token',
            });
        }
        // Hash new password
        const hashedPassword = yield (0, password_1.hashPassword)(newPassword);
        // Update user password
        yield prisma.user.update({
            where: { id: tokenData.userId },
            data: { password: hashedPassword },
        });
        // Consume token
        yield (0, tokens_1.consumePasswordResetToken)(token);
        // Invalidate all user sessions
        yield (0, session_1.deleteAllUserSessions)(tokenData.userId);
        // Get user for email
        const user = yield prisma.user.findUnique({
            where: { id: tokenData.userId },
        });
        if (user) {
            // Send confirmation email
            (0, email_1.sendPasswordChangedEmail)(user.email, user.name).catch((error) => {
                console.error('Failed to send password changed email:', error);
            });
        }
        return res.status(200).json({
            message: 'Password reset successful',
        });
    }
    catch (error) {
        console.error('Password reset error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred while resetting your password',
        });
    }
}));
/**
 * POST /auth/verify-email
 * Verify email address using token
 */
router.post('/verify-email', rateLimit_1.rateLimiters.emailVerification, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Verification token is required',
            });
        }
        // Verify token
        const tokenData = yield (0, tokens_1.verifyEmailVerificationToken)(token);
        if (!tokenData) {
            return res.status(401).json({
                error: 'Invalid Token',
                message: 'Invalid or expired verification token',
            });
        }
        // Update user verification status (you may want to add an emailVerified field to schema)
        // For now, we'll just consume the token
        yield (0, tokens_1.consumeEmailVerificationToken)(token);
        return res.status(200).json({
            message: 'Email verified successfully',
        });
    }
    catch (error) {
        console.error('Email verification error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred while verifying your email',
        });
    }
}));
/**
 * POST /auth/resend-verification
 * Resend email verification
 */
router.post('/resend-verification', rateLimit_1.rateLimiters.emailVerification, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Email is required',
            });
        }
        // Find user
        const user = yield prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        // Always return success to prevent email enumeration
        if (!user) {
            return res.status(200).json({
                message: 'If the email exists, a verification link has been sent',
            });
        }
        // Invalidate old tokens
        yield (0, tokens_1.invalidateUserTokens)(user.id, tokens_1.TokenType.EMAIL_VERIFICATION);
        // Create new verification token
        const verificationToken = yield (0, tokens_1.createEmailVerificationToken)(user.id, user.email);
        // Send verification email
        const emailSent = yield (0, email_1.sendVerificationEmail)(user.email, user.name, verificationToken);
        if (!emailSent) {
            console.error('Failed to send verification email');
        }
        return res.status(200).json({
            message: 'If the email exists, a verification link has been sent',
        });
    }
    catch (error) {
        console.error('Resend verification error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred while sending verification email',
        });
    }
}));
exports.default = router;

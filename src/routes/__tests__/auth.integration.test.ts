// Mock config - MUST be before any imports
jest.mock('../../config/env', () => ({
  config: {
    app: {
      env: 'test',
      port: 3000,
      url: 'http://localhost:3000',
      clientUrl: 'http://localhost:3000',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    jwt: {
      secret: 'test-jwt-secret',
      refreshSecret: 'test-jwt-refresh-secret',
      expiresIn: '15m',
      refreshExpiresIn: '7d',
    },
    session: {
      secret: 'test-session-secret',
      timeout: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    bcrypt: {
      rounds: 10, // Lower rounds for faster tests
    },
    rateLimit: {
      windowMs: 900000,
      maxRequests: 100,
    },
  },
  isDevelopment: () => false,
  isProduction: () => false,
  isTest: () => true,
}));

// Mock email service - MUST be before any imports
jest.mock('../../services/email', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendPasswordChangedEmail: jest.fn().mockResolvedValue(true),
}));

import request from 'supertest';
import express, { Application } from 'express';
import { PrismaClient } from '@prisma/client';
import authRouter from '../auth';
import { redis as redisClient } from '../../database/redis';
import * as emailService from '../../services/email';
import {
  verifyEmailVerificationToken,
  verifyPasswordResetToken,
} from '../../auth/tokens';

describe('Auth Integration Tests', () => {
  let app: Application;
  let prisma: PrismaClient;
  let testUser: {
    email: string;
    password: string;
    name: string;
  };

  beforeAll(async () => {
    // Initialize Express app
    app = express();
    app.use(express.json());
    app.use('/auth', authRouter);

    // Initialize Prisma client
    prisma = new PrismaClient();

    // Clear test data
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    });

    // Clear Redis
    await redisClient.flushdb();

    testUser = {
      email: 'test@example.com',
      password: 'Test@Password123',
      name: 'Test User',
    };
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test',
        },
      },
    });
    await redisClient.flushdb();
    await prisma.$disconnect();
    await redisClient.quit();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    // Clear only rate limit keys to avoid breaking tokens mid-test
    const keys = await redisClient.keys('rate_limit:*');
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  });

  describe('Registration Flow', () => {
    it('should successfully register a new user with valid credentials', async () => {
      const response = await request(app).post('/auth/register').send({
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        'message',
        'Registration successful',
      );
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        email: testUser.email.toLowerCase(),
        name: testUser.name,
        emailVerified: false,
      });
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: testUser.email.toLowerCase() },
      });
      expect(user).toBeTruthy();
      expect(user?.email).toBe(testUser.email.toLowerCase());
      expect(user?.name).toBe(testUser.name);

      // Verify email was sent
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        testUser.email.toLowerCase(),
        testUser.name,
      );
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app).post('/auth/register').send({
        email: testUser.email,
        password: testUser.password,
        // Missing name
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should reject registration with invalid email format', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'invalid-email',
        password: testUser.password,
        name: testUser.name,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body.message).toContain('Invalid email format');
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'newuser@example.com',
        password: 'weak',
        name: 'New User',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body.message).toContain('Password must be');
    });

    it('should reject registration with duplicate email', async () => {
      const response = await request(app).post('/auth/register').send({
        email: testUser.email,
        password: testUser.password,
        name: 'Another User',
      });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Conflict');
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('Login Flow', () => {
    it('should successfully login with valid credentials', async () => {
      const response = await request(app).post('/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        email: testUser.email.toLowerCase(),
        name: testUser.name,
      });
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      // Store tokens for later tests
      testUser['accessToken' as keyof typeof testUser] =
        response.body.accessToken;
      testUser['refreshToken' as keyof typeof testUser] =
        response.body.refreshToken;
    });

    it('should reject login with missing credentials', async () => {
      const response = await request(app).post('/auth/login').send({
        email: testUser.email,
        // Missing password
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app).post('/auth/login').send({
        email: 'nonexistent@example.com',
        password: testUser.password,
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authentication Failed');
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app).post('/auth/login').send({
        email: testUser.email,
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authentication Failed');
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should handle case-insensitive email login', async () => {
      const response = await request(app).post('/auth/login').send({
        email: testUser.email.toUpperCase(),
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
    });
  });

  describe('Email Verification Flow', () => {
    let verificationToken: string;

    beforeAll(async () => {
      // Create a new user for verification testing
      const newUser = await prisma.user.create({
        data: {
          email: 'verify-test@example.com',
          password: 'hashed_password',
          name: 'Verify Test',
          preferences: {},
        },
      });

      // Mock the verification token creation
      const { createEmailVerificationToken } = await import(
        '../../auth/tokens'
      );
      verificationToken = await createEmailVerificationToken(
        newUser.id,
        newUser.email,
      );
    });

    afterAll(async () => {
      await prisma.user.deleteMany({
        where: { email: 'verify-test@example.com' },
      });
    });

    it('should successfully verify email with valid token (POST)', async () => {
      const response = await request(app).post('/auth/verify-email').send({
        token: verificationToken,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Email verified successfully',
      );
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.emailVerified).toBe(true);
    });

    it('should reject verification with invalid token', async () => {
      const response = await request(app).post('/auth/verify-email').send({
        token: 'invalid-token',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid Token');
    });

    it('should reject verification with missing token', async () => {
      const response = await request(app).post('/auth/verify-email').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should handle GET request for email verification link', async () => {
      // Create new token for GET test
      const user = await prisma.user.findUnique({
        where: { email: 'verify-test@example.com' },
      });
      const { createEmailVerificationToken } = await import(
        '../../auth/tokens'
      );
      const newToken = await createEmailVerificationToken(
        user!.id,
        user!.email,
      );

      const response = await request(app)
        .get(`/auth/verify-email?token=${newToken}`)
        .expect(302); // Redirect

      expect(response.headers.location).toContain(
        'http://localhost:3000/auth/verify-email?success=true',
      );
    });

    it('should redirect to error page with invalid GET token', async () => {
      const response = await request(app)
        .get('/auth/verify-email?token=invalid')
        .expect(302);

      expect(response.headers.location).toContain('error=invalid-token');
    });

    it('should successfully resend verification email', async () => {
      const response = await request(app)
        .post('/auth/resend-verification')
        .send({
          email: 'verify-test@example.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain(
        'verification link has been sent',
      );
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should handle resend verification for non-existent email gracefully', async () => {
      const response = await request(app)
        .post('/auth/resend-verification')
        .send({
          email: 'nonexistent@example.com',
        });

      // Should still return 200 to prevent email enumeration
      expect(response.status).toBe(200);
      expect(response.body.message).toContain(
        'verification link has been sent',
      );
    });
  });

  describe('Password Reset Flow', () => {
    let resetToken: string;
    const resetTestEmail = 'reset-test@example.com';

    beforeAll(async () => {
      // Create a user for password reset testing
      const user = await prisma.user.create({
        data: {
          email: resetTestEmail,
          password: 'hashed_old_password',
          name: 'Reset Test',
          preferences: {},
        },
      });

      // Create reset token
      const { createPasswordResetToken } = await import('../../auth/tokens');
      resetToken = await createPasswordResetToken(user.id, user.email);
    });

    afterAll(async () => {
      await prisma.user.deleteMany({
        where: { email: resetTestEmail },
      });
    });

    it('should successfully request password reset', async () => {
      const response = await request(app)
        .post('/auth/request-password-reset')
        .send({
          email: resetTestEmail,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain(
        'password reset link has been sent',
      );
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should handle password reset request for non-existent email gracefully', async () => {
      const response = await request(app)
        .post('/auth/request-password-reset')
        .send({
          email: 'nonexistent@example.com',
        });

      // Should return 200 to prevent email enumeration
      expect(response.status).toBe(200);
      expect(response.body.message).toContain(
        'password reset link has been sent',
      );
    });

    it('should reject password reset request without email', async () => {
      const response = await request(app)
        .post('/auth/request-password-reset')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should handle GET request for password reset link', async () => {
      const response = await request(app)
        .get(`/auth/reset-password?token=${resetToken}`)
        .expect(302); // Redirect

      expect(response.headers.location).toContain(
        'http://localhost:3000/auth/reset-password?token=',
      );
    });

    it('should redirect to error with invalid GET reset token', async () => {
      const response = await request(app)
        .get('/auth/reset-password?token=invalid')
        .expect(302);

      expect(response.headers.location).toContain('error=invalid-token');
    });

    it('should successfully reset password with valid token', async () => {
      const newPassword = 'NewSecure@Password456';

      const response = await request(app).post('/auth/reset-password').send({
        token: resetToken,
        newPassword,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Password reset successful',
      );
      expect(emailService.sendPasswordChangedEmail).toHaveBeenCalled();

      // Verify user can login with new password
      const loginResponse = await request(app).post('/auth/login').send({
        email: resetTestEmail,
        password: newPassword,
      });

      expect(loginResponse.status).toBe(200);
    });

    it('should reject password reset with invalid token', async () => {
      const response = await request(app).post('/auth/reset-password').send({
        token: 'invalid-token',
        newPassword: 'NewSecure@Password789',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid Token');
    });

    it('should reject password reset with weak password', async () => {
      const user = await prisma.user.findUnique({
        where: { email: resetTestEmail },
      });
      const { createPasswordResetToken } = await import('../../auth/tokens');
      const newResetToken = await createPasswordResetToken(
        user!.id,
        user!.email,
      );

      const response = await request(app).post('/auth/reset-password').send({
        token: newResetToken,
        newPassword: 'weak',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
      expect(response.body.message).toContain('Password must be');
    });

    it('should reject password reset with missing fields', async () => {
      const response = await request(app).post('/auth/reset-password').send({
        token: 'some-token',
        // Missing newPassword
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });
  });

  describe('Logout Flow', () => {
    let logoutUser: {
      email: string;
      password: string;
      accessToken: string;
      refreshToken: string;
    };

    beforeAll(async () => {
      // Create and login a user for logout testing
      const email = 'logout-test@example.com';
      const password = 'Logout@Test123';
      const name = 'Logout Test';

      await request(app).post('/auth/register').send({
        email,
        password,
        name,
      });

      const loginResponse = await request(app).post('/auth/login').send({
        email,
        password,
      });

      logoutUser = {
        email,
        password,
        accessToken: loginResponse.body.accessToken,
        refreshToken: loginResponse.body.refreshToken,
      };
    });

    afterAll(async () => {
      await prisma.user.deleteMany({
        where: { email: 'logout-test@example.com' },
      });
    });

    it('should successfully logout with valid refresh token', async () => {
      const response = await request(app).post('/auth/logout').send({
        refreshToken: logoutUser.refreshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logout successful');

      // Verify refresh token is no longer valid
      const refreshResponse = await request(app).post('/auth/refresh').send({
        refreshToken: logoutUser.refreshToken,
      });

      expect(refreshResponse.status).toBe(401);
    });

    it('should handle logout without refresh token gracefully', async () => {
      const response = await request(app).post('/auth/logout').send({});

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logout successful');
    });

    it('should handle logout with already invalidated token', async () => {
      // Login again to get fresh token
      const loginResponse = await request(app).post('/auth/login').send({
        email: logoutUser.email,
        password: logoutUser.password,
      });

      const freshToken = loginResponse.body.refreshToken;

      // Logout once
      await request(app).post('/auth/logout').send({
        refreshToken: freshToken,
      });

      // Try to logout again with same token
      const response = await request(app).post('/auth/logout').send({
        refreshToken: freshToken,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logout successful');
    });
  });

  describe('Token Refresh Flow', () => {
    const userCredentials = {
      email: 'refresh-test@example.com',
      password: 'Refresh@Test123',
      name: 'Refresh Test',
    };

    beforeAll(async () => {
      // Register user once
      await request(app).post('/auth/register').send(userCredentials);
    });

    afterAll(async () => {
      await prisma.user.deleteMany({
        where: { email: userCredentials.email },
      });
    });

    it('should successfully refresh access token with valid refresh token', async () => {
      // Get fresh tokens for this specific test
      const loginResponse = await request(app).post('/auth/login').send({
        email: userCredentials.email,
        password: userCredentials.password,
      });

      const originalAccessToken = loginResponse.body.accessToken;
      const originalRefreshToken = loginResponse.body.refreshToken;

      // Wait 1 second to ensure different iat timestamps in JWTs
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await request(app).post('/auth/refresh').send({
        refreshToken: originalRefreshToken,
      });

      // Debug: Log response if it fails
      if (response.status !== 200) {
        console.log('Refresh response status:', response.status);
        console.log('Refresh response body:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Token refreshed successfully',
      );
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).not.toBe(originalAccessToken);
      expect(response.body.refreshToken).not.toBe(originalRefreshToken);
    });

    it('should reject refresh with invalid refresh token', async () => {
      const response = await request(app).post('/auth/refresh').send({
        refreshToken: 'invalid-refresh-token',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authentication Failed');
    });

    it('should reject refresh without refresh token', async () => {
      const response = await request(app).post('/auth/refresh').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation Error');
    });
  });

  describe('Get Current User Flow', () => {
    let authUser: {
      email: string;
      accessToken: string;
    };

    beforeAll(async () => {
      const email = 'me-test@example.com';
      const password = 'Me@Test123';
      const name = 'Me Test';

      await request(app).post('/auth/register').send({
        email,
        password,
        name,
      });

      const loginResponse = await request(app).post('/auth/login').send({
        email,
        password,
      });

      authUser = {
        email,
        accessToken: loginResponse.body.accessToken,
      };
    });

    afterAll(async () => {
      await prisma.user.deleteMany({
        where: { email: 'me-test@example.com' },
      });
    });

    it('should successfully get current user with valid access token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${authUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'email',
        authUser.email.toLowerCase(),
      );
      expect(response.body).toHaveProperty('name', 'Me Test');
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should reject get current user without access token', async () => {
      const response = await request(app).get('/auth/me');

      expect(response.status).toBe(401);
    });

    it('should reject get current user with invalid access token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});

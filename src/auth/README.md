# Authentication System

This directory contains the complete authentication implementation for the DITS application.

## Implemented Features

### Task 15: JWT Token Generation and Validation
- **File**: `jwt.ts`
- **Features**:
  - Access token generation (15-minute expiration)
  - Refresh token generation (7-day expiration)
  - Token verification with type checking
  - Comprehensive error handling for expired/invalid tokens

### Task 16: User Registration and Login Endpoints
- **File**: `../routes/auth.ts`
- **Endpoints**:
  - `POST /auth/register` - Register new user with email verification
  - `POST /auth/login` - Authenticate user and issue tokens
  - `POST /auth/logout` - Revoke tokens and end session
  - `POST /auth/refresh` - Refresh access token using refresh token
  - `POST /auth/resend-verification` - Resend email verification

### Task 17: Password Hashing with bcrypt
- **File**: `password.ts`
- **Features**:
  - Secure password hashing with configurable salt rounds (default: 12)
  - Password verification
  - Password strength validation (8+ chars, uppercase, lowercase, digit, special char)
  - Random password generation for development/testing

### Task 18: Refresh Token Rotation Mechanism
- **File**: `refreshToken.ts`
- **Features**:
  - Token family tracking for reuse detection
  - Automatic token rotation on refresh
  - Invalidation of entire token family on reuse attempt
  - Secure token storage in Redis with expiration

### Task 19: Password Reset Functionality
- **Files**: `tokens.ts`, `../services/email.ts`, `../routes/auth.ts`
- **Endpoints**:
  - `POST /auth/request-password-reset` - Request password reset email
  - `POST /auth/reset-password` - Reset password with token
- **Features**:
  - Secure random token generation (32 bytes)
  - 1-hour token expiration
  - Email enumeration protection
  - Automatic session invalidation on password change

### Task 20: Email Verification System
- **Files**: `tokens.ts`, `../services/email.ts`, `../routes/auth.ts`
- **Endpoint**: `POST /auth/verify-email`
- **Features**:
  - Email verification tokens with 24-hour expiration
  - Welcome emails on registration
  - Verification reminder emails
  - Token invalidation after use

### Task 21: Rate Limiting for Authentication Endpoints
- **File**: `../middleware/rateLimit.ts`
- **Rate Limits**:
  - Login: 5 attempts per 15 minutes
  - Registration: 3 attempts per hour
  - Password reset request: 3 attempts per hour
  - Password reset confirm: 5 attempts per hour
  - Email verification: 5 attempts per hour
  - Token refresh: 20 attempts per 15 minutes
- **Features**:
  - Redis-based rate limiting
  - Informative rate limit headers
  - Configurable per endpoint

### Task 22: User Session Management
- **File**: `session.ts`
- **Features**:
  - Session storage in Redis with TTL
  - Multiple session support per user
  - Session tracking (IP address, user agent, activity timestamps)
  - Bulk session management (revoke all user sessions)
  - Automatic cleanup of expired sessions

## Architecture

### Token Flow
1. **Registration/Login**:
   - User provides credentials
   - System generates access + refresh tokens
   - Refresh token stored in Redis with family tracking
   - Session created with metadata

2. **Token Refresh**:
   - Client sends refresh token
   - System validates and rotates token
   - Old token invalidated, new tokens issued
   - Session updated with new token

3. **Logout**:
   - Refresh token revoked from Redis
   - Session deleted
   - All active tokens remain valid until expiration

### Security Features

1. **Token Rotation**: Refresh tokens are rotated on every use to detect replay attacks
2. **Token Family**: Groups of tokens tracked to invalidate all on suspicious activity
3. **Rate Limiting**: Prevents brute force attacks on authentication endpoints
4. **Password Requirements**: Enforced minimum security standards
5. **Session Tracking**: IP and user agent recorded for audit purposes
6. **Email Enumeration Protection**: Same response for existing/non-existing users
7. **Secure Token Generation**: Cryptographically secure random tokens

## Usage Examples

### Register a New User
```typescript
POST /auth/register
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "name": "John Doe"
}

Response:
{
  "message": "Registration successful",
  "user": { "id": "...", "email": "...", "name": "..." },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### Login
```typescript
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}

Response:
{
  "message": "Login successful",
  "user": { "id": "...", "email": "...", "name": "..." },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### Refresh Token
```typescript
POST /auth/refresh
{
  "refreshToken": "..."
}

Response:
{
  "message": "Token refreshed successfully",
  "tokens": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### Request Password Reset
```typescript
POST /auth/request-password-reset
{
  "email": "user@example.com"
}

Response:
{
  "message": "If the email exists, a password reset link has been sent"
}
```

### Reset Password
```typescript
POST /auth/reset-password
{
  "token": "...",
  "newPassword": "NewSecureP@ss123"
}

Response:
{
  "message": "Password reset successful"
}
```

## Configuration

All authentication settings are configured via environment variables in `.env`:

```bash
# JWT Settings
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Password Hashing
BCRYPT_ROUNDS=12

# Session Settings
SESSION_SECRET=your-session-secret
SESSION_TIMEOUT=604800000  # 7 days in ms

# Email Settings
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@dits.dev

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

## Dependencies

- `jsonwebtoken` - JWT generation and verification
- `bcryptjs` - Password hashing
- `nodemailer` - Email sending
- `express` - Web framework
- `@prisma/client` - Database ORM
- `ioredis` - Redis client

## Testing

To test the authentication system:

1. Ensure PostgreSQL and Redis are running
2. Run migrations: `npm run db:migrate`
3. Start the server: `npm start`
4. Use the endpoints documented above

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never expose secrets in production** - Use strong, randomly generated secrets
2. **Use HTTPS in production** - All authentication endpoints must use HTTPS
3. **Rotate secrets periodically** - Change JWT secrets and encryption keys regularly
4. **Monitor for attacks** - Watch rate limit logs for suspicious activity
5. **Keep dependencies updated** - Regularly update security-related packages
6. **Backup Redis data** - Session and token data should be backed up
7. **Implement 2FA** - Consider adding two-factor authentication for enhanced security

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, GitHub)
- [ ] Email verification requirement before login
- [ ] Account lockout after failed attempts
- [ ] Security audit logging
- [ ] Device management (trusted devices)
- [ ] Biometric authentication support

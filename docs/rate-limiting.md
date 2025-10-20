# Rate Limiting Guide

## Overview

DITS implements rate limiting to protect authentication and sensitive endpoints from abuse. Rate limits are enforced per IP address using Redis as the backing store.

## Rate Limit Configuration

### Development vs Production

Rate limits are significantly more lenient in development mode to facilitate testing:

| Endpoint | Development | Production | Window |
|----------|-------------|------------|--------|
| Login | 50 requests | 5 requests | 15 minutes |
| Registration | 20 requests | 3 requests | 1 hour |
| Password Reset Request | 3 requests | 3 requests | 1 hour |
| Password Reset Confirm | 5 requests | 5 requests | 1 hour |
| Email Verification | 5 requests | 5 requests | 1 hour |
| Token Refresh | 20 requests | 20 requests | 15 minutes |

### How It Works

- Rate limits are tracked **per IP address** across all user accounts
- Counters are stored in Redis with automatic expiration
- When a limit is exceeded, the API returns HTTP 429 (Too Many Requests)
- Response headers indicate when the limit will reset:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Timestamp when the limit resets
  - `Retry-After`: Seconds until the limit resets

## Common Issues

### Issue: Getting 429 errors during development

**Problem**: Testing multiple login attempts or switching between user accounts quickly can trigger rate limits.

**Solution**: Rate limits are now more lenient in development (50 login attempts vs 5 in production), but you can also manually reset them.

### Resetting Rate Limits

Use the provided utility script to clear rate limits during development:

```bash
# Clear all rate limits
npx tsx src/scripts/resetRateLimit.ts

# Clear rate limits for a specific IP address
npx tsx src/scripts/resetRateLimit.ts 127.0.0.1

# Clear rate limits for your local IP (if different)
npx tsx src/scripts/resetRateLimit.ts ::1
```

## Implementation Details

### Code Location

- **Middleware**: `src/middleware/rateLimit.ts`
- **Configuration**: `RateLimitPresets` object in the middleware file
- **Reset Utility**: `src/scripts/resetRateLimit.ts`

### Redis Keys

Rate limit counters are stored in Redis with the following key pattern:
```
rate_limit:{endpoint}:{ip_address}:{endpoint}
```

Examples:
- `rate_limit:auth:login:127.0.0.1:auth:login`
- `rate_limit:auth:register:192.168.1.100:auth:register`

### Customizing Rate Limits

To modify rate limits, edit `src/middleware/rateLimit.ts`:

```typescript
export const RateLimitPresets = {
  AUTH_LOGIN: {
    windowMs: 15 * 60 * 1000, // Time window (15 minutes)
    maxRequests: config.app.env === 'development' ? 50 : 5, // Request limit
    message: 'Too many login attempts. Please try again later.',
  },
  // ... other presets
};
```

### Programmatic Access

You can check or reset rate limits programmatically:

```typescript
import { getRateLimitStatus, resetRateLimit } from './middleware/rateLimit';

// Check current status
const status = await getRateLimitStatus('auth:login', '127.0.0.1', 5);
console.log(status.remaining); // Requests remaining
console.log(status.resetAt);   // When limit resets
console.log(status.limited);   // Whether currently limited

// Reset rate limit
await resetRateLimit('auth:login', '127.0.0.1');
```

## Production Considerations

### Security Best Practices

1. **Never disable rate limiting in production** - It protects against brute force attacks
2. **Monitor rate limit hits** - Frequent 429 errors may indicate an attack or misconfigured client
3. **Use appropriate limits** - Balance security with user experience
4. **Consider user-based limits** - For authenticated endpoints, consider rate limiting per user ID instead of IP

### Adjusting Production Limits

If legitimate users are hitting production rate limits:

1. Analyze logs to understand usage patterns
2. Consider increasing limits for specific endpoints
3. Implement graduated response (e.g., CAPTCHA before complete blocking)
4. Add user-specific rate limits for authenticated requests

### Infrastructure

- Ensure Redis is properly configured for production
- Consider Redis persistence settings for rate limit data
- Monitor Redis memory usage as rate limit keys accumulate
- Set up alerts for high rate limit hit rates

## Testing

When writing integration tests that involve authentication:

```typescript
// Reset rate limits before test suite
beforeAll(async () => {
  await resetRateLimit('auth:login', 'test-ip');
});

// Or increase limits for test environment
// in src/config/env.ts, add a 'test' environment check
```

## Troubleshooting

### Rate limits not working

1. Check Redis connection: `redis-cli ping`
2. Verify Redis is running: `systemctl status redis` (Linux)
3. Check environment variable: `NODE_ENV=development`

### Rate limits resetting unexpectedly

1. Check Redis persistence settings
2. Verify Redis isn't being flushed by other processes
3. Ensure Redis has sufficient memory

### Different rate limit behavior than expected

1. Confirm `NODE_ENV` is set correctly (development/production)
2. Check if requests are coming from expected IP
3. Inspect `X-Forwarded-For` headers if behind a proxy

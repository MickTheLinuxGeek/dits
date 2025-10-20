# Authentication System Setup

## Current Status

The authentication system code is implemented but **cannot be tested yet** due to missing prerequisites.

## Missing Prerequisites

### 1. Environment Configuration (.env file)

**Status:** ✗ Not found

Create `.env` file in `/home/mbiel/Dev_Projects/dits/` with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dits"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Secrets (generate strong random strings)
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-key-here"

# JWT Expiration
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Email (optional for testing)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-password"
SMTP_FROM="noreply@dits.dev"

# App
NODE_ENV="development"
PORT="3000"
```

### 2. Database Containers

**Status:** ✗ Not running

PostgreSQL and Redis containers are not running. You need to:

**Option A: Docker Compose (Recommended)**
Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: dits
      POSTGRES_USER: dits_user
      POSTGRES_PASSWORD: dits_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

Then run: `docker-compose up -d`

**Option B: Native Installation**
- Install PostgreSQL and Redis via dnf
- Start services: `sudo systemctl start postgresql redis`

### 3. Database Migrations

**Status:** ✗ Not applied

The Prisma schema exists but hasn't been applied to the database.

After database is running, run:
```bash
npm run db:migrate
```

## Setup Steps

1. **Create `.env` file** (see template above)
2. **Start databases** (Docker Compose or native)
3. **Run migrations**: `npm run db:migrate`
4. **Start server**: `npm run dev`

## Testing the Auth System

Once setup is complete, you can test these endpoints:

### Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh-token-from-login>"
  }'
```

### Logout
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh-token>"
  }'
```

## Available Commands

- `npm run dev` - Start development server
- `npm run test` - Run tests
- `npm run db:migrate` - Apply database migrations
- `npm run db:studio` - Open Prisma Studio GUI
- `npm run db:seed` - Seed database with initial data
- `npm run db:reset` - Reset database (dangerous!)

## Implemented Features

✓ User registration with password validation
✓ User login with credential verification
✓ JWT access and refresh tokens
✓ Token refresh mechanism
✓ Session management (Redis)
✓ Password reset flow
✓ Email verification flow
✓ Rate limiting on auth endpoints
✓ Password hashing (bcrypt)
✓ Email notifications (welcome, verification, password reset)

## Next Steps After Setup

1. Test all auth endpoints manually
2. Write integration tests for auth flows
3. Test rate limiting behavior
4. Test email verification flow
5. Test password reset flow

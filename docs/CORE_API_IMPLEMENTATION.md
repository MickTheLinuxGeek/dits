# Core API Development Implementation

This document describes the implementation of tasks 23-30 from the DITS task list, which covers the Core API Development phase.

## Completed Tasks

### Task 23: Express.js Server with Middleware Configuration ✅

**Location:** `src/app.ts`, `src/index.ts`

Implemented a comprehensive Express.js server with the following middleware:

- **Body Parsing:** JSON and URL-encoded request body parsing with 10MB limit
- **Compression:** Response compression using gzip
- **Cookie Parser:** Secure cookie parsing with secret
- **Morgan:** HTTP request logging (dev mode in development, combined in production)
- **Health Check Endpoint:** `/health` endpoint for monitoring

**Features:**
- Async app creation with proper initialization order
- Graceful shutdown handling (SIGTERM, SIGINT)
- Uncaught exception and unhandled rejection handling
- Environment-based configuration

### Task 24: CORS and Security Headers (Helmet) ✅

**Location:** `src/app.ts`

Implemented comprehensive security measures:

- **Helmet Middleware:** Security headers including:
  - Content Security Policy (CSP)
  - X-DNS-Prefetch-Control
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy
  - And more...

- **CORS Configuration:**
  - Configurable origins from environment variables
  - Credentials support
  - Custom allowed headers and exposed headers
  - Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
  - 24-hour preflight cache

### Task 25: GraphQL Schema and Resolvers ✅

**Location:** `src/graphql/`

Created a complete GraphQL API with Apollo Server:

**Files Created:**
- `typeDefs.ts` - GraphQL schema definitions
- `resolvers.ts` - Query and mutation resolvers
- `server.ts` - Apollo Server configuration

**Features:**
- Custom DateTime and JSON scalars
- User authentication types
- Health check query
- Auth mutations (register, login, logout, password reset, email verification)
- Context-based authentication
- Error formatting and logging
- Introspection control (disabled in production)

**Endpoint:** `/graphql`

### Task 26: REST API Endpoints ✅

**Location:** `src/routes/`

Organized REST API with versioning support:

**Files:**
- `routes/index.ts` - Central route organization
- `routes/auth.ts` - Authentication endpoints (already existed, now integrated)

**REST Endpoints:**
- `GET /api/v1` - API version information
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/request-password-reset` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/verify-email` - Email verification
- `POST /api/v1/auth/resend-verification` - Resend verification email

### Task 27: Request Validation (Zod) ✅

**Location:** `src/middleware/validate.ts`

Implemented comprehensive request validation middleware:

**Features:**
- Zod-based schema validation
- Support for body, query, and params validation
- Combined validation for multiple targets
- Detailed error messages with field-level errors
- Type-safe validation

**Usage:**
```typescript
import { validate } from './middleware/validate';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/register', validate(userSchema), handler);
```

### Task 28: Error Handling Middleware ✅

**Location:** `src/middleware/errorHandler.ts`, `src/middleware/notFoundHandler.ts`

Implemented centralized error handling:

**Features:**
- Custom `AppError` class with status codes
- Automatic error type detection (Prisma, JWT, Validation, etc.)
- Operational vs. programming error distinction
- Stack traces in development only
- Consistent error response format
- Async error wrapper for route handlers
- 404 Not Found handler

**Error Response Format:**
```json
{
  "status": "fail",
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Task 29: API Versioning Strategy ✅

**Location:** `src/routes/index.ts`, `src/app.ts`

Implemented URL-based API versioning:

**Strategy:**
- Version prefix in URL: `/api/v1/`
- Centralized route organization
- Easy to add new versions (v2, v3, etc.)
- GraphQL endpoint without version prefix: `/graphql`

**Structure:**
```
/api/v1/auth
/api/v1/issues (future)
/api/v1/projects (future)
/graphql (versionless)
```

### Task 30: API Documentation (Swagger/OpenAPI) ✅

**Location:** `src/docs/swagger.ts`

Implemented comprehensive API documentation:

**Features:**
- Swagger UI at `/api/docs`
- OpenAPI 3.0 specification
- Raw JSON spec at `/api/docs.json`
- Security schemes (Bearer JWT, Cookie)
- Reusable schemas (User, Error, AuthResponse)
- Tagged endpoints for organization
- Example requests and responses
- JSDocs integration for automatic documentation

**Access:** Available in development mode or when `ENABLE_API_DOCS=true`

## Architecture Overview

### Request Flow

```
Client Request
    ↓
Helmet Security Headers
    ↓
CORS Validation
    ↓
Body Parser
    ↓
Cookie Parser
    ↓
Compression
    ↓
Morgan Logging
    ↓
API Documentation (if enabled)
    ↓
GraphQL Endpoint (/graphql) OR REST API (/api/v*)
    ↓
Request Validation (Zod)
    ↓
Route Handler
    ↓
Error Handler (if error occurs)
    ↓
404 Handler (if no route matches)
    ↓
Response to Client
```

### File Structure

```
src/
├── app.ts                    # Express app configuration
├── index.ts                  # Server startup
├── config/
│   └── env.ts               # Environment configuration
├── middleware/
│   ├── errorHandler.ts      # Error handling
│   ├── notFoundHandler.ts   # 404 handling
│   ├── validate.ts          # Request validation
│   └── rateLimit.ts         # Rate limiting (existing)
├── graphql/
│   ├── typeDefs.ts          # GraphQL schema
│   ├── resolvers.ts         # GraphQL resolvers
│   └── server.ts            # Apollo Server setup
├── routes/
│   ├── index.ts             # Route organization
│   └── auth.ts              # Auth endpoints (existing)
└── docs/
    └── swagger.ts           # API documentation
```

## Dependencies Added

The following packages were installed:

```json
{
  "dependencies": {
    "cors": "^2.x",
    "helmet": "^7.x",
    "compression": "^1.x",
    "cookie-parser": "^1.x",
    "morgan": "^1.x",
    "zod": "^3.x",
    "@apollo/server": "^4.x",
    "graphql": "^16.x",
    "swagger-ui-express": "^5.x",
    "swagger-jsdoc": "^6.x"
  },
  "devDependencies": {
    "@types/cors": "^2.x",
    "@types/compression": "^1.x",
    "@types/cookie-parser": "^1.x",
    "@types/morgan": "^1.x",
    "@types/swagger-ui-express": "^4.x",
    "@types/swagger-jsdoc": "^6.x"
  }
}
```

## Running the Server

### Development Mode

```bash
npm run dev
```

This starts the server with:
- Hot reloading via ts-node
- Development logging
- API documentation enabled
- GraphQL playground enabled

### Production Mode

```bash
npm run build
npm start
```

### Environment Variables

Required environment variables in `.env`:

```env
# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
CORS_CREDENTIALS=true

# Session & JWT (from existing config)
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Database (from existing config)
DATABASE_URL=postgresql://...

# Redis (from existing config)
REDIS_URL=redis://...

# API Documentation
ENABLE_API_DOCS=true
```

## Testing

### Health Check

```bash
curl http://localhost:3000/health
```

### GraphQL Playground

Visit: `http://localhost:3000/graphql`

### API Documentation

Visit: `http://localhost:3000/api/docs`

### REST API

```bash
# Get API info
curl http://localhost:3000/api/v1

# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!","name":"John Doe"}'
```

## Next Steps

With the Core API Development complete (tasks 23-30), the next phase includes:

1. **Core Data Models** (Tasks 31-38)
   - User, Project, Area, Issue models
   - Labels and Workflow models
   - Git integration model

2. **Basic CRUD Operations** (Tasks 39-46)
   - Issue, Project, Area operations
   - Bulk operations
   - Audit logging

3. **Search Foundation** (Tasks 47-54)
   - Elasticsearch integration
   - Search indexing
   - Advanced search features

## Notes

- All middleware is properly ordered for security and functionality
- Error handling is centralized and consistent
- API versioning allows for future expansion
- Both GraphQL and REST are available for flexibility
- Documentation is automatically generated from code
- Validation is type-safe with Zod
- Security headers protect against common vulnerabilities

# Project Architecture Rules (Non-Obvious Only)

## Authentication & Session Architecture
- Session identifiers ARE the refresh tokens (non-standard design choice)
- Dual storage strategy: localStorage for persistent, sessionStorage for temporary
- Redis stores sessions with refresh token as key, PostgreSQL for user data
- GraphQL authentication layer incomplete - context factory at src/graphql/server.ts needs JWT extraction

## Test Architecture
- Split testing strategy: Jest for backend, Vitest for client
- Client has TWO separate test configurations: unit (Vitest) and Storybook (Playwright)
- Tests must exclude cross-contamination (jest.config.js excludes client/)

## Data Layer Patterns
- Soft delete pattern enforced via deletedAt field across all models
- Prisma client generated at root applies to entire monorepo
- Session data in Redis uses non-standard key pattern: refresh token as session ID

## Client Build Configuration
- CSS Modules restricted to camelCaseOnly - architectural decision, not configurable per-component
- Path aliases MUST be synchronized between vite.config.ts and vitest.unit.config.ts
- TypedArray polyfill required for jsdom compatibility (architectural constraint)
- Vitest uses `singleFork: true` pool for test isolation (performance/stability tradeoff)

## Monorepo Structure Constraints
- Backend (root) and frontend (client/) are NOT independent - shared contracts
- Migrations execute from root only, affecting entire system
- Environment configuration (.env) required before ANY backend operations
- Proxy configuration in vite.config.ts couples client to backend during development
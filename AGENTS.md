# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Structure (Non-Obvious)
- Monorepo: Backend (root) uses Jest, client/ uses Vitest - different test runners
- Backend tests MUST exclude client/ folder (configured in jest.config.js)
- Client has TWO test projects: unit tests (vitest.unit.config.ts) and Storybook tests (vite.config.ts with Playwright)

## Authentication (Critical Non-Obvious Patterns)
- Tokens stored in BOTH localStorage AND sessionStorage based on rememberMe flag (see auth.service.ts login method)
- Session management uses refresh tokens as Redis session IDs (non-standard pattern in session.ts)
- GraphQL context creation incomplete - JWT extraction not implemented yet (TODO in graphql/server.ts:56)

## Database & Setup Requirements
- .env file is REQUIRED before ANY testing (not optional) - see AUTH_SETUP.md for template
- PostgreSQL + Redis MUST be running before migrations
- Migrations run from root only: `npm run db:migrate`
- Soft delete pattern used (deletedAt field) - do NOT use hard deletes without checking schema

## Testing Commands (Directory-Specific)
- Backend tests: Run from root with `npm test` (uses Jest, excludes client/)
- Client tests: Run from client/ with `npm test` (uses Vitest unit config)
- Single test files: Backend uses Jest patterns, Client uses Vitest patterns

## Client-Specific Non-Obvious Patterns
- CSS Modules use `localsConvention: 'camelCaseOnly'` - class names are camelCase only
- Path aliases configured in BOTH vite.config.ts AND vitest.unit.config.ts (must match)
- Vitest requires TypedArray polyfill in vitest.setup.ts for jsdom compatibility
- Client proxy: /api and /graphql proxied to backend in vite.config.ts
- Tests use `singleFork: true` pool for stability

## Code Style (Non-Standard)
- Unused vars starting with `_` are allowed (ESLint config)
- Prisma seed uses ts-node (configured in package.json prisma.seed field)
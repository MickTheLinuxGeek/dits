# Project Documentation Rules (Non-Obvious Only)

## Project Structure Context
- Monorepo with different test runners: Root uses Jest, client/ uses Vitest
- Backend in root (src/), frontend in client/ - NOT separate repos
- Prisma schema at root level applies to entire project

## Authentication Architecture
- Session IDs are refresh tokens stored in Redis (counterintuitive design)
- Tokens stored in localStorage OR sessionStorage based on rememberMe flag
- GraphQL auth context incomplete - JWT extraction TODO at src/graphql/server.ts:56

## Testing Structure
- Backend: jest.config.js excludes client/ directory explicitly
- Client: TWO test projects - unit tests AND Storybook tests with Playwright
- Unit tests co-located with source, not in separate test directories

## Database Patterns
- Soft delete pattern throughout schema (deletedAt field)
- Migrations MUST run from project root only
- Redis used for sessions, PostgreSQL for data

## Configuration Dependencies
- .env file REQUIRED before any backend operations (not optional)
- Client path aliases in vite.config.ts AND vitest.unit.config.ts must match
- CSS Modules configured for camelCaseOnly (localsConvention setting)

## Setup Order (Critical)
1. Start PostgreSQL + Redis (docker-compose or native)
2. Create .env from AUTH_SETUP.md template
3. Run `npm run db:migrate` from root
4. Backend ready; client independent
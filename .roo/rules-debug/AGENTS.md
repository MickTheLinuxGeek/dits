# Project Debug Rules (Non-Obvious Only)

## Environment Requirements
- .env file REQUIRED before debugging - AUTH_SETUP.md contains template
- PostgreSQL + Redis containers MUST be running (docker-compose up -d)
- Database migrations required: `npm run db:migrate` from root only

## Testing & Debugging
- Backend tests exclude client/ directory (jest.config.js testPathIgnorePatterns)
- Client tests require separate directory context (`cd client && npm test`)
- Vitest pool uses `singleFork: true` - changing this may cause test failures

## Session Debugging
- Sessions stored in Redis with key prefix `session:` + refresh token
- Session IDs ARE the refresh tokens themselves (non-standard pattern)
- User sessions tracked in Redis sets with prefix `user_sessions:` + userId

## Authentication Token Flow
- rememberMe=true: localStorage via setTokens()
- rememberMe=false: sessionStorage directly (lines 84-86 in auth.service.ts)
- Both storage locations checked in store/index.ts initializeAuth()

## Common Gotchas
- GraphQL context missing JWT extraction (TODO at src/graphql/server.ts:56)
- CSS Modules only support camelCase - kebab-case classes will fail silently
- Path alias mismatch between vite.config.ts and vitest.unit.config.ts causes import errors
- TypedArray polyfill required in vitest.setup.ts or tests fail in jsdom
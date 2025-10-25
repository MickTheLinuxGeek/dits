# Project Coding Rules (Non-Obvious Only)

## Authentication Token Storage
- ALWAYS use `setTokens()` from lib/api-client for localStorage (client/src/services/auth.service.ts)
- rememberMe=false MUST use sessionStorage instead (lines 84-86 in auth.service.ts)
- NEVER directly write to localStorage/sessionStorage without checking rememberMe flag

## Session Management (Critical Pattern)
- Refresh tokens ARE session IDs in Redis (src/auth/session.ts:40)
- createSession() expects sessionId parameter to be the refresh token itself (non-standard)
- Do NOT create separate session IDs - use refresh token as session identifier

## Database Operations
- ALWAYS check for deletedAt field before hard deletes (soft delete pattern in schema)
- Prisma migrations MUST run from project root, not subdirectories
- Use `npm run db:migrate` only - do NOT use prisma migrate directly

## Testing File Locations
- Backend: Tests anywhere EXCEPT client/ folder (jest.config.js testPathIgnorePatterns)
- Client: Tests must be co-located with source files for Vitest (not in separate test/ folder)

## CSS Modules (Client)
- Import statement: `import styles from './Component.module.css'`
- Usage: `className={styles.myClassName}` (camelCase only, not kebab-case)
- localsConvention is 'camelCaseOnly' - kebab-case will NOT work

## Path Aliases (Client)
- When adding new aliases, update BOTH vite.config.ts AND vitest.unit.config.ts
- Mismatch will cause import errors in tests even if dev server works
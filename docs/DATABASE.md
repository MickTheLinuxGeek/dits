# Database Foundation

This document describes the database implementation for DITS, including schema design, migrations, connection management, and utilities.

## Overview

DITS uses:
- **PostgreSQL 15** - Primary relational database
- **Redis 7** - Caching and session management
- **Prisma** - ORM and migration system

## Database Schema

### Core Models

The database consists of 11 core models organized around the single-user architecture:

#### User
- **Purpose:** User authentication and preferences
- **Key Fields:** email (unique), password (hashed), name, avatar, preferences (JSON)
- **Relations:** Projects, Areas, Issues, Labels, Workflows, GitIntegrations

#### Project
- **Purpose:** Finite bodies of work with clear endpoints
- **Key Fields:** name, description, status (ACTIVE/ARCHIVED/COMPLETED/ON_HOLD), startDate, endDate
- **Relations:** Belongs to User, has many Issues and Workflows

#### Area
- **Purpose:** Ongoing spheres of responsibility
- **Key Fields:** name, description, color
- **Relations:** Belongs to User, has many Issues

#### Issue
- **Purpose:** Core task/bug tracking entity
- **Key Fields:** title, description (markdown), priority, startDate, dueDate, completedAt
- **Relations:** Belongs to User, optional Project/Area, Status, parent Issue
- **Special Features:**
  - Hierarchical structure (parent-child)
  - Many-to-many with Labels
  - Relations with other Issues (BLOCKS, BLOCKED_BY, RELATES_TO, etc.)
  - Git integrations

#### Label
- **Purpose:** Flexible categorization
- **Key Fields:** name, color
- **Relations:** Belongs to User, many-to-many with Issues

#### Workflow & Status
- **Purpose:** Customizable status workflows
- **Key Fields (Workflow):** name, transitions (JSON)
- **Key Fields (Status):** name, color, position, isClosed
- **Relations:** Workflow belongs to User/Project, has many Statuses

#### IssueRelation
- **Purpose:** Model dependencies between issues
- **Key Fields:** relationType (BLOCKS, BLOCKED_BY, RELATES_TO, DUPLICATES, DUPLICATED_BY)
- **Relations:** Source Issue, Target Issue

#### GitIntegration
- **Purpose:** Link issues to version control
- **Key Fields:** provider (GITHUB/GITLAB/BITBUCKET), repository, branchName, prUrl, commitHash
- **Relations:** Belongs to User and Issue

### Indexes

Performance-optimized indexes include:
- User email lookup
- Issue queries by user, project, area, status, priority, dates
- Composite indexes for common queries (userId + createdAt, userId + updatedAt)
- Label lookups by user
- Status position ordering

## Migrations

### Using Prisma Migrate

```bash
# Create a new migration
npm run db:migrate

# Reset database (WARNING: deletes all data)
npm run db:reset

# Apply migrations in production
npx prisma migrate deploy
```

### Migration Files

Migrations are stored in `prisma/migrations/` with timestamps. Each migration includes:
- SQL file with schema changes
- Metadata about the migration

### Current Migrations

1. **20251007011629_init** - Initial schema with all core models

## Database Connection

### Prisma Client

Located in `src/database/prisma.ts`, provides:
- Singleton pattern for efficient connection pooling
- Automatic reconnection handling
- Development logging (query logs in dev mode)
- Graceful shutdown handling

**Usage:**
```typescript
import { prisma } from './database/prisma';

// Query users
const users = await prisma.user.findMany();

// Create issue
const issue = await prisma.issue.create({
  data: {
    userId: user.id,
    title: 'New issue',
    // ...
  },
});
```

**Utility Functions:**
```typescript
import { testDatabaseConnection, getDatabaseConnectionInfo } from './database/prisma';

// Test connection
const isConnected = await testDatabaseConnection();

// Get connection stats
const info = await getDatabaseConnectionInfo();
console.log(info.poolSize); // Number of active connections
```

### Connection Pooling

Prisma handles connection pooling automatically with configuration from DATABASE_URL.

Pool settings are configured via environment variables:
- `DATABASE_POOL_MIN` - Minimum connections (default: 2)
- `DATABASE_POOL_MAX` - Maximum connections (default: 10)

## Redis Connection

Located in `src/database/redis.ts`, provides:
- Singleton pattern with automatic reconnection
- Retry strategy with exponential backoff
- Connection event logging
- Helper functions for common operations

### Cache Helpers

```typescript
import { setCache, getCache, deleteCache, deleteCachePattern } from './database/redis';

// Set cache with optional expiry (seconds)
await setCache('user:123', userData, 3600);

// Get cached data
const data = await getCache('user:123');

// Delete specific cache
await deleteCache('user:123');

// Delete by pattern
await deleteCachePattern('user:*');
```

### Session Management

```typescript
import { setSession, getSession, deleteSession, refreshSessionExpiry } from './database/redis';

// Create session (default: 24 hours)
await setSession(sessionId, { userId: '123', role: 'admin' });

// Get session
const session = await getSession(sessionId);

// Refresh session expiry
await refreshSessionExpiry(sessionId, 3600); // 1 hour

// Delete session
await deleteSession(sessionId);
```

## Database Seeding

### Running Seeds

```bash
# Seed the database
npm run db:seed
```

### Seed Data

The seed script (`prisma/seed.ts`) creates:
- Demo user (email: demo@dits.dev, password: demo1234)
- Default workflow with 5 statuses (Backlog, To Do, In Progress, In Review, Done)
- Sample project (DITS Development)
- 3 sample areas (Work, Personal, Learning)
- 4 sample labels (bug, feature, documentation, enhancement)
- 4 sample issues with various states and relationships

## Backup and Restore

### Backup

```bash
# Create backup
./scripts/db-backup.sh
```

Features:
- Creates compressed SQL backup
- Stores in `backups/` directory
- Automatic cleanup (keeps last 7 days)
- Timestamped filenames

### Restore

```bash
# List available backups
./scripts/db-restore.sh

# Restore from backup
./scripts/db-restore.sh dits_backup_20251007_120000.sql.gz
```

Features:
- Lists available backups
- Confirmation prompt before restore
- Automatic decompression
- Complete database recreation

## Database Utilities

### Prisma Studio

Visual database browser:
```bash
npm run db:studio
```

Opens at `http://localhost:5555` for viewing and editing data.

### Direct Database Access

```bash
# Via Docker
docker exec -it dits-postgres psql -U dits_user -d dits_dev

# Via local psql
psql postgresql://dits_user:dits_password@localhost:5433/dits_dev
```

### Redis CLI

```bash
# Via Docker
docker exec -it dits-redis redis-cli

# Via local redis-cli
redis-cli -p 6380
```

## Performance Optimization

### Indexes (Task 14)

All performance-critical indexes are defined in the Prisma schema:

**User Model:**
- `email` - For authentication lookups

**Issue Model:**
- `userId` - User's issues
- `projectId` - Project issues
- `areaId` - Area issues
- `statusId` - Status filtering
- `priority` - Priority sorting
- `parentIssueId` - Hierarchy queries
- `userId, createdAt` - Recent issues
- `userId, updatedAt` - Updated issues
- `dueDate` - Due date sorting
- `startDate` - Start date filtering

**Project Model:**
- `userId` - User's projects
- `status` - Project status filtering
- `userId, createdAt` - Recent projects

**Label Model:**
- `userId` - User's labels
- `userId, name` - Unique constraint

**Status Model:**
- `workflowId` - Workflow statuses
- `workflowId, position` - Ordered statuses

### Query Optimization Tips

1. **Use select to limit fields:**
   ```typescript
   await prisma.issue.findMany({
     select: { id: true, title: true, priority: true }
   });
   ```

2. **Use pagination:**
   ```typescript
   await prisma.issue.findMany({
     skip: 20,
     take: 20,
   });
   ```

3. **Use indexes in where clauses:**
   ```typescript
   // Good - uses index
   await prisma.issue.findMany({
     where: { userId, dueDate: { gte: new Date() } }
   });
   ```

4. **Leverage Redis caching for frequent queries:**
   ```typescript
   const cacheKey = `user:${userId}:stats`;
   let stats = await getCache(cacheKey);
   
   if (!stats) {
     stats = await calculateStats(userId);
     await setCache(cacheKey, stats, 300); // 5 minutes
   }
   ```

## Testing

### Running Tests

```bash
# All tests
npm test

# Database tests only
npm test -- src/database

# With coverage
npm run test:coverage
```

### Test Database

Tests use the same database as development. For isolated testing:
1. Create test database: `dits_test`
2. Update `TEST_DATABASE_URL` in `.env`
3. Run migrations on test database

## Troubleshooting

### Connection Issues

**PostgreSQL won't connect:**
```bash
# Check if container is running
docker ps

# Check logs
docker logs dits-postgres

# Verify connection string
echo $DATABASE_URL
```

**Redis won't connect:**
```bash
# Check if container is running
docker ps | grep redis

# Test connection
docker exec -it dits-redis redis-cli ping
```

### Migration Issues

**Migration fails:**
```bash
# Check database status
npx prisma migrate status

# Reset and reapply
npm run db:reset  # WARNING: deletes data
```

**Prisma Client out of sync:**
```bash
# Regenerate Prisma Client
npx prisma generate
```

### Performance Issues

**Slow queries:**
1. Check query logs in development
2. Verify indexes are being used
3. Use `EXPLAIN ANALYZE` in PostgreSQL
4. Consider adding Redis caching

## Environment Variables

Required database variables:
```env
DATABASE_URL=postgresql://dits_user:dits_password@localhost:5433/dits_dev
REDIS_URL=redis://localhost:6380
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

## Next Steps

- Implement database connection health checks
- Set up database monitoring and alerts
- Create automated backup cron jobs
- Implement read replicas for scalability
- Add database performance metrics collection

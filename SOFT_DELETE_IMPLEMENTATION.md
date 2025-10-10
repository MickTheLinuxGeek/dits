# Soft Delete Implementation Guide

This document outlines the strategy for implementing soft delete functionality across the DITS application.

## Overview

Soft delete allows entities to be "deleted" without actually removing them from the database. Instead, a `deletedAt` timestamp is set, and queries are modified to exclude soft-deleted records by default.

## Benefits

1. **Data Recovery** - Users can restore accidentally deleted items
2. **Audit Trail** - Maintain complete history of all data
3. **Data Integrity** - Preserve relationships even after "deletion"
4. **Compliance** - Meet data retention requirements

## Database Schema Changes Required

Add a `deletedAt` field to the following models in `prisma/schema.prisma`:

```prisma
model Issue {
  // ... existing fields
  deletedAt   DateTime?  // Soft delete timestamp
  // ... rest of model
}

model Project {
  // ... existing fields
  deletedAt   DateTime?
  // ... rest of model
}

model Area {
  // ... existing fields
  deletedAt   DateTime?
  // ... rest of model
}

model Label {
  // ... existing fields
  deletedAt   DateTime?
  // ... rest of model
}

model Status {
  // ... existing fields
  deletedAt   DateTime?
  // ... rest of model
}

model Workflow {
  // ... existing fields
  deletedAt   DateTime?
  // ... rest of model
}
```

## Migration Steps

1. **Update Prisma Schema**
   ```bash
   # Add deletedAt fields to all models above
   npx prisma format
   ```

2. **Generate Migration**
   ```bash
   npx prisma migrate dev --name add_soft_delete
   ```

3. **Run Migration**
   ```bash
   npx prisma migrate deploy
   ```

## Service Implementation

### Soft Delete Service

Create `src/services/softDeleteService.ts`:

```typescript
import { prisma } from '../database/prisma';

export async function softDeleteIssue(issueId: string, userId: string): Promise<void> {
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, userId, deletedAt: null },
  });

  if (!issue) {
    throw new Error('Issue not found or already deleted');
  }

  await prisma.issue.update({
    where: { id: issueId },
    data: { deletedAt: new Date() },
  });
}

export async function restoreIssue(issueId: string, userId: string): Promise<void> {
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, userId, deletedAt: { not: null } },
  });

  if (!issue) {
    throw new Error('Issue not found or not deleted');
  }

  await prisma.issue.update({
    where: { id: issueId },
    data: { deletedAt: null },
  });
}

export async function permanentlyDeleteIssue(issueId: string, userId: string): Promise<void> {
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, userId },
  });

  if (!issue) {
    throw new Error('Issue not found');
  }

  await prisma.issue.delete({
    where: { id: issueId },
  });
}
```

### Query Modifications

Update all list/get queries to exclude soft-deleted records:

```typescript
// Before
const issues = await prisma.issue.findMany({
  where: { userId },
});

// After
const issues = await prisma.issue.findMany({
  where: { 
    userId,
    deletedAt: null, // Exclude soft-deleted
  },
});
```

### Global Query Filter (Prisma Middleware)

Create a middleware to automatically filter out soft-deleted records:

```typescript
// src/middleware/softDelete.ts
import { Prisma } from '@prisma/client';

export function createSoftDeleteMiddleware() {
  return async (params: Prisma.MiddlewareParams, next: any) => {
    const modelsWithSoftDelete = [
      'Issue',
      'Project',
      'Area',
      'Label',
      'Status',
      'Workflow',
    ];

    if (modelsWithSoftDelete.includes(params.model || '')) {
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        params.action = 'findFirst';
        params.args.where = {
          ...params.args.where,
          deletedAt: null,
        };
      }

      if (params.action === 'findMany') {
        if (!params.args) {
          params.args = {};
        }
        if (!params.args.where) {
          params.args.where = {};
        }
        params.args.where = {
          ...params.args.where,
          deletedAt: null,
        };
      }

      if (params.action === 'delete') {
        params.action = 'update';
        params.args.data = { deletedAt: new Date() };
      }

      if (params.action === 'deleteMany') {
        params.action = 'updateMany';
        if (!params.args) {
          params.args = {};
        }
        params.args.data = { deletedAt: new Date() };
      }
    }

    return next(params);
  };
}

// Register in src/database/prisma.ts
prisma.$use(createSoftDeleteMiddleware());
```

## API Endpoints

Add new endpoints for soft delete operations:

```typescript
// DELETE /api/v1/issues/:id (soft delete)
router.delete('/:id', requireAuth, async (req, res) => {
  await softDeleteIssue(req.params.id, req.userId);
  res.json({ message: 'Issue deleted successfully' });
});

// POST /api/v1/issues/:id/restore
router.post('/:id/restore', requireAuth, async (req, res) => {
  await restoreIssue(req.params.id, req.userId);
  res.json({ message: 'Issue restored successfully' });
});

// DELETE /api/v1/issues/:id/permanent
router.delete('/:id/permanent', requireAuth, async (req, res) => {
  await permanentlyDeleteIssue(req.params.id, req.userId);
  res.json({ message: 'Issue permanently deleted' });
});

// GET /api/v1/issues/deleted
router.get('/deleted', requireAuth, async (req, res) => {
  const issues = await prisma.issue.findMany({
    where: {
      userId: req.userId,
      deletedAt: { not: null },
    },
  });
  res.json({ issues });
});
```

## Automatic Cleanup

Implement a background job to permanently delete old soft-deleted records:

```typescript
// src/jobs/cleanupSoftDeleted.ts
import { prisma } from '../database/prisma';

export async function cleanupOldSoftDeletedRecords() {
  const retentionDays = 30; // Keep deleted records for 30 days
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  // Delete issues older than retention period
  const result = await prisma.issue.deleteMany({
    where: {
      deletedAt: {
        lt: cutoffDate,
        not: null,
      },
    },
  });

  console.log(`Permanently deleted ${result.count} old issues`);
}

// Schedule with cron (e.g., daily at 2 AM)
// Use node-cron or similar
```

## Testing

Create tests for soft delete functionality:

```typescript
describe('Soft Delete', () => {
  it('should soft delete an issue', async () => {
    const issue = await createIssue(...);
    await softDeleteIssue(issue.id, userId);
    
    const deletedIssue = await prisma.issue.findUnique({
      where: { id: issue.id },
    });
    
    expect(deletedIssue.deletedAt).not.toBeNull();
  });

  it('should restore a soft deleted issue', async () => {
    const issue = await createIssue(...);
    await softDeleteIssue(issue.id, userId);
    await restoreIssue(issue.id, userId);
    
    const restoredIssue = await prisma.issue.findUnique({
      where: { id: issue.id },
    });
    
    expect(restoredIssue.deletedAt).toBeNull();
  });

  it('should not return soft deleted issues in list', async () => {
    const issue = await createIssue(...);
    await softDeleteIssue(issue.id, userId);
    
    const issues = await listIssues({ userId });
    
    expect(issues.find(i => i.id === issue.id)).toBeUndefined();
  });
});
```

## Rollout Plan

1. **Phase 1**: Add schema changes and deploy migration
2. **Phase 2**: Update all queries to use `deletedAt: null` filter
3. **Phase 3**: Implement soft delete endpoints
4. **Phase 4**: Add Prisma middleware for automatic filtering
5. **Phase 5**: Implement UI for viewing/restoring deleted items
6. **Phase 6**: Add automated cleanup job

## Considerations

- **Performance**: Add index on `deletedAt` field for faster queries
- **Cascading**: Define behavior for soft deleting parent records with children
- **Permissions**: Ensure only owners can restore/permanently delete their items
- **UI**: Add "Trash" view to show soft-deleted items
- **Exports**: Decide whether to include soft-deleted items in data exports

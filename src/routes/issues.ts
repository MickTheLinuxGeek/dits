import { Router, Request, Response } from 'express';
import {
  createIssue,
  getIssueById,
  listIssues,
  updateIssue,
  deleteIssue,
  restoreIssue,
  getIssueCount,
} from '../services/issueService';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /issues
 * Create a new issue
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const {
      title,
      description,
      projectId,
      areaId,
      parentIssueId,
      statusId,
      priority,
      startDate,
      dueDate,
      metadata,
      labelIds,
    } = req.body;

    if (!title || !statusId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title and statusId are required',
      });
    }

    const issue = await createIssue({
      userId,
      title,
      description,
      projectId,
      areaId,
      parentIssueId,
      statusId,
      priority,
      startDate: startDate ? new Date(startDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      metadata,
      labelIds,
    });

    return res.status(201).json({
      message: 'Issue created successfully',
      issue: issue.toJSON(),
    });
  } catch (error: any) {
    console.error('Create issue error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to create issue',
    });
  }
});

/**
 * GET /issues
 * List issues with filtering and pagination
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const {
      projectId,
      areaId,
      statusId,
      priority,
      parentIssueId,
      isCompleted,
      search,
      skip,
      take,
      orderBy,
      orderDirection,
    } = req.query;

    const options: any = {
      userId,
      projectId: projectId as string,
      areaId: areaId as string,
      statusId: statusId as string,
      priority: priority as any,
      parentIssueId:
        parentIssueId === 'null' ? null : (parentIssueId as string),
      isCompleted: isCompleted === 'true',
      includeDeleted: req.query.includeDeleted === 'true',
      search: search as string,
      skip: skip ? parseInt(skip as string) : undefined,
      take: take ? parseInt(take as string) : undefined,
    };

    if (orderBy && orderDirection) {
      options.orderBy = {
        field: orderBy as string,
        direction: orderDirection as 'asc' | 'desc',
      };
    }

    const result = await listIssues(options);

    return res.status(200).json({
      issues: result.issues.map((issue) => issue.toJSON()),
      total: result.total,
      hasMore: result.hasMore,
      pagination: {
        skip: options.skip || 0,
        take: options.take || 50,
      },
    });
  } catch (error: any) {
    console.error('List issues error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to list issues',
    });
  }
});

/**
 * GET /issues/count
 * Get issue count for user
 */
router.get('/count', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const includeDeleted = req.query.includeDeleted === 'true';
    const count = await getIssueCount(userId, includeDeleted);

    return res.status(200).json({ count });
  } catch (error: any) {
    console.error('Get issue count error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to get issue count',
    });
  }
});

/**
 * GET /issues/:id
 * Get a single issue by ID
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;
    const includeDeleted = req.query.includeDeleted === 'true';

    const issue = await getIssueById(id, userId, includeDeleted);

    if (!issue) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Issue not found',
      });
    }

    return res.status(200).json({
      issue: issue.toJSON(),
    });
  } catch (error: any) {
    console.error('Get issue error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to get issue',
    });
  }
});

/**
 * PATCH /issues/:id
 * Update an issue
 */
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;
    const updateData = req.body;

    // Convert date strings to Date objects if present
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }
    if (updateData.completedAt) {
      updateData.completedAt = new Date(updateData.completedAt);
    }

    const issue = await updateIssue(id, userId, updateData);

    return res.status(200).json({
      message: 'Issue updated successfully',
      issue: issue.toJSON(),
    });
  } catch (error: any) {
    console.error('Update issue error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to update issue',
    });
  }
});

/**
 * DELETE /issues/:id
 * Delete an issue (soft delete by default)
 * Query param: ?permanent=true for permanent deletion
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;
    const permanent = req.query.permanent === 'true';

    await deleteIssue(id, userId, permanent);

    return res.status(200).json({
      message: permanent
        ? 'Issue permanently deleted'
        : 'Issue deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete issue error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to delete issue',
    });
  }
});

/**
 * POST /issues/:id/restore
 * Restore a soft-deleted issue
 */
router.post(
  '/:id/restore',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { id } = req.params;

      const issue = await restoreIssue(id, userId);

      return res.status(200).json({
        message: 'Issue restored successfully',
        issue: issue.toJSON(),
      });
    } catch (error: any) {
      console.error('Restore issue error:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to restore issue',
      });
    }
  },
);

export default router;

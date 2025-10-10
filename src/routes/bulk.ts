import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import {
  bulkCreateIssues,
  bulkUpdateIssues,
  bulkDeleteIssues,
  bulkCreateLabels,
  bulkAssignLabels,
  bulkUpdateIssueStatus,
  bulkMoveIssuesToProject,
} from '../services/bulkService';

const router = Router();

/**
 * POST /bulk/issues/create
 * Bulk create issues
 */
router.post(
  '/issues/create',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { issues } = req.body;

      if (!Array.isArray(issues) || issues.length === 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Issues array is required and must not be empty',
        });
      }

      const result = await bulkCreateIssues(userId, issues);

      return res.status(201).json({
        message: `Bulk create completed: ${result.created.length} created, ${result.errors.length} failed`,
        created: result.created.map((issue) => issue.toJSON()),
        errors: result.errors,
        summary: {
          total: issues.length,
          successful: result.created.length,
          failed: result.errors.length,
        },
      });
    } catch (error: any) {
      console.error('Bulk create issues error:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to bulk create issues',
      });
    }
  },
);

/**
 * PATCH /bulk/issues/update
 * Bulk update issues
 */
router.patch(
  '/issues/update',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { updates } = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Updates array is required and must not be empty',
        });
      }

      const result = await bulkUpdateIssues(userId, updates);

      return res.status(200).json({
        message: `Bulk update completed: ${result.updated.length} updated, ${result.errors.length} failed`,
        updated: result.updated.map((issue) => issue.toJSON()),
        errors: result.errors,
        summary: {
          total: updates.length,
          successful: result.updated.length,
          failed: result.errors.length,
        },
      });
    } catch (error: any) {
      console.error('Bulk update issues error:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to bulk update issues',
      });
    }
  },
);

/**
 * DELETE /bulk/issues/delete
 * Bulk delete issues
 */
router.delete(
  '/issues/delete',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { issueIds } = req.body;

      if (!Array.isArray(issueIds) || issueIds.length === 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'IssueIds array is required and must not be empty',
        });
      }

      const result = await bulkDeleteIssues(userId, issueIds);

      return res.status(200).json({
        message: `Bulk delete completed: ${result.deleted.length} deleted, ${result.errors.length} failed`,
        deleted: result.deleted,
        errors: result.errors,
        summary: {
          total: issueIds.length,
          successful: result.deleted.length,
          failed: result.errors.length,
        },
      });
    } catch (error: any) {
      console.error('Bulk delete issues error:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to bulk delete issues',
      });
    }
  },
);

/**
 * POST /bulk/labels/create
 * Bulk create labels
 */
router.post(
  '/labels/create',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { labels } = req.body;

      if (!Array.isArray(labels) || labels.length === 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Labels array is required and must not be empty',
        });
      }

      const result = await bulkCreateLabels(userId, labels);

      return res.status(201).json({
        message: `Bulk create completed: ${result.created.length} created, ${result.errors.length} failed`,
        created: result.created.map((label) => label.toJSON()),
        errors: result.errors,
        summary: {
          total: labels.length,
          successful: result.created.length,
          failed: result.errors.length,
        },
      });
    } catch (error: any) {
      console.error('Bulk create labels error:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to bulk create labels',
      });
    }
  },
);

/**
 * POST /bulk/issues/assign-labels
 * Bulk assign labels to issues
 */
router.post(
  '/issues/assign-labels',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { issueIds, labelIds } = req.body;

      if (!Array.isArray(issueIds) || issueIds.length === 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'IssueIds array is required and must not be empty',
        });
      }

      if (!Array.isArray(labelIds)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'LabelIds array is required',
        });
      }

      const result = await bulkAssignLabels(userId, issueIds, labelIds);

      return res.status(200).json({
        message: `Labels assigned to ${result.assigned} issues, ${result.errors.length} failed`,
        assigned: result.assigned,
        errors: result.errors,
        summary: {
          total: issueIds.length,
          successful: result.assigned,
          failed: result.errors.length,
        },
      });
    } catch (error: any) {
      console.error('Bulk assign labels error:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to bulk assign labels',
      });
    }
  },
);

/**
 * PATCH /bulk/issues/update-status
 * Bulk update issue status
 */
router.patch(
  '/issues/update-status',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { issueIds, statusId } = req.body;

      if (!Array.isArray(issueIds) || issueIds.length === 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'IssueIds array is required and must not be empty',
        });
      }

      if (!statusId) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'StatusId is required',
        });
      }

      const result = await bulkUpdateIssueStatus(userId, issueIds, statusId);

      return res.status(200).json({
        message: `Status updated for ${result.updated} issues, ${result.errors.length} failed`,
        updated: result.updated,
        errors: result.errors,
        summary: {
          total: issueIds.length,
          successful: result.updated,
          failed: result.errors.length,
        },
      });
    } catch (error: any) {
      console.error('Bulk update status error:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to bulk update status',
      });
    }
  },
);

/**
 * PATCH /bulk/issues/move-to-project
 * Bulk move issues to project
 */
router.patch(
  '/issues/move-to-project',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { issueIds, projectId } = req.body;

      if (!Array.isArray(issueIds) || issueIds.length === 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'IssueIds array is required and must not be empty',
        });
      }

      const result = await bulkMoveIssuesToProject(userId, issueIds, projectId);

      return res.status(200).json({
        message: `Moved ${result.moved} issues, ${result.errors.length} failed`,
        moved: result.moved,
        errors: result.errors,
        summary: {
          total: issueIds.length,
          successful: result.moved,
          failed: result.errors.length,
        },
      });
    } catch (error: any) {
      console.error('Bulk move to project error:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to bulk move issues to project',
      });
    }
  },
);

export default router;

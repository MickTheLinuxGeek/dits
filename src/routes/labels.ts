import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import {
  createLabel,
  getLabelById,
  listLabels,
  updateLabel,
  deleteLabel,
  getLabelCount,
  getLabelsForIssue,
} from '../services/labelService';

const router = Router();

/**
 * POST /labels
 * Create a new label
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name is required',
      });
    }

    const label = await createLabel({
      userId,
      name,
      color,
    });

    return res.status(201).json({
      message: 'Label created successfully',
      label: label.toJSON(),
    });
  } catch (error: any) {
    console.error('Create label error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to create label',
    });
  }
});

/**
 * GET /labels
 * List labels with filtering
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { search, skip, take, orderBy, orderDirection } = req.query;

    const options: any = {
      userId,
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

    const result = await listLabels(options);

    return res.status(200).json({
      labels: result.labels.map((label) => label.toJSON()),
      total: result.total,
      hasMore: result.hasMore,
    });
  } catch (error: any) {
    console.error('List labels error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to list labels',
    });
  }
});

/**
 * GET /labels/count
 * Get label count for user
 */
router.get('/count', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const count = await getLabelCount(userId);

    return res.status(200).json({ count });
  } catch (error: any) {
    console.error('Get label count error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to get label count',
    });
  }
});

/**
 * GET /labels/issue/:issueId
 * Get labels for a specific issue
 */
router.get(
  '/issue/:issueId',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { issueId } = req.params;

      const labels = await getLabelsForIssue(issueId, userId);

      return res.status(200).json({
        labels: labels.map((label) => label.toJSON()),
      });
    } catch (error: any) {
      console.error('Get labels for issue error:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to get labels for issue',
      });
    }
  },
);

/**
 * GET /labels/:id
 * Get a single label by ID
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;

    const label = await getLabelById(id, userId);

    if (!label) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Label not found',
      });
    }

    return res.status(200).json({
      label: label.toJSON(),
    });
  } catch (error: any) {
    console.error('Get label error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to get label',
    });
  }
});

/**
 * PATCH /labels/:id
 * Update a label
 */
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;
    const updateData = req.body;

    const label = await updateLabel(id, userId, updateData);

    return res.status(200).json({
      message: 'Label updated successfully',
      label: label.toJSON(),
    });
  } catch (error: any) {
    console.error('Update label error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to update label',
    });
  }
});

/**
 * DELETE /labels/:id
 * Delete a label
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;

    await deleteLabel(id, userId);

    return res.status(200).json({
      message: 'Label deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete label error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to delete label',
    });
  }
});

export default router;

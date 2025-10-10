import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import {
  createArea,
  getAreaById,
  listAreas,
  updateArea,
  deleteArea,
  archiveArea,
  unarchiveArea,
  getAreaCount,
} from '../services/areaService';

const router = Router();

/**
 * POST /areas
 * Create a new area
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { name, description, color, settings } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name is required',
      });
    }

    const area = await createArea({
      userId,
      name,
      description,
      color,
      settings,
    });

    return res.status(201).json({
      message: 'Area created successfully',
      area: area.toJSON(),
    });
  } catch (error: any) {
    console.error('Create area error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to create area',
    });
  }
});

/**
 * GET /areas
 * List areas with filtering
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { includeArchived, search, skip, take, orderBy, orderDirection } =
      req.query;

    const options: any = {
      userId,
      includeArchived: includeArchived === 'true',
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

    const result = await listAreas(options);

    return res.status(200).json({
      areas: result.areas.map((area) => area.toJSON()),
      total: result.total,
      hasMore: result.hasMore,
    });
  } catch (error: any) {
    console.error('List areas error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to list areas',
    });
  }
});

/**
 * GET /areas/count
 * Get area count for user
 */
router.get('/count', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const count = await getAreaCount(userId);

    return res.status(200).json({ count });
  } catch (error: any) {
    console.error('Get area count error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to get area count',
    });
  }
});

/**
 * GET /areas/:id
 * Get a single area by ID
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;

    const area = await getAreaById(id, userId);

    if (!area) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Area not found',
      });
    }

    return res.status(200).json({
      area: area.toJSON(),
    });
  } catch (error: any) {
    console.error('Get area error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to get area',
    });
  }
});

/**
 * PATCH /areas/:id
 * Update an area
 */
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;
    const updateData = req.body;

    const area = await updateArea(id, userId, updateData);

    return res.status(200).json({
      message: 'Area updated successfully',
      area: area.toJSON(),
    });
  } catch (error: any) {
    console.error('Update area error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to update area',
    });
  }
});

/**
 * POST /areas/:id/archive
 * Archive an area
 */
router.post(
  '/:id/archive',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { id } = req.params;

      const area = await archiveArea(id, userId);

      return res.status(200).json({
        message: 'Area archived successfully',
        area: area.toJSON(),
      });
    } catch (error: any) {
      console.error('Archive area error:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to archive area',
      });
    }
  },
);

/**
 * POST /areas/:id/unarchive
 * Unarchive an area
 */
router.post(
  '/:id/unarchive',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { id } = req.params;

      const area = await unarchiveArea(id, userId);

      return res.status(200).json({
        message: 'Area unarchived successfully',
        area: area.toJSON(),
      });
    } catch (error: any) {
      console.error('Unarchive area error:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to unarchive area',
      });
    }
  },
);

/**
 * DELETE /areas/:id
 * Delete an area
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;

    await deleteArea(id, userId);

    return res.status(200).json({
      message: 'Area deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete area error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to delete area',
    });
  }
});

export default router;

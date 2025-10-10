import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import {
  createProject,
  getProjectById,
  listProjects,
  updateProject,
  deleteProject,
  getProjectCount,
  getProjectStatistics,
} from '../services/projectService';

const router = Router();

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { name, description, status, settings, startDate, endDate } =
      req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name is required',
      });
    }

    const project = await createProject({
      userId,
      name,
      description,
      status,
      settings,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return res.status(201).json({
      message: 'Project created successfully',
      project: project.toJSON(),
    });
  } catch (error: any) {
    console.error('Create project error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to create project',
    });
  }
});

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { status, search, skip, take, orderBy, orderDirection } = req.query;

    const options: any = {
      userId,
      status: status as any,
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

    const result = await listProjects(options);

    return res.status(200).json({
      projects: result.projects.map((project) => project.toJSON()),
      total: result.total,
      hasMore: result.hasMore,
    });
  } catch (error: any) {
    console.error('List projects error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to list projects',
    });
  }
});

router.get('/count', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { status } = req.query;
    const count = await getProjectCount(userId, status as any);

    return res.status(200).json({ count });
  } catch (error: any) {
    console.error('Get project count error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to get project count',
    });
  }
});

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;

    const project = await getProjectById(id, userId);

    if (!project) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    return res.status(200).json({
      project: project.toJSON(),
    });
  } catch (error: any) {
    console.error('Get project error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to get project',
    });
  }
});

router.get(
  '/:id/statistics',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { id } = req.params;

      const statistics = await getProjectStatistics(id, userId);

      return res.status(200).json({ statistics });
    } catch (error: any) {
      console.error('Get project statistics error:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to get project statistics',
      });
    }
  },
);

router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const project = await updateProject(id, userId, updateData);

    return res.status(200).json({
      message: 'Project updated successfully',
      project: project.toJSON(),
    });
  } catch (error: any) {
    console.error('Update project error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to update project',
    });
  }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;

    await deleteProject(id, userId);

    return res.status(200).json({
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete project error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to delete project',
    });
  }
});

export default router;

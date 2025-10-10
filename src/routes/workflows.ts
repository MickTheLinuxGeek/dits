import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import {
  createWorkflow,
  getWorkflowById,
  listWorkflows,
  updateWorkflow,
  deleteWorkflow,
  createStatus,
  getStatusById,
  listStatuses,
  updateStatus,
  deleteStatus,
} from '../services/workflowService';

const router = Router();

// ==================== Workflow Routes ====================

/**
 * POST /workflows
 * Create a new workflow
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { name, projectId, transitions } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name is required',
      });
    }

    const workflow = await createWorkflow({
      userId,
      name,
      projectId,
      transitions,
    });

    return res.status(201).json({
      message: 'Workflow created successfully',
      workflow: workflow.toJSON(),
    });
  } catch (error: any) {
    console.error('Create workflow error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to create workflow',
    });
  }
});

/**
 * GET /workflows
 * List workflows
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { projectId } = req.query;

    const workflows = await listWorkflows(userId, projectId as string);

    return res.status(200).json({
      workflows: workflows.map((workflow) => workflow.toJSON()),
    });
  } catch (error: any) {
    console.error('List workflows error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to list workflows',
    });
  }
});

/**
 * GET /workflows/:id
 * Get a single workflow by ID
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;

    const workflow = await getWorkflowById(id, userId);

    if (!workflow) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Workflow not found',
      });
    }

    return res.status(200).json({
      workflow: workflow.toJSON(),
    });
  } catch (error: any) {
    console.error('Get workflow error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to get workflow',
    });
  }
});

/**
 * PATCH /workflows/:id
 * Update a workflow
 */
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;
    const updateData = req.body;

    const workflow = await updateWorkflow(id, userId, updateData);

    return res.status(200).json({
      message: 'Workflow updated successfully',
      workflow: workflow.toJSON(),
    });
  } catch (error: any) {
    console.error('Update workflow error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to update workflow',
    });
  }
});

/**
 * DELETE /workflows/:id
 * Delete a workflow
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { id } = req.params;

    await deleteWorkflow(id, userId);

    return res.status(200).json({
      message: 'Workflow deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete workflow error:', error);
    return res.status(400).json({
      error: 'Bad Request',
      message: error.message || 'Failed to delete workflow',
    });
  }
});

// ==================== Status Routes ====================

/**
 * POST /workflows/:workflowId/statuses
 * Create a new status in a workflow
 */
router.post(
  '/:workflowId/statuses',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { workflowId } = req.params;
      const { name, color, position, isClosed } = req.body;

      if (!name) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Name is required',
        });
      }

      const status = await createStatus({
        userId,
        workflowId,
        name,
        color,
        position,
        isClosed,
      });

      return res.status(201).json({
        message: 'Status created successfully',
        status: status.toJSON(),
      });
    } catch (error: any) {
      console.error('Create status error:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to create status',
      });
    }
  },
);

/**
 * GET /workflows/:workflowId/statuses
 * List statuses in a workflow
 */
router.get(
  '/:workflowId/statuses',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { workflowId } = req.params;

      const statuses = await listStatuses(workflowId, userId);

      return res.status(200).json({
        statuses: statuses.map((status) => status.toJSON()),
      });
    } catch (error: any) {
      console.error('List statuses error:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to list statuses',
      });
    }
  },
);

/**
 * GET /workflows/:workflowId/statuses/:statusId
 * Get a single status by ID
 */
router.get(
  '/:workflowId/statuses/:statusId',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { statusId } = req.params;

      const status = await getStatusById(statusId, userId);

      if (!status) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Status not found',
        });
      }

      return res.status(200).json({
        status: status.toJSON(),
      });
    } catch (error: any) {
      console.error('Get status error:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to get status',
      });
    }
  },
);

/**
 * PATCH /workflows/:workflowId/statuses/:statusId
 * Update a status
 */
router.patch(
  '/:workflowId/statuses/:statusId',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { statusId } = req.params;
      const updateData = req.body;

      const status = await updateStatus(statusId, userId, updateData);

      return res.status(200).json({
        message: 'Status updated successfully',
        status: status.toJSON(),
      });
    } catch (error: any) {
      console.error('Update status error:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to update status',
      });
    }
  },
);

/**
 * DELETE /workflows/:workflowId/statuses/:statusId
 * Delete a status
 */
router.delete(
  '/:workflowId/statuses/:statusId',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { statusId } = req.params;

      await deleteStatus(statusId, userId);

      return res.status(200).json({
        message: 'Status deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete status error:', error);
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message || 'Failed to delete status',
      });
    }
  },
);

export default router;

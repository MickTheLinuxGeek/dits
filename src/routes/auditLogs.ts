import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import {
  getAuditLogsForEntity,
  getAuditLogsForUser,
  getAuditLogStats,
} from '../services/auditService';
import { EntityType, AuditAction } from '@prisma/client';

const router = Router();

/**
 * GET /audit-logs
 * Get audit logs for the authenticated user
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId!;
  try {
    const { action, entityType, startDate, endDate, limit, offset } = req.query;

    const options: any = {};

    if (action) {
      options.action = action as AuditAction;
    }

    if (entityType) {
      options.entityType = entityType as EntityType;
    }

    if (startDate) {
      options.startDate = new Date(startDate as string);
    }

    if (endDate) {
      options.endDate = new Date(endDate as string);
    }

    if (limit) {
      options.limit = parseInt(limit as string, 10);
    }

    if (offset) {
      options.offset = parseInt(offset as string, 10);
    }

    const auditLogs = await getAuditLogsForUser(userId, options);

    res.json({
      success: true,
      data: auditLogs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit logs',
      message: error.message,
    });
  }
});

/**
 * GET /audit-logs/stats
 * Get audit log statistics for the authenticated user
 */
router.get('/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId!;
    const stats = await getAuditLogStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit log statistics',
      message: error.message,
    });
  }
});

/**
 * GET /audit-logs/entity/:entityType/:entityId
 * Get audit logs for a specific entity
 */
router.get(
  '/entity/:entityType/:entityId',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.params;
      const { limit, offset } = req.query;

      const options: any = {};

      if (limit) {
        options.limit = parseInt(limit as string, 10);
      }

      if (offset) {
        options.offset = parseInt(offset as string, 10);
      }

      const auditLogs = await getAuditLogsForEntity(
        entityType as EntityType,
        entityId,
        options,
      );

      res.json({
        success: true,
        data: auditLogs,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch audit logs for entity',
        message: error.message,
      });
    }
  },
);

export default router;

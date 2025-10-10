import { prisma } from '../database/prisma';
import { AuditAction, EntityType, Prisma } from '@prisma/client';

/**
 * Interface for audit log data
 */
export interface AuditLogData {
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: AuditLogData) {
  return await prisma.auditLog.create({
    data: {
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      oldValues: data.oldValues || Prisma.JsonNull,
      newValues: data.newValues || Prisma.JsonNull,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: data.metadata || {},
    },
  });
}

/**
 * Get audit logs for a specific entity
 */
export async function getAuditLogsForEntity(
  entityType: EntityType,
  entityId: string,
  options?: {
    limit?: number;
    offset?: number;
  },
) {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  return await prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    skip: offset,
  });
}

/**
 * Get audit logs for a user
 */
export async function getAuditLogsForUser(
  userId: string,
  options?: {
    action?: AuditAction;
    entityType?: EntityType;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  },
) {
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  const where: any = {
    userId,
  };

  if (options?.action) {
    where.action = options.action;
  }

  if (options?.entityType) {
    where.entityType = options.entityType;
  }

  if (options?.startDate || options?.endDate) {
    where.createdAt = {};
    if (options.startDate) {
      where.createdAt.gte = options.startDate;
    }
    if (options.endDate) {
      where.createdAt.lte = options.endDate;
    }
  }

  return await prisma.auditLog.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    skip: offset,
  });
}

/**
 * Get audit log statistics for a user
 */
export async function getAuditLogStats(userId: string) {
  const [totalLogs, actionCounts] = await Promise.all([
    prisma.auditLog.count({ where: { userId } }),
    prisma.auditLog.groupBy({
      by: ['action'],
      where: { userId },
      _count: true,
    }),
  ]);

  return {
    totalLogs,
    actionCounts: actionCounts.reduce(
      (
        acc: Record<string, number>,
        item: { action: string; _count: number },
      ) => {
        acc[item.action] = item._count;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };
}

/**
 * Delete old audit logs (for data retention policies)
 */
export async function deleteOldAuditLogs(olderThanDays: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}

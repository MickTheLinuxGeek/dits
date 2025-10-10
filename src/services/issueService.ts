import { prisma } from '../database/prisma';
import { Issue } from '../models/Issue';
import { Priority, AuditAction, EntityType } from '@prisma/client';
import { IssueMetadata } from '../models/types';
import { createAuditLog } from './auditService';

/**
 * Issue Service
 * Handles all CRUD operations for issues
 */

export interface CreateIssueInput {
  userId: string;
  title: string;
  description?: string | null;
  projectId?: string | null;
  areaId?: string | null;
  parentIssueId?: string | null;
  statusId: string;
  priority?: Priority;
  startDate?: Date | null;
  dueDate?: Date | null;
  metadata?: IssueMetadata;
  labelIds?: string[];
}

export interface UpdateIssueInput {
  title?: string;
  description?: string | null;
  projectId?: string | null;
  areaId?: string | null;
  statusId?: string;
  priority?: Priority;
  startDate?: Date | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  metadata?: IssueMetadata;
  labelIds?: string[];
}

export interface ListIssuesOptions {
  userId: string;
  projectId?: string;
  areaId?: string;
  statusId?: string;
  priority?: Priority;
  parentIssueId?: string | null;
  isCompleted?: boolean;
  includeDeleted?: boolean; // Include soft-deleted issues
  search?: string;
  skip?: number;
  take?: number;
  orderBy?: {
    field: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
    direction: 'asc' | 'desc';
  };
}

/**
 * Create a new issue
 */
export async function createIssue(input: CreateIssueInput): Promise<Issue> {
  // Validate title
  const titleValidation = Issue.validateTitle(input.title);
  if (!titleValidation.isValid) {
    throw new Error(titleValidation.errors.join(', '));
  }

  // Validate priority if provided
  if (input.priority) {
    const priorityValidation = Issue.validatePriority(input.priority);
    if (!priorityValidation.isValid) {
      throw new Error(priorityValidation.errors.join(', '));
    }
  }

  // Validate dates if provided
  if (input.startDate || input.dueDate) {
    const datesValidation = Issue.validateDates(
      input.startDate || null,
      input.dueDate || null,
    );
    if (!datesValidation.isValid) {
      throw new Error(datesValidation.errors.join(', '));
    }
  }

  // Verify status exists and belongs to user
  const status = await prisma.status.findFirst({
    where: {
      id: input.statusId,
      workflow: {
        userId: input.userId,
      },
    },
  });

  if (!status) {
    throw new Error('Status not found or does not belong to user');
  }

  // Verify project exists and belongs to user (if provided)
  if (input.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: input.projectId, userId: input.userId },
    });
    if (!project) {
      throw new Error('Project not found or does not belong to user');
    }
  }

  // Verify area exists and belongs to user (if provided)
  if (input.areaId) {
    const area = await prisma.area.findFirst({
      where: { id: input.areaId, userId: input.userId },
    });
    if (!area) {
      throw new Error('Area not found or does not belong to user');
    }
  }

  // Verify parent issue exists and belongs to user (if provided)
  if (input.parentIssueId) {
    const parentIssue = await prisma.issue.findFirst({
      where: { id: input.parentIssueId, userId: input.userId },
    });
    if (!parentIssue) {
      throw new Error('Parent issue not found or does not belong to user');
    }
  }

  // Create issue
  const createdIssue = await prisma.issue.create({
    data: {
      userId: input.userId,
      title: input.title,
      description: input.description,
      projectId: input.projectId,
      areaId: input.areaId,
      parentIssueId: input.parentIssueId,
      statusId: input.statusId,
      priority: input.priority || Priority.NO_PRIORITY,
      startDate: input.startDate,
      dueDate: input.dueDate,
      metadata: (input.metadata || {}) as any,
    },
  });

  // Create audit log
  await createAuditLog({
    userId: input.userId,
    action: AuditAction.CREATE,
    entityType: EntityType.ISSUE,
    entityId: createdIssue.id,
    newValues: {
      title: createdIssue.title,
      description: createdIssue.description,
      priority: createdIssue.priority,
      statusId: createdIssue.statusId,
    },
  });

  // Associate labels if provided
  if (input.labelIds && input.labelIds.length > 0) {
    await prisma.issueLabel.createMany({
      data: input.labelIds.map((labelId) => ({
        issueId: createdIssue.id,
        labelId,
      })),
    });
  }

  // Fetch the complete issue with relations
  const issue = await getIssueById(createdIssue.id, input.userId);
  if (!issue) {
    throw new Error('Failed to fetch created issue');
  }

  return issue;
}

/**
 * Get issue by ID
 */
export async function getIssueById(
  issueId: string,
  userId: string,
  includeDeleted: boolean = false,
): Promise<Issue | null> {
  const where: any = { id: issueId, userId };
  if (!includeDeleted) {
    where.deletedAt = null;
  }

  const issueData = await prisma.issue.findFirst({
    where,
    include: {
      labels: {
        include: {
          label: true,
        },
      },
      status: true,
      project: true,
      area: true,
      parentIssue: true,
      subIssues: true,
    },
  });

  if (!issueData) {
    return null;
  }

  return new Issue(issueData);
}

/**
 * List issues with filtering and pagination
 */
export async function listIssues(options: ListIssuesOptions): Promise<{
  issues: Issue[];
  total: number;
  hasMore: boolean;
}> {
  const {
    userId,
    projectId,
    areaId,
    statusId,
    priority,
    parentIssueId,
    isCompleted,
    includeDeleted = false,
    search,
    skip = 0,
    take = 50,
    orderBy,
  } = options;

  // Build where clause
  const where: any = { userId };

  // Exclude soft-deleted issues by default
  if (!includeDeleted) {
    where.deletedAt = null;
  }

  if (projectId !== undefined) {
    where.projectId = projectId;
  }

  if (areaId !== undefined) {
    where.areaId = areaId;
  }

  if (statusId !== undefined) {
    where.statusId = statusId;
  }

  if (priority !== undefined) {
    where.priority = priority;
  }

  if (parentIssueId !== undefined) {
    where.parentIssueId = parentIssueId;
  }

  if (isCompleted !== undefined) {
    where.completedAt = isCompleted ? { not: null } : null;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Build order by clause
  let order: any = { createdAt: 'desc' };
  if (orderBy) {
    order = { [orderBy.field]: orderBy.direction };
  }

  // Fetch issues
  const [issuesData, total] = await Promise.all([
    prisma.issue.findMany({
      where,
      orderBy: order,
      skip,
      take,
      include: {
        labels: {
          include: {
            label: true,
          },
        },
        status: true,
        project: true,
        area: true,
        parentIssue: true,
      },
    }),
    prisma.issue.count({ where }),
  ]);

  const issues = issuesData.map((data) => new Issue(data));

  return {
    issues,
    total,
    hasMore: skip + take < total,
  };
}

/**
 * Update an issue
 */
export async function updateIssue(
  issueId: string,
  userId: string,
  input: UpdateIssueInput,
): Promise<Issue> {
  // Verify issue exists and belongs to user
  const existingIssue = await prisma.issue.findFirst({
    where: { id: issueId, userId },
  });

  if (!existingIssue) {
    throw new Error('Issue not found or does not belong to user');
  }

  // Validate title if provided
  if (input.title !== undefined) {
    const titleValidation = Issue.validateTitle(input.title);
    if (!titleValidation.isValid) {
      throw new Error(titleValidation.errors.join(', '));
    }
  }

  // Validate priority if provided
  if (input.priority !== undefined) {
    const priorityValidation = Issue.validatePriority(input.priority);
    if (!priorityValidation.isValid) {
      throw new Error(priorityValidation.errors.join(', '));
    }
  }

  // Validate dates if provided
  if (input.startDate !== undefined || input.dueDate !== undefined) {
    const startDate =
      input.startDate !== undefined ? input.startDate : existingIssue.startDate;
    const dueDate =
      input.dueDate !== undefined ? input.dueDate : existingIssue.dueDate;

    const datesValidation = Issue.validateDates(startDate, dueDate);
    if (!datesValidation.isValid) {
      throw new Error(datesValidation.errors.join(', '));
    }
  }

  // Verify status exists and belongs to user (if provided)
  if (input.statusId !== undefined) {
    const status = await prisma.status.findFirst({
      where: {
        id: input.statusId,
        workflow: {
          userId,
        },
      },
    });

    if (!status) {
      throw new Error('Status not found or does not belong to user');
    }
  }

  // Verify project exists and belongs to user (if provided)
  if (input.projectId !== undefined && input.projectId !== null) {
    const project = await prisma.project.findFirst({
      where: { id: input.projectId, userId },
    });
    if (!project) {
      throw new Error('Project not found or does not belong to user');
    }
  }

  // Verify area exists and belongs to user (if provided)
  if (input.areaId !== undefined && input.areaId !== null) {
    const area = await prisma.area.findFirst({
      where: { id: input.areaId, userId },
    });
    if (!area) {
      throw new Error('Area not found or does not belong to user');
    }
  }

  // Prepare update data
  const updateData: any = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined)
    updateData.description = input.description;
  if (input.projectId !== undefined) updateData.projectId = input.projectId;
  if (input.areaId !== undefined) updateData.areaId = input.areaId;
  if (input.statusId !== undefined) updateData.statusId = input.statusId;
  if (input.priority !== undefined) updateData.priority = input.priority;
  if (input.startDate !== undefined) updateData.startDate = input.startDate;
  if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;
  if (input.completedAt !== undefined)
    updateData.completedAt = input.completedAt;
  if (input.metadata !== undefined) {
    updateData.metadata = {
      ...(existingIssue.metadata as any),
      ...input.metadata,
    } as any;
  }

  // Store old values for audit log
  const oldValues: any = {};
  Object.keys(updateData).forEach((key) => {
    oldValues[key] = (existingIssue as any)[key];
  });

  // Update issue
  await prisma.issue.update({
    where: { id: issueId },
    data: updateData,
  });

  // Create audit log
  await createAuditLog({
    userId,
    action: AuditAction.UPDATE,
    entityType: EntityType.ISSUE,
    entityId: issueId,
    oldValues,
    newValues: updateData,
  });

  // Update labels if provided
  if (input.labelIds !== undefined) {
    // Remove existing labels
    await prisma.issueLabel.deleteMany({
      where: { issueId },
    });

    // Add new labels
    if (input.labelIds.length > 0) {
      await prisma.issueLabel.createMany({
        data: input.labelIds.map((labelId) => ({
          issueId,
          labelId,
        })),
      });
    }
  }

  // Fetch updated issue
  const updatedIssue = await getIssueById(issueId, userId);
  if (!updatedIssue) {
    throw new Error('Failed to fetch updated issue');
  }

  return updatedIssue;
}

/**
 * Soft delete an issue (default)
 */
export async function deleteIssue(
  issueId: string,
  userId: string,
  permanent: boolean = false,
): Promise<void> {
  // Verify issue exists and belongs to user
  const existingIssue = await prisma.issue.findFirst({
    where: { id: issueId, userId },
  });

  if (!existingIssue) {
    throw new Error('Issue not found or does not belong to user');
  }

  if (permanent) {
    // Hard delete - permanently remove from database
    await prisma.issue.delete({
      where: { id: issueId },
    });
  } else {
    // Soft delete - mark as deleted
    await prisma.issue.update({
      where: { id: issueId },
      data: { deletedAt: new Date() },
    });
  }

  // Create audit log
  await createAuditLog({
    userId,
    action: AuditAction.DELETE,
    entityType: EntityType.ISSUE,
    entityId: issueId,
    oldValues: {
      title: existingIssue.title,
      permanent,
    },
  });
}

/**
 * Restore a soft-deleted issue
 */
export async function restoreIssue(
  issueId: string,
  userId: string,
): Promise<Issue> {
  // Verify issue exists and belongs to user (including deleted)
  const existingIssue = await prisma.issue.findFirst({
    where: { id: issueId, userId, deletedAt: { not: null } },
  });

  if (!existingIssue) {
    throw new Error('Deleted issue not found or does not belong to user');
  }

  // Restore issue
  await prisma.issue.update({
    where: { id: issueId },
    data: { deletedAt: null },
  });

  // Create audit log
  await createAuditLog({
    userId,
    action: AuditAction.RESTORE,
    entityType: EntityType.ISSUE,
    entityId: issueId,
    newValues: {
      title: existingIssue.title,
    },
  });

  // Fetch restored issue
  const restoredIssue = await getIssueById(issueId, userId);
  if (!restoredIssue) {
    throw new Error('Failed to fetch restored issue');
  }

  return restoredIssue;
}

/**
 * Get issue count for a user
 */
export async function getIssueCount(
  userId: string,
  includeDeleted: boolean = false,
): Promise<number> {
  const where: any = { userId };
  if (!includeDeleted) {
    where.deletedAt = null;
  }
  return prisma.issue.count({ where });
}

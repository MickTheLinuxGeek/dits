import { prisma } from '../database/prisma';
import { Priority } from '@prisma/client';
import { Issue } from '../models/Issue';
import { Label } from '../models/Label';

/**
 * Bulk Operations Service
 * Handles batch operations for efficient processing
 */

export interface BulkCreateIssueInput {
  title: string;
  description?: string;
  projectId?: string;
  areaId?: string;
  statusId: string;
  priority?: Priority;
  labelIds?: string[];
}

export interface BulkUpdateIssueInput {
  id: string;
  statusId?: string;
  priority?: Priority;
  projectId?: string;
  areaId?: string;
  completedAt?: Date | null;
}

/**
 * Bulk create issues
 */
export async function bulkCreateIssues(
  userId: string,
  issues: BulkCreateIssueInput[],
): Promise<{
  created: Issue[];
  errors: Array<{ index: number; error: string }>;
}> {
  const created: Issue[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  for (let i = 0; i < issues.length; i++) {
    try {
      const input = issues[i];

      // Validate title
      const titleValidation = Issue.validateTitle(input.title);
      if (!titleValidation.isValid) {
        throw new Error(titleValidation.errors.join(', '));
      }

      // Create issue
      const issue = await prisma.issue.create({
        data: {
          userId,
          title: input.title,
          description: input.description,
          projectId: input.projectId,
          areaId: input.areaId,
          statusId: input.statusId,
          priority: input.priority || Priority.NO_PRIORITY,
          metadata: {} as any,
        },
      });

      // Associate labels if provided
      if (input.labelIds && input.labelIds.length > 0) {
        await prisma.issueLabel.createMany({
          data: input.labelIds.map((labelId) => ({
            issueId: issue.id,
            labelId,
          })),
        });
      }

      created.push(new Issue(issue));
    } catch (error: any) {
      errors.push({
        index: i,
        error: error.message || 'Failed to create issue',
      });
    }
  }

  return { created, errors };
}

/**
 * Bulk update issues
 */
export async function bulkUpdateIssues(
  userId: string,
  updates: BulkUpdateIssueInput[],
): Promise<{ updated: Issue[]; errors: Array<{ id: string; error: string }> }> {
  const updated: Issue[] = [];
  const errors: Array<{ id: string; error: string }> = [];

  for (const update of updates) {
    try {
      // Verify issue exists and belongs to user
      const existingIssue = await prisma.issue.findFirst({
        where: { id: update.id, userId },
      });

      if (!existingIssue) {
        throw new Error('Issue not found or does not belong to user');
      }

      // Prepare update data
      const updateData: any = {};
      if (update.statusId !== undefined) updateData.statusId = update.statusId;
      if (update.priority !== undefined) updateData.priority = update.priority;
      if (update.projectId !== undefined)
        updateData.projectId = update.projectId;
      if (update.areaId !== undefined) updateData.areaId = update.areaId;
      if (update.completedAt !== undefined)
        updateData.completedAt = update.completedAt;

      // Update issue
      const issue = await prisma.issue.update({
        where: { id: update.id },
        data: updateData,
      });

      updated.push(new Issue(issue));
    } catch (error: any) {
      errors.push({
        id: update.id,
        error: error.message || 'Failed to update issue',
      });
    }
  }

  return { updated, errors };
}

/**
 * Bulk delete issues
 */
export async function bulkDeleteIssues(
  userId: string,
  issueIds: string[],
): Promise<{
  deleted: string[];
  errors: Array<{ id: string; error: string }>;
}> {
  const deleted: string[] = [];
  const errors: Array<{ id: string; error: string }> = [];

  for (const issueId of issueIds) {
    try {
      // Verify issue exists and belongs to user
      const existingIssue = await prisma.issue.findFirst({
        where: { id: issueId, userId },
      });

      if (!existingIssue) {
        throw new Error('Issue not found or does not belong to user');
      }

      // Delete issue
      await prisma.issue.delete({
        where: { id: issueId },
      });

      deleted.push(issueId);
    } catch (error: any) {
      errors.push({
        id: issueId,
        error: error.message || 'Failed to delete issue',
      });
    }
  }

  return { deleted, errors };
}

/**
 * Bulk create labels
 */
export async function bulkCreateLabels(
  userId: string,
  labels: Array<{ name: string; color?: string }>,
): Promise<{
  created: Label[];
  errors: Array<{ index: number; error: string }>;
}> {
  const created: Label[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  for (let i = 0; i < labels.length; i++) {
    try {
      const input = labels[i];

      // Validate name
      const nameValidation = Label.validateName(input.name);
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.errors.join(', '));
      }

      const color = input.color || Label.generateDefaultColor(input.name);

      // Check if label exists
      const existingLabel = await prisma.label.findFirst({
        where: { userId, name: input.name },
      });

      if (existingLabel) {
        throw new Error('Label with this name already exists');
      }

      // Create label
      const label = await prisma.label.create({
        data: {
          userId,
          name: input.name,
          color,
        },
      });

      created.push(new Label(label));
    } catch (error: any) {
      errors.push({
        index: i,
        error: error.message || 'Failed to create label',
      });
    }
  }

  return { created, errors };
}

/**
 * Bulk assign labels to issues
 */
export async function bulkAssignLabels(
  userId: string,
  issueIds: string[],
  labelIds: string[],
): Promise<{
  assigned: number;
  errors: Array<{ issueId: string; error: string }>;
}> {
  let assigned = 0;
  const errors: Array<{ issueId: string; error: string }> = [];

  for (const issueId of issueIds) {
    try {
      // Verify issue exists and belongs to user
      const issue = await prisma.issue.findFirst({
        where: { id: issueId, userId },
      });

      if (!issue) {
        throw new Error('Issue not found or does not belong to user');
      }

      // Remove existing labels
      await prisma.issueLabel.deleteMany({
        where: { issueId },
      });

      // Add new labels
      if (labelIds.length > 0) {
        await prisma.issueLabel.createMany({
          data: labelIds.map((labelId) => ({
            issueId,
            labelId,
          })),
          skipDuplicates: true,
        });
      }

      assigned++;
    } catch (error: any) {
      errors.push({
        issueId,
        error: error.message || 'Failed to assign labels',
      });
    }
  }

  return { assigned, errors };
}

/**
 * Bulk update issue status
 */
export async function bulkUpdateIssueStatus(
  userId: string,
  issueIds: string[],
  statusId: string,
): Promise<{
  updated: number;
  errors: Array<{ issueId: string; error: string }>;
}> {
  let updated = 0;
  const errors: Array<{ issueId: string; error: string }> = [];

  // Verify status exists and belongs to user
  const status = await prisma.status.findFirst({
    where: {
      id: statusId,
      workflow: {
        userId,
      },
    },
  });

  if (!status) {
    throw new Error('Status not found or does not belong to user');
  }

  for (const issueId of issueIds) {
    try {
      // Verify issue exists and belongs to user
      const issue = await prisma.issue.findFirst({
        where: { id: issueId, userId },
      });

      if (!issue) {
        throw new Error('Issue not found or does not belong to user');
      }

      // Update status
      await prisma.issue.update({
        where: { id: issueId },
        data: { statusId },
      });

      updated++;
    } catch (error: any) {
      errors.push({
        issueId,
        error: error.message || 'Failed to update status',
      });
    }
  }

  return { updated, errors };
}

/**
 * Bulk move issues to project
 */
export async function bulkMoveIssuesToProject(
  userId: string,
  issueIds: string[],
  projectId: string | null,
): Promise<{
  moved: number;
  errors: Array<{ issueId: string; error: string }>;
}> {
  let moved = 0;
  const errors: Array<{ issueId: string; error: string }> = [];

  // Verify project exists and belongs to user (if provided)
  if (projectId) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new Error('Project not found or does not belong to user');
    }
  }

  for (const issueId of issueIds) {
    try {
      // Verify issue exists and belongs to user
      const issue = await prisma.issue.findFirst({
        where: { id: issueId, userId },
      });

      if (!issue) {
        throw new Error('Issue not found or does not belong to user');
      }

      // Move issue
      await prisma.issue.update({
        where: { id: issueId },
        data: { projectId },
      });

      moved++;
    } catch (error: any) {
      errors.push({
        issueId,
        error: error.message || 'Failed to move issue',
      });
    }
  }

  return { moved, errors };
}

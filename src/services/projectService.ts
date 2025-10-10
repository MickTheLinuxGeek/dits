import { prisma } from '../database/prisma';
import { Project } from '../models/Project';
import { ProjectStatus } from '@prisma/client';
import { ProjectSettings } from '../models/types';

/**
 * Project Service
 * Handles all CRUD operations for projects
 */

export interface CreateProjectInput {
  userId: string;
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  settings?: ProjectSettings;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  settings?: ProjectSettings;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface ListProjectsOptions {
  userId: string;
  status?: ProjectStatus;
  search?: string;
  skip?: number;
  take?: number;
  orderBy?: {
    field: 'createdAt' | 'updatedAt' | 'name' | 'startDate' | 'endDate';
    direction: 'asc' | 'desc';
  };
}

/**
 * Create a new project
 */
export async function createProject(
  input: CreateProjectInput,
): Promise<Project> {
  // Validate name
  const nameValidation = Project.validateName(input.name);
  if (!nameValidation.isValid) {
    throw new Error(nameValidation.errors.join(', '));
  }

  // Validate dates if provided
  if (input.startDate || input.endDate) {
    const datesValidation = Project.validateDates(
      input.startDate || null,
      input.endDate || null,
    );
    if (!datesValidation.isValid) {
      throw new Error(datesValidation.errors.join(', '));
    }
  }

  // Create project
  const createdProject = await prisma.project.create({
    data: {
      userId: input.userId,
      name: input.name,
      description: input.description,
      status: input.status || ProjectStatus.ACTIVE,
      settings: (input.settings || {}) as any,
      startDate: input.startDate,
      endDate: input.endDate,
    },
  });

  return new Project(createdProject);
}

/**
 * Get project by ID
 */
export async function getProjectById(
  projectId: string,
  userId: string,
): Promise<Project | null> {
  const projectData = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      issues: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          completedAt: true,
        },
      },
    },
  });

  if (!projectData) {
    return null;
  }

  return new Project(projectData);
}

/**
 * List projects with filtering and pagination
 */
export async function listProjects(options: ListProjectsOptions): Promise<{
  projects: Project[];
  total: number;
  hasMore: boolean;
}> {
  const { userId, status, search, skip = 0, take = 50, orderBy } = options;

  // Build where clause
  const where: any = { userId };

  if (status !== undefined) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Build order by clause
  let order: any = { createdAt: 'desc' };
  if (orderBy) {
    order = { [orderBy.field]: orderBy.direction };
  }

  // Fetch projects
  const [projectsData, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: order,
      skip,
      take,
      include: {
        _count: {
          select: {
            issues: true,
          },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  const projects = projectsData.map((data) => new Project(data));

  return {
    projects,
    total,
    hasMore: skip + take < total,
  };
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string,
  userId: string,
  input: UpdateProjectInput,
): Promise<Project> {
  // Verify project exists and belongs to user
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!existingProject) {
    throw new Error('Project not found or does not belong to user');
  }

  // Validate name if provided
  if (input.name !== undefined) {
    const nameValidation = Project.validateName(input.name);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.errors.join(', '));
    }
  }

  // Validate dates if provided
  if (input.startDate !== undefined || input.endDate !== undefined) {
    const startDate =
      input.startDate !== undefined
        ? input.startDate
        : existingProject.startDate;
    const endDate =
      input.endDate !== undefined ? input.endDate : existingProject.endDate;

    const datesValidation = Project.validateDates(startDate, endDate);
    if (!datesValidation.isValid) {
      throw new Error(datesValidation.errors.join(', '));
    }
  }

  // Validate status transition if status is being changed
  if (input.status !== undefined && input.status !== existingProject.status) {
    const transitionValidation = Project.validateStatusTransition(
      existingProject.status,
      input.status,
    );
    if (!transitionValidation.isValid) {
      throw new Error(transitionValidation.errors.join(', '));
    }
  }

  // Prepare update data
  const updateData: any = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined)
    updateData.description = input.description;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.startDate !== undefined) updateData.startDate = input.startDate;
  if (input.endDate !== undefined) updateData.endDate = input.endDate;
  if (input.settings !== undefined) {
    updateData.settings = {
      ...(existingProject.settings as any),
      ...input.settings,
    } as any;
  }

  // Update project
  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: updateData,
  });

  return new Project(updatedProject);
}

/**
 * Delete a project
 */
export async function deleteProject(
  projectId: string,
  userId: string,
): Promise<void> {
  // Verify project exists and belongs to user
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!existingProject) {
    throw new Error('Project not found or does not belong to user');
  }

  // Delete project (cascade will handle relations)
  await prisma.project.delete({
    where: { id: projectId },
  });
}

/**
 * Get project count for a user
 */
export async function getProjectCount(
  userId: string,
  status?: ProjectStatus,
): Promise<number> {
  const where: any = { userId };
  if (status !== undefined) {
    where.status = status;
  }
  return prisma.project.count({ where });
}

/**
 * Get project statistics
 */
export async function getProjectStatistics(
  projectId: string,
  userId: string,
): Promise<{
  totalIssues: number;
  completedIssues: number;
  openIssues: number;
  overdueIssues: number;
}> {
  // Verify project exists and belongs to user
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    throw new Error('Project not found or does not belong to user');
  }

  const [totalIssues, completedIssues, overdueIssues] = await Promise.all([
    prisma.issue.count({
      where: { projectId },
    }),
    prisma.issue.count({
      where: {
        projectId,
        completedAt: { not: null },
      },
    }),
    prisma.issue.count({
      where: {
        projectId,
        completedAt: null,
        dueDate: { lt: new Date() },
      },
    }),
  ]);

  return {
    totalIssues,
    completedIssues,
    openIssues: totalIssues - completedIssues,
    overdueIssues,
  };
}

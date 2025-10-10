import { prisma } from '../database/prisma';
import { Workflow } from '../models/Workflow';
import { Status } from '../models/Status';
import { WorkflowTransition } from '../models/types';

export interface CreateWorkflowInput {
  userId: string;
  projectId?: string | null;
  name: string;
  transitions?: WorkflowTransition[];
}

export interface UpdateWorkflowInput {
  name?: string;
  projectId?: string | null;
  transitions?: WorkflowTransition[];
}

export interface CreateStatusInput {
  workflowId: string;
  userId: string;
  name: string;
  color?: string;
  position?: number;
  isClosed?: boolean;
}

export interface UpdateStatusInput {
  name?: string;
  color?: string;
  position?: number;
  isClosed?: boolean;
}

export async function createWorkflow(
  input: CreateWorkflowInput,
): Promise<Workflow> {
  const nameValidation = Workflow.validateName(input.name);
  if (!nameValidation.isValid) {
    throw new Error(nameValidation.errors.join(', '));
  }

  // Validate project belongs to user if provided
  if (input.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: input.projectId, userId: input.userId },
    });
    if (!project) {
      throw new Error('Project not found or does not belong to user');
    }
  }

  const createdWorkflow = await prisma.workflow.create({
    data: {
      userId: input.userId,
      projectId: input.projectId,
      name: input.name,
      transitions: (input.transitions || []) as any,
    },
  });

  return new Workflow(createdWorkflow);
}

export async function getWorkflowById(
  workflowId: string,
  userId: string,
): Promise<Workflow | null> {
  const workflowData = await prisma.workflow.findFirst({
    where: { id: workflowId, userId },
    include: {
      statuses: {
        orderBy: { position: 'asc' },
      },
      project: true,
    },
  });

  if (!workflowData) {
    return null;
  }

  return new Workflow(workflowData);
}

export async function listWorkflows(
  userId: string,
  projectId?: string,
): Promise<Workflow[]> {
  const where: any = { userId };
  if (projectId !== undefined) {
    where.projectId = projectId;
  }

  const workflowsData = await prisma.workflow.findMany({
    where,
    include: {
      statuses: {
        orderBy: { position: 'asc' },
      },
      _count: {
        select: {
          statuses: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return workflowsData.map((data) => new Workflow(data));
}

export async function updateWorkflow(
  workflowId: string,
  userId: string,
  input: UpdateWorkflowInput,
): Promise<Workflow> {
  const existingWorkflow = await prisma.workflow.findFirst({
    where: { id: workflowId, userId },
  });

  if (!existingWorkflow) {
    throw new Error('Workflow not found or does not belong to user');
  }

  if (input.name !== undefined) {
    const nameValidation = Workflow.validateName(input.name);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.errors.join(', '));
    }
  }

  if (input.projectId !== undefined && input.projectId !== null) {
    const project = await prisma.project.findFirst({
      where: { id: input.projectId, userId },
    });
    if (!project) {
      throw new Error('Project not found or does not belong to user');
    }
  }

  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.projectId !== undefined) updateData.projectId = input.projectId;
  if (input.transitions !== undefined)
    updateData.transitions = input.transitions;

  const updatedWorkflow = await prisma.workflow.update({
    where: { id: workflowId },
    data: updateData,
  });

  return new Workflow(updatedWorkflow);
}

export async function deleteWorkflow(
  workflowId: string,
  userId: string,
): Promise<void> {
  const existingWorkflow = await prisma.workflow.findFirst({
    where: { id: workflowId, userId },
  });

  if (!existingWorkflow) {
    throw new Error('Workflow not found or does not belong to user');
  }

  // Check if workflow has any issues
  const issueCount = await prisma.issue.count({
    where: {
      status: {
        workflowId,
      },
    },
  });

  if (issueCount > 0) {
    throw new Error(
      'Cannot delete workflow with associated issues. Please reassign issues first.',
    );
  }

  await prisma.workflow.delete({
    where: { id: workflowId },
  });
}

// Status operations
export async function createStatus(input: CreateStatusInput): Promise<Status> {
  const nameValidation = Status.validateName(input.name);
  if (!nameValidation.isValid) {
    throw new Error(nameValidation.errors.join(', '));
  }

  const color = input.color || Status.getDefaultColorForName(input.name);
  const colorValidation = Status.validateColor(color);
  if (!colorValidation.isValid) {
    throw new Error(colorValidation.errors.join(', '));
  }

  // Verify workflow exists and belongs to user
  const workflow = await prisma.workflow.findFirst({
    where: { id: input.workflowId, userId: input.userId },
  });

  if (!workflow) {
    throw new Error('Workflow not found or does not belong to user');
  }

  // Check for duplicate status name in workflow
  const existingStatus = await prisma.status.findFirst({
    where: {
      workflowId: input.workflowId,
      name: input.name,
    },
  });

  if (existingStatus) {
    throw new Error('Status with this name already exists in workflow');
  }

  // Get max position if not provided
  let position = input.position ?? 0;
  if (position === 0) {
    const maxPositionStatus = await prisma.status.findFirst({
      where: { workflowId: input.workflowId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    position = (maxPositionStatus?.position ?? -1) + 1;
  }

  const createdStatus = await prisma.status.create({
    data: {
      workflowId: input.workflowId,
      name: input.name,
      color,
      position,
      isClosed: input.isClosed ?? false,
    },
  });

  return new Status(createdStatus);
}

export async function getStatusById(
  statusId: string,
  userId: string,
): Promise<Status | null> {
  const statusData = await prisma.status.findFirst({
    where: {
      id: statusId,
      workflow: {
        userId,
      },
    },
    include: {
      workflow: true,
      _count: {
        select: {
          issues: true,
        },
      },
    },
  });

  if (!statusData) {
    return null;
  }

  return new Status(statusData);
}

export async function listStatuses(
  workflowId: string,
  userId: string,
): Promise<Status[]> {
  // Verify workflow belongs to user
  const workflow = await prisma.workflow.findFirst({
    where: { id: workflowId, userId },
  });

  if (!workflow) {
    throw new Error('Workflow not found or does not belong to user');
  }

  const statusesData = await prisma.status.findMany({
    where: { workflowId },
    orderBy: { position: 'asc' },
    include: {
      _count: {
        select: {
          issues: true,
        },
      },
    },
  });

  return statusesData.map((data) => new Status(data));
}

export async function updateStatus(
  statusId: string,
  userId: string,
  input: UpdateStatusInput,
): Promise<Status> {
  const existingStatus = await prisma.status.findFirst({
    where: {
      id: statusId,
      workflow: {
        userId,
      },
    },
  });

  if (!existingStatus) {
    throw new Error('Status not found or does not belong to user');
  }

  if (input.name !== undefined) {
    const nameValidation = Status.validateName(input.name);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.errors.join(', '));
    }

    // Check for duplicate name
    const duplicateStatus = await prisma.status.findFirst({
      where: {
        workflowId: existingStatus.workflowId,
        name: input.name,
        id: { not: statusId },
      },
    });

    if (duplicateStatus) {
      throw new Error('Status with this name already exists in workflow');
    }
  }

  if (input.color !== undefined) {
    const colorValidation = Status.validateColor(input.color);
    if (!colorValidation.isValid) {
      throw new Error(colorValidation.errors.join(', '));
    }
  }

  if (input.position !== undefined) {
    const positionValidation = Status.validatePosition(input.position);
    if (!positionValidation.isValid) {
      throw new Error(positionValidation.errors.join(', '));
    }
  }

  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.color !== undefined) updateData.color = input.color;
  if (input.position !== undefined) updateData.position = input.position;
  if (input.isClosed !== undefined) updateData.isClosed = input.isClosed;

  const updatedStatus = await prisma.status.update({
    where: { id: statusId },
    data: updateData,
  });

  return new Status(updatedStatus);
}

export async function deleteStatus(
  statusId: string,
  userId: string,
): Promise<void> {
  const existingStatus = await prisma.status.findFirst({
    where: {
      id: statusId,
      workflow: {
        userId,
      },
    },
  });

  if (!existingStatus) {
    throw new Error('Status not found or does not belong to user');
  }

  // Check if status has any issues
  const issueCount = await prisma.issue.count({
    where: { statusId },
  });

  if (issueCount > 0) {
    throw new Error(
      'Cannot delete status with associated issues. Please reassign issues first.',
    );
  }

  await prisma.status.delete({
    where: { id: statusId },
  });
}

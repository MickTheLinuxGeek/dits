import { prisma } from '../database/prisma';
import { Label } from '../models/Label';

export interface CreateLabelInput {
  userId: string;
  name: string;
  color?: string;
}

export interface UpdateLabelInput {
  name?: string;
  color?: string;
}

export interface ListLabelsOptions {
  userId: string;
  search?: string;
  skip?: number;
  take?: number;
  orderBy?: {
    field: 'createdAt' | 'updatedAt' | 'name';
    direction: 'asc' | 'desc';
  };
}

export async function createLabel(input: CreateLabelInput): Promise<Label> {
  const nameValidation = Label.validateName(input.name);
  if (!nameValidation.isValid) {
    throw new Error(nameValidation.errors.join(', '));
  }

  const color = input.color || Label.generateDefaultColor(input.name);
  const colorValidation = Label.validateColor(color);
  if (!colorValidation.isValid) {
    throw new Error(colorValidation.errors.join(', '));
  }

  // Check if label with same name already exists
  const existingLabel = await prisma.label.findFirst({
    where: {
      userId: input.userId,
      name: input.name,
    },
  });

  if (existingLabel) {
    throw new Error('Label with this name already exists');
  }

  const createdLabel = await prisma.label.create({
    data: {
      userId: input.userId,
      name: input.name,
      color,
    },
  });

  return new Label(createdLabel);
}

export async function getLabelById(
  labelId: string,
  userId: string,
): Promise<Label | null> {
  const labelData = await prisma.label.findFirst({
    where: { id: labelId, userId },
    include: {
      issues: {
        select: {
          issue: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
            },
          },
        },
      },
    },
  });

  if (!labelData) {
    return null;
  }

  return new Label(labelData);
}

export async function listLabels(options: ListLabelsOptions): Promise<{
  labels: Label[];
  total: number;
  hasMore: boolean;
}> {
  const { userId, search, skip = 0, take = 50, orderBy } = options;

  const where: any = { userId };

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  let order: any = { name: 'asc' };
  if (orderBy) {
    order = { [orderBy.field]: orderBy.direction };
  }

  const [labelsData, total] = await Promise.all([
    prisma.label.findMany({
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
    prisma.label.count({ where }),
  ]);

  const labels = labelsData.map((data) => new Label(data));

  return {
    labels,
    total,
    hasMore: skip + take < total,
  };
}

export async function updateLabel(
  labelId: string,
  userId: string,
  input: UpdateLabelInput,
): Promise<Label> {
  const existingLabel = await prisma.label.findFirst({
    where: { id: labelId, userId },
  });

  if (!existingLabel) {
    throw new Error('Label not found or does not belong to user');
  }

  if (input.name !== undefined) {
    const nameValidation = Label.validateName(input.name);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.errors.join(', '));
    }

    // Check if another label with same name exists
    const duplicateLabel = await prisma.label.findFirst({
      where: {
        userId,
        name: input.name,
        id: { not: labelId },
      },
    });

    if (duplicateLabel) {
      throw new Error('Label with this name already exists');
    }
  }

  if (input.color !== undefined) {
    const colorValidation = Label.validateColor(input.color);
    if (!colorValidation.isValid) {
      throw new Error(colorValidation.errors.join(', '));
    }
  }

  const updateData: any = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.color !== undefined) updateData.color = input.color;

  const updatedLabel = await prisma.label.update({
    where: { id: labelId },
    data: updateData,
  });

  return new Label(updatedLabel);
}

export async function deleteLabel(
  labelId: string,
  userId: string,
): Promise<void> {
  const existingLabel = await prisma.label.findFirst({
    where: { id: labelId, userId },
  });

  if (!existingLabel) {
    throw new Error('Label not found or does not belong to user');
  }

  await prisma.label.delete({
    where: { id: labelId },
  });
}

export async function getLabelCount(userId: string): Promise<number> {
  return prisma.label.count({ where: { userId } });
}

export async function getLabelsForIssue(
  issueId: string,
  userId: string,
): Promise<Label[]> {
  const issueLabels = await prisma.issueLabel.findMany({
    where: {
      issueId,
      label: {
        userId,
      },
    },
    include: {
      label: true,
    },
  });

  return issueLabels.map((il) => new Label(il.label));
}

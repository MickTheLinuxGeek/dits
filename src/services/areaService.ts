import { prisma } from '../database/prisma';
import { Area } from '../models/Area';
import { AreaSettings } from '../models/types';

export interface CreateAreaInput {
  userId: string;
  name: string;
  description?: string | null;
  color?: string;
  settings?: AreaSettings;
}

export interface UpdateAreaInput {
  name?: string;
  description?: string | null;
  color?: string;
  settings?: AreaSettings;
}

export interface ListAreasOptions {
  userId: string;
  includeArchived?: boolean;
  search?: string;
  skip?: number;
  take?: number;
  orderBy?: {
    field: 'createdAt' | 'updatedAt' | 'name';
    direction: 'asc' | 'desc';
  };
}

export async function createArea(input: CreateAreaInput): Promise<Area> {
  const nameValidation = Area.validateName(input.name);
  if (!nameValidation.isValid) {
    throw new Error(nameValidation.errors.join(', '));
  }

  const color = input.color || Area.generateDefaultColor(input.name);
  const colorValidation = Area.validateColor(color);
  if (!colorValidation.isValid) {
    throw new Error(colorValidation.errors.join(', '));
  }

  const createdArea = await prisma.area.create({
    data: {
      userId: input.userId,
      name: input.name,
      description: input.description,
      color,
      settings: (input.settings || {}) as any,
    },
  });

  return new Area(createdArea);
}

export async function getAreaById(
  areaId: string,
  userId: string,
): Promise<Area | null> {
  const areaData = await prisma.area.findFirst({
    where: { id: areaId, userId },
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

  if (!areaData) {
    return null;
  }

  return new Area(areaData);
}

export async function listAreas(options: ListAreasOptions): Promise<{
  areas: Area[];
  total: number;
  hasMore: boolean;
}> {
  const {
    userId,
    includeArchived = false,
    search,
    skip = 0,
    take = 50,
    orderBy,
  } = options;

  const where: any = { userId };

  if (!includeArchived) {
    where.settings = {
      path: ['archived'],
      not: true,
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  let order: any = { createdAt: 'desc' };
  if (orderBy) {
    order = { [orderBy.field]: orderBy.direction };
  }

  const [areasData, total] = await Promise.all([
    prisma.area.findMany({
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
    prisma.area.count({ where }),
  ]);

  const areas = areasData.map((data) => new Area(data));

  return {
    areas,
    total,
    hasMore: skip + take < total,
  };
}

export async function updateArea(
  areaId: string,
  userId: string,
  input: UpdateAreaInput,
): Promise<Area> {
  const existingArea = await prisma.area.findFirst({
    where: { id: areaId, userId },
  });

  if (!existingArea) {
    throw new Error('Area not found or does not belong to user');
  }

  if (input.name !== undefined) {
    const nameValidation = Area.validateName(input.name);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.errors.join(', '));
    }
  }

  if (input.color !== undefined) {
    const colorValidation = Area.validateColor(input.color);
    if (!colorValidation.isValid) {
      throw new Error(colorValidation.errors.join(', '));
    }
  }

  const updateData: any = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined)
    updateData.description = input.description;
  if (input.color !== undefined) updateData.color = input.color;
  if (input.settings !== undefined) {
    updateData.settings = {
      ...(existingArea.settings as any),
      ...input.settings,
    } as any;
  }

  const updatedArea = await prisma.area.update({
    where: { id: areaId },
    data: updateData,
  });

  return new Area(updatedArea);
}

export async function deleteArea(
  areaId: string,
  userId: string,
): Promise<void> {
  const existingArea = await prisma.area.findFirst({
    where: { id: areaId, userId },
  });

  if (!existingArea) {
    throw new Error('Area not found or does not belong to user');
  }

  await prisma.area.delete({
    where: { id: areaId },
  });
}

export async function archiveArea(
  areaId: string,
  userId: string,
): Promise<Area> {
  return updateArea(areaId, userId, {
    settings: { archived: true },
  });
}

export async function unarchiveArea(
  areaId: string,
  userId: string,
): Promise<Area> {
  return updateArea(areaId, userId, {
    settings: { archived: false },
  });
}

export async function getAreaCount(userId: string): Promise<number> {
  return prisma.area.count({ where: { userId } });
}

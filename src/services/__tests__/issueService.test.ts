import { Priority } from '@prisma/client';
import { prisma } from '../../database/prisma';
import {
  createIssue,
  getIssueById,
  listIssues,
  updateIssue,
  deleteIssue,
  getIssueCount,
} from '../issueService';

// Mock audit service
jest.mock('../auditService', () => ({
  createAuditLog: jest.fn().mockResolvedValue({}),
}));

// Mock prisma
jest.mock('../../database/prisma', () => ({
  prisma: {
    issue: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    issueLabel: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    status: {
      findFirst: jest.fn(),
    },
    project: {
      findFirst: jest.fn(),
    },
    area: {
      findFirst: jest.fn(),
    },
  },
}));

describe('IssueService', () => {
  const mockUserId = 'user-123';
  const mockStatusId = 'status-123';
  const mockIssueId = 'issue-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createIssue', () => {
    it('should create an issue successfully', async () => {
      const mockStatus = { id: mockStatusId };
      const mockIssue = {
        id: mockIssueId,
        userId: mockUserId,
        title: 'Test Issue',
        description: 'Test Description',
        statusId: mockStatusId,
        priority: Priority.MEDIUM,
        projectId: null,
        areaId: null,
        parentIssueId: null,
        startDate: null,
        dueDate: null,
        completedAt: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.status.findFirst as jest.Mock).mockResolvedValue(mockStatus);
      (prisma.issue.create as jest.Mock).mockResolvedValue(mockIssue);
      (prisma.issue.findFirst as jest.Mock).mockResolvedValue(mockIssue);

      const result = await createIssue({
        userId: mockUserId,
        title: 'Test Issue',
        description: 'Test Description',
        statusId: mockStatusId,
        priority: Priority.MEDIUM,
      });

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Issue');
      expect(prisma.status.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockStatusId,
          workflow: {
            userId: mockUserId,
          },
        },
      });
      expect(prisma.issue.create).toHaveBeenCalled();
    });

    it('should throw error if title is invalid', async () => {
      await expect(
        createIssue({
          userId: mockUserId,
          title: '',
          statusId: mockStatusId,
        }),
      ).rejects.toThrow('Issue title is required');
    });

    it('should throw error if status does not exist', async () => {
      (prisma.status.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        createIssue({
          userId: mockUserId,
          title: 'Test Issue',
          statusId: 'invalid-status',
        }),
      ).rejects.toThrow('Status not found or does not belong to user');
    });

    it('should create issue with labels', async () => {
      const mockStatus = { id: mockStatusId };
      const mockIssue = {
        id: mockIssueId,
        userId: mockUserId,
        title: 'Test Issue',
        statusId: mockStatusId,
        priority: Priority.NO_PRIORITY,
        projectId: null,
        areaId: null,
        parentIssueId: null,
        description: null,
        startDate: null,
        dueDate: null,
        completedAt: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.status.findFirst as jest.Mock).mockResolvedValue(mockStatus);
      (prisma.issue.create as jest.Mock).mockResolvedValue(mockIssue);
      (prisma.issue.findFirst as jest.Mock).mockResolvedValue(mockIssue);
      (prisma.issueLabel.createMany as jest.Mock).mockResolvedValue({
        count: 2,
      });

      await createIssue({
        userId: mockUserId,
        title: 'Test Issue',
        statusId: mockStatusId,
        labelIds: ['label-1', 'label-2'],
      });

      expect(prisma.issueLabel.createMany).toHaveBeenCalledWith({
        data: [
          { issueId: mockIssueId, labelId: 'label-1' },
          { issueId: mockIssueId, labelId: 'label-2' },
        ],
      });
    });
  });

  describe('getIssueById', () => {
    it('should return issue if found', async () => {
      const mockIssue = {
        id: mockIssueId,
        userId: mockUserId,
        title: 'Test Issue',
        statusId: mockStatusId,
        priority: Priority.MEDIUM,
        projectId: null,
        areaId: null,
        parentIssueId: null,
        description: 'Test Description',
        startDate: null,
        dueDate: null,
        completedAt: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        labels: [],
        status: { id: mockStatusId, name: 'Todo' },
        project: null,
        area: null,
        parentIssue: null,
        subIssues: [],
      };

      (prisma.issue.findFirst as jest.Mock).mockResolvedValue(mockIssue);

      const result = await getIssueById(mockIssueId, mockUserId);

      expect(result).toBeDefined();
      expect(result?.title).toBe('Test Issue');
      expect(prisma.issue.findFirst).toHaveBeenCalledWith({
        where: { id: mockIssueId, userId: mockUserId, deletedAt: null },
        include: expect.any(Object),
      });
    });

    it('should return null if issue not found', async () => {
      (prisma.issue.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getIssueById('invalid-id', mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('listIssues', () => {
    it('should return paginated issues', async () => {
      const mockIssues = [
        {
          id: 'issue-1',
          userId: mockUserId,
          title: 'Issue 1',
          statusId: mockStatusId,
          priority: Priority.HIGH,
          projectId: null,
          areaId: null,
          parentIssueId: null,
          description: null,
          startDate: null,
          dueDate: null,
          completedAt: null,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          labels: [],
          status: { id: mockStatusId, name: 'Todo' },
          project: null,
          area: null,
          parentIssue: null,
        },
        {
          id: 'issue-2',
          userId: mockUserId,
          title: 'Issue 2',
          statusId: mockStatusId,
          priority: Priority.LOW,
          projectId: null,
          areaId: null,
          parentIssueId: null,
          description: null,
          startDate: null,
          dueDate: null,
          completedAt: null,
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          labels: [],
          status: { id: mockStatusId, name: 'Todo' },
          project: null,
          area: null,
          parentIssue: null,
        },
      ];

      (prisma.issue.findMany as jest.Mock).mockResolvedValue(mockIssues);
      (prisma.issue.count as jest.Mock).mockResolvedValue(10);

      const result = await listIssues({
        userId: mockUserId,
        skip: 0,
        take: 2,
      });

      expect(result.issues).toHaveLength(2);
      expect(result.total).toBe(10);
      expect(result.hasMore).toBe(true);
    });

    it('should filter issues by status', async () => {
      (prisma.issue.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.issue.count as jest.Mock).mockResolvedValue(0);

      await listIssues({
        userId: mockUserId,
        statusId: mockStatusId,
      });

      expect(prisma.issue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUserId,
            statusId: mockStatusId,
          }),
        }),
      );
    });

    it('should search issues by title and description', async () => {
      (prisma.issue.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.issue.count as jest.Mock).mockResolvedValue(0);

      await listIssues({
        userId: mockUserId,
        search: 'test query',
      });

      expect(prisma.issue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUserId,
            OR: [
              { title: { contains: 'test query', mode: 'insensitive' } },
              { description: { contains: 'test query', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });
  });

  describe('updateIssue', () => {
    it('should update issue successfully', async () => {
      const existingIssue = {
        id: mockIssueId,
        userId: mockUserId,
        title: 'Old Title',
        statusId: mockStatusId,
        metadata: {},
        startDate: null,
        dueDate: null,
      };

      const updatedIssue = {
        ...existingIssue,
        title: 'New Title',
      };

      (prisma.issue.findFirst as jest.Mock)
        .mockResolvedValueOnce(existingIssue)
        .mockResolvedValueOnce({ ...updatedIssue, labels: [], status: {} });
      (prisma.issue.update as jest.Mock).mockResolvedValue(updatedIssue);

      const result = await updateIssue(mockIssueId, mockUserId, {
        title: 'New Title',
      });

      expect(result.title).toBe('New Title');
      expect(prisma.issue.update).toHaveBeenCalledWith({
        where: { id: mockIssueId },
        data: { title: 'New Title' },
      });
    });

    it('should throw error if issue not found', async () => {
      (prisma.issue.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        updateIssue(mockIssueId, mockUserId, { title: 'New Title' }),
      ).rejects.toThrow('Issue not found or does not belong to user');
    });
  });

  describe('deleteIssue', () => {
    it('should soft delete issue by default', async () => {
      const mockIssue = {
        id: mockIssueId,
        userId: mockUserId,
        title: 'Test Issue',
      };

      (prisma.issue.findFirst as jest.Mock).mockResolvedValue(mockIssue);
      (prisma.issue.update as jest.Mock).mockResolvedValue({
        ...mockIssue,
        deletedAt: new Date(),
      });

      await deleteIssue(mockIssueId, mockUserId);

      expect(prisma.issue.update).toHaveBeenCalledWith({
        where: { id: mockIssueId },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should permanently delete issue when permanent flag is true', async () => {
      const mockIssue = {
        id: mockIssueId,
        userId: mockUserId,
        title: 'Test Issue',
      };

      (prisma.issue.findFirst as jest.Mock).mockResolvedValue(mockIssue);
      (prisma.issue.delete as jest.Mock).mockResolvedValue(mockIssue);

      await deleteIssue(mockIssueId, mockUserId, true);

      expect(prisma.issue.delete).toHaveBeenCalledWith({
        where: { id: mockIssueId },
      });
    });

    it('should throw error if issue not found', async () => {
      (prisma.issue.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(deleteIssue('invalid-id', mockUserId)).rejects.toThrow(
        'Issue not found or does not belong to user',
      );
    });
  });

  describe('getIssueCount', () => {
    it('should return issue count excluding deleted', async () => {
      (prisma.issue.count as jest.Mock).mockResolvedValue(42);

      const count = await getIssueCount(mockUserId);

      expect(count).toBe(42);
      expect(prisma.issue.count).toHaveBeenCalledWith({
        where: { userId: mockUserId, deletedAt: null },
      });
    });

    it('should return issue count including deleted when flag is true', async () => {
      (prisma.issue.count as jest.Mock).mockResolvedValue(50);

      const count = await getIssueCount(mockUserId, true);

      expect(count).toBe(50);
      expect(prisma.issue.count).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });
  });
});

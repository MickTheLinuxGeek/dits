import { apiClient } from '../lib/api-client';
import type { Issue, IssueStatus, IssuePriority } from '../mocks/types';
import { AxiosError } from 'axios';

/**
 * Request parameters for listing issues
 */
export interface IssueListParams {
  // Pagination
  page?: number;
  limit?: number;

  // Filtering
  search?: string;
  status?: IssueStatus | 'all';
  priority?: IssuePriority | 'all';
  labels?: string[];
  hasDate?: boolean | null;
  projectId?: string;
  areaId?: string;

  // Sorting
  sortBy?:
    | 'title'
    | 'status'
    | 'priority'
    | 'dueDate'
    | 'createdAt'
    | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Create issue request data
 */
export interface CreateIssueData {
  title: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  labels?: string[];
  dueDate?: string | Date;
  projectId?: string;
  areaId?: string;
}

/**
 * Update issue request data (partial)
 */
export interface UpdateIssueData {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  labels?: string[];
  dueDate?: string | Date | null;
  projectId?: string | null;
  areaId?: string | null;
}

/**
 * Bulk update request data
 */
export interface BulkUpdateData {
  issueIds: string[];
  updates: {
    status?: IssueStatus;
    priority?: IssuePriority;
  };
}

/**
 * Issues service providing all issue-related API methods
 */
export const issuesService = {
  /**
   * List issues with filtering, sorting, and pagination
   */
  async listIssues(
    params?: IssueListParams,
  ): Promise<PaginatedResponse<Issue>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Issue>>(
        '/issues',
        {
          params: {
            page: params?.page || 1,
            limit: params?.limit || 50,
            search: params?.search || undefined,
            status: params?.status !== 'all' ? params?.status : undefined,
            priority: params?.priority !== 'all' ? params?.priority : undefined,
            labels: params?.labels?.length
              ? params.labels.join(',')
              : undefined,
            hasDate: params?.hasDate !== null ? params?.hasDate : undefined,
            projectId: params?.projectId || undefined,
            areaId: params?.areaId || undefined,
            sortBy: params?.sortBy || 'createdAt',
            sortOrder: params?.sortOrder || 'desc',
          },
        },
      );

      // Transform date strings to Date objects
      return {
        ...response.data,
        data: (response.data.data || []).map((issue) => ({
          ...issue,
          dueDate: issue.dueDate ? new Date(issue.dueDate) : undefined,
          createdAt: new Date(issue.createdAt),
          updatedAt: new Date(issue.updatedAt),
        })),
      };
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch issues');
    }
  },

  /**
   * Get a single issue by ID
   */
  async getIssue(id: string): Promise<Issue> {
    try {
      const response = await apiClient.get<Issue>(`/issues/${id}`);

      // Transform date strings to Date objects
      return {
        ...response.data,
        dueDate: response.data.dueDate
          ? new Date(response.data.dueDate)
          : undefined,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch issue');
    }
  },

  /**
   * Create a new issue
   */
  async createIssue(data: CreateIssueData): Promise<Issue> {
    try {
      const response = await apiClient.post<Issue>('/issues', {
        ...data,
        dueDate:
          data.dueDate instanceof Date
            ? data.dueDate.toISOString()
            : data.dueDate,
      });

      // Transform date strings to Date objects
      return {
        ...response.data,
        dueDate: response.data.dueDate
          ? new Date(response.data.dueDate)
          : undefined,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };
    } catch (error) {
      throw handleApiError(error, 'Failed to create issue');
    }
  },

  /**
   * Update an existing issue
   */
  async updateIssue(id: string, data: UpdateIssueData): Promise<Issue> {
    try {
      const response = await apiClient.patch<Issue>(`/issues/${id}`, {
        ...data,
        dueDate:
          data.dueDate instanceof Date
            ? data.dueDate.toISOString()
            : data.dueDate,
      });

      // Transform date strings to Date objects
      return {
        ...response.data,
        dueDate: response.data.dueDate
          ? new Date(response.data.dueDate)
          : undefined,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };
    } catch (error) {
      throw handleApiError(error, 'Failed to update issue');
    }
  },

  /**
   * Delete an issue
   */
  async deleteIssue(id: string): Promise<void> {
    try {
      await apiClient.delete(`/issues/${id}`);
    } catch (error) {
      throw handleApiError(error, 'Failed to delete issue');
    }
  },

  /**
   * Bulk delete issues
   */
  async bulkDeleteIssues(
    issueIds: string[],
  ): Promise<{ deletedCount: number }> {
    try {
      const response = await apiClient.post<{ deletedCount: number }>(
        '/issues/bulk-delete',
        { issueIds },
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to delete issues');
    }
  },

  /**
   * Bulk update issues (status or priority)
   */
  async bulkUpdateIssues(
    data: BulkUpdateData,
  ): Promise<{ updatedCount: number }> {
    try {
      const response = await apiClient.post<{ updatedCount: number }>(
        '/issues/bulk-update',
        data,
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to update issues');
    }
  },

  /**
   * Update issue status
   */
  async updateIssueStatus(id: string, status: IssueStatus): Promise<Issue> {
    return issuesService.updateIssue(id, { status });
  },

  /**
   * Update issue priority
   */
  async updateIssuePriority(
    id: string,
    priority: IssuePriority,
  ): Promise<Issue> {
    return issuesService.updateIssue(id, { priority });
  },

  /**
   * Get inbox issues (issues without project or area)
   */
  async getInboxIssues(
    params?: Omit<IssueListParams, 'projectId' | 'areaId'>,
  ): Promise<PaginatedResponse<Issue>> {
    return issuesService.listIssues({
      ...params,
      // Backend should filter for issues where projectId and areaId are null
      // This would need to be handled by a dedicated endpoint or query param
    });
  },

  /**
   * Get today's issues (due today or scheduled for today)
   * NOTE: Client-side filtering until backend endpoint is implemented
   */
  async getTodayIssues(
    params?: Omit<IssueListParams, 'dueDate'>,
  ): Promise<PaginatedResponse<Issue>> {
    const response = await issuesService.listIssues({
      ...params,
      status: params?.status || 'all',
      sortBy: params?.sortBy || 'priority',
      sortOrder: params?.sortOrder || 'desc',
    });

    // Filter for today's issues client-side
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayIssues = response.data.filter((issue) => {
      if (!issue.dueDate) return false;
      const dueDate = new Date(issue.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime() && issue.status !== 'Done';
    });

    return {
      ...response,
      data: todayIssues,
      pagination: {
        ...response.pagination,
        total: todayIssues.length,
        totalPages: Math.ceil(todayIssues.length / response.pagination.limit),
      },
    };
  },

  /**
   * Get upcoming issues (due in the future)
   * NOTE: Client-side filtering until backend endpoint is implemented
   */
  async getUpcomingIssues(
    params?: Omit<IssueListParams, 'dueDate'>,
  ): Promise<PaginatedResponse<Issue>> {
    const response = await issuesService.listIssues({
      ...params,
      status: params?.status || 'all',
      sortBy: params?.sortBy || 'dueDate',
      sortOrder: params?.sortOrder || 'asc',
    });

    // Filter for future issues client-side
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingIssues = response.data.filter((issue) => {
      if (!issue.dueDate) return false;
      const dueDate = new Date(issue.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= tomorrow && issue.status !== 'Done';
    });

    // Sort by due date ascending
    upcomingIssues.sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return {
      ...response,
      data: upcomingIssues,
      pagination: {
        ...response.pagination,
        total: upcomingIssues.length,
        totalPages: Math.ceil(
          upcomingIssues.length / response.pagination.limit,
        ),
      },
    };
  },

  /**
   * Get logbook issues (completed issues)
   */
  async getLogbookIssues(
    params?: Omit<IssueListParams, 'status'>,
  ): Promise<PaginatedResponse<Issue>> {
    return issuesService.listIssues({
      ...params,
      status: 'Done',
      sortBy: params?.sortBy || 'updatedAt',
      sortOrder: params?.sortOrder || 'desc',
    });
  },
};

/**
 * Handle API errors and provide user-friendly messages
 */
function handleApiError(error: unknown, defaultMessage: string): Error {
  if (error instanceof AxiosError && error.response) {
    const status = error.response.status;
    const serverMessage = error.response.data?.message;

    if (status === 400) {
      return new Error(
        serverMessage || 'Invalid request. Please check your input.',
      );
    } else if (status === 401) {
      return new Error('You are not authenticated. Please log in.');
    } else if (status === 403) {
      return new Error('You do not have permission to perform this action.');
    } else if (status === 404) {
      return new Error('The requested resource was not found.');
    } else if (status === 409) {
      return new Error(
        serverMessage || 'A conflict occurred. Please try again.',
      );
    } else if (status === 429) {
      return new Error(
        'Too many requests. Please slow down and try again later.',
      );
    } else if (status >= 500) {
      return new Error('Server error. Please try again later.');
    } else if (serverMessage) {
      return new Error(serverMessage);
    }
  }

  // Network errors or unexpected errors
  if (error instanceof Error) {
    return error;
  }

  return new Error(defaultMessage);
}

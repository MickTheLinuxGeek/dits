import { useState, useEffect, useCallback } from 'react';
import {
  issuesService,
  type IssueListParams,
  type PaginatedResponse,
} from '../services/issues.service';
import type { Issue, IssueStatus, IssuePriority } from '../mocks/types';

/**
 * Hook options for issue list
 */
export interface UseIssueListOptions {
  /** Initial parameters for the list */
  initialParams?: IssueListParams;
  /** Whether to fetch data on mount */
  autoFetch?: boolean;
  /** Custom fetch function (for inbox, today, etc.) */
  fetchFunction?: (
    params?: IssueListParams,
  ) => Promise<PaginatedResponse<Issue>>;
}

/**
 * Hook return type
 */
export interface UseIssueListReturn {
  // Data
  issues: Issue[];
  totalCount: number;
  currentPage: number;
  totalPages: number;

  // Loading and error states
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Actions
  refetch: () => Promise<void>;
  updateParams: (params: Partial<IssueListParams>) => void;
  deleteIssue: (id: string) => Promise<void>;
  bulkDeleteIssues: (ids: string[]) => Promise<void>;
  updateIssueStatus: (id: string, status: IssueStatus) => Promise<void>;
  updateIssuePriority: (id: string, priority: IssuePriority) => Promise<void>;
  bulkUpdateStatus: (ids: string[], status: IssueStatus) => Promise<void>;
  bulkUpdatePriority: (ids: string[], priority: IssuePriority) => Promise<void>;
}

/**
 * Custom hook for managing issue lists with API integration
 *
 * Features:
 * - Automatic data fetching
 * - Loading and error states
 * - Optimistic updates
 * - Filtering, sorting, and pagination
 * - CRUD operations
 *
 * @example
 * ```tsx
 * const { issues, isLoading, updateParams } = useIssueList({
 *   initialParams: { page: 1, limit: 50 },
 * });
 * ```
 */
export function useIssueList(
  options: UseIssueListOptions = {},
): UseIssueListReturn {
  const { initialParams = {}, autoFetch = true, fetchFunction } = options;

  // State
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [params, setParams] = useState<IssueListParams>(initialParams);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch issues from API
   */
  const fetchIssues = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await (fetchFunction || issuesService.listIssues)(
        params,
      );
      setIssues(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setIsError(true);
      setError(
        err instanceof Error ? err : new Error('Failed to fetch issues'),
      );
      console.error('Failed to fetch issues:', err);
    } finally {
      setIsLoading(false);
    }
  }, [params, fetchFunction]);

  /**
   * Update query parameters and refetch
   */
  const updateParams = useCallback((newParams: Partial<IssueListParams>) => {
    setParams((prev) => ({
      ...prev,
      ...newParams,
      // Reset to page 1 if filters change
      page: newParams.page !== undefined ? newParams.page : 1,
    }));
  }, []);

  /**
   * Refetch with current parameters
   */
  const refetch = useCallback(async () => {
    await fetchIssues();
  }, [fetchIssues]);

  /**
   * Delete a single issue
   */
  const deleteIssue = useCallback(
    async (id: string) => {
      try {
        // Optimistic update
        setIssues((prev) => prev.filter((issue) => issue.id !== id));
        setPagination((prev) => ({
          ...prev,
          total: prev.total - 1,
        }));

        await issuesService.deleteIssue(id);

        // Refetch to get accurate data
        await fetchIssues();
      } catch (err) {
        // Revert optimistic update on error
        await fetchIssues();
        throw err;
      }
    },
    [fetchIssues],
  );

  /**
   * Bulk delete issues
   */
  const bulkDeleteIssues = useCallback(
    async (ids: string[]) => {
      try {
        // Optimistic update
        setIssues((prev) => prev.filter((issue) => !ids.includes(issue.id)));
        setPagination((prev) => ({
          ...prev,
          total: prev.total - ids.length,
        }));

        await issuesService.bulkDeleteIssues(ids);

        // Refetch to get accurate data
        await fetchIssues();
      } catch (err) {
        // Revert optimistic update on error
        await fetchIssues();
        throw err;
      }
    },
    [fetchIssues],
  );

  /**
   * Update issue status
   */
  const updateIssueStatus = useCallback(
    async (id: string, status: IssueStatus) => {
      try {
        // Optimistic update
        setIssues((prev) =>
          prev.map((issue) =>
            issue.id === id
              ? { ...issue, status, updatedAt: new Date() }
              : issue,
          ),
        );

        await issuesService.updateIssueStatus(id, status);

        // Refetch to get accurate data
        await fetchIssues();
      } catch (err) {
        // Revert optimistic update on error
        await fetchIssues();
        throw err;
      }
    },
    [fetchIssues],
  );

  /**
   * Update issue priority
   */
  const updateIssuePriority = useCallback(
    async (id: string, priority: IssuePriority) => {
      try {
        // Optimistic update
        setIssues((prev) =>
          prev.map((issue) =>
            issue.id === id
              ? { ...issue, priority, updatedAt: new Date() }
              : issue,
          ),
        );

        await issuesService.updateIssuePriority(id, priority);

        // Refetch to get accurate data
        await fetchIssues();
      } catch (err) {
        // Revert optimistic update on error
        await fetchIssues();
        throw err;
      }
    },
    [fetchIssues],
  );

  /**
   * Bulk update status
   */
  const bulkUpdateStatus = useCallback(
    async (ids: string[], status: IssueStatus) => {
      try {
        // Optimistic update
        setIssues((prev) =>
          prev.map((issue) =>
            ids.includes(issue.id)
              ? { ...issue, status, updatedAt: new Date() }
              : issue,
          ),
        );

        await issuesService.bulkUpdateIssues({
          issueIds: ids,
          updates: { status },
        });

        // Refetch to get accurate data
        await fetchIssues();
      } catch (err) {
        // Revert optimistic update on error
        await fetchIssues();
        throw err;
      }
    },
    [fetchIssues],
  );

  /**
   * Bulk update priority
   */
  const bulkUpdatePriority = useCallback(
    async (ids: string[], priority: IssuePriority) => {
      try {
        // Optimistic update
        setIssues((prev) =>
          prev.map((issue) =>
            ids.includes(issue.id)
              ? { ...issue, priority, updatedAt: new Date() }
              : issue,
          ),
        );

        await issuesService.bulkUpdateIssues({
          issueIds: ids,
          updates: { priority },
        });

        // Refetch to get accurate data
        await fetchIssues();
      } catch (err) {
        // Revert optimistic update on error
        await fetchIssues();
        throw err;
      }
    },
    [fetchIssues],
  );

  // Fetch on mount and when params change
  useEffect(() => {
    if (autoFetch) {
      fetchIssues();
    }
  }, [fetchIssues, autoFetch]);

  return {
    // Data
    issues,
    totalCount: pagination.total,
    currentPage: pagination.page,
    totalPages: pagination.totalPages,

    // States
    isLoading,
    isError,
    error,

    // Actions
    refetch,
    updateParams,
    deleteIssue,
    bulkDeleteIssues,
    updateIssueStatus,
    updateIssuePriority,
    bulkUpdateStatus,
    bulkUpdatePriority,
  };
}

import { useCallback, useEffect, useState } from 'react';
import type { ColumnWidths } from './useColumnResize';

export interface IssueListPreferences {
  /** Sort field */
  sortField: string;
  /** Sort direction */
  sortDirection: 'asc' | 'desc';
  /** Visible columns */
  visibleColumns: string[];
  /** Items per page */
  itemsPerPage: number;
  /** View mode (table, board, etc.) */
  viewMode: 'table' | 'board' | 'list';
  /** Column widths (in pixels) */
  columnWidths?: ColumnWidths;
}

const STORAGE_KEY = 'dits_issue_list_preferences';

const DEFAULT_PREFERENCES: IssueListPreferences = {
  sortField: 'createdAt',
  sortDirection: 'desc',
  visibleColumns: ['title', 'status', 'priority', 'labels', 'dueDate'],
  itemsPerPage: 50,
  viewMode: 'table',
  columnWidths: {},
};

/**
 * Custom hook for managing issue list preferences with localStorage persistence.
 * Provides methods to get, update, and reset preferences.
 */
export function useIssueListPreferences() {
  const [preferences, setPreferences] = useState<IssueListPreferences>(() => {
    // Load preferences from localStorage on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all required fields exist
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load issue list preferences:', error);
    }
    return DEFAULT_PREFERENCES;
  });

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save issue list preferences:', error);
    }
  }, [preferences]);

  // Update preferences (partial update)
  const updatePreferences = useCallback(
    (updates: Partial<IssueListPreferences>) => {
      setPreferences((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  // Reset preferences to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  // Update visible columns
  const updateVisibleColumns = useCallback((visibleColumns: string[]) => {
    setPreferences((prev) => ({ ...prev, visibleColumns }));
  }, []);

  // Update sort settings
  const updateSort = useCallback(
    (sortField: string, sortDirection: 'asc' | 'desc') => {
      setPreferences((prev) => ({ ...prev, sortField, sortDirection }));
    },
    [],
  );

  // Update items per page
  const updateItemsPerPage = useCallback((itemsPerPage: number) => {
    setPreferences((prev) => ({ ...prev, itemsPerPage }));
  }, []);

  // Update view mode
  const updateViewMode = useCallback((viewMode: 'table' | 'board' | 'list') => {
    setPreferences((prev) => ({ ...prev, viewMode }));
  }, []);

  // Update column widths
  const updateColumnWidths = useCallback((columnWidths: ColumnWidths) => {
    setPreferences((prev) => ({ ...prev, columnWidths }));
  }, []);

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    updateVisibleColumns,
    updateSort,
    updateItemsPerPage,
    updateViewMode,
    updateColumnWidths,
  };
}

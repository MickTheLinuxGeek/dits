import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Issue, IssueStatus, IssuePriority } from '../../../mocks/types';
import { IssueTable } from '../IssueTable';
import { IssueListToolbar } from '../IssueListToolbar';
import { BulkActionsBar } from '../BulkActionsBar';
import { IssueListLoadingState } from '../IssueListLoadingState/IssueListLoadingState';
import { IssueListErrorState } from '../IssueListErrorState/IssueListErrorState';
import { IssueListEmptyState } from '../IssueListEmptyState/IssueListEmptyState';
import { InfiniteScrollContainer } from '../InfiniteScrollContainer';
import { IssueCard } from '../IssueCard';
import { FilterPresetManager } from '../FilterPresetManager';
import { useIssueListPreferences } from '../../../hooks/useIssueListPreferences';
import { useFilterPresets } from '../../../hooks/useFilterPresets';
import styles from './IssueListContainer.module.css';

export type ViewMode = 'table' | 'list';

export interface IssueListContainerProps {
  /** Issues to display */
  issues: Issue[];
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  isError?: boolean;
  /** Error object */
  error?: Error | null;
  /** Callback to retry on error */
  onRetry?: () => void;
  /** Callback when an issue is clicked */
  onIssueClick?: (issue: Issue) => void;
  /** Callback when issues are deleted */
  onIssuesDelete?: (issueIds: string[]) => void;
  /** Callback when issue status changes */
  onIssueStatusChange?: (issueId: string, status: IssueStatus) => void;
  /** Callback when issue priority changes */
  onIssuePriorityChange?: (issueId: string, priority: IssuePriority) => void;
  /** Callback to clear filters/search */
  onClearFilters?: () => void;
  /** Callback to load more items (for infinite scroll) */
  onLoadMore?: () => void;
  /** Whether there are more items to load (for infinite scroll) */
  hasMore?: boolean;
  /** Whether currently loading more items (for infinite scroll) */
  isLoadingMore?: boolean;
  /** View mode (table with pagination or infinite scroll list) */
  viewMode?: ViewMode;
  /** Callback when view mode changes */
  onViewModeChange?: (mode: ViewMode) => void;
}

export type SortField =
  | 'title'
  | 'status'
  | 'priority'
  | 'dueDate'
  | 'createdAt'
  | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

export interface IssueFilters {
  search: string;
  status: IssueStatus | 'all';
  priority: IssuePriority | 'all';
  labels: string[];
  hasDate: boolean | null;
}

/**
 * Main container component for issue list management.
 * Orchestrates filtering, sorting, selection, and bulk actions.
 */
export function IssueListContainer({
  issues,
  isLoading = false,
  isError = false,
  error = null,
  onRetry,
  onIssueClick,
  onIssuesDelete,
  onIssueStatusChange,
  onIssuePriorityChange,
  onClearFilters,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  viewMode: externalViewMode,
  onViewModeChange,
}: IssueListContainerProps) {
  // Preferences hook for persistent settings
  const { preferences, updatePreferences, updateColumnWidths } =
    useIssueListPreferences();

  // Filter presets hook
  const { presets, savePreset, loadPreset, deletePreset, presetNameExists } =
    useFilterPresets();

  // Preset manager modal state
  const [showPresetManager, setShowPresetManager] = useState(false);

  // View mode state (use external or default from preferences)
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>(
    (preferences.viewMode as ViewMode) || 'table',
  );
  const viewMode =
    externalViewMode !== undefined ? externalViewMode : internalViewMode;

  // Selection state
  const [selectedIssueIds, setSelectedIssueIds] = useState<Set<string>>(
    new Set(),
  );

  // Filter state
  const [filters, setFilters] = useState<IssueFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    labels: [],
    hasDate: null,
  });

  // Sort state
  const [sortField, setSortField] = useState<SortField>(
    (preferences.sortField as SortField) || 'createdAt',
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    preferences.sortDirection || 'desc',
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(preferences.itemsPerPage || 50);

  // Update preferences when sort or view mode changes
  useEffect(() => {
    updatePreferences({ sortField, sortDirection });
  }, [sortField, sortDirection, updatePreferences]);

  useEffect(() => {
    if (externalViewMode === undefined) {
      updatePreferences({ viewMode: internalViewMode });
    }
  }, [internalViewMode, externalViewMode, updatePreferences]);

  // Handle view mode change
  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      if (onViewModeChange) {
        onViewModeChange(mode);
      } else {
        setInternalViewMode(mode);
      }
    },
    [onViewModeChange],
  );

  // Handle save preset
  const handleSavePreset = useCallback(
    (name: string) => {
      savePreset(name, filters);
    },
    [savePreset, filters],
  );

  // Handle load preset
  const handleLoadPreset = useCallback(
    (id: string) => {
      const presetFilters = loadPreset(id);
      if (presetFilters) {
        setFilters(presetFilters);
        setCurrentPage(1);
      }
    },
    [loadPreset],
  );

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = issue.title.toLowerCase().includes(searchLower);
        const matchesDescription = issue.description
          ?.toLowerCase()
          .includes(searchLower);
        const matchesId = issue.id.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesDescription && !matchesId) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== 'all' && issue.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && issue.priority !== filters.priority) {
        return false;
      }

      // Labels filter
      if (filters.labels.length > 0) {
        const issueLabels = issue.labels.map((l) => l.id);
        const hasAllLabels = filters.labels.every((labelId) =>
          issueLabels.includes(labelId),
        );
        if (!hasAllLabels) {
          return false;
        }
      }

      // Date filter
      if (filters.hasDate !== null) {
        const hasDate = !!issue.dueDate;
        if (hasDate !== filters.hasDate) {
          return false;
        }
      }

      return true;
    });
  }, [issues, filters]);

  // Sort issues
  const sortedIssues = useMemo(() => {
    const sorted = [...filteredIssues];
    sorted.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority': {
          // Priority order: Urgent > High > Medium > Low
          const priorityOrder = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        }
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = aValue < bValue ? -1 : 1;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredIssues, sortField, sortDirection]);

  // Paginate issues (only for table view)
  const paginatedIssues = useMemo(() => {
    if (viewMode === 'list') {
      // In list mode, show all sorted issues (infinite scroll handles loading)
      return sortedIssues;
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedIssues.slice(startIndex, endIndex);
  }, [sortedIssues, currentPage, itemsPerPage, viewMode]);

  const totalPages = Math.ceil(sortedIssues.length / itemsPerPage);

  // Handle sort change
  const handleSortChange = useCallback(
    (field: SortField, direction: SortDirection) => {
      setSortField(field);
      setSortDirection(direction);
      setCurrentPage(1); // Reset to first page on sort change
    },
    [],
  );

  // Handle filter change
  const handleFilterChange = useCallback(
    (newFilters: Partial<IssueFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
      setCurrentPage(1); // Reset to first page on filter change
    },
    [],
  );

  // Handle selection change
  const handleSelectionChange = useCallback((selectedIds: Set<string>) => {
    setSelectedIssueIds(selectedIds);
  }, []);

  // Handle select all (current page or all)
  const handleSelectAll = useCallback(
    (allPages: boolean) => {
      if (allPages) {
        const allIds = new Set<string>(
          sortedIssues.map((issue: Issue) => issue.id),
        );
        setSelectedIssueIds(allIds);
      } else {
        const pageIds = new Set<string>(
          paginatedIssues.map((issue: Issue) => issue.id),
        );
        setSelectedIssueIds(pageIds);
      }
    },
    [sortedIssues, paginatedIssues],
  );

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedIssueIds(new Set());
  }, []);

  // Handle bulk delete
  const handleBulkDelete = useCallback(() => {
    if (onIssuesDelete && selectedIssueIds.size > 0) {
      onIssuesDelete(Array.from(selectedIssueIds));
      setSelectedIssueIds(new Set());
    }
  }, [selectedIssueIds, onIssuesDelete]);

  // Handle bulk status change
  const handleBulkStatusChange = useCallback(
    (status: IssueStatus) => {
      if (onIssueStatusChange) {
        selectedIssueIds.forEach((id) => {
          onIssueStatusChange(id, status);
        });
        setSelectedIssueIds(new Set());
      }
    },
    [selectedIssueIds, onIssueStatusChange],
  );

  // Handle bulk priority change
  const handleBulkPriorityChange = useCallback(
    (priority: IssuePriority) => {
      if (onIssuePriorityChange) {
        selectedIssueIds.forEach((id) => {
          onIssuePriorityChange(id, priority);
        });
        setSelectedIssueIds(new Set());
      }
    },
    [selectedIssueIds, onIssuePriorityChange],
  );

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle clear filters
  const handleClearAllFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      labels: [],
      hasDate: null,
    });
    setCurrentPage(1);
    if (onClearFilters) {
      onClearFilters();
    }
  }, [onClearFilters]);

  // Check if filters are active
  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.labels.length > 0 ||
    filters.hasDate !== null;

  // Loading state
  if (isLoading && issues.length === 0) {
    return <IssueListLoadingState rows={10} showToolbar={true} />;
  }

  // Error state
  if (isError) {
    return <IssueListErrorState error={error || undefined} onRetry={onRetry} />;
  }

  // Empty state - no issues at all
  if (!isLoading && issues.length === 0) {
    return <IssueListEmptyState variant="no-issues" />;
  }

  // Empty state - no results after filtering
  const showNoResults =
    !isLoading && filteredIssues.length === 0 && hasActiveFilters;

  return (
    <div className={styles.container}>
      {/* Toolbar with search, filters, and view options */}
      <IssueListToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        totalCount={issues.length}
        filteredCount={filteredIssues.length}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        presets={presets}
        onManagePresets={() => setShowPresetManager(true)}
      />

      {/* Filter preset manager modal */}
      {showPresetManager && (
        <FilterPresetManager
          presets={presets}
          currentFilters={filters}
          onSave={handleSavePreset}
          onLoad={handleLoadPreset}
          onDelete={deletePreset}
          onClose={() => setShowPresetManager(false)}
          presetNameExists={presetNameExists}
        />
      )}

      {/* Bulk actions bar (shown when items are selected) */}
      {selectedIssueIds.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedIssueIds.size}
          onClearSelection={handleClearSelection}
          onDelete={handleBulkDelete}
          onStatusChange={handleBulkStatusChange}
          onPriorityChange={handleBulkPriorityChange}
        />
      )}

      {/* No results empty state */}
      {showNoResults ? (
        <IssueListEmptyState
          variant="filtered"
          onAction={handleClearAllFilters}
        />
      ) : viewMode === 'table' ? (
        /* Table view with pagination */
        <IssueTable
          issues={paginatedIssues}
          isLoading={isLoading}
          selectedIds={selectedIssueIds}
          onSelectionChange={handleSelectionChange}
          onIssueClick={onIssueClick}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          visibleColumns={preferences.visibleColumns}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onSelectAll={handleSelectAll}
          columnWidths={preferences.columnWidths}
          onColumnWidthsChange={updateColumnWidths}
          resizable
        />
      ) : (
        /* List view with infinite scroll */
        <InfiniteScrollContainer
          onLoadMore={onLoadMore || (() => {})}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          isLoading={isLoading}
        >
          {paginatedIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              isSelected={selectedIssueIds.has(issue.id)}
              onClick={onIssueClick}
              onSelectionChange={(issueId, selected) => {
                const newSelected = new Set(selectedIssueIds);
                if (selected) {
                  newSelected.add(issueId);
                } else {
                  newSelected.delete(issueId);
                }
                setSelectedIssueIds(newSelected);
              }}
              showCheckbox={selectedIssueIds.size > 0}
            />
          ))}
        </InfiniteScrollContainer>
      )}
    </div>
  );
}

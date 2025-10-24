import React, { useState, useCallback } from 'react';
import { X, Table2, List, Star } from 'lucide-react';
import type { IssueStatus, IssuePriority } from '../../../mocks/types';
import type {
  IssueFilters,
  SortField,
  SortDirection,
  ViewMode,
} from '../IssueListContainer/IssueListContainer';
import { Input } from '../../atoms/Input';
import { Button } from '../../atoms/Button';
import { FilterDropdown } from '../FilterDropdown';
import { SortDropdown } from '../SortDropdown';
import type { FilterPreset } from '../../../hooks/useFilterPresets';
import styles from './IssueListToolbar.module.css';

export interface IssueListToolbarProps {
  /** Current filters */
  filters: IssueFilters;
  /** Callback when filters change */
  onFilterChange: (filters: Partial<IssueFilters>) => void;
  /** Current sort field */
  sortField: SortField;
  /** Current sort direction */
  sortDirection: SortDirection;
  /** Callback when sort changes */
  onSortChange: (field: SortField, direction: SortDirection) => void;
  /** Total count of issues */
  totalCount: number;
  /** Filtered count of issues */
  filteredCount: number;
  /** Current view mode */
  viewMode?: ViewMode;
  /** Callback when view mode changes */
  onViewModeChange?: (mode: ViewMode) => void;
  /** Filter presets */
  presets?: FilterPreset[];
  /** Callback when preset manager is requested */
  onManagePresets?: () => void;
}

/**
 * Toolbar component for issue list with search, filters, and sort controls.
 * Displays filter chips and provides ways to manage active filters.
 */
export function IssueListToolbar({
  filters,
  onFilterChange,
  sortField,
  sortDirection,
  onSortChange,
  totalCount,
  filteredCount,
  viewMode = 'table',
  onViewModeChange,
  presets = [],
  onManagePresets,
}: IssueListToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search);

  // Handle search input change with debouncing
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);

      // Debounce search
      const timeoutId = setTimeout(() => {
        onFilterChange({ search: value });
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [onFilterChange],
  );

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchValue('');
    onFilterChange({ search: '' });
  }, [onFilterChange]);

  // Handle status filter change
  const handleStatusChange = useCallback(
    (status: IssueStatus | 'all') => {
      onFilterChange({ status });
    },
    [onFilterChange],
  );

  // Handle priority filter change
  const handlePriorityChange = useCallback(
    (priority: IssuePriority | 'all') => {
      onFilterChange({ priority });
    },
    [onFilterChange],
  );

  // Handle date filter change
  const handleDateFilterChange = useCallback(
    (hasDate: boolean | null) => {
      onFilterChange({ hasDate });
    },
    [onFilterChange],
  );

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    setSearchValue('');
    onFilterChange({
      search: '',
      status: 'all',
      priority: 'all',
      labels: [],
      hasDate: null,
    });
  }, [onFilterChange]);

  // Check if any filters are active
  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.labels.length > 0 ||
    filters.hasDate !== null;

  const isFiltered = filteredCount < totalCount;

  return (
    <div className={styles.toolbar}>
      {/* Top row: Search and actions */}
      <div className={styles.topRow}>
        {/* Search input */}
        <div className={styles.searchContainer}>
          <Input
            placeholder="Search issues..."
            value={searchValue}
            onChange={handleSearchChange}
            leftIcon="Search"
            rightIcon={searchValue ? 'X' : undefined}
            size="md"
            className={styles.searchInput}
            aria-label="Search issues"
          />
          {searchValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className={styles.clearSearchButton}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className={styles.actions}>
          {/* View mode toggle */}
          {onViewModeChange && (
            <div className={styles.viewModeToggle}>
              <button
                type="button"
                className={`${styles.viewModeButton} ${
                  viewMode === 'table' ? styles.active : ''
                }`}
                onClick={() => onViewModeChange('table')}
                aria-label="Table view"
                title="Table view"
              >
                <Table2 size={18} />
              </button>
              <button
                type="button"
                className={`${styles.viewModeButton} ${
                  viewMode === 'list' ? styles.active : ''
                }`}
                onClick={() => onViewModeChange('list')}
                aria-label="List view (infinite scroll)"
                title="List view (infinite scroll)"
              >
                <List size={18} />
              </button>
            </div>
          )}

          {/* Filter toggle button */}
          <Button
            variant={showFilters || hasActiveFilters ? 'primary' : 'outline'}
            size="md"
            leftIcon="ListFilter"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filters"
            aria-expanded={showFilters}
          >
            Filter
            {hasActiveFilters && (
              <span className={styles.filterBadge} aria-label="Active filters">
                •
              </span>
            )}
          </Button>

          {/* Sort dropdown */}
          <SortDropdown
            currentField={sortField}
            currentDirection={sortDirection}
            onSortChange={onSortChange}
          />

          {/* Filter presets button */}
          {onManagePresets && (
            <Button
              variant="outline"
              size="md"
              leftIcon={<Star size={16} />}
              onClick={onManagePresets}
              aria-label="Manage filter presets"
              title={
                presets.length > 0
                  ? `${presets.length} saved preset${presets.length > 1 ? 's' : ''}`
                  : 'Save filters as preset'
              }
            >
              Presets
              {presets.length > 0 && (
                <span className={styles.presetCount}>{presets.length}</span>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Filter panel (collapsible) */}
      {showFilters && (
        <div className={styles.filterPanel}>
          <div className={styles.filterRow}>
            {/* Status filter */}
            <FilterDropdown
              label="Status"
              value={filters.status}
              options={[
                { value: 'all', label: 'All' },
                { value: 'Todo', label: 'Todo' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Review', label: 'Review' },
                { value: 'Done', label: 'Done' },
              ]}
              onChange={(value) =>
                handleStatusChange(value as IssueStatus | 'all')
              }
            />

            {/* Priority filter */}
            <FilterDropdown
              label="Priority"
              value={filters.priority}
              options={[
                { value: 'all', label: 'All' },
                { value: 'Urgent', label: 'Urgent' },
                { value: 'High', label: 'High' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Low', label: 'Low' },
              ]}
              onChange={(value) =>
                handlePriorityChange(value as IssuePriority | 'all')
              }
            />

            {/* Date filter */}
            <FilterDropdown
              label="Due Date"
              value={
                filters.hasDate === null
                  ? 'all'
                  : filters.hasDate
                    ? 'with'
                    : 'without'
              }
              options={[
                { value: 'all', label: 'All' },
                { value: 'with', label: 'With date' },
                { value: 'without', label: 'Without date' },
              ]}
              onChange={(value) => {
                if (value === 'all') handleDateFilterChange(null);
                else if (value === 'with') handleDateFilterChange(true);
                else handleDateFilterChange(false);
              }}
            />

            {/* Clear filters button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllFilters}
                leftIcon="X"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      <div className={styles.resultsRow}>
        <span className={styles.resultsCount}>
          {isFiltered ? (
            <>
              Showing <strong>{filteredCount}</strong> of{' '}
              <strong>{totalCount}</strong> issues
            </>
          ) : (
            <>
              <strong>{totalCount}</strong>{' '}
              {totalCount === 1 ? 'issue' : 'issues'}
            </>
          )}
        </span>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className={styles.filterChips}>
            {filters.search && (
              <div className={styles.filterChip}>
                <span>Search: {filters.search}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue('');
                    onFilterChange({ search: '' });
                  }}
                  aria-label="Remove search filter"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {filters.status !== 'all' && (
              <div className={styles.filterChip}>
                <span>Status: {filters.status}</span>
                <button
                  type="button"
                  onClick={() => handleStatusChange('all')}
                  aria-label="Remove status filter"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {filters.priority !== 'all' && (
              <div className={styles.filterChip}>
                <span>Priority: {filters.priority}</span>
                <button
                  type="button"
                  onClick={() => handlePriorityChange('all')}
                  aria-label="Remove priority filter"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {filters.hasDate !== null && (
              <div className={styles.filterChip}>
                <span>
                  Date: {filters.hasDate ? 'With date' : 'Without date'}
                </span>
                <button
                  type="button"
                  onClick={() => handleDateFilterChange(null)}
                  aria-label="Remove date filter"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

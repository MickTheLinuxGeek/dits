import { useCallback, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import type { Issue } from '../../../mocks/types';
import type {
  SortField,
  SortDirection,
} from '../IssueListContainer/IssueListContainer';
import { Table, type TableColumn } from '../../organisms/Table';
import { StatusBadge } from '../../ui/StatusBadge';
import { PriorityIndicator } from '../../ui/PriorityIndicator';
import { Label } from '../../ui/Label';
import { Pagination } from '../Pagination';
import type { ColumnWidths } from '../../../hooks/useColumnResize';
import styles from './IssueTable.module.css';

export interface IssueTableProps {
  /** Issues to display */
  issues: Issue[];
  /** Loading state */
  isLoading?: boolean;
  /** Selected issue IDs */
  selectedIds: Set<string>;
  /** Callback when selection changes */
  onSelectionChange: (selectedIds: Set<string>) => void;
  /** Callback when an issue is clicked */
  onIssueClick?: (issue: Issue) => void;
  /** Current sort field */
  sortField: SortField;
  /** Current sort direction */
  sortDirection: SortDirection;
  /** Callback when sort changes */
  onSortChange: (field: SortField, direction: SortDirection) => void;
  /** Visible columns */
  visibleColumns?: string[];
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback to select all issues */
  onSelectAll?: (allPages: boolean) => void;
  /** Column widths from preferences */
  columnWidths?: ColumnWidths;
  /** Callback when column widths change */
  onColumnWidthsChange?: (widths: ColumnWidths) => void;
  /** Enable column resizing */
  resizable?: boolean;
}

/**
 * Table view for displaying issues with sortable columns.
 * Built on top of the generic Table component with issue-specific rendering.
 */
export function IssueTable({
  issues,
  isLoading = false,
  selectedIds,
  onSelectionChange,
  onIssueClick,
  sortField,
  sortDirection,
  onSortChange,
  visibleColumns = ['title', 'status', 'priority', 'labels', 'dueDate'],
  currentPage,
  totalPages,
  onPageChange,
  onSelectAll,
  columnWidths = {},
  onColumnWidthsChange,
  resizable = true,
}: IssueTableProps) {
  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return null;

    const now = new Date();
    const issueDate = new Date(date);
    const diffTime = issueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Past dates (overdue)
    if (diffDays < 0) {
      const absDays = Math.abs(diffDays);
      if (absDays === 1) return 'Yesterday';
      if (absDays <= 7) return `${absDays} days ago`;
      return issueDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }

    // Future dates
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;

    return issueDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Check if date is overdue
  const isOverdue = (date: Date | undefined) => {
    if (!date) return false;
    const now = new Date();
    const issueDate = new Date(date);
    return issueDate.getTime() < now.getTime();
  };

  // Default column widths (in pixels)
  const DEFAULT_COLUMN_WIDTHS = useMemo(
    () => ({
      id: 100,
      title: 300,
      status: 140,
      priority: 120,
      labels: 200,
      dueDate: 140,
      createdAt: 140,
      updatedAt: 140,
    }),
    [],
  );

  // Merge default widths with persisted widths
  const effectiveColumnWidths = useMemo(
    () => ({ ...DEFAULT_COLUMN_WIDTHS, ...columnWidths }),
    [DEFAULT_COLUMN_WIDTHS, columnWidths],
  );

  // Define all possible columns
  const allColumns: TableColumn<Issue>[] = useMemo(
    () => [
      {
        key: 'id',
        header: 'ID',
        sortable: false,
        width: `${effectiveColumnWidths.id}px`,
        render: (_, issue) => (
          <span className={styles.issueId}>{issue.id}</span>
        ),
      },
      {
        key: 'title',
        header: 'Title',
        sortable: true,
        width: `${effectiveColumnWidths.title}px`,
        accessor: (issue) => issue.title,
        render: (_, issue) => (
          <div className={styles.titleCell}>
            <span className={styles.title}>{issue.title}</span>
            {issue.description && (
              <span className={styles.description}>{issue.description}</span>
            )}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        width: `${effectiveColumnWidths.status}px`,
        accessor: (issue) => issue.status,
        render: (_, issue) => <StatusBadge status={issue.status} />,
      },
      {
        key: 'priority',
        header: 'Priority',
        sortable: true,
        width: `${effectiveColumnWidths.priority}px`,
        accessor: (issue) => issue.priority,
        render: (_, issue) => <PriorityIndicator priority={issue.priority} />,
      },
      {
        key: 'labels',
        header: 'Labels',
        sortable: false,
        width: `${effectiveColumnWidths.labels}px`,
        render: (_, issue) => (
          <div className={styles.labels}>
            {issue.labels.length > 0 ? (
              issue.labels.map((label) => (
                <Label key={label.id} name={label.name} color={label.color} />
              ))
            ) : (
              <span className={styles.noLabels}>—</span>
            )}
          </div>
        ),
      },
      {
        key: 'dueDate',
        header: 'Due Date',
        sortable: true,
        width: `${effectiveColumnWidths.dueDate}px`,
        accessor: (issue) => issue.dueDate,
        render: (_, issue) => {
          if (!issue.dueDate) {
            return <span className={styles.noDate}>—</span>;
          }

          const formatted = formatDate(issue.dueDate);
          const overdue = isOverdue(issue.dueDate);

          return (
            <div
              className={[styles.dueDate, overdue && styles.overdue]
                .filter(Boolean)
                .join(' ')}
            >
              <Calendar size={12} />
              <span>{formatted}</span>
            </div>
          );
        },
      },
      {
        key: 'createdAt',
        header: 'Created',
        sortable: true,
        width: `${effectiveColumnWidths.createdAt}px`,
        accessor: (issue) => issue.createdAt,
        render: (_, issue) => (
          <span className={styles.date}>
            {new Date(issue.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        key: 'updatedAt',
        header: 'Updated',
        sortable: true,
        width: `${effectiveColumnWidths.updatedAt}px`,
        accessor: (issue) => issue.updatedAt,
        render: (_, issue) => (
          <span className={styles.date}>
            {new Date(issue.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        ),
      },
    ],
    [effectiveColumnWidths],
  );

  // Filter columns based on visibility settings
  const columns = allColumns.filter((col) => visibleColumns.includes(col.key));

  // Handle sort change from table
  const handleTableSortChange = useCallback(
    (key: string, direction: 'asc' | 'desc') => {
      onSortChange(key as SortField, direction);
    },
    [onSortChange],
  );

  // Convert Set<string> to Set<string | number> for table component
  const selectedKeysForTable = new Set<string | number>(selectedIds);

  // Handle selection change from table
  const handleTableSelectionChange = useCallback(
    (keys: Set<string | number>) => {
      const stringKeys = new Set(Array.from(keys).map(String));
      onSelectionChange(stringKeys);
    },
    [onSelectionChange],
  );

  // Handle row click
  const handleRowClick = useCallback(
    (issue: Issue) => {
      onIssueClick?.(issue);
    },
    [onIssueClick],
  );

  return (
    <div className={styles.container}>
      <Table<Issue>
        columns={columns}
        data={issues}
        rowKey="id"
        selectable
        selectedKeys={selectedKeysForTable}
        onSelectionChange={handleTableSelectionChange}
        onRowClick={handleRowClick}
        defaultSortKey={sortField}
        defaultSortDirection={sortDirection}
        onSortChange={handleTableSortChange}
        isLoading={isLoading}
        emptyMessage="No issues found. Try adjusting your filters."
        size="md"
        striped
        hoverable
        resizable={resizable}
        columnWidths={effectiveColumnWidths}
        onColumnWidthsChange={onColumnWidthsChange}
      />

      {/* Pagination controls */}
      {!isLoading && issues.length > 0 && totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}

      {/* Select all banner (shown when some items selected on current page) */}
      {selectedIds.size > 0 &&
        selectedIds.size < issues.length &&
        onSelectAll && (
          <div className={styles.selectAllBanner}>
            <span>
              {selectedIds.size} {selectedIds.size === 1 ? 'issue' : 'issues'}{' '}
              selected
            </span>
            <button
              type="button"
              onClick={() => onSelectAll(true)}
              className={styles.selectAllButton}
            >
              Select all issues across all pages
            </button>
          </div>
        )}
    </div>
  );
}

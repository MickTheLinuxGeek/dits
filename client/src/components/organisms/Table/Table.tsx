import React, { useState, useMemo } from 'react';
import { Icon } from '@/components/atoms/Icon';
import styles from './Table.module.css';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T = unknown> {
  /** Unique identifier for the column */
  key: string;
  /** Display header text */
  header: string;
  /** Whether the column is sortable */
  sortable?: boolean;
  /** Custom render function for cell content */
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  /** Custom width (e.g., '100px', '20%', 'auto') */
  width?: string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Accessor function to get cell value from row */
  accessor?: (row: T) => unknown;
}

export interface TableProps<T = unknown> {
  /** Array of column definitions */
  columns: TableColumn<T>[];
  /** Array of data rows */
  data: T[];
  /** Key property name in data for unique row identification */
  rowKey?: string;
  /** Enable row selection */
  selectable?: boolean;
  /** Selected row keys */
  selectedKeys?: Set<string | number>;
  /** Callback when row selection changes */
  onSelectionChange?: (selectedKeys: Set<string | number>) => void;
  /** Callback when a row is clicked */
  onRowClick?: (row: T, index: number) => void;
  /** Initial sort column key */
  defaultSortKey?: string;
  /** Initial sort direction */
  defaultSortDirection?: Exclude<SortDirection, null>;
  /** Callback when sort changes */
  onSortChange?: (
    sortKey: string,
    sortDirection: Exclude<SortDirection, null>,
  ) => void;
  /** Show loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Table size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Enable striped rows */
  striped?: boolean;
  /** Enable hover effect on rows */
  hoverable?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Table component with sorting, selection, and customizable columns.
 * Optimized for displaying issues and other structured data.
 */
export function Table<T = unknown>({
  columns,
  data,
  rowKey = 'id',
  selectable = false,
  selectedKeys = new Set(),
  onSelectionChange,
  onRowClick,
  defaultSortKey,
  defaultSortDirection = 'asc',
  onSortChange,
  isLoading = false,
  emptyMessage = 'No data available',
  size = 'md',
  striped = false,
  hoverable = true,
  className,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] =
    useState<Exclude<SortDirection, null>>(defaultSortDirection);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    const column = columns.find((col) => col.key === sortKey);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const aRecord = a as unknown as Record<string, unknown>;
      const bRecord = b as unknown as Record<string, unknown>;
      const aValue = column.accessor ? column.accessor(a) : aRecord[sortKey];
      const bValue = column.accessor ? column.accessor(b) : bRecord[sortKey];

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (aValue == null) comparison = 1;
      else if (bValue == null) comparison = -1;
      else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = aValue < bValue ? -1 : 1;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection, columns]);

  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    let newDirection: Exclude<SortDirection, null> = 'asc';

    if (sortKey === columnKey) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }

    setSortKey(columnKey);
    setSortDirection(newDirection);
    onSortChange?.(columnKey, newDirection);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (selectedKeys.size === data.length) {
      onSelectionChange(new Set());
    } else {
      const allKeys = new Set(
        data.map((row: T) => {
          const record = row as unknown as Record<string, unknown>;
          return record[rowKey as string] as string | number;
        }),
      );
      onSelectionChange(allKeys);
    }
  };

  const handleSelectRow = (key: string | number) => {
    if (!onSelectionChange) return;

    const newSelectedKeys = new Set(selectedKeys);
    if (newSelectedKeys.has(key)) {
      newSelectedKeys.delete(key);
    } else {
      newSelectedKeys.add(key);
    }
    onSelectionChange(newSelectedKeys);
  };

  const getCellValue = (row: T, column: TableColumn<T>) => {
    if (column.accessor) return column.accessor(row);
    const record = row as unknown as Record<string, unknown>;
    return record[column.key];
  };

  const tableClasses = [
    styles.table,
    styles[size],
    striped && styles.striped,
    hoverable && styles.hoverable,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const allSelected = data.length > 0 && selectedKeys.size === data.length;
  const someSelected = selectedKeys.size > 0 && selectedKeys.size < data.length;

  return (
    <div className={styles.tableContainer}>
      <table className={tableClasses}>
        <thead className={styles.thead}>
          <tr>
            {selectable && (
              <th className={styles.th} style={{ width: '3rem' }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                  className={styles.checkbox}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={[
                  styles.th,
                  column.sortable && styles.sortable,
                  column.align && styles[`align-${column.align}`],
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className={styles.thContent}>
                  <span>{column.header}</span>
                  {column.sortable && (
                    <span className={styles.sortIcon}>
                      {sortKey === column.key ? (
                        <Icon
                          name={
                            sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'
                          }
                          aria-label={`Sorted ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
                        />
                      ) : (
                        <Icon
                          name="ArrowUpDown"
                          className={styles.sortIconInactive}
                          aria-label="Sortable"
                        />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className={styles.loading}
              >
                <Icon name="Loader" className={styles.loadingIcon} />
                <span>Loading...</span>
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className={styles.empty}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row: T, rowIndex) => {
              const record = row as unknown as Record<string, unknown>;
              const key = record[rowKey as string] as string | number;
              const isSelected = selectedKeys.has(key);

              return (
                <tr
                  key={key}
                  className={[
                    styles.tr,
                    isSelected && styles.selected,
                    onRowClick && styles.clickable,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {selectable && (
                    <td className={styles.td}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectRow(key);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select row ${rowIndex + 1}`}
                        className={styles.checkbox}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={[
                        styles.td,
                        column.align && styles[`align-${column.align}`],
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {column.render
                        ? column.render(
                            getCellValue(row, column),
                            row,
                            rowIndex,
                          )
                        : (getCellValue(row, column) as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

Table.displayName = 'Table';

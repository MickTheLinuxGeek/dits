import { useCallback, useRef, useState, useEffect } from 'react';

export interface ColumnWidths {
  [columnKey: string]: number;
}

export interface UseColumnResizeOptions {
  /** Minimum column width in pixels */
  minWidth?: number;
  /** Maximum column width in pixels */
  maxWidth?: number;
  /** Initial column widths */
  initialWidths?: ColumnWidths;
  /** Callback when column widths change */
  onWidthsChange?: (widths: ColumnWidths) => void;
}

export interface UseColumnResizeReturn {
  /** Current column widths */
  columnWidths: ColumnWidths;
  /** Callback to start resizing a column */
  startResize: (columnKey: string, startX: number) => void;
  /** Whether a column is currently being resized */
  isResizing: boolean;
  /** Key of the column currently being resized */
  resizingColumn: string | null;
  /** Reset column widths to initial values */
  resetWidths: () => void;
  /** Update a specific column width */
  setColumnWidth: (columnKey: string, width: number) => void;
}

/**
 * Custom hook for managing column resizing in tables.
 *
 * Handles mouse/touch events for resizing, enforces min/max constraints,
 * and provides callbacks for persistence.
 *
 * @example
 * ```tsx
 * const { columnWidths, startResize, isResizing } = useColumnResize({
 *   minWidth: 100,
 *   initialWidths: { title: 300, status: 140 },
 *   onWidthsChange: (widths) => saveToLocalStorage(widths),
 * });
 *
 * // In column header render:
 * <div onMouseDown={(e) => startResize('title', e.clientX)}>
 *   Resize Handle
 * </div>
 * ```
 */
export function useColumnResize({
  minWidth = 100,
  maxWidth = 1000,
  initialWidths = {},
  onWidthsChange,
}: UseColumnResizeOptions = {}): UseColumnResizeReturn {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(initialWidths);
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);

  // Use refs to avoid stale closures in mouse event handlers
  const resizeStateRef = useRef({
    columnKey: '',
    startX: 0,
    startWidth: 0,
  });

  // Notify when widths change
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      onWidthsChange?.(columnWidths);
    }
  }, [columnWidths, onWidthsChange]);

  // Handle mouse move during resize
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizingColumn) return;

      const { startX, startWidth } = resizeStateRef.current;
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, startWidth + deltaX),
      );

      setColumnWidths((prev) => ({
        ...prev,
        [resizingColumn]: newWidth,
      }));
    },
    [isResizing, resizingColumn, minWidth, maxWidth],
  );

  // Handle mouse up to end resize
  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      setResizingColumn(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, [isResizing]);

  // Set up and clean up mouse event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Prevent text selection during resize
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Start resizing a column
  const startResize = useCallback(
    (columnKey: string, startX: number) => {
      const currentWidth = columnWidths[columnKey] || minWidth;

      resizeStateRef.current = {
        columnKey,
        startX,
        startWidth: currentWidth,
      };

      setIsResizing(true);
      setResizingColumn(columnKey);
    },
    [columnWidths, minWidth],
  );

  // Reset all column widths to initial values
  const resetWidths = useCallback(() => {
    setColumnWidths(initialWidths);
  }, [initialWidths]);

  // Update a specific column width programmatically
  const setColumnWidth = useCallback(
    (columnKey: string, width: number) => {
      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, width));
      setColumnWidths((prev) => ({
        ...prev,
        [columnKey]: constrainedWidth,
      }));
    },
    [minWidth, maxWidth],
  );

  return {
    columnWidths,
    startResize,
    isResizing,
    resizingColumn,
    resetWidths,
    setColumnWidth,
  };
}

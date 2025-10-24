import React, { useState } from 'react';
import { Eye, EyeOff, GripVertical } from 'lucide-react';
import { Button } from '../../atoms/Button';
import styles from './ColumnCustomizer.module.css';

export interface ColumnDefinition {
  key: string;
  label: string;
  visible: boolean;
  locked?: boolean; // Columns that can't be hidden
}

export interface ColumnCustomizerProps {
  /** Current column configuration */
  columns: ColumnDefinition[];
  /** Callback when columns change */
  onColumnsChange: (columns: ColumnDefinition[]) => void;
  /** Callback to reset to defaults */
  onReset?: () => void;
}

/**
 * Column customization component for showing/hiding and reordering table columns.
 * Provides drag-and-drop reordering and toggle visibility controls.
 */
export function ColumnCustomizer({
  columns,
  onColumnsChange,
  onReset,
}: ColumnCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Toggle column visibility
  const handleToggleVisibility = (key: string) => {
    const updatedColumns = columns.map((col) =>
      col.key === key ? { ...col, visible: !col.visible } : col,
    );
    onColumnsChange(updatedColumns);
  };

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedColumns = [...columns];
    const [draggedColumn] = updatedColumns.splice(draggedIndex, 1);
    updatedColumns.splice(dropIndex, 0, draggedColumn);

    onColumnsChange(updatedColumns);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Show all columns
  const handleShowAll = () => {
    const updatedColumns = columns.map((col) => ({ ...col, visible: true }));
    onColumnsChange(updatedColumns);
  };

  // Hide all non-locked columns
  const handleHideAll = () => {
    const updatedColumns = columns.map((col) => ({
      ...col,
      visible: col.locked || false,
    }));
    onColumnsChange(updatedColumns);
  };

  // Count visible columns
  const visibleCount = columns.filter((col) => col.visible).length;

  return (
    <div className={styles.container}>
      {/* Trigger button */}
      <Button
        variant="outline"
        size="sm"
        leftIcon="Settings"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Customize columns"
        aria-expanded={isOpen}
      >
        Columns
        <span className={styles.count}>({visibleCount})</span>
      </Button>

      {/* Dropdown panel */}
      {isOpen && (
        <>
          {/* Backdrop to close on outside click */}
          <div
            className={styles.backdrop}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            className={styles.panel}
            role="dialog"
            aria-label="Column customization"
          >
            {/* Header */}
            <div className={styles.header}>
              <h3 className={styles.title}>Customize Columns</h3>
              <div className={styles.headerActions}>
                <button
                  type="button"
                  onClick={handleShowAll}
                  className={styles.link}
                >
                  Show all
                </button>
                <span className={styles.separator}>|</span>
                <button
                  type="button"
                  onClick={handleHideAll}
                  className={styles.link}
                >
                  Hide all
                </button>
                {onReset && (
                  <>
                    <span className={styles.separator}>|</span>
                    <button
                      type="button"
                      onClick={onReset}
                      className={styles.link}
                    >
                      Reset
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Column list */}
            <div className={styles.columnList}>
              {columns.map((column, index) => (
                <div
                  key={column.key}
                  className={[
                    styles.columnItem,
                    draggedIndex === index && styles.dragging,
                    dragOverIndex === index && styles.dragOver,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  draggable={!column.locked}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  {/* Drag handle */}
                  {!column.locked && (
                    <div
                      className={styles.dragHandle}
                      aria-label="Drag to reorder"
                    >
                      <GripVertical size={16} />
                    </div>
                  )}

                  {/* Column label */}
                  <span className={styles.columnLabel}>{column.label}</span>

                  {/* Visibility toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(column.key)}
                    className={styles.visibilityToggle}
                    disabled={column.locked}
                    aria-label={`${column.visible ? 'Hide' : 'Show'} ${column.label} column`}
                  >
                    {column.visible ? (
                      <Eye size={16} />
                    ) : (
                      <EyeOff size={16} className={styles.hidden} />
                    )}
                  </button>

                  {/* Locked indicator */}
                  {column.locked && (
                    <span className={styles.lockedBadge}>Required</span>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className={styles.footer}>
              <p className={styles.hint}>
                Drag columns to reorder • Click eye icon to show/hide
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

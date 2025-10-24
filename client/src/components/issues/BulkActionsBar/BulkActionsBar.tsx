import { useState } from 'react';
import { X } from 'lucide-react';
import type { IssueStatus, IssuePriority } from '../../../mocks/types';
import { Button } from '../../atoms/Button';
import styles from './BulkActionsBar.module.css';

export interface BulkActionsBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Callback to clear selection */
  onClearSelection: () => void;
  /** Callback to delete selected issues */
  onDelete: () => void;
  /** Callback to change status of selected issues */
  onStatusChange: (status: IssueStatus) => void;
  /** Callback to change priority of selected issues */
  onPriorityChange: (priority: IssuePriority) => void;
}

/**
 * Bulk actions bar component that appears when issues are selected.
 * Provides quick actions for multiple issues at once.
 */
export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onDelete,
  onStatusChange,
  onPriorityChange,
}: BulkActionsBarProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusChange = (status: IssueStatus) => {
    onStatusChange(status);
    setShowStatusMenu(false);
  };

  const handlePriorityChange = (priority: IssuePriority) => {
    onPriorityChange(priority);
    setShowPriorityMenu(false);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
      setShowDeleteConfirm(false);
    } else {
      // Close dropdowns and show confirmation
      setShowStatusMenu(false);
      setShowPriorityMenu(false);
      setShowDeleteConfirm(true);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className={styles.container} role="toolbar" aria-label="Bulk actions">
      <div className={styles.leftSection}>
        {/* Selection count */}
        <div className={styles.selectionInfo}>
          <span className={styles.count}>{selectedCount}</span>
          <span className={styles.label}>
            {selectedCount === 1 ? 'issue' : 'issues'} selected
          </span>
        </div>

        {/* Clear selection button */}
        <button
          type="button"
          onClick={onClearSelection}
          className={styles.clearButton}
          aria-label="Clear selection"
        >
          <X size={16} />
        </button>
      </div>

      <div className={styles.actions}>
        {/* Status change dropdown */}
        <div className={styles.dropdownContainer}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowStatusMenu(!showStatusMenu);
              setShowPriorityMenu(false);
              setShowDeleteConfirm(false);
            }}
            aria-expanded={showStatusMenu}
            aria-haspopup="menu"
          >
            Change Status
          </Button>
          {showStatusMenu && (
            <div className={styles.dropdown} role="menu">
              <button
                type="button"
                onClick={() => handleStatusChange('Todo')}
                className={styles.dropdownItem}
                role="menuitem"
              >
                Todo
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('In Progress')}
                className={styles.dropdownItem}
                role="menuitem"
              >
                In Progress
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('Review')}
                className={styles.dropdownItem}
                role="menuitem"
              >
                Review
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('Done')}
                className={styles.dropdownItem}
                role="menuitem"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Priority change dropdown */}
        <div className={styles.dropdownContainer}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowPriorityMenu(!showPriorityMenu);
              setShowStatusMenu(false);
              setShowDeleteConfirm(false);
            }}
            aria-expanded={showPriorityMenu}
            aria-haspopup="menu"
          >
            Change Priority
          </Button>
          {showPriorityMenu && (
            <div className={styles.dropdown} role="menu">
              <button
                type="button"
                onClick={() => handlePriorityChange('Urgent')}
                className={styles.dropdownItem}
                role="menuitem"
              >
                <span className={styles.priorityDot} data-priority="urgent" />
                Urgent
              </button>
              <button
                type="button"
                onClick={() => handlePriorityChange('High')}
                className={styles.dropdownItem}
                role="menuitem"
              >
                <span className={styles.priorityDot} data-priority="high" />
                High
              </button>
              <button
                type="button"
                onClick={() => handlePriorityChange('Medium')}
                className={styles.dropdownItem}
                role="menuitem"
              >
                <span className={styles.priorityDot} data-priority="medium" />
                Medium
              </button>
              <button
                type="button"
                onClick={() => handlePriorityChange('Low')}
                className={styles.dropdownItem}
                role="menuitem"
              >
                <span className={styles.priorityDot} data-priority="low" />
                Low
              </button>
            </div>
          )}
        </div>

        {/* Delete button with confirmation */}
        {showDeleteConfirm ? (
          <div className={styles.deleteConfirm}>
            <span className={styles.deleteWarning}>
              Delete {selectedCount} {selectedCount === 1 ? 'issue' : 'issues'}?
            </span>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              leftIcon="Trash2"
            >
              Confirm
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancelDelete}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            leftIcon="Trash2"
            aria-label="Delete selected issues"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

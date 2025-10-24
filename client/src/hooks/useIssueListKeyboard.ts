import { useEffect, useCallback, useRef, useState } from 'react';

export interface KeyboardNavigationOptions {
  /** Issues available for navigation */
  issues: { id: string }[];
  /** Currently selected issue IDs */
  selectedIds: Set<string>;
  /** Callback when selection changes */
  onSelectionChange: (selectedIds: Set<string>) => void;
  /** Callback when an issue is activated (Enter key) */
  onIssueActivate?: (issueId: string) => void;
  /** Callback when delete is requested */
  onDelete?: () => void;
  /** Whether the list is currently focused */
  isActive: boolean;
}

/**
 * Custom hook for keyboard navigation in issue lists.
 * Provides arrow key navigation, multi-select with Shift, and keyboard shortcuts.
 */
export function useIssueListKeyboard({
  issues,
  selectedIds,
  onSelectionChange,
  onIssueActivate,
  onDelete,
  isActive,
}: KeyboardNavigationOptions) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const lastSelectedIndexRef = useRef<number>(-1);

  // Find issue index by ID
  const getIssueIndex = useCallback(
    (issueId: string) => {
      return issues.findIndex((issue) => issue.id === issueId);
    },
    [issues],
  );

  // Get focused issue ID
  const getFocusedIssueId = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < issues.length) {
      return issues[focusedIndex].id;
    }
    return null;
  }, [focusedIndex, issues]);

  // Move focus up
  const moveFocusUp = useCallback(() => {
    setFocusedIndex((prev) => {
      if (prev <= 0) return 0;
      return prev - 1;
    });
  }, []);

  // Move focus down
  const moveFocusDown = useCallback(() => {
    setFocusedIndex((prev) => {
      if (prev >= issues.length - 1) return issues.length - 1;
      return prev + 1;
    });
  }, [issues.length]);

  // Toggle selection of focused item
  const toggleFocusedSelection = useCallback(() => {
    const issueId = getFocusedIssueId();
    if (!issueId) return;

    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(issueId)) {
      newSelectedIds.delete(issueId);
    } else {
      newSelectedIds.add(issueId);
    }
    onSelectionChange(newSelectedIds);
    lastSelectedIndexRef.current = focusedIndex;
  }, [focusedIndex, getFocusedIssueId, selectedIds, onSelectionChange]);

  // Select range from last selected to focused
  const selectRange = useCallback(() => {
    if (focusedIndex < 0) return;

    const startIndex = Math.min(lastSelectedIndexRef.current, focusedIndex);
    const endIndex = Math.max(lastSelectedIndexRef.current, focusedIndex);

    const newSelectedIds = new Set(selectedIds);
    for (let i = startIndex; i <= endIndex; i++) {
      if (i >= 0 && i < issues.length) {
        newSelectedIds.add(issues[i].id);
      }
    }
    onSelectionChange(newSelectedIds);
  }, [focusedIndex, issues, selectedIds, onSelectionChange]);

  // Select all issues
  const selectAll = useCallback(() => {
    const allIds = new Set(issues.map((issue) => issue.id));
    onSelectionChange(allIds);
  }, [issues, onSelectionChange]);

  // Clear selection
  const clearSelection = useCallback(() => {
    onSelectionChange(new Set());
  }, [onSelectionChange]);

  // Activate focused issue (open/edit)
  const activateFocused = useCallback(() => {
    const issueId = getFocusedIssueId();
    if (issueId && onIssueActivate) {
      onIssueActivate(issueId);
    }
  }, [getFocusedIssueId, onIssueActivate]);

  // Handle keyboard events
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Navigation keys
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (e.shiftKey) {
          moveFocusDown();
          selectRange();
        } else {
          moveFocusDown();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (e.shiftKey) {
          moveFocusUp();
          selectRange();
        } else {
          moveFocusUp();
        }
      }
      // Jump to start/end
      else if (e.key === 'Home') {
        e.preventDefault();
        setFocusedIndex(0);
        if (e.shiftKey) {
          selectRange();
        }
      } else if (e.key === 'End') {
        e.preventDefault();
        setFocusedIndex(issues.length - 1);
        if (e.shiftKey) {
          selectRange();
        }
      }
      // Selection
      else if (e.key === ' ') {
        e.preventDefault();
        toggleFocusedSelection();
      }
      // Activate (open/edit)
      else if (e.key === 'Enter') {
        e.preventDefault();
        activateFocused();
      }
      // Select all
      else if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        selectAll();
      }
      // Clear selection
      else if (e.key === 'Escape') {
        e.preventDefault();
        clearSelection();
      }
      // Delete
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.size > 0 && onDelete) {
          e.preventDefault();
          onDelete();
        }
      }
      // Vim-style navigation (j/k)
      else if (e.key === 'j' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        moveFocusDown();
      } else if (e.key === 'k' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        moveFocusUp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isActive,
    moveFocusUp,
    moveFocusDown,
    toggleFocusedSelection,
    selectRange,
    selectAll,
    clearSelection,
    activateFocused,
    selectedIds,
    onDelete,
    issues.length,
  ]);

  // Initialize focus to first selected item or first item
  useEffect(() => {
    if (focusedIndex === -1 && issues.length > 0) {
      if (selectedIds.size > 0) {
        const firstSelectedId = Array.from(selectedIds)[0];
        const index = getIssueIndex(firstSelectedId);
        if (index >= 0) {
          setFocusedIndex(index);
          lastSelectedIndexRef.current = index;
        } else {
          setFocusedIndex(0);
        }
      } else {
        setFocusedIndex(0);
      }
    }
  }, [focusedIndex, issues.length, selectedIds, getIssueIndex]);

  // Reset focus when issues change significantly
  useEffect(() => {
    if (focusedIndex >= issues.length) {
      setFocusedIndex(Math.max(0, issues.length - 1));
    }
  }, [issues.length, focusedIndex]);

  return {
    focusedIndex,
    focusedIssueId: getFocusedIssueId(),
    setFocusedIndex,
    moveFocusUp,
    moveFocusDown,
    toggleFocusedSelection,
    selectAll,
    clearSelection,
    activateFocused,
  };
}

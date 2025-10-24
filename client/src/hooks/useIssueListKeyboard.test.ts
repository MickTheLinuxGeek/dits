import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useIssueListKeyboard } from './useIssueListKeyboard';

describe('useIssueListKeyboard', () => {
  const mockIssues = [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
  ];

  const defaultProps = {
    issues: mockIssues,
    selectedIds: new Set<string>(),
    onSelectionChange: vi.fn(),
    isActive: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with first item focused', () => {
    const { result } = renderHook(() => useIssueListKeyboard(defaultProps));

    expect(result.current.focusedIndex).toBe(0);
    expect(result.current.focusedIssueId).toBe('1');
  });

  it('moves focus down with ArrowDown', () => {
    const { result } = renderHook(() => useIssueListKeyboard(defaultProps));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });

    expect(result.current.focusedIndex).toBe(1);
    expect(result.current.focusedIssueId).toBe('2');
  });

  it('moves focus up with ArrowUp', () => {
    const { result } = renderHook(() => useIssueListKeyboard(defaultProps));

    // First move down
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });

    // Then move up
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    });

    expect(result.current.focusedIndex).toBe(0);
    expect(result.current.focusedIssueId).toBe('1');
  });

  it('does not move focus beyond first item with ArrowUp', () => {
    const { result } = renderHook(() => useIssueListKeyboard(defaultProps));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    });

    expect(result.current.focusedIndex).toBe(0);
  });

  it('does not move focus beyond last item with ArrowDown', () => {
    const { result } = renderHook(() => useIssueListKeyboard(defaultProps));

    // Move to last item
    act(() => {
      for (let i = 0; i < 10; i++) {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowDown' }),
        );
      }
    });

    expect(result.current.focusedIndex).toBe(4); // Last index
  });

  it('jumps to first item with Home', () => {
    const { result } = renderHook(() => useIssueListKeyboard(defaultProps));

    // Move down a few times
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });

    // Jump to start
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    });

    expect(result.current.focusedIndex).toBe(0);
  });

  it('jumps to last item with End', () => {
    const { result } = renderHook(() => useIssueListKeyboard(defaultProps));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    });

    expect(result.current.focusedIndex).toBe(4);
  });

  it('toggles selection with Space', () => {
    const onSelectionChange = vi.fn();
    renderHook(() =>
      useIssueListKeyboard({ ...defaultProps, onSelectionChange }),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    });

    expect(onSelectionChange).toHaveBeenCalledWith(new Set(['1']));
  });

  it('selects all with Ctrl+A', () => {
    const onSelectionChange = vi.fn();
    renderHook(() =>
      useIssueListKeyboard({ ...defaultProps, onSelectionChange }),
    );

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'a', ctrlKey: true }),
      );
    });

    expect(onSelectionChange).toHaveBeenCalledWith(
      new Set(['1', '2', '3', '4', '5']),
    );
  });

  it('selects all with Cmd+A (Mac)', () => {
    const onSelectionChange = vi.fn();
    renderHook(() =>
      useIssueListKeyboard({ ...defaultProps, onSelectionChange }),
    );

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'a', metaKey: true }),
      );
    });

    expect(onSelectionChange).toHaveBeenCalledWith(
      new Set(['1', '2', '3', '4', '5']),
    );
  });

  it('clears selection with Escape', () => {
    const onSelectionChange = vi.fn();
    const selectedIds = new Set(['1', '2']);
    renderHook(() =>
      useIssueListKeyboard({ ...defaultProps, selectedIds, onSelectionChange }),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(onSelectionChange).toHaveBeenCalledWith(new Set());
  });

  it('activates focused item with Enter', () => {
    const onIssueActivate = vi.fn();
    renderHook(() =>
      useIssueListKeyboard({ ...defaultProps, onIssueActivate }),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(onIssueActivate).toHaveBeenCalledWith('1');
  });

  it('calls onDelete with Delete key when items are selected', () => {
    const onDelete = vi.fn();
    const selectedIds = new Set(['1', '2']);
    renderHook(() =>
      useIssueListKeyboard({ ...defaultProps, selectedIds, onDelete }),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
    });

    expect(onDelete).toHaveBeenCalled();
  });

  it('calls onDelete with Backspace key when items are selected', () => {
    const onDelete = vi.fn();
    const selectedIds = new Set(['1', '2']);
    renderHook(() =>
      useIssueListKeyboard({ ...defaultProps, selectedIds, onDelete }),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    });

    expect(onDelete).toHaveBeenCalled();
  });

  it('does not call onDelete when no items are selected', () => {
    const onDelete = vi.fn();
    renderHook(() => useIssueListKeyboard({ ...defaultProps, onDelete }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
    });

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('supports vim-style navigation with j (down)', () => {
    const { result } = renderHook(() => useIssueListKeyboard(defaultProps));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' }));
    });

    expect(result.current.focusedIndex).toBe(1);
  });

  it('supports vim-style navigation with k (up)', () => {
    const { result } = renderHook(() => useIssueListKeyboard(defaultProps));

    // Move down first
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' }));
    });

    // Then move up
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
    });

    expect(result.current.focusedIndex).toBe(0);
  });

  it('does not respond to keyboard events when inactive', () => {
    const { result } = renderHook(() =>
      useIssueListKeyboard({ ...defaultProps, isActive: false }),
    );

    const initialIndex = result.current.focusedIndex;

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });

    expect(result.current.focusedIndex).toBe(initialIndex);
  });

  it('initializes focus to first selected item if any', () => {
    const selectedIds = new Set(['3']);
    const { result } = renderHook(() =>
      useIssueListKeyboard({ ...defaultProps, selectedIds }),
    );

    expect(result.current.focusedIndex).toBe(2);
    expect(result.current.focusedIssueId).toBe('3');
  });

  it('adjusts focus when issues list changes and focused index is out of bounds', () => {
    const { result, rerender } = renderHook(
      (props) => useIssueListKeyboard(props),
      { initialProps: defaultProps },
    );

    // Move to last item
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    });

    expect(result.current.focusedIndex).toBe(4);

    // Reduce issues list
    const shorterIssues = [{ id: '1' }, { id: '2' }];
    rerender({ ...defaultProps, issues: shorterIssues });

    // Focus should adjust to last available item
    expect(result.current.focusedIndex).toBe(1);
  });

  it('toggles selection correctly when pressing space multiple times', () => {
    const onSelectionChange = vi.fn();
    const { rerender } = renderHook((props) => useIssueListKeyboard(props), {
      initialProps: { ...defaultProps, onSelectionChange },
    });

    // First press - select
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    });

    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['1']));

    // Update selected state
    const selectedIds = new Set(['1']);
    rerender({ ...defaultProps, selectedIds, onSelectionChange });

    // Second press - deselect
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    });

    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set());
  });
});

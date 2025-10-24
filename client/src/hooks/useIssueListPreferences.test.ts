import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useIssueListPreferences } from './useIssueListPreferences';

describe('useIssueListPreferences', () => {
  const STORAGE_KEY = 'dits_issue_list_preferences';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes with default preferences', () => {
    const { result } = renderHook(() => useIssueListPreferences());

    expect(result.current.preferences).toEqual({
      sortField: 'createdAt',
      sortDirection: 'desc',
      visibleColumns: ['title', 'status', 'priority', 'labels', 'dueDate'],
      itemsPerPage: 50,
      viewMode: 'table',
      columnWidths: {},
    });
  });

  it('loads preferences from localStorage on mount', () => {
    const savedPreferences = {
      sortField: 'title',
      sortDirection: 'asc' as const,
      visibleColumns: ['title', 'status'],
      itemsPerPage: 25,
      viewMode: 'board' as const,
      columnWidths: { title: 300, status: 150 },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPreferences));

    const { result } = renderHook(() => useIssueListPreferences());

    expect(result.current.preferences).toEqual(savedPreferences);
  });

  it('updates preferences partially', () => {
    const { result } = renderHook(() => useIssueListPreferences());

    act(() => {
      result.current.updatePreferences({ sortField: 'priority' });
    });

    expect(result.current.preferences.sortField).toBe('priority');
    expect(result.current.preferences.sortDirection).toBe('desc'); // unchanged
  });

  it('persists preferences to localStorage when updated', () => {
    const { result } = renderHook(() => useIssueListPreferences());

    act(() => {
      result.current.updatePreferences({
        sortField: 'dueDate',
        sortDirection: 'asc',
      });
    });

    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.sortField).toBe('dueDate');
    expect(parsed.sortDirection).toBe('asc');
  });

  it('resets preferences to defaults', () => {
    const { result } = renderHook(() => useIssueListPreferences());

    act(() => {
      result.current.updatePreferences({
        sortField: 'title',
        itemsPerPage: 100,
      });
    });

    expect(result.current.preferences.sortField).toBe('title');
    expect(result.current.preferences.itemsPerPage).toBe(100);

    act(() => {
      result.current.resetPreferences();
    });

    expect(result.current.preferences).toEqual({
      sortField: 'createdAt',
      sortDirection: 'desc',
      visibleColumns: ['title', 'status', 'priority', 'labels', 'dueDate'],
      itemsPerPage: 50,
      viewMode: 'table',
      columnWidths: {},
    });
  });

  it('updates visible columns', () => {
    const { result } = renderHook(() => useIssueListPreferences());

    act(() => {
      result.current.updateVisibleColumns(['title', 'priority']);
    });

    expect(result.current.preferences.visibleColumns).toEqual([
      'title',
      'priority',
    ]);
  });

  it('updates sort settings', () => {
    const { result } = renderHook(() => useIssueListPreferences());

    act(() => {
      result.current.updateSort('status', 'asc');
    });

    expect(result.current.preferences.sortField).toBe('status');
    expect(result.current.preferences.sortDirection).toBe('asc');
  });

  it('updates items per page', () => {
    const { result } = renderHook(() => useIssueListPreferences());

    act(() => {
      result.current.updateItemsPerPage(100);
    });

    expect(result.current.preferences.itemsPerPage).toBe(100);
  });

  it('updates view mode', () => {
    const { result } = renderHook(() => useIssueListPreferences());

    act(() => {
      result.current.updateViewMode('board');
    });

    expect(result.current.preferences.viewMode).toBe('board');
  });

  it('updates column widths', () => {
    const { result } = renderHook(() => useIssueListPreferences());

    act(() => {
      result.current.updateColumnWidths({ title: 350, status: 160 });
    });

    expect(result.current.preferences.columnWidths).toEqual({
      title: 350,
      status: 160,
    });
  });

  it('merges stored preferences with defaults for missing fields', () => {
    // Simulate old stored preferences missing new fields
    const partialPreferences = {
      sortField: 'title',
      sortDirection: 'asc',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(partialPreferences));

    const { result } = renderHook(() => useIssueListPreferences());

    // Should have stored values plus defaults for missing fields
    expect(result.current.preferences.sortField).toBe('title');
    expect(result.current.preferences.sortDirection).toBe('asc');
    expect(result.current.preferences.visibleColumns).toEqual([
      'title',
      'status',
      'priority',
      'labels',
      'dueDate',
    ]);
    expect(result.current.preferences.itemsPerPage).toBe(50);
    expect(result.current.preferences.viewMode).toBe('table');
    expect(result.current.preferences.columnWidths).toEqual({});
  });

  it('handles corrupted localStorage data gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid json{{{');

    const { result } = renderHook(() => useIssueListPreferences());

    // Should fall back to defaults
    expect(result.current.preferences).toEqual({
      sortField: 'createdAt',
      sortDirection: 'desc',
      visibleColumns: ['title', 'status', 'priority', 'labels', 'dueDate'],
      itemsPerPage: 50,
      viewMode: 'table',
      columnWidths: {},
    });
  });
});

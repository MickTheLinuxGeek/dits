import { renderHook, act } from '@testing-library/react';
import { useColumnResize } from './useColumnResize';

describe('useColumnResize', () => {
  beforeEach(() => {
    // Clear body styles before each test
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  afterEach(() => {
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });

  it('should initialize with default options', () => {
    const { result } = renderHook(() => useColumnResize());

    expect(result.current.columnWidths).toEqual({});
    expect(result.current.isResizing).toBe(false);
    expect(result.current.resizingColumn).toBeNull();
  });

  it('should initialize with provided column widths', () => {
    const initialWidths = { col1: 200, col2: 300 };
    const { result } = renderHook(() => useColumnResize({ initialWidths }));

    expect(result.current.columnWidths).toEqual(initialWidths);
  });

  it('should start resizing a column', () => {
    const { result } = renderHook(() =>
      useColumnResize({ initialWidths: { col1: 200 } }),
    );

    act(() => {
      result.current.startResize('col1', 100);
    });

    expect(result.current.isResizing).toBe(true);
    expect(result.current.resizingColumn).toBe('col1');
  });

  it('should apply body styles when resizing', () => {
    const { result } = renderHook(() =>
      useColumnResize({ initialWidths: { col1: 200 } }),
    );

    act(() => {
      result.current.startResize('col1', 100);
    });

    expect(document.body.style.cursor).toBe('col-resize');
    expect(document.body.style.userSelect).toBe('none');
  });

  it('should set column width programmatically', () => {
    const { result } = renderHook(() => useColumnResize());

    act(() => {
      result.current.setColumnWidth('col1', 250);
    });

    expect(result.current.columnWidths).toEqual({ col1: 250 });
  });

  it('should enforce minimum width constraint', () => {
    const { result } = renderHook(() => useColumnResize({ minWidth: 100 }));

    act(() => {
      result.current.setColumnWidth('col1', 50);
    });

    expect(result.current.columnWidths).toEqual({ col1: 100 });
  });

  it('should enforce maximum width constraint', () => {
    const { result } = renderHook(() => useColumnResize({ maxWidth: 500 }));

    act(() => {
      result.current.setColumnWidth('col1', 700);
    });

    expect(result.current.columnWidths).toEqual({ col1: 500 });
  });

  it('should reset widths to initial values', () => {
    const initialWidths = { col1: 200, col2: 300 };
    const { result } = renderHook(() => useColumnResize({ initialWidths }));

    // Change widths
    act(() => {
      result.current.setColumnWidth('col1', 400);
    });

    expect(result.current.columnWidths).toEqual({ col1: 400, col2: 300 });

    // Reset
    act(() => {
      result.current.resetWidths();
    });

    expect(result.current.columnWidths).toEqual(initialWidths);
  });

  it('should call onWidthsChange callback when widths change', () => {
    const onWidthsChange = vi.fn();
    const { result } = renderHook(() => useColumnResize({ onWidthsChange }));

    act(() => {
      result.current.setColumnWidth('col1', 250);
    });

    expect(onWidthsChange).toHaveBeenCalledWith({ col1: 250 });
  });

  it('should handle resizing for columns with no initial width', () => {
    const { result } = renderHook(() => useColumnResize({ minWidth: 100 }));

    act(() => {
      result.current.startResize('newCol', 200);
    });

    expect(result.current.isResizing).toBe(true);
    expect(result.current.resizingColumn).toBe('newCol');
  });

  it('should allow updating multiple columns', () => {
    const { result } = renderHook(() => useColumnResize());

    act(() => {
      result.current.setColumnWidth('col1', 200);
      result.current.setColumnWidth('col2', 300);
      result.current.setColumnWidth('col3', 150);
    });

    expect(result.current.columnWidths).toEqual({
      col1: 200,
      col2: 300,
      col3: 150,
    });
  });

  it('should preserve existing widths when adding new columns', () => {
    const { result } = renderHook(() =>
      useColumnResize({ initialWidths: { col1: 200 } }),
    );

    act(() => {
      result.current.setColumnWidth('col2', 300);
    });

    expect(result.current.columnWidths).toEqual({
      col1: 200,
      col2: 300,
    });
  });
});

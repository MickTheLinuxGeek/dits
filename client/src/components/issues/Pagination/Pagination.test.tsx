import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    onPageChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders pagination controls', () => {
    render(<Pagination {...defaultProps} />);

    expect(
      screen.getByRole('navigation', { name: /pagination/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/page 1 of 5/i)).toBeInTheDocument();
  });

  it('renders all page numbers for small page count', () => {
    render(
      <Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />,
    );

    expect(
      screen.getByRole('button', { name: 'Go to page 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 2' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 3' }),
    ).toBeInTheDocument();
  });

  it('shows ellipsis for large page counts', () => {
    render(
      <Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />,
    );

    expect(screen.getAllByText('...')).toHaveLength(2); // Left and right ellipsis
  });

  it('highlights current page', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);

    const currentPageButton = screen.getByRole('button', {
      name: 'Go to page 3',
      current: 'page',
    });
    expect(currentPageButton).toBeInTheDocument();
  });

  it('disables previous/first buttons on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);

    expect(screen.getByLabelText('Go to previous page')).toBeDisabled();
    expect(screen.getByLabelText('Go to first page')).toBeDisabled();
  });

  it('disables next/last buttons on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);

    expect(screen.getByLabelText('Go to next page')).toBeDisabled();
    expect(screen.getByLabelText('Go to last page')).toBeDisabled();
  });

  it('calls onPageChange when clicking page number', () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when clicking next button', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        {...defaultProps}
        currentPage={2}
        onPageChange={onPageChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('Go to next page'));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange when clicking previous button', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        {...defaultProps}
        currentPage={2}
        onPageChange={onPageChange}
      />,
    );

    fireEvent.click(screen.getByLabelText('Go to previous page'));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange when clicking first button', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        {...defaultProps}
        currentPage={3}
        onPageChange={onPageChange}
        showFirstLast
      />,
    );

    fireEvent.click(screen.getByLabelText('Go to first page'));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange when clicking last button', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        {...defaultProps}
        currentPage={2}
        onPageChange={onPageChange}
        showFirstLast
      />,
    );

    fireEvent.click(screen.getByLabelText('Go to last page'));

    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it('does not call onPageChange when clicking current page', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        {...defaultProps}
        currentPage={3}
        onPageChange={onPageChange}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Go to page 3', current: 'page' }),
    );

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('hides first/last buttons when showFirstLast is false', () => {
    render(<Pagination {...defaultProps} showFirstLast={false} />);

    expect(screen.queryByLabelText('Go to first page')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Go to last page')).not.toBeInTheDocument();
  });

  it('returns null when totalPages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null when totalPages is 0', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} onPageChange={vi.fn()} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('adjusts sibling count correctly', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        onPageChange={vi.fn()}
        siblingCount={2}
      />,
    );

    // With siblingCount=2, should show current page and 2 siblings on each side
    expect(
      screen.getByRole('button', { name: 'Go to page 3' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 4' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 5', current: 'page' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 6' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 7' }),
    ).toBeInTheDocument();
  });

  it('shows correct page range for first page', () => {
    render(
      <Pagination currentPage={1} totalPages={10} onPageChange={vi.fn()} />,
    );

    expect(
      screen.getByRole('button', { name: 'Go to page 1', current: 'page' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 2' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 10' }),
    ).toBeInTheDocument();
  });

  it('shows correct page range for last page', () => {
    render(
      <Pagination currentPage={10} totalPages={10} onPageChange={vi.fn()} />,
    );

    expect(
      screen.getByRole('button', { name: 'Go to page 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 9' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 10', current: 'page' }),
    ).toBeInTheDocument();
  });

  it('shows correct page range for middle page', () => {
    render(
      <Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />,
    );

    expect(
      screen.getByRole('button', { name: 'Go to page 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 4' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 5', current: 'page' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 6' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Go to page 10' }),
    ).toBeInTheDocument();
  });

  it('does not show ellipsis when not needed', () => {
    render(
      <Pagination currentPage={2} totalPages={4} onPageChange={vi.fn()} />,
    );

    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });
});

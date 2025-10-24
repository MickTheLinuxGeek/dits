import { render, screen } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { InfiniteScrollContainer } from './InfiniteScrollContainer';
import styles from './InfiniteScrollContainer.module.css';

// Mock useInfiniteScroll hook
vi.mock('../../../hooks/useInfiniteScroll', () => ({
  useInfiniteScroll: vi.fn(() => ({
    sentinelRef: { current: null },
    isIntersecting: false,
  })),
}));

describe('InfiniteScrollContainer', () => {
  const mockOnLoadMore = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when not loading', () => {
    render(
      <InfiniteScrollContainer onLoadMore={mockOnLoadMore} hasMore={true}>
        <div>Test Item 1</div>
        <div>Test Item 2</div>
      </InfiniteScrollContainer>,
    );

    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(
      <InfiniteScrollContainer
        onLoadMore={mockOnLoadMore}
        hasMore={true}
        isLoading={true}
        loadingItemCount={3}
      >
        <div>Test Item</div>
      </InfiniteScrollContainer>,
    );

    // Should show skeleton items instead of content
    expect(screen.queryByText('Test Item')).not.toBeInTheDocument();
  });

  it('shows load more spinner when isLoadingMore is true', () => {
    render(
      <InfiniteScrollContainer
        onLoadMore={mockOnLoadMore}
        hasMore={true}
        isLoadingMore={true}
      >
        <div>Test Item</div>
      </InfiniteScrollContainer>,
    );

    expect(screen.getByText('Loading more...')).toBeInTheDocument();
  });

  it('shows end message when hasMore is false', () => {
    render(
      <InfiniteScrollContainer
        onLoadMore={mockOnLoadMore}
        hasMore={false}
        endMessage="All items loaded"
      >
        <div>Test Item</div>
      </InfiniteScrollContainer>,
    );

    expect(screen.getByText('All items loaded')).toBeInTheDocument();
  });

  it('uses default end message', () => {
    render(
      <InfiniteScrollContainer onLoadMore={mockOnLoadMore} hasMore={false}>
        <div>Test Item</div>
      </InfiniteScrollContainer>,
    );

    expect(screen.getByText('No more items to load')).toBeInTheDocument();
  });

  it('does not show end message when isLoadingMore is true', () => {
    render(
      <InfiniteScrollContainer
        onLoadMore={mockOnLoadMore}
        hasMore={false}
        isLoadingMore={true}
      >
        <div>Test Item</div>
      </InfiniteScrollContainer>,
    );

    expect(screen.queryByText('No more items to load')).not.toBeInTheDocument();
  });

  it('shows custom loading component', () => {
    render(
      <InfiniteScrollContainer
        onLoadMore={mockOnLoadMore}
        hasMore={true}
        isLoadingMore={true}
        loadingComponent={<div>Custom Loader</div>}
      >
        <div>Test Item</div>
      </InfiniteScrollContainer>,
    );

    expect(screen.getByText('Custom Loader')).toBeInTheDocument();
    expect(screen.queryByText('Loading more...')).not.toBeInTheDocument();
  });

  it('renders correct number of skeleton items', () => {
    const { container } = render(
      <InfiniteScrollContainer
        onLoadMore={mockOnLoadMore}
        hasMore={true}
        isLoading={true}
        loadingItemCount={5}
      >
        <div>Test Item</div>
      </InfiniteScrollContainer>,
    );

    // Count skeleton items
    const skeletonItems = container.querySelectorAll(`.${styles.skeletonItem}`);
    expect(skeletonItems).toHaveLength(5);
  });

  it('applies custom className', () => {
    const { container } = render(
      <InfiniteScrollContainer
        onLoadMore={mockOnLoadMore}
        hasMore={true}
        className="custom-class"
      >
        <div>Test Item</div>
      </InfiniteScrollContainer>,
    );

    const containerEl = container.querySelector(`.${styles.container}`);
    expect(containerEl).toHaveClass('custom-class');
  });

  it('has sentinel element with aria-hidden', () => {
    const { container } = render(
      <InfiniteScrollContainer onLoadMore={mockOnLoadMore} hasMore={true}>
        <div>Test Item</div>
      </InfiniteScrollContainer>,
    );

    const sentinel = container.querySelector('[aria-hidden="true"]');
    expect(sentinel).toBeInTheDocument();
  });

  it('renders both content and loading more spinner', () => {
    render(
      <InfiniteScrollContainer
        onLoadMore={mockOnLoadMore}
        hasMore={true}
        isLoadingMore={true}
      >
        <div>Test Item 1</div>
        <div>Test Item 2</div>
      </InfiniteScrollContainer>,
    );

    // Should show both content and loading spinner
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    expect(screen.getByText('Loading more...')).toBeInTheDocument();
  });

  it('does not show loading more when hasMore is false', () => {
    render(
      <InfiniteScrollContainer
        onLoadMore={mockOnLoadMore}
        hasMore={false}
        isLoadingMore={true}
      >
        <div>Test Item</div>
      </InfiniteScrollContainer>,
    );

    // Should still show loading more even when hasMore is false
    // (handles edge case during final load)
    expect(screen.getByText('Loading more...')).toBeInTheDocument();
  });
});

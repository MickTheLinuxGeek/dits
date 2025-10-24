import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { Skeleton } from '../../atoms/Skeleton/Skeleton';
import styles from './InfiniteScrollContainer.module.css';

export interface InfiniteScrollContainerProps {
  /**
   * Child elements to render in the scroll container
   */
  children: React.ReactNode;

  /**
   * Callback to load more items
   */
  onLoadMore: () => void;

  /**
   * Whether there are more items to load
   */
  hasMore: boolean;

  /**
   * Whether currently loading more items
   */
  isLoadingMore?: boolean;

  /**
   * Whether the initial load is in progress
   */
  isLoading?: boolean;

  /**
   * Number of skeleton items to show during loading
   */
  loadingItemCount?: number;

  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;

  /**
   * Root margin for intersection observer (triggers before reaching bottom)
   */
  rootMargin?: string;

  /**
   * Custom class name for the container
   */
  className?: string;

  /**
   * Text to display when all items are loaded
   */
  endMessage?: string;
}

/**
 * InfiniteScrollContainer - Wrapper component for infinite scroll functionality
 *
 * Features:
 * - Automatic loading when scrolling near the bottom
 * - Loading states (initial + load more)
 * - End of list message
 * - Customizable loading indicator
 * - Intersection observer based (performant)
 *
 * Usage:
 * ```tsx
 * <InfiniteScrollContainer
 *   onLoadMore={loadMoreIssues}
 *   hasMore={hasNextPage}
 *   isLoadingMore={isFetchingMore}
 * >
 *   {issues.map(issue => (
 *     <IssueCard key={issue.id} issue={issue} />
 *   ))}
 * </InfiniteScrollContainer>
 * ```
 */
export function InfiniteScrollContainer({
  children,
  onLoadMore,
  hasMore,
  isLoadingMore = false,
  isLoading = false,
  loadingItemCount = 3,
  loadingComponent,
  rootMargin = '200px',
  className = '',
  endMessage = 'No more items to load',
}: InfiniteScrollContainerProps) {
  const { sentinelRef } = useInfiniteScroll({
    onLoadMore,
    hasMore,
    isLoading: isLoadingMore,
    rootMargin,
    enabled: !isLoading, // Disable during initial load
  });

  // Show initial loading skeleton
  if (isLoading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.loadingList}>
          {Array.from({ length: loadingItemCount }).map((_, index) => (
            <div key={index} className={styles.skeletonItem}>
              <Skeleton width="100%" height="80px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Main content */}
      <div className={styles.content}>{children}</div>

      {/* Load more indicator */}
      {isLoadingMore && (
        <div className={styles.loadingMore}>
          {loadingComponent || (
            <>
              <div className={styles.spinner} />
              <span className={styles.loadingText}>Loading more...</span>
            </>
          )}
        </div>
      )}

      {/* End message */}
      {!hasMore && !isLoadingMore && (
        <div className={styles.endMessage}>{endMessage}</div>
      )}

      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
    </div>
  );
}

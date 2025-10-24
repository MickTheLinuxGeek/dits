import { useEffect, useRef, useCallback } from 'react';

export interface UseInfiniteScrollOptions {
  /**
   * Callback fired when the sentinel element intersects the viewport
   */
  onLoadMore: () => void;

  /**
   * Whether there are more items to load
   */
  hasMore: boolean;

  /**
   * Whether currently loading more items
   */
  isLoading?: boolean;

  /**
   * Root margin for intersection observer (default: '100px')
   * Triggers loading before reaching the exact bottom
   */
  rootMargin?: string;

  /**
   * Intersection threshold (default: 0.1)
   */
  threshold?: number;

  /**
   * Whether infinite scroll is enabled (default: true)
   */
  enabled?: boolean;
}

export interface UseInfiniteScrollReturn {
  /**
   * Ref to attach to the sentinel element at the bottom of the list
   */
  sentinelRef: React.RefObject<HTMLDivElement | null>;

  /**
   * Whether the sentinel is currently visible
   */
  isIntersecting: boolean;
}

/**
 * Custom hook for implementing infinite scroll functionality
 *
 * Usage:
 * ```tsx
 * const { sentinelRef } = useInfiniteScroll({
 *   onLoadMore: loadMoreIssues,
 *   hasMore: hasNextPage,
 *   isLoading: isFetchingMore,
 *   rootMargin: '200px', // Trigger 200px before bottom
 * });
 *
 * return (
 *   <div>
 *     {items.map(item => <Item key={item.id} {...item} />)}
 *     <div ref={sentinelRef} />
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading = false,
  rootMargin = '100px',
  threshold = 0.1,
  enabled = true,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isIntersectingRef = useRef(false);

  // Memoize the callback to avoid recreating the observer
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      isIntersectingRef.current = entry.isIntersecting;

      // Only load more if:
      // 1. The sentinel is visible
      // 2. Not currently loading
      // 3. There are more items to load
      // 4. Infinite scroll is enabled
      if (entry.isIntersecting && !isLoading && hasMore && enabled) {
        onLoadMore();
      }
    },
    [onLoadMore, isLoading, hasMore, enabled],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !enabled) {
      return;
    }

    // Create intersection observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null, // viewport
      rootMargin,
      threshold,
    });

    // Start observing
    observerRef.current.observe(sentinel);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [handleIntersection, rootMargin, threshold, enabled]);

  return {
    sentinelRef,
    isIntersecting: isIntersectingRef.current,
  };
}

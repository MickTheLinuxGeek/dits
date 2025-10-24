import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '../../atoms/Button';
import styles from './Pagination.module.css';

export interface PaginationProps {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Number of page buttons to show */
  siblingCount?: number;
  /** Show first/last page buttons */
  showFirstLast?: boolean;
}

/**
 * Pagination component for navigating through paged data.
 * Supports keyboard navigation and accessibility.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 2);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPages - 1,
    );

    // Show left ellipsis if needed
    if (leftSiblingIndex > 2) {
      pages.push('ellipsis');
    }

    // Show pages around current page
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      pages.push(i);
    }

    // Show right ellipsis if needed
    if (rightSiblingIndex < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    if (currentPage !== 1) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (currentPage !== totalPages) {
      onPageChange(totalPages);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <nav className={styles.pagination} aria-label="Pagination navigation">
      <div className={styles.controls}>
        {/* First page button */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleFirst}
            disabled={currentPage === 1}
            aria-label="Go to first page"
            iconOnly
          >
            <ChevronsLeft size={16} />
          </Button>
        )}

        {/* Previous page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          iconOnly
        >
          <ChevronLeft size={16} />
        </Button>

        {/* Page number buttons */}
        <div className={styles.pageNumbers}>
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;

            return (
              <button
                key={page}
                type="button"
                className={[styles.pageButton, isActive && styles.active]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handlePageClick(page)}
                aria-label={`Go to page ${page}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
          iconOnly
        >
          <ChevronRight size={16} />
        </Button>

        {/* Last page button */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLast}
            disabled={currentPage === totalPages}
            aria-label="Go to last page"
            iconOnly
          >
            <ChevronsRight size={16} />
          </Button>
        )}
      </div>

      {/* Page info */}
      <div className={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </div>
    </nav>
  );
}

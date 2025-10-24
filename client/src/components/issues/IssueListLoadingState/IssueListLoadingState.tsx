import { Skeleton } from '../../atoms/Skeleton';
import styles from './IssueListLoadingState.module.css';

export interface IssueListLoadingStateProps {
  /** Number of skeleton rows to display */
  rows?: number;
  /** Whether to show toolbar skeleton */
  showToolbar?: boolean;
}

/**
 * Loading state component for issue list
 * Shows skeleton placeholders that match the actual table layout
 */
export function IssueListLoadingState({
  rows = 10,
  showToolbar = true,
}: IssueListLoadingStateProps) {
  return (
    <div className={styles.container}>
      {/* Toolbar skeleton */}
      {showToolbar && (
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <Skeleton variant="rectangular" width={300} height={40} />
          </div>
          <div className={styles.toolbarRight}>
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="rectangular" width={100} height={36} />
          </div>
        </div>
      )}

      {/* Table skeleton */}
      <div className={styles.table}>
        {/* Table header */}
        <div className={styles.tableHeader}>
          <div className={styles.headerCell} style={{ width: '40px' }}>
            <Skeleton variant="rectangular" width={20} height={20} />
          </div>
          <div className={styles.headerCell} style={{ flex: 1 }}>
            <Skeleton variant="text" width="80px" />
          </div>
          <div className={styles.headerCell} style={{ width: '140px' }}>
            <Skeleton variant="text" width="60px" />
          </div>
          <div className={styles.headerCell} style={{ width: '120px' }}>
            <Skeleton variant="text" width="60px" />
          </div>
          <div className={styles.headerCell} style={{ width: '200px' }}>
            <Skeleton variant="text" width="50px" />
          </div>
          <div className={styles.headerCell} style={{ width: '140px' }}>
            <Skeleton variant="text" width="70px" />
          </div>
        </div>

        {/* Table rows */}
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className={styles.tableRow}>
            <div className={styles.cell} style={{ width: '40px' }}>
              <Skeleton variant="rectangular" width={20} height={20} />
            </div>
            <div className={styles.cell} style={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" height={12} />
            </div>
            <div className={styles.cell} style={{ width: '140px' }}>
              <Skeleton variant="rounded" width={90} height={24} />
            </div>
            <div className={styles.cell} style={{ width: '120px' }}>
              <Skeleton variant="rounded" width={80} height={24} />
            </div>
            <div className={styles.cell} style={{ width: '200px' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Skeleton variant="rounded" width={60} height={20} />
                <Skeleton variant="rounded" width={60} height={20} />
              </div>
            </div>
            <div className={styles.cell} style={{ width: '140px' }}>
              <Skeleton variant="text" width="80px" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className={styles.pagination}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Skeleton variant="rectangular" width={36} height={36} />
          <Skeleton variant="rectangular" width={36} height={36} />
          <Skeleton variant="rectangular" width={36} height={36} />
          <Skeleton variant="rectangular" width={36} height={36} />
          <Skeleton variant="rectangular" width={36} height={36} />
        </div>
        <Skeleton variant="text" width="120px" />
      </div>
    </div>
  );
}

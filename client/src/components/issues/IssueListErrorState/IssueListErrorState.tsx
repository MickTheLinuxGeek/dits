import { AlertCircle } from 'lucide-react';
import { Button } from '../../atoms/Button';
import styles from './IssueListErrorState.module.css';

export interface IssueListErrorStateProps {
  /** Error message to display */
  error?: Error | string;
  /** Callback when retry button is clicked */
  onRetry?: () => void;
  /** Custom title for the error */
  title?: string;
}

/**
 * Error state component for issue list
 * Shows error message with retry button
 */
export function IssueListErrorState({
  error,
  onRetry,
  title = 'Failed to load issues',
}: IssueListErrorStateProps) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : error || 'An unexpected error occurred';

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <AlertCircle size={48} />
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{errorMessage}</p>
        {onRetry && (
          <Button
            variant="primary"
            size="md"
            leftIcon="RefreshCw"
            onClick={onRetry}
            className={styles.retryButton}
          >
            Retry
          </Button>
        )}
        <div className={styles.suggestions}>
          <p className={styles.suggestionTitle}>Try the following:</p>
          <ul className={styles.suggestionList}>
            <li>Check your internet connection</li>
            <li>Refresh the page</li>
            <li>Clear your browser cache</li>
            <li>Contact support if the problem persists</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

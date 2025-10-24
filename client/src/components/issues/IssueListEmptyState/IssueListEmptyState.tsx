import { Inbox, Search, Filter } from 'lucide-react';
import { Button } from '../../atoms/Button';
import styles from './IssueListEmptyState.module.css';

export interface IssueListEmptyStateProps {
  /** Variant of empty state */
  variant?: 'no-issues' | 'no-results' | 'filtered';
  /** Callback when action button is clicked */
  onAction?: () => void;
  /** Action button text */
  actionText?: string;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
}

/**
 * Empty state component for issue list
 * Shows different messages based on context (no issues, no search results, etc.)
 */
export function IssueListEmptyState({
  variant = 'no-issues',
  onAction,
  actionText,
  title,
  description,
}: IssueListEmptyStateProps) {
  const getContent = () => {
    switch (variant) {
      case 'no-results':
        return {
          icon: <Search size={48} />,
          title: title || 'No issues found',
          description:
            description || 'Try adjusting your search query or filters',
          actionText: actionText || 'Clear search',
        };
      case 'filtered':
        return {
          icon: <Filter size={48} />,
          title: title || 'No matching issues',
          description: description || 'No issues match the current filters',
          actionText: actionText || 'Clear filters',
        };
      case 'no-issues':
      default:
        return {
          icon: <Inbox size={48} />,
          title: title || 'No issues yet',
          description:
            description || 'Get started by creating your first issue',
          actionText: actionText || 'Create issue',
        };
    }
  };

  const content = getContent();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>{content.icon}</div>
        <h3 className={styles.title}>{content.title}</h3>
        <p className={styles.description}>{content.description}</p>
        {onAction && (
          <Button
            variant="primary"
            size="md"
            onClick={onAction}
            className={styles.actionButton}
          >
            {content.actionText}
          </Button>
        )}
      </div>
    </div>
  );
}

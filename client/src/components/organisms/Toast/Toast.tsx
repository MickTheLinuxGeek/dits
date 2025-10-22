import React from 'react';
import { Icon, type IconName, ICONS } from '@/components/atoms';
import { Button } from '@/components/atoms/Button';
import styles from './Toast.module.css';

export interface ToastProps {
  /** Toast ID for identification */
  id: string;
  /** Toast type */
  type?: 'success' | 'error' | 'warning' | 'info';
  /** Toast title */
  title?: string;
  /** Toast message */
  message: string;
  /** Whether the toast is visible */
  isVisible?: boolean;
  /** Duration in milliseconds (0 = no auto-dismiss) */
  duration?: number;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Callback when toast is dismissed */
  onDismiss?: (id: string) => void;
  /** Custom action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Additional className */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

/**
 * Individual Toast component for displaying notifications.
 * Supports different types, auto-dismiss, and custom actions.
 */
export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  title,
  message,
  isVisible = true,
  duration = 5000,
  showCloseButton = true,
  onDismiss,
  action,
  className,
  style,
}) => {
  const [isExiting, setIsExiting] = React.useState(false);

  const handleDismiss = React.useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss?.(id);
    }, 200); // Match animation duration
  }, [id, onDismiss]);

  // Auto-dismiss timer
  React.useEffect(() => {
    if (!isVisible || duration === 0) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, duration, handleDismiss]);

  const typeIcons: Record<string, IconName> = {
    success: ICONS.SUCCESS,
    error: 'XCircle' as IconName, // Using as assertion since XCircle might not be in the type
    warning: ICONS.WARNING,
    info: ICONS.INFO,
  };

  const toastClasses = [
    styles.toast,
    styles[type],
    isExiting && styles.exiting,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (!isVisible) return null;

  return (
    <div className={toastClasses} style={style} role="alert" aria-live="polite">
      <div className={styles.content}>
        <div className={styles.icon}>
          <Icon name={typeIcons[type]} />
        </div>

        <div className={styles.body}>
          {title && <div className={styles.title}>{title}</div>}
          <div className={styles.message}>{message}</div>
        </div>

        <div className={styles.actions}>
          {action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              className={styles.actionButton}
            >
              {action.label}
            </Button>
          )}

          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              leftIcon="X"
              onClick={handleDismiss}
              className={styles.closeButton}
              aria-label="Close notification"
            >
              Close
            </Button>
          )}
        </div>
      </div>

      {duration > 0 && (
        <div
          className={styles.progressBar}
          style={{
            animationDuration: `${duration}ms`,
          }}
        />
      )}
    </div>
  );
};

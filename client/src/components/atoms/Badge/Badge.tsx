import styles from './Badge.module.css';

export interface BadgeProps {
  /**
   * Badge variant/color
   */
  variant?: 'default' | 'success' | 'warning' | 'info' | 'error';

  /**
   * Badge content
   */
  children: React.ReactNode;

  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Badge - Small label component for status, categories, etc.
 *
 * Usage:
 * ```tsx
 * <Badge variant="success">Done</Badge>
 * <Badge variant="warning">High Priority</Badge>
 * ```
 */
export function Badge({
  variant = 'default',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}

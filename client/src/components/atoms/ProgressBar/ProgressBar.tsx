import React from 'react';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps {
  /** Progress value (0-100) */
  value?: number;
  /** Maximum value */
  max?: number;
  /** Progress bar size */
  size?: 'sm' | 'md' | 'lg';
  /** Progress bar color */
  color?: 'primary' | 'success' | 'warning' | 'error';
  /** Whether to show indeterminate progress */
  indeterminate?: boolean;
  /** Whether to show progress text */
  showValue?: boolean;
  /** Custom label to show instead of percentage */
  label?: string;
  /** Additional className */
  className?: string;
  /** Accessibility label */
  'aria-label'?: string;
}

/**
 * Progress bar component for showing progress or indeterminate loading states.
 * Supports different colors, sizes, and can show progress values.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  max = 100,
  size = 'md',
  color = 'primary',
  indeterminate = false,
  showValue = false,
  label,
  className,
  'aria-label': ariaLabel,
}) => {
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const percentage = indeterminate ? 0 : (normalizedValue / max) * 100;

  const progressBarClasses = [
    styles.progressBar,
    styles[size],
    indeterminate && styles.indeterminate,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const progressFillClasses = [
    styles.progressFill,
    styles[color],
    indeterminate && styles.indeterminateFill,
  ]
    .filter(Boolean)
    .join(' ');

  const displayValue = label || (showValue ? `${Math.round(percentage)}%` : '');

  return (
    <div className={styles.container}>
      <div
        className={progressBarClasses}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : normalizedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={
          ariaLabel || (indeterminate ? 'Loading' : `Progress: ${percentage}%`)
        }
      >
        <div
          className={progressFillClasses}
          style={{
            width: indeterminate ? '100%' : `${percentage}%`,
          }}
        />
      </div>
      {displayValue && <span className={styles.label}>{displayValue}</span>}
    </div>
  );
};

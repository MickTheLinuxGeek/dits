import React from 'react';
import styles from './Spinner.module.css';

export interface SpinnerProps {
  /** Spinner size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Spinner color */
  color?: 'primary' | 'secondary' | 'white' | 'current';
  /** Whether to show spinner with text */
  label?: string;
  /** Additional className */
  className?: string;
  /** Thickness of the spinner */
  thickness?: 'thin' | 'medium' | 'thick';
}

/**
 * Loading spinner component with different sizes and colors.
 * Can be used standalone or within other components like buttons.
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  label,
  className,
  thickness = 'medium',
}) => {
  const spinnerClasses = [
    styles.spinner,
    styles[size],
    styles[color],
    styles[thickness],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const spinnerElement = (
    <div
      className={spinnerClasses}
      role="status"
      aria-label={label || 'Loading'}
    >
      <div className={styles.ring} />
      <div className={styles.ring} />
      <div className={styles.ring} />
      <div className={styles.ring} />
    </div>
  );

  if (label) {
    return (
      <div className={styles.wrapper}>
        {spinnerElement}
        <span className={styles.label}>{label}</span>
      </div>
    );
  }

  return spinnerElement;
};

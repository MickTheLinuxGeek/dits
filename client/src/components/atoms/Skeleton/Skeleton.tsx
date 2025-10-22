import React from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  /** Skeleton variant */
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Number of lines for text variant */
  lines?: number;
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
  /** Additional className */
  className?: string;
  /** Whether to use full width */
  fullWidth?: boolean;
}

/**
 * Skeleton component for showing loading placeholders.
 * Useful for indicating content is loading while maintaining layout.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  animation = 'pulse',
  className,
  fullWidth = false,
}) => {
  const skeletonClasses = [
    styles.skeleton,
    styles[variant],
    styles[animation],
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const getSkeletonStyle = () => {
    const style: React.CSSProperties = {};

    if (width !== undefined) {
      style.width = typeof width === 'number' ? `${width}px` : width;
    }

    if (height !== undefined) {
      style.height = typeof height === 'number' ? `${height}px` : height;
    }

    return style;
  };

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className={styles.textContainer}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={skeletonClasses}
            style={{
              ...getSkeletonStyle(),
              // Make last line shorter for more realistic text skeleton
              width: index === lines - 1 ? '75%' : width || '100%',
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={skeletonClasses}
      style={getSkeletonStyle()}
      aria-hidden="true"
    />
  );
};

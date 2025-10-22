import React from 'react';
import { Icon, type IconName } from '@/components/atoms/Icon';
import styles from './Button.module.css';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant - determines the visual style */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state - shows spinner and disables button */
  isLoading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon to show on the left side */
  leftIcon?: IconName;
  /** Icon to show on the right side */
  rightIcon?: IconName;
  /** Icon only button (no text) */
  iconOnly?: boolean;
  /** Button content */
  children: React.ReactNode;
}

/**
 * Button component with multiple variants, sizes, and states.
 * Supports loading states, icons, and full keyboard navigation.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      iconOnly = false,
      disabled,
      className,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const buttonClasses = [
      styles.button,
      styles[variant],
      styles[size],
      fullWidth && styles.fullWidth,
      iconOnly && styles.iconOnly,
      isLoading && styles.loading,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        {...props}
      >
        {isLoading && (
          <Icon
            name="Loader"
            className={styles.loadingIcon}
            aria-hidden="true"
          />
        )}

        {leftIcon && !isLoading && (
          <Icon
            name={leftIcon}
            className={styles.leftIcon}
            aria-hidden="true"
          />
        )}

        {!iconOnly && <span className={styles.content}>{children}</span>}

        {rightIcon && !isLoading && (
          <Icon
            name={rightIcon}
            className={styles.rightIcon}
            aria-hidden="true"
          />
        )}

        {iconOnly && !isLoading && children}
      </button>
    );
  },
);

Button.displayName = 'Button';

import React from 'react';
import { Icon, type IconName, ICONS } from '@/components/atoms';
import styles from './Input.module.css';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input variant */
  variant?: 'default' | 'filled' | 'flushed';
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  /** Error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Helper text to display */
  helperText?: string;
  /** Label for the input */
  label?: string;
  /** Icon to show on the left side */
  leftIcon?: IconName;
  /** Icon to show on the right side */
  rightIcon?: IconName;
  /** Loading state */
  isLoading?: boolean;
  /** Whether the field is required */
  isRequired?: boolean;
  /** Full width input */
  fullWidth?: boolean;
}

/**
 * Input component with validation support, icons, and multiple variants.
 * Supports all native input types and accessibility features.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      error = false,
      errorMessage,
      helperText,
      label,
      leftIcon,
      rightIcon,
      isLoading = false,
      isRequired = false,
      fullWidth = false,
      disabled,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || `input-${generatedId}`;
    const errorId = errorMessage ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const inputClasses = [
      styles.input,
      styles[variant],
      styles[size],
      error && styles.error,
      leftIcon && styles.hasLeftIcon,
      rightIcon && styles.hasRightIcon,
      isLoading && styles.loading,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const wrapperClasses = [
      styles.wrapper,
      fullWidth && styles.fullWidth,
      disabled && styles.disabled,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {isRequired && (
              <span className={styles.required} aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className={styles.inputWrapper}>
          {leftIcon && !isLoading && (
            <Icon
              name={leftIcon}
              className={styles.leftIcon}
              aria-hidden="true"
            />
          )}

          {isLoading && (
            <Icon
              name="Loader"
              className={[styles.leftIcon, styles.loadingIcon].join(' ')}
              aria-hidden="true"
            />
          )}

          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled || isLoading}
            required={isRequired}
            aria-invalid={error}
            aria-describedby={
              [errorId, helperId].filter(Boolean).join(' ') || undefined
            }
            {...props}
          />

          {rightIcon && !isLoading && (
            <Icon
              name={rightIcon}
              className={styles.rightIcon}
              aria-hidden="true"
            />
          )}
        </div>

        {errorMessage && (
          <div id={errorId} className={styles.errorMessage} role="alert">
            <Icon
              name={ICONS.ERROR}
              className={styles.errorIcon}
              aria-hidden="true"
            />
            {errorMessage}
          </div>
        )}

        {helperText && !errorMessage && (
          <div id={helperId} className={styles.helperText}>
            {helperText}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

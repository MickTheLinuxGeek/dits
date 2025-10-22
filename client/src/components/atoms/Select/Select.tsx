import React from 'react';
import { Icon, ICONS } from '@/components/atoms';
import styles from './Select.module.css';

export interface SelectOption {
  /** Value of the option */
  value: string;
  /** Display label */
  label: string;
  /** Whether the option is disabled */
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Array of options to display */
  options: SelectOption[];
  /** Label for the select */
  label?: string;
  /** Select size */
  size?: 'sm' | 'md' | 'lg';
  /** Error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Helper text to display */
  helperText?: string;
  /** Whether the field is required */
  isRequired?: boolean;
  /** Full width select */
  fullWidth?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Select component for form inputs with validation support.
 * A simpler, more accessible alternative to custom dropdown components for forms.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      size = 'md',
      error = false,
      errorMessage,
      helperText,
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
    const selectId = id || `select-${generatedId}`;
    const errorId = errorMessage ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;

    const selectClasses = [
      styles.select,
      styles[size],
      error && styles.error,
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
          <label htmlFor={selectId} className={styles.label}>
            {label}
            {isRequired && (
              <span className={styles.required} aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className={styles.selectWrapper}>
          <select
            ref={ref}
            id={selectId}
            className={selectClasses}
            disabled={disabled}
            required={isRequired}
            aria-invalid={error}
            aria-describedby={
              [errorId, helperId].filter(Boolean).join(' ') || undefined
            }
            {...props}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <Icon
            name="ChevronDown"
            className={styles.chevronIcon}
            aria-hidden="true"
          />
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

Select.displayName = 'Select';

import React from 'react';
import styles from './Form.module.css';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /** Form layout direction */
  direction?: 'vertical' | 'horizontal';
  /** Form spacing between fields */
  spacing?: 'sm' | 'md' | 'lg';
  /** Whether to show validation on blur or submit */
  validationMode?: 'onBlur' | 'onSubmit' | 'onChange';
  /** Callback for form validation errors */
  onValidationError?: (errors: Record<string, string>) => void;
  /** Form content */
  children: React.ReactNode;
}

/**
 * Form component that provides layout and validation context for form fields.
 * Works with Input and other form components to provide consistent styling and validation.
 */
export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  (
    {
      direction = 'vertical',
      spacing = 'md',
      validationMode = 'onBlur',
      onValidationError,
      className,
      onSubmit,
      children,
      ...props
    },
    ref,
  ) => {
    const [, setErrors] = React.useState<Record<string, string>>({});

    const handleSubmit = React.useCallback(
      (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // TODO: Use formData and validationMode when implementing advanced validation
        void validationMode; // Available for future validation logic
        const formElement = event.currentTarget;
        const newErrors: Record<string, string> = {};

        // Basic HTML5 validation
        const inputs = formElement.querySelectorAll('input, select, textarea');
        inputs.forEach((input) => {
          const element = input as HTMLInputElement;
          if (!element.checkValidity()) {
            const name = element.name || element.id || 'unknown';
            newErrors[name] = element.validationMessage;
          }
        });

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
          onValidationError?.(newErrors);
          return;
        }

        onSubmit?.(event);
      },
      [onSubmit, onValidationError, validationMode],
    );

    const formClasses = [
      styles.form,
      styles[direction],
      styles[`spacing-${spacing}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <form
        ref={ref}
        className={formClasses}
        onSubmit={handleSubmit}
        noValidate
        {...props}
      >
        {children}
      </form>
    );
  },
);

Form.displayName = 'Form';

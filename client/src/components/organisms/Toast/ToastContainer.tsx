import React from 'react';
import { createPortal } from 'react-dom';
import { Toast, type ToastProps } from './Toast';
import styles from './ToastContainer.module.css';

export interface ToastData extends Omit<ToastProps, 'onDismiss'> {
  id: string;
}

export interface ToastContainerProps {
  /** Position of the toast container */
  position?:
    | 'top-right'
    | 'top-left'
    | 'top-center'
    | 'bottom-right'
    | 'bottom-left'
    | 'bottom-center';
  /** Maximum number of toasts to show */
  maxToasts?: number;
  /** Default duration for toasts */
  defaultDuration?: number;
}

/**
 * Container component for managing and displaying multiple toasts.
 * Handles positioning, stacking, and automatic cleanup.
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  maxToasts = 5,
  defaultDuration = 5000,
}) => {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  // Add toast
  const addToast = React.useCallback(
    (toast: Omit<ToastData, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastData = {
        ...toast,
        id,
        duration: toast.duration ?? defaultDuration,
      };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        // Limit number of toasts
        return updated.slice(0, maxToasts);
      });

      return id;
    },
    [maxToasts, defaultDuration],
  );

  // Remove toast
  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Clear all toasts
  const clearAllToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  // Expose methods globally for easy access
  React.useEffect(() => {
    window.toast = {
      success: (message: string, options?: Partial<ToastData>) =>
        addToast({ type: 'success', message, ...options }),
      error: (message: string, options?: Partial<ToastData>) =>
        addToast({ type: 'error', message, ...options }),
      warning: (message: string, options?: Partial<ToastData>) =>
        addToast({ type: 'warning', message, ...options }),
      info: (message: string, options?: Partial<ToastData>) =>
        addToast({ type: 'info', message, ...options }),
      dismiss: removeToast,
      clear: clearAllToasts,
    };

    return () => {
      delete window.toast;
    };
  }, [addToast, removeToast, clearAllToasts]);

  const containerClasses = [styles.container, styles[position]].join(' ');

  if (toasts.length === 0) return null;

  const toastContainer = (
    <div className={containerClasses}>
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          {...toast}
          onDismiss={removeToast}
          style={{
            zIndex: 1700 - index, // notification z-index from spacing.ts
          }}
        />
      ))}
    </div>
  );

  return createPortal(toastContainer, document.body);
};

// Type declarations for global toast methods
declare global {
  interface Window {
    toast?: {
      success: (message: string, options?: Partial<ToastData>) => string;
      error: (message: string, options?: Partial<ToastData>) => string;
      warning: (message: string, options?: Partial<ToastData>) => string;
      info: (message: string, options?: Partial<ToastData>) => string;
      dismiss: (id: string) => void;
      clear: () => void;
    };
  }
}

import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/atoms/Button';
import styles from './Modal.module.css';

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Whether clicking backdrop closes modal */
  closeOnBackdropClick?: boolean;
  /** Whether pressing Escape closes modal */
  closeOnEscape?: boolean;
  /** Custom className for modal content */
  className?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Additional actions to render in footer */
  footer?: React.ReactNode;
  /** Initial focus element ref */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /** Final focus element ref (what to focus when modal closes) */
  finalFocusRef?: React.RefObject<HTMLElement>;
  /** Prevent body scroll when modal is open */
  preventBodyScroll?: boolean;
}

/**
 * Modal component with proper focus management, backdrop, and accessibility features.
 * Supports different sizes, custom content, and keyboard navigation.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className,
  children,
  footer,
  initialFocusRef,
  finalFocusRef,
  preventBodyScroll = true,
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  // Handle opening/closing effects
  React.useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Prevent body scroll
      if (preventBodyScroll) {
        document.body.style.overflow = 'hidden';
      }

      // Focus initial element or modal
      setTimeout(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 0);
    } else {
      // Restore body scroll
      if (preventBodyScroll) {
        document.body.style.overflow = '';
      }

      // Restore focus to final element or previous element
      setTimeout(() => {
        if (finalFocusRef?.current) {
          finalFocusRef.current.focus();
        } else if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      }, 0);
    }

    return () => {
      if (preventBodyScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, initialFocusRef, finalFocusRef, preventBodyScroll]);

  // Handle keyboard events
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        onClose();
      }

      // Trap focus within modal
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === backdropRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalClasses = [styles.modal, styles[size], className]
    .filter(Boolean)
    .join(' ');

  const modalContent = (
    <div
      ref={backdropRef}
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div ref={modalRef} className={modalClasses} tabIndex={-1}>
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title && (
              <h2 id="modal-title" className={styles.title}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                leftIcon="X"
                onClick={onClose}
                className={styles.closeButton}
                aria-label="Close modal"
              >
                Close
              </Button>
            )}
          </div>
        )}

        <div className={styles.content}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

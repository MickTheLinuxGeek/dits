import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/atoms/Button';
import styles from './Popover.module.css';

export interface PopoverProps {
  /** Popover content */
  content: React.ReactNode;
  /** Popover title */
  title?: string;
  /** Popover placement */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Trigger method */
  trigger?: 'hover' | 'click' | 'focus';
  /** Whether popover is controlled */
  isOpen?: boolean;
  /** Callback when popover visibility changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Delay before showing popover (ms) */
  delay?: number;
  /** Whether to show arrow */
  showArrow?: boolean;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Additional className */
  className?: string;
  /** Children element that triggers the popover */
  children: React.ReactElement;
  /** Whether popover is disabled */
  disabled?: boolean;
  /** Popover width */
  width?: string | number;
  /** Whether to close on click outside */
  closeOnClickOutside?: boolean;
}

/**
 * Popover component for displaying richer content with optional title and close button.
 * Similar to Tooltip but supports more complex content and interactions.
 */
export const Popover: React.FC<PopoverProps> = ({
  content,
  title,
  placement = 'bottom',
  trigger = 'click',
  isOpen: controlledIsOpen,
  onOpenChange,
  delay = 0,
  showArrow = true,
  showCloseButton = false,
  className,
  children,
  disabled = false,
  width = 'auto',
  closeOnClickOutside = true,
}) => {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current || !popoverRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top + scrollY - popoverRect.height - 12;
        left =
          triggerRect.left +
          scrollX +
          (triggerRect.width - popoverRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + 12;
        left =
          triggerRef.current.offsetLeft +
          (triggerRect.width - popoverRect.width) / 2;
        break;
      case 'left':
        top =
          triggerRect.top +
          scrollY +
          (triggerRect.height - popoverRect.height) / 2;
        left = triggerRect.left + scrollX - popoverRect.width - 12;
        break;
      case 'right':
        top =
          triggerRect.top +
          scrollY +
          (triggerRect.height - popoverRect.height) / 2;
        left = triggerRect.right + scrollX + 12;
        break;
    }

    // Keep popover within viewport
    const padding = 12;
    top = Math.max(
      padding,
      Math.min(
        top,
        window.innerHeight + scrollY - popoverRect.height - padding,
      ),
    );
    left = Math.max(
      padding,
      Math.min(left, window.innerWidth + scrollX - popoverRect.width - padding),
    );

    setPosition({ top, left });
  }, [placement]);

  const handleOpenChange = (newIsOpen: boolean) => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(newIsOpen);
    }
    onOpenChange?.(newIsOpen);
  };

  const showPopover = () => {
    if (disabled) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        handleOpenChange(true);
      }, delay);
    } else {
      handleOpenChange(true);
    }
  };

  const hidePopover = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    handleOpenChange(false);
  };

  const handleClick = () => {
    if (trigger === 'click') {
      handleOpenChange(!isOpen);
    }
  };

  // Handle click outside
  React.useEffect(() => {
    if (!isOpen || !closeOnClickOutside) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        triggerRef.current &&
        popoverRef.current &&
        !triggerRef.current.contains(target) &&
        !popoverRef.current.contains(target)
      ) {
        hidePopover();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeOnClickOutside]);

  // Update position when popover becomes visible
  React.useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  // Handle window resize
  React.useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => updatePosition();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isOpen, updatePosition]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const triggerProps: Record<string, any> = {
    ref: triggerRef,
  };

  if (trigger === 'hover') {
    triggerProps.onMouseEnter = showPopover;
    triggerProps.onMouseLeave = hidePopover;
  }

  if (trigger === 'click') {
    triggerProps.onClick = (e: React.MouseEvent) => {
      handleClick();
      (children.props as any).onClick?.(e);
    };
  }

  if (trigger === 'focus') {
    triggerProps.onFocus = showPopover;
    triggerProps.onBlur = hidePopover;
  }

  const popoverClasses = [
    styles.popover,
    styles[placement],
    showArrow && styles.withArrow,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const popoverStyle: React.CSSProperties = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    zIndex: 1500, // popover from spacing.ts
    width: typeof width === 'number' ? `${width}px` : width,
  };

  const popoverElement =
    isOpen && content ? (
      <div
        ref={popoverRef}
        className={popoverClasses}
        style={popoverStyle}
        role="dialog"
        aria-modal="false"
      >
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                leftIcon="X"
                onClick={hidePopover}
                className={styles.closeButton}
                aria-label="Close popover"
              >
                Close
              </Button>
            )}
          </div>
        )}

        <div className={styles.content}>{content}</div>

        {showArrow && <div className={styles.arrow} />}
      </div>
    ) : null;

  return (
    <>
      {React.cloneElement(children, triggerProps)}
      {popoverElement && createPortal(popoverElement, document.body)}
    </>
  );
};

import React from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Tooltip placement */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Trigger method */
  trigger?: 'hover' | 'click' | 'focus';
  /** Whether tooltip is controlled */
  isOpen?: boolean;
  /** Callback when tooltip visibility changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Delay before showing tooltip (ms) */
  delay?: number;
  /** Whether to show arrow */
  showArrow?: boolean;
  /** Additional className */
  className?: string;
  /** Children element that triggers the tooltip */
  children: React.ReactElement;
  /** Whether tooltip is disabled */
  disabled?: boolean;
}

/**
 * Tooltip component that shows helpful information on hover, click, or focus.
 * Supports different placements and trigger methods with proper positioning.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = 'top',
  trigger = 'hover',
  isOpen: controlledIsOpen,
  onOpenChange,
  delay = 500,
  showArrow = true,
  className,
  children,
  disabled = false,
}) => {
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left =
          triggerRect.left +
          scrollX +
          (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8;
        left =
          triggerRect.left +
          scrollX +
          (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top =
          triggerRect.top +
          scrollY +
          (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'right':
        top =
          triggerRect.top +
          scrollY +
          (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + scrollX + 8;
        break;
    }

    // Keep tooltip within viewport
    const padding = 8;
    top = Math.max(
      padding,
      Math.min(
        top,
        window.innerHeight + scrollY - tooltipRect.height - padding,
      ),
    );
    left = Math.max(
      padding,
      Math.min(left, window.innerWidth + scrollX - tooltipRect.width - padding),
    );

    setPosition({ top, left });
  }, [placement]);

  const handleOpenChange = (newIsOpen: boolean) => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(newIsOpen);
    }
    onOpenChange?.(newIsOpen);
  };

  const showTooltip = () => {
    if (disabled) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (trigger === 'hover' && delay > 0) {
      timeoutRef.current = setTimeout(() => {
        handleOpenChange(true);
      }, delay);
    } else {
      handleOpenChange(true);
    }
  };

  const hideTooltip = () => {
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

  // Update position when tooltip becomes visible
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

  const triggerProps: Record<string, unknown> = {
    ref: triggerRef,
  };

  if (trigger === 'hover') {
    triggerProps.onMouseEnter = showTooltip;
    triggerProps.onMouseLeave = hideTooltip;
  }

  if (trigger === 'click') {
    triggerProps.onClick = (e: React.MouseEvent) => {
      handleClick();
      (children.props as Record<string, unknown>).onClick?.(e);
    };
  }

  if (trigger === 'focus') {
    triggerProps.onFocus = showTooltip;
    triggerProps.onBlur = hideTooltip;
  }

  const tooltipClasses = [
    styles.tooltip,
    styles[placement],
    showArrow && styles.withArrow,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const tooltipElement =
    isOpen && content ? (
      <div
        ref={tooltipRef}
        className={tooltipClasses}
        style={{
          position: 'absolute',
          top: position.top,
          left: position.left,
          zIndex: 1600, // tooltip from spacing.ts
        }}
        role="tooltip"
      >
        {content}
        {showArrow && <div className={styles.arrow} />}
      </div>
    ) : null;

  return (
    <>
      {React.cloneElement(children, triggerProps)}
      {tooltipElement && createPortal(tooltipElement, document.body)}
    </>
  );
};

import React from 'react';
import { Modal, type ModalProps } from '../Modal/Modal';
import { Button } from '@/components/atoms/Button';
import { Icon, type IconName, ICONS } from '@/components/atoms';
import styles from './Dialog.module.css';

export interface DialogProps extends Omit<ModalProps, 'footer'> {
  /** Dialog type - affects icon and styling */
  type?: 'default' | 'info' | 'warning' | 'error' | 'success';
  /** Dialog description text */
  description?: string;
  /** Primary action button text */
  primaryActionText?: string;
  /** Secondary action button text */
  secondaryActionText?: string;
  /** Callback for primary action */
  onPrimaryAction?: () => void;
  /** Callback for secondary action */
  onSecondaryAction?: () => void;
  /** Whether to show cancel button */
  showCancelButton?: boolean;
  /** Loading state for primary action */
  isPrimaryLoading?: boolean;
  /** Loading state for secondary action */
  isSecondaryLoading?: boolean;
  /** Whether primary action is destructive */
  isPrimaryDestructive?: boolean;
}

/**
 * Dialog component for common dialog patterns like confirmations, alerts, etc.
 * Built on top of Modal with pre-configured layouts and actions.
 */
export const Dialog: React.FC<DialogProps> = ({
  type = 'default',
  description,
  primaryActionText = 'Confirm',
  secondaryActionText = 'Cancel',
  onPrimaryAction,
  onSecondaryAction,
  showCancelButton = true,
  isPrimaryLoading = false,
  isSecondaryLoading = false,
  isPrimaryDestructive = false,
  onClose,
  children,
  ...modalProps
}) => {
  const handlePrimaryAction = () => {
    onPrimaryAction?.();
  };

  const handleSecondaryAction = () => {
    onSecondaryAction?.();
    if (!onSecondaryAction) {
      onClose();
    }
  };

  const typeIcons: Record<string, IconName | undefined> = {
    default: undefined,
    info: ICONS.INFO,
    warning: ICONS.WARNING,
    error: ICONS.ERROR,
    success: ICONS.SUCCESS,
  };

  const typeStyles = {
    default: styles.default,
    info: styles.info,
    warning: styles.warning,
    error: styles.error,
    success: styles.success,
  };

  const footer = (
    <div className={styles.actions}>
      {showCancelButton && (
        <Button
          variant="outline"
          onClick={handleSecondaryAction}
          disabled={isPrimaryLoading || isSecondaryLoading}
          isLoading={isSecondaryLoading}
        >
          {secondaryActionText}
        </Button>
      )}
      <Button
        variant={isPrimaryDestructive ? 'danger' : 'primary'}
        onClick={handlePrimaryAction}
        disabled={isPrimaryLoading || isSecondaryLoading}
        isLoading={isPrimaryLoading}
      >
        {primaryActionText}
      </Button>
    </div>
  );

  return (
    <Modal
      {...modalProps}
      onClose={onClose}
      size={modalProps.size || 'sm'}
      footer={footer}
      className={[typeStyles[type], modalProps.className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.content}>
        {typeIcons[type] && (
          <div className={[styles.icon, styles[`icon-${type}`]].join(' ')}>
            <Icon name={typeIcons[type]} />
          </div>
        )}

        <div className={styles.body}>
          {description && <p className={styles.description}>{description}</p>}

          {children}
        </div>
      </div>
    </Modal>
  );
};

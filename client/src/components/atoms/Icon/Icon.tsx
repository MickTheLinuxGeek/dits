import React from 'react';
import { icons, LucideIcon } from 'lucide-react';
import styles from './Icon.module.css';

export type IconName = keyof typeof icons;

export interface IconProps {
  /** Icon name from Lucide icon set */
  name: IconName;
  /** Icon size in pixels */
  size?: number | string;
  /** Icon color (CSS color value) */
  color?: string;
  /** Stroke width (1-3, default 2) */
  strokeWidth?: number;
  /** Additional CSS class */
  className?: string;
  /** Accessibility label */
  ariaLabel?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Icon component using Lucide React icons
 * 
 * @example
 * ```tsx
 * <Icon name="Check" size={24} />
 * <Icon name="X" color="red" strokeWidth={3} />
 * <Icon name="Menu" size="1.5rem" />
 * ```
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color,
  strokeWidth = 2,
  className,
  ariaLabel,
  onClick,
}) => {
  const LucideIcon = icons[name] as LucideIcon;

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in Lucide icon set`);
    return null;
  }

  const iconClasses = [
    styles.icon,
    onClick && styles.clickable,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <LucideIcon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={iconClasses}
      aria-label={ariaLabel || name}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    />
  );
};

Icon.displayName = 'Icon';

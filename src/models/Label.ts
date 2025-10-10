import { Label as PrismaLabel } from '@prisma/client';
import { ValidationResult, COLOR_REGEX } from './types';

/**
 * Label model class with color validation
 *
 * Represents a flexible categorization mechanism for issues.
 * Labels support color coding for visual organization.
 */
export class Label {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: PrismaLabel) {
    this.id = data.id;
    this.userId = data.userId;
    this.name = data.name;
    this.color = data.color;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Validate label name
   */
  static validateName(name: string): ValidationResult {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push('Label name is required');
    } else if (name.length < 1) {
      errors.push('Label name must be at least 1 character long');
    } else if (name.length > 50) {
      errors.push('Label name must not exceed 50 characters');
    }

    // Check for invalid characters
    const validNameRegex = /^[a-zA-Z0-9\s\-_]+$/;
    if (name && !validNameRegex.test(name)) {
      errors.push(
        'Label name can only contain letters, numbers, spaces, hyphens, and underscores',
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate color format (hex color)
   */
  static validateColor(color: string): ValidationResult {
    const errors: string[] = [];

    if (!color || color.trim().length === 0) {
      errors.push('Color is required');
    } else if (!COLOR_REGEX.test(color)) {
      errors.push('Color must be a valid hex color (e.g., #6366f1)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate a default color based on label name
   */
  static generateDefaultColor(name: string): string {
    const colors = [
      '#ef4444', // Red
      '#f59e0b', // Amber
      '#eab308', // Yellow
      '#84cc16', // Lime
      '#10b981', // Emerald
      '#14b8a6', // Teal
      '#06b6d4', // Cyan
      '#3b82f6', // Blue
      '#6366f1', // Indigo
      '#8b5cf6', // Violet
      '#a855f7', // Purple
      '#d946ef', // Fuchsia
      '#ec4899', // Pink
      '#f43f5e', // Rose
    ];

    // Use name hash to consistently pick a color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  /**
   * Check if color is light (for determining text color)
   */
  static isLightColor(color: string): boolean {
    // Remove # if present
    const hex = color.replace('#', '');

    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate luminance (perceived brightness)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5;
  }

  /**
   * Get contrasting text color for the label
   */
  getTextColor(): string {
    return Label.isLightColor(this.color) ? '#000000' : '#ffffff';
  }

  /**
   * Normalize label name for searching/comparing
   */
  static normalizeName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Check if two label names are equivalent
   */
  static namesMatch(name1: string, name2: string): boolean {
    return Label.normalizeName(name1) === Label.normalizeName(name2);
  }

  /**
   * Convert to plain object for JSON serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      color: this.color,
      textColor: this.getTextColor(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

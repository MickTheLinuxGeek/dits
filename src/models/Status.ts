import { Status as PrismaStatus } from '@prisma/client';
import { ValidationResult, COLOR_REGEX } from './types';

/**
 * Status model class
 *
 * Represents a state in a workflow (e.g., Todo, In Progress, Done).
 * Statuses are ordered and can be marked as "closed" states.
 */
export class Status {
  id: string;
  workflowId: string;
  name: string;
  color: string;
  position: number;
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: PrismaStatus) {
    this.id = data.id;
    this.workflowId = data.workflowId;
    this.name = data.name;
    this.color = data.color;
    this.position = data.position;
    this.isClosed = data.isClosed;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Check if this is a closed status
   */
  isClosedStatus(): boolean {
    return this.isClosed;
  }

  /**
   * Check if this is an open status
   */
  isOpenStatus(): boolean {
    return !this.isClosed;
  }

  /**
   * Validate status name
   */
  static validateName(name: string): ValidationResult {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push('Status name is required');
    } else if (name.length < 2) {
      errors.push('Status name must be at least 2 characters long');
    } else if (name.length > 50) {
      errors.push('Status name must not exceed 50 characters');
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
   * Validate position
   */
  static validatePosition(position: number): ValidationResult {
    const errors: string[] = [];

    if (position < 0) {
      errors.push('Position must be a non-negative number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate default colors for common status types
   */
  static getDefaultColorForName(name: string): string {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('todo') || lowerName.includes('backlog')) {
      return '#94a3b8'; // Slate
    } else if (
      lowerName.includes('progress') ||
      lowerName.includes('working')
    ) {
      return '#3b82f6'; // Blue
    } else if (lowerName.includes('review') || lowerName.includes('testing')) {
      return '#f59e0b'; // Amber
    } else if (lowerName.includes('done') || lowerName.includes('complete')) {
      return '#10b981'; // Emerald
    } else if (lowerName.includes('blocked') || lowerName.includes('hold')) {
      return '#ef4444'; // Red
    } else if (lowerName.includes('cancelled')) {
      return '#6b7280'; // Gray
    }

    return '#6366f1'; // Indigo (default)
  }

  /**
   * Convert to plain object for JSON serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      workflowId: this.workflowId,
      name: this.name,
      color: this.color,
      position: this.position,
      isClosed: this.isClosed,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

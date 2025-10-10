import { Workflow as PrismaWorkflow } from '@prisma/client';
import { WorkflowTransition, ValidationResult } from './types';

/**
 * Workflow model class with transition logic
 *
 * Represents a customizable status workflow for a project.
 * Workflows define the available statuses and allowed transitions between them.
 */
export class Workflow {
  id: string;
  userId: string;
  projectId: string | null;
  name: string;
  transitions: WorkflowTransition[];
  createdAt: Date;
  updatedAt: Date;

  constructor(data: PrismaWorkflow) {
    this.id = data.id;
    this.userId = data.userId;
    this.projectId = data.projectId;
    this.name = data.name;
    this.transitions = this.parseTransitions(data.transitions);
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Parse and validate workflow transitions from JSON
   */
  private parseTransitions(transitions: unknown): WorkflowTransition[] {
    if (!Array.isArray(transitions)) {
      return [];
    }
    return transitions as WorkflowTransition[];
  }

  /**
   * Check if a status transition is allowed
   */
  isTransitionAllowed(fromStatusId: string, toStatusId: string): boolean {
    // Always allow transitions to the same status (no-op)
    if (fromStatusId === toStatusId) {
      return true;
    }

    // If no transitions are defined, allow all transitions (permissive mode)
    if (this.transitions.length === 0) {
      return true;
    }

    // Check if there's an explicit transition defined
    return this.transitions.some(
      (t) => t.from === fromStatusId && t.to === toStatusId,
    );
  }

  /**
   * Get all allowed destination statuses from a given status
   */
  getAllowedTransitions(fromStatusId: string): string[] {
    if (this.transitions.length === 0) {
      // In permissive mode, no specific restrictions
      return [];
    }

    return this.transitions
      .filter((t) => t.from === fromStatusId)
      .map((t) => t.to);
  }

  /**
   * Add a new transition to the workflow
   */
  addTransition(transition: WorkflowTransition): void {
    // Check if transition already exists
    const exists = this.transitions.some(
      (t) => t.from === transition.from && t.to === transition.to,
    );

    if (!exists) {
      this.transitions.push(transition);
    }
  }

  /**
   * Remove a transition from the workflow
   */
  removeTransition(fromStatusId: string, toStatusId: string): void {
    this.transitions = this.transitions.filter(
      (t) => !(t.from === fromStatusId && t.to === toStatusId),
    );
  }

  /**
   * Check if workflow is project-specific
   */
  isProjectWorkflow(): boolean {
    return this.projectId !== null;
  }

  /**
   * Check if workflow is a global/default workflow
   */
  isGlobalWorkflow(): boolean {
    return this.projectId === null;
  }

  /**
   * Validate workflow name
   */
  static validateName(name: string): ValidationResult {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push('Workflow name is required');
    } else if (name.length < 2) {
      errors.push('Workflow name must be at least 2 characters long');
    } else if (name.length > 100) {
      errors.push('Workflow name must not exceed 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate a transition
   */
  static validateTransition(transition: WorkflowTransition): ValidationResult {
    const errors: string[] = [];

    if (!transition.from || transition.from.trim().length === 0) {
      errors.push('Transition "from" status is required');
    }

    if (!transition.to || transition.to.trim().length === 0) {
      errors.push('Transition "to" status is required');
    }

    if (transition.from === transition.to) {
      errors.push('Transition "from" and "to" must be different statuses');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a default workflow with standard statuses
   */
  static createDefaultTransitions(): WorkflowTransition[] {
    return [
      { from: 'todo', to: 'in_progress' },
      { from: 'in_progress', to: 'in_review' },
      { from: 'in_progress', to: 'blocked' },
      { from: 'in_review', to: 'done' },
      { from: 'in_review', to: 'in_progress' },
      { from: 'blocked', to: 'in_progress' },
      { from: 'done', to: 'in_progress' }, // Allow reopening
    ];
  }

  /**
   * Get transition graph for visualization
   */
  getTransitionGraph(): Record<string, string[]> {
    const graph: Record<string, string[]> = {};

    for (const transition of this.transitions) {
      if (!graph[transition.from]) {
        graph[transition.from] = [];
      }
      graph[transition.from].push(transition.to);
    }

    return graph;
  }

  /**
   * Convert to plain object for JSON serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      userId: this.userId,
      projectId: this.projectId,
      name: this.name,
      transitions: this.transitions,
      transitionGraph: this.getTransitionGraph(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

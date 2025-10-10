import {
  IssueRelation as PrismaIssueRelation,
  RelationType,
} from '@prisma/client';
import { ValidationResult } from './types';

/**
 * IssueRelation model class for tracking issue dependencies
 *
 * Represents relationships between issues (blocks, relates to, duplicates, etc.).
 * Enables dependency tracking and relationship management.
 */
export class IssueRelation {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: RelationType;
  createdAt: Date;

  constructor(data: PrismaIssueRelation) {
    this.id = data.id;
    this.sourceId = data.sourceId;
    this.targetId = data.targetId;
    this.relationType = data.relationType;
    this.createdAt = data.createdAt;
  }

  /**
   * Check if this is a blocking relationship
   */
  isBlocking(): boolean {
    return this.relationType === RelationType.BLOCKS;
  }

  /**
   * Check if this is a blocked-by relationship
   */
  isBlockedBy(): boolean {
    return this.relationType === RelationType.BLOCKED_BY;
  }

  /**
   * Check if this is a relates-to relationship
   */
  isRelatesTo(): boolean {
    return this.relationType === RelationType.RELATES_TO;
  }

  /**
   * Check if this is a duplicates relationship
   */
  isDuplicates(): boolean {
    return this.relationType === RelationType.DUPLICATES;
  }

  /**
   * Check if this is a duplicated-by relationship
   */
  isDuplicatedBy(): boolean {
    return this.relationType === RelationType.DUPLICATED_BY;
  }

  /**
   * Get the inverse relation type
   */
  static getInverseRelationType(
    relationType: RelationType,
  ): RelationType | null {
    const inverseMap: Record<RelationType, RelationType> = {
      [RelationType.BLOCKS]: RelationType.BLOCKED_BY,
      [RelationType.BLOCKED_BY]: RelationType.BLOCKS,
      [RelationType.DUPLICATES]: RelationType.DUPLICATED_BY,
      [RelationType.DUPLICATED_BY]: RelationType.DUPLICATES,
      [RelationType.RELATES_TO]: RelationType.RELATES_TO, // Symmetric
    };

    return inverseMap[relationType] || null;
  }

  /**
   * Check if a relation type is symmetric (same in both directions)
   */
  static isSymmetricRelation(relationType: RelationType): boolean {
    return relationType === RelationType.RELATES_TO;
  }

  /**
   * Check if a relation type requires an inverse relation
   */
  static requiresInverseRelation(relationType: RelationType): boolean {
    return !IssueRelation.isSymmetricRelation(relationType);
  }

  /**
   * Get human-readable description of the relation
   */
  getDescription(): string {
    const descriptions: Record<RelationType, string> = {
      [RelationType.BLOCKS]: 'blocks',
      [RelationType.BLOCKED_BY]: 'is blocked by',
      [RelationType.RELATES_TO]: 'relates to',
      [RelationType.DUPLICATES]: 'duplicates',
      [RelationType.DUPLICATED_BY]: 'is duplicated by',
    };

    return descriptions[this.relationType] || 'related to';
  }

  /**
   * Validate relation type
   */
  static validateRelationType(relationType: RelationType): ValidationResult {
    const errors: string[] = [];
    const validTypes = Object.values(RelationType);

    if (!validTypes.includes(relationType)) {
      errors.push(
        `Invalid relation type. Must be one of: ${validTypes.join(', ')}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate that source and target are different
   */
  static validateIssueIds(
    sourceId: string,
    targetId: string,
  ): ValidationResult {
    const errors: string[] = [];

    if (!sourceId || sourceId.trim().length === 0) {
      errors.push('Source issue ID is required');
    }

    if (!targetId || targetId.trim().length === 0) {
      errors.push('Target issue ID is required');
    }

    if (sourceId === targetId) {
      errors.push('Source and target issues must be different');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if creating this relation would create a circular dependency
   * Note: This is a simplified check. A full implementation would need
   * to traverse the entire dependency graph.
   */
  static wouldCreateCircularDependency(
    sourceId: string,
    targetId: string,
    relationType: RelationType,
    existingRelations: IssueRelation[],
  ): boolean {
    // Only check for blocking relationships as they affect dependency chains
    if (
      relationType !== RelationType.BLOCKS &&
      relationType !== RelationType.BLOCKED_BY
    ) {
      return false;
    }

    // Build a graph of blocking relationships
    const graph = new Map<string, Set<string>>();

    for (const relation of existingRelations) {
      if (relation.relationType === RelationType.BLOCKS) {
        if (!graph.has(relation.sourceId)) {
          graph.set(relation.sourceId, new Set());
        }
        graph.get(relation.sourceId)!.add(relation.targetId);
      }
    }

    // Add the proposed new relation
    const effectiveSource =
      relationType === RelationType.BLOCKS ? sourceId : targetId;
    const effectiveTarget =
      relationType === RelationType.BLOCKS ? targetId : sourceId;

    // Check if target already blocks source (directly or indirectly)
    const visited = new Set<string>();
    const stack = [effectiveTarget];

    while (stack.length > 0) {
      const current = stack.pop()!;

      if (current === effectiveSource) {
        return true; // Circular dependency detected
      }

      if (visited.has(current)) {
        continue;
      }

      visited.add(current);

      const blockedIssues = graph.get(current);
      if (blockedIssues) {
        stack.push(...Array.from(blockedIssues));
      }
    }

    return false;
  }

  /**
   * Convert to plain object for JSON serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      sourceId: this.sourceId,
      targetId: this.targetId,
      relationType: this.relationType,
      description: this.getDescription(),
      createdAt: this.createdAt,
    };
  }
}

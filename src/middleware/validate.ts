import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './errorHandler';

/**
 * Type for validation target
 */
type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Validation middleware factory using Zod schemas
 * @param schema Zod schema to validate against
 * @param target Which part of the request to validate (body, query, or params)
 */
export const validate =
  (schema: ZodSchema, target: ValidationTarget = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Validate the specified target
      const validated = schema.parse(req[target]);

      // Replace the request target with validated data
      req[target] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors for better readability
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        next(new AppError(400, 'Validation failed', true, errors));
      } else {
        next(error);
      }
    }
  };

/**
 * Combined validation middleware for multiple targets
 * @param schemas Object containing schemas for different targets
 */
export const validateMultiple =
  (schemas: Partial<Record<ValidationTarget, ZodSchema>>) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errors: any[] = [];

      // Validate each specified target
      for (const [target, schema] of Object.entries(schemas)) {
        if (schema) {
          try {
            const validated = schema.parse(req[target as ValidationTarget]);
            req[target as ValidationTarget] = validated;
          } catch (error) {
            if (error instanceof ZodError) {
              errors.push(
                ...error.issues.map((err) => ({
                  target,
                  field: err.path.join('.'),
                  message: err.message,
                  code: err.code,
                })),
              );
            } else {
              throw error;
            }
          }
        }
      }

      if (errors.length > 0) {
        next(new AppError(400, 'Validation failed', true, errors));
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  };

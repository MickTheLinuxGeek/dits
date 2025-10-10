"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMultiple = exports.validate = void 0;
const zod_1 = require("zod");
const errorHandler_1 = require("./errorHandler");
/**
 * Validation middleware factory using Zod schemas
 * @param schema Zod schema to validate against
 * @param target Which part of the request to validate (body, query, or params)
 */
const validate = (schema, target = 'body') => (req, _res, next) => {
    try {
        // Validate the specified target
        const validated = schema.parse(req[target]);
        // Replace the request target with validated data
        req[target] = validated;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            // Format Zod errors for better readability
            const errors = error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
                code: err.code,
            }));
            next(new errorHandler_1.AppError(400, 'Validation failed', true, errors));
        }
        else {
            next(error);
        }
    }
};
exports.validate = validate;
/**
 * Combined validation middleware for multiple targets
 * @param schemas Object containing schemas for different targets
 */
const validateMultiple = (schemas) => (req, _res, next) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const errors = [];
        // Validate each specified target
        for (const [target, schema] of Object.entries(schemas)) {
            if (schema) {
                try {
                    const validated = schema.parse(req[target]);
                    req[target] = validated;
                }
                catch (error) {
                    if (error instanceof zod_1.ZodError) {
                        errors.push(...error.issues.map((err) => ({
                            target,
                            field: err.path.join('.'),
                            message: err.message,
                            code: err.code,
                        })));
                    }
                    else {
                        throw error;
                    }
                }
            }
        }
        if (errors.length > 0) {
            next(new errorHandler_1.AppError(400, 'Validation failed', true, errors));
        }
        else {
            next();
        }
    }
    catch (error) {
        next(error);
    }
};
exports.validateMultiple = validateMultiple;

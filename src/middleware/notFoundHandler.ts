import { Request, Response } from 'express';

/**
 * 404 Not Found handler middleware
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    status: 'fail',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
  });
};

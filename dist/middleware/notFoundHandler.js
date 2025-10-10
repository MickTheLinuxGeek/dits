"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
/**
 * 404 Not Found handler middleware
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Route ${req.method} ${req.url} not found`,
        timestamp: new Date().toISOString(),
    });
};
exports.notFoundHandler = notFoundHandler;

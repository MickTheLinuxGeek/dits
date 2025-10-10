"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const issues_1 = __importDefault(require("./issues"));
const projects_1 = __importDefault(require("./projects"));
const areas_1 = __importDefault(require("./areas"));
const labels_1 = __importDefault(require("./labels"));
const workflows_1 = __importDefault(require("./workflows"));
const bulk_1 = __importDefault(require("./bulk"));
const auditLogs_1 = __importDefault(require("./auditLogs"));
/**
 * API Routes Index
 * Organizes all API routes under versioned endpoints
 */
const router = (0, express_1.Router)();
// Version 1 API routes
const v1Router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1:
 *   get:
 *     summary: API v1 information
 *     description: Returns information about API version 1
 *     tags:
 *       - API Info
 *     responses:
 *       200:
 *         description: API version information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 name:
 *                   type: string
 *                   example: "DITS API v1"
 *                 endpoints:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["/api/v1/auth", "/api/v1/issues", "/api/v1/projects"]
 */
v1Router.get('/', (_req, res) => {
    res.json({
        version: '1.0.0',
        name: 'DITS API v1',
        endpoints: [
            '/api/v1/auth',
            '/api/v1/issues',
            '/api/v1/projects',
            '/api/v1/areas',
            '/api/v1/labels',
            '/api/v1/workflows',
            '/api/v1/bulk',
            '/api/v1/audit-logs',
        ],
        graphql: '/graphql',
        docs: '/api/docs',
    });
});
// Mount auth routes
v1Router.use('/auth', auth_1.default);
// Mount CRUD routes
v1Router.use('/issues', issues_1.default);
v1Router.use('/projects', projects_1.default);
v1Router.use('/areas', areas_1.default);
v1Router.use('/labels', labels_1.default);
v1Router.use('/workflows', workflows_1.default);
v1Router.use('/bulk', bulk_1.default);
v1Router.use('/audit-logs', auditLogs_1.default);
// Mount v1 routes
router.use('/v1', v1Router);
exports.default = router;

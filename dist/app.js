"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const server_1 = require("./graphql/server");
const swagger_1 = require("./docs/swagger");
const index_1 = __importDefault(require("./routes/index"));
/**
 * Creates and configures the Express application
 */
const createApp = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = (0, express_1.default)();
    // Security middleware - must be first
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));
    // CORS configuration
    app.use((0, cors_1.default)({
        origin: env_1.config.cors.origin,
        credentials: env_1.config.cors.credentials,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
        maxAge: 86400, // 24 hours
    }));
    // Body parsing middleware
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Cookie parsing
    app.use((0, cookie_parser_1.default)(env_1.config.session.secret));
    // Compression middleware
    app.use((0, compression_1.default)());
    // Logging middleware
    if (env_1.config.app.env === 'development') {
        app.use((0, morgan_1.default)('dev'));
    }
    else {
        app.use((0, morgan_1.default)('combined'));
    }
    // Health check endpoint
    app.get('/health', (_req, res) => {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: env_1.config.app.env,
        });
    });
    // API documentation (Swagger)
    if (env_1.config.app.env === 'development' || env_1.config.development.enableApiDocs) {
        (0, swagger_1.applySwaggerMiddleware)(app);
    }
    // GraphQL endpoint (without version prefix)
    yield (0, server_1.applyGraphQLMiddleware)(app);
    // API routes (all versions)
    app.use('/api', index_1.default);
    // 404 handler - must be after all routes
    app.use(notFoundHandler_1.notFoundHandler);
    // Error handling middleware - must be last
    app.use(errorHandler_1.errorHandler);
    return app;
});
exports.createApp = createApp;

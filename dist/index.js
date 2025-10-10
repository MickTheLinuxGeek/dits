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
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const prisma_1 = require("./database/prisma");
const redis_1 = require("./database/redis");
/**
 * Main server startup function
 */
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Validate configuration
            console.log('Validating configuration...');
            (0, env_1.validateConfig)();
            // Connect to database
            console.log('Connecting to PostgreSQL database...');
            yield (0, prisma_1.connectDatabase)();
            // Connect to Redis
            console.log('Connecting to Redis...');
            yield (0, redis_1.connectRedis)();
            // Create Express app
            console.log('Creating Express application...');
            const app = yield (0, app_1.createApp)();
            // Start server
            const port = env_1.config.app.port;
            app.listen(port, () => {
                console.log(`\n🚀 Server started successfully!`);
                console.log(`Environment: ${env_1.config.app.env}`);
                console.log(`Server URL: ${env_1.config.app.url}`);
                console.log(`GraphQL Playground: ${env_1.config.app.url}/graphql`);
                if (env_1.config.app.env === 'development' ||
                    env_1.config.development.enableApiDocs) {
                    console.log(`API Documentation: ${env_1.config.app.url}/api/docs`);
                }
                console.log('\nPress CTRL-C to stop\n');
            });
        }
        catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    });
}
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Handle SIGTERM
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});
// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    process.exit(0);
});
// Start the server
startServer();

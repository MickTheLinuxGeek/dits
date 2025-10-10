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
exports.getDatabaseConnectionInfo = exports.testDatabaseConnection = exports.disconnectDatabase = exports.connectDatabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
/**
 * PrismaClient singleton instance
 * Uses connection pooling with configuration from environment variables
 */
class DatabaseClient {
    /**
     * Get or create the Prisma Client instance
     */
    static getInstance() {
        if (!DatabaseClient.instance) {
            DatabaseClient.instance = new client_1.PrismaClient({
                log: (0, env_1.isDevelopment)()
                    ? ['query', 'info', 'warn', 'error']
                    : ['warn', 'error'],
                errorFormat: (0, env_1.isDevelopment)() ? 'pretty' : 'minimal',
            });
            // Handle shutdown gracefully
            process.on('beforeExit', () => __awaiter(this, void 0, void 0, function* () {
                yield DatabaseClient.disconnect();
            }));
        }
        return DatabaseClient.instance;
    }
    /**
     * Disconnect from the database
     */
    static disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (DatabaseClient.instance) {
                yield DatabaseClient.instance.$disconnect();
                DatabaseClient.instance = null;
            }
        });
    }
    /**
     * Test database connection
     */
    static testConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = DatabaseClient.getInstance();
                yield client.$queryRaw `SELECT 1`;
                return true;
            }
            catch (error) {
                console.error('Database connection test failed:', error);
                return false;
            }
        });
    }
    /**
     * Get connection pool status
     */
    static getConnectionInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const client = DatabaseClient.getInstance();
                const result = yield client.$queryRaw `SELECT count(*) as count FROM pg_stat_activity WHERE datname = current_database()`;
                return {
                    connected: true,
                    poolSize: Number(((_a = result[0]) === null || _a === void 0 ? void 0 : _a.count) || 0),
                };
            }
            catch (_b) {
                return {
                    connected: false,
                };
            }
        });
    }
}
DatabaseClient.instance = null;
// Export singleton instance
exports.prisma = DatabaseClient.getInstance();
// Export utility functions
exports.connectDatabase = DatabaseClient.getInstance;
exports.disconnectDatabase = DatabaseClient.disconnect;
exports.testDatabaseConnection = DatabaseClient.testConnection;
exports.getDatabaseConnectionInfo = DatabaseClient.getConnectionInfo;

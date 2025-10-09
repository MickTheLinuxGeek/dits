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
exports.refreshSessionExpiry = exports.deleteSession = exports.getSession = exports.setSession = exports.deleteCachePattern = exports.deleteCache = exports.getCache = exports.setCache = exports.getRedisInfo = exports.testRedisConnection = exports.disconnectRedis = exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../config/env");
/**
 * Redis client singleton for caching and session management
 */
class RedisClient {
    /**
     * Get or create the Redis client instance
     */
    static getInstance() {
        if (!RedisClient.instance) {
            const options = {
                host: env_1.config.redis.host,
                port: env_1.config.redis.port,
                password: env_1.config.redis.password,
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                maxRetriesPerRequest: 3,
                enableReadyCheck: true,
                lazyConnect: false,
            };
            RedisClient.instance = new ioredis_1.default(options);
            // Event listeners
            RedisClient.instance.on('connect', () => {
                if ((0, env_1.isDevelopment)()) {
                    console.log('Redis: Connected');
                }
            });
            RedisClient.instance.on('ready', () => {
                if ((0, env_1.isDevelopment)()) {
                    console.log('Redis: Ready');
                }
            });
            RedisClient.instance.on('error', (error) => {
                console.error('Redis: Error', error);
            });
            RedisClient.instance.on('close', () => {
                if ((0, env_1.isDevelopment)()) {
                    console.log('Redis: Connection closed');
                }
            });
            RedisClient.instance.on('reconnecting', () => {
                if ((0, env_1.isDevelopment)()) {
                    console.log('Redis: Reconnecting...');
                }
            });
            // Handle shutdown gracefully
            process.on('beforeExit', () => __awaiter(this, void 0, void 0, function* () {
                yield RedisClient.disconnect();
            }));
        }
        return RedisClient.instance;
    }
    /**
     * Disconnect from Redis
     */
    static disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (RedisClient.instance) {
                yield RedisClient.instance.quit();
                RedisClient.instance = null;
            }
        });
    }
    /**
     * Test Redis connection
     */
    static testConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = RedisClient.getInstance();
                const result = yield client.ping();
                return result === 'PONG';
            }
            catch (error) {
                console.error('Redis connection test failed:', error);
                return false;
            }
        });
    }
    /**
     * Get Redis info
     */
    static getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const client = RedisClient.getInstance();
                const info = yield client.info();
                const parseInfo = (infoString) => {
                    const lines = infoString.split('\r\n');
                    const result = {};
                    for (const line of lines) {
                        if (line && !line.startsWith('#')) {
                            const [key, value] = line.split(':');
                            if (key && value) {
                                result[key] = value;
                            }
                        }
                    }
                    return result;
                };
                const parsed = parseInfo(info);
                return {
                    connected: true,
                    version: parsed['redis_version'],
                    usedMemory: parsed['used_memory_human'],
                    connectedClients: parseInt(parsed['connected_clients'] || '0', 10),
                };
            }
            catch (_a) {
                return {
                    connected: false,
                };
            }
        });
    }
    /**
     * Cache helper methods
     */
    static setCache(key, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value, expirySeconds) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = RedisClient.getInstance();
            const serialized = JSON.stringify(value);
            if (expirySeconds) {
                yield client.setex(key, expirySeconds, serialized);
            }
            else {
                yield client.set(key, serialized);
            }
        });
    }
    static getCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = RedisClient.getInstance();
            const value = yield client.get(key);
            if (!value) {
                return null;
            }
            try {
                return JSON.parse(value);
            }
            catch (error) {
                console.error('Failed to parse cached value:', error);
                return null;
            }
        });
    }
    static deleteCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = RedisClient.getInstance();
            yield client.del(key);
        });
    }
    static deleteCachePattern(pattern) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = RedisClient.getInstance();
            const keys = yield client.keys(pattern);
            if (keys.length === 0) {
                return 0;
            }
            return yield client.del(...keys);
        });
    }
    /**
     * Session helper methods
     */
    static setSession(sessionId_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (sessionId, 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data, expirySeconds = 86400) {
            const key = `session:${sessionId}`;
            yield RedisClient.setCache(key, data, expirySeconds);
        });
    }
    static getSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `session:${sessionId}`;
            return yield RedisClient.getCache(key);
        });
    }
    static deleteSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `session:${sessionId}`;
            yield RedisClient.deleteCache(key);
        });
    }
    static refreshSessionExpiry(sessionId, expirySeconds) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `session:${sessionId}`;
            const client = RedisClient.getInstance();
            yield client.expire(key, expirySeconds);
        });
    }
}
RedisClient.instance = null;
// Export singleton instance
exports.redis = RedisClient.getInstance();
// Export utility functions
exports.disconnectRedis = RedisClient.disconnect;
exports.testRedisConnection = RedisClient.testConnection;
exports.getRedisInfo = RedisClient.getInfo;
// Export cache helpers
exports.setCache = RedisClient.setCache;
exports.getCache = RedisClient.getCache;
exports.deleteCache = RedisClient.deleteCache;
exports.deleteCachePattern = RedisClient.deleteCachePattern;
// Export session helpers
exports.setSession = RedisClient.setSession;
exports.getSession = RedisClient.getSession;
exports.deleteSession = RedisClient.deleteSession;
exports.refreshSessionExpiry = RedisClient.refreshSessionExpiry;

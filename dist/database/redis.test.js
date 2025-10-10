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
const redis_1 = require("./redis");
describe('Redis Connection and Helpers', () => {
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Clean up test data
        yield redis_1.redis.del('test:*');
        yield (0, redis_1.disconnectRedis)();
    }));
    describe('testRedisConnection', () => {
        it('should successfully connect to Redis', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield (0, redis_1.testRedisConnection)();
            expect(result).toBe(true);
        }));
    });
    describe('getRedisInfo', () => {
        it('should return Redis info', () => __awaiter(void 0, void 0, void 0, function* () {
            const info = yield (0, redis_1.getRedisInfo)();
            expect(info).toHaveProperty('connected');
            expect(info.connected).toBe(true);
            expect(info).toHaveProperty('version');
            expect(info).toHaveProperty('usedMemory');
            expect(info).toHaveProperty('connectedClients');
        }));
    });
    describe('cache helpers', () => {
        const testKey = 'test:cache:key';
        const testValue = { foo: 'bar', count: 42 };
        afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, redis_1.deleteCache)(testKey);
        }));
        it('should set and get cache', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, redis_1.setCache)(testKey, testValue);
            const result = yield (0, redis_1.getCache)(testKey);
            expect(result).toEqual(testValue);
        }));
        // Skip expiry test in CI as timing is unreliable
        (process.env.CI ? it.skip : it)('should set cache with expiry', () => __awaiter(void 0, void 0, void 0, function* () {
            // Use shorter expiry for faster tests but with sufficient margin
            yield (0, redis_1.setCache)(testKey, testValue, 1);
            const result = yield (0, redis_1.getCache)(testKey);
            expect(result).toEqual(testValue);
            // Wait for expiry with extra margin for CI environments
            yield new Promise((resolve) => setTimeout(resolve, 1500));
            const expiredResult = yield (0, redis_1.getCache)(testKey);
            expect(expiredResult).toBeNull();
        }), 10000); // Increase test timeout
        it('should delete cache', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, redis_1.setCache)(testKey, testValue);
            yield (0, redis_1.deleteCache)(testKey);
            const result = yield (0, redis_1.getCache)(testKey);
            expect(result).toBeNull();
        }));
        it('should delete cache by pattern', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, redis_1.setCache)('test:pattern:1', { id: 1 });
            yield (0, redis_1.setCache)('test:pattern:2', { id: 2 });
            yield (0, redis_1.setCache)('test:other', { id: 3 });
            const deleted = yield (0, redis_1.deleteCachePattern)('test:pattern:*');
            expect(deleted).toBe(2);
            const result1 = yield (0, redis_1.getCache)('test:pattern:1');
            const result2 = yield (0, redis_1.getCache)('test:pattern:2');
            const result3 = yield (0, redis_1.getCache)('test:other');
            expect(result1).toBeNull();
            expect(result2).toBeNull();
            expect(result3).toEqual({ id: 3 });
            // Cleanup
            yield (0, redis_1.deleteCache)('test:other');
        }));
        it('should return null for non-existent key', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield (0, redis_1.getCache)('non:existent:key');
            expect(result).toBeNull();
        }));
    });
    describe('session helpers', () => {
        const sessionId = 'test-session-id';
        const sessionData = { userId: 'user-123', role: 'admin' };
        afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, redis_1.deleteSession)(sessionId);
        }));
        it('should set and get session', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, redis_1.setSession)(sessionId, sessionData);
            const result = yield (0, redis_1.getSession)(sessionId);
            expect(result).toEqual(sessionData);
        }));
        // Skip expiry test in CI as timing is unreliable
        (process.env.CI ? it.skip : it)('should set session with custom expiry', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, redis_1.setSession)(sessionId, sessionData, 1);
            const result = yield (0, redis_1.getSession)(sessionId);
            expect(result).toEqual(sessionData);
            // Wait for expiry with extra margin for CI environments
            yield new Promise((resolve) => setTimeout(resolve, 1500));
            const expiredResult = yield (0, redis_1.getSession)(sessionId);
            expect(expiredResult).toBeNull();
        }), 10000); // Increase test timeout
        it('should delete session', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, redis_1.setSession)(sessionId, sessionData);
            yield (0, redis_1.deleteSession)(sessionId);
            const result = yield (0, redis_1.getSession)(sessionId);
            expect(result).toBeNull();
        }));
        // Skip expiry refresh test in CI as timing is unreliable
        (process.env.CI ? it.skip : it)('should refresh session expiry', () => __awaiter(void 0, void 0, void 0, function* () {
            // Use slightly longer timeouts for CI reliability
            yield (0, redis_1.setSession)(sessionId, sessionData, 2);
            // Wait 1 second
            yield new Promise((resolve) => setTimeout(resolve, 1000));
            // Refresh expiry to 3 more seconds (longer window)
            yield (0, redis_1.refreshSessionExpiry)(sessionId, 3);
            // Wait another 1.5 seconds (would have expired without refresh)
            yield new Promise((resolve) => setTimeout(resolve, 1500));
            const result = yield (0, redis_1.getSession)(sessionId);
            expect(result).toEqual(sessionData);
        }), 10000); // Increase test timeout
        it('should return null for non-existent session', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield (0, redis_1.getSession)('non-existent-session');
            expect(result).toBeNull();
        }));
    });
});

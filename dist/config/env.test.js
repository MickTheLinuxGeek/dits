"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./env");
describe('Environment Configuration', () => {
    describe('config object', () => {
        it('should have app configuration', () => {
            expect(env_1.config.app).toBeDefined();
            expect(env_1.config.app.env).toBeDefined();
            expect(env_1.config.app.port).toBeGreaterThan(0);
            expect(env_1.config.app.url).toBeDefined();
        });
        it('should have database configuration', () => {
            expect(env_1.config.database).toBeDefined();
            expect(env_1.config.database.host).toBeDefined();
            expect(env_1.config.database.port).toBeGreaterThan(0);
            expect(env_1.config.database.name).toBeDefined();
            expect(env_1.config.database.url).toBeDefined();
        });
        it('should have redis configuration', () => {
            expect(env_1.config.redis).toBeDefined();
            expect(env_1.config.redis.host).toBeDefined();
            expect(env_1.config.redis.port).toBeGreaterThan(0);
        });
        it('should have jwt configuration', () => {
            expect(env_1.config.jwt).toBeDefined();
            expect(env_1.config.jwt.secret).toBeDefined();
            expect(env_1.config.jwt.refreshSecret).toBeDefined();
            expect(env_1.config.jwt.expiresIn).toBeDefined();
            expect(env_1.config.jwt.refreshExpiresIn).toBeDefined();
        });
        it('should have feature flags', () => {
            expect(env_1.config.features).toBeDefined();
            expect(typeof env_1.config.features.gitIntegration).toBe('boolean');
            expect(typeof env_1.config.features.webhooks).toBe('boolean');
            expect(typeof env_1.config.features.analytics).toBe('boolean');
        });
    });
    describe('validateConfig', () => {
        it('should not throw in development mode', () => {
            // In test mode (current environment), it should not throw
            expect(() => (0, env_1.validateConfig)()).not.toThrow();
        });
        it('should validate configuration structure', () => {
            // Simply verify validateConfig can be called
            expect(env_1.validateConfig).toBeDefined();
            expect(typeof env_1.validateConfig).toBe('function');
        });
    });
    describe('environment helpers', () => {
        it('should correctly identify environment', () => {
            // These functions check config.app.env which is set at module load time
            expect(typeof (0, env_1.isDevelopment)()).toBe('boolean');
            expect(typeof (0, env_1.isProduction)()).toBe('boolean');
            expect(typeof (0, env_1.isTest)()).toBe('boolean');
            // Only one should be true
            const results = [(0, env_1.isDevelopment)(), (0, env_1.isProduction)(), (0, env_1.isTest)()];
            const trueCount = results.filter(Boolean).length;
            expect(trueCount).toBe(1);
        });
        it('should be consistent with config.app.env', () => {
            if (env_1.config.app.env === 'development') {
                expect((0, env_1.isDevelopment)()).toBe(true);
                expect((0, env_1.isProduction)()).toBe(false);
                expect((0, env_1.isTest)()).toBe(false);
            }
            else if (env_1.config.app.env === 'production') {
                expect((0, env_1.isDevelopment)()).toBe(false);
                expect((0, env_1.isProduction)()).toBe(true);
                expect((0, env_1.isTest)()).toBe(false);
            }
            else if (env_1.config.app.env === 'test') {
                expect((0, env_1.isDevelopment)()).toBe(false);
                expect((0, env_1.isProduction)()).toBe(false);
                expect((0, env_1.isTest)()).toBe(true);
            }
        });
    });
    describe('default values', () => {
        it('should provide sensible defaults for database', () => {
            expect(env_1.config.database.pool.min).toBeGreaterThanOrEqual(1);
            expect(env_1.config.database.pool.max).toBeGreaterThanOrEqual(env_1.config.database.pool.min);
        });
        it('should provide default bcrypt rounds', () => {
            expect(env_1.config.bcrypt.rounds).toBeGreaterThanOrEqual(10);
        });
        it('should provide default rate limiting values', () => {
            expect(env_1.config.rateLimit.windowMs).toBeGreaterThan(0);
            expect(env_1.config.rateLimit.maxRequests).toBeGreaterThan(0);
        });
    });
});

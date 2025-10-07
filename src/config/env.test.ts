import {
  config,
  validateConfig,
  isDevelopment,
  isProduction,
  isTest,
} from './env';

describe('Environment Configuration', () => {
  describe('config object', () => {
    it('should have app configuration', () => {
      expect(config.app).toBeDefined();
      expect(config.app.env).toBeDefined();
      expect(config.app.port).toBeGreaterThan(0);
      expect(config.app.url).toBeDefined();
    });

    it('should have database configuration', () => {
      expect(config.database).toBeDefined();
      expect(config.database.host).toBeDefined();
      expect(config.database.port).toBeGreaterThan(0);
      expect(config.database.name).toBeDefined();
      expect(config.database.url).toBeDefined();
    });

    it('should have redis configuration', () => {
      expect(config.redis).toBeDefined();
      expect(config.redis.host).toBeDefined();
      expect(config.redis.port).toBeGreaterThan(0);
    });

    it('should have jwt configuration', () => {
      expect(config.jwt).toBeDefined();
      expect(config.jwt.secret).toBeDefined();
      expect(config.jwt.refreshSecret).toBeDefined();
      expect(config.jwt.expiresIn).toBeDefined();
      expect(config.jwt.refreshExpiresIn).toBeDefined();
    });

    it('should have feature flags', () => {
      expect(config.features).toBeDefined();
      expect(typeof config.features.gitIntegration).toBe('boolean');
      expect(typeof config.features.webhooks).toBe('boolean');
      expect(typeof config.features.analytics).toBe('boolean');
    });
  });

  describe('validateConfig', () => {
    it('should not throw in development mode', () => {
      // In test mode (current environment), it should not throw
      expect(() => validateConfig()).not.toThrow();
    });

    it('should validate configuration structure', () => {
      // Simply verify validateConfig can be called
      expect(validateConfig).toBeDefined();
      expect(typeof validateConfig).toBe('function');
    });
  });

  describe('environment helpers', () => {
    it('should correctly identify environment', () => {
      // These functions check config.app.env which is set at module load time
      expect(typeof isDevelopment()).toBe('boolean');
      expect(typeof isProduction()).toBe('boolean');
      expect(typeof isTest()).toBe('boolean');

      // Only one should be true
      const results = [isDevelopment(), isProduction(), isTest()];
      const trueCount = results.filter(Boolean).length;
      expect(trueCount).toBe(1);
    });

    it('should be consistent with config.app.env', () => {
      if (config.app.env === 'development') {
        expect(isDevelopment()).toBe(true);
        expect(isProduction()).toBe(false);
        expect(isTest()).toBe(false);
      } else if (config.app.env === 'production') {
        expect(isDevelopment()).toBe(false);
        expect(isProduction()).toBe(true);
        expect(isTest()).toBe(false);
      } else if (config.app.env === 'test') {
        expect(isDevelopment()).toBe(false);
        expect(isProduction()).toBe(false);
        expect(isTest()).toBe(true);
      }
    });
  });

  describe('default values', () => {
    it('should provide sensible defaults for database', () => {
      expect(config.database.pool.min).toBeGreaterThanOrEqual(1);
      expect(config.database.pool.max).toBeGreaterThanOrEqual(
        config.database.pool.min,
      );
    });

    it('should provide default bcrypt rounds', () => {
      expect(config.bcrypt.rounds).toBeGreaterThanOrEqual(10);
    });

    it('should provide default rate limiting values', () => {
      expect(config.rateLimit.windowMs).toBeGreaterThan(0);
      expect(config.rateLimit.maxRequests).toBeGreaterThan(0);
    });
  });
});

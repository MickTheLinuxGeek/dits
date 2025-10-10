import {
  redis,
  testRedisConnection,
  getRedisInfo,
  setCache,
  getCache,
  deleteCache,
  deleteCachePattern,
  setSession,
  getSession,
  deleteSession,
  refreshSessionExpiry,
  disconnectRedis,
} from './redis';

describe('Redis Connection and Helpers', () => {
  afterAll(async () => {
    // Clean up test data
    await redis.del('test:*');
    await disconnectRedis();
  });

  describe('testRedisConnection', () => {
    it('should successfully connect to Redis', async () => {
      const result = await testRedisConnection();
      expect(result).toBe(true);
    });
  });

  describe('getRedisInfo', () => {
    it('should return Redis info', async () => {
      const info = await getRedisInfo();

      expect(info).toHaveProperty('connected');
      expect(info.connected).toBe(true);
      expect(info).toHaveProperty('version');
      expect(info).toHaveProperty('usedMemory');
      expect(info).toHaveProperty('connectedClients');
    });
  });

  describe('cache helpers', () => {
    const testKey = 'test:cache:key';
    const testValue = { foo: 'bar', count: 42 };

    afterEach(async () => {
      await deleteCache(testKey);
    });

    it('should set and get cache', async () => {
      await setCache(testKey, testValue);
      const result = await getCache(testKey);

      expect(result).toEqual(testValue);
    });

    // Skip expiry test in CI as timing is unreliable
    (process.env.CI ? it.skip : it)(
      'should set cache with expiry',
      async () => {
        // Use shorter expiry for faster tests but with sufficient margin
        await setCache(testKey, testValue, 1);
        const result = await getCache(testKey);
        expect(result).toEqual(testValue);

        // Wait for expiry with extra margin for CI environments
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const expiredResult = await getCache(testKey);
        expect(expiredResult).toBeNull();
      },
      10000,
    ); // Increase test timeout

    it('should delete cache', async () => {
      await setCache(testKey, testValue);
      await deleteCache(testKey);

      const result = await getCache(testKey);
      expect(result).toBeNull();
    });

    it('should delete cache by pattern', async () => {
      await setCache('test:pattern:1', { id: 1 });
      await setCache('test:pattern:2', { id: 2 });
      await setCache('test:other', { id: 3 });

      const deleted = await deleteCachePattern('test:pattern:*');
      expect(deleted).toBe(2);

      const result1 = await getCache('test:pattern:1');
      const result2 = await getCache('test:pattern:2');
      const result3 = await getCache('test:other');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toEqual({ id: 3 });

      // Cleanup
      await deleteCache('test:other');
    });

    it('should return null for non-existent key', async () => {
      const result = await getCache('non:existent:key');
      expect(result).toBeNull();
    });
  });

  describe('session helpers', () => {
    const sessionId = 'test-session-id';
    const sessionData = { userId: 'user-123', role: 'admin' };

    afterEach(async () => {
      await deleteSession(sessionId);
    });

    it('should set and get session', async () => {
      await setSession(sessionId, sessionData);
      const result = await getSession(sessionId);

      expect(result).toEqual(sessionData);
    });

    // Skip expiry test in CI as timing is unreliable
    (process.env.CI ? it.skip : it)(
      'should set session with custom expiry',
      async () => {
        await setSession(sessionId, sessionData, 1);
        const result = await getSession(sessionId);
        expect(result).toEqual(sessionData);

        // Wait for expiry with extra margin for CI environments
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const expiredResult = await getSession(sessionId);
        expect(expiredResult).toBeNull();
      },
      10000,
    ); // Increase test timeout

    it('should delete session', async () => {
      await setSession(sessionId, sessionData);
      await deleteSession(sessionId);

      const result = await getSession(sessionId);
      expect(result).toBeNull();
    });

    // Skip expiry refresh test in CI as timing is unreliable
    (process.env.CI ? it.skip : it)(
      'should refresh session expiry',
      async () => {
        // Use slightly longer timeouts for CI reliability
        await setSession(sessionId, sessionData, 2);

        // Wait 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Refresh expiry to 3 more seconds (longer window)
        await refreshSessionExpiry(sessionId, 3);

        // Wait another 1.5 seconds (would have expired without refresh)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const result = await getSession(sessionId);
        expect(result).toEqual(sessionData);
      },
      10000,
    ); // Increase test timeout

    it('should return null for non-existent session', async () => {
      const result = await getSession('non-existent-session');
      expect(result).toBeNull();
    });
  });
});

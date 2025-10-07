import {
  prisma,
  testDatabaseConnection,
  getDatabaseConnectionInfo,
  disconnectDatabase,
} from './prisma';

describe('Prisma Database Connection', () => {
  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('testDatabaseConnection', () => {
    it('should successfully connect to the database', async () => {
      const result = await testDatabaseConnection();
      expect(result).toBe(true);
    });
  });

  describe('getDatabaseConnectionInfo', () => {
    it('should return connection info', async () => {
      const info = await getDatabaseConnectionInfo();

      expect(info).toHaveProperty('connected');
      expect(info.connected).toBe(true);
      expect(info).toHaveProperty('poolSize');
      expect(typeof info.poolSize).toBe('number');
    });
  });

  describe('prisma client', () => {
    it('should be defined', () => {
      expect(prisma).toBeDefined();
    });

    it('should execute a simple query', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as value`;
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

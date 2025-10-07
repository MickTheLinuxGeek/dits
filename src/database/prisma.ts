import { PrismaClient } from '@prisma/client';
import { isDevelopment } from '../config/env';

/**
 * PrismaClient singleton instance
 * Uses connection pooling with configuration from environment variables
 */
class DatabaseClient {
  private static instance: PrismaClient | null = null;

  /**
   * Get or create the Prisma Client instance
   */
  static getInstance(): PrismaClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new PrismaClient({
        log: isDevelopment()
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error'],
        errorFormat: isDevelopment() ? 'pretty' : 'minimal',
      });

      // Handle shutdown gracefully
      process.on('beforeExit', async () => {
        await DatabaseClient.disconnect();
      });
    }

    return DatabaseClient.instance;
  }

  /**
   * Disconnect from the database
   */
  static async disconnect(): Promise<void> {
    if (DatabaseClient.instance) {
      await DatabaseClient.instance.$disconnect();
      DatabaseClient.instance = null;
    }
  }

  /**
   * Test database connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const client = DatabaseClient.getInstance();
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Get connection pool status
   */
  static async getConnectionInfo(): Promise<{
    connected: boolean;
    poolSize?: number;
  }> {
    try {
      const client = DatabaseClient.getInstance();
      const result = await client.$queryRaw<
        Array<{ count: bigint }>
      >`SELECT count(*) as count FROM pg_stat_activity WHERE datname = current_database()`;

      return {
        connected: true,
        poolSize: Number(result[0]?.count || 0),
      };
    } catch {
      return {
        connected: false,
      };
    }
  }
}

// Export singleton instance
export const prisma = DatabaseClient.getInstance();

// Export utility functions
export const disconnectDatabase = DatabaseClient.disconnect;
export const testDatabaseConnection = DatabaseClient.testConnection;
export const getDatabaseConnectionInfo = DatabaseClient.getConnectionInfo;

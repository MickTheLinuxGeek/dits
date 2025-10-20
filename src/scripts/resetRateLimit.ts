#!/usr/bin/env node
import { redis as redisClient } from '../database/redis';

/**
 * CLI utility to reset rate limits
 * Usage: npx tsx src/scripts/resetRateLimit.ts [ip-address]
 * If no IP is provided, clears all rate limits
 */
async function main() {
  try {
    const ipAddress = process.argv[2];

    if (ipAddress) {
      // Clear rate limits for specific IP
      const pattern = `rate_limit:*:${ipAddress}:*`;
      const keys = await redisClient.keys(pattern);

      if (keys.length === 0) {
        console.log(`No rate limit keys found for IP: ${ipAddress}`);
      } else {
        await Promise.all(keys.map((key) => redisClient.del(key)));
        console.log(
          `Cleared ${keys.length} rate limit key(s) for IP: ${ipAddress}`,
        );
      }
    } else {
      // Clear all rate limits
      const pattern = 'rate_limit:*';
      const keys = await redisClient.keys(pattern);

      if (keys.length === 0) {
        console.log('No rate limit keys found');
      } else {
        await Promise.all(keys.map((key) => redisClient.del(key)));
        console.log(`Cleared ${keys.length} rate limit key(s)`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error resetting rate limits:', error);
    process.exit(1);
  }
}

main();

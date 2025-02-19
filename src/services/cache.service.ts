import Redis from 'ioredis';
import * as dotenv from "dotenv";

dotenv.config();

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

/**
 * Set cache with expiration
 * @param key - Cache key
 * @param value - Data to store
 * @param ttl - Expiration time in seconds
 */
export const setCache = async (key: string, value: any, ttl: number = 600) => {
  try {
    await redisClient.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (error) {
    console.error('Error setting cache:', error);
  }
};

/**
 * Get cached data
 * @param key - Cache key
 * @returns Cached data or null
 */
export const getCache = async (key: string) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
};

export async function invalidateTicketCache() {
    try {
        const keys = await redisClient.keys('tickets:page=*');
        if (keys.length > 0) {
            await redisClient.del(...keys);
            console.log('Ticket cache invalidated successfully');
        } else {
            console.log('No cached ticket entries found');
        }
    } catch (error) {
        console.error('Error invalidating ticket cache:', error);
    }
}

export default redisClient;

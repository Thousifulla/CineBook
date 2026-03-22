const Redis = require('ioredis');

let redisClient = null;

const connectRedis = async () => {
    try {
        redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            // Automatically reconnect with exponential backoff
            retryStrategy: (times) => Math.min(times * 100, 3000),
            enableReadyCheck: false,
            maxRetriesPerRequest: 1,
        });

        redisClient.on('connect', () => console.log('✅ Redis Connected'));
        redisClient.on('error', (err) => console.error('Redis Error:', err.message));

        return redisClient;
    } catch (error) {
        console.error('❌ Redis connection failed:', error.message);
    }
};

/**
 * Returns the active ioredis client instance.
 * Throws if connectRedis() hasn't been called yet.
 */
const getRedis = () => {
    if (!redisClient) {
        throw new Error('Redis client not initialised — call connectRedis() first');
    }
    return redisClient;
};

module.exports = connectRedis;
module.exports.getRedis = getRedis;
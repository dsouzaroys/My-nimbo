const redis = require('redis');
const Redis = require('ioredis');
const Queue = require('bull');
const crypto = require('crypto');

/**
 * Redis Queue Job/Batch processing.
 */
exports.RedisQueue = (name) => {

    return new Queue(name, {
        redis: {
            port: Number(process.env.REDIS_PORT),
            host: process.env.REDIS_HOST, 
            password: process.env.REDIS_PASSWORD
        }
    });

}

/**
 * Global Redis cache Set Handler.
 */
exports.SetCacheHandler = async (keyData, value, exp = 60) => {

    /* Generate hash. */
    const key = crypto.createHash('sha256').update(JSON.stringify(keyData)).digest('hex');

    /* Create Redis Client. */
    var redis = await global.redis;

    /* Set value to redis cache using hash key. */
    try {

        var result = await redis.set(key, JSON.stringify(value), 'EX', exp);
        if(result) {
            return result;
        } else {
            return null;
        }
        
    } catch (err) {
        return null;
    }

}

/**
 * Global Redis cache Get Handler.
 */
exports.GetCacheHandler = async (keyData) => {

    /* Generate hash. */
    const key = crypto.createHash('sha256').update(JSON.stringify(keyData)).digest('hex');

    /* Create Redis Client. */
    var redis = await global.redis;

    /* Get cache data using key. */
    var result = await redis.get(key);
    return JSON.parse(result);

}

/**
 * Global Redis cache Multiple data get handler.
 */
exports.MultipleGetCacheHandler = async () => {

    var result = await redis.mget(['key1', 'key2', 'key3']);
    return JSON.parse(result);

}

/**
 * Global Redis cache Flush all Handler.
 */
exports.FlushCacheHandler = async () => {

    /* Create Redis Client. */
    var redis = await global.redis;

    redis.flushall();
    return;

}
const Redis = require('ioredis');

const isTest = process.env.NODE_ENV === 'test';

const redis = process.env.REDIS_URL 
    ? new Redis(process.env.REDIS_URL, { tls: {} })
    : new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        maxRetriesPerRequest: isTest ? 0 : 20,
        lazyConnect: isTest,
        enableOfflineQueue: !isTest
    });


module.exports = redis;
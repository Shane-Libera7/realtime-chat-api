const Redis = require('ioredis');
const redis = process.env.REDIS_URL 
    ? new Redis(process.env.REDIS_URL, { tls: {} })
    : new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    });


module.exports = redis;
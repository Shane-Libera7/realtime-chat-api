const redis = require('../redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');

const messageLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl:message',
    points: 10,
    duration: 10
});

const directMessageLimiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl:directmessage',
    points: 10,
    duration: 10
});
module.exports = { messageLimiter, directMessageLimiter };
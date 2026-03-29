const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const redis = require('../../redis');

//Auth middleware 
router.use(authMiddleware);


//Get online Users route
router.get('/online', async (req, res, next) => {
    try {
        const keys = await redis.keys('presence:*');
        const userIds = keys.map(key => key.replace('presence:', ''));
        return res.status(200).json(userIds);
    } catch(e){
        next(e);
    }
});
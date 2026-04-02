const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

router.get('/direct/:userId', authenticateToken, async (req, res) => {
    const currentUser = req.user.userId;
    const otherUser = parseInt(req.params.userId);

    try {
        const messages = await db('direct_messages')
            .where(function() {
                this.where('sender_id', currentUser).andWhere('recipient_id', otherUser)
            })
            .orWhere(function() {
                this.where('sender_id', otherUser).andWhere('recipient_id', currentUser)
            })
            .orderBy('created_at', 'asc');

        res.json(messages);
    } catch(e) {
        console.log(e);
        res.status(500).json({ message: 'Failed to fetch DM history' });
    }
});

module.exports = router;
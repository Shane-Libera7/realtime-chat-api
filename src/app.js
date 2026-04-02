require('dotenv').config();
const express = require('express');
const app = express();
const roomRoutes = require('./routes/rooms/index');
const messageRoutes = require('./routes/messages');

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/rooms', roomRoutes);

app.use('/messages', messageRoutes);

module.exports = app;
require('dotenv').config();
const express = require('express');
const app = express();
const roomRoutes = require('./routes/rooms/index');

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/rooms', roomRoutes);

module.exports = app;
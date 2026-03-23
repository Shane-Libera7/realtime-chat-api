const express = require('express');
const app = express();
const socket = require('socket.io');
const port = 3000;
const http = require('http');
const server = http.createServer(app);
const io = new socket.Server(server, {
    cors: {
        origin: '*'
    }
});

//Activate server
server.listen(port);


//Conection listener 
io.on('connection', (socket) => {
    console.log('a client has connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('client has disconnected:', socket.id);
    });
});
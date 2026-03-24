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

    //Join room event 
    socket.on('join-room', (roomName) => {
        socket.join(roomName);
        console.log('client has joined room: ', roomName);
    });


    //Leave room event
    socket.on('leave-room', (roomName) => {
        socket.leave(roomName);
        console.log('client has left room: ', roomName);
    })

    //Send message event
    socket.on('send-message', ({ roomName, message }) => {
        if (socket.rooms.has(roomName)){
            io.to(roomName).emit('new-message', message);
        }
    });







    socket.on('disconnect', () => {
        console.log('client has disconnected:', socket.id);
    });
});
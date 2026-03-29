require('dotenv').config();
const jwt = require('jsonwebtoken');
const express = require('express');
const app = require('./app');
const socket = require('socket.io');
const port = 3000;
const http = require('http');
const server = http.createServer(app);
const db = require('./db');
const io = new socket.Server(server, {
    cors: {
        origin: '*'
    }
});
const redis = require('./redis');

//Activate server
server.listen(port);

//Authentication
    io.use((socket, next) => {
        const accessToken = socket.handshake.auth.token;

        try{
            const validToken = jwt.verify(accessToken, process.env.JWT_SECRET);
            socket.data.user = validToken;
            next();

        } catch(e){
            next(new Error('authentication invalid'));
            console.log(e);
        }
        
    })



//Conection listener 
io.on('connection', async (socket) => {
    console.log('a client has connected:', socket.id);
    let room;
    let roomId;
    let messages;
    const userId = socket.data.user.userId;
    
 
    //Redis Online Presence Tracking
    await redis.set(`presence:${userId}`, '1', 'EX', 30);

    //Background Interval 
    const interval = setInterval(async () => {
        await redis.set(`presence:${userId}`, '1', 'EX', 30);
    }, 20000);



    //User Online event
    io.emit('user-online', userId);
  



    //Join room event 
    socket.on('join-room', async (roomName) => {
        try {
            //Check Room or make a new Room
            const existingRoom = await db('rooms').where('name', roomName).first();
            if(!existingRoom){
                const newRoom = {
                owner_id: socket.data.user.userId,
                name: roomName
                }
                const confirmedRoom = await db('rooms').insert(newRoom).returning(['id', 'name']);
                roomId = confirmedRoom[0].id;
                } else{
                roomId = existingRoom.id;
            }
            //Fetch messages 
            messages = await db('messages').where('room_id', roomId).orderBy('created_at', 'desc').limit(50);
            socket.join(roomName);
            socket.emit('message-history', messages);
            console.log('client has joined room: ', roomName);
        } catch(e){
            console.log(e);
        }
    });


    //Leave room event
    socket.on('leave-room', (roomName) => {
        socket.leave(roomName);
        console.log('client has left room: ', roomName);
    })

    //Send message event
    socket.on('send-message', async ({ roomName, message }) => {
       try {
            if (socket.rooms.has(roomName)){
            room = await db('rooms').where('name', roomName).first();
            roomId = room.id;
            //send Msg to database
            const newMessage = {
                room_id: roomId,
                user_id: socket.data.user.userId,
                content: message
            }
            const confirmedMessage = await db('messages').insert(newMessage).returning(['id', 'content']);
            io.to(roomName).emit('new-message', confirmedMessage[0]);
            }
        } catch(e){
            console.log(e);
        }
    });


    //Load more messages event
    socket.on('load-more-messages', async ({ roomName, cursor }) => {
        try {
            room = await db('rooms').where('name', roomName).first();
            roomId = room.id;
            messages = await db('messages').where('room_id', roomId).where('id', '<', cursor).orderBy('created_at', 'desc').limit(50);

            socket.emit('more-messages', messages);
        } catch(e){
            console.log(e);

        }
    })





    socket.on('disconnect', async () => {
        await redis.del(`presence:${userId}`);
        console.log('client has disconnected:', socket.id);
        clearInterval(interval);
        //User Offline event 
        io.emit('user-offline', userId);
    });
    
    
});
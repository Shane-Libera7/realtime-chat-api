const express = require('express');
const router = express.Router();
const db = require('../../db');
const authMiddleware = require('../../middleware/auth');


//Declare middleware
router.use(authMiddleware);

//Create Room Route

router.post('/', async (req, res, next) => {
    const { name } = req.body;
    try{

        const room = {
            owner_id: req.userId,
            name: name
        }
        const [newRoom] = await db('rooms').insert(room).returning(['id', 'name', 'created_at']);
        return res.status(201).json(newRoom);

    } catch(e){
        next(e);
    }


})

//Get Rooms Route

router.get('/', async (req, res, next) => {
    try{
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const rooms = await db('rooms').select(['id', 'name', 'created_at']).limit(limit).offset((page - 1) * limit);
        return res.status(200).json(rooms);
    } catch(e){
        next(e);
    }
})

//Delete Room Route

router.delete('/:id', async (req, res, next) => {
    const roomId = req.params.id;
    const userId = req.userId;
    try{
        const room = await db('rooms').where({ id: roomId, owner_id: userId }).first();
        if (room){
            await db('messages').where('room_id', roomId).delete();
            await db('rooms').where({ id: roomId, owner_id: userId}).delete();
            return res.status(204).send();
        } else{
            return res.status(404).json({ error: 'Room not found'});
        }

    } catch(e){
        next(e);
    }
})

//Get a Rooms Messages Route
router.get('/:id/messages', async (req, res, next) => {
    const roomId = req.params.id;
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    try{
        const messages = await db('messages').where('room_id', roomId).orderBy('created_at', 'desc').limit(limit).offset((page - 1) * limit);
        return res.status(200).json(messages);
    } catch(e){
        next(e);
    }
})
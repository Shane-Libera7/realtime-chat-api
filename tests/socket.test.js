const app = require('../src/app');
const db = require('../src/db');
const { server, io } = require('../src/server');
const jwt = require('jsonwebtoken');
const { io: Client } = require('socket.io-client');
require('dotenv').config({ path: '.env.test' });

describe('socket-io tests', () => {
    let clientUser1;
    let clientUser2;
    //Start Server 
    beforeAll((done) => {
        server.listen(3001, async () => {
            //insert test users
            await db('users').insert([
            { id: 1, email: 'user1@test.com', password_hash: 'fakehash' },
            { id: 2, email: 'user2@test.com', password_hash: 'fakehash' }
            ]).onConflict('id').ignore();
            const token1 = jwt.sign({ userId: 1}, process.env.JWT_SECRET, { expiresIn: '1h'});
            const token2 = jwt.sign({ userId: 2}, process.env.JWT_SECRET, { expiresIn: '1h'});

            clientUser1 = new Client('http://localhost:3001', {
                auth: { token: token1 }
            });

            clientUser2 = new Client('http://localhost:3001', {
                auth: { token: token2 }
            });

            clientUser1.on('connect', done);
            clientUser2.on('connect', done);
        });

    });

    //Unauthenticated Connection is Rejected 
    it('should reject unauthorized connections', (done) => {
        const unauthClient = new Client('http://localhost:3001');
        unauthClient.on('connect_error', (err) => {
            expect(err.message).toBe('authentication invalid');
            unauthClient.disconnect();
            done();
        })
    })


    //Authenticated user can join a room and send a message 
    it('should let authenticated user join a room and send a message', (done) => {
        clientUser1.emit('join-room', 'room1');
        //Message history appears when joining a room
        clientUser1.on('message-history', (messages) => {
            expect(Array.isArray(messages)).toBe(true);

            clientUser1.emit('send-message', ({roomName: 'room1', message: 'test' }));

            clientUser1.on('new-message', (message) => {
                expect(message).toHaveProperty('content', 'test');
                done();
            })
            
        });

        
    });

    //Message appears in history when joining a room 
    it('should have messages appear in history when joining a room', (done) => {
        clientUser2.emit('join-room', 'room1');
        clientUser2.on('message-history', (messages) => {
            expect(Array.isArray(messages)).toBe(true);
            expect(messages.length).toBeGreaterThan(0);
            done();
        })

    }) 

    //Direct-Message is recieved by target User 
    it('should have a direct message recieved by target user', (done) => {
        clientUser2.on('new-direct-message', (message) => {
            expect(message).toHaveProperty('content', 'hello');
            done();
        });
        clientUser1.emit('send-direct-message', ({ recipientId: 2, content: 'hello' }));
    })

    afterAll((done) => {
        clientUser1.disconnect();
        clientUser2.disconnect();
        io.close();
        server.close(done);
    });
});
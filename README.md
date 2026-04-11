# Realtime Chat API
 
A persistent, real-time chat backend with WebSocket support, online presence tracking, direct messaging, and message history. Built as a backend-only project tested via a simple HTML client.
 
**Live URL:** https://realtime-chat-api-znv9.onrender.com
 
---
 
## Tech Stack
 
- **Runtime:** Node.js
- **Framework:** Express.js
- **WebSockets:** Socket.io
- **Database:** PostgreSQL
- **Query Builder:** Knex.js
- **Cache / Presence:** Redis (Upstash in production)
- **Authentication:** JWT
- **Testing:** Jest + Socket.io Client
- **Containerisation:** Docker + Docker Compose
- **Deployment:** Render + Upstash
 
---
 
## Features
 
- Real-time messaging via WebSockets
- JWT authentication enforced at the Socket.io connection level
- Persistent message history — messages saved to PostgreSQL
- Last 50 messages delivered on room join
- Cursor-based pagination for loading older messages
- Online presence tracking via Redis with TTL-based expiry
- Typing indicators with server-side debounce
- Direct messaging between users via personal rooms
- REST endpoints for room management
- Docker Compose setup for local development
 
---
 
## Getting Started
 
### Prerequisites
 
- Node.js (v20+)
- Docker and Docker Compose
 
### Running Locally with Docker
 
1. Clone the repository:
 
```bash
git clone https://github.com/Shane-Libera7/realtime-chat-api.git
cd realtime-chat-api
```
 
2. Create a `.env` file (see Environment Variables below)
 
3. Start the app, database, and Redis:
 
```bash
docker compose up --build
```
 
Migrations run automatically on startup. The API will be available at `http://localhost:3000`.
 
### Running Locally without Docker
 
1. Make sure PostgreSQL and Redis are running
 
2. Install dependencies:
 
```bash
npm install
```
 
3. Create a `.env` file (see Environment Variables below)
 
4. Run migrations:
 
```bash
npx knex migrate:latest
```
 
5. Start the server:
 
```bash
npm run dev
```
 
---
 
## Running Tests
 
```bash
npm test
```
 
Tests run against a separate test database. Make sure your `.env.test` file is configured before running.
 
---
 
## Environment Variables
 
| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment name | `development` |
| `DB_HOST` | Database host | `localhost` |
| `DB_USER` | Database user | `admin` |
| `DB_PASSWORD` | Database password | `password` |
| `DB_NAME` | Database name | `realtime_chat` |
| `DB_PORT` | Database port | `5432` |
| `REDIS_HOST` | Redis host (local) | `localhost` |
| `REDIS_PORT` | Redis port (local) | `6379` |
| `REDIS_URL` | Redis connection URL (production) | `rediss://default:password@host:6379` |
| `JWT_SECRET` | Secret key for signing JWTs | `your_random_secret` |
 
For the test environment, create a `.env.test` file with `DB_NAME=realtime_chat_test`.
 
---
 
## REST API Endpoints
 
### Health
 
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/health` | Health check | No |
 
### Rooms
 
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/rooms` | Create a room | Yes |
| GET | `/rooms` | List all rooms | Yes |
| DELETE | `/rooms/:id` | Delete a room (owner only) | Yes |
| GET | `/rooms/:id/messages` | Fetch message history via HTTP | Yes |
 
### Users
 
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/users/online` | Get all currently online user IDs | Yes |
 
### Direct Messages
 
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/messages/direct/:userId` | Fetch DM history between two users | Yes |
 
All protected routes require an `Authorization` header:
 
```
Authorization: Bearer <access_token>
```
 
---
 
## WebSocket Event Schema
 
All WebSocket connections require a valid JWT passed in the auth handshake:
 
```javascript
const socket = io('https://realtime-chat-api-znv9.onrender.com', {
    auth: { token: 'your_jwt_token' }
});
```
 
### Connection Events
 
| Event | Direction | Payload | Description |
|---|---|---|---|
| `connect` | Server → Client | — | Connection established |
| `connect_error` | Server → Client | `{ message }` | Connection rejected (invalid/missing token) |
| `disconnect` | Server → Client | — | Connection closed |
 
### Room Events
 
| Event | Direction | Payload | Description |
|---|---|---|---|
| `join-room` | Client → Server | `roomName: string` | Join a room. Room is created if it doesn't exist. |
| `leave-room` | Client → Server | `roomName: string` | Leave a room |
| `message-history` | Server → Client | `Message[]` | Last 50 messages emitted to the joining socket |
 
### Messaging Events
 
| Event | Direction | Payload | Description |
|---|---|---|---|
| `send-message` | Client → Server | `{ roomName: string, message: string }` | Send a message to a room |
| `new-message` | Server → Client (room) | `{ id, content, created_at }` | Broadcast to all room members |
| `load-more-messages` | Client → Server | `{ roomName: string, cursor: number }` | Load messages older than cursor ID |
| `more-messages` | Server → Client | `Message[]` | Messages older than the cursor |
 
### Typing Events
 
| Event | Direction | Payload | Description |
|---|---|---|---|
| `typing-start` | Client → Server | `{ roomName: string }` | User started typing |
| `typing-stop` | Client → Server | `{ roomName: string }` | User stopped typing |
| `typing-start` | Server → Client (room) | `{ userId }` | Broadcast to room excluding sender |
| `typing-stop` | Server → Client (room) | `{ userId }` | Broadcast to room excluding sender. Also emitted automatically after 3 seconds of inactivity. |
 
### Direct Message Events
 
| Event | Direction | Payload | Description |
|---|---|---|---|
| `send-direct-message` | Client → Server | `{ recipientId: number, content: string }` | Send a DM to a specific user |
| `direct-message` | Server → Client | `{ id, sender_id, content, created_at }` | Delivered to recipient's personal room `user:{userId}` |
 
### Presence Events
 
| Event | Direction | Payload | Description |
|---|---|---|---|
| `user-online` | Server → All Clients | `{ userId }` | Emitted when a user connects |
| `user-offline` | Server → All Clients | `{ userId }` | Emitted when a user disconnects |
 
---
 
## Message Object Shape
 
```json
{
  "id": 1,
  "room_id": 2,
  "user_id": 1,
  "content": "Hello world",
  "created_at": "2026-03-20T12:00:00.000Z"
}
```
 
---
 
## Project Structure
 
```
src/
  app.js              # Express app setup
  server.js           # HTTP server + Socket.io setup
  db.js               # Knex database connection
  redis.js            # Redis client
  middleware/
    auth.js           # JWT authentication middleware (HTTP)
  routes/
    rooms/            # Room CRUD routes
    users/            # Online presence route
    messages/         # Direct message history route
migrations/           # Knex migration files
tests/
  setup.js            # Jest setup (migrations before tests)
  socket.test.js      # Socket.io integration tests
```


## Architecture 
┌─────────────────────────────────────────────────────────┐
│                        CLIENTS                          │
│              (Browser / Test HTML Client)               │
└───────────────────┬─────────────────┬───────────────────┘
                    │                 │
         WebSocket  │                 │  HTTP REST
         (Socket.io)│                 │  (Express)
                    │                 │
┌───────────────────▼─────────────────▼───────────────────┐
│                    NODE.JS SERVER                       │
│                                                         │
│   ┌─────────────────────┐   ┌─────────────────────┐     │
│   │    Socket.io Layer   │   │    Express Layer   │     │
│   │                     │   │                     │     │
│   │  • JWT Auth         │   │  • JWT Middleware   │     │
│   │  • Room Management  │   │  • REST Routes      │     │
│   │  • Message Broadcast│   │  • Room CRUD        │     │
│   │  • Typing Indicators│   │  • DM History       │     │
│   │  • Presence Tracking│   │  • Online Users     │     │
│   │  • Direct Messages  │   │                     │     │
│   └──────────┬──────────┘   └──────────┬──────────┘     │
│              │                          │               │
└──────────────┼──────────────────────────┼───────────────┘
               │                          │
       ┌───────▼──────┐          ┌────────▼───────┐
       │    REDIS      │          │   POSTGRESQL   │
       │  (Upstash)    │          │   (Render)     │
       │               │          │                │
       │ • Presence    │          │ • users        │
       │   Keys with   │          │ • rooms        │
       │   TTL         │          │ • messages     │
       │ • Typing      │          │ • direct_      │
       │   Debounce    │          │   messages     │
       └───────────────┘          └────────────────┘


## Testing

```bash
npm test
```

### Requirements

Integration tests require both PostgreSQL and Redis to be running locally. Start them with:

```bash
docker compose up -d
```

### Notes

- Tests run against a separate `realtime_chat_test` database
- Redis must be available on `localhost:6379` for presence tracking tests to pass
- The test suite covers: unauthenticated connection rejection, authenticated room joining, message history retrieval, and direct message delivery
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { setupGameController } from './controllers/gameController.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

connectDB(); // Connect to MongoDB

// Serve static files from the "public" directory
app.use(express.static('public'));

// Initialize game controller to handle Socket.IO events
setupGameController(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

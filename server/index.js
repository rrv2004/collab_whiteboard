require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const socketHandler = require('./socket');
const connectDB = require('./db');

const app = express();
app.use(cors());

// Connect to Database
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for simplicity in development
        methods: ['GET', 'POST'],
    },
});

socketHandler(io);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for hackathon simplicity
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hacknagpur-triage";
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Middleware to attach io to req
app.use((req, res, next) => {
    req.app.set('io', io);
    next();
});

// Routes
app.use('/api/patients', require('./routes/patients'));
app.use('/api/staff', require('./routes/staff'));

// Basic Routes
app.get('/', (req, res) => {
    res.send('HackNagpur Triage API Running');
});

// Socket.io
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

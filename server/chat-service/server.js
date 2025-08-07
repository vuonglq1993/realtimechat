const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const chatRoutes = require('./src/routes/chat.routes');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*', // production nên hạn chế
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Kết nối DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/messages', chatRoutes);

// Khởi tạo socket
require('./src/socket/socket')(io);

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Chat service running on port ${PORT}`);
});

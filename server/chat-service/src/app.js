const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const chatRoutes = require('./routes/chat.routes');
app.use('/api/messages', chatRoutes);

module.exports = app;

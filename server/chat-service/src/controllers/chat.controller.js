  const Message = require('../models/chat.model');
  const axios = require('axios');
  const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

  exports.sendMessage = async (req, res) => {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      await axios.get(`${USER_SERVICE_URL}/api/users/${senderId}`);
    } catch (err) {
      if (err.response?.status === 404) {
        return res.status(404).json({ error: 'Sender not found in user-service' });
      }
      return res.status(500).json({ error: 'User-service error' });
    }

    try {
      const message = await Message.create({ senderId, receiverId, content });
      res.status(201).json(message);
    } catch (err) {
      res.status(500).json({ error: 'Failed to send message' });
    }
  };

  exports.getMessages = async (req, res) => {
    const { senderId, receiverId } = req.query;

    if (!senderId || !receiverId) {
      return res.status(400).json({ error: 'Missing query parameters' });
    }

    try {
      const messages = await Message.find({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }).sort({ timestamp: 1 });

      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get messages' });
    }
  };

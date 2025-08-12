const Message = require('../models/chat.model');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);

    socket.on('setup', (userData) => {
      if (!userData?._id) return;
      socket.userId = userData._id;
      socket.join(userData._id);
      socket.broadcast.emit('userOnline', { userId: userData._id });
    });

    socket.on('sendMessage', async ({ senderId, receiverId, content }) => {
      if (!senderId || !receiverId || !content) return;

      try {
        // 1️⃣ Lưu DB
        const newMessage = await Message.create({
          senderId,
          receiverId,
          content,
        });

        // 2️⃣ Gửi tin nhắn realtime
        io.to(senderId).emit('receiveMessage', newMessage);
        io.to(receiverId).emit('receiveMessage', newMessage);

        // 3️⃣ Gửi notification cho receiver
        io.to(receiverId).emit('notification', {
          type: 'new_message',
          from: senderId,
          text: content,
        });

      } catch (error) {
        console.error('❌ Error sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        socket.broadcast.emit('userOffline', { userId: socket.userId });
      }
    });
  });
};

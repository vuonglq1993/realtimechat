// chat-service/socket.js
const Message = require('../models/chat.model');
// Nếu có auth riêng: const { verifyToken } = require('../utils/auth');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);

    // Khi user kết nối và gửi thông tin setup
    socket.on('setup', (userData) => {
      if (!userData?._id) return;
      socket.userId = userData._id; // lưu tạm userId vào socket
      socket.join(userData._id);
      console.log(`📥 User ${userData._id} joined room ${userData._id}`);

      // Emit cho người khác biết user này online
      socket.broadcast.emit('userOnline', { userId: userData._id });
    });

    // Gửi tin nhắn
    socket.on('sendMessage', (data) => {
      const { senderId, receiverId, content } = data;
      if (!senderId || !receiverId || !content) return;

      const messagePayload = {
        senderId,
        receiverId,
        content,
        createdAt: new Date(),
      };

      // 1️⃣ Gửi tin nhắn realtime
      io.to(senderId).emit('receiveMessage', messagePayload);
      io.to(receiverId).emit('receiveMessage', messagePayload);

      // 2️⃣ Gửi notification riêng cho receiver
      io.to(receiverId).emit('notification', {
        type: 'new_message',
        from: senderId,
        text: content,
      });
    });

    // Khi user đang gõ
    socket.on('typing', ({ roomId, senderId }) => {
      socket.to(roomId).emit('typing', { senderId });
    });

    // Khi user ngừng gõ
    socket.on('stopTyping', ({ roomId, senderId }) => {
      socket.to(roomId).emit('stopTyping', { senderId });
    });

    // Khi ngắt kết nối
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
      if (socket.userId) {
        socket.broadcast.emit('userOffline', { userId: socket.userId });
      }
    });
  });
};

const Message = require('../models/chat.model');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);

    socket.on('setup', (userData) => {
      if (!userData?._id) return;
      socket.join(userData._id);
      console.log(`📥 User ${userData._id} joined room ${userData._id}`);
    });
    socket.on('sendMessage', (data) => {
      const { senderId, receiverId } = data;
      if (!senderId || !receiverId) return;
    
      // ❌ KHÔNG lưu nữa, chỉ broadcast lại
      io.to(senderId).emit('receiveMessage', data);
      io.to(receiverId).emit('receiveMessage', data);
    });
    

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });
};

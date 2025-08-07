import { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ChatBox = ({ selectedUser, messages, onSendMessage, currentUser }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const isAtBottomRef = useRef(true); // 👈 Theo dõi trạng thái cuộn
  const previousLengthRef = useRef(messages.length); // 👈 Theo dõi số lượng tin nhắn trước đó

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  // 👂 Theo dõi hành vi cuộn của người dùng
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    isAtBottomRef.current = isNearBottom;
  };

  // 👇 Chỉ auto scroll nếu có tin nhắn mới VÀ đang ở gần cuối
  useEffect(() => {
    const newLength = messages.length;
    const oldLength = previousLengthRef.current;

    if (newLength > oldLength && isAtBottomRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    previousLengthRef.current = newLength; // Cập nhật length sau mỗi render
  }, [messages]);

  if (!selectedUser) return <div className="flex-grow-1 p-4">Chọn người để chat</div>;

  return (
    <div className="flex-grow-1 d-flex flex-column p-3 border-start">
      <h5 className="mb-3">Chat với {selectedUser.username}</h5>

      <div
        className="flex-grow-1 overflow-auto mb-3"
        ref={containerRef}
        onScroll={handleScroll}
      >
        {messages.map((msg, index) => (
          <div
            key={msg._id || index}
            className={`d-flex ${msg.senderId === currentUser._id ? 'justify-content-end' : 'justify-content-start'}`}
          >
            <div
              className={`p-2 rounded ${msg.senderId === currentUser._id
                  ? 'bg-light text-start'
                  : 'bg-primary text-white text-end'
                }`}
              style={{ maxWidth: '60%' }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="d-flex">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="d-flex p-2  flex-grow-1 border-top"
        style={{ background: '#fff' }}
      >
        <input
          type="text"
          className="form-control me-2"
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="btn btn-success">
          Gửi
        </button>
      </form>
      </div>
    </div>
  );
};

export default ChatBox;

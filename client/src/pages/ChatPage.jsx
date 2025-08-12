import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import socket from '../services/socket';
import UserList from '../components/UserList';
import ChatBox from '../components/ChatBox';

const CHAT_SERVICE_URL = import.meta.env.VITE_CHAT_SERVICE_URL;

const ChatPage = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({}); // { userId: count }

  // Setup socket + kiểm tra login
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    socket.emit('setup', user);

    return () => {
      socket.off('receiveMessage');
      socket.off('notification');
    };
  }, []);

  // Realtime: nhận tin nhắn
  useEffect(() => {
    const handleNewMessage = (msg) => {
      const isForCurrentChat =
        selectedUser &&
        ((msg.senderId === selectedUser._id && msg.receiverId === user._id) ||
          (msg.senderId === user._id && msg.receiverId === selectedUser._id));

      if (isForCurrentChat) {
        setMessages((prev) => {
          const isDuplicate = prev.some((m) => m._id === msg._id);
          return isDuplicate ? prev : [...prev, msg];
        });
      }
    };

    socket.on('receiveMessage', handleNewMessage);
    return () => socket.off('receiveMessage', handleNewMessage);
  }, [selectedUser, user]);

  // Realtime: nhận notification khi có tin nhắn mới
  useEffect(() => {
    const handleNotification = (notif) => {
      // Nếu không phải đang chat với người gửi => tăng số lượng chưa đọc
      if (!selectedUser || notif.from !== selectedUser._id) {
        setUnreadCounts((prev) => ({
          ...prev,
          [notif.from]: (prev[notif.from] || 0) + 1,
        }));
      }
    };

    socket.on('notification', handleNotification);
    return () => socket.off('notification', handleNotification);
  }, [selectedUser]);

  // Lấy lịch sử tin nhắn
  const fetchMessages = useCallback(async () => {
    if (!selectedUser) return;

    try {
      const res = await axios.get(
        `${CHAT_SERVICE_URL}/api/messages?senderId=${user._id}&receiverId=${selectedUser._id}`
      );
      setMessages(res.data);

      // reset số chưa đọc của user này
      setUnreadCounts((prev) => ({
        ...prev,
        [selectedUser._id]: 0,
      }));
    } catch (err) {
      console.error('❌ Failed to fetch messages:', err);
    }
  }, [selectedUser, user]);

  useEffect(() => {
    if (selectedUser) fetchMessages();
  }, [selectedUser, fetchMessages]);

  // Gửi tin nhắn
  const sendMessage = async (content) => {
    if (!content.trim()) return;

    try {
      const res = await axios.post(`${CHAT_SERVICE_URL}/api/messages`, {
        senderId: user._id,
        receiverId: selectedUser._id,
        content,
      });

      socket.emit('sendMessage', res.data);
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('❌ Failed to send message:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Tính tổng tin chưa đọc
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
  const pageTitle = totalUnread > 0 ? `(${totalUnread}) Chat App` : 'Chat App';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <div style={{ display: 'flex', height: '100vh', position: 'relative' }}>
        <UserList
          user={user}
          onSelectUser={setSelectedUser}
          unreadCounts={unreadCounts}
        />
        <ChatBox
          selectedUser={selectedUser}
          messages={messages}
          onSendMessage={sendMessage}
          currentUser={user}
        />
        <button
          className="btn btn-danger"
          onClick={handleLogout}
          style={{ position: 'absolute', top: 10, right: 10 }}
        >
          Logout
        </button>
      </div>
    </>
  );
};

export default ChatPage;

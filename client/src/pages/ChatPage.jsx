import { useEffect, useState, useCallback, useRef } from 'react';
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
  const [unreadCounts, setUnreadCounts] = useState({});
  const [totalUnread, setTotalUnread] = useState(0);

  // ✅ audio ref để phát âm thanh
  const notificationSound = useRef(null);

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

  useEffect(() => {
    const total = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
    setTotalUnread(total);
  }, [unreadCounts]);

  useEffect(() => {
    const defaultTitle = 'Chat App';
    const updateTitle = () => {
      document.title =
        totalUnread > 0 ? `(${totalUnread}) ${defaultTitle}` : defaultTitle;
    };
    updateTitle();
    document.addEventListener('visibilitychange', updateTitle);
    return () => {
      document.removeEventListener('visibilitychange', updateTitle);
    };
  }, [totalUnread]);

  // Nhận tin nhắn realtime
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
      } else {
        // 🔔 Bíp khi có tin nhắn từ người khác
        if (notificationSound.current) {
          notificationSound.current.play().catch(() => {});
        }
      }
    };

    socket.on('receiveMessage', handleNewMessage);
    return () => socket.off('receiveMessage', handleNewMessage);
  }, [selectedUser, user]);

  // Nhận notification
  useEffect(() => {
    const handleNotification = (notif) => {
      if (!selectedUser || notif.from !== selectedUser._id) {
        setUnreadCounts((prev) => ({
          ...prev,
          [notif.from]: (prev[notif.from] || 0) + 1,
        }));
        // 🔔 Bíp khi có notification từ người khác
        if (notificationSound.current) {
          notificationSound.current.play().catch(() => {});
        }
      }
    };

    socket.on('notification', handleNotification);
    return () => socket.off('notification', handleNotification);
  }, [selectedUser]);

  const fetchMessages = useCallback(async () => {
    if (!selectedUser) return;
    try {
      const res = await axios.get(
        `${CHAT_SERVICE_URL}/api/messages?senderId=${user._id}&receiverId=${selectedUser._id}`
      );
      setMessages(res.data);
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

  const sendMessage = (content) => {
    if (!content.trim()) return;
    socket.emit('sendMessage', {
      senderId: user._id,
      receiverId: selectedUser._id,
      content,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>{totalUnread > 0 ? `(${totalUnread}) Chat App` : 'Chat App'}</title>
      </Helmet>

      {/* 🔊 Thẻ audio ẩn */}
      <audio ref={notificationSound} src="/sounds/notifications.wav" preload="auto" />

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

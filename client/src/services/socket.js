import { io } from 'socket.io-client';

const CHAT_SERVICE_URL = import.meta.env.VITE_CHAT_SERVICE_URL;

const socket = io(CHAT_SERVICE_URL, {
  transports: ['websocket'],
  withCredentials: true,
});

export default socket;

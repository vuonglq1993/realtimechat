import axios from "axios";

const userAPI = axios.create({
  baseURL: import.meta.env.VITE_USER_SERVICE_URL,
});

const chatAPI = axios.create({
  baseURL: import.meta.env.VITE_CHAT_SERVICE_URL + '/api/messages',
});

export { userAPI, chatAPI };

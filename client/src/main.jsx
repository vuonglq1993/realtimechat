// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
    <SocketProvider>
      <App />
      </SocketProvider>

    </AuthProvider> 
  </React.StrictMode>
);

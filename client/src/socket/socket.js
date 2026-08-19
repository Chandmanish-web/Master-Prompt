import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = (token) => {
  if (socket?.connected) {
    return socket;
  }

  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  socket = io(serverUrl, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket.IO connected:', socket.id);
    // Expose socket globally for components
    window.__socket = socket;
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error);
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO disconnected');
    window.__socket = null;
  });

  return socket;
};

export const getSocket = () => {
  return socket || window.__socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    window.__socket = null;
  }
};

export default socket;

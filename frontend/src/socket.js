// frontend/src/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  // You might want to send the JWT with the socket connection for authentication
  // This can be done via extraHeaders or auth object
  // For example:
  // auth: {
  //   token: localStorage.getItem('token'),
  // },
  // Or:
  // extraHeaders: {
  //   Authorization: `Bearer ${localStorage.getItem('token')}`
  // }
});

socket.on('connect', () => {
  //console.log('Connected to Socket.IO server:', socket.id);
});

socket.on('disconnect', () => {
  //console.log('Disconnected from Socket.IO server.');
});

socket.on('connect_error', (err) => {
  //console.error('Socket.IO connection error:', err.message);
});

export default socket;
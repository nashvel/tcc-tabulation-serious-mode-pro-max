import io from 'socket.io-client';

let socket = null;
let isInitializing = false;

/**
 * Initialize Socket.IO connection to Laravel Echo Server
 * Uses Redis + Socket.IO for real-time broadcasting
 * Latency: ~30-50ms
 * 
 * This is a true singleton - only one connection per page load
 */
export const initializeEcho = () => {
  // Return existing socket if already connected or connecting
  if (socket) {
    console.log('Returning existing Socket.IO connection');
    return socket;
  }
  
  // Prevent multiple initialization attempts
  if (isInitializing) {
    console.log('Socket.IO initialization already in progress');
    return null;
  }
  
  isInitializing = true;
  
  try {
    const socketHost = import.meta.env.VITE_SOCKET_HOST || 'localhost';
    const socketPort = import.meta.env.VITE_SOCKET_PORT || 6001;
    const socketUrl = `http://${socketHost}:${socketPort}`;
    
    console.log(`Connecting to Socket.IO at ${socketUrl}...`);
    
    socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling'],
      pingInterval: 30000,
      pingTimeout: 60000,
    });
    
    socket.on('connect', () => {
      console.log('Socket.IO connected successfully');
      isInitializing = false;
    });
    
    socket.on('disconnect', (reason) => {
      console.log(`⚠ Socket.IO disconnected: ${reason}`);
      // Reset socket so it can reconnect on next initializeEcho call
      if (reason === 'io server disconnect' || reason === 'ping timeout' || reason === 'transport close') {
        socket = null;
        isInitializing = false;
      }
    });
    
    socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });
    
    // Debug: Log all incoming events
    socket.onAny((eventName, ...args) => {
      console.log(`[Socket.IO Event] ${eventName}:`, args);
    });
    
    return socket;
  } catch (error) {
    console.warn('Failed to initialize Socket.IO:', error);
    isInitializing = false;
    return null;
  }
};

export const getEcho = () => socket;

export default socket;

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

/**
 * Initialize Laravel Echo with Reverb (Local WebSocket Server)
 * Much faster than Pusher for local/LAN deployments
 */
export const initializeEcho = () => {
  if (window.Echo) {
    return window.Echo;
  }

  try {
    window.Echo = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY || 'tcc-local-key',
      wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
      wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
      wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
      forceTLS: false,
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
    });

    console.log('Echo initialized with Reverb (local WebSocket)');

    // Monitor connection status
    if (window.Echo?.connector?.pusher) {
      window.Echo.connector.pusher.connection.bind('connected', () => {
        console.log('🟢 WebSocket connected to Reverb');
      });

      window.Echo.connector.pusher.connection.bind('disconnected', () => {
        console.log('🔴 WebSocket disconnected');
      });
    }

    return window.Echo;
  } catch (error) {
    console.warn('Failed to initialize Echo:', error);
    return null;
  }
};

export const getEcho = () => window.Echo;

export default window.Echo;

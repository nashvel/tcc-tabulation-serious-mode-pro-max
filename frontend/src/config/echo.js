import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

/**
 * Initialize Laravel Echo with Pusher
 * Cloud-based real-time broadcasting
 */
export const initializeEcho = () => {
  if (window.Echo) {
    return window.Echo;
  }

  try {
    // Initializing Laravel Echo with Pusher

    window.Echo = new Echo({
      broadcaster: 'pusher',
      key: import.meta.env.VITE_PUSHER_APP_KEY,
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      forceTLS: true,
      // Public channels don't need authentication
      // authEndpoint: 'http://localhost:8000/broadcasting/auth',
      enabledTransports: ['ws', 'wss']
    });

    // Echo instance created

    // Monitor connection status
    if (window.Echo?.connector?.pusher) {
      // Pusher connector available
      
      window.Echo.connector.pusher.connection.bind('connected', () => {
        console.log('🟢 WebSocket is connected');
      });

      window.Echo.connector.pusher.connection.bind('error', (err) => {
        console.error(' Echo connection error:', err);
      });

      window.Echo.connector.pusher.connection.bind('disconnected', () => {
        // Echo disconnected
      });
      
      // Channel subscription initialized
    } else {
      // Pusher connector not available
    }

    return window.Echo;
  } catch (error) {
    console.warn('Failed to initialize Echo:', error);
    return null;
  }
};

export const getEcho = () => window.Echo;

export default window.Echo;

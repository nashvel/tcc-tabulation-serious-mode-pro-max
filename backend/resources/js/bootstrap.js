import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allow your team to quickly build robust real-time web applications.
 * 
 * Supports both Pusher (cloud) and Reverb (local) WebSocket servers.
 * Set VITE_BROADCAST_DRIVER in .env to 'pusher' or 'reverb'
 */

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Get broadcast driver from env (default to reverb for local development)
const broadcastDriver = import.meta.env.VITE_BROADCAST_DRIVER || 'reverb';

// Store the current driver for reference
window.broadcastDriver = broadcastDriver;

if (broadcastDriver === 'pusher') {
    // Pusher Configuration (Cloud WebSocket)
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
        forceTLS: true,
        disableStats: true,
    });
    console.log('[Echo] Initialized with Pusher (cloud WebSocket)');
} else {
    // Reverb Configuration (Local WebSocket)
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
    console.log('[Echo] Initialized with Reverb (local WebSocket)');
}

import { useEffect, useRef } from 'react';
import { initializeEcho } from '../config/echo';

// Track callbacks for each channel to support multiple subscribers
const channelCallbacks = new Map();

export const useVotingWebSocket = (eventId, onStateChange) => {
  const onStateChangeRef = useRef(onStateChange);
  const channelRef = useRef(null);
  const callbackIdRef = useRef(null);
  
  // Update ref when callback changes
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  useEffect(() => {
    if (!eventId) return;

    // Initialize Echo
    const echo = initializeEcho();
    if (!echo) {
      // Echo not available - real-time updates disabled
      return;
    }

    const channelName = `voting.${eventId}`;

    // Listen for voting state changes using Laravel Echo (public channel)
    channelRef.current = echo.channel(channelName);
    
    channelRef.current.subscribed(() => {
      // Successfully subscribed
    });
    
    channelRef.current.error((error) => {
      console.error(`Channel subscription error on ${channelName}:`, error);
    });
    
    // Register this component's callback
    if (!channelCallbacks.has(channelName)) {
      channelCallbacks.set(channelName, new Set());
      
      // Attach listener only once per channel
      channelRef.current.listen('.VotingStateChanged', (data) => {
        // Call ALL registered callbacks for this channel
        const callbacks = channelCallbacks.get(channelName);
        if (callbacks && callbacks.size > 0) {
          callbacks.forEach((callback) => {
            try {
              callback(data);
            } catch (err) {
              console.error('Error calling callback:', err);
            }
          });
        }
      });
    }

    // Add this component's callback to the registry
    const callbacks = channelCallbacks.get(channelName);
    callbackIdRef.current = Symbol('callback');
    callbacks.add(onStateChangeRef.current);

    // Cleanup on unmount
    return () => {
      const callbacks = channelCallbacks.get(channelName);
      if (callbacks) {
        callbacks.delete(onStateChangeRef.current);
        
        // If no more callbacks, remove the channel entry
        if (callbacks.size === 0) {
          channelCallbacks.delete(channelName);
          if (channelRef.current) {
            echo.leave(channelName);
          }
        }
      }
    };
  }, [eventId]);
};

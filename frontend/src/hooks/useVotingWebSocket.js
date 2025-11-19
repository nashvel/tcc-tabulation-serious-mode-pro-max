import { useEffect, useRef } from 'react';
import { initializeEcho } from '../config/echo';

export const useVotingWebSocket = (eventId, onStateChange) => {
  const onStateChangeRef = useRef(onStateChange);
  
  // Update ref when callback changes, but don't trigger effect
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  useEffect(() => {
    if (!eventId) return;

    // Initialize Socket.IO connection
    const socket = initializeEcho();
    if (!socket) {
      console.warn('Socket.IO not available - real-time updates disabled');
      return;
    }

    const channelName = `voting.${eventId}`;
    console.log(`Subscribing to channel: ${channelName}`);

    // Listen for voting state changes on the specific channel
    // Echo Server broadcasts events with dot prefix: .voting.state.changed
    socket.on(`${channelName}:voting.state.changed`, (data) => {
      console.log('WebSocket: Voting state changed', data);
      if (onStateChangeRef.current) {
        onStateChangeRef.current(data);
      }
    });

    // Connection status logging
    socket.on('connect', () => {
      console.log(`Successfully connected to Socket.IO for ${channelName}`);
    });

    socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });

    // Cleanup on unmount
    return () => {
      console.log(`Unsubscribing from channel: ${channelName}`);
      socket.off(`${channelName}:voting.state.changed`);
    };
  }, [eventId]);
};

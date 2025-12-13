import { useState, useEffect, useCallback } from 'react';
import { showSuccess, showError } from '../../../../utils/alerts';
import { getApiBase } from '../../../../config/api';
import { useVotingWebSocket } from '../../../../hooks/useVotingWebSocket';

const votingAPI = {
  getState: async (eventId) => {
    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/api/voting/state?event_id=${eventId}`);
    if (!response.ok) throw new Error('Failed to fetch voting state');
    return { data: await response.json() };
  },
  lock: async (eventId) => {
    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/api/voting/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId })
    });
    if (!response.ok) throw new Error('Failed to lock');
    return { data: await response.json() };
  },
  unlock: async (eventId) => {
    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/api/voting/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId })
    });
    if (!response.ok) throw new Error('Failed to unlock');
    return { data: await response.json() };
  }
};

export const useLockState = (eventId) => {
  const [isLocked, setIsLocked] = useState(() => {
    // Initialize from localStorage
    if (eventId) {
      const stored = localStorage.getItem(`lock_state_${eventId}`);
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });
  const [isTogglingLock, setIsTogglingLock] = useState(false);

  // WebSocket handler for real-time updates
  const handleVotingStateChange = useCallback((data) => {
    console.log('ScoreTable: WebSocket update received:', data);
    const votingState = data.voting_state || data;
    if (typeof votingState.is_locked !== 'undefined') {
      setIsLocked(votingState.is_locked);
      // Save to localStorage
      if (eventId) {
        localStorage.setItem(`lock_state_${eventId}`, JSON.stringify(votingState.is_locked));
      }
    }
  }, [eventId]);

  // Setup WebSocket connection
  useVotingWebSocket(eventId, handleVotingStateChange);

  // Load lock state on mount and poll every 2 seconds
  useEffect(() => {
    if (!eventId) return;

    const loadLockState = async () => {
      try {
        const response = await votingAPI.getState(eventId);
        if (response.data) {
          const locked = response.data.is_locked ?? false;
          setIsLocked(locked);
          // Save to localStorage
          localStorage.setItem(`lock_state_${eventId}`, JSON.stringify(locked));
        }
      } catch (error) {
        console.error('Error loading lock state:', error);
      }
    };

    // Load immediately
    loadLockState();

    // Poll every 2 seconds
    const interval = setInterval(loadLockState, 2000);

    return () => clearInterval(interval);
  }, [eventId]);

  // Lock/Unlock handler
  const handleLockToggle = async () => {
    setIsTogglingLock(true);
    try {
      if (isLocked) {
        await votingAPI.unlock(eventId);
        setIsLocked(false);
        localStorage.setItem(`lock_state_${eventId}`, JSON.stringify(false));
        showSuccess('Screen Unlocked!', { duration: 2000 });
      } else {
        await votingAPI.lock(eventId);
        setIsLocked(true);
        localStorage.setItem(`lock_state_${eventId}`, JSON.stringify(true));
        showSuccess('Screen Locked!', { duration: 2000 });
      }
    } catch (error) {
      console.error('Error toggling lock:', error);
      showError('Failed to toggle lock');
    } finally {
      setIsTogglingLock(false);
    }
  };

  return {
    isLocked,
    setIsLocked,
    handleLockToggle,
    isTogglingLock
  };
};

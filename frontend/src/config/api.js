/**
 * Centralized API Configuration
 * All hardcoded values should be defined here for easy maintenance
 */

// Get API base URL from environment or window location
export const getApiBase = () => {
  const url = new URL(window.location.href);
  return `${url.protocol}//${url.hostname}:8000`;
};

// Get Socket.IO URL from environment
export const getSocketUrl = () => {
  const socketHost = import.meta.env.VITE_SOCKET_HOST || window.location.hostname;
  const socketPort = import.meta.env.VITE_SOCKET_PORT || 6001;
  return `http://${socketHost}:${socketPort}`;
};

/**
 * Get current event ID from voting state
 * Falls back to latest event if voting state unavailable
 * @returns {Promise<number>} Event ID
 */
export const getCurrentEventId = async () => {
  try {
    const apiBase = getApiBase();
    
    // Try to get event ID from voting state first
    const votingStateResponse = await fetch(`${apiBase}/api/voting/state`);
    if (votingStateResponse.ok) {
      const votingState = await votingStateResponse.json();
      if (votingState.event_id) {
        console.log('Using event ID from voting state:', votingState.event_id);
        return votingState.event_id;
      }
    }
    
    // Fallback: Get the most recent event
    const eventsResponse = await fetch(`${apiBase}/api/events`);
    if (eventsResponse.ok) {
      const events = await eventsResponse.json();
      const latestEvent = events.sort((a, b) => b.id - a.id)[0];
      if (latestEvent?.id) {
        console.log('Using latest event ID:', latestEvent.id);
        return latestEvent.id;
      }
    }
  } catch (err) {
    console.error('Error fetching event ID:', err);
  }
  
  // Ultimate fallback
  console.warn('Could not determine event ID, using default: 1');
  return 1;
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Events
  EVENTS: '/api/events',
  EVENT_DETAILS: (id) => `/api/events/${id}`,
  
  // Voting
  VOTING_STATE: '/api/voting/state',
  VOTING_POINTS: '/api/points',
  
  // Rounds/Categories
  ROUNDS: (eventId) => `/api/rounds?event_id=${eventId}`,
  
  // Criteria
  CRITERIA: (eventId) => `/api/criteria?event_id=${eventId}`,
  
  // Candidates
  CANDIDATES: (eventId) => `/api/candidates?event_id=${eventId}`,
  
  // Judges
  JUDGES: (eventId) => `/api/judges?event_id=${eventId}`,
  
  // Event Sequences
  EVENT_SEQUENCES: (eventId) => `/api/event-sequences?event_id=${eventId}`,
};

/**
 * Default values for UI
 */
export const DEFAULTS = {
  JUDGES_COUNT: 5,
  JUDGE_NAME_PREFIX: 'Judge',
};

/**
 * Socket.IO Events
 */
export const SOCKET_EVENTS = {
  SCORE_UPDATED: 'score.updated',
  VOTING_STATE_CHANGED: 'voting.state.changed',
  CATEGORY_CHANGED: 'category.changed',
};

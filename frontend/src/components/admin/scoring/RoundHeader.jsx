import React, { useState, useCallback, useEffect } from 'react';
import { useVotingWebSocket } from '../../../hooks/useVotingWebSocket';

export default function RoundHeader({ roundName, eventId = 1 }) {
  const [currentRound, setCurrentRound] = useState(roundName);
  
  // WebSocket handler for real-time round changes
  const handleVotingStateChange = useCallback((data) => {
    console.log('RoundHeader: WebSocket update received:', data);
    
    // Check for active_round (can be at root level or nested in voting_state)
    const activeRound = data.active_round || data.voting_state?.active_round;
    if (activeRound?.name) {
      setCurrentRound(activeRound.name);
      console.log('RoundHeader: Round updated to:', activeRound.name);
    } else if (data.voting_state?.active_round_name) {
      setCurrentRound(data.voting_state.active_round_name);
      console.log('RoundHeader: Round updated to:', data.voting_state.active_round_name);
    }
  }, []);
  
  // Setup WebSocket connection
  useVotingWebSocket(eventId, handleVotingStateChange);
  
  // Update when prop changes
  useEffect(() => {
    if (roundName) {
      setCurrentRound(roundName);
    }
  }, [roundName]);
  
  if (!currentRound) return null;

  return (
    <div className="mb-8 relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg text-center py-6 px-4 border-t-4 border-amber-500 transition-all duration-300">
      <h2 className="text-white text-xl md:text-2xl font-serif font-bold uppercase tracking-widest relative z-10 animate-in fade-in duration-300">
        <span className="text-amber-500 mr-3 opacity-80 font-sans text-sm align-middle tracking-normal normal-case block mb-1">Currently Scoring</span>
        {currentRound}
      </h2>
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/assets/pattern.png')] pointer-events-none"></div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500 rounded-full blur-[60px] opacity-20"></div>
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-20"></div>
    </div>
  );
}

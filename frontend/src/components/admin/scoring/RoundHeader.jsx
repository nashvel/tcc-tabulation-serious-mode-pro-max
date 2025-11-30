import React, { useState, useCallback, useEffect } from 'react';
import { useVotingWebSocket } from '../../../hooks/useVotingWebSocket';
import ControlButtons from '../ControlButtons';

export default function RoundHeader({
  roundName,
  eventId = 1,
  // Control Props
  isVotingActive,
  eventSequence,
  currentSequenceIndex,
  onStartStop,
  onNext,
  onOpenEventDetails
}) {
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
    <div className="bg-white border-b border-gray-200 py-4">
      <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Round Name */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Currently Scoring</p>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
            {currentRound}
          </h1>
        </div>

        {/* Center/Right: Controls */}
        <div className="flex-shrink-0">
          <ControlButtons
            eventId={eventId}
            isVotingActive={isVotingActive}
            eventSequence={eventSequence}
            currentSequenceIndex={currentSequenceIndex}
            onStartStop={onStartStop}
            onNext={onNext}
            onOpenEventDetails={onOpenEventDetails}
          />
        </div>
      </div>
    </div>
  );
}

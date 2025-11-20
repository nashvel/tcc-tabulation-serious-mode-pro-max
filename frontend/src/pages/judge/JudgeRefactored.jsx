import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { votingAPI } from '../../api/services';
import { useVotingWebSocket } from '../../hooks/useVotingWebSocket';
import useJudgeData from '../../hooks/useJudgeData';
import JudgeSelectionScreen from '../../components/judge/JudgeSelectionScreen';
import LockScreen from '../../components/judge/LockScreen';
import WaitingScreen from '../../components/judge/WaitingScreen';
import ScoringHeader from '../../components/judge/ScoringHeader';
import ScoringTable from '../../components/judge/ScoringTable';

const FORCE_SHOW_SCORING_INTERFACE = true;

export default function Judge() {
  const navigate = useNavigate();
  
  // Use custom hook for data management
  const {
    candidates,
    rounds,
    criteria,
    scores,
    loading,
    handleScoreChange,
    handleScoreSubmit
  } = useJudgeData();
  
  // Local state
  const [selectedRound, setSelectedRound] = useState('1');
  const [scoresHidden, setScoresHidden] = useState(false);
  const [judgeId, setJudgeId] = useState(() => localStorage.getItem('judgeId') || '');
  const [showJudgeSelection, setShowJudgeSelection] = useState(!localStorage.getItem('judgeId'));
  const [showScoringInterface, setShowScoringInterface] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Load initial voting state
  useEffect(() => {
    loadInitialVotingState();
  }, []);

  // Save judgeId to localStorage
  useEffect(() => {
    if (judgeId) {
      localStorage.setItem('judgeId', judgeId);
    }
  }, [judgeId]);

  const loadInitialVotingState = async () => {
    try {
      const response = await votingAPI.getState({ event_id: 1 });
      const votingState = response.data;
      
      if (votingState.is_locked) {
        setIsLocked(true);
      }
      
      if (votingState.is_active && votingState.active_round) {
        setSelectedRound(votingState.active_round.id.toString());
        setShowScoringInterface(true);
      }
    } catch (error) {
      console.error('Error loading initial voting state:', error);
    }
  };

  // WebSocket handler for real-time updates
  const handleVotingStateChange = (data) => {
    console.log('WebSocket update received:', data);
    
    if ((data.action === 'round_activated' || data.action === 'round_changed') && data.voting_state?.active_round) {
      setSelectedRound(data.voting_state.active_round.id.toString());
      setShowScoringInterface(true);
      console.log('Judge screen activated for round:', data.voting_state.active_round.name);
    } 
    else if (data.action === 'stopped') {
      setSelectedRound('');
      setShowScoringInterface(false);
      console.log('Judge screen deactivated - voting stopped');
    }
    else if (data.action === 'started') {
      console.log('Voting started - waiting for round selection');
    }
    else if (data.action === 'locked') {
      setIsLocked(true);
      console.log('Screen locked');
    }
    else if (data.action === 'unlocked') {
      setIsLocked(false);
      console.log('Screen unlocked');
    }
  };

  // Setup WebSocket connection
  useVotingWebSocket(1, handleVotingStateChange);

  // Judge selection handlers
  const handleJudgeSelect = (id) => {
    setJudgeId(id.toString());
  };

  const handleProceed = () => {
    if (judgeId) {
      setShowJudgeSelection(false);
    }
  };

  // Score submission wrapper
  const handleScoreBlur = (candidateId, criteriaId) => {
    handleScoreSubmit(candidateId, criteriaId, judgeId, selectedRound);
  };

  // Filter criteria by selected round
  const filteredCriteria = selectedRound && rounds.length > 0
    ? criteria.filter(c => c.round_id == selectedRound)
    : criteria;

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Judge Selection Screen
  if (showJudgeSelection) {
    return (
      <JudgeSelectionScreen
        onJudgeSelect={handleJudgeSelect}
        onProceed={handleProceed}
        selectedJudgeId={judgeId}
      />
    );
  }

  const shouldShowWaitingScreen = !isLocked && !showScoringInterface && !FORCE_SHOW_SCORING_INTERFACE;
  const shouldShowScoringInterface = !isLocked && (showScoringInterface || FORCE_SHOW_SCORING_INTERFACE);

  return (
    <div>
      {/* Lock Screen Overlay */}
      {isLocked && <LockScreen />}
      
      {/* Waiting Screen */}
      {shouldShowWaitingScreen && <WaitingScreen />}
      
      {/* Scoring Interface */}
      {shouldShowScoringInterface && (
        <>
          <ScoringHeader
            scoresHidden={scoresHidden}
            onToggleScores={() => setScoresHidden(!scoresHidden)}
          />
          <ScoringTable
            candidates={candidates}
            criteria={filteredCriteria}
            scores={scores}
            scoresHidden={scoresHidden}
            onScoreChange={handleScoreChange}
            onScoreSubmit={handleScoreBlur}
          />
        </>
      )}
    </div>
  );
}

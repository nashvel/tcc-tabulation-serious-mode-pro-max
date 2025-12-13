import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Clock, Eye, EyeOff } from 'lucide-react';
import { getApiBase, getCurrentEventId } from '../../config/api';
import { useVotingWebSocket } from '../../hooks/useVotingWebSocket';
import JudgePreloader from '../../components/judge/JudgePreloader';

// Simple API helper functions
const apiBase = getApiBase();

const candidatesAPI = {
  getAll: async (eventId) => {
    const response = await fetch(`${apiBase}/api/candidates?event_id=${eventId}`);
    if (!response.ok) throw new Error(`Failed to fetch candidates: ${response.status}`);
    const data = await response.json();
    return { data: Array.isArray(data) ? data : data.data || [] };
  }
};

const roundsAPI = {
  getAll: async (eventId) => {
    const response = await fetch(`${apiBase}/api/rounds?event_id=${eventId}`);
    if (!response.ok) throw new Error(`Failed to fetch rounds: ${response.status}`);
    const data = await response.json();
    return { data: Array.isArray(data) ? data : data.data || [] };
  }
};

const criteriaAPI = {
  getAll: async (eventId) => {
    const response = await fetch(`${apiBase}/api/criteria?event_id=${eventId}`);
    if (!response.ok) throw new Error(`Failed to fetch criteria: ${response.status}`);
    const data = await response.json();
    return { data: Array.isArray(data) ? data : data.data || [] };
  }
};

const judgesAPI = {
  getAll: async (eventId) => {
    const response = await fetch(`${apiBase}/api/judges?event_id=${eventId}`);
    if (!response.ok) throw new Error(`Failed to fetch judges: ${response.status}`);
    const data = await response.json();
    return { data: Array.isArray(data) ? data : data.data || [] };
  }
};

const pointsAPI = {
  create: async (data) => {
    const response = await fetch(`${apiBase}/api/points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  },
  // Batch create - submits multiple scores at once (reduces WebSocket broadcasts)
  createBatch: async (scores, judgeId, eventId) => {
    const response = await fetch(`${apiBase}/api/points/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        scores,
        judge_id: judgeId,
        event_id: eventId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  },
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${apiBase}/api/points${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      return { data: Array.isArray(data) ? data : data.data || [] };
    } catch (error) {
      console.error('📡 Error in pointsAPI.getAll():', error);
      throw error;
    }
  }
};

const votingAPI = {
  getState: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${apiBase}/api/voting/state?${queryString}`);
    if (!response.ok) throw new Error(`Failed to fetch voting state: ${response.status}`);
    return { data: await response.json() };
  }
};

// Time display component
function TimeDisplay() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span>
      {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
    </span>
  );
}

export default function Judge() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [judges, setJudges] = useState([]);
  const [selectedRound, setSelectedRound] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Female');
  const [scoresHidden, setScoresHidden] = useState(false);
  const [judgeId, setJudgeId] = useState(() => localStorage.getItem('judgeId') || '');
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [showJudgeSelection, setShowJudgeSelection] = useState(!localStorage.getItem('judgeId'));
  const [showScoringInterface, setShowScoringInterface] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [activeRoundName, setActiveRoundName] = useState('Loading...');

  // Setup console command to exit judge
  useEffect(() => {
    window.exitJudge = () => {
      localStorage.removeItem('judgeId');
      setJudgeId('');
      setShowJudgeSelection(true);
      setShowScoringInterface(false);
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    };
  }, []);

  useEffect(() => {
    const initializeEvent = async () => {
      try {
        // Get event ID from localStorage first
        let eid = null;
        const continuingEvent = localStorage.getItem('continuingEvent');
        if (continuingEvent) {
          try {
            const event = JSON.parse(continuingEvent);
            eid = event?.id || event?.unique_id;
          } catch (e) {
            console.error('Error parsing continuingEvent from localStorage:', e);
          }
        }

        // If no event in localStorage, we can't proceed
        if (!eid) {
          console.warn('No event found in localStorage. Judge page requires an event to be selected from admin panel.');
          setLoading(false);
          return;
        }

        setEventId(eid);
        await loadData(eid);
        await loadInitialVotingState(eid);

        // If judge is already selected from localStorage, load their scores
        const savedJudgeId = localStorage.getItem('judgeId');
        if (savedJudgeId) {
          await loadJudgeScores(savedJudgeId, eid);
        }
      } catch (error) {
        console.error('Error initializing event:', error);
        setLoading(false);
      }
    };

    initializeEvent();
  }, []);

  // Load initial voting state
  const loadInitialVotingState = async (eid) => {
    try {
      const response = await votingAPI.getState({ event_id: eid });

      if (response.data) {
        // Load lock state
        setIsLocked(response.data.is_locked ?? false);

        // Load active round - check both active_round object and active_round_id
        const activeRound = response.data.active_round;
        const activeRoundId = response.data.active_round_id;
        
        if (activeRound && activeRound.id) {
          setSelectedRound(activeRound.id.toString());
          setActiveRoundName(activeRound.name || 'Loading...');
          setShowScoringInterface(true);
        } else if (activeRoundId) {
          // Fallback: if we have active_round_id but no active_round object
          setSelectedRound(activeRoundId.toString());
          setShowScoringInterface(true);
        }
      }
    } catch (error) {
      console.error('Error loading initial voting state:', error);
    }
  };

  // WebSocket handler for real-time updates
  const handleVotingStateChange = useCallback((data) => {
    // Handle lock/unlock events
    if (data.action === 'locked') {
      setIsLocked(true);
    }
    // Handle unlock
    else if (data.action === 'unlocked') {
      setIsLocked(false);
    }
    // Handle round activation/change
    else if ((data.action === 'round_activated' || data.action === 'round_changed') && data.voting_state?.active_round) {
      setSelectedRound(data.voting_state.active_round.id.toString());
      setActiveRoundName(data.voting_state.active_round.name || 'Loading...');
      setShowScoringInterface(true);
    }
    // Handle voting stop
    else if (data.action === 'stopped') {
      setSelectedRound('');
      setShowScoringInterface(false);
    }
    // Handle voting start
    else if (data.action === 'started') {
      // Voting started
    }
  }, []);

  // Setup WebSocket connection (call hook at top level)
  useVotingWebSocket(eventId, handleVotingStateChange);

  // Poll lock state every 2 seconds
  useEffect(() => {
    if (!eventId) return;

    const pollLockState = async () => {
      try {
        const response = await votingAPI.getState({ event_id: eventId });
        if (response.data) {
          setIsLocked(response.data.is_locked ?? false);
        }
      } catch (error) {
        console.error('Error polling lock state:', error);
      }
    };

    // Poll immediately on mount
    pollLockState();

    // Then poll every 2 seconds
    const interval = setInterval(pollLockState, 2000);

    return () => clearInterval(interval);
  }, [eventId]);

  useEffect(() => {
    localStorage.setItem('judgeId', judgeId);
  }, [judgeId]);

  const loadData = async (eid) => {
    try {
      const [candidatesRes, roundsRes, criteriaRes, judgesRes] = await Promise.all([
        candidatesAPI.getAll(eid),
        roundsAPI.getAll(eid),
        criteriaAPI.getAll(eid),
        judgesAPI.getAll(eid),
      ]);

      setCandidates(candidatesRes.data || []);
      setRounds(roundsRes.data || []);
      setCriteria(criteriaRes.data || []);
      setJudges(judgesRes.data || []);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
      // Don't show alert - just log the error
    }
  };

  // Load existing scores for the current judge
  const loadJudgeScores = async (jid, eid = null) => {
    try {
      const effectiveEventId = eid || eventId;
      if (!effectiveEventId) return;

      const pointsRes = await pointsAPI.getAll({
        event_id: effectiveEventId,
        judge_id: jid
      });

      // Handle both direct array and wrapped response
      let allPoints = Array.isArray(pointsRes) ? pointsRes : (pointsRes.data || []);

      // Filter points for this judge (redundant check but safe)
      const judgeId = parseInt(jid);
      const judgePoints = allPoints.filter(p => {
        return parseInt(p.judge_id) === judgeId;
      });

      // Transform into scores object
      const loadedScores = {};
      judgePoints.forEach(point => {
        const key = `${point.candidate_id}-${point.criteria_id}`;
        if (point.points !== null && point.points !== undefined) {
          loadedScores[key] = point.points.toString();
        }
      });

      setScores(loadedScores);
    } catch (error) {
      console.error('Error loading judge scores:', error);
    }
  };

  const handleScoreChange = (candidateId, criteriaId, value, maxPoints) => {
    // Only allow numbers and decimal points
    if (value === '') {
      // Allow empty input - queue deletion (send 0 to server)
      setScores(prev => ({
        ...prev,
        [`${candidateId}-${criteriaId}`]: value
      }));
      // Queue score deletion as 0
      queueScore(candidateId, criteriaId, 0);
      return;
    }

    // Check if input contains only numbers and decimal point
    if (!/^\d*\.?\d*$/.test(value)) {
      // Invalid input (contains letters or special chars), don't update
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // Cap the value at maxPoints if it exceeds
      const cappedValue = numValue > maxPoints ? maxPoints : numValue;
      const cappedValueStr = cappedValue.toString();
      
      setScores(prev => ({
        ...prev,
        [`${candidateId}-${criteriaId}`]: cappedValueStr
      }));
      
      // Queue for submission with the ACTUAL value (not from state)
      queueScore(candidateId, criteriaId, cappedValue);
    }
  };

  // Handle Enter key to immediately flush scores
  const handleKeyDown = (e, candidateId, criteriaId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Immediately flush on Enter
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      flushPendingScores();
    }
  };

  // Pending scores buffer and debounce timer refs
  const pendingScoresRef = useRef({});
  const debounceTimerRef = useRef(null);
  const isFlushingRef = useRef(false);

  // Flush pending scores to server (batch submission)
  const flushPendingScores = async () => {
    // Prevent concurrent flushes
    if (isFlushingRef.current) return;
    
    const pending = { ...pendingScoresRef.current };
    const scoresArray = Object.entries(pending).map(([key, data]) => ({
      candidate_id: data.candidateId,
      round_id: parseInt(selectedRound),
      criteria_id: data.criteriaId,
      points: data.points
    }));

    if (scoresArray.length === 0) return;

    // Clear pending before submitting
    pendingScoresRef.current = {};
    isFlushingRef.current = true;

    try {
      await pointsAPI.createBatch(scoresArray, parseInt(judgeId), eventId);
    } catch (error) {
      // Re-add failed scores back to pending for retry
      // Re-add failed scores back to pending for retry
      Object.entries(pending).forEach(([key, data]) => {
        if (!pendingScoresRef.current[key]) {
          pendingScoresRef.current[key] = data;
        }
      });
    } finally {
      isFlushingRef.current = false;
    }
  };

  // Queue score for batch submission - takes value directly (not from state)
  const queueScore = (candidateId, criteriaId, points) => {
    if (points === null || points === undefined) {
      return;
    }

    const key = `${candidateId}-${criteriaId}`;
    
    // Add to pending scores buffer with the ACTUAL value passed in
    pendingScoresRef.current[key] = {
      candidateId,
      criteriaId,
      points: parseFloat(points)
    };

    // Clear existing timer and start new one
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Flush after 300ms of no new inputs
    debounceTimerRef.current = setTimeout(() => {
      flushPendingScores();
    }, 300);
    
    // Also flush immediately if 5+ scores pending
    if (Object.keys(pendingScoresRef.current).length >= 5 && !isFlushingRef.current) {
      clearTimeout(debounceTimerRef.current);
      flushPendingScores();
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        // Flush any remaining scores on unmount
        flushPendingScores();
      }
    };
  }, []);

  const handleJudgeSelect = (id) => {
    setJudgeId(id.toString());
    localStorage.setItem('judgeId', id.toString());

    // Load existing scores for this judge
    loadJudgeScores(id.toString(), eventId);
    // Don't hide the selection screen yet - wait for PROCEED
  };

  const handleProceed = () => {
    if (judgeId) {
      setShowJudgeSelection(false); // Now hide and go to scoring interface
      // Refresh the page to load scoring interface fresh
      setTimeout(() => {
        window.location.reload();
      }, 300);
      // navigate('/scoreboard'); // Removed - stay on judge page for scoring
    }
  };

  // Filter criteria by selected round (if rounds exist)
  const filteredCriteria = selectedRound && rounds.length > 0
    ? criteria.filter(c => c.round_id === parseInt(selectedRound))
    : criteria;

  // Show all candidates (both Female and Male in one table)
  const filteredCandidates = candidates;

  // judges pre loader
  if (loading) {
    return <JudgePreloader />;
  }

  // Judge Selection Screen (Matching Old UI)
  if (showJudgeSelection) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#fff' }}>
        {/* Header matching old system - Orange */}
        <div style={{
          backgroundColor: '#f97316',
          borderBottom: '5px solid #ea580c',
          padding: '8px 0',
          marginBottom: '20px'
        }}>
          {/* Empty red header bar - matches old system exactly */}
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <hr className="border-gray-300 mb-8" />

            {/* Judge Selection Buttons */}
            <div className="text-center space-y-6">
              {judges.length === 0 ? (
                <p className="text-gray-500 py-8">No judges available</p>
              ) : (
                <>
                  {/* Render judges in rows of 3 */}
                  {Array.from({ length: Math.ceil(judges.length / 3) }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-4 flex-wrap">
                      {judges.slice(rowIndex * 3, (rowIndex + 1) * 3).map((judge) => (
                        <button
                          key={judge.id}
                          onClick={() => handleJudgeSelect(judge.id)}
                          className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-8 py-6 transition-all flex flex-col items-center gap-3"
                          style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '15px' }}
                        >
                          <img src="/assets/icon/2994536.png" alt="Judge" className="h-20" />
                          <div>
                            SELECT <br />
                            JUDGE <span className="inline-block bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">{String(judge.chair_number).padStart(2, '0')}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
                </>
              )}

              <hr className="border-gray-300 my-6 w-3/4 mx-auto" />

              {/* Judge Selected Message */}
              {judgeId && (
                <p className="text-lg font-bold">
                  JUDGE <span className="inline-block bg-red-600 text-white px-4 py-1 rounded" style={{ letterSpacing: '2px' }}>
                    [#{String(judges.find(j => j.id === parseInt(judgeId))?.chair_number || judgeId).padStart(2, '0')}]
                  </span> WAS CHOSEN
                </p>
              )}

              {/* Proceed Button */}
              <button
                onClick={handleProceed}
                disabled={!judgeId}
                className={`${judgeId ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                  } text-white px-8 py-4 rounded-lg text-lg font-medium transition-all flex items-center gap-3 mx-auto`}
                style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '15px' }}
              >
                PROCEED
                <img src="/assets/icon/440562.png" alt="Arrow" className="h-9" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChangeJudge = () => {
    setJudgeId('');
    localStorage.removeItem('judgeId');
    setShowJudgeSelection(true);
  };

  // Scoring Interface - Minimalist design matching admin panel
  return (
    <div className="min-h-screen bg-gray-50 relative font-sans antialiased">
      {/* Lock Screen Overlay */}
      {isLocked && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center text-white">
          <span className="material-icons text-amber-500 mb-8" style={{ fontSize: '120px' }}>lock</span>
          <h1 className="text-5xl font-bold mb-5">Screen Locked</h1>
          <p className="text-2xl text-gray-400">Waiting for admin to unlock...</p>
        </div>
      )}

      {/* Waiting for Admin Screen - Skeleton UI */}
      {!isLocked && !showScoringInterface && (
        <div className="min-h-screen bg-gray-50">
          {/* Skeleton Header */}
          <div className="bg-white border-b border-gray-200 py-4 px-6">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>

          {/* Skeleton Table */}
          <div className="p-4">
            {/* Section Title */}
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Table Header */}
            <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 flex gap-4 p-3">
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-28 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Skeleton Rows */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 border-b border-gray-100">
                  <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-4 w-14 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Waiting Message */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-400">Waiting for admin to activate a round...</p>
            </div>
          </div>
        </div>
      )}

      {/* Show scoring interface only when activated by admin and not locked */}
      {!isLocked && showScoringInterface && (
        <div className="bg-gray-50">
          {/* Round Header */}
          <div className="text-center py-4 bg-white border-b border-gray-200">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Currently Scoring</p>
            <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">{activeRoundName}</h1>
          </div>

          {/* Main Content - Full width, no edge spacing */}
          <div className="w-full">
            {/* Female Candidates Table */}
            <div className="mb-0">
              <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-pink-600">Female Candidates</h3>
                <button
                  onClick={() => setScoresHidden(!scoresHidden)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all
                    ${scoresHidden ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                >
                  {scoresHidden ? <EyeOff size={10} /> : <Eye size={10} />}
                  {scoresHidden ? 'Hidden' : 'Hide'}
                </button>
              </div>

              <div className="bg-white overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '200px' }}>Candidate</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '180px' }}>Team/Dept</th>
                      {filteredCriteria.map(crit => (
                        <th key={crit.id} className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                          {crit.name} ({crit.points}%)
                        </th>
                      ))}
                      <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '80px' }}>AVG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCandidates.filter(c => (c.category === 'Female' || c.gender === 'Female')).map(candidate => {
                      const candidateScores = filteredCriteria.map(crit => parseFloat(scores[`${candidate.id}-${crit.id}`] || 0));
                      const average = candidateScores.reduce((sum, score) => sum + score, 0);

                      return (
                        <tr key={candidate.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                              {candidate.number} - {candidate.name?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600 font-medium">{candidate.team || candidate.department || '-'}</span>
                          </td>
                          {filteredCriteria.map(crit => (
                            <td key={crit.id} className="py-2 px-2 text-center">
                              <input
                                type="number"
                                value={scores[`${candidate.id}-${crit.id}`] || ''}
                                onChange={(e) => handleScoreChange(candidate.id, crit.id, e.target.value, crit.points)}
                                onKeyDown={(e) => handleKeyDown(e, candidate.id, crit.id)}
                                max={crit.points}
                                min="0"
                                step="0.01"
                                placeholder={`0-${crit.points}`}
                                className={`w-full text-center py-2 px-1 text-sm font-mono border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${scoresHidden ? 'blur-md' : ''}`}
                              />
                            </td>
                          ))}
                          <td className="py-3 px-4 text-center">
                            <span className={`font-mono text-sm font-bold tracking-tight ${average > 0 ? 'text-blue-500' : 'text-gray-300'} ${scoresHidden ? 'blur-md' : ''}`}>
                              {average > 0 ? average.toFixed(2) : '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Male Candidates Table */}
            <div className="mb-0">
              <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-600">Male Candidates</h3>
              </div>

              <div className="bg-white overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '200px' }}>Candidate</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '180px' }}>Team/Dept</th>
                      {filteredCriteria.map(crit => (
                        <th key={crit.id} className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '120px' }}>
                          {crit.name} ({crit.points}%)
                        </th>
                      ))}
                      <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '80px' }}>AVG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCandidates.filter(c => (c.category === 'Male' || c.gender === 'Male')).map(candidate => {
                      const candidateScores = filteredCriteria.map(crit => parseFloat(scores[`${candidate.id}-${crit.id}`] || 0));
                      const average = candidateScores.reduce((sum, score) => sum + score, 0);

                      return (
                        <tr key={candidate.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                              {candidate.number} - {candidate.name?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600 font-medium">{candidate.team || candidate.department || '-'}</span>
                          </td>
                          {filteredCriteria.map(crit => (
                            <td key={crit.id} className="py-2 px-2 text-center">
                              <input
                                type="number"
                                value={scores[`${candidate.id}-${crit.id}`] || ''}
                                onChange={(e) => handleScoreChange(candidate.id, crit.id, e.target.value, crit.points)}
                                onKeyDown={(e) => handleKeyDown(e, candidate.id, crit.id)}
                                max={crit.points}
                                min="0"
                                step="0.01"
                                placeholder={`0-${crit.points}`}
                                className={`w-full text-center py-2 px-1 text-sm font-mono border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${scoresHidden ? 'blur-md' : ''}`}
                              />
                            </td>
                          ))}
                          <td className="py-3 px-4 text-center">
                            <span className={`font-mono text-sm font-bold tracking-tight ${average > 0 ? 'text-blue-500' : 'text-gray-300'} ${scoresHidden ? 'blur-md' : ''}`}>
                              {average > 0 ? average.toFixed(2) : '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

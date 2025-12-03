import React, { useState, useEffect, useCallback } from 'react';
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
  const [selectedRound, setSelectedRound] = useState('1');
  const [selectedCriteria, setSelectedCriteria] = useState('1');
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
        // Get event ID from voting state
        const response = await votingAPI.getState({});

        if (response.data?.event_id) {
          const eid = response.data.event_id;
          setEventId(eid);

          // Event name fetch removed as it was unused

          await loadData(eid);
          await loadInitialVotingState(eid);

          // If judge is already selected from localStorage, load their scores
          const savedJudgeId = localStorage.getItem('judgeId');
          if (savedJudgeId) {
            await loadJudgeScores(savedJudgeId);
          }
        } else {
          console.warn('No event_id in voting state response');
          setLoading(false);
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
      console.log('Initial voting state:', response.data);

      if (response.data) {
        // Load lock state
        if (response.data.is_locked) {
          setIsLocked(true);
        }

        // Load active round
        if (response.data.active_round && response.data.active_round.id) {
          setSelectedRound(response.data.active_round.id.toString());
          setActiveRoundName(response.data.active_round.name || 'Loading...');
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

  useEffect(() => {
    localStorage.setItem('judgeId', judgeId);
  }, [judgeId]);

  const loadData = async (eid) => {
    try {
      console.time('loadData');
      console.time('fetchCandidates');
      console.time('fetchRounds');
      console.time('fetchCriteria');
      console.time('fetchJudges');

      const [candidatesRes, roundsRes, criteriaRes, judgesRes] = await Promise.all([
        candidatesAPI.getAll(eid).then(res => { console.timeEnd('fetchCandidates'); return res; }),
        roundsAPI.getAll(eid).then(res => { console.timeEnd('fetchRounds'); return res; }),
        criteriaAPI.getAll(eid).then(res => { console.timeEnd('fetchCriteria'); return res; }),
        judgesAPI.getAll(eid).then(res => { console.timeEnd('fetchJudges'); return res; }),
      ]);
      console.timeEnd('loadData');

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
  const loadJudgeScores = async (jid) => {
    try {
      if (!eventId) return;

      const pointsRes = await pointsAPI.getAll({
        event_id: eventId,
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
      // Allow empty input
      setScores(prev => ({
        ...prev,
        [`${candidateId}-${criteriaId}`]: value
      }));
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
      setScores(prev => ({
        ...prev,
        [`${candidateId}-${criteriaId}`]: cappedValue.toString()
      }));
    }
  };

  const handleSubmit = async (candidateId, criteriaId) => {
    const key = `${candidateId}-${criteriaId}`;
    const points = scores[key];

    if (!points || points === '') {
      return; // Silently ignore empty submissions
    }

    try {
      const response = await pointsAPI.create({
        candidate_id: candidateId,
        round_id: selectedRound,
        criteria_id: criteriaId,
        points: parseFloat(points),
        judge_id: parseInt(judgeId),
        event_id: eventId
      });

      // Only show success if response is valid
      if (response && response.id) {
        console.log('Score saved successfully:', response);
        // Don't clear the field - keep it for reference
      }
    } catch (error) {
      console.error('Error saving score:', error);
      // Don't show alert on error - just log it
    }
  };

  const handleJudgeSelect = (id) => {
    setJudgeId(id.toString());
    localStorage.setItem('judgeId', id.toString());

    // Load existing scores for this judge
    loadJudgeScores(id.toString());
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

  // Scoring Interface
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fff', position: 'relative' }}>
      {/* Lock Screen Overlay */}
      {isLocked && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff'
        }}>
          <span className="material-icons" style={{ fontSize: '120px', marginBottom: '30px', color: '#f59e0b' }}>
            lock
          </span>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>
            Screen Locked
          </h1>
          <p style={{ fontSize: '24px', color: '#9ca3af' }}>
            Waiting for admin to unlock...
          </p>
        </div>
      )}


      {/* Show empty state by default - matching old system behavior */}
      {!isLocked && !showScoringInterface && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          backgroundColor: '#fff'
        }}>
          <div style={{ textAlign: 'center' }}>
            <img src="/assets/lnk-logo.png" alt="LNK Logo" style={{ height: '300px', opacity: 0.8 }} />
            <br /><br />
            <p style={{ color: '#666', fontSize: '24px', marginTop: '20px' }}>
              Waiting for Admin to select criteria...
            </p>
          </div>
        </div>
      )}

      {/* Show scoring interface only when activated by admin and not locked */}
      {!isLocked && showScoringInterface && (
        <div style={{ backgroundColor: '#fff' }}>
          {/* Professional Header with Logos - Same as Admin */}
          <div className="bg-white px-8 py-6 border-b border-slate-100 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

              {/* Left: Time Display */}
              <div className="flex-1 min-w-[200px]">
                <div className="text-2xl font-light text-slate-900 tracking-tight uppercase">
                  <TimeDisplay />
                </div>
              </div>

              {/* Center: Logos (Balanced) */}
              <div className="flex items-center justify-center gap-6 py-2">
                <img src="/assets/logo-3.png" className="h-14 object-contain drop-shadow-sm filter hover:brightness-110 transition-all" alt="Logo 1" />
                <div className="h-10 w-px bg-slate-200"></div>
                <img src="/assets/tcc_seal.png" className="h-14 object-contain drop-shadow-sm filter hover:brightness-110 transition-all" alt="Seal" />
                <div className="h-10 w-px bg-slate-200"></div>
                <img src="/src/assets/logo.png" className="h-16 object-contain drop-shadow-sm filter hover:brightness-110 transition-all" alt="App Logo" />
                <div className="h-10 w-px bg-slate-200"></div>
                <img src="/assets/it.png" className="h-14 object-contain drop-shadow-sm filter hover:brightness-110 transition-all" alt="IT" />
                <div className="h-10 w-px bg-slate-200"></div>
                <img src="/assets/bsit.png" className="h-14 object-contain drop-shadow-sm filter hover:brightness-110 transition-all" alt="BSIT" />
              </div>

              {/* Right: Empty space for balance */}
              <div className="flex-1 min-w-[200px]"></div>
            </div>
          </div>

          {/* Hide Scores Button - Below Header */}
          <div style={{
            backgroundColor: '#fff',
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #ddd',
            position: 'relative'
          }}>
            {/* Minimal Accent Line at bottom */}
            <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', height: '2px', backgroundColor: '#1e293b' }}></div>

            {/* Active Round Display */}
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#1e293b',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Active Round: <span style={{ color: '#f97316' }}>{activeRoundName}</span>
            </div>

            <button
              onClick={() => setScoresHidden(!scoresHidden)}
              style={{
                backgroundColor: '#f97316',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {scoresHidden ? <Eye size={18} /> : <EyeOff size={18} />}
              {scoresHidden ? 'Show My Scores' : 'Hide My Scores'}
            </button>
          </div>

          {/* Female Category Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
            <thead>
              <tr>
                <td style={{
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontWeight: '800',
                  color: 'red',
                  padding: '10px',
                  border: '1px solid #ddd'
                }}>
                  Female Category
                </td>
                {filteredCriteria.map(criteriaItem => (
                  <th key={criteriaItem.id} style={{
                    textAlign: 'center',
                    padding: '10px',
                    border: '1px solid #ddd',
                    backgroundColor: '#f9f9f9'
                  }}>
                    {criteriaItem.name} <b>({criteriaItem.points}%)</b>
                  </th>
                ))}
                <th style={{
                  textAlign: 'center',
                  padding: '10px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f9f9f9'
                }}>
                  AVERAGE <b>(100%)</b>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.filter(c => (c.category === 'Female' || c.gender === 'Female')).map(candidate => {
                const candidateScores = filteredCriteria.map(crit =>
                  parseFloat(scores[`${candidate.id}-${crit.id}`] || 0)
                );
                const average = candidateScores.reduce((sum, score) => sum + score, 0);

                return (
                  <tr key={candidate.id}>
                    <td style={{
                      padding: '15px 10px',
                      textTransform: 'uppercase',
                      fontWeight: '800',
                      color: '#000',
                      border: '1px solid #ddd'
                    }}>
                      &ensp;&ensp;(#{candidate.number}). &nbsp; {candidate.name}
                    </td>
                    {filteredCriteria.map(criteriaItem => (
                      <td key={criteriaItem.id} style={{ border: '1px solid #ddd', padding: '5px' }}>
                        <input
                          type={scoresHidden ? 'password' : 'number'}
                          value={scores[`${candidate.id}-${criteriaItem.id}`] || ''}
                          onChange={(e) => handleScoreChange(candidate.id, criteriaItem.id, e.target.value, criteriaItem.points)}
                          onBlur={() => handleSubmit(candidate.id, criteriaItem.id)}
                          max={criteriaItem.points}
                          min="0"
                          step="0.01"
                          placeholder={`Score: 1-${criteriaItem.points}`}
                          style={{
                            width: '100%',
                            border: 'none',
                            borderBottom: '1px solid #ccc',
                            textAlign: 'center',
                            padding: '8px',
                            fontSize: '14px',
                            filter: scoresHidden ? 'blur(8px)' : 'none',
                            transition: 'filter 0.3s ease'
                          }}
                        />
                      </td>
                    ))}
                    <td style={{ border: '1px solid #ddd', padding: '5px', textAlign: 'center' }}>
                      <input
                        type={scoresHidden ? 'password' : 'number'}
                        value={average.toFixed(2)}
                        readOnly
                        style={{
                          width: '100%',
                          border: 'none',
                          textAlign: 'center',
                          padding: '8px',
                          fontWeight: 'bold',
                          backgroundColor: '#f9f9f9'
                        }}
                      />
                    </td>
                  </tr>
                );
              })}

              {/* Male Category Header */}
              <tr>
                <td style={{
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontWeight: '800',
                  color: 'red',
                  padding: '10px',
                  border: '1px solid #ddd',
                  textAlign: 'center'
                }}>
                  Male Category
                </td>
                {filteredCriteria.map(criteriaItem => (
                  <th key={criteriaItem.id} style={{
                    textAlign: 'center',
                    padding: '10px',
                    border: '1px solid #ddd',
                    backgroundColor: '#f9f9f9'
                  }}>
                    {criteriaItem.name} <b>({criteriaItem.points}%)</b>
                  </th>
                ))}
                <th style={{
                  textAlign: 'center',
                  padding: '10px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f9f9f9'
                }}>
                  AVERAGE <b>(100%)</b>
                </th>
              </tr>

              {/* Male Candidates */}
              {filteredCandidates.filter(c => (c.category === 'Male' || c.gender === 'Male')).map(candidate => {
                const candidateScores = filteredCriteria.map(crit =>
                  parseFloat(scores[`${candidate.id}-${crit.id}`] || 0)
                );
                const average = candidateScores.reduce((sum, score) => sum + score, 0);

                return (
                  <tr key={candidate.id}>
                    <td style={{
                      padding: '15px 10px',
                      textTransform: 'uppercase',
                      fontWeight: '800',
                      color: '#000',
                      border: '1px solid #ddd'
                    }}>
                      &ensp;&ensp;(#{candidate.number}). &nbsp; {candidate.name}
                    </td>
                    {filteredCriteria.map(criteriaItem => (
                      <td key={criteriaItem.id} style={{ border: '1px solid #ddd', padding: '5px' }}>
                        <input
                          type={scoresHidden ? 'password' : 'number'}
                          value={scores[`${candidate.id}-${criteriaItem.id}`] || ''}
                          onChange={(e) => handleScoreChange(candidate.id, criteriaItem.id, e.target.value, criteriaItem.points)}
                          onBlur={() => handleSubmit(candidate.id, criteriaItem.id)}
                          max={criteriaItem.points}
                          min="0"
                          step="0.01"
                          placeholder={`Score: 1-${criteriaItem.points}`}
                          style={{
                            width: '100%',
                            border: 'none',
                            borderBottom: '1px solid #ccc',
                            textAlign: 'center',
                            padding: '8px',
                            fontSize: '14px',
                            filter: scoresHidden ? 'blur(8px)' : 'none',
                            transition: 'filter 0.3s ease'
                          }}
                        />
                      </td>
                    ))}
                    <td style={{ border: '1px solid #ddd', padding: '5px', textAlign: 'center' }}>
                      <input
                        type={scoresHidden ? 'password' : 'number'}
                        value={average.toFixed(2)}
                        readOnly
                        style={{
                          width: '100%',
                          border: 'none',
                          textAlign: 'center',
                          padding: '8px',
                          fontWeight: 'bold',
                          backgroundColor: '#f9f9f9'
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

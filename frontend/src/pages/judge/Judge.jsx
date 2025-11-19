import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidatesAPI, roundsAPI, criteriaAPI, pointsAPI, votingAPI } from '../../api/services';
import { useVotingWebSocket } from '../../hooks/useVotingWebSocket';

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

  useEffect(() => {
    loadData();
    loadInitialVotingState();
  }, []);

  // Load initial voting state
  const loadInitialVotingState = async () => {
    try {
      const response = await votingAPI.getState({ event_id: 1 });
      console.log('Initial voting state:', response.data);
      
      if (response.data) {
        // Load lock state
        if (response.data.is_locked) {
          setIsLocked(true);
        }
        
        // Load active round
        if (response.data.active_round && response.data.active_round.id) {
          setSelectedRound(response.data.active_round.id.toString());
          setShowScoringInterface(true);
        }
      }
    } catch (error) {
      console.error('Error loading initial voting state:', error);
    }
  };

  // WebSocket handler for real-time updates
  const handleVotingStateChange = (data) => {
    console.log('WebSocket update received:', data);
    
    // Handle round activation/change
    if ((data.action === 'round_activated' || data.action === 'round_changed') && data.voting_state?.active_round) {
      setSelectedRound(data.voting_state.active_round.id.toString());
      setShowScoringInterface(true);
      console.log('Judge screen activated for round:', data.voting_state.active_round.name);
    } 
    // Handle voting stop
    else if (data.action === 'stopped') {
      setSelectedRound('');
      setShowScoringInterface(false);
      console.log('Judge screen deactivated - voting stopped');
    }
    // Handle voting start
    else if (data.action === 'started') {
      console.log('Voting started - waiting for round selection');
    }
    // Handle lock
    else if (data.action === 'locked') {
      setIsLocked(true);
      console.log('Screen locked');
    }
    // Handle unlock
    else if (data.action === 'unlocked') {
      setIsLocked(false);
      console.log('Screen unlocked');
    }
  };

  // Setup WebSocket connection
  useVotingWebSocket(1, handleVotingStateChange);

  useEffect(() => {
    localStorage.setItem('judgeId', judgeId);
  }, [judgeId]);

  const loadData = async () => {
    try {
      const [candidatesRes, roundsRes, criteriaRes] = await Promise.all([
        candidatesAPI.getAll(),
        roundsAPI.getAll(),
        criteriaAPI.getAll(),
      ]);
      
      setCandidates(candidatesRes.data);
      setRounds(roundsRes.data);
      setCriteria(criteriaRes.data);
      
      console.log('Loaded candidates:', candidatesRes.data.length);
      console.log('Loaded rounds:', roundsRes.data.length);
      console.log('Loaded criteria:', criteriaRes.data.length);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data from server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (candidateId, criteriaId, value) => {
    setScores(prev => ({
      ...prev,
      [`${candidateId}-${criteriaId}`]: value
    }));
  };

  const handleSubmit = async (candidateId, criteriaId) => {
    const key = `${candidateId}-${criteriaId}`;
    const points = scores[key];
    
    if (!points || points === '') {
      alert('Please enter a score');
      return;
    }

    try {
      await pointsAPI.create({
        candidate_id: candidateId,
        round_id: selectedRound,
        criteria_id: criteriaId,
        points: parseInt(points),
        judge_id: parseInt(judgeId),
        category: selectedCategory
      });
      alert('Score saved successfully!');
      setScores(prev => ({ ...prev, [key]: '' }));
    } catch (error) {
      console.error('Error saving score:', error);
      alert('Failed to save score');
    }
  };

  const handleJudgeSelect = (id) => {
    setJudgeId(id.toString());
    localStorage.setItem('judgeId', id.toString());
    // Don't hide the selection screen yet - wait for PROCEED
  };

  const handleProceed = () => {
    if (judgeId) {
      setShowJudgeSelection(false); // Now hide and go to scoring interface
      // navigate('/scoreboard'); // Removed - stay on judge page for scoring
    }
  };

  // Filter criteria by selected round (if rounds exist)
  const filteredCriteria = selectedRound && rounds.length > 0
    ? criteria.filter(c => c.round_id == selectedRound)
    : criteria;
  
  // Show all candidates (both Female and Male in one table)
  const filteredCandidates = candidates;

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-xl">Loading...</div>
    </div>;
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
              {/* First Row - 3 Judges */}
              <div className="flex justify-center gap-4">
                {[1, 2, 3].map((id) => (
                  <button
                    key={id}
                    onClick={() => handleJudgeSelect(id)}
                    className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-8 py-6 transition-all flex flex-col items-center gap-3"
                    style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '15px' }}
                  >
                    <img src="/assets/icon/2994536.png" alt="Judge" className="h-20" />
                    <div>
                      SELECT <br />
                      JUDGE <span className="inline-block bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">{String(id).padStart(2, '0')}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Second Row - 2 Judges */}
              <div className="flex justify-center gap-4">
                {[4, 5].map((id) => (
                  <button
                    key={id}
                    onClick={() => handleJudgeSelect(id)}
                    className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-8 py-6 transition-all flex flex-col items-center gap-3"
                    style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '15px' }}
                  >
                    <img src="/assets/icon/2994536.png" alt="Judge" className="h-20" />
                    <div>
                      SELECT <br />
                      JUDGE <span className="inline-block bg-red-600 text-white px-3 py-1 rounded text-sm font-bold">{String(id).padStart(2, '0')}</span>
                    </div>
                  </button>
                ))}
              </div>

              <hr className="border-gray-300 my-6 w-3/4 mx-auto" />

              {/* Judge Selected Message */}
              {judgeId && (
                <p className="text-lg font-bold">
                  JUDGE <span className="inline-block bg-red-600 text-white px-4 py-1 rounded" style={{ letterSpacing: '2px' }}>
                    [#0{judgeId}]
                  </span> WAS CHOSEN
                </p>
              )}

              {/* Proceed Button */}
              <button
                onClick={handleProceed}
                disabled={!judgeId}
                className={`${
                  judgeId ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
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
      
      {/* Header matching old system - Orange */}
      <div style={{ 
        backgroundColor: '#f97316',
        borderBottom: '5px solid #ea580c',
        padding: '8px 0'
      }}>
        {/* Empty orange header bar */}
      </div>
      
      {/* Time and Logos Row */}
      <div style={{ 
        backgroundColor: '#fff',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #ddd'
      }}>
        {/* Time Display on Left */}
        <div style={{ 
          fontSize: '32px',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          minWidth: '200px'
        }}>
          <TimeDisplay />
        </div>
        
        {/* Logos in Center */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          flex: 1
        }}>
          <img src="/assets/1.png" alt="Logo 1" style={{ height: '60px' }} />
          <img src="/assets/2.png" alt="Logo 2" style={{ height: '60px' }} />
          <img src="/assets/3.png" alt="Logo 3" style={{ height: '60px' }} />
          <img src="/assets/4.png" alt="Logo 4" style={{ height: '60px' }} />
          <img src="/assets/5.png" alt="Logo 5" style={{ height: '60px' }} />
          <img src="/assets/6.png" alt="Logo 6" style={{ height: '60px' }} />
          <img src="/assets/7.png" alt="Logo 7" style={{ height: '60px' }} />
        </div>
        
        {/* Empty space on right for balance */}
        <div style={{ minWidth: '200px' }}></div>
      </div>
      
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
      <div style={{ backgroundColor: '#fff', padding: '20px' }}>
        {/* Header with Hide Scores Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          paddingLeft: '25px'
        }}>
          <h3 style={{
            textTransform: 'uppercase',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 'bolder',
            fontSize: '24px',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <img src="/assets/1642423.png" alt="" style={{ height: '55px' }} />
            Criteria for Judging (Linggo Ng Kabataan)
          </h3>
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
              marginRight: '20px'
            }}
          >
            <span style={{ marginRight: '8px' }}>👁</span>
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
                <strong style={{ fontWeight: 'bolder' }}>(BARANGAY)</strong>
                <br />
                Female Category
              </td>
              {filteredCriteria.map(criteriaItem => (
                <th key={criteriaItem.id} style={{ 
                  textAlign: 'center',
                  padding: '10px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f9f9f9'
                }}>
                  {criteriaItem.name} <b>({criteriaItem.max_score}%)</b>
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
              const average = candidateScores.reduce((sum, score) => sum + score, 0) / candidateScores.length || 0;
              
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
                        onChange={(e) => handleScoreChange(candidate.id, criteriaItem.id, e.target.value)}
                        onBlur={() => handleScoreSubmit(candidate.id, criteriaItem.id)}
                        max={criteriaItem.max_score}
                        min="0"
                        step="0.01"
                        placeholder={`Score: 1-${criteriaItem.max_score}`}
                        style={{
                          width: '100%',
                          border: 'none',
                          borderBottom: '1px solid #ccc',
                          textAlign: 'center',
                          padding: '8px',
                          fontSize: '14px'
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
                <strong style={{ fontWeight: 'bolder' }}>(BARANGAY)</strong>
                <br />
                Male Category
              </td>
              {filteredCriteria.map(criteriaItem => (
                <th key={criteriaItem.id} style={{ 
                  textAlign: 'center',
                  padding: '10px',
                  border: '1px solid #ddd',
                  backgroundColor: '#f9f9f9'
                }}>
                  {criteriaItem.name} <b>({criteriaItem.max_score}%)</b>
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
              const average = candidateScores.reduce((sum, score) => sum + score, 0) / candidateScores.length || 0;
              
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
                        onChange={(e) => handleScoreChange(candidate.id, criteriaItem.id, e.target.value)}
                        onBlur={() => handleScoreSubmit(candidate.id, criteriaItem.id)}
                        max={criteriaItem.max_score}
                        min="0"
                        step="0.01"
                        placeholder={`Score: 1-${criteriaItem.max_score}`}
                        style={{
                          width: '100%',
                          border: 'none',
                          borderBottom: '1px solid #ccc',
                          textAlign: 'center',
                          padding: '8px',
                          fontSize: '14px'
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

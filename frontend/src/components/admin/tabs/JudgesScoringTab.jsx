import { useState, useEffect, useRef } from 'react';
import echo from '../../../lib/echo';

export default function JudgesScoringTab({ candidates }) {
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [scores, setScores] = useState({});
  const [partnerScores, setPartnerScores] = useState({});
  const [judges, setJudges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const pollingIntervalRef = useRef(null);
  
  // Check if we have duo participants
  const hasDuoParticipants = (candidates || []).some(c => c.participant_type === 'duo' && c.partner_name);

  // Fetch real data from backend - optimized with parallel requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get latest event ID first (quick query)
        const eventsResponse = await fetch('http://localhost:8000/api/events');
        const events = await eventsResponse.json();
        const latestEvent = events.sort((a, b) => b.id - a.id)[0];
        const eventId = latestEvent?.id || 1;
        
        // Fetch rounds and event details in parallel
        const [roundsResponse, eventResponse] = await Promise.all([
          fetch(`http://localhost:8000/api/rounds?event_id=${eventId}`),
          fetch(`http://localhost:8000/api/events/${eventId}`)
        ]);
        
        const rounds = await roundsResponse.json();
        const eventData = await eventResponse.json();
        
        setCategories(rounds);
        
        if (rounds.length > 0 && !selectedCategory) {
          setSelectedCategory(rounds[0].id);
        }
        
        // Create judge list based on number_of_judges
        const judgeList = Array.from({ length: eventData.number_of_judges || 5 }, (_, i) => ({
          id: i + 1,
          name: `Judge ${i + 1}`
        }));
        setJudges(judgeList);
        
        // Fetch scores from backend (TODO: implement scores API endpoint)
        // For now, initialize empty scores with category structure
        const emptyScores = {};
        judgeList.forEach(judge => {
          emptyScores[judge.id] = {};
          (candidates || []).forEach(candidate => {
            emptyScores[judge.id][candidate.id] = {};
            rounds.forEach(category => {
              emptyScores[judge.id][candidate.id][category.id] = null;
            });
          });
        });
        setScores(emptyScores);
        
        if (hasDuoParticipants) {
          const emptyPartnerScores = {};
          judgeList.forEach(judge => {
            emptyPartnerScores[judge.id] = {};
            (candidates || []).forEach(candidate => {
              if (candidate.participant_type === 'duo' && candidate.partner_name) {
                emptyPartnerScores[judge.id][candidate.id] = {};
                rounds.forEach(category => {
                  emptyPartnerScores[judge.id][candidate.id][category.id] = null;
                });
              }
            });
          });
          setPartnerScores(emptyPartnerScores);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    // Fetch data immediately without blocking UI
    fetchData();
  }, [candidates]);

  // Real-time WebSocket score updates
  useEffect(() => {
    const fetchInitialScores = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/points');
        if (response.ok) {
          const pointsData = await response.json();
          
          // Transform points data into scores structure
          const newScores = {};
          const newPartnerScores = {};
          
          judges.forEach(judge => {
            newScores[judge.id] = {};
            newPartnerScores[judge.id] = {};
            
            (candidates || []).forEach(candidate => {
              newScores[judge.id][candidate.id] = {};
              if (candidate.participant_type === 'duo' && candidate.partner_name) {
                newPartnerScores[judge.id][candidate.id] = {};
              }
              
              categories.forEach(category => {
                const point = pointsData.find(p => 
                  p.judge_id === judge.id && 
                  p.candidate_id === candidate.id && 
                  p.round_id === category.id
                );
                
                newScores[judge.id][candidate.id][category.id] = point?.points || null;
              });
            });
          });
          
          setScores(newScores);
          setPartnerScores(newPartnerScores);
        }
      } catch (error) {
        console.error('Error fetching initial scores:', error);
      }
    };

    if (judges.length > 0 && categories.length > 0) {
      setIsLive(true);
      
      // Fetch initial scores
      fetchInitialScores();
      
      // Subscribe to WebSocket channel for real-time updates
      const eventId = 1; // Make this dynamic based on your event
      const channel = echo.channel(`scores.${eventId}`);
      
      channel.listen('.score.updated', (data) => {
        console.log('Score updated via WebSocket:', data);
        
        // Update scores state with new data
        setScores(prevScores => {
          const newScores = { ...prevScores };
          if (newScores[data.judge_id] && newScores[data.judge_id][data.candidate_id]) {
            newScores[data.judge_id][data.candidate_id][data.round_id] = data.points;
          }
          return newScores;
        });
      });
      
      console.log('WebSocket connected to scores.' + eventId);
    }

    // Cleanup on unmount
    return () => {
      const eventId = 1;
      echo.leave(`scores.${eventId}`);
      setIsLive(false);
    };
  }, [judges, categories, candidates]);

  return (
    <div style={{ zoom: '0.85' }}>
      {/* Live Update Indicator */}
      {isLive && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          backgroundColor: '#10b981',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></span>
          Live Updates
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      
      {judges.length === 0 ? (
        <div style={{ 
          padding: '40px 20px', 
          textAlign: 'center', 
          color: '#9ca3af',
          fontSize: '14px'
        }}>
          <div style={{ marginBottom: '8px' }}><i className="fas fa-spinner fa-spin"></i></div>
          <div>Loading scoring data...</div>
        </div>
      ) : (
        judges.map((judge, judgeIndex) => (
        <div key={judge.id} data-judge-section style={{ marginBottom: '30px' }}>
          <div style={{ 
            backgroundColor: '#f97316', 
            color: '#fff', 
            padding: '10px 16px',
            fontWeight: 'bold',
            fontSize: '15px',
            borderRadius: '6px 6px 0 0'
          }}>
            {judge.name}
          </div>
          
          {/* Female Candidates Section */}
          <div id={judgeIndex === 0 ? 'female-candidates-table' : undefined}>
            {hasDuoParticipants && (
              <div style={{ 
                backgroundColor: '#fce7f3', 
                padding: '8px 20px',
                fontWeight: '600',
                fontSize: '14px',
                color: '#ec4899'
              }}>
                Female Candidates
              </div>
            )}
            <table className="w-full border-collapse" style={{ border: '2px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '8px', border: '1px solid #ddd', width: '50px', fontSize: '13px' }}>#</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left', minWidth: '130px', fontSize: '13px' }}>Candidate</th>
                  {categories.map((category) => (
                    <th key={category.id} style={{ padding: '8px', border: '1px solid #ddd', minWidth: '100px', fontSize: '12px' }}>
                      {category.name}
                    </th>
                  ))}
                  <th style={{ padding: '8px', border: '1px solid #ddd', backgroundColor: '#dcfce7', fontWeight: 'bold', fontSize: '13px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(candidates || []).map((candidate) => {
                  const candidateTotal = categories.reduce((sum, cat) => {
                    const score = scores[judge.id]?.[candidate.id]?.[cat.id];
                    return sum + (score !== null ? parseFloat(score) : 0);
                  }, 0);
                  
                  return (
                    <tr key={candidate.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}>
                        {candidate.number}
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                        <div style={{ fontWeight: '600', fontSize: '13px' }}>{candidate.name}</div>
                        {hasDuoParticipants && (
                          <div style={{ fontSize: '10px', color: '#ec4899' }}>({candidate.gender})</div>
                        )}
                      </td>
                      {categories.map((category) => {
                        const score = scores[judge.id]?.[candidate.id]?.[category.id];
                        return (
                          <td key={category.id} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                            {score !== null ? score : '-'}
                          </td>
                        );
                      })}
                      <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#dcfce7', fontSize: '13px' }}>
                        {candidateTotal > 0 ? candidateTotal.toFixed(2) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Male Partners Section */}
          {hasDuoParticipants && (
            <div id={judgeIndex === 0 ? 'male-partners-table' : undefined} style={{ marginTop: '20px' }}>
              <div style={{ 
                backgroundColor: '#dbeafe', 
                padding: '8px 20px',
                fontWeight: '600',
                fontSize: '14px',
                color: '#3b82f6'
              }}>
                Male Partners
              </div>
              <table className="w-full border-collapse" style={{ border: '2px solid #ddd' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ padding: '8px', border: '1px solid #ddd', width: '50px', fontSize: '13px' }}>#</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left', minWidth: '130px', fontSize: '13px' }}>Partner</th>
                    {categories.map((category) => (
                      <th key={category.id} style={{ padding: '8px', border: '1px solid #ddd', minWidth: '100px', fontSize: '12px' }}>
                        {category.name}
                      </th>
                    ))}
                    <th style={{ padding: '8px', border: '1px solid #ddd', backgroundColor: '#dcfce7', fontWeight: 'bold', fontSize: '13px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(candidates || []).filter(c => c.participant_type === 'duo' && c.partner_name).map((candidate) => {
                    const partnerTotal = categories.reduce((sum, cat) => {
                      const score = partnerScores[judge.id]?.[candidate.id]?.[cat.id];
                      return sum + (score !== null ? parseFloat(score) : 0);
                    }, 0);
                    
                    return (
                      <tr key={candidate.id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}>
                          {candidate.partner_number || candidate.number}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                          <div style={{ fontWeight: '600', fontSize: '13px' }}>{candidate.partner_name}</div>
                          <div style={{ fontSize: '10px', color: '#3b82f6' }}>({candidate.partner_gender})</div>
                        </td>
                        {categories.map((category) => {
                          const score = partnerScores[judge.id]?.[candidate.id]?.[category.id];
                          return (
                            <td key={category.id} style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                              {score !== null ? score : '-'}
                            </td>
                          );
                        })}
                        <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#dcfce7', fontSize: '13px' }}>
                          {partnerTotal > 0 ? partnerTotal.toFixed(2) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        ))
      )}
    </div>
  );
}

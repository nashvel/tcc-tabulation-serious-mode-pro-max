import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { initializeEcho } from '../../../config/echo';
import { getApiBase, getCurrentEventId } from '../../../config/api';
import { useVotingWebSocket } from '../../../hooks/useVotingWebSocket';
import LiveIndicator from '../scoring/LiveIndicator';
import RoundHeader from '../scoring/RoundHeader';
import ScoreTable from '../scoring/ScoreTable';
import EmptyState from '../scoring/EmptyState';
import TableSkeleton from '../scoring/TableSkeleton';
import AdminPreloader from '../AdminPreloader';

export default function JudgesScoringTab({ candidates, continuingEvent }) {
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [scores, setScores] = useState({});
  const [partnerScores, setPartnerScores] = useState({});
  const [judges, setJudges] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeRound, setActiveRound] = useState(null);
  const [fetchedCandidates, setFetchedCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [scoresHidden, setScoresHidden] = useState(false);
  const pollingIntervalRef = useRef(null);
  const hasInitialized = useRef(false);
  
  // Check if we have duo participants
  const hasDuoParticipants = (fetchedCandidates || []).some(c => c.participant_type === 'duo' && c.partnership?.partner_name);
  
  // Use fetched candidates if available, otherwise fall back to prop
  const activeCandidates = fetchedCandidates.length > 0 ? fetchedCandidates : (candidates || []);

  // Fetch real data from backend - optimized with parallel requests
  useEffect(() => {
    // Skip if already initialized
    if (hasInitialized.current) {
      return;
    }

    const fetchData = async () => {
      try {
        const apiBase = getApiBase();
        
        // Use continuingEvent prop first, then fallback to localStorage
        let event = continuingEvent;
        
        if (!event) {
          const eventFromStorage = localStorage.getItem('continuingEvent');
          event = eventFromStorage ? JSON.parse(eventFromStorage) : null;
        }
        
        // If no event in localStorage, get from voting state
        if (!event) {
          const votingStateResponse = await fetch(`${apiBase}/api/voting/state`);
          const votingState = await votingStateResponse.json();
          
          if (votingState.event_id) {
            const eventResponse = await fetch(`${apiBase}/api/events/${votingState.event_id}`);
            event = await eventResponse.json();
          } else {
            setLoading(false);
            return;
          }
        }
        
        const eventId = event.id;
        
        // Fetch all critical data in parallel (optimized)
        const [votingStateResponse, roundsResponse, candidatesResponse, criteriaResponse, judgesResponse] = await Promise.all([
          fetch(`${apiBase}/api/voting/state?event_id=${eventId}`),
          fetch(`${apiBase}/api/rounds?event_id=${eventId}`),
          fetch(`${apiBase}/api/candidates?event_id=${eventId}`),
          fetch(`${apiBase}/api/criteria?event_id=${eventId}`),
          fetch(`${apiBase}/api/judges?event_id=${eventId}`)
        ]);
        
        // Check all responses
        if (!votingStateResponse.ok || !roundsResponse.ok || !candidatesResponse.ok || !criteriaResponse.ok) {
          throw new Error('Failed to fetch required data');
        }
        
        const votingState = await votingStateResponse.json();
        const rounds = await roundsResponse.json();
        const candidatesData = await candidatesResponse.json();
        const criteria = await criteriaResponse.json();
        
        setFetchedCandidates(candidatesData);
        setCategories(criteria);
        
        if (criteria.length > 0 && !selectedCategory) {
          setSelectedCategory(criteria[0].id);
        }
        
        // Get active round from voting state
        const currentRoundId = votingState.active_round_id;
        const currentRound = rounds.find(r => r.id === currentRoundId);
        setActiveRound(currentRound);
        
        // Process judges data
        let judgeList = [];
        if (judgesResponse.ok) {
          const judgesData = await judgesResponse.json();
          judgeList = judgesData.map(judge => ({
            id: judge.id,
            name: judge.name
          }));
        } else {
          // Fallback: create default judges if API fails
          judgeList = Array.from({ length: 5 }, (_, i) => ({
            id: i + 1,
            name: `Judge ${i + 1}`
          }));
        }
        setJudges(judgeList);
        
        // Initialize empty scores with criteria structure
        const emptyScores = {};
        judgeList.forEach(judge => {
          emptyScores[judge.id] = {};
          candidatesData.forEach(candidate => {
            emptyScores[judge.id][candidate.id] = {};
            criteria.forEach(criterion => {
              emptyScores[judge.id][candidate.id][criterion.id] = null;
            });
          });
        });
        setScores(emptyScores);
        
        // Check for duo participants in fetched data
        const hasDuo = candidatesData.some(c => c.participant_type === 'duo' && c.partnership?.partner_name);
        if (hasDuo) {
          const emptyPartnerScores = {};
          judgeList.forEach(judge => {
            emptyPartnerScores[judge.id] = {};
            candidatesData.forEach(candidate => {
              if (candidate.participant_type === 'duo' && candidate.partnership?.partner_name) {
                emptyPartnerScores[judge.id][candidate.id] = {};
                criteria.forEach(criterion => {
                  emptyPartnerScores[judge.id][candidate.id][criterion.id] = null;
                });
              }
            });
          });
          setPartnerScores(emptyPartnerScores);
        }
        
        // Mark as initialized to prevent re-fetching
        hasInitialized.current = true;
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    // Fetch data immediately without blocking UI
    setLoading(true);
    fetchData();
  }, []); // Empty dependency - only run on mount

  // WebSocket handler for real-time score updates
  const handleScoreUpdate = useCallback((data) => {
    console.log('✅ handleScoreUpdate called with:', data);
    
    // Update single score from WebSocket event
    if (data.judge_id && data.candidate_id && data.criteria_id !== undefined) {
      console.log('📝 Updating score in state:', {
        judge_id: data.judge_id,
        candidate_id: data.candidate_id,
        criteria_id: data.criteria_id,
        points: data.points
      });
      setScores(prevScores => {
        const newScores = { ...prevScores };
        if (newScores[data.judge_id] && newScores[data.judge_id][data.candidate_id]) {
          newScores[data.judge_id][data.candidate_id][data.criteria_id] = data.points;
          console.log('✅ Score updated in state');
        } else {
          console.warn('⚠️ Score structure not found for judge:', data.judge_id, 'candidate:', data.candidate_id);
        }
        return newScores;
      });
    }
  }, []);

  // Get eventId from continuingEvent in localStorage
  const eventId = useMemo(() => {
    const continuingEventStr = localStorage.getItem('continuingEvent');
    if (continuingEventStr) {
      try {
        const continuingEvent = JSON.parse(continuingEventStr);
        return continuingEvent.id;
      } catch (e) {
        console.error('Error parsing continuingEvent:', e);
      }
    }
    return 1; // Fallback to 1
  }, []);

  // Fetch scores when judges/categories/candidates change
  useEffect(() => {
    if (!hasInitialized.current || judges.length === 0 || categories.length === 0) {
      return;
    }

    const fetchScores = async () => {
      try {
        const apiBase = getApiBase();
        const response = await fetch(`${apiBase}/api/points`);
        if (response.ok) {
          const pointsData = await response.json();
          
          // Transform points data into scores structure
          const newScores = {};
          const newPartnerScores = {};
          
          judges.forEach(judge => {
            newScores[judge.id] = {};
            newPartnerScores[judge.id] = {};
            
            activeCandidates.forEach(candidate => {
              newScores[judge.id][candidate.id] = {};
              if (candidate.participant_type === 'duo' && candidate.partnership?.partner_name) {
                newPartnerScores[judge.id][candidate.id] = {};
              }
              
              categories.forEach(criterion => {
                const point = pointsData.find(p => 
                  p.judge_id === judge.id && 
                  p.candidate_id === candidate.id && 
                  p.criteria_id === criterion.id
                );
                
                newScores[judge.id][candidate.id][criterion.id] = point?.points || null;
              });
            });
          });
          
          setScores(newScores);
          setPartnerScores(newPartnerScores);
        }
      } catch (error) {
        console.error('Error fetching scores:', error);
      }
    };

    fetchScores();
  }, [judges, categories, activeCandidates]);

  // Setup WebSocket for real-time score updates (separate effect for stability)
  useEffect(() => {
    setIsLive(true);
    
    const echo = initializeEcho();
    if (echo) {
      const channelName = `scores.${eventId}`;
      console.log('📡 Attempting to connect to channel:', channelName);
      const channel = echo.channel(channelName);
      
      channel.subscribed(() => {
        console.log('✅ Successfully subscribed to channel:', channelName);
      });
      
      channel.error((error) => {
        console.error('❌ Channel subscription error:', error);
      });
      
      // Listen for ScoreUpdated event (no dot prefix for public channels)
      channel.listen('ScoreUpdated', (data) => {
        console.log('🔔 *** RECEIVED ScoreUpdated event! ***');
        console.log('🔔 Raw event data:', data);
        console.log('🔔 Judge ID:', data.judge_id);
        console.log('🔔 Candidate ID:', data.candidate_id);
        console.log('🔔 Criteria ID:', data.criteria_id);
        console.log('🔔 Points:', data.points);
        console.log('🔔 Current scores state:', scores);
        handleScoreUpdate(data);
      });
      
      console.log('✓ WebSocket listener attached to scores channel:', channelName);
      
      // Cleanup on unmount
      return () => {
        console.log('🔌 Leaving channel:', channelName);
        echo.leave(channelName);
        setIsLive(false);
      };
    }

    // Cleanup on unmount
    return () => {
      setIsLive(false);
    };
  }, [eventId, handleScoreUpdate]);

  if (loading) return <TableSkeleton />;
  if (!judges.length) return <EmptyState />;

  // Filter candidates
  const femaleCandidates = activeCandidates.filter(c => c.gender && c.gender.toLowerCase() === 'female');
  const maleCandidates = activeCandidates.filter(c => c.gender && c.gender.toLowerCase() === 'male');

  return (
    <div className="font-sans antialiased bg-slate-50/50 min-h-screen pb-20">
      {isLive && <LiveIndicator />}
      
      <div className="px-4 py-6 max-w-[1600px] mx-auto">
        {activeRound && <RoundHeader roundName={activeRound.name} />}

        {femaleCandidates.length > 0 && (
          <ScoreTable 
            title="Female Candidates"
            candidates={femaleCandidates}
            judges={judges}
            scores={scores}
            categories={categories}
            activeRound={activeRound}
            scoresHidden={scoresHidden}
            setScoresHidden={setScoresHidden}
            hasDuoParticipants={hasDuoParticipants}
            colorTheme="pink"
          />
        )}

        {maleCandidates.length > 0 && (
          <ScoreTable 
            title="Male Candidates"
            candidates={maleCandidates}
            judges={judges}
            scores={scores}
            categories={categories}
            activeRound={activeRound}
            scoresHidden={scoresHidden}
            setScoresHidden={setScoresHidden}
            hasDuoParticipants={hasDuoParticipants}
            colorTheme="blue"
          />
        )}
      </div>
    </div>
  );
}

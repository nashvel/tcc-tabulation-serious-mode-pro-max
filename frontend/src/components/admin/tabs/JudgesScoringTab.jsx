import { useState, useEffect, useRef } from 'react';
import { initializeEcho } from '../../../config/echo';
import LiveIndicator from '../scoring/LiveIndicator';
import RoundHeader from '../scoring/RoundHeader';
import ScoreTable from '../scoring/ScoreTable';
import EmptyState from '../scoring/EmptyState';
import TableSkeleton from '../scoring/TableSkeleton';
import AdminPreloader from '../AdminPreloader';

export default function JudgesScoringTab({ candidates }) {
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
  const hasDuoParticipants = (fetchedCandidates || []).some(c => c.participant_type === 'duo' && c.partner_name);
  
  // Use fetched candidates if available, otherwise fall back to prop
  const activeCandidates = fetchedCandidates.length > 0 ? fetchedCandidates : (candidates || []);

  // Fetch real data from backend - optimized with parallel requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiBase = `http://${window.location.hostname}:8000`;
        
        // Get event from localStorage (set when continuing from setup)
        const continuingEvent = localStorage.getItem('continuingEvent');
        let event = continuingEvent ? JSON.parse(continuingEvent) : null;
        
        // If no event in localStorage, get from voting state
        if (!event) {
          console.warn('No event in localStorage, fetching from voting state');
          const votingStateResponse = await fetch(`${apiBase}/api/voting/state`);
          const votingState = await votingStateResponse.json();
          
          if (votingState.event_id) {
            const eventResponse = await fetch(`${apiBase}/api/events/${votingState.event_id}`);
            event = await eventResponse.json();
          } else {
            console.error('No active event found');
            setLoading(false);
            return;
          }
        }
        
        const eventId = event.id;
        const uniqueId = event.unique_id;
        
        // Fetch voting state, event details, rounds, and candidates in parallel
        const [votingStateResponse, eventResponse, roundsResponse, candidatesResponse] = await Promise.all([
          fetch(`${apiBase}/api/voting/state?event_id=${eventId}`),
          fetch(`${apiBase}/api/events/${uniqueId}`),
          fetch(`${apiBase}/api/rounds?event_id=${eventId}`),
          fetch(`${apiBase}/api/candidates?event_id=${eventId}`)
        ]);
        
        const votingState = await votingStateResponse.json();
        const eventData = await eventResponse.json();
        const rounds = await roundsResponse.json();
        const candidatesData = await candidatesResponse.json();
        
        setFetchedCandidates(candidatesData);
        
        // Get active round from voting state
        const currentRoundId = votingState.active_round_id;
        const currentRound = rounds.find(r => r.id === currentRoundId);
        setActiveRound(currentRound);
        
        // Fetch ALL criteria for the event (not just active round)
        const criteriaResponse = await fetch(`${apiBase}/api/criteria?event_id=${eventId}`);
        const criteria = await criteriaResponse.json();
        
        setCategories(criteria);
        
        if (criteria.length > 0 && !selectedCategory) {
          setSelectedCategory(criteria[0].id);
        }
        
        // Create judge list based on number_of_judges
        const judgeList = Array.from({ length: eventData.number_of_judges || 5 }, (_, i) => ({
          id: i + 1,
          name: `Judge ${i + 1}`
        }));
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
        const hasDuo = candidatesData.some(c => c.participant_type === 'duo' && c.partner_name);
        if (hasDuo) {
          const emptyPartnerScores = {};
          judgeList.forEach(judge => {
            emptyPartnerScores[judge.id] = {};
            candidatesData.forEach(candidate => {
              if (candidate.participant_type === 'duo' && candidate.partner_name) {
                emptyPartnerScores[judge.id][candidate.id] = {};
                criteria.forEach(criterion => {
                  emptyPartnerScores[judge.id][candidate.id][criterion.id] = null;
                });
              }
            });
          });
          setPartnerScores(emptyPartnerScores);
        }
        
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

  // Real-time WebSocket score updates
  useEffect(() => {
    const fetchInitialScores = async () => {
      try {
        const apiBase = `http://${window.location.hostname}:8000`;
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
              if (candidate.participant_type === 'duo' && candidate.partner_name) {
                newPartnerScores[judge.id][candidate.id] = {};
              }
              
              categories.forEach(criterion => {
                const point = pointsData.find(p => 
                  p.judge_id === judge.id && 
                  p.candidate_id === candidate.id && 
                  p.criterion_id === criterion.id
                );
                
                newScores[judge.id][candidate.id][criterion.id] = point?.points || null;
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
      
      // Try to initialize Echo for WebSocket updates
      const echo = initializeEcho();
      if (echo) {
        // Subscribe to WebSocket channel for real-time updates
        const eventId = 1; // Make this dynamic based on your event
        const channel = echo.channel(`scores.${eventId}`);
        
        channel.listen('.score.updated', (data) => {
          console.log('Score updated via WebSocket:', data);
          
          // Update scores state with new data
          setScores(prevScores => {
            const newScores = { ...prevScores };
            if (newScores[data.judge_id] && newScores[data.judge_id][data.candidate_id]) {
              newScores[data.judge_id][data.candidate_id][data.criterion_id] = data.points;
            }
            return newScores;
          });
        });
        
        console.log('WebSocket connected to scores.' + eventId);
      } else {
        console.warn('WebSocket not available - real-time score updates disabled');
      }
    }

    // Cleanup on unmount
    return () => {
      const echo = initializeEcho();
      if (echo) {
        const eventId = 1;
        echo.leave(`scores.${eventId}`);
      }
      setIsLive(false);
    };
  }, [judges, categories, activeCandidates]);

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

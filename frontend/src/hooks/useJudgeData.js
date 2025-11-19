import { useState, useEffect } from 'react';
import { candidatesAPI, roundsAPI, criteriaAPI, pointsAPI } from '../api/services';

export default function useJudgeData() {
  const [candidates, setCandidates] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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

  const handleScoreSubmit = async (candidateId, criteriaId, judgeId, selectedRound) => {
    const key = `${candidateId}-${criteriaId}`;
    const points = scores[key];
    
    if (!points || points === '') return;

    try {
      await pointsAPI.create({
        candidate_id: candidateId,
        criteria_id: criteriaId,
        judge_id: judgeId,
        round_id: selectedRound,
        points: parseFloat(points)
      });
      console.log('Score saved:', { candidateId, criteriaId, points });
    } catch (error) {
      console.error('Error saving score:', error);
      alert('Failed to save score');
    }
  };

  return {
    candidates,
    rounds,
    criteria,
    scores,
    loading,
    handleScoreChange,
    handleScoreSubmit
  };
}

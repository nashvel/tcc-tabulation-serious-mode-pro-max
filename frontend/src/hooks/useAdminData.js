import { useState, useEffect } from 'react';
import { candidatesAPI, roundsAPI, criteriaAPI } from '../api/services';

export const useAdminData = () => {
  const [candidates, setCandidates] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    candidates,
    rounds,
    criteria,
    loading,
    loadData,
  };
};

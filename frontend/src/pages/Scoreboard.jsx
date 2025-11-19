import { useState, useEffect } from 'react';
import { pointsAPI, candidatesAPI, roundsAPI } from '../api/services';

export default function Scoreboard() {
  const [scoreboard, setScoreboard] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Female');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedRound) {
      loadScoreboard();
    }
  }, [selectedRound, selectedCategory]);

  useEffect(() => {
    let interval;
    if (autoRefresh && selectedRound) {
      interval = setInterval(() => {
        loadScoreboard();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, selectedRound, selectedCategory]);

  const loadInitialData = async () => {
    try {
      const [candidatesRes, roundsRes] = await Promise.all([
        candidatesAPI.getAll(),
        roundsAPI.getAll(),
      ]);
      setCandidates(candidatesRes.data);
      setRounds(roundsRes.data);
      if (roundsRes.data.length > 0) {
        setSelectedRound(roundsRes.data[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadScoreboard = async () => {
    try {
      const response = await pointsAPI.getScoreboard({
        round_id: selectedRound,
        category: selectedCategory
      });
      
      const scoreData = response.data.map(item => {
        const candidate = candidates.find(c => c.id === item.candidate_id);
        return {
          ...item,
          candidate
        };
      });
      
      setScoreboard(scoreData.sort((a, b) => b.total_points - a.total_points));
    } catch (error) {
      console.error('Error loading scoreboard:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-xl">Loading...</div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Logos Header - Matching Original */}
      <div className="flex justify-center items-center gap-4 mb-4">
        <img src="/assets/it.png" alt="IT" className="h-20" />
        <img src="/assets/bsit.png" alt="BSIT" className="h-20" />
        <img src="/assets/tcc_seal.png" alt="TCC Seal" className="h-20" />
        <img src="/assets/lnk-logo.png" alt="LNK Logo" className="h-20" />
        <img src="/assets/logo-3.png" alt="Logo" className="h-20" />
      </div>
      
      <div className="card">
        <h1 className="text-3xl font-bold text-primary mb-6">Live Scoreboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Round</label>
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              {rounds.map(round => (
                <option key={round.id} value={round.id}>{round.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-5 h-5 text-primary"
              />
              <span className="text-sm font-medium">Auto Refresh (5s)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Rankings</h2>
        
        {scoreboard.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No scores available yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary to-secondary text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Rank</th>
                  <th className="px-6 py-4 text-left">Number</th>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scoreboard.map((item, index) => (
                  <tr 
                    key={item.candidate_id}
                    className={`hover:bg-gray-50 ${
                      index === 0 ? 'bg-yellow-50' : 
                      index === 1 ? 'bg-gray-100' :
                      index === 2 ? 'bg-orange-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {index === 0 && <span className="text-2xl">🥇</span>}
                        {index === 1 && <span className="text-2xl">🥈</span>}
                        {index === 2 && <span className="text-2xl">🥉</span>}
                        <span className="font-bold text-lg">{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      #{item.candidate?.number}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {item.candidate?.name}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-2xl font-bold text-primary">
                        {item.total_points}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-4">
        <a
          href={`/print?round_id=${selectedRound}&category=${selectedCategory}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          🖨️ Print Results
        </a>
        <button 
          onClick={loadScoreboard}
          className="btn-primary"
        >
          🔄 Refresh Scores
        </button>
      </div>
    </div>
  );
}

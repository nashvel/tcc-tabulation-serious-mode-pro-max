import { useState, useEffect, useMemo } from 'react';

export default function ResultsTab({ candidates, continuingEvent }) {
  const [categories, setCategories] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);

  const apiBase = useMemo(() => {
    const url = new URL(window.location.href);
    return `${url.protocol}//${url.hostname}:8000`;
  }, []);

  const eventId = useMemo(() => {
    if (continuingEvent?.id) return continuingEvent.id;
    const continuingEventStr = localStorage.getItem('continuingEvent');
    if (continuingEventStr) {
      try {
        return JSON.parse(continuingEventStr).id;
      } catch (e) {
        console.error('Error parsing continuingEvent:', e);
      }
    }
    return 1;
  }, [continuingEvent]);

  // Fetch categories and scores
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await fetch(`${apiBase}/api/criteria?event_id=${eventId}`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }

        // Fetch scores
        const scoresResponse = await fetch(`${apiBase}/api/points?event_id=${eventId}`);
        if (scoresResponse.ok) {
          const scoresData = await scoresResponse.json();
          // Organize scores by candidate
          const scoresMap = {};
          scoresData.forEach(score => {
            if (!scoresMap[score.candidate_id]) {
              scoresMap[score.candidate_id] = {};
            }
            scoresMap[score.candidate_id][score.criteria_id] = score.points;
          });
          setScores(scoresMap);
        }
      } catch (error) {
        console.error('Error fetching results data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 2 seconds
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [eventId, apiBase]);

  // Calculate total scores for each candidate
  const candidatesWithTotals = useMemo(() => {
    if (!candidates || candidates.length === 0) return [];

    return candidates.map(candidate => {
      const candidateScores = scores[candidate.id] || {};
      const total = Object.values(candidateScores).reduce((sum, score) => sum + (parseFloat(score) || 0), 0);
      return { ...candidate, total, scores: candidateScores };
    }).sort((a, b) => b.total - a.total);
  }, [candidates, scores]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <table className="w-full min-w-max border-collapse">
      <thead>
        <tr className="bg-white border-b border-gray-300">
          <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 border-r border-gray-300 w-12">Rank</th>
          <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[80px]">#</th>
          <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[180px]">Candidate Name</th>
          {categories.map((category) => (
            <th key={category.id} className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 border-r border-gray-300 min-w-[120px]">
              {category.name}
            </th>
          ))}
          <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-900 min-w-[120px] bg-yellow-50">Overall Total</th>
        </tr>
      </thead>
      <tbody>
        {candidatesWithTotals.length > 0 ? (
          candidatesWithTotals.map((candidate, index) => (
            <tr key={candidate.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-2.5 text-center text-sm font-semibold border-r border-gray-200">{index + 1}.</td>
              <td className="px-4 py-2.5 text-center text-sm text-gray-900 border-r border-gray-200"><strong>{candidate.number}</strong></td>
              <td className="px-4 py-2.5 text-left text-sm text-gray-900 border-r border-gray-200">{candidate.name}</td>
              {categories.map((category) => (
                <td key={category.id} className="px-4 py-2.5 text-center border-r border-gray-200 text-sm text-gray-700">
                  {(candidate.scores[category.id] || 0).toFixed(2)}
                </td>
              ))}
              <td className="px-4 py-2.5 text-center text-sm font-bold text-gray-900 bg-yellow-50">
                {candidate.total.toFixed(2)}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={categories.length + 4} className="px-4 py-8 text-center text-sm text-gray-500">
              No results available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

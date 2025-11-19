import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { pointsAPI, candidatesAPI, roundsAPI, criteriaAPI } from '../api/services';

export default function PrintResults() {
  const [searchParams] = useSearchParams();
  const roundId = searchParams.get('round_id');
  const category = searchParams.get('category') || 'Female';
  
  const [results, setResults] = useState([]);
  const [round, setRound] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [roundId, category]);

  const loadData = async () => {
    try {
      const [roundsRes, criteriaRes, candidatesRes, scoresRes] = await Promise.all([
        roundsAPI.getAll(),
        criteriaAPI.getAll(),
        candidatesAPI.getAll(),
        pointsAPI.getAll()
      ]);

      const selectedRound = roundsRes.data.find(r => r.id == roundId);
      setRound(selectedRound);

      const roundCriteria = criteriaRes.data.filter(c => c.round_id == roundId);
      setCriteria(roundCriteria);

      // Calculate scores per candidate
      const candidates = candidatesRes.data.filter(c => c.gender === category);
      const scores = scoresRes.data.filter(p => p.round_id == roundId && p.category === category);

      const resultsData = candidates.map(candidate => {
        const candidateScores = scores.filter(s => s.candidate_id === candidate.id);
        
        const criteriaScores = roundCriteria.map(crit => {
          const critScores = candidateScores.filter(s => s.criteria_id === crit.id);
          const total = critScores.reduce((sum, s) => sum + s.points, 0);
          const judges = critScores.length;
          return {
            criteria: crit.name,
            total,
            judges,
            average: judges > 0 ? (total / judges).toFixed(2) : 0
          };
        });

        const grandTotal = criteriaScores.reduce((sum, c) => sum + parseFloat(c.average), 0);

        return {
          candidate,
          criteriaScores,
          grandTotal: grandTotal.toFixed(2)
        };
      });

      resultsData.sort((a, b) => b.grandTotal - a.grandTotal);
      setResults(resultsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Print Header with Logos - Matching Original */}
        <div className="text-center mb-8 print:mb-4">
          <div className="flex justify-center items-center gap-4 mb-4">
            <img src="/assets/bsit.png" alt="BSIT" className="h-14" />
            <img src="/assets/tcc_seal.png" alt="TCC Seal" className="h-14" />
            <img src="/assets/logo-3.png" alt="Logo" className="h-14" />
            <img src="/assets/lnk-logo.png" alt="LNK Logo" className="h-14" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{round?.name}</h2>
          <p className="text-sm text-gray-600 mb-1">
            Result as of {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} - {new Date().toLocaleTimeString('en-US')}
          </p>
          <h3 className="text-xl font-semibold">(<b>{category} Category</b>)</h3>
        </div>

        {/* Print Button (hidden when printing) */}
        <div className="mb-4 print:hidden flex justify-center">
          <button
            onClick={handlePrint}
            className="btn-primary"
          >
            🖨️ Print Results
          </button>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gradient-to-r from-primary to-secondary text-white">
                <th className="border border-gray-300 px-4 py-3">Rank</th>
                <th className="border border-gray-300 px-4 py-3">Candidate #</th>
                <th className="border border-gray-300 px-4 py-3">Name</th>
                {criteria.map(crit => (
                  <th key={crit.id} className="border border-gray-300 px-4 py-3">
                    {crit.name}<br/>
                    <span className="text-xs">({crit.points} pts)</span>
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-3 font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr 
                  key={result.candidate.id}
                  className={index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}
                >
                  <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                    {index === 0 && '🥇 '}
                    {index === 1 && '🥈 '}
                    {index === 2 && '🥉 '}
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                    {result.candidate.number}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {result.candidate.name}
                  </td>
                  {result.criteriaScores.map((score, idx) => (
                    <td key={idx} className="border border-gray-300 px-4 py-2 text-center">
                      {score.average}
                      <br/>
                      <span className="text-xs text-gray-500">
                        ({score.judges} judges)
                      </span>
                    </td>
                  ))}
                  <td className="border border-gray-300 px-4 py-2 text-center font-bold text-lg text-primary">
                    {result.grandTotal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 print:mt-4 text-center text-sm text-gray-600">
          <p>Generated by TCC Tabulation System</p>
          <p className="text-xs mt-1">This is an official tabulation result</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          table {
            page-break-inside: avoid;
          }
          tr {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

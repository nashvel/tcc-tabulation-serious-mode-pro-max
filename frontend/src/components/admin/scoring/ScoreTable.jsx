import React from 'react';
import { BarChart3, Eye, EyeOff } from 'lucide-react';

export default function ScoreTable({
  title,
  candidates,
  judges,
  scores,
  categories,
  activeRound,
  scoresHidden,
  setScoresHidden,
  hasDuoParticipants,
  colorTheme = 'pink' // 'pink' for female, 'blue' for male
}) {
  const themeColors = {
    pink: {
      title: '#E91E63',
      avgText: '#5B9FED'
    },
    blue: {
      title: '#2196F3',
      avgText: '#5B9FED'
    }
  };

  const theme = themeColors[colorTheme];

  return (
    <div className="mb-8 font-sans antialiased">
      {/* Title and Hide Button */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-base font-semibold uppercase tracking-wide"
          style={{ color: theme.title }}
        >
          {title}
        </h3>

        {/* Hide Scores Toggle Button */}
        <button
          onClick={() => setScoresHidden(!scoresHidden)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm
            ${scoresHidden
              ? 'bg-slate-800 text-white hover:bg-slate-700 ring-1 ring-slate-700'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }
          `}
        >
          {scoresHidden ? <EyeOff size={12} /> : <Eye size={12} />}
          {scoresHidden ? 'Hidden' : 'Hide'}
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '180px' }}>
                  Candidate
                </th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '150px' }}>
                  Team/Dept
                </th>
                {judges.map((judge, index) => (
                  <th key={judge.id} className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '80px' }}>
                    Judge {index + 1}
                  </th>
                ))}
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '80px' }}>
                  AVG
                </th>
                <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider" style={{ minWidth: '100px' }}>
                  Score Chart
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {candidates.map((candidate, idx) => {
                const activeCriteria = categories.filter(criterion =>
                  activeRound && criterion.round && criterion.round.id === activeRound.id
                );

                // Calculate total scores for each judge
                const judgeScores = judges.map(judge => {
                  return activeCriteria.reduce((sum, criterion) => {
                    const score = scores[judge.id]?.[candidate.id]?.[criterion.id];
                    return sum + (score !== null ? parseFloat(score) : 0);
                  }, 0);
                });

                // Calculate average
                const validScores = judgeScores.filter(score => score > 0);
                const average = validScores.length > 0
                  ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
                  : 0;

                return (
                  <tr key={candidate.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                          {candidate.number} - {candidate.name?.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600 font-medium">
                        {candidate.team || candidate.department || '-'}
                      </span>
                    </td>
                    {judges.map((judge) => {
                      const judgeTotal = activeCriteria.reduce((sum, criterion) => {
                        const score = scores[judge.id]?.[candidate.id]?.[criterion.id];
                        return sum + (score !== null ? parseFloat(score) : 0);
                      }, 0);

                      const hasScore = judgeTotal > 0;

                      return (
                        <td key={judge.id} className="py-3 px-4 text-center">
                          <span className={`
                            font-mono text-sm font-semibold 
                            ${hasScore ? 'text-gray-700' : 'text-gray-300'}
                            ${scoresHidden ? 'blur-md select-none opacity-50' : ''}
                            transition-all duration-300
                          `}>
                            {hasScore ? judgeTotal.toFixed(2) : '-'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`
                          font-mono text-sm font-bold tracking-tight
                          ${scoresHidden ? 'blur-md select-none opacity-50' : ''}
                          transition-all duration-300
                        `}
                        style={{ color: average > 0 ? theme.avgText : '#D1D5DB' }}
                      >
                        {average > 0 ? average.toFixed(2) : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center align-middle">
                      {average > 0 && (
                        <div className={`w-full max-w-[120px] mx-auto ${scoresHidden ? 'blur-md opacity-50 select-none' : ''} transition-all duration-300`}>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${Math.min(average, 100)}%`,
                                backgroundColor: theme.avgText
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

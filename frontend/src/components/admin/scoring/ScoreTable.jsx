import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

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
      bar: 'bg-pink-500',
      text: 'text-pink-500',
      bg: 'bg-pink-50',
      hover: 'hover:bg-pink-50/50'
    },
    blue: {
      bar: 'bg-blue-500',
      text: 'text-blue-500',
      bg: 'bg-blue-50',
      hover: 'hover:bg-blue-50/50'
    }
  };

  const theme = themeColors[colorTheme];

  return (
    <div className="mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className={`h-6 w-1 ${theme.bar} rounded-full`}></div>
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest">
            {title}
            {hasDuoParticipants && <span className="text-xs font-normal text-slate-500 ml-2 capitalize">(Pairs)</span>}
          </h3>
        </div>
        
        {/* Hide Scores Toggle - Premium Switch */}
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

      <div className="bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-b border-slate-700">
                <th className="py-2 px-2 text-center text-[9px] font-bold uppercase tracking-widest text-slate-400" style={{width: '40px'}}>#</th>
                <th className="py-2 px-2 text-left text-[9px] font-bold uppercase tracking-widest text-slate-400" style={{minWidth: '150px'}}>Candidate</th>
                <th className="py-2 px-2 text-left text-[9px] font-bold uppercase tracking-widest text-slate-400" style={{minWidth: '120px'}}>Team/Dept</th>
                {judges.map((judge) => (
                  <th key={judge.id} className="py-2 px-2 text-center text-[9px] font-bold uppercase tracking-widest text-emerald-400" style={{minWidth: '70px'}}>
                    {judge.name}
                  </th>
                ))}
                <th className="py-2 px-2 text-center text-[9px] font-bold uppercase tracking-widest text-white bg-slate-700 border-l border-slate-600" style={{minWidth: '60px'}}>
                  AVG
                </th>
                <th className="py-2 px-2 text-center text-[9px] font-bold uppercase tracking-widest text-cyan-400 border-l border-slate-600" style={{minWidth: '100px'}}>
                  Score Chart
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
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
                  <tr key={candidate.id} className={`${theme.hover} transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    <td className="py-2 px-2 text-center font-mono text-slate-400 font-semibold text-xs border-r border-slate-100/50">
                      {candidate.number}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-100/50">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-900 text-xs uppercase tracking-wide">{candidate.name}</span>
                        {hasDuoParticipants && (
                          <span className={`text-[8px] font-medium ${theme.text} uppercase tracking-wider`}>{candidate.gender}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2 border-r border-slate-100/50">
                      <span className="text-xs text-slate-600 font-medium">
                        {candidate.team || candidate.department || '-'}
                      </span>
                    </td>
                    {judges.map((judge, jIdx) => {
                      const judgeTotal = activeCriteria.reduce((sum, criterion) => {
                        const score = scores[judge.id]?.[candidate.id]?.[criterion.id];
                        return sum + (score !== null ? parseFloat(score) : 0);
                      }, 0);
                      
                      const hasScore = judgeTotal > 0;
                      
                      return (
                        <td key={judge.id} className={`
                          py-2 px-2 text-center border-r border-slate-100/50 relative
                          ${hasScore ? 'text-slate-900' : 'text-slate-300'}
                        `}>
                          <div className={`
                            font-mono text-xs font-semibold transition-all duration-300
                            ${scoresHidden ? 'blur-md select-none opacity-50' : ''}
                          `}>
                            {hasScore ? judgeTotal.toFixed(2) : '-'}
                          </div>
                        </td>
                      );
                    })}
                    <td className={`
                      py-2.5 px-3 text-center bg-slate-50/50 font-bold border-l border-slate-200/50
                      ${average > 0 ? 'text-slate-900' : 'text-slate-300'}
                    `}>
                      <div className={`
                        font-mono text-sm font-bold tracking-tight transition-all duration-300
                        ${scoresHidden ? 'blur-md select-none opacity-50' : ''}
                      `}>
                        {average > 0 ? average.toFixed(2) : '-'}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center border-l border-slate-200/50">
                      {average > 0 && (
                        <div className="flex items-center justify-center gap-1">
                          {judgeScores.map((score, idx) => (
                            <div
                              key={idx}
                              className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-sm transition-all duration-300 hover:from-emerald-600 hover:to-emerald-500"
                              style={{
                                height: `${Math.max(4, (score / Math.max(...judgeScores, 1)) * 20)}px`,
                                width: '6px',
                                opacity: scoresHidden ? 0.3 : 0.8
                              }}
                              title={`Judge ${idx + 1}: ${score.toFixed(2)}`}
                            />
                          ))}
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

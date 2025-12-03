import React from 'react';
import { BarChart3, Eye, EyeOff } from 'lucide-react';
import { showSuccess } from '../../../utils/alerts';

// ===== NACHTIFY STARTS HERE =====
// Nachtify: Custom color palette library for interactive table coloring
import { applyColumnColor, getColumnColor as getNachtifyColumnColor } from 'nachtify';
// ===== NACHTIFY ENDS HERE =====

import { useContextMenu, useCategorySubmenu, useLockState, useColorPalette } from './hooks';
import { ContextMenuContent } from './components';

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
  colorTheme = 'pink',
  candidateColors = {},
  getGroupColor = () => 'transparent',
  getColumnColor = () => 'transparent',
  eventId = 1,
  eventSequence = [],
  currentSequenceIndex = 0,
  onNext
}) {
  // Use custom hooks for state management
  const { contextMenu, contextMenuRef, closeContextMenu, handleRowContextMenu } = useContextMenu();
  const { colorScrollIndex, setColorScrollIndex, scoreColors, setScoreColors } = useColorPalette();
  const { isLocked, handleLockToggle } = useLockState(eventId);
  const {
    categorySubmenu,
    setCategorySubmenu,
    selectedCategoryIndex,
    isSwitchingCategory,
    handleCategoryHover,
    handleSwitchCategory
  } = useCategorySubmenu(eventId, eventSequence, activeRound);

  // Copy candidate info
  const handleCopyCandidate = () => {
    if (contextMenu.row) {
      navigator.clipboard.writeText(`#${contextMenu.row.number} - ${contextMenu.row.name}`);
      showSuccess('Copied to clipboard!', { duration: 1500 });
    }
    closeContextMenu();
  };

  // Handle lock toggle and close menu
  const handleLockToggleWithClose = async () => {
    await handleLockToggle();
    closeContextMenu();
  };
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

                const genderBg = getGroupColor(candidateColors, `gender-${candidate.gender}`);
                const nameBg = getColumnColor(candidateColors, candidate.id, 'name', 'transparent');

                return (
                  <tr 
                    key={candidate.id} 
                    data-has-context-menu="true"
                    className="group hover:bg-gray-50/50 transition-colors cursor-context-menu"
                    style={{ backgroundColor: genderBg }}
                    onContextMenu={(e) => handleRowContextMenu(e, candidate, 'row')}
                    title="Right-click for options"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span 
                          className="font-semibold text-gray-900 text-sm uppercase tracking-wide"
                          style={{ backgroundColor: nameBg, padding: nameBg !== 'transparent' ? '4px 8px' : '0', borderRadius: nameBg !== 'transparent' ? '4px' : '0' }}
                        >
                          {candidate.number} - {candidate.name?.toUpperCase()}
                        </span>
                        {/* Right-click hint - appears on hover */}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-gray-400 flex items-center gap-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                            <line x1="12" y1="18" x2="12" y2="18"/>
                          </svg>
                          <span>right-click</span>
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

      {/* ===== NACHTIFY COLOR PALETTE CONTEXT MENU =====
          Right-click on any candidate row to open the color palette
          - Lock/Unlock: Controls judge screen locking
          - Switch Category: Shows submenu with available categories
          - Copy Candidate: Copies candidate info to clipboard
          - Color Palette: Apply colors to highlight rows
          Colors are persisted to localStorage automatically
      ===== END NACHTIFY MENU ===== */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          data-context-menu="true"
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <ContextMenuContent
            isLocked={isLocked}
            onLockToggle={handleLockToggleWithClose}
            colorScrollIndex={colorScrollIndex}
            onColorScrollChange={setColorScrollIndex}
            scoreColors={scoreColors}
            onColorSelect={(color) => {
              setScoreColors(prev => applyColumnColor(prev, contextMenu.row?.id, contextMenu.column, color));
              closeContextMenu();
            }}
            contextMenu={contextMenu}
            categorySubmenu={categorySubmenu}
            selectedCategoryIndex={selectedCategoryIndex}
            isSwitchingCategory={isSwitchingCategory}
            eventSequence={eventSequence}
            onCategoryHover={handleCategoryHover}
            onCategoryLeave={() => setCategorySubmenu({ visible: false, x: 0, y: 0, position: 'right' })}
            onSwitchCategory={handleSwitchCategory}
            onCopyCandidate={handleCopyCandidate}
          />
        </div>
      )}
    </div>
  );
}

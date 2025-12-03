import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Eye, EyeOff, Lock, Unlock, SkipForward, Copy, Edit3 } from 'lucide-react';
import { showSuccess, showError } from '../../../utils/alerts';
import { getApiBase } from '../../../config/api';
import { useVotingWebSocket } from '../../../hooks/useVotingWebSocket';

// ===== NACHTIFY STARTS HERE =====
// Nachtify: Custom color palette library for interactive table coloring
import {
  ColorPaletteContextMenu,
  loadColors,
  saveColors,
  applyColumnColor,
  getColumnColor as getNachtifyColumnColor
} from 'nachtify';
// ===== NACHTIFY ENDS HERE =====

// API helper for voting state
const votingAPI = {
  getState: async (eventId) => {
    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/api/voting/state?event_id=${eventId || 1}`);
    if (!response.ok) throw new Error('Failed to fetch voting state');
    return { data: await response.json() };
  },
  lock: async (eventId) => {
    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/api/voting/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId || 1 })
    });
    if (!response.ok) throw new Error('Failed to lock');
    return { data: await response.json() };
  },
  unlock: async (eventId) => {
    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/api/voting/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId || 1 })
    });
    if (!response.ok) throw new Error('Failed to unlock');
    return { data: await response.json() };
  }
};

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
  colorTheme = 'pink', // 'pink' for female, 'blue' for male
  candidateColors = {},
  getGroupColor = () => 'transparent',
  getColumnColor = () => 'transparent',
  // Control props for menu functionality
  eventId = 1,
  eventSequence = [],
  currentSequenceIndex = 0,
  onNext
}) {
  // ===== NACHTIFY STATE & HANDLERS =====
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, row: null, column: null });
  const [colorScrollIndex, setColorScrollIndex] = useState(0);
  const [scoreColors, setScoreColors] = useState(() => loadColors());
  const [isLocked, setIsLocked] = useState(false);

  // WebSocket handler for real-time updates
  const handleVotingStateChange = useCallback((data) => {
    console.log('ScoreTable: WebSocket update received:', data);
    const votingState = data.voting_state || data;
    if (typeof votingState.is_locked !== 'undefined') {
      setIsLocked(votingState.is_locked);
    }
  }, []);

  // Setup WebSocket connection
  useVotingWebSocket(eventId, handleVotingStateChange);

  // Load lock state on mount
  useEffect(() => {
    const loadLockState = async () => {
      try {
        const response = await votingAPI.getState(eventId);
        if (response.data) {
          setIsLocked(response.data.is_locked ?? false);
        }
      } catch (error) {
        console.error('Error loading lock state:', error);
      }
    };
    loadLockState();
  }, [eventId]);

  // Save colors to localStorage whenever they change
  useEffect(() => {
    saveColors(scoreColors);
  }, [scoreColors]);

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    if (contextMenu.visible) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu.visible]);

  const handleRowContextMenu = (e, candidate, column) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      row: candidate,
      column
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, row: null, column: null });
  };

  // Lock/Unlock handler
  const handleLockToggle = async () => {
    try {
      if (isLocked) {
        await votingAPI.unlock(eventId);
        setIsLocked(false);
        showSuccess('Screen Unlocked!', { duration: 2000 });
      } else {
        await votingAPI.lock(eventId);
        setIsLocked(true);
        showSuccess('Screen Locked!', { duration: 2000 });
      }
    } catch (error) {
      console.error('Error toggling lock:', error);
      showError('Failed to toggle lock');
    }
    closeContextMenu();
  };

  // Next category handler
  const handleNextCategory = () => {
    if (onNext) {
      onNext();
      showSuccess('Moving to next category...', { duration: 1500 });
    }
    closeContextMenu();
  };

  // Copy candidate info
  const handleCopyCandidate = () => {
    if (contextMenu.row) {
      navigator.clipboard.writeText(`#${contextMenu.row.number} - ${contextMenu.row.name}`);
      showSuccess('Copied to clipboard!', { duration: 1500 });
    }
    closeContextMenu();
  };

  // Menu items for context menu
  const menuItems = [
    {
      icon: isLocked ? <Unlock size={16} /> : <Lock size={16} />,
      label: isLocked ? 'Unlock Judges' : 'Lock Judges',
      onClick: handleLockToggle,
      hasBorder: true
    },
    {
      icon: <SkipForward size={16} />,
      label: 'Next Category',
      onClick: handleNextCategory,
      hasBorder: true
    },
    {
      icon: <Copy size={16} />,
      label: 'Copy Candidate',
      onClick: handleCopyCandidate,
      hasBorder: false
    }
  ];
  // ===== NACHTIFY STATE & HANDLERS END =====
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
          - Next Category: Moves to next scoring category
          - Copy Candidate: Copies candidate info to clipboard
          - Color Palette: Apply colors to highlight rows
          Colors are persisted to localStorage automatically
      ===== END NACHTIFY MENU ===== */}
      <ColorPaletteContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        colorScrollIndex={colorScrollIndex}
        onColorScrollChange={setColorScrollIndex}
        onColorSelect={(color) => {
          setScoreColors(prev => applyColumnColor(prev, contextMenu.row?.id, contextMenu.column, color));
          closeContextMenu();
        }}
        onClose={closeContextMenu}
        menuItems={menuItems}
      />
    </div>
  );
}

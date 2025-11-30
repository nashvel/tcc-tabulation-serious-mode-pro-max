import { useState, useEffect } from 'react';
import { showSuccess, showError } from '../../utils/alerts';
import NextCategorySubmenu from './NextCategorySubmenu';
import ClearJudgesSubmenu from './ClearJudgesSubmenu';
import { ClipboardList, Lock, Unlock, Activity } from 'lucide-react';
import { getApiBase } from '../../config/api';

// API helper for voting state
const votingAPI = {
  getState: async (params) => {
    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/api/voting/state?event_id=${params.event_id || 1}`);
    if (!response.ok) throw new Error('Failed to fetch voting state');
    return { data: await response.json() };
  },
  lock: async (params) => {
    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/api/voting/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: params.event_id || 1 })
    });
    if (!response.ok) throw new Error('Failed to lock');
    return { data: await response.json() };
  },
  unlock: async (params) => {
    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/api/voting/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: params.event_id || 1 })
    });
    if (!response.ok) throw new Error('Failed to unlock');
    return { data: await response.json() };
  }
};

export default function ControlButtons({
  eventId,
  isVotingActive,
  eventSequence,
  currentSequenceIndex,
  onStartStop,
  onNext,
  onOpenEventDetails
}) {
  const [isLocked, setIsLocked] = useState(false);

  // Load lock state on mount and refresh every 2 seconds
  useEffect(() => {
    loadLockState();
  }, []);

  // Testing function to mark round as completed
  const handleTestMarkCompleted = async () => {
    // ... existing code ...
  };

  const loadLockState = async () => {
    try {
      const response = await votingAPI.getState({ event_id: eventId || 1 });
      if (response.data) {
        setIsLocked(response.data.is_locked ?? false);
      }
    } catch (error) {
      console.error('Error loading lock state:', error);
    }
  };

  const handleLockToggle = async () => {
    try {
      if (isLocked) {
        await votingAPI.unlock({ event_id: eventId || 1 });
        setIsLocked(false);
        showSuccess('Screen Unlocked!', { duration: 2000 });
      } else {
        await votingAPI.lock({ event_id: eventId || 1 });
        setIsLocked(true);
        showSuccess('Screen Locked!', { duration: 2000 });
      }
    } catch (error) {
      console.error('Error toggling lock:', error);
      showError('Failed to toggle lock');
    }
  };

  const handleClearJudges = async () => {
    // This function might be redundant if ClearJudgesSubmenu handles it, 
    // but keeping it for compatibility if passed as prop
    // For now, we'll just log or leave empty as logic is in Submenu
  };

  const pillButtonClass = "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wide transition-all duration-200 active:scale-95 group";

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Details Button - Blue */}
      <button
        onClick={onOpenEventDetails}
        className={`${pillButtonClass} bg-theme-primary text-theme-text hover:bg-theme-hover border border-theme-border`}
        title="View Event Details"
      >
        <div className="bg-white rounded-full p-1">
          <ClipboardList size={14} className="text-theme-primary" />
        </div>
        <span>Details</span>
      </button>

      {/* Lock/Unlock Button - Amber */}
      <button
        onClick={handleLockToggle}
        className={`${pillButtonClass} ${isLocked
          ? 'bg-amber-500 text-white hover:bg-amber-600'
          : 'bg-blue-400 text-white hover:bg-blue-500'
          }`}
      >
        <div className="bg-white rounded-full p-1">
          {isLocked ? (
            <Lock size={14} className="text-amber-500" />
          ) : (
            <Unlock size={14} className="text-blue-400" />
          )}
        </div>
        <span>{isLocked ? 'Unlock' : 'Lock'}</span>
      </button>

      {/* Clear Judges Button with Submenu - Red */}
      <ClearJudgesSubmenu
        eventId={eventId}
        onClear={handleClearJudges}
      />

      {/* Status Indicator - Slate */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 font-bold text-[10px] uppercase tracking-wide border border-slate-200">
        <div className="flex items-center gap-1">
          <Activity size={12} />
          <span>Status:</span>
          <span className={`font-bold ${isVotingActive ? 'text-emerald-600' : 'text-slate-600'}`}>
            {isVotingActive ? 'Live' : 'Idle'}
          </span>
        </div>
      </div>

      {/* Next Button with Submenu */}
      <NextCategorySubmenu
        eventSequence={eventSequence}
        currentSequenceIndex={currentSequenceIndex}
        onNext={onNext}
        isVotingActive={isVotingActive}
      />
    </div>
  );
}

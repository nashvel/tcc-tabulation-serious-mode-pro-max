import { useState, useEffect } from 'react';
import { votingAPI } from '../../api/services';
import toast from 'react-hot-toast';
import NextCategorySubmenu from './NextCategorySubmenu';
import ClearJudgesSubmenu from './ClearJudgesSubmenu';
import { ClipboardList, Lock, Unlock, Activity } from 'lucide-react';

export default function ControlButtons({ 
  eventId,
  isVotingActive, 
  eventSequence, 
  currentSequenceIndex,
  onStartStop, 
  onNext 
}) {
  const [isLocked, setIsLocked] = useState(false);
   
  // Load lock state on mount
  useEffect(() => {
    loadLockState();
  }, []);

  // Testing function to mark round as completed
  const handleTestMarkCompleted = async () => {
    // ... existing code ...
  };
  
  const loadLockState = async () => {
    try {
      const response = await votingAPI.getState({ event_id: 1 });
      if (response.data && response.data.is_locked) {
        setIsLocked(true);
      }
    } catch (error) {
      console.error('Error loading lock state:', error);
    }
  };
  
  const handleLockToggle = async () => {
    try {
      if (isLocked) {
        await votingAPI.unlock({ event_id: 1 });
        setIsLocked(false);
        toast.success('Screen Unlocked!', { duration: 2000 });
      } else {
        await votingAPI.lock({ event_id: 1 });
        setIsLocked(true);
        toast.success('Screen Locked!', { duration: 2000 });
      }
    } catch (error) {
      console.error('Error toggling lock:', error);
      toast.error('Failed to toggle lock');
    }
  };

  const handleClearJudges = async () => {
    if (!confirm('Are you sure you want to clear all occupied judges? This will allow judges to be selected again.')) {
      return;
    }

    try {
      const apiUrl = `http://${window.location.hostname}:8000/api/clear-occupied-judges`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId || 1 })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('All judge selections cleared!', { duration: 2000 });
      } else {
        toast.error('Failed to clear judges');
      }
    } catch (error) {
      console.error('Error clearing judges:', error);
      toast.error('Error clearing judges');
    }
  };

  const pillButtonClass = "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wide transition-all duration-200 active:scale-95 group";

  return (
    <div className="w-full px-6 mb-6">
      {/* Colorful Pill Buttons Container */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 flex flex-wrap items-center justify-center gap-2">
        
        {/* Details Button - Blue */}
        <button
          onClick={() => window.location.href = `/admin/events/${eventId || 'active'}/details`}
          className={`${pillButtonClass} bg-blue-500 text-white hover:bg-blue-600`}
          title="View Event Details"
        >
          <div className="bg-white rounded-full p-1">
            <ClipboardList size={14} className="text-blue-500" />
          </div>
          <span>Details</span>
        </button>

        {/* Lock/Unlock Button - Amber */}
        <button
          onClick={handleLockToggle}
          className={`${pillButtonClass} ${
            isLocked 
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
    </div>
  );
}

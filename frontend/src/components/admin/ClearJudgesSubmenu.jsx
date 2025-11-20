import React, { useState } from 'react';
import { UserX, AlertCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClearJudgesSubmenu({ eventId, onClear }) {
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clearOption, setClearOption] = useState('judges'); // 'judges' or 'scores'

  const handleClear = async () => {
    setIsLoading(true);
    try {
      const apiBase = `http://${window.location.hostname}:8000`;
      let apiUrl, requestBody;

      if (clearOption === 'judges') {
        // Clear only judge assignments
        apiUrl = `${apiBase}/api/clear-occupied-judges`;
        requestBody = { event_id: eventId || 1 };
      } else if (clearOption === 'scores') {
        // Clear all scores and event sequence (keep candidates, judges, etc)
        apiUrl = `${apiBase}/api/clear-event-scores`;
        requestBody = { event_id: eventId || 1 };
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const message = clearOption === 'judges' 
          ? 'All judge selections cleared!' 
          : 'All scores and event sequence cleared!';
        toast.success(message, { duration: 2000 });
        if (onClear) await onClear();
      } else {
        toast.error(data.message || 'Failed to clear');
      }
    } catch (error) {
      console.error('Error clearing:', error);
      toast.error('Error clearing data');
    } finally {
      setIsLoading(false);
      setIsHovering(false);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Clear Button */}
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wide transition-all text-white bg-red-500 hover:bg-red-600"
        title="Clear all current judge sessions"
      >
        <div className="bg-white rounded-full p-1">
          <UserX size={14} className="text-red-500" />
        </div>
        <span>Clear</span>
      </button>

      {/* Submenu - WordPress Style */}
      {isHovering && (
        <div
          className="absolute left-full top-0 ml-0 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200 z-50 min-w-[260px] animate-in fade-in slide-in-from-left-2 duration-200"
          style={{
            animation: 'slideIn 0.2s ease-out'
          }}
        >
          {/* Arrow pointing left - connected */}
          <div 
            className="absolute -left-2 w-0 h-0 border-t-5 border-b-5 border-r-5 border-t-transparent border-b-transparent border-r-white"
            style={{
              top: '12px'
            }}
          ></div>

          {/* Content */}
          <div className="p-4">

            {/* Clear Options */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Select Clear Option
              </p>
              <div className="space-y-2">
                {/* Option 1: Clear Judges */}
                <label className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="clearOption"
                    value="judges"
                    checked={clearOption === 'judges'}
                    onChange={() => setClearOption('judges')}
                    className="w-4 h-4 cursor-pointer accent-slate-900 mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-700">Clear Judge Assignments</p>
                    <p className="text-xs text-slate-500 mt-0.5">Reset judge selections only. Candidates and scores remain.</p>
                  </div>
                </label>

                {/* Option 2: Clear Scores - Disabled */}
                <label className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 cursor-not-allowed opacity-50">
                  <input
                    type="radio"
                    name="clearOption"
                    value="scores"
                    disabled
                    className="w-4 h-4 cursor-not-allowed accent-slate-900 mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500">Clear All Scores & Sequence</p>
                    <p className="text-xs text-slate-400 mt-0.5">Coming soon - Clear all scores and event sequence.</p>
                  </div>
                </label>
              </div>
            </div>


            {/* Clear Button */}
            <button
              onClick={handleClear}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition-all ${
                isLoading
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-red-500 text-white border border-red-600 hover:bg-red-600'
              }`}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Clearing...
                </>
              ) : (
                <>
                  <UserX size={14} />
                  Clear All Judges
                </>
              )}
            </button>
          </div>

          <style>{`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateX(-8px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

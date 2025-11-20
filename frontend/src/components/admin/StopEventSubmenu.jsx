import React, { useState } from 'react';
import { StopCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StopEventSubmenu({ isVotingActive, onStop }) {
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStop = async () => {
    setIsLoading(true);
    try {
      const apiBase = `http://${window.location.hostname}:8000`;
      
      // Get event ID from voting state
      let eventId = 1;
      try {
        const votingStateResponse = await fetch(`${apiBase}/api/voting/state`);
        const votingState = await votingStateResponse.json();
        eventId = votingState.event_id || 1;
      } catch (err) {
        console.warn('Could not get event ID from voting state, using default:', err);
      }

      const response = await fetch(`${apiBase}/api/voting/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Event Marked as Completed!', { duration: 2000 });
        if (onStop) await onStop();
      } else {
        toast.error(data.message || 'Failed to stop event');
      }
    } catch (error) {
      console.error('Error stopping event:', error);
      toast.error('Error stopping event');
    } finally {
      setIsLoading(false);
      setIsHovering(false);
    }
  };

  if (!isVotingActive) {
    // Show disabled button when voting is not active
    return (
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wide transition-all text-white bg-slate-300 cursor-not-allowed"
        disabled
      >
        <div className="bg-white rounded-full p-1">
          <StopCircle size={14} className="text-slate-300" />
        </div>
        <span>Stop</span>
      </button>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Stop Button */}
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wide transition-all text-white bg-red-500 hover:bg-red-600"
      >
        <div className="bg-white rounded-full p-1">
          <StopCircle size={14} className="text-red-500" />
        </div>
        <span>Stop</span>
      </button>

      {/* Submenu - WordPress Style */}
      {isHovering && (
        <div
          className="absolute left-full top-0 ml-0 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200 z-50 min-w-[280px] animate-in fade-in slide-in-from-left-2 duration-200"
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
            {/* Info Icon and Title */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 mt-0.5">
                <AlertTriangle size={16} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Mark Event as Completed
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  This will mark the event as completed. All scoring data is preserved.
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
              <AlertTriangle size={14} className="text-orange-700 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700 font-medium">
                Data is preserved for WebSocket real-time updates and manual review.
              </p>
            </div>


            {/* Stop Button */}
            <button
              onClick={handleStop}
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
                  Stopping...
                </>
              ) : (
                <>
                  <StopCircle size={14} />
                  Stop Event
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

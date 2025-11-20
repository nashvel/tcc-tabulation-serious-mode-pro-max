import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NextCategorySubmenu({
  eventSequence,
  currentSequenceIndex,
  onNext,
  isVotingActive
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

  // Allow switching anytime - no voting requirement
  const isDisabled = eventSequence.length === 0;
  const remainingCategories = eventSequence;
  const nextCategory = eventSequence[0];

  const handleProceedNext = async () => {
    if (isDisabled) return;
    
    const selectedCategory = eventSequence[selectedCategoryIndex];
    if (!selectedCategory) return;
    
    setIsLoading(true);
    try {
      // Get active event ID from voting state
      const apiBase = `http://${window.location.hostname}:8000`;
      
      let eventId = 1;
      try {
        const votingStateResponse = await fetch(`${apiBase}/api/voting/state`);
        const votingState = await votingStateResponse.json();
        eventId = votingState.event_id || 1;
      } catch (err) {
        console.warn('Could not get event ID from voting state, using default:', err);
      }

      // Switch to the selected category
      const response = await fetch(`${apiBase}/api/voting/activate-round`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          round_id: selectedCategory.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Switched to: ${selectedCategory.name}`, { duration: 2000 });
        if (onNext) await onNext();
      } else {
        toast.error(data.message || 'Failed to switch category');
      }
    } catch (error) {
      console.error('Error switching category:', error);
      toast.error('Failed to switch category');
    } finally {
      setIsLoading(false);
      setIsHovering(false);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => !isDisabled && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Next Button */}
      <button
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wide transition-all duration-200 text-white ${
          isDisabled
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
            : 'bg-emerald-500 hover:bg-emerald-600'
        }`}
        disabled={isDisabled}
      >
        <div className="bg-white rounded-full p-1">
          <ChevronRight size={14} className={isDisabled ? 'text-slate-300' : 'text-emerald-500'} />
        </div>
        <span>Next</span>
      </button>

      {/* Submenu - WordPress Style */}
      {isHovering && !isDisabled && nextCategory && (
        <div
          className="absolute left-full top-0 ml-0 bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200 z-50 min-w-[240px] animate-in fade-in slide-in-from-left-2 duration-200"
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
            {/* Current Info */}
            {currentSequenceIndex >= 0 && eventSequence[currentSequenceIndex] && (
              <div className="mb-4 pb-3 border-b border-slate-200">
                <p className="text-xs text-slate-600 font-semibold mb-1">Currently On:</p>
                <p className="text-xs text-slate-700 font-medium">
                  {eventSequence[currentSequenceIndex].name}
                </p>
              </div>
            )}

            {/* Category Selection */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Switch to Category
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {remainingCategories.map((category, idx) => {
                  const absoluteIndex = currentSequenceIndex + 1 + idx;
                  return (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={absoluteIndex}
                        checked={selectedCategoryIndex === absoluteIndex}
                        onChange={() => setSelectedCategoryIndex(absoluteIndex)}
                        className="w-4 h-4 cursor-pointer accent-slate-900"
                      />
                      <span className="text-xs font-medium text-slate-700">
                        {category.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Proceed Button */}
            <button
              onClick={handleProceedNext}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition-all ${
                isLoading
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white border border-slate-900 hover:bg-slate-800'
              }`}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Processing...
                </>
              ) : (
                <>
                  <ChevronRight size={14} />
                  Switch Category
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

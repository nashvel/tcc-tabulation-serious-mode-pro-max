import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, PlayCircle, BarChart3 } from 'lucide-react';
import EventSequenceManager from './EventSequenceManager';
import CriteriaChart from './CriteriaChart';

export default function EventSequenceSidebar({
  availableCategories,
  eventSequence,
  currentSequenceIndex,
  onAddToSequence,
  onRemoveFromSequence,
  onMoveUp,
  onMoveDown,
  isVotingActive,
  onStartEvent,
  shouldOpen = false
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Open sidebar when shouldOpen prop changes to true
  useEffect(() => {
    if (shouldOpen) {
      setIsOpen(true);
    }
  }, [shouldOpen]);
  
  // Handle keyboard shortcuts for < > keys
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Check for < or , key (shift+comma)
      if ((e.shiftKey && e.key === '<') || e.key === ',') {
        e.preventDefault();
        setIsOpen(false);
      } 
      // Check for > or . key (shift+period)
      else if ((e.shiftKey && e.key === '>') || e.key === '.') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 w-[550px] h-screen bg-white shadow-2xl transition-all duration-300 ease-in-out z-50 overflow-y-auto border-l border-slate-100 scrollbar-hide
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header Section */}
        <div className="grid grid-cols-2 gap-0 sticky top-0 z-10 bg-white border-b border-slate-100">
          {/* Minimal Accent Line */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-slate-900"></div>
          
          {/* Event Sequence Header */}
          <div className="bg-white text-slate-900 px-4 py-3 border-r border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">Event Sequence</h3>
          </div>
          
          {/* Criteria Overview Header */}
          <div className="bg-white text-slate-900 px-4 py-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">Criteria Overview</h3>
          </div>
        </div>

        {/* Content Section - Two Columns */}
        <div className="grid grid-cols-2 gap-0 pb-24">
          {/* Left Column - Event Sequence Manager */}
          <div className="border-r border-slate-200">
            <div className="p-5 space-y-4">
              <EventSequenceManager
                availableCategories={availableCategories}
                eventSequence={eventSequence}
                currentSequenceIndex={currentSequenceIndex}
                onAddToSequence={onAddToSequence}
                onRemoveFromSequence={onRemoveFromSequence}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                isVotingActive={isVotingActive}
              />
            </div>
          </div>
          
          {/* Right Column - Criteria Chart */}
          <div>
            <div className="p-5">
              <CriteriaChart key={isOpen ? 'open' : 'closed'} categories={availableCategories} />
            </div>
          </div>
        </div>
        
        {/* Confirm & Start Button - Spans Both Columns */}
        {!isVotingActive && eventSequence.length > 0 && (
          <div className="fixed bottom-0 right-0 w-[550px] p-4 border-t border-slate-200 bg-gradient-to-t from-white to-slate-50 shadow-lg">
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold uppercase tracking-widest rounded-lg shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 text-sm"
            >
              <PlayCircle size={18} />
              Start Event
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[2000] animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-md w-11/12 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 mb-4 shadow-md">
                <PlayCircle size={40} className="text-emerald-600" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 text-center mb-2 uppercase tracking-widest">
              Start Event?
            </h3>
            <p className="text-sm text-slate-600 text-center mb-8 leading-relaxed">
              You have <span className="font-bold text-emerald-600">{eventSequence.length}</span> round{eventSequence.length !== 1 ? 's' : ''} in the sequence. Once started, judges can begin scoring.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 bg-white text-slate-700 border-2 border-slate-300 rounded-lg font-semibold uppercase tracking-wide text-sm hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  onStartEvent();
                  setIsOpen(false); // Close sidebar after starting
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-bold uppercase tracking-widest text-sm hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button - Minimal Elegant Design */}
      <button
        onClick={handleToggle}
        title="Use < > keys or click to toggle"
        className={`
          fixed top-1/2 -translate-y-1/2 w-12 h-20 bg-white hover:bg-slate-50 text-slate-900 rounded-full shadow-lg transition-all duration-300 z-[1001] flex items-center justify-center border border-slate-200 hover:border-slate-300 active:scale-95
          ${isOpen ? 'right-[550px]' : 'right-0'}
        `}
      >
        {isOpen ? (
          <ChevronRight size={24} className="text-slate-900" />
        ) : (
          <ChevronLeft size={24} className="text-slate-900" />
        )}
      </button>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out cubic-bezier(0.34, 1.56, 0.64, 1); }
        
        /* Hide scrollbar while keeping scroll functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }
      `}</style>
    </>
  );
}

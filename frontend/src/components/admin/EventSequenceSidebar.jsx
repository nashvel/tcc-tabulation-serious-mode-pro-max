import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Lock, Unlock, Shuffle } from 'lucide-react';
import CriteriaChart from './CriteriaChart';
import { showSuccess, showError } from '../../utils/alerts';
import { getApiBase } from '../../config/api';

export default function EventSequenceSidebar({
  availableCategories,
  judges = [],
  shouldOpen = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [judgesList, setJudgesList] = useState(judges);
  const [isLoading, setIsLoading] = useState({});
  const [swapDropdown, setSwapDropdown] = useState(null); // Track which judge's swap dropdown is open

  // Open sidebar when shouldOpen prop changes to true
  useEffect(() => {
    if (shouldOpen) {
      setIsOpen(true);
    }
  }, [shouldOpen]);

  // Update judges list when props change
  useEffect(() => {
    setJudgesList(judges);
  }, [judges]);

  // Handle lock/unlock judge
  const handleLockUnlock = async (judgeId, currentStatus) => {
    setIsLoading(prev => ({ ...prev, [judgeId]: true }));
    try {
      const apiBase = getApiBase();
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      const response = await fetch(`${apiBase}/api/judges/${judgeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setJudgesList(prev =>
          prev.map(j => j.id === judgeId ? { ...j, status: newStatus } : j)
        );
        showSuccess(newStatus === 'active' ? 'Judge unlocked' : 'Judge locked', { duration: 2000 });
      } else {
        showError('Failed to update judge status');
      }
    } catch (error) {
      console.error('Error updating judge:', error);
      showError('Error updating judge');
    } finally {
      setIsLoading(prev => ({ ...prev, [judgeId]: false }));
    }
  };

  // Handle swap judges
  const handleSwapJudges = (judgeId, targetJudgeId) => {
    const judge1 = judgesList.find(j => j.id === judgeId);
    const judge2 = judgesList.find(j => j.id === targetJudgeId);

    if (!judge1 || !judge2) return;

    // Swap chair numbers in state
    const updatedList = judgesList.map(j => {
      if (j.id === judgeId) return { ...j, chair_number: judge2.chair_number };
      if (j.id === targetJudgeId) return { ...j, chair_number: judge1.chair_number };
      return j;
    });

    setJudgesList(updatedList);

    // Update localStorage with swapped chair numbers
    localStorage.setItem(`judge_${judgeId}_chair`, judge2.chair_number);
    localStorage.setItem(`judge_${targetJudgeId}_chair`, judge1.chair_number);

    showSuccess(`Swapped ${judge1.name} ↔ ${judge2.name}`, { duration: 2000 });
    setSwapDropdown(null);
  };

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
        {/* Header Section - Two Columns */}
        <div className="grid grid-cols-2 gap-0 sticky top-0 z-10 bg-white border-b border-slate-100">
          {/* Minimal Accent Line */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-slate-900"></div>

          {/* Judge Control Header */}
          <div className="bg-white text-slate-900 px-4 py-3 border-r border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">Judge Control</h3>
          </div>

          {/* Criteria Overview Header */}
          <div className="bg-white text-slate-900 px-4 py-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">Criteria Overview</h3>
          </div>
        </div>

        {/* Content Section - Two Columns */}
        <div className="grid grid-cols-2 gap-0 pb-24">
          {/* Left Column - Judge Control */}
          <div className="border-r border-slate-200">
            <div className="p-5 space-y-2">
              {judgesList.length > 0 ? (
                judgesList.map((judge) => (
                  <div key={judge.id} className="relative">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{judge.name}</p>
                        <p className="text-xs text-slate-500">Chair #{judge.chair_number}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0 ml-2">
                        {/* Swap Button */}
                        <div className="relative">
                          <button
                            onClick={() => setSwapDropdown(swapDropdown === judge.id ? null : judge.id)}
                            className="p-1.5 rounded-lg transition-colors bg-blue-100 text-blue-600 hover:bg-blue-200"
                            title="Swap judge"
                          >
                            <Shuffle size={14} />
                          </button>

                          {/* Swap Dropdown */}
                          {swapDropdown === judge.id && (
                            <div className="absolute top-full mt-1 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-max">
                              <p className="px-3 py-2 text-xs font-semibold text-slate-600 border-b border-slate-200">Swap with:</p>
                              {judgesList
                                .filter(j => j.id !== judge.id)
                                .map(otherJudge => (
                                  <button
                                    key={otherJudge.id}
                                    onClick={() => handleSwapJudges(judge.id, otherJudge.id)}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 transition-colors"
                                  >
                                    <span className="font-semibold">{otherJudge.name}</span>
                                    <span className="text-slate-500"> (Chair #{otherJudge.chair_number})</span>
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>

                        {/* Lock Button */}
                        <button
                          onClick={() => handleLockUnlock(judge.id, judge.status)}
                          disabled={isLoading[judge.id]}
                          className={`p-1.5 rounded-lg transition-colors ${judge.status === 'active'
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={judge.status === 'active' ? 'Lock judge' : 'Unlock judge'}
                        >
                          {judge.status === 'active' ? (
                            <Unlock size={14} />
                          ) : (
                            <Lock size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No judges available</p>
              )}
            </div>
          </div>

          {/* Right Column - Criteria Chart */}
          <div>
            <div className="p-5">
              <CriteriaChart key={isOpen ? 'open' : 'closed'} categories={availableCategories} />
            </div>
          </div>
        </div>
      </div>


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

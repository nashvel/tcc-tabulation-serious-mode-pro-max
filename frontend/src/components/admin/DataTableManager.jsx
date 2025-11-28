import { useState, useEffect } from 'react';
import JudgesScoringTab from './tabs/JudgesScoringTab';
import VotingControlTab from './tabs/VotingControlTab';
import CandidatesTab from './tabs/CandidatesTab';
import CategoriesTab from './tabs/CategoriesTab';
import ResultsTab from './tabs/ResultsTab';
import BestInTab from './tabs/BestInTab';
import { Gavel, Users, List, BarChart2, Trophy } from 'lucide-react';

export default function DataTableManager({
  candidates,
  rounds,
  criteria,
  continuingEvent,
  onJudgesLoaded,
  // Control Props
  isVotingActive,
  eventSequence,
  currentSequenceIndex,
  onStartStop,
  onNext,
  // Navigation Props
  activeTab: externalActiveTab,
  onTabChange
}) {
  const [internalActiveTab, setInternalActiveTab] = useState('judges');
  const [judges, setJudges] = useState([]);

  // Use external active tab if provided, otherwise use internal state
  const activeTab = externalActiveTab || internalActiveTab;

  const handleTabChange = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  useEffect(() => {
    const fetchJudges = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const eventId = continuingEvent?.id;

        if (!eventId) return;

        const response = await fetch(`${apiBase}/api/judges?event_id=${eventId}`);
        if (response.ok) {
          const data = await response.json();
          setJudges(data);
          // Notify parent component about judges
          if (onJudgesLoaded) {
            onJudgesLoaded(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch judges:', error);
      }
    };

    fetchJudges();
  }, [continuingEvent, onJudgesLoaded]);

  return (
    <div className="bg-white overflow-hidden mt-8">
      {/* Tabs - Clean Design */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => handleTabChange('judges')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200
            ${activeTab === 'judges'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <Gavel size={16} />
          Judges Scoring
        </button>
        <button
          onClick={() => handleTabChange('candidates')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200
            ${activeTab === 'candidates'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <Users size={16} />
          Candidates
        </button>
        <button
          onClick={() => handleTabChange('categories')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200
            ${activeTab === 'categories'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <List size={16} />
          Categories
        </button>
        <button
          onClick={() => handleTabChange('results')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200
            ${activeTab === 'results'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <BarChart2 size={16} />
          Results
        </button>
        <button
          onClick={() => handleTabChange('bestin')}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200
            ${activeTab === 'bestin'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <Trophy size={16} />
          Best In
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {activeTab === 'judges' && (
          <JudgesScoringTab
            candidates={candidates}
            continuingEvent={continuingEvent}
            // Control Props
            isVotingActive={isVotingActive}
            eventSequence={eventSequence}
            currentSequenceIndex={currentSequenceIndex}
            onStartStop={onStartStop}
            onNext={onNext}
          />
        )}
        {activeTab === 'candidates' && <CandidatesTab candidates={candidates} />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'results' && <ResultsTab candidates={candidates} />}
        {activeTab === 'bestin' && <BestInTab candidates={candidates} />}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import JudgesScoringTab from './tabs/JudgesScoringTab';
import VotingControlTab from './tabs/VotingControlTab';
import CandidatesTab from './tabs/CandidatesTab';
import CategoriesTab from './tabs/CategoriesTab';
import ResultsTab from './tabs/ResultsTab';
import BestInTab from './tabs/BestInTab';
import { Gavel, Users, List, BarChart2, Trophy } from 'lucide-react';

export default function DataTableManager({ candidates, rounds, criteria, continuingEvent, onJudgesLoaded, isVotingActive = false }) {
  const [activeTab, setActiveTab] = useState('judges');
  const [judges, setJudges] = useState([]);

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

  const tabColors = {
    judges: { bg: 'bg-emerald-500', icon: 'text-emerald-500' },
    candidates: { bg: 'bg-purple-500', icon: 'text-purple-500' },
    categories: { bg: 'bg-orange-500', icon: 'text-orange-500' },
    results: { bg: 'bg-pink-500', icon: 'text-pink-500' },
    bestin: { bg: 'bg-indigo-500', icon: 'text-indigo-500' }
  };

  const tabButtonClass = "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wide transition-all duration-200 text-white";

  return (
    <div className="bg-white border border-slate-200 overflow-hidden mt-8 rounded-lg shadow-lg">
      {/* Tabs */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setActiveTab('judges')}
          className={`${tabButtonClass} ${activeTab === 'judges' ? tabColors.judges.bg : 'bg-slate-400'} hover:opacity-90`}
        > 
          <div className="bg-white rounded-full p-1">
            <Gavel size={12} className={tabColors.judges.icon} />
          </div>
          Judges Scoring
        </button>
        <button
          onClick={() => setActiveTab('candidates')}
          className={`${tabButtonClass} ${activeTab === 'candidates' ? tabColors.candidates.bg : 'bg-slate-400'} hover:opacity-90`}
        >
          <div className="bg-white rounded-full p-1">
            <Users size={12} className={tabColors.candidates.icon} />
          </div>
          Candidates
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`${tabButtonClass} ${activeTab === 'categories' ? tabColors.categories.bg : 'bg-slate-400'} hover:opacity-90`}
        >
          <div className="bg-white rounded-full p-1">
            <List size={12} className={tabColors.categories.icon} />
          </div>
          Categories
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`${tabButtonClass} ${activeTab === 'results' ? tabColors.results.bg : 'bg-slate-400'} hover:opacity-90`}
        >
          <div className="bg-white rounded-full p-1">
            <BarChart2 size={12} className={tabColors.results.icon} />
          </div>
          Results
        </button>
        <button
          onClick={() => setActiveTab('bestin')}
          className={`${tabButtonClass} ${activeTab === 'bestin' ? tabColors.bestin.bg : 'bg-slate-400'} hover:opacity-90`}
        >
          <div className="bg-white rounded-full p-1">
            <Trophy size={12} className={tabColors.bestin.icon} />
          </div>
          Best In
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {activeTab === 'judges' && <JudgesScoringTab candidates={candidates} continuingEvent={continuingEvent} />}
        {activeTab === 'candidates' && <CandidatesTab candidates={candidates} />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'results' && <ResultsTab candidates={candidates} />}
        {activeTab === 'bestin' && <BestInTab candidates={candidates} />}
      </div>
    </div>
  );
}

import { useState } from 'react';
import JudgesScoringTab from './tabs/JudgesScoringTab';
import VotingControlTab from './tabs/VotingControlTab';
import CandidatesTab from './tabs/CandidatesTab';
import CategoriesTab from './tabs/CategoriesTab';
import ResultsTab from './tabs/ResultsTab';
import BestInTab from './tabs/BestInTab';

export default function DataTableManager({ candidates, rounds, criteria }) {
  const [activeTab, setActiveTab] = useState('judges');

  return (
    <div className="bg-white border border-gray-300 overflow-hidden mt-8">
      {/* Tabs */}
      <div className="border-b border-gray-300 bg-gray-50">
        <div className="flex gap-0">
          <button
            onClick={() => setActiveTab('judges')}
            className={`px-6 py-4 text-base font-medium transition-all flex items-center gap-2 ${
              activeTab === 'judges'
                ? 'bg-white text-gray-900 border-b-2 border-orange-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="material-icons" style={{ fontSize: '20px' }}>gavel</span>
            Judges Scoring
          </button>
          <button
            onClick={() => setActiveTab('voting')}
            className={`px-6 py-4 text-base font-medium transition-all flex items-center gap-2 ${
              activeTab === 'voting'
                ? 'bg-white text-gray-900 border-b-2 border-orange-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="material-icons" style={{ fontSize: '20px' }}>how_to_vote</span>
            Voting Control
          </button>
          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-6 py-4 text-base font-medium transition-all flex items-center gap-2 ${
              activeTab === 'candidates'
                ? 'bg-white text-gray-900 border-b-2 border-orange-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="material-icons" style={{ fontSize: '20px' }}>people</span>
            Candidates
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-4 text-base font-medium transition-all flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-white text-gray-900 border-b-2 border-orange-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="material-icons" style={{ fontSize: '20px' }}>list</span>
            Categories
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-6 py-4 text-base font-medium transition-all flex items-center gap-2 ${
              activeTab === 'results'
                ? 'bg-white text-gray-900 border-b-2 border-orange-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="material-icons" style={{ fontSize: '20px' }}>bar_chart</span>
            Results
          </button>
          <button
            onClick={() => setActiveTab('bestin')}
            className={`px-6 py-4 text-base font-medium transition-all flex items-center gap-2 ${
              activeTab === 'bestin'
                ? 'bg-white text-gray-900 border-b-2 border-orange-500'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span className="material-icons" style={{ fontSize: '20px' }}>emoji_events</span>
            Best In
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {activeTab === 'judges' && <JudgesScoringTab candidates={candidates} />}
        {activeTab === 'voting' && <VotingControlTab candidates={candidates} />}
        {activeTab === 'candidates' && <CandidatesTab candidates={candidates} />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'results' && <ResultsTab candidates={candidates} />}
        {activeTab === 'bestin' && <BestInTab candidates={candidates} />}
      </div>
    </div>
  );
}

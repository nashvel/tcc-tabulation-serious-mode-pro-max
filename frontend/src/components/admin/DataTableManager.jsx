import { useState, useEffect, useMemo } from 'react';
import { getApiBase } from '../../config/api';
import JudgesScoringTab from './tabs/JudgesScoringTab';
import VotingControlTab from './tabs/VotingControlTab';
import CandidatesTab from './tabs/CandidatesTab';
import CategoriesTab from './tabs/CategoriesTab';
import ResultsTab from './tabs/ResultsTab';
import BestInTab from './tabs/BestInTab';
import { Gavel, Users, List, BarChart2, Trophy, ExternalLink } from 'lucide-react';
import { ColorPaletteContextMenu } from 'nachtify';

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
  onOpenEventDetails,
  // Navigation Props
  activeTab: externalActiveTab,
  onTabChange
}) {
  const [internalActiveTab, setInternalActiveTab] = useState('judges');
  const [judges, setJudges] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, tab: null });

  // Get activeTab from URL parameter on mount and sync state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get('activeTab');
    if (urlTab) {
      setInternalActiveTab(urlTab);
    }
  }, []);

  // Use external active tab if provided, otherwise use internal state
  const activeTab = externalActiveTab || internalActiveTab;

  const handleTabChange = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  const handleTabContextMenu = (e, tab) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      tab
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, tab: null });
  };

  const handleOpenInNewTab = () => {
    if (contextMenu.tab) {
      const currentUrl = window.location.href;
      const newUrl = currentUrl.includes('?') 
        ? `${currentUrl}&activeTab=${contextMenu.tab}`
        : `${currentUrl}?activeTab=${contextMenu.tab}`;
      window.open(newUrl, '_blank');
    }
    closeContextMenu();
  };

  const menuItems = [
    {
      icon: <ExternalLink size={16} />,
      label: 'Open in New Tab',
      onClick: handleOpenInNewTab,
      hasBorder: true
    }
  ];

  useEffect(() => {
    const fetchJudges = async () => {
      try {
        const apiBase = getApiBase();
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

  // Check if opened from new tab (has activeTab in URL)
  const isIndependentTab = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return !!params.get('activeTab');
  }, []);

  // If independent tab, show only that tab without tab buttons
  if (isIndependentTab) {
    return (
      <div className="bg-white overflow-hidden mt-8">
        {/* Single Tab Content - Full Width */}
        <div className="overflow-x-auto">
          {activeTab === 'judges' && (
            <JudgesScoringTab
              candidates={candidates}
              continuingEvent={continuingEvent}
              isVotingActive={isVotingActive}
              eventSequence={eventSequence}
              currentSequenceIndex={currentSequenceIndex}
              onStartStop={onStartStop}
              onNext={onNext}
              onOpenEventDetails={onOpenEventDetails}
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

  return (
    <div className="bg-white overflow-hidden mt-8">
      {/* Tabs - Clean Design */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => handleTabChange('judges')}
          onContextMenu={(e) => handleTabContextMenu(e, 'judges')}
          title="Right-click to open in new tab"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 cursor-context-menu
            ${activeTab === 'judges'
              ? 'bg-theme-primary text-theme-text shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <Gavel size={16} />
          Judges Scoring
        </button>
        <button
          onClick={() => handleTabChange('candidates')}
          onContextMenu={(e) => handleTabContextMenu(e, 'candidates')}
          title="Right-click to open in new tab"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 cursor-context-menu
            ${activeTab === 'candidates'
              ? 'bg-theme-primary text-theme-text shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <Users size={16} />
          Candidates
        </button>
        <button
          onClick={() => handleTabChange('categories')}
          onContextMenu={(e) => handleTabContextMenu(e, 'categories')}
          title="Right-click to open in new tab"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 cursor-context-menu
            ${activeTab === 'categories'
              ? 'bg-theme-primary text-theme-text shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <List size={16} />
          Categories
        </button>
        <button
          onClick={() => handleTabChange('results')}
          onContextMenu={(e) => handleTabContextMenu(e, 'results')}
          title="Right-click to open in new tab"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 cursor-context-menu
            ${activeTab === 'results'
              ? 'bg-theme-primary text-theme-text shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <BarChart2 size={16} />
          Results
        </button>
        <button
          onClick={() => handleTabChange('bestin')}
          onContextMenu={(e) => handleTabContextMenu(e, 'bestin')}
          title="Right-click to open in new tab"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 cursor-context-menu
            ${activeTab === 'bestin'
              ? 'bg-theme-primary text-theme-text shadow-sm'
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
            onOpenEventDetails={onOpenEventDetails}
          />
        )}
        {activeTab === 'candidates' && <CandidatesTab candidates={candidates} />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'results' && <ResultsTab candidates={candidates} />}
        {activeTab === 'bestin' && <BestInTab candidates={candidates} />}
      </div>

      {/* Nachtify Context Menu for Tab Opening */}
      <ColorPaletteContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        colorScrollIndex={0}
        onColorScrollChange={() => {}}
        onColorSelect={() => {}}
        onClose={closeContextMenu}
        menuItems={menuItems}
      />
    </div>
  );
}

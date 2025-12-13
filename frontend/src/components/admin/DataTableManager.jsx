import { useState, useEffect, useMemo, useRef } from 'react';
import { getApiBase } from '../../config/api';
import JudgesScoringTab from './tabs/JudgesScoringTab';
import VotingControlTab from './tabs/VotingControlTab';
import CandidatesTab from './tabs/CandidatesTab';
import CategoriesTab from './tabs/CategoriesTab';
import ResultsTab from './tabs/ResultsTab';
import BestInTab from './tabs/BestInTab';
import { Gavel, Users, List, BarChart2, Trophy, ExternalLink } from 'lucide-react';
import { ColorPaletteContextMenu } from 'nachtify';

// PodiumLedger Footer with scroll-triggered animation
function PodiumLedgerFooter() {
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(false);
          // Reset and trigger animation
          setTimeout(() => {
            setAnimationKey(prev => prev + 1);
            setIsVisible(true);
          }, 50);
        }
      },
      { threshold: 0.3 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={footerRef} className="mt-16 pb-8">
      <div className="text-center select-none">
        <h1 className="text-[11vw] text-gray-900 leading-none inline-flex items-end" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600, letterSpacing: '-0.02em' }}>
          <span>PodiumLed</span>
          <span className="inline-flex items-end" key={animationKey}>
            <span className={isVisible ? 'rise-up' : ''} style={{ animationDelay: '0ms', display: 'inline-block' }}>g</span>
            <span className={isVisible ? 'rise-up' : ''} style={{ animationDelay: '100ms', display: 'inline-block' }}>e</span>
            <span className={`${isVisible ? 'rise-up' : ''} text-[1.1em]`} style={{ animationDelay: '200ms', display: 'inline-block' }}>r</span>
          </span>
        </h1>
      </div>
      <style>{`
        @keyframes rise-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-0.15em); }
        }
        .rise-up {
          animation: rise-up 0.5s ease-out forwards;
        }
      `}</style>
    </footer>
  );
}

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
    
    // Close all other context menus first
    window.dispatchEvent(new CustomEvent('closeAllContextMenus'));
    
    setTimeout(() => {
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        tab
      });
    }, 0);
  };

  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, tab: null });
  };

  // Listen for global close event
  useEffect(() => {
    const handleCloseAllMenus = () => closeContextMenu();
    window.addEventListener('closeAllContextMenus', handleCloseAllMenus);
    return () => window.removeEventListener('closeAllContextMenus', handleCloseAllMenus);
  }, []);

  // Close context menu when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = () => closeContextMenu();
    const handleScroll = () => closeContextMenu();
    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [contextMenu.visible]);

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
          data-has-context-menu="true"
          onClick={() => handleTabChange('judges')}
          onContextMenu={(e) => handleTabContextMenu(e, 'judges')}
          title="Right-click to open in new tab"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200
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
          data-has-context-menu="true"
          onClick={() => handleTabChange('candidates')}
          onContextMenu={(e) => handleTabContextMenu(e, 'candidates')}
          title="Right-click to open in new tab"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200
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
          data-has-context-menu="true"
          onClick={() => handleTabChange('categories')}
          onContextMenu={(e) => handleTabContextMenu(e, 'categories')}
          title="Right-click to open in new tab"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200
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
          data-has-context-menu="true"
          onClick={() => handleTabChange('results')}
          onContextMenu={(e) => handleTabContextMenu(e, 'results')}
          title="Right-click to open in new tab"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200
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
          data-has-context-menu="true"
          onClick={() => handleTabChange('bestin')}
          onContextMenu={(e) => handleTabContextMenu(e, 'bestin')}
          title="Right-click to open in new tab"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200
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

      {/* PodiumLedger Footer */}
      <PodiumLedgerFooter />
    </div>
  );
}

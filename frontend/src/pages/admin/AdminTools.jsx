import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { showSuccess, showError } from '../../utils/alerts';
import AdminSidebar from '../../components/admin/AdminSidebar';
import FixedHeader from '../../components/admin/FixedHeader';
import EventSequenceSidebar from '../../components/admin/EventSequenceSidebar';
import DataTableManager from '../../components/admin/DataTableManager';
import StopEventModal from '../../components/admin/StopEventModal';
import AdminPreloader from '../../components/admin/AdminPreloader';
import { useAdminData } from '../../hooks/useAdminData';
import { useVotingControl } from '../../hooks/useVotingControl';
import { useEventSequence } from '../../hooks/useEventSequence';
import { useVotingWebSocket } from '../../hooks/useVotingWebSocket';

import ConfigureJudgesModal from '../../components/admin/modals/ConfigureJudgesModal';
import EventDetailsModal from '../../components/admin/modals/EventDetailsModal';
import ThemePreferencesModal from '../../components/admin/modals/ThemePreferencesModal';
import GeneralSettingsModal from '../../components/admin/modals/GeneralSettingsModal';

export default function AdminTools() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const continuingEventFromState = location.state?.continuingEvent;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isJudgesModalOpen, setIsJudgesModalOpen] = useState(false);
  const [isEventDetailsModalOpen, setIsEventDetailsModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [realtimeCategory, setRealtimeCategory] = useState(null);
  const [continuingEvent, setContinuingEvent] = useState(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [activeTab, setActiveTab] = useState('judges');

  const handleSidebarNavigation = (tabOrPath) => {
    if (tabOrPath === 'judges-modal') {
      setIsJudgesModalOpen(true);
      // Don't close sidebar when opening modal
    } else if (tabOrPath === 'event-details-modal') {
      setIsEventDetailsModalOpen(true);
      // Don't close sidebar when opening modal
    } else if (tabOrPath === 'theme-modal') {
      setIsThemeModalOpen(true);
      // Don't close sidebar when opening modal
    } else if (tabOrPath === 'settings-modal') {
      setIsSettingsModalOpen(true);
      // Don't close sidebar when opening modal
    } else if (tabOrPath.startsWith('/')) {
      navigate(tabOrPath);
      setIsSidebarOpen(false);
    } else {
      setActiveTab(tabOrPath);
      setIsSidebarOpen(false);
    }
  };

  // Simple auth check - just verify localStorage
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const pin = localStorage.getItem('adminPin');

    if (!token || !pin) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  // Fetch event based on priority: URL param > location.state > localStorage
  useEffect(() => {
    const fetchEventByTitle = async (title) => {
      try {
        const response = await fetch(`http://localhost:8000/api/events?title=${encodeURIComponent(title)}`);
        if (!response.ok) {
          throw new Error('Event not found');
        }
        const events = await response.json();

        if (events.length === 0) {
          showError(`Event "${title}" not found`, { duration: 3000 });
          return null;
        }

        return events[0]; // Return the first matching event
      } catch (error) {
        console.error('Error fetching event by title:', error);
        showError('Failed to load event from URL parameter', { duration: 3000 });
        return null;
      }
    };

    const initializeEvent = async () => {
      const eventTitleFromUrl = searchParams.get('event_title');

      let eventToUse = null;

      // Priority 1: URL parameter
      if (eventTitleFromUrl) {
        eventToUse = await fetchEventByTitle(eventTitleFromUrl);
      }

      // Priority 2: location.state
      if (!eventToUse && continuingEventFromState) {
        eventToUse = continuingEventFromState;
      }

      // Priority 3: localStorage
      if (!eventToUse) {
        const eventFromStorage = localStorage.getItem('continuingEvent');
        if (eventFromStorage) {
          try {
            eventToUse = JSON.parse(eventFromStorage);
          } catch (e) {
            console.error('Error parsing continuingEvent from localStorage:', e);
          }
        }
      }

      // Store in localStorage for consistency
      if (eventToUse) {
        localStorage.setItem('continuingEvent', JSON.stringify(eventToUse));
      }

      setContinuingEvent(eventToUse);
      setIsLoadingEvent(false);
    };

    initializeEvent();
  }, [searchParams, continuingEventFromState]);

  // Keyboard shortcut: Press 'E' to toggle sidebar, Escape to close
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Check if 'E' key is pressed (case insensitive)
      if (event.key === 'e' || event.key === 'E') {
        // Don't trigger if user is typing in an input field
        if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
          setIsSidebarOpen(prev => !prev);
        }
      }
      // Check if 'Escape' key is pressed to close sidebar
      if (event.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSidebarOpen]);


  // Custom hooks
  const { candidates, rounds, criteria, loading } = useAdminData(continuingEvent?.id);

  const {
    isVotingActive,
    showCategoryGrid,
    activeCategory,
    isCategoryGridCollapsed,
    setIsCategoryGridCollapsed,
    showStartStopModal,
    setShowStartStopModal,
    handleStartStopClick,
    handleStartStopConfirm,
    handleCategorySelect,
  } = useVotingControl(continuingEvent);

  const [showStopModal, setShowStopModal] = useState(false);
  const [judges, setJudges] = useState([]);

  const handleStartStopButtonClick = () => {
    if (isVotingActive) {
      // Show stop confirmation modal
      setShowStopModal(true);
    } else {
      // Show event sequence sidebar for starting
      setShowStartStopModal(true);
      // Reset after a brief moment to allow effect to trigger
      setTimeout(() => setShowStartStopModal(false), 100);
    }
  };

  const handleStopConfirm = async () => {
    await handleStartStopConfirm();
    setShowStopModal(false);
  };

  const handleStartEventWithFirstRound = async () => {
    try {
      console.log('=== Starting Event with First Round ===');
      console.log('Event sequence:', eventSequence);

      if (eventSequence.length === 0) {
        showError('Please add rounds to the sequence first!', { duration: 3000 });
        return;
      }

      // Step 1: Start the event
      console.log('Step 1: Starting event...');
      await handleStartStopConfirm();
      console.log('Event started successfully');

      // Step 2: Activate the first round in the sequence
      const firstRound = eventSequence[0];
      console.log('Step 2: Activating first round:', firstRound);

      await handleCategorySelect(firstRound);
      console.log('First round activated successfully');

      // Step 3: Show success message
      showSuccess(`${firstRound.name} is now active!`, { duration: 4000 });

      console.log('=== Event Started Successfully ===');
    } catch (error) {
      console.error('=== Error Starting Event ===');
      console.error('Error details:', error);
      console.error('Error response:', error.response?.data);

      showError('Failed to start event: ' + (error.response?.data?.error || error.message), { duration: 5000 });
    }
  };

  const {
    eventSequence,
    currentSequenceIndex,
    availableCategories,
    handleAddToSequence,
    handleRemoveFromSequence,
    handleMoveSequenceUp,
    handleMoveSequenceDown,
    handleNextCategory,
  } = useEventSequence(continuingEvent, handleCategorySelect);

  // WebSocket for real-time sync - update active category when voting state changes
  useVotingWebSocket(continuingEvent?.id || 1, (data) => {
    console.log('Admin received WebSocket update:', data);

    // Update active category from WebSocket event
    if (data.voting_state?.active_round) {
      const activeRound = data.voting_state.active_round;
      const updatedCategory = {
        id: activeRound.id,
        name: activeRound.name,
        spot: activeRound.spot
      };
      console.log('Real-time category update:', updatedCategory);
      setRealtimeCategory(updatedCategory);
    }
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', position: 'relative' }}>


      {(loading || isLoadingEvent) ? (
        <AdminPreloader />
      ) : (
        <>

          {/* Admin Sidebar */}
          <AdminSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onNavigate={handleSidebarNavigation}
            continuingEvent={continuingEvent}
          />

          <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-0">
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {/* Fixed Header */}
              <FixedHeader
                onEditClick={() => setIsSidebarOpen(true)}
                activeCategory={realtimeCategory || activeCategory}
                continuingEvent={continuingEvent}
                judges={Array.from({ length: 5 }, (_, i) => ({ id: i + 1, name: `Judge ${i + 1}` }))}
              />

              {/* Main Content */}
              <div style={{ paddingTop: '0', paddingBottom: '40px' }}>
                {/* Data Table Manager - Full Width */}
                <div style={{ margin: '0 20px' }}>
                  <DataTableManager
                    candidates={candidates}
                    rounds={rounds}
                    criteria={criteria}
                    continuingEvent={continuingEvent}
                    onJudgesLoaded={setJudges}
                    isVotingActive={isVotingActive}
                    // Control Props
                    eventId={continuingEvent?.unique_id || continuingEvent?.id}
                    eventSequence={eventSequence}
                    currentSequenceIndex={currentSequenceIndex}
                    onStartStop={handleStartStopButtonClick}
                    onNext={handleNextCategory}
                    onOpenEventDetails={() => setIsEventDetailsModalOpen(true)}
                    // Navigation Props
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Event Sequence Sidebar - Fixed Right */}
          <EventSequenceSidebar
            availableCategories={availableCategories}
            judges={judges}
            shouldOpen={showStartStopModal}
          />

          {/* Stop Event Modal */}
          <StopEventModal
            isOpen={showStopModal}
            onClose={() => setShowStopModal(false)}
            onConfirm={handleStopConfirm}
          />

          {/* Configure Judges Modal */}
          <ConfigureJudgesModal
            isOpen={isJudgesModalOpen}
            onClose={() => setIsJudgesModalOpen(false)}
            eventId={continuingEvent?.id}
          />

          {/* Event Details Modal */}
          <EventDetailsModal
            isOpen={isEventDetailsModalOpen}
            onClose={() => setIsEventDetailsModalOpen(false)}
            eventId={continuingEvent?.id}
          />

          {/* Theme Preferences Modal */}
          <ThemePreferencesModal
            isOpen={isThemeModalOpen}
            onClose={() => setIsThemeModalOpen(false)}
          />

          {/* General Settings Modal */}
          <GeneralSettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}

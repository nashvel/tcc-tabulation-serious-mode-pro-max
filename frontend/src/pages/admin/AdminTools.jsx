import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminSidebar from '../../components/admin/AdminSidebar';
import FixedHeader from '../../components/admin/FixedHeader';
import ControlButtons from '../../components/admin/ControlButtons';
import EventSequenceSidebar from '../../components/admin/EventSequenceSidebar';
import DataTableManager from '../../components/admin/DataTableManager';
import StopEventModal from '../../components/admin/StopEventModal';
import AdminPreloader from '../../components/admin/AdminPreloader';
import { useAdminData } from '../../hooks/useAdminData';
import { useVotingControl } from '../../hooks/useVotingControl';
import { useEventSequence } from '../../hooks/useEventSequence';
import { useVotingWebSocket } from '../../hooks/useVotingWebSocket';

export default function AdminTools() {
  const location = useLocation();
  const navigate = useNavigate();
  const continuingEventFromState = location.state?.continuingEvent;
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Simple auth check - just verify localStorage
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const pin = localStorage.getItem('adminPin');
    
    if (!token || !pin) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);
  
  // Show toast notification when continuing an event
  useEffect(() => {
    // Get event from state or localStorage
    const eventFromStorage = localStorage.getItem('continuingEvent');
    const continuingEvent = continuingEventFromState || (eventFromStorage ? JSON.parse(eventFromStorage) : null);
    
    if (continuingEvent) {
      const nextDayNumber = continuingEvent.days ? Math.max(...continuingEvent.days.map(d => d.day_number)) + 1 : 2;
      
      // Dismiss any existing toast with this ID first
      toast.dismiss('continuing-event');
      
      // Small delay to ensure dismiss completes
      setTimeout(() => {
        // Simulate loading with promise
        const loadingPromise = new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              title: continuingEvent.title,
              day: nextDayNumber
            });
          }, 1000);
        });
        
        toast.promise(
          loadingPromise,
          {
            pending: 'Loading event...',
            success: {
              render({ data }) {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>
                      Continuing Event: {data.title}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      Adding Day {data.day}
                    </div>
                  </div>
                );
              }
            },
            error: 'Failed to load event'
          },
          {
            position: 'top-right',
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            toastId: 'continuing-event'
          }
        );
      }, 100);
    }
  }, [continuingEventFromState]);
  
  // Get continuing event from state or localStorage for hooks
  const eventFromStorage = localStorage.getItem('continuingEvent');
  const continuingEvent = continuingEventFromState || (eventFromStorage ? JSON.parse(eventFromStorage) : null);
  
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
        toast.error('Please add rounds to the sequence first!', {
          position: 'top-right',
          autoClose: 3000,
        });
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
      toast.success(`🎯 ${firstRound.name} is now active!`, {
        position: 'top-right',
        autoClose: 4000,
      });
      
      console.log('=== Event Started Successfully ===');
    } catch (error) {
      console.error('=== Error Starting Event ===');
      console.error('Error details:', error);
      console.error('Error response:', error.response?.data);
      
      toast.error('Failed to start event: ' + (error.response?.data?.error || error.message), { 
        position: 'top-right',
        autoClose: 5000,
      });
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

  // WebSocket for real-time sync (optional for admin, but useful for multi-admin scenarios)
  useVotingWebSocket(continuingEvent?.id || 1, (data) => {
    console.log('Admin received WebSocket update:', data);
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', position: 'relative' }}>
      {/* Toast Container - Always render */}
      <ToastContainer />
      
      {loading ? (
        <AdminPreloader />
      ) : (
        <>
      
      {/* Admin Sidebar */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Fixed Header */}
      <FixedHeader
        onEditClick={() => setIsSidebarOpen(true)}
        activeCategory={activeCategory}
        continuingEvent={continuingEvent}
        judges={Array.from({ length: 5 }, (_, i) => ({ id: i + 1, name: `Judge ${i + 1}` }))}
      />
      
      {/* Main Content */}
      <div style={{ paddingTop: '20px', paddingBottom: '40px' }}>
        {/* Control Buttons */}
        <ControlButtons
          eventId={continuingEvent?.unique_id || continuingEvent?.id}
          isVotingActive={isVotingActive}
          eventSequence={eventSequence}
          currentSequenceIndex={currentSequenceIndex}
          onStartStop={handleStartStopButtonClick}
          onNext={handleNextCategory}
        />
        
        {/* Data Table Manager - Full Width */}
        <div style={{ margin: '40px 20px' }}>
          <DataTableManager 
            candidates={candidates}
            rounds={rounds}
            criteria={criteria}
          />
        </div>
      </div>
      
      {/* Event Sequence Sidebar - Fixed Right */}
      <EventSequenceSidebar
        availableCategories={availableCategories}
        eventSequence={eventSequence}
        currentSequenceIndex={currentSequenceIndex}
        onAddToSequence={handleAddToSequence}
        onRemoveFromSequence={handleRemoveFromSequence}
        onMoveUp={handleMoveSequenceUp}
        onMoveDown={handleMoveSequenceDown}
        isVotingActive={isVotingActive}
        onStartEvent={handleStartEventWithFirstRound}
        shouldOpen={showStartStopModal}
      />

      {/* Stop Event Modal */}
      <StopEventModal
        isOpen={showStopModal}
        onClose={() => setShowStopModal(false)}
        onConfirm={handleStopConfirm}
      />
      </>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminSidebar from '../../components/admin/AdminSidebar';
import FixedHeader from '../../components/admin/FixedHeader';
import ControlButtons from '../../components/admin/ControlButtons';
import EventSequenceSidebar from '../../components/admin/EventSequenceSidebar';
import DataTableManager from '../../components/admin/DataTableManager';
import StopEventModal from '../../components/admin/StopEventModal';
import { useAdminData } from '../../hooks/useAdminData';
import { useVotingControl } from '../../hooks/useVotingControl';
import { useEventSequence } from '../../hooks/useEventSequence';
import { useVotingWebSocket } from '../../hooks/useVotingWebSocket';

export default function AdminTools() {
  const location = useLocation();
  const continuingEventFromState = location.state?.continuingEvent;
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
            autoClose: 10000,
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
  const { candidates, rounds, criteria, loading } = useAdminData();
  
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
    }
  };

  const handleStopConfirm = async () => {
    await handleStartStopConfirm();
    setShowStopModal(false);
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
        <>
          {/* Skeleton Header */}
          <div style={{ padding: '20px', borderBottom: '2px solid #e5e7eb' }}>
            <div style={{ 
              height: '80px', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '8px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}></div>
          </div>
          
          {/* Skeleton Control Buttons */}
          <div style={{ padding: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ 
                width: '120px', 
                height: '120px', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '8px',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}></div>
            ))}
          </div>
          
          {/* Skeleton Tabs */}
          <div style={{ padding: '20px', borderBottom: '2px solid #e5e7eb' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ 
                  width: '120px', 
                  height: '40px', 
                  backgroundColor: '#f3f4f6', 
                  borderRadius: '4px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>
              ))}
            </div>
          </div>
          
          {/* Skeleton Table */}
          <div style={{ padding: '20px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ 
                height: '60px', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '4px',
                marginBottom: '10px',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}></div>
            ))}
          </div>
          
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </>
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
          isVotingActive={isVotingActive}
          eventSequence={eventSequence}
          currentSequenceIndex={currentSequenceIndex}
          onStartStop={handleStartStopButtonClick}
          onNext={handleNextCategory}
        />
        
        <hr style={{ width: '75%', margin: '30px auto', borderColor: '#ddd' }} />
        
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
        onStartEvent={handleStartStopConfirm}
        isOpen={showStartStopModal}
        onClose={() => setShowStartStopModal(false)}
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

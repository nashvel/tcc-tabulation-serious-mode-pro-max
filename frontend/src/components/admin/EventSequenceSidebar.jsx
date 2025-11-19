import { useState } from 'react';
import EventSequenceManager from './EventSequenceManager';

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
  isOpen: isOpenProp,
  onClose
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const isOpen = isOpenProp !== undefined ? isOpenProp : false;

  return (
    <>
      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: '0',
          right: isOpen ? '0' : '-320px',
          width: '320px',
          height: '100vh',
          backgroundColor: '#fff',
          boxShadow: isOpen ? '-4px 0 12px rgba(0,0,0,0.1)' : 'none',
          transition: 'right 0.3s ease-in-out',
          zIndex: 1000,
          overflowY: 'auto',
          paddingTop: '180px' // Space for fixed header
        }}
      >
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
        
        {/* Confirm & Start Button */}
        {!isVotingActive && eventSequence.length > 0 && (
          <div style={{ 
            padding: '20px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <button
              onClick={() => setShowConfirmModal(true)}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span className="material-icons" style={{ fontSize: '20px' }}>play_arrow</span>
              Confirm & Start Event
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span className="material-icons" style={{ fontSize: '48px', color: '#10b981' }}>
                check_circle
              </span>
            </div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '12px',
              textAlign: 'center',
              color: '#111827'
            }}>
              Start Event?
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              You have {eventSequence.length} round{eventSequence.length !== 1 ? 's' : ''} in the sequence. Once started, judges can begin scoring.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#fff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  onStartEvent();
                  if (onClose) onClose();
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              >
                Start Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button - Hidden when controlled by START button */}
      {isOpenProp === undefined && (
      <button
        onClick={() => {}}
        style={{
          position: 'fixed',
          top: '50%',
          right: isOpen ? '320px' : '0',
          transform: 'translateY(-50%)',
          width: '40px',
          height: '80px',
          backgroundColor: '#f97316',
          border: 'none',
          borderRadius: isOpen ? '8px 0 0 8px' : '8px 0 0 8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
          transition: 'right 0.3s ease-in-out',
          zIndex: 1001,
          color: '#fff',
          fontSize: '24px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ea580c';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f97316';
        }}
      >
        <span className="material-icons">
          {isOpen ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>
      )}
    </>
  );
}

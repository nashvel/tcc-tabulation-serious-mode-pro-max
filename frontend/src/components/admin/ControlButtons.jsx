import { useState, useEffect } from 'react';
import { votingAPI } from '../../api/services';
import toast from 'react-hot-toast';
import NextRoundModal from './NextRoundModal';
import { Play, Square, Lock, LockOpen, ArrowRight } from 'lucide-react';

export default function ControlButtons({ 
  isVotingActive, 
  eventSequence, 
  currentSequenceIndex,
  onStartStop, 
  onNext 
}) {
  const [isLocked, setIsLocked] = useState(false);
  const [showNextModal, setShowNextModal] = useState(false);
  
  // Load lock state on mount
  useEffect(() => {
    loadLockState();
  }, []);

  // Testing function to mark round as completed
  const handleTestMarkCompleted = async () => {
    if (!isVotingActive || eventSequence.length === 0) {
      toast.error('No active round to mark as completed');
      return;
    }

    const currentRound = eventSequence[currentSequenceIndex];
    
    try {
      // Create a completed round record in database
      const response = await fetch('http://localhost:8000/api/completed-rounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: 1, // You can make this dynamic
          round_id: currentRound.id,
          round_name: currentRound.name,
          completed_at: new Date().toISOString(),
          sequence_index: currentSequenceIndex
        })
      });

      if (response.ok) {
        toast.success(`✅ Round "${currentRound.name}" marked as completed (Testing)`);
      } else {
        toast.error('Failed to mark round as completed');
      }
    } catch (error) {
      console.error('Error marking round as completed:', error);
      toast.error('Error: ' + error.message);
    }
  };
  
  const loadLockState = async () => {
    try {
      const response = await votingAPI.getState({ event_id: 1 });
      if (response.data && response.data.is_locked) {
        setIsLocked(true);
      }
    } catch (error) {
      console.error('Error loading lock state:', error);
    }
  };
  
  const handleLockToggle = async () => {
    try {
      if (isLocked) {
        await votingAPI.unlock({ event_id: 1 });
        setIsLocked(false);
        toast.success('Screen Unlocked! 🔓', { duration: 2000 });
      } else {
        await votingAPI.lock({ event_id: 1 });
        setIsLocked(true);
        toast.success('Screen Locked! 🔒', { duration: 2000 });
      }
    } catch (error) {
      console.error('Error toggling lock:', error);
      toast.error('Failed to toggle lock');
    }
  };
  return (
    <div style={{ textAlign: 'center' }}>
      {/* Control Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
        
        <button
          onClick={() => window.location.href = '/admin/events/3/details'}
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px 20px',
            border: '2px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f5f3ff',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '13px',
            minWidth: '160px',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ede9fe';
            e.currentTarget.style.borderColor = '#ddd';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f3ff';
            e.currentTarget.style.borderColor = '#ddd';
          }}
        >
          <img src="/assets/icon/3281329.png" style={{ height: '75px', marginBottom: '10px' }} alt="" />
          <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>Details</span>
        </button>
        
        <button
          onClick={onStartStop}
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px 20px',
            border: `2px solid ${isVotingActive ? '#dc2626' : '#16a34a'}`,
            borderRadius: '4px',
            backgroundColor: isVotingActive ? '#fee2e2' : '#f0fdf4',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '13px',
            minWidth: '160px',
            transition: 'all 0.3s'
          }}
        >
          <div style={{ 
            marginBottom: '10px',
            color: isVotingActive ? '#dc2626' : '#16a34a'
          }}>
            {isVotingActive ? <Square size={75} fill="currentColor" /> : <Play size={75} fill="currentColor" />}
          </div>
          <span style={{ color: isVotingActive ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>
            {isVotingActive ? 'STOP' : 'START'}
          </span>
        </button>
        
        <button
          onClick={handleLockToggle}
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px 20px',
            border: `2px solid ${isLocked ? '#f59e0b' : '#ddd'}`,
            borderRadius: '4px',
            backgroundColor: isLocked ? '#fef3c7' : '#fff',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '13px',
            minWidth: '160px',
            transition: 'all 0.3s'
          }}
        >
          <div style={{ marginBottom: '10px', color: isLocked ? '#f59e0b' : '#000' }}>
            {isLocked ? <Lock size={75} /> : <LockOpen size={75} />}
          </div>
          <span id="lockText" style={{ color: isLocked ? '#f59e0b' : '#000', fontWeight: isLocked ? 'bold' : 'normal' }}>
            {isLocked ? 'Unlock Screen' : 'Lock Screen'}
          </span>
        </button>
        
        <button
          onClick={() => setShowNextModal(true)}
          disabled={!isVotingActive || eventSequence.length === 0 || currentSequenceIndex >= eventSequence.length - 1}
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px 20px',
            border: '2px solid #3b82f6',
            borderRadius: '4px',
            backgroundColor: (!isVotingActive || eventSequence.length === 0) ? '#e5e7eb' : '#eff6ff',
            cursor: (!isVotingActive || eventSequence.length === 0) ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '13px',
            minWidth: '160px',
            transition: 'all 0.3s',
            opacity: (!isVotingActive || eventSequence.length === 0) ? 0.5 : 1
          }}
        >
          <div style={{ 
            marginBottom: '10px',
            color: (!isVotingActive || eventSequence.length === 0) ? '#9ca3af' : '#3b82f6'
          }}>
            <ArrowRight size={75} />
          </div>
          <span style={{ color: (!isVotingActive || eventSequence.length === 0) ? '#9ca3af' : '#3b82f6', fontWeight: 'bold' }}>
            Next {eventSequence.length > 0 && `(${currentSequenceIndex + 1}/${eventSequence.length})`}
          </span>
        </button>
      </div>

      {/* Next Round Confirmation Modal */}
      <NextRoundModal
        isOpen={showNextModal}
        onClose={() => setShowNextModal(false)}
        onConfirm={async () => {
          await onNext();
          setShowNextModal(false);
        }}
        currentRound={eventSequence[currentSequenceIndex]?.name || 'Unknown'}
        nextRound={eventSequence[currentSequenceIndex + 1]?.name || 'None'}
        currentRoundId={eventSequence[currentSequenceIndex]?.id}
        sequenceIndex={currentSequenceIndex}
      />
    </div>
  );
}

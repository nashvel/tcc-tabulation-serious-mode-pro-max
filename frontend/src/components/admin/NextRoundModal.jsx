import { useState } from 'react';
import toast from 'react-hot-toast';

export default function NextRoundModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentRound,
  nextRound,
  currentRoundId,
  sequenceIndex 
}) {
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Testing function - UI ONLY, does NOT record in database
  const handleTestMarkCompleted = () => {
    // Just show a toast notification for testing UI
    toast.success(`🧪 Test Mode: Round "${currentRound}" would be marked as completed`, {
      duration: 4000,
      style: {
        background: '#f59e0b',
        color: '#fff',
        fontWeight: '600',
      },
    });
    
    console.log('TEST MODE - No database record created:', {
      event_id: 1,
      round_id: currentRoundId,
      round_name: currentRound,
      sequence_index: sequenceIndex,
      completed_at: new Date().toISOString()
    });
  };

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (confirmText.toLowerCase() === 'yes') {
      setIsLoading(true);
      await onConfirm();
      setIsLoading(false);
      setConfirmText('');
      onClose();
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Warning Icon */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span className="material-icons" style={{ 
            fontSize: '64px', 
            color: '#f59e0b'
          }}>
            warning
          </span>
        </div>

        {/* Title */}
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          marginBottom: '16px',
          textAlign: 'center',
          color: '#111827'
        }}>
          Proceed to Next Round?
        </h3>

        {/* Warning Message */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#92400e',
            lineHeight: '1.6',
            margin: 0
          }}>
            <strong>⚠️ Warning:</strong> This will mark the current round as completed and document all scores. This action will create a permanent record in the database.
          </p>
        </div>

        {/* Current and Next Round Info */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
              Current Round:
            </span>
            <span style={{ fontSize: '13px', color: '#111827', fontWeight: '600' }}>
              {currentRound}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '12px',
            backgroundColor: '#ecfdf5',
            borderRadius: '6px',
            border: '1px solid #6ee7b7'
          }}>
            <span style={{ fontSize: '13px', color: '#065f46', fontWeight: '500' }}>
              Next Round:
            </span>
            <span style={{ fontSize: '13px', color: '#065f46', fontWeight: '600' }}>
              {nextRound}
            </span>
          </div>
        </div>

        {/* Confirmation Input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Type "yes" to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type yes here..."
            autoFocus
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && confirmText.toLowerCase() === 'yes') {
                handleConfirm();
              }
            }}
          />
          {confirmText && confirmText.toLowerCase() !== 'yes' && (
            <p style={{ 
              fontSize: '12px', 
              color: '#ef4444', 
              marginTop: '6px',
              marginBottom: 0 
            }}>
              Please type "yes" exactly to proceed
            </p>
          )}
        </div>

        {/* Beta Testing Button */}
        <div style={{ 
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#fef3c7',
          border: '1px dashed #fbbf24',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '600', 
              color: '#92400e',
              textTransform: 'uppercase'
            }}>
               UI Testing Only
            </span>
          </div>
          <button
            onClick={handleTestMarkCompleted}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f59e0b',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              width: '100%',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
          >
            <span className="material-icons" style={{ fontSize: '14px' }}>science</span>
            Test UI (No Database)
          </button>
          <p style={{ 
            fontSize: '10px', 
            color: '#78350f', 
            marginTop: '6px',
            marginBottom: 0 
          }}>
            Shows toast only - no database record
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleClose}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#fff',
              color: '#374151',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isLoading ? 0.5 : 1
            }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#f9fafb')}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#fff')}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmText.toLowerCase() !== 'yes' || isLoading}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: confirmText.toLowerCase() === 'yes' ? '#3b82f6' : '#e5e7eb',
              color: confirmText.toLowerCase() === 'yes' ? '#fff' : '#9ca3af',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: confirmText.toLowerCase() === 'yes' && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (confirmText.toLowerCase() === 'yes' && !isLoading) {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (confirmText.toLowerCase() === 'yes' && !isLoading) {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            {isLoading ? (
              <>
                <span className="material-icons" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>
                  refresh
                </span>
                Processing...
              </>
            ) : (
              'Proceed to Next Round'
            )}
          </button>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

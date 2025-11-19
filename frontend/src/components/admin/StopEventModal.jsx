import { useState } from 'react';

export default function StopEventModal({ 
  isOpen, 
  onClose, 
  onConfirm 
}) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
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
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Stop Icon */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span className="material-icons" style={{ 
            fontSize: '64px', 
            color: '#dc2626'
          }}>
            stop_circle
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
          Stop Event?
        </h3>

        {/* Message */}
        <p style={{ 
          fontSize: '14px', 
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          This will stop the current event and document all scores. Judges will no longer be able to submit scores.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
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
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#b91c1c')}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#dc2626')}
          >
            {isLoading ? (
              <>
                <span className="material-icons" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>
                  refresh
                </span>
                Stopping...
              </>
            ) : (
              'Stop Event'
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

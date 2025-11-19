export default function DeleteConfirmationModal({ isOpen, event, confirmText, onConfirmTextChange, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span className="material-icons" style={{ fontSize: '32px', color: '#ef4444' }}>warning</span>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#333', margin: 0 }}>
              Confirm Deletion
            </h3>
          </div>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            This action cannot be undone. To confirm, please type the event title:
          </p>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#D52818', marginBottom: '16px' }}>
            {event?.title}
          </p>
        </div>

        <input
          type="text"
          value={confirmText}
          onChange={(e) => onConfirmTextChange(e.target.value)}
          placeholder="Type event title here"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '14px',
            border: '2px solid #e5e7eb',
            borderRadius: '6px',
            marginBottom: '24px'
          }}
        />

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f3f4f6',
              color: '#333',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmText !== event?.title}
            style={{
              padding: '10px 20px',
              backgroundColor: confirmText === event?.title ? '#ef4444' : '#fca5a5',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: confirmText === event?.title ? 'pointer' : 'not-allowed'
            }}
          >
            Delete Event
          </button>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';

export default function ContinueEventModal({ isOpen, event, onClose }) {
  const navigate = useNavigate();

  if (!isOpen || !event) return null;

  const handleProceed = () => {
    // Navigate to /admin with event context
    navigate('/admin', { state: { continuingEvent: event } });
  };

  const handleViewSummary = () => {
    // Open summary in new window
    window.open(`/event/${event.id}/summary`, '_blank');
  };

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
        borderRadius: '8px',
        padding: '0',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#fafafa'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#1f2937', 
            margin: '0 0 8px 0',
            letterSpacing: '-0.01em'
          }}>
            Continue Event
          </h3>
          <h4 style={{ 
            fontSize: '16px', 
            fontWeight: '500', 
            color: '#D52818', 
            margin: '0 0 4px 0' 
          }}>
            {event.title}
          </h4>
          <div style={{ 
            fontSize: '13px', 
            color: '#6b7280',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <span>Year {event.year}</span>
            <span>•</span>
            <span style={{ 
              textTransform: 'uppercase', 
              fontWeight: '500',
              fontSize: '11px',
              color: event.status === 'active' ? '#fdba74' : '#6b7280',
              backgroundColor: event.status === 'active' ? '#fff7ed' : '#f3f4f6',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>{event.status}</span>
          </div>
        </div>

        {/* Event Days Summary */}
        <div style={{ padding: '24px 32px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#6b7280', 
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Event Days
            </h4>
          </div>
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '6px', 
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#fafafa' }}>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#6b7280',
                    borderBottom: '1px solid #e5e7eb',
                    width: '60px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Day</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#6b7280',
                    borderBottom: '1px solid #e5e7eb',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Title</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#6b7280',
                    borderBottom: '1px solid #e5e7eb',
                    width: '100px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Count</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'center', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#6b7280',
                    borderBottom: '1px solid #e5e7eb',
                    width: '100px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {event.days && event.days.map((day, index) => (
                  <tr key={day.id} style={{ 
                    borderBottom: index < event.days.length - 1 ? '1px solid #e5e7eb' : 'none'
                  }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: '#fff7ed',
                        color: '#ea580c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {day.day_number}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                        {day.title}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{ 
                        fontSize: '14px', 
                        color: '#1f2937',
                        fontWeight: '600'
                      }}>
                        {day.candidates_count || 0}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: day.is_complete ? '#dcfce7' : '#fef3c7',
                        color: day.is_complete ? '#166534' : '#92400e',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {day.is_complete ? 'Done' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Next Day Info */}
        <div style={{
          padding: '16px 32px',
          backgroundColor: '#fff7ed',
          borderTop: '1px solid #e5e7eb',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
            Adding <strong style={{ color: '#ea580c' }}>Day {event.days ? event.days.length + 1 : 1}</strong> to this event
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ padding: '20px 32px', display: 'flex', gap: '12px', justifyContent: 'flex-end', backgroundColor: '#fafafa' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            style={{
              padding: '10px 24px',
              backgroundColor: '#fdba74',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Proceed to Admin
          </button>
        </div>
      </div>
    </div>
  );
}

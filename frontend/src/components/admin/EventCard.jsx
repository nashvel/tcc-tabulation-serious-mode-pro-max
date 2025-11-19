export default function EventCard({ event, onContinue, onDelete, formatDate }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
            {event.title}
          </h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Year: {event.year}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#999' }}>
            <span className="material-icons" style={{ fontSize: '14px' }}>schedule</span>
            <span>Created: {formatDate(event.created_at)}</span>
          </div>
          {event.status && (
            <div style={{ marginTop: '8px' }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                backgroundColor: event.status === 'active' ? '#dbeafe' : event.status === 'completed' ? '#dcfce7' : '#f3f4f6',
                color: event.status === 'active' ? '#1e40af' : event.status === 'completed' ? '#166534' : '#6b7280'
              }}>
                {event.status}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onContinue(event)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span className="material-icons" style={{ fontSize: '16px' }}>add</span>
            Continue
          </button>
          <button
            onClick={() => onDelete(event)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
        {event.days && event.days.map((day) => (
          <div
            key={day.id}
            style={{
              padding: '12px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '4px' }}>
              Day {day.day_number}
            </div>
            <div style={{ fontSize: '14px', color: '#333' }}>
              {day.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

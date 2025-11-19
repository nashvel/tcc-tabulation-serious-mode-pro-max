export default function EventSequenceManager({
  availableCategories,
  eventSequence,
  currentSequenceIndex,
  onAddToSequence,
  onRemoveFromSequence,
  onMoveUp,
  onMoveDown,
  isVotingActive
}) {
  return (
    <div style={{ height: 'fit-content', padding: '20px' }}>
      <div style={{
        backgroundColor: '#fff',
        border: '2px solid #f97316',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.1)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#f97316',
          marginBottom: '15px',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Event Sequence
        </h3>
        
        {/* Available Categories to Add */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {availableCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => onAddToSequence(category)}
                disabled={eventSequence.find(c => c.id === category.id)}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: eventSequence.find(c => c.id === category.id) ? '#f3f4f6' : '#fff',
                  cursor: eventSequence.find(c => c.id === category.id) ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  opacity: eventSequence.find(c => c.id === category.id) ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!eventSequence.find(c => c.id === category.id)) {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!eventSequence.find(c => c.id === category.id)) {
                    e.currentTarget.style.borderColor = '#ddd';
                    e.currentTarget.style.backgroundColor = '#fff';
                  }
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        <hr style={{ margin: '20px 0', borderColor: '#e5e7eb' }} />
        
        {/* Current Sequence */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#666' }}>
            Sequence Order:
          </h4>
          {eventSequence.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>
              No categories added yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {eventSequence.map((category, index) => (
                <div
                  key={category.id}
                  style={{
                    padding: '12px',
                    border: `2px solid ${index === currentSequenceIndex ? '#10b981' : '#ddd'}`,
                    borderRadius: '4px',
                    backgroundColor: index === currentSequenceIndex ? '#f0fdf4' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{ 
                    fontWeight: 'bold', 
                    fontSize: '16px',
                    color: index === currentSequenceIndex ? '#10b981' : '#666',
                    minWidth: '25px'
                  }}>
                    {index + 1}.
                  </span>
                  <span style={{ 
                    flex: 1, 
                    fontSize: '12px',
                    fontWeight: index === currentSequenceIndex ? '600' : '400',
                    color: index === currentSequenceIndex ? '#10b981' : '#333'
                  }}>
                    {category.name}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {/* Disable move buttons for current active round when voting is active */}
                    <button
                      onClick={() => onMoveUp(index)}
                      disabled={index === 0 || (isVotingActive && index <= currentSequenceIndex)}
                      title={(isVotingActive && index <= currentSequenceIndex) ? "Cannot move active or completed rounds" : ""}
                      style={{
                        padding: '4px',
                        border: 'none',
                        background: 'transparent',
                        cursor: (index === 0 || (isVotingActive && index <= currentSequenceIndex)) ? 'not-allowed' : 'pointer',
                        opacity: (index === 0 || (isVotingActive && index <= currentSequenceIndex)) ? 0.3 : 1
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: '18px', color: '#666' }}>
                        arrow_upward
                      </span>
                    </button>
                    <button
                      onClick={() => onMoveDown(index)}
                      disabled={index === eventSequence.length - 1 || (isVotingActive && index <= currentSequenceIndex)}
                      title={(isVotingActive && index <= currentSequenceIndex) ? "Cannot move active or completed rounds" : ""}
                      style={{
                        padding: '4px',
                        border: 'none',
                        background: 'transparent',
                        cursor: (index === eventSequence.length - 1 || (isVotingActive && index <= currentSequenceIndex)) ? 'not-allowed' : 'pointer',
                        opacity: (index === eventSequence.length - 1 || (isVotingActive && index <= currentSequenceIndex)) ? 0.3 : 1
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: '18px', color: '#666' }}>
                        arrow_downward
                      </span>
                    </button>
                    {/* Disable remove button for current active round when voting is active */}
                    <button
                      onClick={() => onRemoveFromSequence(category.id)}
                      disabled={isVotingActive && index <= currentSequenceIndex}
                      title={(isVotingActive && index <= currentSequenceIndex) ? "Cannot remove active or completed rounds" : ""}
                      style={{
                        padding: '4px',
                        border: 'none',
                        background: 'transparent',
                        cursor: (isVotingActive && index <= currentSequenceIndex) ? 'not-allowed' : 'pointer',
                        opacity: (isVotingActive && index <= currentSequenceIndex) ? 0.3 : 1
                      }}
                    >
                      <span className="material-icons" style={{ fontSize: '18px', color: '#ef4444' }}>
                        close
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import AdminHeaderButtons from './AdminHeaderButtons';

export default function FixedHeader({ 
  onEditClick, 
  activeCategory, 
  continuingEvent,
  judges = []
}) {
  const [eventData, setEventData] = React.useState(null);
  const [nextCategory, setNextCategory] = React.useState(null);
  
  React.useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/events');
        const events = await response.json();
        const latestEvent = events.sort((a, b) => b.id - a.id)[0];
        setEventData(latestEvent);
        
        // Fetch event sequence to get next category
        if (latestEvent?.id) {
          const sequenceResponse = await fetch(`http://localhost:8000/api/event-sequence?event_id=${latestEvent.id}`);
          const sequences = await sequenceResponse.json();
          console.log('Event sequences:', sequences); // Debug
          if (sequences && sequences.length > 0) {
            // Get the first category in sequence
            const categoryName = sequences[0].round?.name || sequences[0].round?.title || 'Unknown';
            setNextCategory(categoryName);
          } else {
            // No sequence set up yet
            setNextCategory('Not Set');
          }
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
        setNextCategory('Error');
      }
    };
    
    fetchEventData();
  }, []);
  
  const scrollToJudge = (judgeIndex) => {
    const judgeElements = document.querySelectorAll('[data-judge-section]');
    if (judgeElements[judgeIndex]) {
      judgeElements[judgeIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Blink animation
      const element = judgeElements[judgeIndex];
      element.style.transition = 'background-color 0.3s';
      const originalBg = element.style.backgroundColor;
      
      let blinkCount = 0;
      const blinkInterval = setInterval(() => {
        if (blinkCount % 2 === 0) {
          element.style.backgroundColor = '#fef3c7';
        } else {
          element.style.backgroundColor = originalBg || 'transparent';
        }
        blinkCount++;
        
        if (blinkCount >= 6) {
          clearInterval(blinkInterval);
          element.style.backgroundColor = originalBg || 'transparent';
        }
      }, 300);
    }
  };
  return (
    <>
      {/* Fixed Header Container */}
      <div style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        width: '100vw',
        zIndex: '9999',
        margin: '0'
      }}>
        {/* Orange Header Bar */}
        <div style={{
          backgroundColor: '#f97316',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <AdminHeaderButtons 
            onEditClick={onEditClick} 
            activeCategory={activeCategory}
          />
        </div>

        {/* Logo Bar */}
        <div style={{
          backgroundColor: '#fff',
          padding: '15px 20px',
          textAlign: 'center',
          borderBottom: '3px solid #f97316',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          {/* Logos */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', flexWrap: 'wrap', marginBottom: '15px' }}>
            <img src="/assets/logo-3.png" style={{ height: '70px' }} alt="Logo 3" />
            <img src="/assets/tcc_seal.png" style={{ height: '70px' }} alt="TCC Seal" />
            <img src="/assets/it.png" style={{ height: '70px' }} alt="IT Logo" />
            <img src="/assets/bsit.png" style={{ height: '70px' }} alt="BSIT Logo" />
          </div>
          
          {/* Event Information, Judge Quick Actions & Next Category */}
          {judges.length > 0 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '20px',
              paddingTop: '10px',
              borderTop: '1px solid #e5e7eb',
              flexWrap: 'wrap'
            }}>
              {/* Event Info - Left */}
              {eventData && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  flex: '1',
                  minWidth: '200px'
                }}>
                  <span style={{ color: '#f97316' }}>
                     {eventData.title || eventData.name || 'Event'}
                  </span>
                  <span style={{ color: '#9ca3af' }}>•</span>
                  <span style={{ color: '#6b7280' }}>
                    {eventData.days?.[0]?.day_number ? `Day ${eventData.days[0].day_number}` : 'Day 1'}
                  </span>
                  <span style={{ color: '#9ca3af' }}>•</span>
                  <span style={{ color: '#6b7280' }}>
                    {eventData.days?.[0]?.title || 'Day Title'}
                  </span>
                </div>
              )}
              
              {/* Judge Quick Jump - Center */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px', 
                flexWrap: 'wrap',
                flex: '2',
                minWidth: '300px'
              }}>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 'bold', 
                  color: '#f97316',
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: '5px'
                }}>
                  QUICK JUMP:
                </span>
              {judges.map((judge, index) => (
                <button
                  key={judge.id}
                  onClick={() => scrollToJudge(index)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#fff',
                    border: '2px solid #f97316',
                    borderRadius: '6px',
                    color: '#f97316',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f97316';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.color = '#f97316';
                  }}
                >
                  {judge.name}
                </button>
              ))}
              </div>
              
              {/* Next Category - Right */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                flex: '1',
                minWidth: '150px'
              }}>
                <span style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase' }}>
                  Next:
                </span>
                <span style={{ 
                  color: nextCategory === 'Not Set' ? '#9ca3af' : '#f97316',
                  backgroundColor: nextCategory === 'Not Set' ? '#f3f4f6' : '#fff7ed',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: nextCategory === 'Not Set' ? '1px solid #d1d5db' : '1px solid #fed7aa',
                  fontStyle: nextCategory === 'Not Set' ? 'italic' : 'normal'
                }}>
                  {nextCategory || 'Loading...'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spacer to prevent content from going under fixed header */}
      <div style={{ height: '190px' }} />
    </>
  );
}

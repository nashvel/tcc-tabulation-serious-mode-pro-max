import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EventSummary() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/events/${eventId}`);
      const data = await response.json();
      setEvent(data);
      // Set first day as active by default
      if (data.days && data.days.length > 0) {
        setActiveDay(data.days[0].id);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading event summary...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Event not found</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Orange Header */}
      <div style={{
        backgroundColor: '#ff6600',
        color: '#fff',
        padding: '12px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-icons" style={{ fontSize: '20px' }}>description</span>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Tabulation System</span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ fontSize: '13px', cursor: 'pointer', opacity: 0.9 }}>Edit</span>
            <span style={{ fontSize: '13px', cursor: 'pointer', fontWeight: '600', borderBottom: '2px solid #fff', paddingBottom: '2px' }}>Documentation</span>
            <span style={{ fontSize: '13px', cursor: 'pointer', opacity: 0.9 }}>Certificates</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => window.close()}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span className="material-icons" style={{ fontSize: '18px' }}>close</span>
            Close
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '40px' }}>
        {/* Page Title */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="material-icons" style={{ fontSize: '20px', color: '#ff6600' }}>description</span>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#333', margin: 0 }}>
              Pageant Documentation
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
            Historical records of all the past pageant contests and proven
          </p>
        </div>

        {/* Year Tabs */}
        <div style={{ 
          borderBottom: '2px solid #ff6600', 
          marginBottom: '30px',
          display: 'flex',
          gap: '30px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#ff6600',
            paddingBottom: '10px',
            borderBottom: '3px solid #ff6600',
            marginBottom: '-2px'
          }}>
            {event.year}
          </div>
        </div>

        {/* Event Title and Date */}
        <div style={{ 
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
            {event.title}
          </h2>
          {event.start_date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666' }}>
              <span className="material-icons" style={{ fontSize: '16px' }}>calendar_today</span>
              <span>
                Date: {new Date(event.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          )}
          {event.overall_winners && event.overall_winners.length > 0 && (
            <div style={{ 
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span className="material-icons" style={{ fontSize: '18px', color: '#ff6600' }}>emoji_events</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#ff6600' }}>
                Overall Winner
              </span>
              <span style={{ fontSize: '14px', color: '#333', marginLeft: '8px' }}>
                {event.overall_winners[0].winner_name}
              </span>
              <span style={{ fontSize: '13px', color: '#666' }}>
                {event.overall_winners[0].college} • {event.overall_winners[0].year_level}
              </span>
            </div>
          )}
        </div>

        {/* Day Tabs */}
        <div style={{ 
          borderBottom: '2px solid #ff6600', 
          marginBottom: '30px',
          display: 'flex',
          gap: '0px'
        }}>
          {event.days && event.days.map((day) => (
            <div
              key={day.id}
              onClick={() => setActiveDay(day.id)}
              style={{
                fontSize: '13px',
                fontWeight: activeDay === day.id ? '600' : '400',
                color: activeDay === day.id ? '#ff6600' : '#666',
                paddingBottom: '10px',
                paddingLeft: '20px',
                paddingRight: '20px',
                borderBottom: activeDay === day.id ? '3px solid #ff6600' : 'none',
                marginBottom: '-2px',
                cursor: 'pointer'
              }}
            >
              Day {day.day_number}
            </div>
          ))}
        </div>

        {/* Active Day Content */}
        {event.days && event.days.filter(day => day.id === activeDay).map((day) => (
          <div key={day.id}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '16px', backgroundColor: '#f5f5f5', padding: '10px 16px', borderRadius: '4px' }}>
              {day.title}
            </h3>

              {/* Results Table */}
              {day.results && day.results.length > 0 ? (
                <div style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '4px', 
                  overflow: 'hidden',
                  backgroundColor: '#fff'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9fafb' }}>
                        <th style={{ 
                          padding: '10px 16px', 
                          textAlign: 'left', 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          color: '#666',
                          borderBottom: '1px solid #e5e7eb',
                          width: '60px'
                        }}>Rank</th>
                        <th style={{ 
                          padding: '10px 16px', 
                          textAlign: 'left', 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          color: '#666',
                          borderBottom: '1px solid #e5e7eb'
                        }}>Name</th>
                        <th style={{ 
                          padding: '10px 16px', 
                          textAlign: 'left', 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          color: '#666',
                          borderBottom: '1px solid #e5e7eb',
                          width: '120px'
                        }}>College</th>
                        <th style={{ 
                          padding: '10px 16px', 
                          textAlign: 'left', 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          color: '#666',
                          borderBottom: '1px solid #e5e7eb',
                          width: '100px'
                        }}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {day.results.map((result, index) => (
                        <tr key={result.id} style={{ 
                          borderBottom: index < day.results.length - 1 ? '1px solid #e5e7eb' : 'none',
                          backgroundColor: result.rank === 1 ? '#fff4e6' : '#fff'
                        }}>
                          <td style={{ padding: '14px 16px', width: '80px' }}>
                            {result.rank === 1 ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="material-icons" style={{ fontSize: '18px', color: '#ff6600' }}>
                                  emoji_events
                                </span>
                                <span style={{ fontSize: '13px', color: '#ff6600', fontWeight: '600' }}>1st</span>
                              </div>
                            ) : result.rank === 2 ? (
                              <span style={{ fontSize: '13px', color: '#666' }}>2nd</span>
                            ) : result.rank === 3 ? (
                              <span style={{ fontSize: '13px', color: '#666' }}>3rd</span>
                            ) : (
                              <span style={{ fontSize: '13px', color: '#666' }}>{result.rank}th</span>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontSize: '13px', color: '#333' }}>
                              {result.participant_name}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', width: '120px' }}>
                            <span style={{ 
                              fontSize: '13px', 
                              color: '#666'
                            }}>
                              {result.college}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', width: '100px', textAlign: 'right' }}>
                            <span style={{ 
                              fontSize: '13px', 
                              color: '#333'
                            }}>
                              {result.score}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#999',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px'
                }}>
                  No results recorded for this day
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}

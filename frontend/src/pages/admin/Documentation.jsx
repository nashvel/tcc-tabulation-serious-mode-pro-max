import { useState, useEffect } from 'react';
import AdminHeaderButtons from '../../components/admin/AdminHeaderButtons';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function Documentation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchArchivedEvents();
  }, []);

  const fetchArchivedEvents = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/events?status=archived');
      const data = await response.json();
      setArchivedEvents(data);
      if (data.length > 0) {
        setSelectedYear(data[0].year);
        setSelectedEvent(data[0]);
      }
    } catch (error) {
      console.error('Error fetching archived events:', error);
    }
  };

  const years = [...new Set(archivedEvents.map(e => e.year))].sort((a, b) => b - a);
  
  const selectYear = (year) => {
    setSelectedYear(year);
    const event = archivedEvents.find(e => e.year === year);
    setSelectedEvent(event);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Admin Sidebar */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Red Header Bar - Full Width with Buttons */}
      <div style={{
        backgroundColor: '#D52818',
        borderBottom: '5px solid #97180D',
        padding: '8px 20px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <AdminHeaderButtons onEditClick={() => setIsSidebarOpen(true)} />
      </div>
      
      {/* Logos Row - 6 logos matching old system */}
      <div style={{ 
        backgroundColor: '#fff',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        borderBottom: '1px solid #ddd'
      }}>
        <img src="/assets/logo.png" alt="Logo 1" style={{ height: '60px' }} />
        <img src="/assets/tcc_seal.png" alt="TCC Seal" style={{ height: '60px' }} />
        <img src="/assets/logo-3.png" alt="Logo 3" style={{ height: '60px' }} />
        <img src="/assets/Mr. & Ms. TCC Logo 2024 (Gold).png" alt="TCC Logo" style={{ height: '60px' }} />
        <img src="/assets/lnk-logo.png" alt="LNK Logo" style={{ height: '60px' }} />
        <img src="/assets/bsit.png" alt="BSIT" style={{ height: '60px' }} />
      </div>
      
      <div style={{ padding: '40px 60px', maxWidth: '100%', margin: '0 auto' }}>
        {/* Header with icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <span className="material-icons" style={{ fontSize: '28px', color: '#ff6b35' }}>description</span>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#333' }}>
            Pageant Documentation
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px', marginLeft: '40px' }}>
          Historical records of all the TCC pageant contests and winners
        </p>
        
        {/* Year Tabs */}
        {years.length > 0 ? (
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            borderBottom: '2px solid #ff6b35',
            marginBottom: '30px'
          }}>
            {years.map(year => (
              <button 
                key={year}
                onClick={() => selectYear(year)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: selectedYear === year ? '#ff6b35' : 'transparent',
                  color: selectedYear === year ? '#fff' : '#666',
                  border: 'none',
                  borderRadius: selectedYear === year ? '4px 4px 0 0' : '0',
                  cursor: 'pointer',
                  fontWeight: selectedYear === year ? '600' : 'normal',
                  fontSize: '14px'
                }}
              >
                {year}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No archived events yet. Complete an event to see it here.</p>
          </div>
        )}

        {/* Event Info */}
        {selectedEvent && (
          <>
            <div style={{ 
              backgroundColor: '#fff5f0',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #ffe0d0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0', color: '#333' }}>
                    {selectedEvent.title}
                  </h2>
                  {selectedEvent.start_date && selectedEvent.end_date && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '13px' }}>
                      <span className="material-icons" style={{ fontSize: '16px' }}>event</span>
                      <span>{new Date(selectedEvent.start_date).toLocaleDateString()} - {new Date(selectedEvent.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                {selectedEvent.overall_winners && selectedEvent.overall_winners.length > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b35' }}>
                      <span className="material-icons" style={{ fontSize: '20px' }}>emoji_events</span>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{selectedEvent.overall_winners[0].title}</span>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginTop: '4px' }}>
                      {selectedEvent.overall_winners[0].winner_name}
                    </div>
                    {selectedEvent.overall_winners[0].college && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {selectedEvent.overall_winners[0].college}
                        {selectedEvent.overall_winners[0].year_level && ` - ${selectedEvent.overall_winners[0].year_level}`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Results by Category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {selectedEvent.results && selectedEvent.results.length > 0 ? (
                // Group results by category
                [...new Set(selectedEvent.results.map(r => r.category))].map(category => {
                  const categoryResults = selectedEvent.results
                    .filter(r => r.category === category)
                    .sort((a, b) => a.rank - b.rank);
                  
                  return (
                    <div key={category}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                        {category}
                      </h3>
                      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>Rank</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>Name</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>College</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categoryResults.map((result, idx) => (
                            <tr key={result.id} style={{ borderBottom: idx < categoryResults.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                              <td style={{ padding: '12px', fontSize: '14px' }}>
                                {result.rank === 1 ? (
                                  <span style={{ backgroundColor: '#ff6b35', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                                    1st
                                  </span>
                                ) : (
                                  <span style={{ color: '#666' }}>{result.rank === 2 ? '2nd' : result.rank === 3 ? '3rd' : `${result.rank}th`}</span>
                                )}
                              </td>
                              <td style={{ padding: '12px', fontSize: '14px', color: '#333', fontWeight: result.rank === 1 ? '600' : 'normal' }}>
                                {result.participant_name}
                              </td>
                              <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                                {result.college || 'N/A'}
                              </td>
                              <td style={{ padding: '12px', fontSize: '14px', color: result.rank === 1 ? '#333' : '#666', fontWeight: result.rank === 1 ? '600' : 'normal' }}>
                                {result.score || 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <p>No results recorded for this event.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { getApiBase } from '../../config/api';
import { showSuccess, showError } from '../../utils/alerts';
import GradientBackground from '../../components/common/GradientBackground';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';

export default function Setup() {
  const [events, setEvents] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ show: false, event: null, confirmText: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }

    fetchEvents();
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/api/events`);

      if (!response.ok) {
        showError(`API Error: ${response.status} ${response.statusText}`);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        showError('Backend returned invalid response (not JSON)');
        return;
      }

      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      showError('Failed to fetch events - Check backend is running');
    }
  };

  const openDeleteModal = (event) => {
    setDeleteModal({ show: true, event, confirmText: '' });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, event: null, confirmText: '' });
  };

  const confirmDelete = async () => {
    if (deleteModal.confirmText !== deleteModal.event.title) {
      showError('Event title does not match');
      return;
    }

    try {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/api/events/${deleteModal.event.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        showSuccess('Event deleted successfully');
        closeDeleteModal();
        fetchEvents();
      } else {
        showError('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showError('Error deleting event');
    }
  };

  const continueEvent = (event) => {
    localStorage.setItem('continuingEvent', JSON.stringify(event));
    navigate(`/admin?event_title=${encodeURIComponent(event.title)}`, { state: { continuingEvent: event } });
  };

  return (
    <GradientBackground>

      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px'
      }}>
        <div style={{ width: '100%', maxWidth: '1152px' }}>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <img
              src="/assets/main-logo.png"
              alt="Logo"
              style={{
                margin: '0 auto',
                height: '80px',
                width: 'auto',
                display: 'block'
              }}
            />
            <h2 style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '30px',
              fontWeight: '700',
              letterSpacing: '-0.025em',
              color: '#111827'
            }}>
              Event Setup
            </h2>
            <p style={{
              marginTop: '8px',
              textAlign: 'center',
              fontSize: '14px',
              color: '#6B7280'
            }}>
              Create a new event or continue with an existing one.
            </p>
          </div>

          {/* Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            alignItems: 'start'
          }}>

            {/* Create New Event Card */}
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                padding: '32px',
                textAlign: 'center',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                transition: 'all 0.3s',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2), 0 0 30px rgba(255, 255, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.3)';
                }}
              >
                <div style={{
                  marginBottom: '16px',
                  display: 'flex',
                  height: '64px',
                  width: '64px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#3B82F6'
                }}>
                  <svg style={{ height: '32px', width: '32px' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  Create New Event
                </h3>
                <p style={{
                  marginTop: '4px',
                  marginBottom: '24px',
                  fontSize: '14px',
                  color: '#6B7280'
                }}>
                  Set up a new competition from scratch.
                </p>
                <button
                  onClick={() => navigate('/create-event')}
                  style={{
                    display: 'inline-flex',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    backgroundColor: '#3B82F6',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2563EB'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3B82F6'}
                >
                  Create Event
                </button>
              </div>
            </div>

            {/* Select Existing Event Card */}
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              padding: '32px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)'
            }}>
              <h3 style={{
                marginBottom: '16px',
                fontSize: '18px',
                fontWeight: '600',
                color: '#111827'
              }}>
                Select Existing Event
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {events.length > 0 ? events.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      padding: '16px',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px'
                    }}>
                      <div>
                        <h4 style={{
                          fontWeight: '600',
                          color: '#111827'
                        }}>
                          {event.title}
                        </h4>
                        <p style={{
                          fontSize: '14px',
                          color: '#6B7280'
                        }}>
                          {event.year}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => continueEvent(event)}
                          style={{
                            borderRadius: '6px',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#3B82F6',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'}
                        >
                          Continue
                        </button>
                        <button
                          onClick={() => openDeleteModal(event)}
                          style={{
                            borderRadius: '6px',
                            padding: '6px',
                            color: '#EF4444',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#FEE2E2'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <svg style={{ height: '16px', width: '16px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#9CA3AF'
                  }}>
                    <p style={{ fontSize: '14px', margin: 0 }}>No events created yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p style={{
            paddingTop: '16px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#6B7280'
          }}>
            © Tabulation System Nacht. All rights reserved.
          </p>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.show}
        event={deleteModal.event}
        confirmText={deleteModal.confirmText}
        onConfirmTextChange={(text) => setDeleteModal({ ...deleteModal, confirmText: text })}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />
    </GradientBackground>
  );
}

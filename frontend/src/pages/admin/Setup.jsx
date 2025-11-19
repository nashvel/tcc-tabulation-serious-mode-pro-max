import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import AdminHeaderButtons from '../../components/admin/AdminHeaderButtons';
import AdminSidebar from '../../components/admin/AdminSidebar';
import EventForm from '../../components/admin/EventForm';
import EventCard from '../../components/admin/EventCard';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';

export default function Setup() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ show: false, event: null, confirmText: '' });
  const [editingEvent, setEditingEvent] = useState(null);
  const navigate = useNavigate();

  // Form state
  const [eventForm, setEventForm] = useState({
    title: '',
    year: new Date().getFullYear(),
    days: [{ day_number: 1, title: '' }]
  });

  useEffect(() => {
    // Check admin auth
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    
    fetchEvents();
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(eventForm)
      });

      if (response.ok) {
        toast.success('Event created successfully! 🎉');
        setEventForm({
          title: '',
          year: new Date().getFullYear(),
          days: [{ day_number: 1, title: '' }]
        });
        setEditingEvent(null);
        fetchEvents();
      } else {
        toast.error('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Error creating event');
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
      toast.error('Event title does not match');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/events/${deleteModal.event.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        toast.success('Event deleted successfully');
        closeDeleteModal();
        fetchEvents();
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Error deleting event');
    }
  };

  const continueEvent = (event) => {
    // Store in localStorage for persistence across refreshes
    localStorage.setItem('continuingEvent', JSON.stringify(event));
    
    // Navigate immediately - toast will show on AdminTools page
    navigate('/admin', { state: { continuingEvent: event } });
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* React Hot Toast */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Header - Fixed */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 32px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1000,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{ color: '#1f2937', fontSize: '18px', fontWeight: '600', margin: 0, letterSpacing: '-0.01em' }}>
          Event Setup
        </h1>
        <AdminHeaderButtons onEditClick={() => setIsSidebarOpen(true)} />
      </div>

      {/* Logos - Fixed */}
      <div style={{ 
        position: 'fixed',
        top: '57px',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 999
      }}>
        <img src="/assets/logo.png" alt="Logo 1" style={{ height: '50px', opacity: 0.9 }} />
        <img src="/assets/tcc_seal.png" alt="TCC Seal" style={{ height: '50px', opacity: 0.9 }} />
        <img src="/assets/logo-3.png" alt="Logo 3" style={{ height: '50px', opacity: 0.9 }} />
        <img src="/assets/Mr. & Ms. TCC Logo 2024 (Gold).png" alt="TCC Logo" style={{ height: '50px', opacity: 0.9 }} />
        <img src="/assets/lnk-logo.png" alt="LNK Logo" style={{ height: '50px', opacity: 0.9 }} />
        <img src="/assets/bsit.png" alt="BSIT" style={{ height: '50px', opacity: 0.9 }} />
      </div>

      {/* Content */}
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', paddingTop: '150px' }}>
        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* LEFT: Create Event Button - Fixed Position */}
          <div style={{ position: 'sticky', top: '150px' }}>
            <button
              onClick={() => navigate('/create-event')}
              style={{
                width: '100%',
                padding: '48px 32px',
                backgroundColor: '#fff',
                color: '#1f2937',
                border: '2px dashed #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#fdba74';
                e.target.style.backgroundColor = '#fff7ed';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#fff';
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#fdba74',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: '300'
              }}>+</div>
              <span style={{ fontSize: '16px', fontWeight: '600' }}>Create New Event</span>
              <p style={{ fontSize: '13px', fontWeight: 'normal', color: '#6b7280', margin: 0, textAlign: 'center' }}>
                Professional customizable tabulation system
              </p>
            </button>
          </div>

          {/* RIGHT: Existing Events */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#6b7280', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Existing Events
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onContinue={continueEvent}
                  onDelete={openDeleteModal}
                  formatDate={formatDate}
                />
              ))}

              {events.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#666',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{ fontSize: '16px', marginBottom: '8px' }}>No events created yet</p>
                  <p style={{ fontSize: '14px' }}>Create your first event to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.show}
          event={deleteModal.event}
          confirmText={deleteModal.confirmText}
          onConfirmTextChange={(text) => setDeleteModal({ ...deleteModal, confirmText: text })}
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
        />

      </div>
    </div>
  );
}
